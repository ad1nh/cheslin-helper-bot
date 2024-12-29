import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import PropertyDetailsDialog from "./PropertyDetailsDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface Property {
  id: string;
  address: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  status: "available" | "under-contract" | "sold";
  seller_id: string;
  interested_buyers?: string[];
  created_at: string;
}

interface Seller {
  id: string;
  name: string;
  phone: string;
}

const PropertyDatabase = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  const { data: properties = [], refetch } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const [sellers] = useState<Seller[]>([
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      phone: "+1 (555) 123-4567",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success";
      case "under-contract":
        return "bg-warning";
      case "sold":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  const handleAddProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const sellerId = formData.get("seller") as string;
      if (!sellerId) throw new Error("Seller ID is required");

      const { data, error } = await supabase
        .from('properties')
        .insert({
          address: formData.get("address") as string,
          price: Number(formData.get("price")),
          type: formData.get("type") as string,
          bedrooms: Number(formData.get("bedrooms")),
          bathrooms: Number(formData.get("bathrooms")),
          status: "available",
          seller_id: sellerId
        })
        .select()
        .single();

      if (error) throw error;

      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Property added successfully",
      });
      refetch();
    } catch (error) {
      console.error('Error adding property:', error);
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      });
    }
  };

  const filteredProperties = properties.filter((property) =>
    Object.values(property).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Property Database</h2>
          <p className="text-muted-foreground">Manage all properties and their relationships</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">Add New Property</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Input id="type" name="type" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input id="bedrooms" name="bedrooms" type="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input id="bathrooms" name="bathrooms" type="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller">Seller</Label>
                <Select name="seller" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seller" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id.toString()}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Add Property</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Interested Buyers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.map((property) => (
              <TableRow 
                key={property.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedProperty(property)}
              >
                <TableCell className="font-medium">{property.address}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{property.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {property.bedrooms} beds, {property.bathrooms} baths
                    </div>
                  </div>
                </TableCell>
                <TableCell>${property.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(property.status)}>
                    {property.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {sellers.find(s => s.id === property.seller_id)?.name}
                </TableCell>
                <TableCell>{property.interested_buyers?.length} buyers</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedProperty && (
        <PropertyDetailsDialog
          open={!!selectedProperty}
          onOpenChange={(open) => !open && setSelectedProperty(null)}
          property={{
            ...selectedProperty,
            seller_id: selectedProperty.seller_id,
            interested_buyers: selectedProperty.interested_buyers || []
          }}
          seller={sellers.find(s => s.id === selectedProperty.seller_id) || {
            id: '',
            name: 'Unknown',
            phone: 'N/A'
          }}
        />
      )}
    </Card>
  );
};

export default PropertyDatabase;