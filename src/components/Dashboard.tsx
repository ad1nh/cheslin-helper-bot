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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Welcome to Cheslin</h1>
          <p className="text-secondary">Your AI-powered real estate assistant</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>

      <Tabs 
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="Campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="Call Tracking">Call Tracking</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
          <TabsTrigger value="viewings">Viewing Schedule</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="clients">Client Database</TabsTrigger>
          <TabsTrigger value="properties">Property Database</TabsTrigger>
        </TabsList>

        <TabsContent value="Campaigns">
          <CampaignWorkflow />
        </TabsContent>

        <TabsContent value="Call Tracking">
          <CallTrackingTab />
        </TabsContent>

        <TabsContent value="dashboard">
          <CampaignDashboard />
        </TabsContent>

        <TabsContent value="leads">
          <LeadManagement />
        </TabsContent>

        <TabsContent value="viewings">
          <ViewingSchedule />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView />
        </TabsContent>

        <TabsContent value="clients">
          <ClientDatabase />
        </TabsContent>

        <TabsContent value="properties">
          <PropertyDatabase />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;