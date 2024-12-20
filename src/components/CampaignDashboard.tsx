import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatsCards from "./dashboard/StatsCards";
import CalendarView from "./CalendarView";

const CampaignDashboard = () => {
  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      console.log("Fetching campaigns...");
      const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("*");

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      console.log("Fetched campaigns:", campaigns);
      return campaigns;
    },
  });

  const { data: callStats } = useQuery({
    queryKey: ["call-stats"],
    queryFn: async () => {
      console.log("Fetching call stats...");
      const { data: calls, error } = await supabase
        .from("campaign_calls")
        .select("*, campaigns(*)");

      if (error) {
        console.error("Error fetching call stats:", error);
        throw error;
      }

      console.log("Fetched calls:", calls);

      // Process calls data for charts
      const leadStages = calls.reduce((acc: any, call) => {
        if (call.lead_stage) {
          acc[call.lead_stage] = (acc[call.lead_stage] || 0) + 1;
        }
        return acc;
      }, {});

      const leadTagsData = Object.entries(leadStages).map(([name, value]) => ({
        name,
        value,
        percentage: `${((Number(value) / calls.length) * 100).toFixed(1)}%`,
        color: name === 'Hot' ? '#047857' : name === 'Warm' ? '#10B981' : '#E5E7EB',
      }));

      return { leadTagsData, calls };
    },
  });

  const mockAppointmentData = Array.from({ length: 30 }, (_, i) => ({
    date: `11/${i + 1}`,
    interested: Math.floor(Math.random() * 10),
    hot: Math.floor(Math.random() * 8),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Check the current stats of the operation</p>
        </div>
        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns?.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name || `Campaign ${campaign.id.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="60">Last 60 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAppointmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="interested" fill="#10B981" name="Interested" />
                  <Bar dataKey="hot" fill="#047857" name="Hot Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={callStats?.leadTagsData || []}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {callStats?.leadTagsData?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-4">
                {callStats?.leadTagsData?.map((tag: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="text-sm font-medium">{tag.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{tag.value}</div>
                      <div className="text-xs text-muted-foreground">{tag.percentage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarView />
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDashboard;