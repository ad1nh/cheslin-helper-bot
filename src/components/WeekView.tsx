import { format, startOfWeek, addDays, parseISO, isSameDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  appointments: Array<{
    id: string;
    client: string;
    property: string;
    date: Date;
    time: string;
  }>;
  selectedDate: Date;
  onSelectClient: (client: any) => void;
  onSelectProperty: (property: any) => void;
}

const WeekView = ({ appointments, selectedDate, onSelectClient, onSelectProperty }: WeekViewProps) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 9);

  const getAppointmentsForTimeSlot = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate.getHours() === hour && 
             isSameDay(aptDate, day);
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-6 gap-2 mb-2">
          <div className="w-20" />
          {weekDays.map((day) => (
            <div key={day.toString()} className="text-center font-medium">
              {format(day, 'EEE d')}
            </div>
          ))}
        </div>

        {timeSlots.map((hour) => (
          <div key={hour} className="grid grid-cols-6 gap-2 min-h-[100px]">
            <div className="text-sm text-muted-foreground w-20">
              {format(new Date().setHours(hour, 0), 'HH:mm')}
            </div>
            {weekDays.map((day) => {
              const appointmentsAtTime = getAppointmentsForTimeSlot(day, hour);
              
              return (
                <div key={day.toString()} className="relative border-t">
                  {appointmentsAtTime.map((apt) => (
                    <Card 
                      key={apt.id} 
                      className={cn(
                        "absolute inset-x-0 p-2 m-1",
                        "bg-primary/10 border-l-4 border-l-primary",
                        "hover:bg-primary/20 transition-colors"
                      )}
                    >
                      <div className="flex flex-col">
                        <p 
                          className="text-sm font-medium cursor-pointer hover:text-primary"
                          onClick={() => onSelectClient({
                            id: apt.id,
                            name: apt.client,
                            status: "Warm",
                            phone: "(555) 123-4567",
                            lastContact: format(apt.date, 'yyyy-MM-dd'),
                            propertyInterest: apt.property,
                          })}
                        >
                          {apt.client}
                        </p>
                        <p 
                          className="text-xs text-muted-foreground truncate cursor-pointer hover:text-primary"
                          onClick={() => onSelectProperty({
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
                          {apt.property}
                        </p>
                        <p className="text-xs font-medium">{apt.time}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
