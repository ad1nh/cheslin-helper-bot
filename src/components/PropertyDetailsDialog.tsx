import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface PropertyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: string;
    address: string;
    price: number;
    type: string;
    bedrooms: number;
    bathrooms: number;
    status: "available" | "under-contract" | "sold";
    seller_id: string;
    created_at: string;
    interested_buyers?: Array<{
      id: string;
      name: string;
      status: string;
      last_contact: string;
    }>;
  };
  seller: {
    id: string;
    name: string;
    phone: string;
  };
}

const PropertyDetailsDialog = ({ open, onOpenChange, property, seller }: PropertyDetailsDialogProps) => {
  // Fetch potential buyers data
  const { data: potentialBuyers = [] } = useQuery({
    queryKey: ["property-buyers", property.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_calls')
        .select(`
          id,
          contact_name,
          lead_stage,
          created_at,
          campaigns!inner (
            property_id
          )
        `)
        .eq('campaigns.property_id', property.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((buyer: any) => ({
        id: buyer.id,
        name: buyer.contact_name,
        status: buyer.lead_stage || 'Considering',
        lastContact: format(new Date(buyer.created_at), 'yyyy-MM-dd')
      }));
    }
  });

  // Mock data for demonstration
  const appointments = [
    { id: 1, date: "2024-04-15", time: "14:00", clientName: "John Smith", type: "Viewing" },
    { id: 2, date: "2024-04-20", time: "15:30", clientName: "Sarah Johnson", type: "Open House" },
  ];

  const listedDate = format(new Date(property.created_at), 'yyyy-MM-dd');
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
              {potentialBuyers.length > 0 ? (
                potentialBuyers.map((buyer) => (
                  <div key={buyer.id} className="border-b pb-2">
                    <p className="font-medium">{buyer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {buyer.status}
                      <br />
                      Last Contact: {buyer.lastContact}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No potential buyers yet</p>
              )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsDialog;