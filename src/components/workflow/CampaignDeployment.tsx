import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { makeBlandAICall } from "@/utils/blandAI";
import { analyzeBlandAICall } from "@/utils/blandAIAnalysis";
import { useState } from "react";
import CampaignNameInput from "./campaign-deployment/CampaignNameInput";
import PropertyDetailsInput from "./campaign-deployment/PropertyDetailsInput";
import { LeadStage } from '@/types/lead';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CampaignDeploymentProps {
  selectedContacts: any[];
  selectedCampaignType: string;
  propertyDetails: string;
  selectedPropertyId?: string;
  onPropertyDetailsChange: (value: string) => void;
  onDeploymentSuccess: (name: string) => void;
}

const CampaignDeployment = ({ 
  selectedContacts, 
  selectedCampaignType, 
  propertyDetails,
  selectedPropertyId,
  onPropertyDetailsChange,
  onDeploymentSuccess 
}: CampaignDeploymentProps) => {
  const [campaignName, setCampaignName] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  const storeClientData = async (contact: any, userId: string) => {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          property_interest: propertyDetails,
          status: 'New' as LeadStage,
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

    setIsDeploying(true);
    try {
      // Log the start of deployment
      console.log("Starting campaign deployment:", {
        campaignName,
        selectedContacts,
        selectedCampaignType,
        propertyDetails
      });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
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
          property_id: selectedPropertyId,
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
          console.log("Initiating call for contact:", contact);
          
          const blandAIResponse = await makeBlandAICall({
            phoneNumber: contact.phone,
            campaignType: selectedCampaignType,
            propertyDetails,
            contactName: contact.name,
          });

          console.log("BlandAI Response:", blandAIResponse);

          if (!blandAIResponse || !blandAIResponse.call_id) {
            throw new Error("No call_id received from BlandAI");
          }

          await storeClientData(contact, user.id);

          const { data: callRecord, error: callError } = await supabase
            .from('campaign_calls')
            .insert({
              campaign_id: campaign.id,
              contact_name: contact.name,
              phone_number: contact.phone,
              email: contact.email,
              status: 'initiated',
              bland_call_id: blandAIResponse.call_id
            })
            .select()
            .single();

          if (callError) throw callError;

          const { error: interactionError } = await supabase
            .from('interactions')
            .insert({
              client_id: callRecord.id,
              type: 'Appointment Scheduled',
              notes: `Method: Phone Call`,
              created_at: new Date().toISOString()
            });

          if (interactionError) {
            console.error("Error creating interaction:", interactionError);
          }

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
                  if (transcript.user === 'user') {
                    const match = transcript.text.match(appointmentTimeRegex);
                    if (match) {
                      const date = new Date();
                      if (transcript.text.toLowerCase().includes('tomorrow')) {
                        date.setDate(date.getDate() + 1);
                      }
                      const hour = parseInt(match[1]);
                      const isPM = transcript.text.toLowerCase().includes('pm');
                      date.setHours(isPM ? hour + 12 : hour);
                      date.setMinutes(0);
                      appointmentDate = date.toISOString();
                      console.log("Found appointment date:", appointmentDate);
                      break; // Exit loop once we find a date
                    }
                  }
                }

                await supabase
                  .from('campaign_calls')
                  .update({
                    appointment_date: appointmentDate,
                    outcome: "Appointment scheduled",
                    status: "completed",
                    lead_stage: "Warm",
                    email: contact.email,
                    property_id: selectedPropertyId || null
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
          console.error('Detailed error for contact:', contact.name, error);
          toast({
            title: "Error",
            description: `Failed to process call for ${contact.name}: ${error.message}`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: "Campaign deployed successfully!",
      });
      onDeploymentSuccess(campaignName);
    } catch (error) {
      console.error('Campaign deployment error:', error);
      toast({
        title: "Error",
        description: `Failed to deploy campaign: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Review & Deploy Campaign</h2>
        <p className="text-muted-foreground">Ready to launch your campaign</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="campaignName">Campaign Name</Label>
          <Input
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Enter campaign name..."
          />
        </div>

        <div className="space-y-2">
          <Label>Property Details</Label>
          <div className="p-3 rounded-md border bg-muted/50">
            {propertyDetails || "No property selected"}
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleDeployCampaign}
          disabled={isDeploying}
        >
          {isDeploying ? (
            <>
              <span className="animate-pulse">Deploying Campaign...</span>
            </>
          ) : (
            "Deploy Campaign"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CampaignDeployment;