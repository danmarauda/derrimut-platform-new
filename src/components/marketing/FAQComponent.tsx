"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQComponentProps {
  title?: string;
  description?: string;
  items: FAQItem[];
}

export function FAQComponent({ 
  title = "Frequently Asked Questions",
  description = "Find answers to common questions about our platform",
  items 
}: FAQComponentProps) {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-white mb-3 tracking-tight">
          {title}
        </h2>
        <p className="text-white/60 text-lg">
          {description}
        </p>
      </div>

      <Card variant="premium" className="w-full">
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-white/10 last:border-b-0 px-6"
              >
                <AccordionTrigger className="text-left text-white hover:text-white/80 py-6">
                  <span className="font-medium text-lg">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-white/70 pb-6 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

// Default FAQ items for Derrimut
export const defaultFAQItems: FAQItem[] = [
  {
    question: "What membership plans are available?",
    answer: "We offer three membership tiers: Basic ($29/month) for gym access and basic programs, Premium ($49/month) for AI-powered plans and priority booking, and Elite ($79/month) for personal training and custom meal plans.",
  },
  {
    question: "How does the AI program generation work?",
    answer: "Our AI analyzes your fitness goals, current level, and preferences to create personalized workout and nutrition plans. Simply fill out our questionnaire, and you'll receive a customized program within minutes.",
  },
  {
    question: "Can I book sessions with trainers?",
    answer: "Yes! Premium and Elite members can book sessions with our certified trainers. Browse trainer profiles, check availability, and book sessions directly through the platform.",
  },
  {
    question: "Are all locations open 24/7?",
    answer: "Yes, all Derrimut 24:7 Gym locations across Australia are open 24 hours a day, 7 days a week. Access your local gym anytime with your membership card.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and digital payment methods through our secure Stripe integration. All transactions are encrypted and secure.",
  },
  {
    question: "Can I cancel my membership anytime?",
    answer: "Yes, you can cancel your membership at any time through your account settings. There are no long-term contracts or cancellation fees.",
  },
];