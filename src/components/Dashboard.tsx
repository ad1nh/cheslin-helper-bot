import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadManagement from "./LeadManagement";
import ViewingSchedule from "./ViewingSchedule";

const Dashboard = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome to Cheslin</h1>
        <p className="text-secondary">Your AI-powered real estate assistant</p>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
          <TabsTrigger value="viewings">Viewing Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="leads">
          <LeadManagement />
        </TabsContent>
        <TabsContent value="viewings">
          <ViewingSchedule />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;