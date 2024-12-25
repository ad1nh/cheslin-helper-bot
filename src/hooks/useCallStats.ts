// src/hooks/useCallStats.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const processLeadStages = (calls: any[]) => {
  const appointmentCalls = calls.filter(call => 
    call.outcome === "Appointment scheduled" && call.appointment_date
  );

  const leadStages = appointmentCalls.reduce((acc: any, call) => {
    if (call.lead_stage) {
      acc[call.lead_stage] = (acc[call.lead_stage] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(leadStages).map(([name, value]) => ({
    name,
    value,
    percentage: `${((Number(value) / appointmentCalls.length) * 100).toFixed(1)}%`,
    color: name === 'Hot' ? '#047857' : name === 'Warm' ? '#10B981' : '#E5E7EB',
  }));
};

const processAppointmentData = (appointments: any[]) => {
  return appointments.reduce((acc: any[], call) => {
    try {
      const date = new Date(call.appointment_date);
      const dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
      
      const existingDate = acc.find(item => item.date === dateKey);
      if (existingDate) {
        existingDate.interested += 1;
        if (call.lead_stage === 'Hot') existingDate.hot += 1;
      } else {
        acc.push({
          date: dateKey,
          interested: 1,
          hot: call.lead_stage === 'Hot' ? 1 : 0
        });
      }
    } catch (error) {
      console.error("Error processing appointment date:", error);
    }
    return acc;
  }, []);
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

      const total = calls.length;
      const connected = calls.filter(call => call.status === 'completed').length;
      const callbacks = calls.filter(call => call.outcome === 'callback').length;
      const appointments = calls.filter(call => 
        call.outcome === "Appointment scheduled" && call.appointment_date
      );

      return {
        calls,
        total,
        connected,
        callbacks,
        appointments: appointments.length,
        leadTagsData: processLeadStages(calls),
        appointmentData: processAppointmentData(appointments)
      };
    }
  });
};