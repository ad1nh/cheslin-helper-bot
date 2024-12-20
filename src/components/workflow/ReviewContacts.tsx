import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface ReviewContactsProps {
  contacts: Contact[];
  onNext: () => void;
}

const ReviewContacts = ({ contacts, onNext }: ReviewContactsProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Review Selected Contacts</h2>
        <p className="text-gray-600">
          {contacts.length} contacts selected for your campaign
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Contact Overview</h3>
          <div className="space-y-2">
            <p>Total Contacts: {contacts.length}</p>
            <p>
              Average Price Range: $
              {(contacts.reduce((acc, contact) => 
                acc + (contact.priceRange.min + contact.priceRange.max) / 2, 0
              ) / contacts.length).toLocaleString()}
            </p>
            <p>
              Popular Locations:{" "}
              {Array.from(
                new Set(
                  contacts.flatMap((contact) => contact.preferredLocations)
                )
              ).join(", ")}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Property Interests</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              new Set(
                contacts.flatMap((contact) => contact.propertyInterests)
              )
            ).map((property) => (
              <Badge key={property} variant="secondary">
                {property}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4 mt-6">
        <h3 className="font-semibold">Contact Details</h3>
        {contacts.map((contact) => (
          <Card key={contact.id} className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.email}</p>
              </div>
              <div>
                <p className="text-sm">Price Range:</p>
                <p className="text-sm text-gray-600">
                  ${contact.priceRange.min.toLocaleString()} - ${contact.priceRange.max.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm">Locations:</p>
                <p className="text-sm text-gray-600">
                  {contact.preferredLocations.join(", ")}
                </p>
              </div>
              <div>
                <p className="text-sm">Properties:</p>
                <p className="text-sm text-gray-600">
                  {contact.propertyInterests.join(", ")}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onNext}>
          Continue to Campaign Setup
        </Button>
      </div>
    </div>
  );
};

export default ReviewContacts;