import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadManagement from "./LeadManagement";
import ViewingSchedule from "./ViewingSchedule";
import CalendarView from "./CalendarView";
import ClientDatabase from "./ClientDatabase";
import PropertyDatabase from "./PropertyDatabase";

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
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="clients">Client Database</TabsTrigger>
          <TabsTrigger value="properties">Property Database</TabsTrigger>
        </TabsList>
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