import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneCall, Calendar, User } from "lucide-react";
import { useState } from "react";
import AddContactDialog from "./AddContactDialog";

interface Lead {
  id: number;
  name: string;
  status: "hot" | "warm" | "cold";
  phone: string;
  lastContact: string;
  propertyInterest: string;
}

const LeadManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 1,
      name: "John Smith",
      status: "hot",
      phone: "+1 (555) 123-4567",
      lastContact: "2024-04-10",
      propertyInterest: "3 bedroom house in downtown",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      status: "warm",
      phone: "+1 (555) 234-5678",
      lastContact: "2024-04-09",
      propertyInterest: "2 bedroom apartment near park",
    },
    {
      id: 3,
      name: "Michael Brown",
      status: "cold",
      phone: "+1 (555) 345-6789",
      lastContact: "2024-04-08",
      propertyInterest: "Luxury condo with ocean view",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot":
        return "bg-success";
      case "warm":
        return "bg-warning";
      case "cold":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  const handleAddLead = (newLead: Omit<Lead, "id" | "lastContact">) => {
    const lead: Lead = {
      ...newLead,
      id: leads.length + 1,
      lastContact: new Date().toISOString().split("T")[0],
    };
    setLeads([...leads, lead]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          {["hot", "warm", "cold"].map((status) => (
            <Card key={status} className="p-4">
              <h3 className="text-lg font-semibold capitalize mb-2">{status} Leads</h3>
              <p className="text-3xl font-bold text-primary">
                {leads.filter((lead) => lead.status === status).length}
              </p>
            </Card>
          ))}
        </div>
        <div className="ml-4">
          <AddContactDialog onAddContact={handleAddLead} type="lead" />
        </div>
      </div>

      <div className="space-y-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <User className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold">{lead.name}</h3>
                  <p className="text-sm text-secondary">{lead.propertyInterest}</p>
                </div>
              </div>
              <Badge className={getStatusColor(lead.status)}>
                {lead.status.toUpperCase()}
              </Badge>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <PhoneCall className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Viewing
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LeadManagement;