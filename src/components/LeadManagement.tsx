import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneCall, Calendar, User } from "lucide-react";
import { useState, useEffect } from "react";
import AddContactDialog from "./AddContactDialog";
import LeadDetailsDialog from "./LeadDetailsDialog";
import { useCallStats } from "@/hooks/useCallStats";
import { supabase } from "@/lib/supabase";
import { LeadStage, getLeadStageColor, LEAD_STAGE_COLORS } from '@/types/lead';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  status: LeadStage;
  phone: string;
  email?: string;
  lastContact: string;
  propertyInterest: string;
  campaigns?: {
    id: string;
    property_details: string;
    property_id?: string;
    properties?: {
      address: string;
    };
  };
}

const transformCallToLead = (call: any): Lead => ({
  id: call.id,
  name: call.contact_name || 'Unknown',
  status: (call.outcome === 'Appointment scheduled' && call.appointment_date) ? 
    'warm' : 
    (call.lead_stage?.toLowerCase() || 'new'),
  phone: call.phone_number || '',
  email: call.email || '-',
  lastContact: format(new Date(call.created_at), 'yyyy-MM-dd, HH:mm'),
  propertyInterest: call.campaigns?.property_details || 'Not specified',
  campaigns: {
    id: call.campaign_id,
    property_details: call.campaigns?.property_details
  }
});

const LeadManagement = () => {
  const { data: stats } = useCallStats();
  const [leads, setLeads] = useState<Lead[]>([]);

  // Update leads when stats change
  useEffect(() => {
    if (stats?.calls) {
      const transformedLeads = stats.calls
        .filter(call => call.status === 'completed')
        .map(transformCallToLead);
      setLeads(transformedLeads);
    }
  }, [stats]);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const getStatusColor = (status: string) => {
    return getLeadStageColor(status);
  };

  const handleAddLead = async (contact: { 
    name: string; 
    phone: string; 
    email: string; 
    status: LeadStage; 
    propertyInterest: string; 
  }) => {
    try {
      const { data, error } = await supabase
        .from('campaign_calls')
        .insert([{
          contact_name: contact.name,
          phone_number: contact.phone,
          lead_stage: contact.status.toUpperCase(),
          status: 'completed',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      const newLead = transformCallToLead(data);
      setLeads(prevLeads => [...prevLeads, newLead]);
    } catch (error) {
      console.error('Error adding lead:', error);
    }
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
          <Card 
            key={lead.id} 
            className="p-4 cursor-pointer hover:bg-muted/50"
            onClick={() => setSelectedLead(lead)}
          >
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

      {selectedLead && (
        <LeadDetailsDialog
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
          lead={selectedLead}
        />
      )}
    </div>
  );
};

export default LeadManagement;