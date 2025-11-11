"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageSquare
} from "lucide-react";
import { useState } from "react";

interface ContactInfo {
  icon: React.ElementType;
  label: string;
  value: string;
  link?: string;
}

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo: ContactInfo[] = [
    {
      icon: Mail,
      label: "Email",
      value: "info@derrimut247.com.au",
      link: "mailto:info@derrimut247.com.au",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+61 3 9338 7375",
      link: "tel:+61393387375",
    },
    {
      icon: MapPin,
      label: "Head Office",
      value: "8 Louis Street, Airport West VIC 3042",
      link: "https://www.google.com/maps?q=-37.7281,144.8847",
    },
    {
      icon: Clock,
      label: "Hours",
      value: "24/7 Access - All Locations",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Thank you for your message! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card variant="premium">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  const content = (
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                        <Icon className="h-5 w-5 text-white/70" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white/60 mb-1">{info.label}</p>
                        <p className="text-white font-medium">{info.value}</p>
                      </div>
                    </div>
                  );

                  return info.link ? (
                    <a
                      key={index}
                      href={info.link}
                      target={info.link.startsWith("http") ? "_blank" : undefined}
                      rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={index}>{content}</div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Additional Info Card */}
            <Card variant="standard">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-6 w-6 text-white/70 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">Need Immediate Assistance?</h3>
                    <p className="text-white/60 text-sm mb-4">
                      For urgent matters, please call us directly or visit your nearest Derrimut 24:7 Gym location.
                    </p>
                    <Button variant="secondary" asChild>
                      <a href="/">Find a Location</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card variant="premium">
            <CardHeader>
              <CardTitle className="text-white">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}