import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LeadDetailsDialog from "./LeadDetailsDialog";
import PropertyDetailsDialog from "./PropertyDetailsDialog";
import { format, parseISO, isSameDay } from "date-fns";
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
  lastContact: string;
  propertyInterest: string;
}

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const { toast } = useToast();

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
        .not('appointment_date', 'is', null)
        .neq('appointment_date', '');

      if (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }

      console.log("Raw appointments data:", calls);

      // Transform campaign_calls into appointments
      const transformedAppointments = calls.map((call) => {
        try {
          if (!call.appointment_date) {
            console.log("No appointment date for call:", call.id);
            return null;
          }

          // Parse the appointment_date string into a Date object
          const appointmentDate = parseISO(call.appointment_date);
          // Convert times ending in "PM" to 24-hour format
          if (call.appointment_date.includes('PM')) {
            appointmentDate.setHours(appointmentDate.getHours() + 12);
          }
          console.log("Parsed appointment date:", appointmentDate, "from:", call.appointment_date);
          
          if (isNaN(appointmentDate.getTime())) {
            console.error("Invalid date:", call.appointment_date);
            return null;
          }

          return {
            id: call.id,
            title: "Property Viewing",
            date: appointmentDate,
            client: call.contact_name,
            property: call.campaigns?.property_details || "Property details not available",
            time: format(appointmentDate, 'h:mm a')
          };
        } catch (error) {
          console.error("Error processing appointment:", error, "for call:", call);
          return null;
        }
      }).filter(Boolean); // Remove null entries

      console.log("All transformed appointments:", transformedAppointments.map(apt => ({
        id: apt.id,
        client: apt.client,
        date: format(apt.date, 'yyyy-MM-dd HH:mm'),
        property: apt.property
      })));

      return transformedAppointments;
    },
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

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Calendar</h2>
          <p className="text-sm text-muted-foreground">Upcoming appointments and viewings</p>
        </div>
        <div className="space-x-2">
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
        </div>
      </div>

      {viewMode === 'week' ? (
        <WeekView 
          appointments={appointments} 
          selectedDate={selectedDate}
          onSelectClient={setSelectedClient}
          onSelectProperty={setSelectedProperty}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
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
                        onClick={() => setSelectedClient({
                          id: apt.id,
                          name: apt.client,
                          status: "Warm" as LeadStage,
                          phone: "(555) 123-4567",
                          lastContact: format(apt.date, 'yyyy-MM-dd'),
                          propertyInterest: apt.property,
                        })}
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
            id: 1,
            name: "John Doe",
            phone: "+1 (555) 123-4567",
          }}
        />
      )}
    </Card>
  );
};

export default CalendarView;