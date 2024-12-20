import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, Home } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AddContactForm from "./workflow/AddContactForm";
import ReviewContacts from "./workflow/ReviewContacts";
import { makeBlandAICall } from "@/utils/blandAI";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  "Launch Campaign Type",
  "Add Contacts",
  "Review Contacts",
  "Review & Deploy Campaign"
];

const campaignTypes = [
  {
    title: "Solicit Buyers",
    description: "Contact potential buyers to schedule viewings for your listed properties.",
    icon: PhoneCall,
  },
  {
    title: "Follow Up from Open House",
    description: "Reach out to open house attendees for feedback",
    icon: Home,
  },
];

const CampaignWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [selectedCampaignType, setSelectedCampaignType] = useState("");
  const [propertyDetails, setPropertyDetails] = useState("");
  const { toast } = useToast();

  const handleCampaignTypeSelect = (campaignType: string) => {
    setSelectedCampaignType(campaignType);
    setCurrentStep(1);
  };

  const handleDeployCampaign = async () => {
    try {
      // Create campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          campaign_type: selectedCampaignType,
          property_details: propertyDetails,
          status: 'active'
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Create campaign calls and initiate Bland AI calls
      for (const contact of selectedContacts) {
        try {
          // Create campaign call record
          const { error: callError } = await supabase
            .from('campaign_calls')
            .insert({
              campaign_id: campaign.id,
              contact_name: contact.name,
              phone_number: contact.phone,
              status: 'initiated'
            });

          if (callError) throw callError;

          // Initiate Bland AI call
          await makeBlandAICall({
            phoneNumber: contact.phone,
            campaignType: selectedCampaignType,
            propertyDetails,
            contactName: contact.name,
          });
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
    <div className="flex gap-8">
      {/* Steps sidebar */}
      <div className="w-64 bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentStep === index
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setCurrentStep(index)}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Choose Campaign Type</h2>
              <p className="text-gray-600">
                Decide how you want to engage your clients and generate leads.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {campaignTypes.map((campaign) => (
                <Card
                  key={campaign.title}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleCampaignTypeSelect(campaign.title)}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <campaign.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <p className="text-sm text-gray-600">{campaign.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <AddContactForm onAddContacts={(contacts) => {
            setSelectedContacts(contacts);
            setCurrentStep(2);
          }} />
        )}

        {currentStep === 2 && (
          <ReviewContacts 
            contacts={selectedContacts}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <div className="text-center p-12">
            <h2 className="text-2xl font-bold mb-4">Review & Deploy Campaign</h2>
            <p className="text-gray-600 mb-6">Ready to launch your campaign</p>
            <div className="max-w-md mx-auto mb-6">
              <textarea
                className="w-full p-3 border rounded-md"
                rows={4}
                placeholder="Enter property details or additional information..."
                value={propertyDetails}
                onChange={(e) => setPropertyDetails(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleDeployCampaign}
              className="w-full max-w-md"
            >
              Deploy Campaign
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignWorkflow;