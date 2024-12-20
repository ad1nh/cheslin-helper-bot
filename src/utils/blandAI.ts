import { supabase } from "@/integrations/supabase/client";

interface BlandAICallParams {
  phoneNumber: string;
  campaignType: string;
  propertyDetails?: string;
  contactName?: string;
}

export const makeBlandAICall = async ({ phoneNumber, campaignType, propertyDetails, contactName }: BlandAICallParams) => {
  if (!campaignType) {
    throw new Error("Campaign type is required");
  }

  let task = "";
  
  if (campaignType === "Solicit Buyers") {
    task = `You are a real estate agent named Cheslin. You are managing the sale of a house and calling people who you know have been looking for a house in the past and may be interested in it. Introduce yourself, describe the house and gauge their interest in booking a viewing. Details about the house: ${propertyDetails || "a beautiful property that matches your criteria"}`;
  } else if (campaignType === "Follow Up from Open House") {
    task = `You are a real estate agent named Cheslin. The person you are calling recently attended an open house and you are calling to hear their thoughts about it and offer to book a time to make an offer. Some information about the person you are calling is: ${contactName || "a potential buyer"}. Additional relevant details are ${propertyDetails || "from your recent open house visit"}`;
  } else {
    throw new Error("Invalid campaign type");
  }

  console.log("Making Bland AI call with task:", task);

  const { data: { BLAND_AI_API_KEY } } = await supabase.functions.invoke('get-secret', {
    body: { name: 'BLAND_AI_API_KEY' }
  });

  const headers = {
    'Authorization': BLAND_AI_API_KEY,
    'x-bland-org-id': '27eb107b-389d-4206-b7be-643adeb33ce6',
    'Content-Type': 'application/json',
  };

  const data = {
    phone_number: phoneNumber,
    task: task,
    voice: "nat",
  };

  try {
    const response = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Bland AI API error:', errorData);
      throw new Error(`Failed to initiate call: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error making Bland AI call:', error);
    throw error;
  }
};