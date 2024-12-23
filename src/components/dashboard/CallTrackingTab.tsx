import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
                  className="cursor-pointer hover:bg-muted/50"
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
                  <TableCell>{call.lead_stage || '-'}</TableCell>
                  <TableCell>
                    {call.appointment_date ? 
                      format(parseISO(call.appointment_date), 'PPp') : 
                      '-'
                    }
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