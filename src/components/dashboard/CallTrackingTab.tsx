import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useState } from "react";

interface CallDetails {
  id: string;
  contact_name: string;
  phone_number: string;
  status: string;
  outcome: string | null;
  lead_stage: string | null;
  appointment_date: string | null;
  campaigns: {
    campaign_type: string;
    property_details: string;
  } | null;
}

const CallTrackingTab = () => {
  const [selectedCall, setSelectedCall] = useState<CallDetails | null>(null);

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
      console.log("Fetched calls:", data);
      return data;
    },
  });

  const formatAppointmentDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, MMMM do yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error, "for date string:", dateString);
      return dateString;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Call Tracking</h2>
      
      <div className="grid gap-4">
        {calls?.map((call) => (
          <Card key={call.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedCall(call)}>
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
                  {call.appointment_date ? (
                    <>
                      <p className="text-sm font-medium">Appointment scheduled for:</p>
                      <p className="text-sm mt-1">
                        {formatAppointmentDate(call.appointment_date)}
                      </p>
                      {call.lead_stage && (
                        <Badge className="mt-2" variant="outline">
                          {call.lead_stage}
                        </Badge>
                      )}
                    </>
                  ) : call.outcome ? (
                    <>
                      <p className="text-sm">{call.outcome}</p>
                      {call.lead_stage && (
                        <Badge className="mt-2" variant="outline">
                          {call.lead_stage}
                        </Badge>
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

      <Dialog open={!!selectedCall} onOpenChange={(open) => !open && setSelectedCall(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedCall.contact_name}</p>
                    <p><span className="font-medium">Phone:</span> {selectedCall.phone_number}</p>
                    <p><span className="font-medium">Lead Stage:</span> {selectedCall.lead_stage || 'Not set'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Campaign Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Type:</span> {selectedCall.campaigns?.campaign_type}</p>
                    <p><span className="font-medium">Property:</span> {selectedCall.campaigns?.property_details}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Appointment Details</h3>
                {selectedCall.appointment_date ? (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 font-medium">
                      Appointment Confirmed for:
                    </p>
                    <p className="text-green-700 text-lg mt-1">
                      {formatAppointmentDate(selectedCall.appointment_date)}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No appointment scheduled</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Call Outcome</h3>
                <p className="text-muted-foreground">
                  {selectedCall.outcome || 'No outcome recorded'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallTrackingTab;