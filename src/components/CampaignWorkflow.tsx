import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PhoneCall, Home } from "lucide-react";
import AddContactForm from "./workflow/AddContactForm";
import ReviewContacts from "./workflow/ReviewContacts";
import CampaignDeployment from "./workflow/CampaignDeployment";

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

  const handleCampaignTypeSelect = (campaignType: string) => {
    console.log("Selected campaign type:", campaignType);
    setSelectedCampaignType(campaignType);
    setCurrentStep(1);
  };

  const handleStepChange = (index: number) => {
    // Only allow moving to a step if a campaign type is selected
    if (index > 0 && !selectedCampaignType) {
      return;
    }
    setCurrentStep(index);
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
              onClick={() => handleStepChange(index)}
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
              {campaignTypes.map((campaign, index) => (
                <Card
                  key={campaign.title}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedCampaignType === campaign.title
                      ? "ring-2 ring-primary shadow-lg"
                      : "hover:shadow-lg"
                  }`}
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
          <CampaignDeployment
            selectedContacts={selectedContacts}
            selectedCampaignType={selectedCampaignType}
            propertyDetails={propertyDetails}
            onPropertyDetailsChange={setPropertyDetails}
          />
        )}
      </div>
    </div>
  );
};

export default CampaignWorkflow;