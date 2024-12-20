import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

interface AddContactFormProps {
  onAddContacts: (contacts: Contact[]) => void;
}

const AddContactForm = ({ onAddContacts }: AddContactFormProps) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
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
  
  // Mock data - in real app, fetch from database
  const availableContacts: Contact[] = [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      phone: "(555) 123-4567",
      propertyInterests: ["3 Bedroom House", "Luxury Condo"],
      priceRange: { min: 300000, max: 500000 },
      preferredLocations: ["Downtown", "Suburbs"],
      notes: "Looking for a family home"
    },
    // Add more mock contacts as needed
  ];

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
            {availableContacts.map((contact) => (
              <Card key={contact.id} className="p-4">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedContacts.some(c => c.id === contact.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedContacts([...selectedContacts, contact]);
                      } else {
                        setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
                      }
                    }}
                  />
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm">{contact.name}</p>
                    </div>
                    <div>
                      <Label>Price Range</Label>
                      <p className="text-sm">
                        ${contact.priceRange.min.toLocaleString()} - ${contact.priceRange.max.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label>Locations</Label>
                      <p className="text-sm">{contact.preferredLocations.join(", ")}</p>
                    </div>
                    <div>
                      <Label>Properties</Label>
                      <p className="text-sm">{contact.propertyInterests.join(", ")}</p>
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
    </div>
  );
};

export default AddContactForm;