import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AddContactDialog from "./AddContactDialog";
import LeadDetailsDialog from "./LeadDetailsDialog";
import PropertyDetailsDialog from "./PropertyDetailsDialog";
import { LeadStage } from "@/types/lead";
import { format } from "date-fns";

interface Viewing {
  id: string;
  clientName: string;
  property: string;
  time: string;
  date: string;
  status: "confirmed" | "pending";
  clientId: string;
  propertyId: string;
}

interface Lead {
  id: string;
  name: string;
  status: LeadStage;
  phone: string;
  email?: string;
  lastContact: string;
  propertyInterest: string;
  campaigns?: {
    property_details: string;
  };
  created_at?: string;
}

interface Property {
  id: string;
  address: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  status: string;
  sellerId: number;
  interestedBuyers: number[];
}

interface CampaignCall {
  id: string;
  contact_name: string;
  phone_number: string;
  email: string | null;
  lead_stage: string | null;
  created_at: string;
  campaigns?: {
    property_details: string;
  };
}

const ViewingSchedule = () => {
  const [selectedClient, setSelectedClient] = useState<Lead | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const { data: viewings = [], refetch } = useQuery({
    queryKey: ["viewings"],
    queryFn: async () => {
      const { data: calls, error } = await supabase
        .from("campaign_calls")
        .select(`
          *,
          campaigns (
            property_details,
            campaign_type
          )
        `)
        .not('appointment_date', 'is', null);

      if (error) throw error;

      return calls.map(call => ({
        id: call.id,
        clientName: call.contact_name,
        property: call.campaigns?.property_details || "Property TBD",
        time: new Date(call.appointment_date!).toLocaleTimeString(),
        date: new Date(call.appointment_date!).toLocaleDateString(),
        status: call.status === 'completed' ? 'confirmed' : 'pending',
        clientId: call.id,
        propertyId: call.campaign_id || ''
      }));
    }
  });

  const handleAddViewing = async (contact: any) => {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select()
      .limit(1)
      .single();
  
    if (!campaign) return;
  
    const { data: call, error } = await supabase
      .from('campaign_calls')
      .insert({
        contact_name: contact.name,
        phone_number: contact.phone,
        email: contact.email,
        campaign_id: campaign.id,
        status: 'pending',
        appointment_date: new Date().toISOString(),
        lead_status: 'Warm'
      })
      .select()
      .maybeSingle();
  
    if (error) {
      console.error('Error adding viewing:', error);
      return;
    }
  
    refetch();
  };

  const handleClientClick = async (clientId: string) => {
    console.log("Clicking client with ID:", clientId);
    
    const { data: clientData, error } = await supabase
      .from('campaign_calls')
      .select(`
        id,
        contact_name,
        phone_number,
        email,
        lead_stage,
        created_at,
        campaigns (
          property_details
        )
      `)
      .eq('id', clientId)
      .single<CampaignCall>();

    if (error || !clientData) {
      console.error('Error fetching client details:', error);
      return;
    }

    const transformedClient = {
      id: clientData.id,
      name: clientData.contact_name,
      status: (clientData.lead_stage?.toLowerCase() || 'warm') as LeadStage,
      phone: clientData.phone_number || '-',
      email: clientData.email || '-',
      lastContact: format(new Date(clientData.created_at), 'yyyy-MM-dd, HH:mm'),
      propertyInterest: clientData.campaigns?.property_details || 'Not specified',
      campaigns: clientData.campaigns || undefined,
      created_at: clientData.created_at
    };
    
    console.log("Transformed client data:", transformedClient);
    setSelectedClient(transformedClient);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-700";
      case "initiated":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Today's Viewings</h2>
        <AddContactDialog onAddContact={handleAddViewing} type="lead" />
      </div>

      <div className="space-y-4">
        {viewings.map((viewing) => (
          <Card key={viewing.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 
                  className="font-semibold cursor-pointer hover:text-primary"
                  onClick={() => handleClientClick(viewing.clientId)}
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
          property={{
            id: parseInt(selectedProperty.id),
            address: selectedProperty.address,
            price: selectedProperty.price,
            type: selectedProperty.type,
            bedrooms: selectedProperty.bedrooms,
            bathrooms: selectedProperty.bathrooms,
            status: selectedProperty.status as "available" | "under-contract" | "sold",
            sellerId: selectedProperty.sellerId,
            interestedBuyers: selectedProperty.interestedBuyers
          }}
          seller={{
            id: 1,
            name: "John Doe",
            phone: "+1 (555) 123-4567"
          }}
        />
      )}
    </div>
  );
};

export default ViewingSchedule;
