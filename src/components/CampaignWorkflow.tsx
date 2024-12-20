import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, VoicemailIcon, Home } from "lucide-react";

const steps = [
  "Choose Campaign Type",
  "Add Contacts",
  "Review Contacts",
  "Set Up Goal",
  "Gather Info",
  "Choose AI Assistant",
  "Review AI Assistant",
  "Review & Deploy Campaign"
];

const campaignTypes = [
  {
    title: "Qualification Calls",
    description: "Make AI-driven calls to gather information and find top leads.",
    icon: PhoneCall,
  },
  {
    title: "Voicemail Campaign",
    description: "Send personalised voicemails to your contacts automatically.",
    icon: VoicemailIcon,
  },
  {
    title: "Follow Up from Open House",
    description: "Reach out to open house attendees for feedback",
    icon: Home,
  },
];

const CampaignWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(0);

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
        {/* Placeholder for other steps */}
        {currentStep > 0 && (
          <div className="text-center p-12">
            <h2 className="text-2xl font-bold mb-4">{steps[currentStep]}</h2>
            <p className="text-gray-600">This step is under development</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignWorkflow;