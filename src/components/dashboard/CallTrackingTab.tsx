import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const CallTrackingTab = () => {
  const { data: calls, isLoading } = useQuery({
    queryKey: ["campaign-calls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_calls")
        .select(`
          *,
          campaigns (
            campaign_type,
            property_details
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Call Tracking</h2>
      
      <div className="grid gap-4">
        {calls?.map((call) => (
          <Card key={call.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{call.contact_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{call.phone_number}</p>
                </div>
                <Badge variant={call.status === "completed" ? "default" : "secondary"}>
                  {call.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Campaign Details</h4>
                  <p className="text-sm">{call.campaigns?.campaign_type}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {call.campaigns?.property_details}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Call Outcome</h4>
                  {call.outcome ? (
                    <>
                      <p className="text-sm">{call.outcome}</p>
                      {call.lead_stage && (
                        <Badge className="mt-2" variant="outline">
                          {call.lead_stage}
                        </Badge>
                      )}
                      {call.appointment_date && (
                        <p className="text-sm mt-2">
                          Appointment: {call.appointment_date}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No outcome recorded</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CallTrackingTab;