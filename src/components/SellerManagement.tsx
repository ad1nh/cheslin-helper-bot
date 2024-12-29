import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const SellerManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddSeller = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('sellers')
        .insert({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Seller added successfully",
      });
      
      // Reset form
      (e.target as HTMLFormElement).reset();
      
      // Invalidate and refetch sellers query
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    } catch (error) {
      console.error('Error adding seller:', error);
      toast({
        title: "Error",
        description: "Failed to add seller",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Seller</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Seller</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddSeller} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" required />
          </div>
          <Button type="submit" className="w-full">Add Seller</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SellerManagement; 