import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LeadStage } from "@/types/lead";

interface Contact {
  name: string;
  phone: string;
  propertyInterest?: string;
  status: "hot" | "warm" | "cold";
}

interface AddContactDialogProps {
  type: "lead" | "client";
  onAddContact: (contact: {
    name: string;
    phone: string;
    email: string;
    status: LeadStage;
    propertyInterest: string;
  }) => void;
}

const AddContactDialog = ({ onAddContact, type }: AddContactDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyInterest, setPropertyInterest] = useState("");
  const [status, setStatus] = useState<LeadStage>("Warm");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const getTypeLabel = (type: "lead" | "client") => {
    return type === "lead" ? "Lead" : "Client";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name,
          phone,
          email,
          property_interest: propertyInterest,
          status,
          last_contact: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      onAddContact({
        name,
        phone,
        email,
        propertyInterest,
        status,
      });

      setName("");
      setPhone("");
      setPropertyInterest("");
      setStatus("Warm");
      setEmail("");
      setOpen(false);

      toast({
        title: "Success",
        description: `${getTypeLabel(type)} added successfully`,
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New {getTypeLabel(type)}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New {getTypeLabel(type)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyInterest">Property Interest</Label>
            <Input
              id="propertyInterest"
              value={propertyInterest}
              onChange={(e) => setPropertyInterest(e.target.value)}
              placeholder="3 bedroom house in downtown"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: LeadStage) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hot">Hot</SelectItem>
                <SelectItem value="Warm">Warm</SelectItem>
                <SelectItem value="Cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">Add Contact</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactDialog;