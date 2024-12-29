import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PhoneCall, Home, CheckCircle } from "lucide-react";
import AddContactForm from "./workflow/AddContactForm";
import ReviewContacts from "./workflow/ReviewContacts";
import CampaignDeployment from "./workflow/CampaignDeployment";
import PropertySelection from "./workflow/PropertySelection";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const steps = [
  "Launch Campaign Type",
  "Add Contacts",
  "Property Selection",
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
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const navigate = useNavigate();

  const isStepEnabled = (stepIndex: number) => {
    if (isReviewMode) {
      return stepIndex <= currentStep;
    }
    
    switch (stepIndex) {
      case 0: // Launch Campaign Type
        return true;
      case 1: // Add Contacts
        return !!selectedCampaignType;
      case 2: // Property Selection
        return !!selectedCampaignType && selectedContacts.length > 0;
      case 3: // Review & Deploy
        return !!selectedCampaignType && 
               selectedContacts.length > 0 && 
               !!selectedPropertyId && 
               !!propertyDetails;
      default:
        return false;
    }
  };

  const handleStepChange = (index: number) => {
    if (!isStepEnabled(index)) {
      const missingRequirements = getMissingRequirements(index);
      toast({
        title: "Cannot proceed",
        description: missingRequirements,
        variant: "destructive",
      });
      return;
    }

    // Set review mode for any step after the first one
    if (currentStep > 0) {
      setIsReviewMode(true);
    }

    // If in review mode and moving forward, validate all steps
    if (isReviewMode && index > currentStep) {
      const allStepsValid = validateAllSteps();
      if (!allStepsValid) {
        toast({
          title: "Validation Required",
          description: "Please review all steps before proceeding",
          variant: "destructive",
        });
        return;
      }
    }

    setCurrentStep(index);
  };

  const getMissingRequirements = (stepIndex: number) => {
    switch (stepIndex) {
      case 1:
        return "Please select a campaign type first";
      case 2:
        return !selectedCampaignType 
          ? "Please select a campaign type first"
          : "Please add contacts before proceeding";
      case 3:
        return !selectedPropertyId 
          ? "Please select a property before proceeding to review"
          : !propertyDetails
          ? "Please complete property details before proceeding"
          : "Please complete all previous steps";
      default:
        return "Invalid step";
    }
  };

  const handleCampaignTypeSelect = (campaignType: string) => {
    console.log("Selected campaign type:", campaignType);
    setSelectedCampaignType(campaignType);
    setIsReviewMode(true);
    setCurrentStep(1);
  };

  const validateAllSteps = () => {
    return (
      !!selectedCampaignType &&
      selectedContacts.length > 0 &&
      !!selectedPropertyId &&
      !!propertyDetails
    );
  };

  return (
    <div className="flex gap-8">
      {/* Steps sidebar */}
      <div className="w-64 bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          {!isDeployed && steps.map((step, index) => (
            <div
              key={step}
              className={cn(
                "p-3 rounded-lg transition-colors",
                "flex items-center gap-2",
                currentStep === index
                  ? "bg-primary text-white"
                  : isStepEnabled(index)
                  ? "text-gray-600 hover:bg-gray-100 cursor-pointer"
                  : "text-gray-400 bg-gray-100 cursor-not-allowed",
                isReviewMode && index < currentStep && "border-l-4 border-orange-400"
              )}
              onClick={() => handleStepChange(index)}
            >
              <span>{step}</span>
              {isReviewMode && index < currentStep && (
                <span className="text-[10px] bg-orange-100 text-orange-500 px-1.5 py-0.5 rounded-full">
                  reviewing
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {!isDeployed ? (
          <>
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
                setIsReviewMode(true);
                setCurrentStep(2);
              }} />
            )}

            {currentStep === 2 && (
              <PropertySelection 
                onSelect={(propertyId, address) => {
                  setSelectedPropertyId(propertyId);
                  setPropertyDetails(address);
                }}
                onNext={() => {
                  setIsReviewMode(true);
                  setCurrentStep(3);
                }}
              />
            )}

            {currentStep === 3 && (
              <CampaignDeployment
                selectedContacts={selectedContacts}
                selectedCampaignType={selectedCampaignType}
                propertyDetails={propertyDetails}
                selectedPropertyId={selectedPropertyId}
                onPropertyDetailsChange={setPropertyDetails}
                onDeploymentSuccess={(name) => {
                  setCampaignName(name);
                  setIsDeployed(true);
                }}
              />
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Campaign Deployed Successfully!</h2>
              <p className="text-muted-foreground mt-2">
                Your campaign "{campaignName}" is now active
              </p>
            </div>
            <div className="space-y-4">
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contacts</span>
                    <span className="font-medium">{selectedContacts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property</span>
                    <span className="font-medium">{propertyDetails}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campaign Type</span>
                    <span className="font-medium">{selectedCampaignType}</span>
                  </div>
                </div>
              </Card>
              <div className="space-x-4">
                <Button variant="outline" onClick={() => {
                  // Reset the workflow
                  setCurrentStep(0);
                  setSelectedContacts([]);
                  setSelectedCampaignType("");
                  setPropertyDetails("");
                  setSelectedPropertyId("");
                  setIsDeployed(false);
                  setIsReviewMode(false);
                }}>
                  Start New Campaign
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    console.log("1. Button clicked");
                    console.log("2. Current location:", window.location.pathname);
                    console.log("3. Attempting navigation with state:", { defaultTab: 'Call Tracking' });
                    
                    navigate('/', { 
                      state: { defaultTab: 'Call Tracking' }
                    });
                    
                    console.log("4. Navigation executed");
                  }}
                >
                  View Campaign Progress
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignWorkflow;