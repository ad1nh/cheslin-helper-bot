import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface ContactHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: {
    name: string;
    propertyInterests: string[];
    campaignCount: number;
    campaigns?: Array<{
      name?: string;
      date: string;
      property_details: string;
    }>;
  } | null;
}

export function ContactHistoryDialog({ open, onOpenChange, contact }: ContactHistoryDialogProps) {
  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{contact.name}'s History</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="properties">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Property Interests</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {contact.propertyInterests.map((property, index) => (
                <div key={index} className="mb-4 p-3 bg-muted rounded-lg">
                  <p>{property}</p>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="campaigns">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {contact.campaigns?.map((campaign, index) => (
                <div key={index} className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{campaign.name || 'Unnamed Campaign'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(campaign.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className="text-sm mt-1">{campaign.property_details}</p>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 