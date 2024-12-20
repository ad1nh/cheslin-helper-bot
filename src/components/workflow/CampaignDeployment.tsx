import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { makeBlandAICall } from "@/utils/blandAI";
import { analyzeBlandAICall } from "@/utils/blandAIAnalysis";
import { useState } from "react";

interface CampaignDeploymentProps {
  selectedContacts: any[];
  selectedCampaignType: string;
  propertyDetails: string;
  onPropertyDetailsChange: (value: string) => void;
}

const CampaignDeployment = ({ 
  selectedContacts, 
  selectedCampaignType, 
  propertyDetails,
  onPropertyDetailsChange 
}: CampaignDeploymentProps) => {
  const { toast } = useToast();
  const [campaignName, setCampaignName] = useState("");

  const storeClientData = async (contact: any, userId: string) => {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          name: contact.name,
          phone: contact.phone,
          property_interest: propertyDetails,
          status: 'warm',
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      console.log("Client stored successfully:", client);
      return client;
    } catch (error) {
      console.error("Error storing client:", error);
      throw error;
    }
  };

  const handleDeployCampaign = async () => {
    if (!campaignName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a campaign name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a campaign",
          variant: "destructive",
        });
        return;
      }

      // Create campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          campaign_type: selectedCampaignType,
          property_details: propertyDetails,
          status: 'active',
          user_id: user.id,
          name: campaignName
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      console.log("Campaign created:", campaign);

      // Create campaign calls and store client data
      for (const contact of selectedContacts) {
        try {
          // Store client data first
          await storeClientData(contact, user.id);

          // Initiate Bland AI call
          const blandAIResponse = await makeBlandAICall({
            phoneNumber: contact.phone,
            campaignType: selectedCampaignType,
            propertyDetails,
            contactName: contact.name,
          });

          console.log("Bland AI call initiated for:", contact.name, blandAIResponse);

          // Create campaign call record
          const { data: callRecord, error: callError } = await supabase
            .from('campaign_calls')
            .insert({
              campaign_id: campaign.id,
              contact_name: contact.name,
              phone_number: contact.phone,
              status: 'initiated',
              bland_call_id: blandAIResponse.call_id
            })
            .select()
            .single();

          if (callError) throw callError;

          // Schedule analysis after 2 minutes
          setTimeout(async () => {
            try {
              const analysisResult = await analyzeBlandAICall(blandAIResponse.call_id);
              
              // Update campaign call with appointment details if available
              if (analysisResult.answers[0] === "Yes" && analysisResult.answers[1]) {
                await supabase
                  .from('campaign_calls')
                  .update({
                    appointment_date: analysisResult.answers[1],
                    outcome: "Appointment scheduled",
                    status: "completed"
                  })
                  .eq('bland_call_id', blandAIResponse.call_id);
              }
            } catch (error) {
              console.error("Error analyzing call:", error);
              toast({
                title: "Error",
                description: "Failed to analyze call",
                variant: "destructive",
              });
            }
          }, 120000); // 2 minutes in milliseconds

        } catch (error) {
          console.error('Error processing contact:', contact.name, error);
          toast({
            title: "Error",
            description: `Failed to process call for ${contact.name}`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: "Campaign deployed successfully!",
      });
    } catch (error) {
      console.error('Error deploying campaign:', error);
      toast({
        title: "Error",
        description: "Failed to deploy campaign",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="text-center p-12">
      <h2 className="text-2xl font-bold mb-4">Review & Deploy Campaign</h2>
      <p className="text-gray-600 mb-6">Ready to launch your campaign</p>
      <div className="max-w-md mx-auto space-y-6">
        <Input
          placeholder="Enter campaign name..."
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          className="mb-4"
        />
        <textarea
          className="w-full p-3 border rounded-md"
          rows={4}
          placeholder="Enter property details or additional information..."
          value={propertyDetails}
          onChange={(e) => onPropertyDetailsChange(e.target.value)}
        />
      </div>
      <Button 
        onClick={handleDeployCampaign}
        className="w-full max-w-md mt-6"
      >
        Deploy Campaign
      </Button>
    </div>
  );
};

export default CampaignDeployment;