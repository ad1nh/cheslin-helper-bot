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

interface PotentialBuyer {
  id: string;
  name: string;
  phone: string;
  status: "Considering" | "Warm" | "Cold";
  lastContact: string;
  contactCount: number;
}

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
          phone_number,
          lead_stage,
          created_at,
          campaigns!inner (
            property_id
          )
        `)
        .eq('campaigns.property_id', property.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Create a Map to store unique contacts using phone number as key
      const uniqueBuyers = new Map();

      data.forEach((buyer: any) => {
        const key = buyer.phone_number;
        
        if (!uniqueBuyers.has(key)) {
          uniqueBuyers.set(key, {
            id: buyer.id,
            name: buyer.contact_name,
            phone: buyer.phone_number,
            status: buyer.lead_stage === 'Considering' ? 'Warm' : buyer.lead_stage || 'Cold',
            lastContact: format(new Date(buyer.created_at), 'yyyy-MM-dd'),
            contactCount: 1
          });
        } else {
          // Update last contact if more recent
          const existing = uniqueBuyers.get(key);
          const newDate = new Date(buyer.created_at);
          const existingDate = new Date(existing.lastContact);
          
          if (newDate > existingDate) {
            existing.lastContact = format(newDate, 'yyyy-MM-dd');
          }
          existing.contactCount++;
        }
      });

      return Array.from(uniqueBuyers.values());
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
            
            {potentialBuyers.length > 0 ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {['Warm', 'Cold'].map(status => {
                    const count = potentialBuyers.filter(buyer => 
                      buyer.status === status
                    ).length;
                    return (
                      <div key={status} className="text-center p-2 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">{status}</div>
                        <div className="text-lg font-semibold">{count}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Expandable List */}
                <div className="space-y-2">
                  {['Warm', 'Cold'].map(status => {
                    const buyersInStatus = potentialBuyers.filter(buyer => 
                      buyer.status === status
                    );
                    if (buyersInStatus.length === 0) return null;
                    
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={status === 'Warm' ? 'bg-amber-500 text-white' : status === 'Cold' ? 'bg-gray-500 text-white' : ''}
                          >
                            {status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ({buyersInStatus.length})
                          </span>
                        </div>
                        <div className="pl-4 space-y-2">
                          {buyersInStatus.map(buyer => (
                            <div 
                              key={buyer.id} 
                              className="text-sm flex justify-between items-center py-1 hover:bg-muted/50 rounded px-2"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{buyer.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {buyer.phone}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground">
                                  Last Contact: {buyer.lastContact}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Contacts: {buyer.contactCount}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No potential buyers yet</p>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsDialog;