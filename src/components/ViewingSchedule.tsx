import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import { useState } from "react";
import AddContactDialog from "./AddContactDialog";
import LeadDetailsDialog from "./LeadDetailsDialog";
import PropertyDetailsDialog from "./PropertyDetailsDialog";

interface Viewing {
  id: number;
  clientName: string;
  property: string;
  time: string;
  date: string;
  status: "confirmed" | "pending";
  clientId: number;
  propertyId: number;
}

const ViewingSchedule = () => {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [viewings, setViewings] = useState<Viewing[]>([
    {
      id: 1,
      clientName: "John Smith",
      property: "123 Main St",
      time: "10:00 AM",
      date: "2024-04-11",
      status: "confirmed",
      clientId: 1,
      propertyId: 1,
    },
    {
      id: 2,
      clientName: "Sarah Johnson",
      property: "456 Park Ave",
      time: "2:30 PM",
      date: "2024-04-11",
      status: "pending",
      clientId: 2,
      propertyId: 2,
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
    const viewing = {
      id: viewings.length + 1,
      clientName: contact.name,
      property: contact.propertyInterest || "Property TBD",
      time: "Time TBD",
      date: new Date().toISOString().split("T")[0],
      status: "pending" as const,
      clientId: contact.id || viewings.length + 1,
      propertyId: 1, // Default property ID
    };
    setViewings([...viewings, viewing]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Today's Viewings</h2>
        <AddContactDialog onAddContact={handleAddViewing} type="viewing" />
      </div>

      <div className="space-y-4">
        {viewings.map((viewing) => (
          <Card key={viewing.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 
                  className="font-semibold cursor-pointer hover:text-primary"
                  onClick={() => setSelectedClient({
                    id: viewing.clientId,
                    name: viewing.clientName,
                    status: "warm",
                    phone: "(555) 123-4567",
                    lastContact: viewing.date,
                    propertyInterest: viewing.property,
                  })}
                >
                  {viewing.clientName}
                </h3>
                <div 
                  className="flex items-center text-secondary text-sm mt-1 cursor-pointer hover:text-primary"
                  onClick={() => setSelectedProperty({
                    id: viewing.propertyId,
                    address: viewing.property,
                    price: 500000,
                    type: "House",
                    bedrooms: 3,
                    bathrooms: 2,
                    status: "available",
                    sellerId: 1,
                    interestedBuyers: [1, 2],
                  })}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  {viewing.property}
                </div>
                <div className="flex items-center text-secondary text-sm mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {viewing.time} - {viewing.date}
                </div>
              </div>
              <Badge className={getStatusColor(viewing.status)}>
                {viewing.status.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
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
    </div>
  );
};

export default ViewingSchedule;