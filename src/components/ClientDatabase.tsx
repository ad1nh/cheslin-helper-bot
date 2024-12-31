import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import AddContactDialog from "./AddContactDialog";
import { Client, transformToClient } from "@/types/client";
import { ExpandableClientCard } from "./ExpandableClientCard";

export function ClientDatabase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  const { data: clientsData = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_calls")
        .select(`
          *,
          campaigns (
            id,
            name,
            property_details,
            created_at
          ),
          interactions (
            id,
            type,
            notes,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Create a Map to store unique clients using phone number as key
      const uniqueClients = new Map<string, Client>();

      data?.forEach(rawClient => {
        const client = transformToClient(rawClient);
        const key = client.phone;
        
        if (!uniqueClients.has(key)) {
          uniqueClients.set(key, client);
        } else {
          const existing = uniqueClients.get(key)!;
          existing.campaignCount++;
          if (client.campaigns.length > 0) {
            existing.campaigns = [...existing.campaigns, ...client.campaigns];
          }
          if (client.interactions.length > 0) {
            existing.interactions = [...existing.interactions, ...client.interactions];
          }
          // Update lastContact if this entry is more recent
          if (new Date(client.lastContact) > new Date(existing.lastContact)) {
            existing.lastContact = client.lastContact;
          }
        }
      });

      return Array.from(uniqueClients.values());
    }
  });

  // Basic search functionality
  const filteredClients = clientsData.filter((client) =>
    Object.values(client).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Client Database</h2>
          <p className="text-muted-foreground">Manage and track all your clients</p>
        </div>
        <AddContactDialog type="client" onAddContact={() => {}} />
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* We'll add the client cards here in the next step */}
      <div className="space-y-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          filteredClients.map((client) => (
            <ExpandableClientCard
              key={client.id}
              client={client}
              onOpenChange={(open) => setExpandedClientId(open ? client.id : null)}
            />
          ))
        )}
      </div>
    </Card>
  );
}

export default ClientDatabase;

