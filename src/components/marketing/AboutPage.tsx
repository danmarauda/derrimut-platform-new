"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Users, 
  Award, 
  Heart, 
  Dumbbell,
  Brain,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DERRIMUT_BRAND } from "@/constants/branding";

export function AboutPageHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_50%)]" />
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="accent" className="mb-6">
            About Derrimut 24:7
          </Badge>
          <h1 className="text-5xl md:text-7xl font-semibold text-white mb-6 tracking-tight">
            Empowering Your Fitness Journey
          </h1>
          <p className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto mb-8">
            Australia's premier 24/7 fitness platform combining cutting-edge AI technology with expert trainers 
            to help you achieve your fitness goals, anytime, anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/membership">
                Join Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutMission() {
  return (
    <section className="py-24 px-4 bg-neutral-950">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="standard" className="mb-4">
              Our Mission
            </Badge>
            <h2 className="text-4xl font-semibold text-white mb-6 tracking-tight">
              Transforming Lives Through Fitness
            </h2>
            <p className="text-lg text-white/70 mb-6 leading-relaxed">
              At Derrimut 24:7, we believe fitness should be accessible, personalized, and supported by the best 
              technology available. With 18 locations across Australia and thousands of active members, we're 
              revolutionizing the fitness industry.
            </p>
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              Our AI-powered platform generates personalized workout and nutrition plans, while our certified trainers 
              provide expert guidance. Every membership includes unlimited trainer sessions - no hidden fees, no limits.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-white mb-1">18+</div>
                <div className="text-sm text-white/60">Locations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">1000+</div>
                <div className="text-sm text-white/60">Active Members</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">4.8★</div>
                <div className="text-sm text-white/60">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-white/60">Access</div>
              </div>
            </div>
          </div>
          
          <Card variant="premium" className="h-full">
            <CardHeader>
              <CardTitle className="text-white">What We Offer</CardTitle>
              <CardDescription className="text-white/60">
                Everything you need for your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <Brain className="h-5 w-5 text-white/70" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">AI-Powered Programs</h3>
                  <p className="text-sm text-white/60">
                    Voice-activated AI consultations create personalized workout and diet plans instantly
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <Users className="h-5 w-5 text-white/70" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Expert Trainers Included</h3>
                  <p className="text-sm text-white/60">
                    Unlimited access to certified trainers with any membership - no hourly fees
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <ShoppingBag className="h-5 w-5 text-white/70" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Complete Fitness Ecosystem</h3>
                  <p className="text-sm text-white/60">
                    Gym access, marketplace, recipes, and community support all in one platform
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function AboutValues() {
  const values = [
    {
      icon: Target,
      title: "Accessibility",
      description: "24/7 access to all locations with affordable membership plans starting from $29/month",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Certified trainers, AI-powered programs, and industry-leading facilities",
    },
    {
      icon: Heart,
      title: "Community",
      description: "Supportive community of members, trainers, and fitness enthusiasts",
    },
    {
      icon: Dumbbell,
      title: "Innovation",
      description: "Cutting-edge AI technology combined with proven fitness methodologies",
    },
  ];

  return (
    <section className="py-24 px-4 bg-neutral-950">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="standard" className="mb-4">
            Our Values
          </Badge>
          <h2 className="text-4xl font-semibold text-white mb-4 tracking-tight">
            What Drives Us
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            The principles that guide everything we do at Derrimut 24:7
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} variant="premium" className="text-center hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="h-16 w-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white/70" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-white/60">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AboutCTA() {
  return (
    <section className="py-24 px-4 bg-neutral-950">
      <div className="container mx-auto max-w-4xl">
        <Card variant="premium" className="bg-gradient-to-r from-white/10 to-white/5 border-white/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
              Ready to Start Your Fitness Journey?
            </h2>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Join thousands of members achieving their fitness goals with Derrimut 24:7. 
              Experience AI-powered programs, unlimited trainer sessions, and 24/7 gym access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link href="/membership">
                  View Membership Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <AboutPageHero />
      <AboutMission />
      <AboutValues />
      <AboutCTA />
    </div>
  );
}