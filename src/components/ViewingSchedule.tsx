import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Phone } from "lucide-react";

const mockViewings = [
  {
    id: 1,
    clientName: "John Smith",
    property: "123 Main St",
    time: "10:00 AM",
    date: "2024-04-11",
    status: "confirmed",
  },
  {
    id: 2,
    clientName: "Sarah Johnson",
    property: "456 Park Ave",
    time: "2:30 PM",
    date: "2024-04-11",
    status: "pending",
  },
  {
    id: 3,
    clientName: "Michael Brown",
    property: "789 Ocean Blvd",
    time: "11:00 AM",
    date: "2024-04-12",
    status: "confirmed",
  },
];

const ViewingSchedule = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success";
      case "pending":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
        <div className="space-y-4">
          {mockViewings.map((viewing) => (
            <Card key={viewing.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{viewing.clientName}</h3>
                  <div className="flex items-center text-secondary text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {viewing.property}
                  </div>
                  <div className="flex items-center text-secondary text-sm mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {viewing.time} - {viewing.date}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getStatusColor(viewing.status)}>
                    {viewing.status.toUpperCase()}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ViewingSchedule;