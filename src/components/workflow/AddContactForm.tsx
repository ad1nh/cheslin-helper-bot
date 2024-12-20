import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  
  // Mock data - in real app, fetch from database
  const availableContacts: Contact[] = [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      phone: "(555) 123-4567",
      propertyInterests: ["123 Main St", "456 Park Ave"],
      priceRange: { min: 300000, max: 500000 },
      preferredLocations: ["Downtown", "Suburbs"],
      notes: "Looking for a family home"
    },
    // Add more mock contacts as needed
  ];

  const handleSubmit = () => {
    onAddContacts(selectedContacts);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Select Contacts</h2>
        <p className="text-gray-600">Choose contacts for your campaign</p>
      </div>

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

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={selectedContacts.length === 0}>
          Continue with {selectedContacts.length} contacts
        </Button>
      </div>
    </div>
  );
};

export default AddContactForm;