"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    price: "$29",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "Gym facilities access",
      "Basic workout programs",
      "All trainer sessions included",
      "Community forum access",
      "Standard customer support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    price: "$49",
    period: "/month",
    description: "Most popular choice",
    features: [
      "24/7 gym access with swipe card",
      "Advanced AI program generation",
      "Priority trainer booking",
      "All trainer sessions included",
      "Detailed progress tracking",
      "Nutrition consultation access",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Elite",
    price: "$79",
    period: "/month",
    description: "For serious athletes",
    features: [
      "Everything in Premium",
      "Personal trainer sessions",
      "Custom meal plans",
      "Priority marketplace discounts",
      "VIP community access",
      "Dedicated support line",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PremiumPricing() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="accent" className="mb-4">
            Flexible Pricing
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Choose Your Plan
          </h2>
          <p className="text-lg leading-relaxed text-white/70">
            Start with our Basic plan or unlock premium features with our most popular Premium plan.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              variant={plan.popular ? "premium" : "standard"}
              className={cn(
                "relative transition-all duration-300",
                plan.popular && "border-white/20 bg-white/[0.07] hover:-translate-y-2"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="accent" className="px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                  {plan.name}
                </CardTitle>
                <CardDescription className="mt-2 text-white/70">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-white/60">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full"
                  asChild
                >
                  <Link href="/membership">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
