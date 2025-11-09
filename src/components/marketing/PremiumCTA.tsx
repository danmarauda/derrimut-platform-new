"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function PremiumCTA() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <Badge 
              variant="premium" 
              className="gap-2 px-4 py-2 text-sm font-medium"
            >
              <Sparkles className="h-3 w-3" />
              Ready to Transform?
            </Badge>
          </div>

          {/* Heading */}
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Start Your Fitness Journey Today
          </h2>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/70">
            Join thousands of members who have transformed their lives with our AI-powered platform. 
            Get started in minutes and unlock your full potential.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="primary"
              asChild
              className="group px-8 py-6 text-base font-semibold"
            >
              <Link href="/generate-program">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="px-8 py-6 text-base font-semibold"
            >
              <Link href="/membership">View Pricing</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <span className="text-white/90 font-semibold">No credit card required</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-white/90 font-semibold">Cancel anytime</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-white/90 font-semibold">14-day free trial</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
