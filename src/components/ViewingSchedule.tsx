import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";
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
    id: string;
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
  campaign_id?: string;
  campaigns?: {
    property_details: string;
  };
}

const ViewingSchedule = () => {
  console.log("ViewingSchedule component rendering");

  const [selectedClient, setSelectedClient] = useState<Lead | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  useEffect(() => {
    const checkInteractions = async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*');
      
      console.log("All interactions in database:", { data, error });
    };

    checkInteractions();
  }, []);

  const { data: viewings = [], refetch } = useQuery({
    queryKey: ["viewings"],
    queryFn: async () => {
      console.log("Starting viewings fetch...");
      
      const { data: calls, error } = await supabase
        .from("campaign_calls")
        .select('*, campaigns!inner(*)');  // Simplified query first

      console.log("Calls data:", calls);
      console.log("Query error:", error);

      if (error) {
        console.error("Error fetching viewings:", error);
        throw error;
      }

      return [];  // Temporary return to test data fetch
    }
  });

  const handleAddViewing = async (contact: any) => {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select()
      .limit(1)
      .single();
  
    if (!campaign) return;
  
    // First create the campaign call
    const { data: call, error } = await supabase
      .from('campaign_calls')
      .insert({
        contact_name: contact.name,
        phone_number: contact.phone,
        email: contact.email,
        campaign_id: campaign.id,
        status: 'pending',
        appointment_date: new Date().toISOString(),
        lead_stage: 'Warm'
      })
      .select()
      .single();
  
    if (error || !call) {
      console.error('Error adding viewing:', error);
      return;
    }
  
    console.log("Created campaign call:", call);
  
    // Create interaction with proper typing
    const { error: interactionError } = await supabase
      .from('interactions')
      .insert({
        client_id: call.id,
        type: 'Viewing Scheduled',
        notes: `Method: Email`,
        created_at: new Date().toISOString()
      });
  
    console.log("Interaction creation attempt:", {
      client_id: call.id,
      error: interactionError,
      full_interaction: {
        client_id: call.id,
        type: 'Viewing Scheduled',
        notes: `Method: Email`,
        created_at: new Date().toISOString()
      }
    });
  
    if (interactionError) {
      console.error('Error adding interaction:', interactionError);
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
        campaign_id,
        campaigns (
          property_details
        )
      `)
      .eq('id', clientId)
      .single<CampaignCall>();

    console.log("Client data fetch result:", { clientData, error });

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
      campaigns: {
        id: clientData.campaign_id,
        property_details: clientData.campaigns?.property_details
      },
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
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Today's Viewings</h2>
      </div>
      {/* Rest of your component */}
    </Card>
  );
};

export default ViewingSchedule;
