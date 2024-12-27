import { supabase } from "@/integrations/supabase/client";
import { LeadStage, getLeadStageColor, LEAD_STAGE_COLORS } from '@/types/lead';

interface CallAnalysisResponse {
  transcripts: Array<{
    user: string;
    text: string;
  }>;
  summary: string;
  status: string;
}

const BLAND_AI_API_KEY = 'org_9f11dcaa4abcdf524979dd18ffbd55d11c0267c7e9f8ac1850ac4fafa1abc0e9b53d967a2ecf9d8d884969';

export const analyzeBlandAICall = async (callId: string): Promise<CallAnalysisResponse> => {
  console.log("Starting analysis for call:", callId);
  
  try {
    // First, let's check if we already have this call in our database
    const { data: existingCall } = await supabase
      .from('campaign_calls')
      .select('*')
      .eq('bland_call_id', callId)
      .single();

    console.log("Existing call data:", existingCall);

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
    const appointmentTimeRegex = /(\d{1,2})(?:\s*)?(?::|h|pm|am|PM|AM)?(?:\s*)?([0-9]{2})?(?:\s*)?(pm|am|PM|AM)?/;
    let appointmentDate = null;

    // Get the date mentioned (23rd December)
    const dateRegex = /(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(January|February|March|April|May|June|July|August|September|October|November|December)/i;
    
    // Also look for relative dates like "tomorrow"
    const tomorrowRegex = /tomorrow/i;
    
    for (const response of userResponses) {
      console.log("\nAnalyzing response:", response);
      
      // Check for specific date mention
      const dateMatch = response.match(dateRegex);
      const timeMatch = response.match(appointmentTimeRegex);
      const tomorrowMatch = response.match(tomorrowRegex);
      
      console.log("Regex matches:", {
        dateMatch,
        timeMatch,
        tomorrowMatch
      });
      
      if (dateMatch && timeMatch) {
        console.log("Found specific date and time match");
        const day = parseInt(dateMatch[1]);
        const month = dateMatch[2];
        const year = new Date().getFullYear();
        
        // Create date object
        const date = new Date(`${month} ${day}, ${year}`);
        console.log("Created date object:", date);
        
        // Extract time
        let hour = parseInt(timeMatch[1]);
        const period = (timeMatch[3] || '').toLowerCase();
        
        // Convert to 24-hour format if needed
        if (period === 'pm' && hour < 12) {
          hour += 12;
        } else if (period === 'am' && hour === 12) {
          hour = 0;
        }
        
        console.log("Calculated hour:", hour);
        
        // Set the time
        date.setHours(hour, 0, 0, 0);
        appointmentDate = date.toISOString();
        console.log("Set final appointment date:", appointmentDate);
      } else if (tomorrowMatch && timeMatch) {
        console.log("Found tomorrow with time");
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let hour = parseInt(timeMatch[1]);
        const period = (timeMatch[3] || '').toLowerCase();
        
        if (period === 'pm' && hour < 12) {
          hour += 12;
        } else if (period === 'am' && hour === 12) {
          hour = 0;
        }
        
        console.log("Calculated hour for tomorrow:", hour);
        
        tomorrow.setHours(hour, 0, 0, 0);
        appointmentDate = tomorrow.toISOString();
        console.log("Set final appointment date for tomorrow:", appointmentDate);
      }
    }

    // Check if there's general interest in booking
    const hasBookingInterest = userResponses.some(response => 
      response.toLowerCase().includes('interested') || 
      response.toLowerCase().includes('would like to') ||
      response.toLowerCase().includes('want to see')
    );

    // Check if we found an appointment in the conversation
    const hasAppointment = userResponses.some(response => {
      const isPositive = response.toLowerCase().includes('yes');
      const mentionsAppointment = 
        response.toLowerCase().includes('appointment') || 
        response.toLowerCase().includes('viewing') ||
        response.toLowerCase().includes('see the property');
      
      console.log("Checking response for appointment confirmation:", {
        response,
        isPositive,
        mentionsAppointment
      });
      
      return isPositive && mentionsAppointment;
    });

    console.log("Final analysis results:", {
      hasAppointment,
      appointmentDate,
      callId
    });

    const determineLeadStage = (hasAppointment: boolean, hasInterest: boolean): LeadStage => {
      if (hasAppointment) return 'Hot';
      if (hasInterest) return 'Warm';
      return 'Cold';
    };

    const leadStage = determineLeadStage(hasAppointment, hasBookingInterest);

    // Update the campaign call with the analysis results
    const { data: updatedCall, error: updateError } = await supabase
      .from('campaign_calls')
      .update({
        outcome: hasAppointment ? "Appointment scheduled" : data.summary,
        lead_stage: hasAppointment ? "Warm" : leadStage,
        appointment_date: appointmentDate ? new Date(appointmentDate).toISOString() : null,
        status: 'completed'
      })
      .eq('bland_call_id', callId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Error updating campaign call:", updateError);
      console.warn("Continuing despite update error");
    }

    console.log("Successfully updated campaign call:", updatedCall);

    console.log("Updating campaign call with:", {
      outcome: hasAppointment ? "Appointment scheduled" : data.summary,
      lead_stage: hasAppointment ? "Warm" : leadStage,
      appointment_date: appointmentDate,
      status: 'completed'
    });

    return data as CallAnalysisResponse;
  } catch (error) {
    console.error("Error analyzing call:", error);
    throw error;
  }
};