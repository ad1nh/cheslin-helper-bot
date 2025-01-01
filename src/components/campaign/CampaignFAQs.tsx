import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const faqData = {
  general: [
    {
      question: "What is a campaign in Cheslin?",
      answer: "A campaign in Cheslin is an automated outreach initiative that helps you connect with potential buyers for your properties. It uses AI-powered calls to schedule viewings and qualify leads efficiently."
    },
    {
      question: "How long does a typical campaign run?",
      answer: "A typical campaign runs until it has contacted all selected leads, usually within 24-48 hours. The system makes calls during appropriate hours and handles scheduling automatically."
    },
    {
      question: "What makes a successful campaign?",
      answer: "Successful campaigns typically have well-defined target audiences, clear property details, and quality contact information. We recommend starting with 20-30 contacts for optimal results."
    }
  ],
  setup: [
    {
      question: "How do I set up my first campaign?",
      answer: "Setting up a campaign is simple: Select your campaign type, add contacts, specify property details, and review before deployment. Our step-by-step wizard guides you through the entire process."
    },
    {
      question: "Can I customize the calling schedule?",
      answer: "Currently, calls are automatically scheduled during business hours to maximize response rates. The system intelligently manages call timing to optimize contact success."
    },
    {
      question: "What information do I need to start?",
      answer: "You'll need: Contact details for your leads (name, phone, email), property information, and a campaign name. The more detailed your property information, the better the results."
    }
  ],
  contacts: [
    {
      question: "How many contacts should I include?",
      answer: "We recommend 20-30 contacts per campaign for optimal results. This allows for meaningful data collection while maintaining manageable follow-up activities."
    },
    {
      question: "Can I import contacts from other systems?",
      answer: "Yes, you can manually add contacts or import them from your existing database. Future updates will include direct CRM integrations."
    },
    {
      question: "How are my contacts' data protected?",
      answer: "All contact information is encrypted and stored securely. We comply with data protection regulations and never share contact information with third parties."
    }
  ],
  postCampaign: [
    {
      question: "How do I track campaign results?",
      answer: "Results are available in real-time through the Call Tracking tab. You can monitor appointments scheduled, lead stages, and detailed call outcomes."
    },
    {
      question: "What happens after a viewing is scheduled?",
      answer: "When a viewing is scheduled, it's automatically added to your calendar, and the lead is marked as 'Warm'. You'll receive notifications and can manage all appointments in the Viewing Schedule section."
    },
    {
      question: "Can I export campaign data?",
      answer: "Yes, campaign data can be exported for analysis. This includes call outcomes, appointment schedules, and lead status updates."
    }
  ],
  technical: [
    {
      question: "What happens if a call fails?",
      answer: "The system automatically retries failed calls at optimal times. If a number is consistently unreachable, it's marked for review in your dashboard."
    },
    {
      question: "How does the AI calling system work?",
      answer: "Our AI system uses natural language processing to conduct human-like conversations, handle objections, and schedule viewings. It adapts to responses and maintains professional communication."
    },
    {
      question: "What if I need technical support?",
      answer: "Technical support is available 24/7 through our help center. For urgent issues, you can contact our support team directly through the dashboard."
    }
  ]
};

export function CampaignFAQs() {
  return (
    <Card className="p-6">
      <h2 className="text-3xl font-semibold mb-8">Campaign FAQs</h2>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="text-lg">General</TabsTrigger>
          <TabsTrigger value="setup" className="text-lg">Setup</TabsTrigger>
          <TabsTrigger value="contacts" className="text-lg">Contacts</TabsTrigger>
          <TabsTrigger value="postCampaign" className="text-lg">Post-Campaign</TabsTrigger>
          <TabsTrigger value="technical" className="text-lg">Technical</TabsTrigger>
        </TabsList>

        {Object.entries(faqData).map(([category, questions]) => (
          <TabsContent key={category} value={category}>
            <Accordion type="single" collapsible className="w-full">
              {questions.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
} 