"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Calendar, 
  Activity, 
  Target,
  Download,
  ArrowRight,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";

interface ProfileStatsProps {
  role?: string;
  memberSince?: Date | number;
  activePlans?: number;
}

export function ProfileStats({ role, memberSince, activePlans }: ProfileStatsProps) {
  const formatDate = (date?: Date | number) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card variant="premium">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Shield className="h-6 w-6 text-white/70" />
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Role</p>
              <p className="text-white font-semibold capitalize">{role || "User"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="premium">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Calendar className="h-6 w-6 text-white/70" />
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Member Since</p>
              <p className="text-white font-semibold">{formatDate(memberSince)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="premium">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Activity className="h-6 w-6 text-white/70" />
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Active Plans</p>
              <p className="text-white font-semibold">{activePlans || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MembershipCardProps {
  membership: {
    membershipType: string;
    status: string;
    currentPeriodStart: number | Date;
    currentPeriodEnd: number | Date;
    cancelAtPeriodEnd?: boolean;
  };
  onDownloadCard?: () => void;
  onCancelMembership?: () => void;
}

export function MembershipCard({ membership, onDownloadCard, onCancelMembership }: MembershipCardProps) {
  const formatDate = (date: number | Date) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusColor = () => {
    if (membership.status === "cancelled" || membership.cancelAtPeriodEnd) return "orange";
    if (membership.status === "expired") return "red";
    return "green";
  };

  const getStatusMessage = () => {
    if (membership.cancelAtPeriodEnd) return "Cancelling";
    if (membership.status === "cancelled") return "Cancelled";
    if (membership.status === "expired") return "Expired";
    return "Active";
  };

  const now = new Date().getTime();
  const start = new Date(membership.currentPeriodStart).getTime();
  const end = new Date(membership.currentPeriodEnd).getTime();
  const total = end - start;
  const elapsed = now - start;
  const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));

  const statusColor = getStatusColor();
  const statusMessage = getStatusMessage();

  return (
    <Card variant="premium" className={`border-${
      statusColor === "green" ? "emerald" : 
      statusColor === "orange" ? "orange" : 
      "red"
    }-500/30`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl bg-${
              statusColor === "green" ? "emerald" : 
              statusColor === "orange" ? "orange" : 
              "red"
            }-500/20 flex items-center justify-center border border-${
              statusColor === "green" ? "emerald" : 
              statusColor === "orange" ? "orange" : 
              "red"
            }-500/30`}>
              <Shield className={`h-6 w-6 text-${
                statusColor === "green" ? "emerald" : 
                statusColor === "orange" ? "orange" : 
                "red"
              }-400`} />
            </div>
            <div>
              <CardTitle className="text-white">
                {statusMessage === "Cancelling" ? "Cancelling Membership" :
                 statusMessage === "Cancelled" ? "Cancelled Membership" :
                 statusMessage === "Expired" ? "Expired Membership" :
                 "Current Membership"}
              </CardTitle>
              <CardDescription className="text-white/60">
                {membership.membershipType} Plan
              </CardDescription>
            </div>
          </div>
          <Badge variant={statusColor === "green" ? "accent" : "standard"} className={
            statusColor === "orange" ? "bg-orange-500/20 border-orange-500/30 text-orange-400" :
            statusColor === "red" ? "bg-red-500/20 border-red-500/30 text-red-400" :
            ""
          }>
            {statusMessage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-white/60 mb-2">Start Date</p>
            <p className="text-white font-semibold">{formatDate(membership.currentPeriodStart)}</p>
          </div>
          <div>
            <p className="text-sm text-white/60 mb-2">End Date</p>
            <p className="text-white font-semibold">{formatDate(membership.currentPeriodEnd)}</p>
          </div>
        </div>

        {membership.status === "active" && (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/60">Membership Progress</span>
                <span className="text-sm text-white/60">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progress > 80 ? "bg-red-500" :
                    progress > 60 ? "bg-orange-500" :
                    progress > 40 ? "bg-yellow-500" :
                    "bg-emerald-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {!membership.cancelAtPeriodEnd && (
              <div className="flex gap-3 pt-4 border-t border-white/10">
                {onDownloadCard && (
                  <Button variant="secondary" onClick={onDownloadCard}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Card
                  </Button>
                )}
                {onCancelMembership && (
                  <Button variant="tertiary" onClick={onCancelMembership} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30">
                    Cancel Membership
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function NoMembershipCard({ onViewPlans }: { onViewPlans?: () => void }) {
  return (
    <Card variant="premium" className="border-yellow-500/30">
      <CardContent className="p-12 text-center">
        <div className="h-20 w-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
          <Shield className="h-10 w-10 text-yellow-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3">No Active Membership</h3>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          Get access to premium features and facilities with our membership plans
        </p>
        {onViewPlans ? (
          <Button variant="primary" onClick={onViewPlans}>
            View Membership Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button variant="primary" asChild>
            <Link href="/membership">
              View Membership Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface ActivePlanCardProps {
  plan: {
    name: string;
    workoutPlan: {
      schedule: string[];
    };
    dietPlan: {
      dailyCalories: number;
    };
  };
}

export function ActivePlanCard({ plan }: ActivePlanCardProps) {
  return (
    <Card variant="premium">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <Activity className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-white">Active Fitness Plan</CardTitle>
            <CardDescription className="text-white/60">Your current active fitness program</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
            <p className="text-sm text-white/60 mb-4">
              Schedule: {plan.workoutPlan.schedule.join(", ")}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-sm text-white/60">Daily Calories</span>
              <span className="text-2xl font-bold text-white">{plan.dietPlan.dailyCalories}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" asChild className="flex-1">
              <Link href="/profile/fitness-plans">
                View Workout Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" asChild className="flex-1">
              <Link href="/profile/diet-plans">
                View Diet Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NoActivePlanCard({ onGeneratePlan }: { onGeneratePlan?: () => void }) {
  return (
    <Card variant="premium">
      <CardContent className="p-12 text-center">
        <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
          <Target className="h-10 w-10 text-white/30" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3">No Active Plan</h3>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          Get started with a personalized fitness and diet plan tailored to your goals.
        </p>
        {onGeneratePlan ? (
          <Button variant="primary" onClick={onGeneratePlan}>
            Generate Your Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button variant="primary" asChild>
            <Link href="/generate-program">
              Generate Your Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}