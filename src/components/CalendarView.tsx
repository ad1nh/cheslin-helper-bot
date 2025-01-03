import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LeadDetailsDialog from "./LeadDetailsDialog";
import PropertyDetailsDialog from "./PropertyDetailsDialog";
import { format, parseISO, isSameDay, addWeeks, subWeeks } from "date-fns";
import { LeadStage, getLeadStageColor, LEAD_STAGE_COLORS } from '@/types/lead';
import WeekView from "./WeekView";

interface Appointment {
  id: string;
  title: string;
  date: Date;
  client: string;
  property: string;
  time: string;
}

interface Lead {
  id: string;
  name: string;
  status: LeadStage;
  phone: string;
  email?: string;
  lastContact: string;
  propertyInterest: string;
}

interface CampaignCall {
  id: string;
  contact_name: string;
  phone_number: string;
  email: string | null;
  lead_stage: string | null;
  created_at: string;
  campaigns?: {
    property_details: string;
  };
}

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const { toast } = useToast();

  // Add date validation helper
  const isValidDate = (date: any): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Fetch appointments from campaign_calls
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      console.log("Fetching appointments...");
      const { data: calls, error } = await supabase
        .from("campaign_calls")
        .select(`
          *,
          campaigns (
            property_details,
            campaign_type
          )
        `)
        .not('appointment_date', 'is', null);

      if (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }

      console.log("Raw calls from DB:", calls);

      return calls
        .filter(call => call.appointment_date)
        .map((call) => {
          try {
            console.log("Processing appointment:", {
              id: call.id,
              rawDate: call.appointment_date,
              parsedDate: new Date(call.appointment_date),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
            
            const date = new Date(call.appointment_date);
            
            if (isNaN(date.getTime())) {
              console.warn("Invalid date:", call.appointment_date);
              return null;
            }

            const appointment = {
              id: call.id,
              title: "Property Viewing",
              date: date,
              client: call.contact_name,
              property: call.campaigns?.property_details || "Property details not available",
              time: format(date, 'h:mm a'),
              leadStatus: call.lead_stage || "Cold"
            };

            console.log("Processed appointment:", appointment);
            return appointment;
          } catch (error) {
            console.error("Error processing appointment:", error);
            return null;
          }
        })
        .filter(Boolean);
    }
  });

  const handleGoogleSync = () => {
    toast({
      title: "Google Calendar",
      description: "Please set up Google Calendar integration in project settings",
    });
  };

  const appointmentsForDate = appointments.filter((apt) => {
    const matches = isSameDay(apt.date, selectedDate);
    console.log(`Day view filtering - Appointment ${apt.id}:`, {
      client: apt.client,
      appointmentDate: format(apt.date, 'yyyy-MM-dd HH:mm'),
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      matches
    });
    return matches;
  });

  console.log(`Day view found ${appointmentsForDate.length} appointments`);

  const handleClientClick = async (clientId: string) => {
    const { data: clientData, error } = await supabase
      .from('campaign_calls')
      .select(`
        id,
        contact_name,
        phone_number,
        email,
        lead_stage,
        created_at,
        campaigns (
          property_details
        )
      `)
      .eq('id', clientId)
      .single<CampaignCall>();

    if (error || !clientData) {
      console.error('Error fetching client details:', error);
      return;
    }

    const transformedClient = {
      id: clientData.id,
      name: clientData.contact_name,
      status: (clientData.lead_stage?.toLowerCase() || 'warm').replace(/^\w/, c => c.toUpperCase()) as LeadStage,
      phone: clientData.phone_number || '-',
      email: clientData.email || '-',
      lastContact: format(new Date(clientData.created_at), 'yyyy-MM-dd, HH:mm'),
      propertyInterest: clientData.campaigns?.property_details || 'Not specified'
    };
    
    setSelectedClient(transformedClient);
  };

  const navigateWeek = (direction: 'forward' | 'backward') => {
    setSelectedDate(current => {
      if (!isValidDate(current)) {
        return new Date(); // Fallback to current date if invalid
      }
      return direction === 'forward' ? addWeeks(current, 1) : subWeeks(current, 1);
    });
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    // If the same date is selected again, do nothing
    if (date && selectedDate && isSameDay(date, selectedDate)) {
      return;
    }
    
    // Otherwise update the date if valid
    if (date && isValidDate(date)) {
      setSelectedDate(date);
    }
  };

  const handleDateSelect = (date: Date) => {
    if (date && isValidDate(date)) {
      setSelectedDate(date);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Calendar</h2>
          <p className="text-sm text-muted-foreground">Upcoming appointments and viewings</p>
        </div>
        <div className="space-x-2 flex items-center">
          <Button 
            variant={viewMode === 'day' ? 'default' : 'outline'}
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
          <Button 
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          {viewMode === 'week' && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek('backward')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek('forward')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {viewMode === 'week' ? (
        <WeekView 
          appointments={appointments} 
          selectedDate={isValidDate(selectedDate) ? selectedDate : new Date()}
          onSelectClient={handleClientClick}
          onSelectProperty={setSelectedProperty}
          onDateChange={handleDateSelect}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              className="rounded-md border"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">
              Appointments for {selectedDate ? format(selectedDate, 'MMMM do, yyyy') : 'today'}
            </h3>
            <div className="space-y-4">
              {appointmentsForDate.map((apt) => (
                <Card key={apt.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 
                        className="font-medium cursor-pointer hover:text-primary"
                        onClick={() => handleClientClick(apt.id)}
                      >
                        {apt.client}
                      </h4>
                      <p 
                        className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
                        onClick={() => setSelectedProperty({
                          id: apt.id,
                          address: apt.property,
                          price: 500000,
                          type: "House",
                          bedrooms: 3,
                          bathrooms: 2,
                          status: "available",
                          sellerId: 1,
                          interestedBuyers: [1, 2],
                        })}
                      >
                        Property: {apt.property}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {apt.time}
                    </p>
                  </div>
                </Card>
              ))}
              {appointmentsForDate.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No appointments scheduled for this date
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <LeadDetailsDialog
          open={!!selectedClient}
          onOpenChange={(open) => !open && setSelectedClient(null)}
          lead={selectedClient}
        />
      )}

      {selectedProperty && (
        <PropertyDetailsDialog
          open={!!selectedProperty}
          onOpenChange={(open) => !open && setSelectedProperty(null)}
          property={selectedProperty}
          seller={{
            id: "1",
            name: "John Doe",
            phone: "+1 (555) 123-4567",
          }}
        />
      )}
    </Card>
  );
};

export default CalendarView;