import { supabase } from "@/integrations/supabase/client";

interface CallAnalysisResponse {
  transcripts: Array<{
    user: string;
    text: string;
  }>;
  summary: string;
  status: string;
}

export const analyzeBlandAICall = async (callId: string): Promise<CallAnalysisResponse> => {
  console.log("Analyzing call:", callId);
  
  try {
    const { data: { BLAND_AI_API_KEY } } = await supabase.functions.invoke('get-secret', {
      body: { name: 'BLAND_AI_API_KEY' },
    });

    if (!BLAND_AI_API_KEY) {
      throw new Error('BLAND_AI_API_KEY not found');
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
    console.log("Call analysis response:", data);

    // Extract appointment details from transcripts
    const userResponses = data.transcripts.filter(t => t.user === 'user').map(t => t.text);
    console.log("User responses:", userResponses);

    // Look for appointment time in user responses
    const appointmentTimeRegex = /(\d{1,2})(?:\s*)?(?::|h|pm|am|PM|AM)?(?:\s*)?([0-9]{2})?(?:\s*)?(pm|am|PM|AM)?/;
    let appointmentDate = null;

    for (const response of userResponses) {
      if (response.toLowerCase().includes('tomorrow') && response.toLowerCase().includes('pm')) {
        // Get tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Extract time from the response
        const match = response.match(appointmentTimeRegex);
        if (match) {
          const hour = parseInt(match[1]);
          tomorrow.setHours(hour + 12); // Add 12 for PM
          tomorrow.setMinutes(0);
          appointmentDate = tomorrow.toISOString();
          console.log("Extracted appointment date:", appointmentDate);
        }
      }
    }

    // Update the campaign call with the analysis results
    const { error: updateError } = await supabase
      .from('campaign_calls')
      .update({
        outcome: data.summary,
        lead_stage: data.summary.toLowerCase().includes('booking a viewing') ? 'Hot' : 'Warm',
        appointment_date: appointmentDate,
        status: 'completed'
      })
      .eq('bland_call_id', callId);

    if (updateError) {
      console.error("Error updating campaign call:", updateError);
      throw updateError;
    }

    return data as CallAnalysisResponse;
  } catch (error) {
    console.error("Error analyzing call:", error);
    throw error;
  }
};