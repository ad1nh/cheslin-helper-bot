export type LeadStage = 'Hot' | 'Warm' | 'Cold' | 'New';

export const LEAD_STAGE_COLORS = {
  Hot: '#047857',    // emerald-700
  Warm: '#f59e0b',   // amber-500
  Cold: '#6b7280',   // gray-500
  New: '#3b82f6'     // blue-500
} as const;

export const getLeadStageColor = (stage: LeadStage | string | null) => {
  const normalizedStage = (stage || 'New').toLowerCase();
  switch (normalizedStage) {
    case 'hot':
      return 'bg-emerald-700';
    case 'warm':
      return 'bg-amber-500';
    case 'cold':
      return 'bg-gray-500';
    default:
      return 'bg-blue-500';
  }
};

export interface Lead {
  id: string;
  name: string;
  status: LeadStage;
  phone: string;
  email?: string;
  lastContact: string;
  propertyInterest: string;
  campaigns?: {
    property_details: string;
  };
  created_at?: string;
}
