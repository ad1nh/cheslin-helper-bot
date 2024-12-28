import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface PropertySelectionProps {
  onSelect: (propertyId: string, address: string) => void;
  onNext: () => void;
}

const PropertySelection = ({ onSelect, onNext }: PropertySelectionProps) => {
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

  const handleAddProperty = async (formData: any) => {
    const { data, error } = await supabase
      .from('properties')
      .insert({
        address: formData.address,
        price: parseInt(formData.price),
        type: formData.type,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        status: formData.status || 'available',
        seller_id: formData.sellerId
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      });
      console.error('Error adding property:', error);
      return;
    }

    toast({
      title: "Success",
      description: "Property added successfully",
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Property</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties?.map((property) => (
          <Card
            key={property.id}
            className="p-4 cursor-pointer hover:bg-muted/50"
            onClick={() => {
              onSelect(property.id, property.address);
              onNext();
            }}
          >
            <h3 className="font-medium">{property.address}</h3>
            <p className="text-sm text-muted-foreground">
              {property.bedrooms} bed • {property.bathrooms} bath • {property.type}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PropertySelection; 