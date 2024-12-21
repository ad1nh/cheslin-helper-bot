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

    // Get the date mentioned (23rd December)
    const dateRegex = /(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(January|February|March|April|May|June|July|August|September|October|November|December)/i;
    
    for (const response of userResponses) {
      const dateMatch = response.match(dateRegex);
      const timeMatch = response.match(appointmentTimeRegex);
      
      if (dateMatch && timeMatch) {
        const day = parseInt(dateMatch[1]);
        const month = dateMatch[2];
        const year = new Date().getFullYear();
        
        // Create date object
        const date = new Date(`${month} ${day}, ${year}`);
        
        // Extract time
        let hour = parseInt(timeMatch[1]);
        const period = (timeMatch[3] || '').toLowerCase();
        
        // Convert to 24-hour format if needed
        if (period === 'pm' && hour < 12) {
          hour += 12;
        } else if (period === 'am' && hour === 12) {
          hour = 0;
        }
        
        // Set the time
        date.setHours(hour, 0, 0, 0);
        appointmentDate = date.toISOString();
        console.log("Extracted appointment date and time:", appointmentDate);
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