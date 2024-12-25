// src/hooks/useCallStats.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { LeadStage, getLeadStageColor, LEAD_STAGE_COLORS } from '@/types/lead';

const processLeadStages = (calls: any[]) => {
  // Only process completed calls
  const completedCalls = calls.filter(call => call.status === 'completed');
  
  const stages = {
    'New Lead': completedCalls.filter(call => !call.lead_stage).length,
    'Hot': completedCalls.filter(call => call.lead_stage === 'Hot').length,
    'Warm': completedCalls.filter(call => call.lead_stage === 'Warm').length,
    'Cold': completedCalls.filter(call => call.lead_stage === 'Cold').length,
    'Not Interested': completedCalls.filter(call => call.outcome === 'not interested').length
  };

  const total = Object.values(stages).reduce((sum: number, val: number) => sum + val, 0);

  return Object.entries(stages)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
      percentage: `${((value / (total || 1)) * 100).toFixed(1)}%`,
      color: LEAD_STAGE_COLORS[name.replace(' ', '') as keyof typeof LEAD_STAGE_COLORS] || LEAD_STAGE_COLORS['Cold']
    }));
};

const processAppointmentData = (appointments: any[]) => {
  return appointments.reduce((acc: any[], call) => {
    try {
      const date = new Date(call.appointment_date);
      const weekKey = format(date, 'MMM d');
      
      const existingWeek = acc.find(item => item.date === weekKey);
      if (existingWeek) {
        existingWeek.total += 1;
        existingWeek.color = getLeadStageColor('warm');
      } else {
        acc.push({
          date: weekKey,
          total: 1,
          color: getLeadStageColor('warm'),
        });
      }
    } catch (error) {
      console.error("Error processing appointment date:", error);
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const useCallStats = () => {
  return useQuery({
    queryKey: ["call-stats"],
    queryFn: async () => {
      const { data: calls, error } = await supabase
        .from("campaign_calls")
        .select(`
          *,
          campaigns (
            campaign_type,
            property_details
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const appointments = calls.filter(call => 
        call.outcome === "Appointment scheduled" && call.appointment_date
      );

      return {
        calls,
        total: calls.length,
        connected: calls.filter(call => call.status === 'completed').length,
        callbacks: calls.filter(call => call.outcome === 'callback').length,
        appointments: appointments.length,
        leadTagsData: processLeadStages(calls),
        appointmentData: processAppointmentData(appointments)
      };
    }
  });
};