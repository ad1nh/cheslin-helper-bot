import { supabase } from "@/integrations/supabase/client";

interface CallAnalysisResponse {
  answers: Array<[string, string, string]>;
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

    // Parse the viewing time if it exists
    const viewingTimeAnswer = data.answers[0][1]; // Get the first answer's second element
    let appointmentDate = null;
    
    if (viewingTimeAnswer && viewingTimeAnswer.match(/\d{2}:\d{2}:\d{2}:\d{2}/)) {
      appointmentDate = viewingTimeAnswer;
    }

    // Update the campaign call with the analysis results
    const { error: updateError } = await supabase
      .from('campaign_calls')
      .update({
        outcome: JSON.stringify(data.answers[0]),
        lead_stage: data.answers[0][0].toLowerCase().includes('yes') ? 'Hot' : 'Warm',
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