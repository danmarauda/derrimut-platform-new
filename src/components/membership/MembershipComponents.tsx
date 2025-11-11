"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Crown,
  Star,
  Heart,
  Sparkles,
  Zap,
  Shield,
  ArrowRight
} from "lucide-react";

interface MembershipPlan {
  _id: any;
  type: string;
  name: string;
  price: number;
  stripePriceId?: string;
  features: string[];
  description?: string;
  popular?: boolean;
}

interface MembershipPlanCardProps {
  plan: MembershipPlan;
  currentMembership?: {
    membershipType: string;
  } | null;
  onSubscribe: (plan: MembershipPlan) => Promise<void>;
  loading?: string | null;
}

export function MembershipPlanCard({ plan, currentMembership, onSubscribe, loading }: MembershipPlanCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPlanIcon = () => {
    switch (plan.type) {
      case "basic":
        return <Star className="h-6 w-6" />;
      case "couple":
        return <Heart className="h-6 w-6" />;
      case "12-month-upfront":
        return <Crown className="h-6 w-6" />;
      default:
        return <Shield className="h-6 w-6" />;
    }
  };

  const isCurrentPlan = currentMembership?.membershipType === plan.type;
  const isPopular = plan.popular;

  return (
    <Card 
      variant={isPopular ? "premium" : "standard"} 
      className={`relative ${isPopular ? "border-white/30 bg-gradient-to-br from-white/10 to-white/5" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="accent" className="text-xs px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            isPopular ? "bg-white/10 border border-white/20" : "bg-white/5 border border-white/10"
          }`}>
            <div className="text-white/70">
              {getPlanIcon()}
            </div>
          </div>
          <div className="flex-1">
            <CardTitle className="text-white">{plan.name}</CardTitle>
            {plan.description && (
              <CardDescription className="text-white/60">{plan.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-semibold text-white">{formatPrice(plan.price)}</span>
            <span className="text-white/60 text-sm">/month</span>
          </div>
          {plan.type === "12-month-upfront" && (
            <p className="text-emerald-400 text-sm mt-1">Best value - Save 20%</p>
          )}
        </div>

        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-white/80 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {isCurrentPlan ? (
          <Button variant="secondary" className="w-full" disabled>
            Current Plan
          </Button>
        ) : (
          <Button
            variant={isPopular ? "primary" : "secondary"}
            className="w-full"
            onClick={() => onSubscribe(plan)}
            disabled={loading === plan.type}
          >
            {loading === plan.type ? (
              <>
                <div className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                {plan.type === "12-month-upfront" ? "Get Started" : "Subscribe Now"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}