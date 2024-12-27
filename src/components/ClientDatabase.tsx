import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import AddContactDialog from "./AddContactDialog";
import LeadDetailsDialog from "./LeadDetailsDialog";
import { LeadStage, getLeadStageColor, LEAD_STAGE_COLORS } from '@/types/lead';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: "hot" | "warm" | "cold";
  propertyInterest: string;
  lastContact: string;
}

const ClientDatabase = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*');

      if (error) throw error;

      return data.map((client: any) => ({
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email || '',
        status: client.status || 'warm',
        propertyInterest: client.property_interest || '',
        lastContact: client.last_contact || new Date().toISOString().split('T')[0]
      }));
    }
  });

  useEffect(() => {
    if (clientsData) {
      setClients(clientsData);
    }
  }, [clientsData]);

  const getStatusColor = (status: string) => {
    return getLeadStageColor(status);
  };

  const filteredClients = clients.filter((client) =>
    Object.values(client).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddClient = (newClient: any) => {
    const client: Client = {
      ...newClient,
      id: clients.length + 1,
      email: newClient.email || "",
      lastContact: new Date().toISOString().split("T")[0],
    };
    setClients([...clients, client]);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Client Database</h2>
          <p className="text-muted-foreground">Manage and track all your clients</p>
        </div>
        <AddContactDialog onAddContact={handleAddClient} type="client" />
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Property Interest</TableHead>
              <TableHead>Last Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow 
                key={client.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedClient(client)}
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{client.phone}</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(client.status)}>
                    {client.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{client.propertyInterest}</TableCell>
                <TableCell>{client.lastContact}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedClient && (
        <LeadDetailsDialog
          open={!!selectedClient}
          onOpenChange={(open) => !open && setSelectedClient(null)}
          lead={{
            id: selectedClient.id.toString(),
            name: selectedClient.name,
            status: selectedClient.status,
            phone: selectedClient.phone,
            lastContact: selectedClient.lastContact,
            propertyInterest: selectedClient.propertyInterest,
          }}
        />
      )}
    </Card>
  );
};

export default ClientDatabase;

