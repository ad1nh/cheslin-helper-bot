import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import AddContactDialog from "./AddContactDialog";
import LeadDetailsDialog from "./LeadDetailsDialog";

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
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: "John Smith",
      phone: "+1 (555) 123-4567",
      email: "john.smith@email.com",
      status: "hot",
      propertyInterest: "3 bedroom house in downtown",
      lastContact: "2024-04-10",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      phone: "+1 (555) 234-5678",
      email: "sarah.j@email.com",
      status: "warm",
      propertyInterest: "2 bedroom apartment near park",
      lastContact: "2024-04-09",
    },
    {
      id: 3,
      name: "Michael Brown",
      phone: "+1 (555) 345-6789",
      email: "michael.b@email.com",
      status: "cold",
      propertyInterest: "Luxury condo with ocean view",
      lastContact: "2024-04-08",
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
            id: selectedClient.id,
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

