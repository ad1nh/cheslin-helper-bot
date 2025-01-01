import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PhoneCall, Home, CheckCircle, Phone } from "lucide-react";
import AddContactForm from "./workflow/AddContactForm";
import ReviewContacts from "./workflow/ReviewContacts";
import CampaignDeployment from "./workflow/CampaignDeployment";
import PropertySelection from "./workflow/PropertySelection";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CampaignFAQs } from "./campaign/CampaignFAQs";

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
    icon: Phone,
  }
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[2000px] mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">
            Welcome to Campaign Creation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Launch powerful AI-powered calling campaigns to connect with potential buyers. 
            Our intelligent system handles the calls while you focus on closing deals.
          </p>
        </div>

        <div className="flex gap-12">
          {/* Wider sidebar */}
          <div className="w-96 bg-white rounded-xl shadow-sm p-6 h-fit">
            <div className="mb-6">
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-primary rounded-full transition-all"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>

            <div className="space-y-3">
              {!isDeployed && steps.map((step, index) => (
                <div
                  key={step}
                  className={cn(
                    "relative p-4 rounded-lg transition-all",
                    "flex items-center justify-between",
                    currentStep === index
                      ? "bg-primary text-white"
                      : isStepEnabled(index)
                      ? "hover:bg-gray-50 cursor-pointer"
                      : "opacity-50 cursor-not-allowed",
                    isReviewMode && index < currentStep && "border-l-4 border-orange-400"
                  )}
                  onClick={() => handleStepChange(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                      currentStep === index 
                        ? "bg-white text-primary" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{step}</span>
                  </div>
                  
                  {isReviewMode && index < currentStep && (
                    <span className="text-[10px] bg-orange-100 text-orange-500 px-2 py-1 rounded-full whitespace-nowrap">
                      reviewing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main content area - now with more width */}
          <div className="flex-1 min-w-0">
            {!isDeployed ? (
              <>
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <Card
                      className={cn(
                        "relative overflow-hidden transition-all duration-300",
                        "hover:shadow-xl cursor-pointer",
                        selectedCampaignType === "Solicit Buyers"
                          ? "ring-2 ring-primary shadow-lg"
                          : "hover:shadow-lg"
                      )}
                      onClick={() => handleCampaignTypeSelect("Solicit Buyers")}
                    >
                      <div className="p-8">
                        <div className="flex items-center gap-8">
                          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Phone className="w-10 h-10 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h2 className="text-3xl font-semibold mb-3">Start Your Campaign</h2>
                            <p className="text-gray-600 text-lg">Contact potential buyers to schedule viewings for your listed properties</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {!selectedCampaignType && (
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Click the card above to begin your campaign
                      </p>
                    )}
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
      </div>
      {!isDeployed && (
  <div className="mt-8">
    <CampaignFAQs />
  </div>
)}
    </div>
  );
};

export default CampaignWorkflow;