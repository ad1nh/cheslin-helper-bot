import { format, startOfWeek, addDays, parseISO, isSameDay, isToday } from "date-fns";
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
  // Get the week that contains the appointment date
  const appointmentDates = appointments.map(apt => apt.date);
  const latestAppointment = appointmentDates.length > 0 
    ? new Date(Math.max(...appointmentDates.map(d => d.getTime())))
    : selectedDate;

  const weekStart = startOfWeek(latestAppointment, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  console.log("Week range:", {
    start: format(weekStart, 'yyyy-MM-dd'),
    days: weekDays.map(d => format(d, 'yyyy-MM-dd')),
    appointments: appointments.map(apt => format(apt.date, 'yyyy-MM-dd HH:mm'))
  });

  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM

  const getAppointmentsForTimeSlot = (day: Date, hour: number) => {
    const timeSlotAppointments = appointments.filter((apt) => {
      const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date);
      
      console.log("Checking appointment:", {
        id: apt.id,
        appointmentDate: aptDate,
        checkingDay: day,
        appointmentHour: aptDate.getHours(),
        slotHour: hour,
        isSameDay: isSameDay(aptDate, day),
        isSameHour: aptDate.getHours() === hour
      });

      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
    });

    console.log(`Found ${timeSlotAppointments.length} appointments for ${format(day, 'yyyy-MM-dd')} at ${hour}:00`);
    
    // Group overlapping appointments into columns
    const columns: typeof timeSlotAppointments[] = [];
    timeSlotAppointments.forEach(apt => {
      const columnIndex = columns.findIndex(column => {
        return !column.some(existingApt => {
          const existingTime = new Date(existingApt.date).getTime();
          const newTime = new Date(apt.date).getTime();
          return Math.abs(existingTime - newTime) < 3600000;
        });
      });

      if (columnIndex === -1) {
        columns.push([apt]);
      } else {
        columns[columnIndex].push(apt);
      }
    });

    return { appointments: timeSlotAppointments, columns };
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="w-20" />
          {weekDays.map((day, index) => (
            <div
              key={day.toISOString()}
              className={cn(
                "flex-1 text-center p-2 border-r last:border-r-0",
                isToday(day) && "bg-primary/10 rounded-t-md"
              )}
            >
              <div className="font-medium">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                "text-sm",
                isToday(day) && "text-primary font-medium"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {timeSlots.map((hour) => (
          <div key={`timeslot-${hour}`} className="grid grid-cols-8 gap-2 min-h-[100px]">
            <div className="text-sm text-muted-foreground w-20">
              {format(new Date().setHours(hour, 0), 'h:mm a')}
            </div>
            {weekDays.map((day) => {
              const { columns } = getAppointmentsForTimeSlot(day, hour);
              const totalColumns = columns.length;
              
              return (
                <div key={day.toString()} className="relative border-t">
                  {columns.map((column, columnIndex) => 
                    column.map(apt => (
                      <Card 
                        key={`apt-${apt.id}-${format(apt.date, 'HH:mm')}`} 
                        className={cn(
                          "absolute p-2",
                          "bg-primary/10 border-l-4 border-l-primary",
                          "hover:bg-primary/20 transition-colors"
                        )}
                        style={{
                          left: `${(columnIndex * 100) / totalColumns}%`,
                          width: `${100 / totalColumns}%`,
                          top: '0',
                          bottom: '0'
                        }}
                      >
                        <div className="flex flex-col h-full">
                          <div 
                            className="text-sm font-medium cursor-pointer hover:text-primary truncate"
                            onClick={() => onSelectClient(apt.id)}
                          >
                            {apt.client}
                          </div>
                          <div 
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
                          </div>
                          <div className="text-xs font-medium">{apt.time}</div>
                        </div>
                      </Card>
                    ))
                  )}
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
