"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Fitness Enthusiast",
    image: "/placeholder-avatar.jpg",
    rating: 5,
    text: "The AI-powered plans have completely transformed my fitness journey. I've lost 15kg in 3 months and feel stronger than ever!",
  },
  {
    name: "Michael Chen",
    role: "Professional Athlete",
    image: "/placeholder-avatar.jpg",
    rating: 5,
    text: "The 24/7 access and expert trainers make this platform unbeatable. The premium equipment is top-notch.",
  },
  {
    name: "Emma Williams",
    role: "Yoga Instructor",
    image: "/placeholder-avatar.jpg",
    rating: 5,
    text: "I love the community aspect and how easy it is to book sessions with trainers. The platform is intuitive and powerful.",
  },
  {
    name: "David Brown",
    role: "Marathon Runner",
    image: "/placeholder-avatar.jpg",
    rating: 5,
    text: "The nutrition plans and progress tracking have helped me achieve my personal best. Highly recommended!",
  },
];

export function PremiumTestimonials() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="accent" className="mb-4">
            Trusted by Thousands
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            What Our Members Say
          </h2>
          <p className="text-lg leading-relaxed text-white/70">
            Join thousands of satisfied members who have transformed their fitness journey with us.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              variant="premium"
              className={cn(
                "group transition-all duration-300 hover:-translate-y-1",
                "hover:bg-white/[0.07]"
              )}
            >
              <CardContent className="pt-6">
                {/* Rating */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-emerald-400 text-emerald-400"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="mb-6 text-white/80 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10" />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-white/60">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
