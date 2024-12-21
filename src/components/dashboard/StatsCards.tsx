import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, Phone, ArrowLeftRight, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StatsCards = () => {
  const { data: stats } = useQuery({
    queryKey: ["call-stats"],
    queryFn: async () => {
      const { data: calls, error } = await supabase
        .from("campaign_calls")
        .select("*");

      if (error) throw error;

      const total = calls.length;
      const connected = calls.filter(call => call.status === 'completed').length;
      const callbacks = calls.filter(call => call.outcome === 'callback').length;
      const appointments = calls.filter(call => call.appointment_date).length;

      return {
        total,
        connected,
        callbacks,
        appointments
      };
    }
  });

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Call Connected</CardTitle>
          <PhoneCall className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.connected || 0}
            <span className="text-sm text-muted-foreground">/{stats?.total || 0}</span>
          </div>
          <div className="text-xs text-emerald-500 flex items-center">
            {stats?.connected ? `${Math.round((stats.connected / stats.total) * 100)}% connection rate` : 'No calls yet'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Callback Scheduled</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.callbacks || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Appointments Set</CardTitle>
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.appointments || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Follow up needed</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.total ? stats.total - (stats.connected || 0) : 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;