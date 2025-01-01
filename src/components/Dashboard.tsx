import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import CampaignWorkflow from "./CampaignWorkflow";
import CampaignDashboard from "./CampaignDashboard";
import LeadManagement from "./LeadManagement";
import ViewingSchedule from "./ViewingSchedule";
import CalendarView from "./CalendarView";
import ClientDatabase from "./ClientDatabase";
import PropertyDatabase from "./PropertyDatabase";
import CallTrackingTab from "./dashboard/CallTrackingTab";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Campaigns");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("=== Tab Change Debug ===");
    console.log("1. Dashboard mounted");
    console.log("2. Location state:", location.state);
    console.log("3. Current active tab:", activeTab);
    
    if (location.state?.defaultTab) {
      console.log("4. Attempting to set tab to:", location.state.defaultTab);
      setActiveTab(location.state.defaultTab);
      console.log("5. Tab should now be:", location.state.defaultTab);
      
      // Clear the state after handling it
      window.history.replaceState({}, document.title);
      console.log("6. State cleared");
    }
  }, [location.state]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Add logging to tab change handler
  const handleTabChange = (value: string) => {
    console.log("Tab manually changed to:", value);
    setActiveTab(value);
  };

  return (
    <>
      <div className="w-full border-b bg-white/75 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[2000px] mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-primary">Cheslin</h1>
            
            <nav className="flex-1 px-8">
              <div className="flex items-center justify-start gap-1">
                {[
                  'Campaigns',
                  'Call Tracking',
                  'Dashboard',
                  'Lead Management',
                  'Viewing Schedule',
                  'Calendar',
                  'Client Database',
                  'Property Database',
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={cn(
                      "px-4 h-14 relative transition-colors",
                      "hover:text-primary",
                      "text-sm font-medium",
                      activeTab === tab ? [
                        "text-primary",
                        "after:absolute after:bottom-0 after:left-0 after:right-0",
                        "after:h-0.5 after:bg-primary after:rounded-full"
                      ] : "text-muted-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </nav>

            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-4 py-8">
        {activeTab === "Campaigns" && <CampaignWorkflow />}
        {activeTab === "Call Tracking" && <CallTrackingTab />}
        {activeTab === "Dashboard" && <CampaignDashboard />}
        {activeTab === "Lead Management" && <LeadManagement />}
        {activeTab === "Viewing Schedule" && <ViewingSchedule />}
        {activeTab === "Calendar" && <CalendarView />}
        {activeTab === "Client Database" && <ClientDatabase />}
        {activeTab === "Property Database" && <PropertyDatabase />}
      </div>
    </>
  );
};

export default Dashboard;