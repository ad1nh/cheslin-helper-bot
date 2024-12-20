import { supabase } from "@/integrations/supabase/client";

interface CallAnalysisResponse {
  answers: [string, string, string][];
}

export const analyzeBlandAICall = async (callId: string): Promise<CallAnalysisResponse> => {
  console.log("Analyzing call:", callId);
  
  try {
    const { data: { BLAND_AI_API_KEY } } = await supabase.functions.invoke('get-secret', {
      body: { name: 'BLAND_AI_API_KEY' }
    });

    const response = await fetch(`https://api.bland.ai/v1/calls/${callId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': BLAND_AI_API_KEY,
      },
      body: JSON.stringify({
        goal: "The conversation is between a real estate agent and a lead who may potentially be interested in purchasing a house.",
        questions: [
          [
            "Did the potential buyer request a time to view the property?",
            "Yes or No"
          ],
          [
            "What date and time did the potential buyer book in to view the property?",
            "Provide in a Hour:Minute:DAY:Month (HH:MM:DD:MM) format."
          ],
          [
            "Are there any other action items expressly requested or promised of the real estate agent?",
            "String"
          ]
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze call: ${response.statusText}`);
    }

    const data: CallAnalysisResponse = await response.json();
    console.log("Call analysis response:", data);

    // Parse the viewing time if it exists
    const viewingTimeAnswer = data.answers[0][1]; // Get the first answer's second element
    let appointmentDate = null;
    
    if (viewingTimeAnswer && viewingTimeAnswer.match(/\d{2}:\d{2}:\d{2}:\d{2}/)) {
      const [hours, minutes, day, month] = viewingTimeAnswer.match(/\d{2}:\d{2}:\d{2}:\d{2}/)![0].split(':');
      const year = new Date().getFullYear();
      appointmentDate = `${year}-${month}-${day} ${hours}:${minutes}:00`;
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
      throw updateError;
    }

    console.log("Successfully updated call analysis");
    return data;
  } catch (error) {
    console.error("Error analyzing call:", error);
    throw error;
  }
};