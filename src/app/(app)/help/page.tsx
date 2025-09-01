
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

const faqs = [
    {
        question: "How do I make a contribution?",
        answer: "Navigate to the 'My Contributions' page and click on the 'New Contribution' button. Follow the on-screen instructions to complete your payment."
    },
    {
        question: "How long does it take for a loan to be approved?",
        answer: "Loan requests are typically reviewed by administrators within 2-3 business days. You will be notified of the decision via email and on your dashboard."
    },
    {
        question: "Can I change my group after registration?",
        answer: "Changing groups requires administrative approval. Please contact support with your request, and they will guide you through the process."
    },
    {
        question: "What happens if I miss a loan repayment?",
        answer: "Missing a loan repayment may incur penalties and affect your eligibility for future loans. Please contact our support team immediately if you anticipate difficulties in making a payment."
    },
    {
        question: "How do I update my personal information?",
        answer: "You can update your personal details, such as your address or phone number, in the 'Settings' page under the 'Profile' tab."
    }
];

export default function HelpPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Help & Support</h1>
                <p className="text-muted-foreground">Find answers to common questions or get in touch with our support team.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                             <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>{faq.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-primary mt-1"/>
                        <div>
                            <h3 className="font-semibold">Phone Support</h3>
                            <p className="text-muted-foreground">Our team is available from 9am to 5pm, Monday to Friday.</p>
                            <a href="tel:+233123456789" className="text-primary hover:underline">+233 12 345 6789</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Mail className="h-6 w-6 text-primary mt-1"/>
                        <div>
                            <h3 className="font-semibold">Email Support</h3>
                            <p className="text-muted-foreground">Send us an email and we'll get back to you within 24 hours.</p>
                            <a href="mailto:support@susu.bank" className="text-primary hover:underline">support@susu.bank</a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
