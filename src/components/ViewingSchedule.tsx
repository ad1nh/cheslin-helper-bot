import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import AddContactDialog from "./AddContactDialog";

interface Viewing {
  id: number;
  clientName: string;
  property: string;
  time: string;
  date: string;
  status: "confirmed" | "pending";
}

const ViewingSchedule = () => {
  const [viewings, setViewings] = useState<Viewing[]>([
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
  ]);

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

  const handleAddViewing = (contact: any) => {
    const viewing: Viewing = {
      id: viewings.length + 1,
      clientName: contact.name,
      property: contact.propertyInterest || "Property TBD",
      time: "Time TBD",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setViewings([...viewings, viewing]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Today's Schedule</h2>
        <AddContactDialog onAddContact={handleAddViewing} type="viewing" />
      </div>

      <div className="space-y-4">
        {viewings.map((viewing) => (
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
    </div>
  );
};

export default ViewingSchedule;