"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon, MessageCircle, Brain, Users, ShoppingCart, BookOpen, Heart, Crown, Dumbbell, Calendar, Star, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import GymLocationsSection from "@/components/GymLocationsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DERRIMUT_BRAND } from "@/constants/branding";
import { PremiumHero, PremiumFeatures, PremiumPricing, PremiumTestimonials, PremiumCTA } from "@/components/marketing";

const HomePage = () => {
  return (
    <div
      className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background"
      suppressHydrationWarning
    >
      {/* Background Effects */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-primary/5"
        suppressHydrationWarning
      ></div>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_50%)]"
        suppressHydrationWarning
      ></div>

      {/* Premium Hero Section */}
      <PremiumHero />

      {/* Premium Features Section */}
      <PremiumFeatures />

      {/* Gym Locations Section */}
      <GymLocationsSection />

      {/* Premium Pricing Section */}
      <PremiumPricing />

      {/* Premium Testimonials Section */}
      <PremiumTestimonials />

      {/* Premium CTA Section */}
      <PremiumCTA />
    </div>
  );
};

export default HomePage;