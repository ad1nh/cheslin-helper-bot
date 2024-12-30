import { supabase } from "@/integrations/supabase/client";
import { LeadStage, getLeadStageColor, LEAD_STAGE_COLORS } from '@/types/lead';

interface CallAnalysisResponse {
  transcripts: Array<{
    user: string;
    text: string;
  }>;
  summary: string;
  status: string;
  appointmentDate?: string | null;
}

const BLAND_AI_API_KEY = 'org_9f11dcaa4abcdf524979dd18ffbd55d11c0267c7e9f8ac1850ac4fafa1abc0e9b53d967a2ecf9d8d884969';

const createLocalISOString = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString();
};

const checkForAppointment = (response: string) => {
  const isPositive = response.toLowerCase().includes('yes') || 
                     response.toLowerCase().includes('sure') ||
                     response.toLowerCase().includes('can i');
  const mentionsAppointment = response.toLowerCase().includes('schedule') || 
                             response.toLowerCase().includes('booking') ||
                             response.toLowerCase().includes('appointment') ||
                             response.toLowerCase().includes('viewing');
  
  return {
    isPositive,
    mentionsAppointment,
    hasAppointment: isPositive && mentionsAppointment
  };
};

export const analyzeBlandAICall = async (callId: string): Promise<CallAnalysisResponse> => {
  console.log("Starting analysis for call:", callId);
  
  let appointmentDate: string | null = null;
  let appointmentConfirmed = false;

  try {
    // First, let's check if we already have this call in our database
    const { data: existingCall } = await supabase
      .from('campaign_calls')
      .select('*')
      .eq('bland_call_id', callId)
      .single();

    if (!existingCall) {
      throw new Error('Call not found');
    }

    const response = await fetch(`https://api.bland.ai/v1/calls/${callId}`, {
      headers: {
        'authorization': BLAND_AI_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch call analysis: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw Bland AI response:", data);

    // Extract appointment details from transcripts
    const userResponses = data.transcripts
      .filter((t: any) => t.user === 'user')
      .map((t: any) => t.text);
    
    console.log("All user responses:", userResponses);

    // Look for appointment time in user responses
    const appointmentTimeRegex = /(\d{1,2})(?:\s+)?(?:pm|am|PM|AM)/;
    
    // Update the date regex to better handle various date formats
    const dateRegex = /(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|October|Oct|November|Nov|December|Dec)(?:\s+)(\d{1,2})(?:st|nd|rd|th)?/i;
    
    // Also look for relative dates like "tomorrow"
    const tomorrowRegex = /tomorrow/i;
    
    // Process each response
    for (const response of userResponses) {
      console.log("\nAnalyzing response:", response);
      
      const dateMatch = response.match(dateRegex);
      const timeMatch = response.match(appointmentTimeRegex);
      
      if (dateMatch && timeMatch) {
        // Create date object
        const date = new Date();
        const year = date.getFullYear();
        const monthName = dateMatch[0].split(' ')[0];
        const day = parseInt(dateMatch[1]);
        
        // Parse time
        let hour = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const isPM = response.toLowerCase().includes('pm');
        
        // Convert to 24-hour format
        if (isPM && hour < 12) {
          hour += 12;
        }
        
        // Set date components
        date.setMonth(new Date(`${monthName} 1, ${year}`).getMonth());
        date.setDate(day);
        date.setHours(hour, minutes, 0, 0);
        
        appointmentDate = date.toISOString();
        appointmentConfirmed = true;

        console.log("Appointment details:", {
          date: date.toLocaleString(),
          isoString: appointmentDate,
          confirmed: appointmentConfirmed
        });
      }
    }

    // Only attempt update if we have an appointment
    if (appointmentConfirmed && appointmentDate) {
      const { error: updateError } = await supabase
        .from('campaign_calls')
        .update({
          appointment_date: appointmentDate,
          outcome: "Appointment scheduled",
          lead_stage: "Warm",
          status: 'completed'
        })
        .eq('bland_call_id', callId);

      if (updateError) {
        console.error("Update error:", updateError);
      }
    }

    return {
      transcripts: data.transcripts,
      summary: data.summary,
      status: data.status,
      appointmentDate
    };
  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
};