import { LeadStage } from './lead';

export interface ClientCampaign {
  id?: string;
  name?: string;
  date: string;
  property_details: string;
  leadStage: LeadStage;
}

export interface ClientInteraction {
  id?: string;
  type: string;
  notes: string;
  created_at: string;
  campaign_id?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastContact: string;
  campaignCount: number;
  campaigns: ClientCampaign[];
  interactions: ClientInteraction[];
  created_at: string;
}

export const transformToClient = (rawData: any): Client => {
  return {
    id: rawData.id,
    name: rawData.contact_name || 'Unknown',
    phone: rawData.phone_number || '-',
    email: rawData.email || '-',
    lastContact: rawData.created_at,
    campaignCount: 1,
    campaigns: rawData.campaigns ? [{
      id: rawData.campaigns.id,
      name: rawData.campaigns.name,
      date: rawData.created_at,
      property_details: rawData.campaigns.property_details || '',
      leadStage: rawData.lead_stage || 'New'
    }] : [],
    interactions: rawData.interactions || [],
    created_at: rawData.created_at
  };
}; 