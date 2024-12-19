import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";

interface PropertyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: number;
    address: string;
    price: number;
    type: string;
    bedrooms: number;
    bathrooms: number;
    status: "available" | "under-contract" | "sold";
    sellerId: number;
    interestedBuyers: number[];
  };
  seller: {
    name: string;
    phone: string;
  };
}

const PropertyDetailsDialog = ({ open, onOpenChange, property, seller }: PropertyDetailsDialogProps) => {
  // Mock data for demonstration
  const appointments = [
    { id: 1, date: "2024-04-15", time: "14:00", clientName: "John Smith", type: "Viewing" },
    { id: 2, date: "2024-04-20", time: "15:30", clientName: "Sarah Johnson", type: "Open House" },
  ];

  const potentialBuyers = [
    { id: 1, name: "Michael Brown", status: "Very Interested", lastContact: "2024-04-10" },
    { id: 2, name: "Emma Wilson", status: "Considering", lastContact: "2024-04-08" },
  ];

  const listedDate = "2024-03-01";
  const daysOnMarket = Math.floor((new Date().getTime() - new Date(listedDate).getTime()) / (1000 * 3600 * 24));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{property.address}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Property Details</h3>
            <div className="space-y-2">
              <p>Price: ${property.price.toLocaleString()}</p>
              <p>Type: {property.type}</p>
              <p>Bedrooms: {property.bedrooms}</p>
              <p>Bathrooms: {property.bathrooms}</p>
              <p>Status: <Badge>{property.status}</Badge></p>
              <p>Days on Market: {daysOnMarket}</p>
              <p>Listed Date: {listedDate}</p>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Seller Information</h3>
            <div className="space-y-2">
              <p>Name: {seller.name}</p>
              <p>Contact: {seller.phone}</p>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Appointments
            </h3>
            <div className="space-y-2">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {apt.date} {apt.time} - {apt.clientName} ({apt.type})
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              Potential Buyers ({potentialBuyers.length})
            </h3>
            <div className="space-y-2">
              {potentialBuyers.map((buyer) => (
                <div key={buyer.id} className="border-b pb-2">
                  <p className="font-medium">{buyer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {buyer.status}
                    <br />
                    Last Contact: {buyer.lastContact}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsDialog;