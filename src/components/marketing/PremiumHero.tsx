"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { DERRIMUT_BRAND } from "@/constants/branding";

export function PremiumHero() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-950/95 to-neutral-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <Badge 
              variant="premium" 
              className="gap-2 px-4 py-2 text-sm font-medium"
            >
              <Sparkles className="h-3 w-3" />
              AI-Powered Fitness Platform
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Transform Your Fitness Journey
            <span className="block mt-2 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              With AI-Powered Precision
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
            {DERRIMUT_BRAND.tagline} - Join Australia's premier 24/7 fitness platform with 
            personalized AI plans, expert trainers, and premium facilities.
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
              <Link href="/membership">View Plans</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <span className="text-white/90 font-medium">24/7</span>
              <span>Access</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-white/90 font-medium">30+</span>
              <span>Expert Trainers</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-white/90 font-medium">AI</span>
              <span>Powered Plans</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
