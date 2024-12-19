import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon } from "lucide-react";
import LeadDetailsDialog from "./LeadDetailsDialog";
import PropertyDetailsDialog from "./PropertyDetailsDialog";

interface Appointment {
  id: string;
  title: string;
  date: Date;
  client: string;
  property: string;
}

const CalendarView = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      title: "Property Viewing",
      date: new Date(),
      client: "John Smith",
      property: "123 Main St",
    },
    {
      id: "2",
      title: "Property Viewing",
      date: new Date(Date.now() + 86400000), // Tomorrow
      client: "Sarah Johnson",
      property: "456 Park Ave",
    },
  ]);
  const { toast } = useToast();

  const handleGoogleSync = () => {
    toast({
      title: "Google Calendar",
      description: "Please set up Google Calendar integration in project settings",
    });
    console.log("Sync with Google Calendar clicked");
  };

  const appointmentsForDate = appointments.filter(
    (apt) => apt.date.toDateString() === date?.toDateString()
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Calendar</h2>
        <Button onClick={handleGoogleSync} variant="outline">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Sync with Google Calendar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">
            Appointments for {date?.toLocaleDateString()}
          </h3>
          <div className="space-y-4">
            {appointmentsForDate.map((apt) => (
              <Card key={apt.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => setSelectedClient({
                        id: parseInt(apt.id),
                        name: apt.client,
                        status: "warm",
                        phone: "(555) 123-4567",
                        lastContact: apt.date.toISOString().split('T')[0],
                        propertyInterest: apt.property,
                      })}
                    >
                      {apt.client}
                    </h4>
                    <p 
                      className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
                      onClick={() => setSelectedProperty({
                        id: parseInt(apt.id),
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
                  <p className="text-sm text-muted-foreground">
                    {apt.date.toLocaleTimeString()}
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
