import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { makeBlandAICall } from "@/utils/blandAI";
import { analyzeBlandAICall } from "@/utils/blandAIAnalysis";
import { useState } from "react";
import CampaignNameInput from "./campaign-deployment/CampaignNameInput";
import PropertyDetailsInput from "./campaign-deployment/PropertyDetailsInput";

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

      for (const contact of selectedContacts) {
        try {
          await storeClientData(contact, user.id);

          const blandAIResponse = await makeBlandAICall({
            phoneNumber: contact.phone,
            campaignType: selectedCampaignType,
            propertyDetails,
            contactName: contact.name,
          });

          console.log("Bland AI call initiated for:", contact.name, blandAIResponse);

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

          setTimeout(async () => {
            try {
              const analysisResult = await analyzeBlandAICall(blandAIResponse.call_id);
              console.log("Analysis result:", analysisResult);
              
              // Check if any user response indicates interest in booking
              const hasBookingInterest = analysisResult.transcripts
                .filter(t => t.user === 'user')
                .some(t => t.text.toLowerCase().includes('yes') || 
                          t.text.toLowerCase().includes('interested') ||
                          t.text.toLowerCase().includes('book'));

              if (hasBookingInterest) {
                // Look for appointment time in user responses
                const appointmentTimeRegex = /(\d{1,2})(?:\s*)?(?::|h|pm|am|PM|AM)?(?:\s*)?([0-9]{2})?(?:\s*)?(pm|am|PM|AM)?/;
                let appointmentDate = null;

                for (const transcript of analysisResult.transcripts) {
                  if (transcript.user === 'user' && 
                      transcript.text.toLowerCase().includes('tomorrow') && 
                      transcript.text.toLowerCase().includes('pm')) {
                    const match = transcript.text.match(appointmentTimeRegex);
                    if (match) {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const hour = parseInt(match[1]);
                      tomorrow.setHours(hour + 12); // Add 12 for PM
                      tomorrow.setMinutes(0);
                      appointmentDate = tomorrow.toISOString();
                      console.log("Found appointment date:", appointmentDate);
                    }
                  }
                }

                await supabase
                  .from('campaign_calls')
                  .update({
                    appointment_date: appointmentDate,
                    outcome: "Appointment scheduled",
                    status: "completed"
                  })
                  .eq('bland_call_id', blandAIResponse.call_id);
                
                console.log("Campaign call updated with appointment details");
              }
            } catch (error) {
              console.error("Error analyzing call:", error);
              toast({
                title: "Error",
                description: "Failed to analyze call",
                variant: "destructive",
              });
            }
          }, 120000);

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
        <CampaignNameInput 
          value={campaignName}
          onChange={setCampaignName}
        />
        <PropertyDetailsInput
          value={propertyDetails}
          onChange={onPropertyDetailsChange}
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