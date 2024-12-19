import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Mail, Home } from "lucide-react";

interface LeadDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: number;
    name: string;
    status: "hot" | "warm" | "cold";
    phone: string;
    lastContact: string;
    propertyInterest: string;
  };
}

const LeadDetailsDialog = ({ open, onOpenChange, lead }: LeadDetailsDialogProps) => {
  // Mock data for demonstration
  const interactions = [
    { id: 1, date: "2024-04-10", type: "Phone Call", notes: "Discussed property requirements" },
    { id: 2, date: "2024-04-08", type: "Email", notes: "Sent property listings" },
  ];

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
                <span>example@email.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>{lead.propertyInterest}</span>
              </div>
              <p>Status: <Badge className={`bg-${lead.status === 'hot' ? 'success' : lead.status === 'warm' ? 'warning' : 'secondary'}`}>
                {lead.status.toUpperCase()}
              </Badge></p>
              <p>Last Contact: {lead.lastContact}</p>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Recent Interactions
            </h3>
            <div className="space-y-2">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="border-b pb-2">
                  <p className="font-medium">{interaction.date} - {interaction.type}</p>
                  <p className="text-sm text-muted-foreground">{interaction.notes}</p>
                </div>
              ))}
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