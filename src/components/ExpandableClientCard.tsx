import { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Client } from "@/types/client";
import { getLeadStageColor } from "@/types/lead";

interface ExpandableClientCardProps {
  client: Client;
  onOpenChange: (open: boolean) => void;
}

export function ExpandableClientCard({ client, onOpenChange }: ExpandableClientCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    onOpenChange(!isExpanded);
  };

  return (
    <Card className="overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-4 gap-4 flex-1">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{client.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Contact</Label>
              <div className="space-y-1">
                <p className="text-sm">{client.phone}</p>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Latest Status</Label>
              <div className="mt-1.5">
                <Badge className={getLeadStageColor(client.campaigns[0]?.leadStage || 'New')}>
                  {client.campaigns[0]?.leadStage || 'New'}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Campaign History</Label>
              <div className="mt-1.5">
                <Badge variant="secondary">
                  {client.campaignCount} campaign{client.campaignCount !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
          <div className="ml-4">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t">
          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="campaigns">Campaign History</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="campaigns">
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {client.campaigns.map((campaign, index) => (
                  <div key={index} className="mb-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{campaign.name || 'Unnamed Campaign'}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getLeadStageColor(campaign.leadStage)}>
                          {campaign.leadStage}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(campaign.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mt-1">{campaign.property_details}</p>
                  </div>
                ))}
                {client.campaigns.length === 0 && (
                  <p className="text-center text-muted-foreground">No campaign history</p>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="interactions">
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {client.interactions.map((interaction, index) => (
                  <div key={index} className="mb-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{interaction.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(interaction.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <p className="text-sm mt-1">{interaction.notes}</p>
                  </div>
                ))}
                {client.interactions.length === 0 && (
                  <p className="text-center text-muted-foreground">No interaction history</p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  );
} 