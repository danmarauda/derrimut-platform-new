"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Shield, Activity, Target, Clock, Download, CreditCard } from "lucide-react";
import { useMembershipExpiryCheck, getMembershipStatusInfo, formatMembershipDate } from "@/lib/membership-utils";
import { 
  ProfileStats, 
  MembershipCard, 
  NoMembershipCard, 
  ActivePlanCard, 
  NoActivePlanCard 
} from "@/components/profile/ProfileComponents";

const ProfilePage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const userId = user?.id as string;
  const [mounted, setMounted] = useState(false);
  
  useMembershipExpiryCheck();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }
  }, [isLoaded, user, router]);

  const allPlans = useQuery(
    api.plans.getUserPlans, 
    user?.id ? { userId: user.id } : "skip"
  );
  const userRole = useQuery(api.users.getCurrentUserRole);
  const currentMembership = useQuery(
    api.memberships.getUserMembershipWithExpiryCheck,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const userBookings = useQuery(
    api.bookings.getUserBookings,
    user?.id ? { userClerkId: user.id } : "skip"
  );
  
  const userPayrollRecords = useQuery(
    api.salary.getEmployeePayrollRecords,
    user?.id && userRole ? { employeeClerkId: user.id } : "skip"
  );
  
  const cancelMembership = useMutation(api.memberships.cancelMembership);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <UserLayout 
        title="Profile Overview" 
        subtitle="Manage your account and view your fitness journey"
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!user) {
    return null;
  }

  const handleCancelMembership = async () => {
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to cancel your membership?\n\nThis will:\n• Cancel your Stripe subscription\n• Stop future billing\n• You\'ll keep access until your current billing period ends\n\nThis action cannot be undone.')) {
      return;
    }
    
    try {
      const result = await cancelMembership({ clerkId: user.id });
      alert('✅ Your membership has been cancelled successfully.\n\nYour membership will remain active until the end of your current billing period. No further charges will be made.');
    } catch (error) {
      console.error("❌ Error cancelling membership:", error);
      alert("❌ Error cancelling membership. Please contact support if this issue persists.");
    }
  };

  const downloadMembershipCard = () => {
    if (!currentMembership || !user) return;
    // Implementation from original file
    alert("Membership card download feature coming soon!");
  };

  const activePlan = allPlans?.find((plan) => plan.isActive);

  return (
    <UserLayout 
      title="Profile Overview" 
      subtitle="Manage your account and view your fitness journey"
    >
      <div className="space-y-6">
        <ProfileHeader user={user} />

        <ProfileStats
          role={userRole || undefined}
          memberSince={user?.createdAt}
          activePlans={allPlans?.filter(plan => plan.isActive).length}
        />

        {currentMembership ? (
          <MembershipCard
            membership={currentMembership}
            onDownloadCard={downloadMembershipCard}
            onCancelMembership={handleCancelMembership}
          />
        ) : (
          <NoMembershipCard />
        )}

        {activePlan ? (
          <ActivePlanCard plan={activePlan} />
        ) : (
          <NoActivePlanCard />
        )}
      </div>
    </UserLayout>
  );
};

export default ProfilePage;