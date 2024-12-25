// src/hooks/useCallStats.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

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
    .filter(([_, value]) => value > 0) // Only show non-zero values
    .map(([name, value]) => ({
      name,
      value,
      percentage: `${((value / (total || 1)) * 100).toFixed(1)}%`,
      color: {
        'Hot': '#047857',
        'Warm': '#10B981',
        'Cold': '#6B7280',
        'New Lead': '#3B82F6',
        'Not Interested': '#EF4444'
      }[name]
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
        existingWeek.confirmed = (existingWeek.confirmed || 0) + (call.lead_stage === 'Hot' ? 1 : 0);
        existingWeek.scheduled = (existingWeek.scheduled || 0) + (call.outcome === 'Appointment scheduled' ? 1 : 0);
      } else {
        acc.push({
          date: weekKey,
          total: 1,
          confirmed: call.lead_stage === 'Hot' ? 1 : 0,
          scheduled: call.outcome === 'Appointment scheduled' ? 1 : 0
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