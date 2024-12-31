import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLeadStageColor } from "@/types/lead";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const { data: calls, isLoading } = useQuery({
    queryKey: ["campaign-calls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_calls")
        .select(`
          *,
          campaign_id,
          campaigns (
            campaign_type,
            property_details
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // console.log("\n=== DATABASE VERIFICATION ===");
      // Log the first few appointments
      data
        .filter(call => call.appointment_date)
        .slice(0, 3)
        .forEach(call => {
          // console.log("Appointment from DB:", {
          //   id: call.id,
          //   rawDate: call.appointment_date,
          //   parsedLocal: new Date(call.appointment_date).toLocaleString(),
          //   parsedUTC: new Date(call.appointment_date).toUTCString()
          // });
        });
      // console.log("============================\n");

      return data;
    },
    refetchInterval: 5000
  });

  const getLeadStage = (call: any) => {
    if (call.outcome === 'Appointment scheduled' && call.appointment_date) {
      return 'Warm';
    }
    if (call.status === 'initiated') {
      return 'Cold';
    }
    return call.lead_stage || 'Cold';
  };

  const getLeadStageVariant = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'hot':
        return 'destructive';
      case 'warm':
        return 'secondary';
      case 'cold':
        return 'outline';
      default:
        return 'default';
    }
  };

  const isRecentCampaignCall = (call: any) => {
    if (!call.campaign_id || !call.created_at) return false;
    
    // Find the most recent campaign_id
    const mostRecentCampaignId = calls
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())?.[0]?.campaign_id;
      
    return call.campaign_id === mostRecentCampaignId;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Call Tracking</h2>
            <p className="text-muted-foreground">Monitor and manage your campaign calls</p>
          </div>
        </div>

        {isRecentCampaignCall(calls?.[0]) && calls?.[0]?.outcome === "Appointment scheduled" && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="font-medium text-green-800">
                  New Appointments Scheduled!
                </h3>
                <p className="text-green-700">
                  Your recent campaign has scheduled new appointments
                </p>
              </div>
              <Button
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-100"
                onClick={() => {
                  navigate('/dashboard', { state: { defaultTab: 'Call Tracking' }});
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Outcome</TableCell>
                <TableCell>Lead Stage</TableCell>
                <TableCell>Appointment</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls?.map((call) => (
                <TableRow 
                  key={call.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    isRecentCampaignCall(call) && "bg-blue-50 dark:bg-blue-950/20"
                  )}
                  onClick={() => {
                    console.log("Selected call data:", call);
                    setSelectedCall(call);
                  }}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{call.contact_name}</div>
                      <div className="text-sm text-muted-foreground">{call.phone_number}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                      {call.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{call.outcome || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getLeadStageColor(getLeadStage(call))}>
                      {getLeadStage(call)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {call.appointment_date ? (
                      <div>
                        {(() => {
                          const date = parseISO(call.appointment_date);
                          // console.log("\n=== FRONTEND DISPLAY VERIFICATION ===");
                          // console.log("Rendering appointment:", {
                          //   id: call.id,
                          //   rawDate: call.appointment_date,
                          //   parsedLocal: date.toLocaleString(),
                          //   formattedDisplay: format(date, 'PPp')
                          // });
                          // console.log("===================================\n");
                          return format(date, 'PPp');
                        })()}
                      </div>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedCall.contact_name}</p>
                  <p><span className="font-medium">Phone:</span> {selectedCall.phone_number}</p>
                  <p><span className="font-medium">Lead Stage:</span> {selectedCall.lead_stage || 'Not set'}</p>
                  <p><span className="font-medium">Appointment:</span> {
                    selectedCall.appointment_date ? 
                    format(parseISO(selectedCall.appointment_date), 'PPp') : 
                    'Not scheduled'
                  }</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CallTrackingTab;