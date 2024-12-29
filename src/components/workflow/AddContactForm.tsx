import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ContactHistoryDialog } from "@/components/workflow/ContactHistoryDialog";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  propertyInterests: string[];
  priceRange: {
    min: number;
    max: number;
  };
  preferredLocations: string[];
  notes: string;
  campaignCount: number;
}

interface AddContactFormProps {
  onAddContacts: (contacts: Contact[]) => void;
}

interface CampaignCall {
  id: string;
  contact_name: string;
  phone_number: string;
  email: string | null;
  lead_stage: string | null;
  created_at: string;
  campaigns?: {
    name?: string;
    property_details: string | null;
  };
}

const AddContactForm = ({ onAddContacts }: AddContactFormProps) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const { toast } = useToast();
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    priceMin: "",
    priceMax: "",
    location: "",
    propertyType: "",
    notes: "",
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: calls, error } = await supabase
        .from('campaign_calls')
        .select(`
          id,
          contact_name,
          phone_number,
          email,
          lead_stage,
          created_at,
          campaigns (
            id,
            name,
            property_details,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Create a Map to store unique contacts using phone number as key
      const uniqueContacts = new Map();

      ((calls as unknown) as CampaignCall[])?.forEach(call => {
        const key = call.phone_number;
        
        if (!uniqueContacts.has(key)) {
          uniqueContacts.set(key, {
            id: call.id,
            name: call.contact_name,
            email: call.email || '',
            phone: call.phone_number,
            propertyInterests: [call.campaigns?.property_details || ''],
            leadStage: call.lead_stage || 'New',
            lastContact: call.created_at,
            campaignCount: 1,
            campaigns: [{
              name: call.campaigns?.name,
              date: call.created_at,
              property_details: call.campaigns?.property_details || ''
            }]
          });
        } else {
          const existing = uniqueContacts.get(key);
          if (!existing.propertyInterests.includes(call.campaigns?.property_details)) {
            existing.propertyInterests.push(call.campaigns?.property_details || '');
          }
          existing.campaignCount++;
          existing.campaigns.push({
            name: call.campaigns?.name,
            date: call.created_at,
            property_details: call.campaigns?.property_details || ''
          });
        }
      });

      setAvailableContacts(Array.from(uniqueContacts.values()));
    } catch (error) {
      console.error('Error in fetchClients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch existing contacts",
        variant: "destructive",
      });
    }
  };

  const handleNewContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contact: Contact = {
      id: Date.now(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      propertyInterests: [newContact.propertyType],
      priceRange: {
        min: parseInt(newContact.priceMin),
        max: parseInt(newContact.priceMax),
      },
      preferredLocations: [newContact.location],
      notes: newContact.notes,
      campaignCount: 0,
    };
    setSelectedContacts([...selectedContacts, contact]);
    setNewContact({
      name: "",
      email: "",
      phone: "",
      priceMin: "",
      priceMax: "",
      location: "",
      propertyType: "",
      notes: "",
    });
  };

  const handleSubmit = () => {
    onAddContacts(selectedContacts);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Select or Add Contacts</h2>
        <p className="text-gray-600">Choose existing contacts or create new ones for your campaign</p>
      </div>

      <Tabs defaultValue="existing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Existing Contacts</TabsTrigger>
          <TabsTrigger value="new">Add New Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="existing">
          <div className="space-y-4">
            {availableContacts.map((contact, index) => (
              <Card key={contact.id || `item-${index}`} className="p-4">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedContacts.some(c => c.phone === contact.phone)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedContacts([...selectedContacts, contact]);
                      } else {
                        setSelectedContacts(selectedContacts.filter(c => c.phone !== contact.phone));
                      }
                    }}
                  />
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm">{contact.name}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">{contact.phone}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm">{contact.email || '-'}</p>
                    </div>
                    <div>
                      <Label>Property Interests</Label>
                      <Button 
                        variant="ghost" 
                        className="text-sm p-0 h-auto hover:bg-transparent"
                        onClick={() => setSelectedContact(contact)}
                      >
                        {contact.propertyInterests.length > 1 
                          ? `${contact.propertyInterests[0]} +${contact.propertyInterests.length - 1} more`
                          : contact.propertyInterests[0] || '-'}
                      </Button>
                    </div>
                    <div>
                      <Label>Campaign History</Label>
                      <Badge 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setSelectedContact(contact)}
                      >
                        {contact.campaignCount} campaign{contact.campaignCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <form onSubmit={handleNewContactSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input
                    id="location"
                    value={newContact.location}
                    onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceMin">Minimum Price</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    value={newContact.priceMin}
                    onChange={(e) => setNewContact({ ...newContact, priceMin: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceMax">Maximum Price</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    value={newContact.priceMax}
                    onChange={(e) => setNewContact({ ...newContact, priceMax: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type Interest</Label>
                  <Input
                    id="propertyType"
                    value={newContact.propertyType}
                    onChange={(e) => setNewContact({ ...newContact, propertyType: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Add Contact</Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={selectedContacts.length === 0}>
          Continue with {selectedContacts.length} contacts
        </Button>
      </div>

      <ContactHistoryDialog 
        open={!!selectedContact} 
        onOpenChange={(open) => !open && setSelectedContact(null)}
        contact={selectedContact!}
      />
    </div>
  );
};

export default AddContactForm;