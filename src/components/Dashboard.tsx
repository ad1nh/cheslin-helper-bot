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
import { useState } from "react";

const Dashboard = () => {
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState(state?.defaultTab || 'Campaigns');
  console.log("5. Dashboard rendered with state:", state);
  console.log("6. defaultTab value:", state?.defaultTab);
  
  const defaultTab = state?.defaultTab || 'Campaigns';
  console.log("7. Final defaultTab value:", defaultTab);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    console.log("Tab changed to:", value);
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