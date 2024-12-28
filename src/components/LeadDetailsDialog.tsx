import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Mail, Home } from "lucide-react";
import { getLeadStageColor, LeadStage } from "@/types/lead";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";

interface Interaction {
  id: string;
  date: string;
  type: string;
  notes: string;
}

interface LeadDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    name: string;
    status: LeadStage;
    phone: string;
    email?: string;
    lastContact: string;
    propertyInterest: string;
  };
}

const LeadDetailsDialog = ({ open, onOpenChange, lead }: LeadDetailsDialogProps) => {
  const { data: interactions = [] } = useQuery({
    queryKey: ["interactions", lead.id],
    queryFn: async () => {
      console.log("Fetching interactions for lead:", lead.id);
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('client_id', lead.id)
        .order('created_at', { ascending: false });

      console.log("Interactions query result:", { data, error });

      if (error) throw error;
      return data.map((interaction: any) => ({
        id: interaction.id,
        date: format(new Date(interaction.created_at), 'yyyy-MM-dd'),
        type: interaction.type,
        notes: interaction.notes
      }));
    }
  });

  const viewings = [
    { id: 1, date: "2024-04-15", property: "123 Main St", status: "Scheduled" },
    { id: 2, date: "2024-04-05", property: "456 Park Ave", status: "Completed" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{lead.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{lead.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{lead.email || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>{lead.propertyInterest}</span>
              </div>
              <div>
                Status: <Badge className={getLeadStageColor(lead.status)}>
                  {lead.status.toUpperCase()}
                </Badge>
              </div>
              <div>Last Contact: {lead.lastContact}</div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Recent Interactions
            </h3>
            <div className="space-y-2">
              {interactions.length > 0 ? (
                interactions.map((interaction) => (
                  <div key={interaction.id} className="border-b pb-2">
                    <p className="font-medium">{interaction.date} - {interaction.type}</p>
                    <p className="text-sm text-muted-foreground">{interaction.notes}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent interactions</p>
              )}
            </div>
          </Card>

          <Card className="p-4 col-span-2">
            <h3 className="font-semibold mb-2">Property Viewings</h3>
            <div className="space-y-2">
              {viewings.map((viewing) => (
                <div key={viewing.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{viewing.property}</p>
                    <p className="text-sm text-muted-foreground">{viewing.date}</p>
                  </div>
                  <Badge>{viewing.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsDialog;