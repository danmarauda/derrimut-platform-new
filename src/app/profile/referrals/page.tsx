"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Share2, Gift, Users, CheckCircle2, Clock, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function ReferralsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = useQuery(
    api.referrals.getUserReferralCode,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const referralStats = useQuery(
    api.referrals.getReferralStats,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const referralHistory = useQuery(
    api.referrals.getReferralHistory,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const getOrCreateCode = useMutation(api.referrals.getOrCreateReferralCode);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.id && !referralCode) {
      // Auto-generate code if it doesn't exist
      getOrCreateCode({ clerkId: user.id });
    }
  }, [user?.id, referralCode, getOrCreateCode]);

  if (!mounted || !isLoaded) {
    return (
      <UserLayout title="Referrals" subtitle="Invite friends and earn rewards">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const referralLink = referralStats?.referralLink || 
    (referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : "");

  const handleCopyLink = async () => {
    if (referralLink) {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && referralLink) {
      try {
        await navigator.share({
          title: "Join Derrimut 24:7 Gym",
          text: "Join me at Derrimut 24:7 Gym and get amazing fitness benefits!",
          url: referralLink,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "converted":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rewarded":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "converted":
        return "text-green-500";
      case "rewarded":
        return "text-yellow-500";
      case "pending":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <UserLayout title="Referrals" subtitle="Invite friends and earn rewards">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Total Referrals</CardDescription>
              <CardTitle className="text-2xl">{referralStats?.totalReferrals || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Converted</CardDescription>
              <CardTitle className="text-2xl text-green-500">
                {referralStats?.convertedReferrals || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Pending</CardDescription>
              <CardTitle className="text-2xl text-blue-500">
                {referralStats?.pendingReferrals || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Rewarded</CardDescription>
              <CardTitle className="text-2xl text-yellow-500">
                {referralStats?.rewardedReferrals || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Referral Code Card */}
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Your Referral Code
            </CardTitle>
            <CardDescription className="text-white/70">
              Share your code with friends and earn rewards when they join!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="referral-code" className="text-white/60 mb-2 block">
                  Referral Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="referral-code"
                    value={referralCode || "Generating..."}
                    readOnly
                    className="bg-white/10 border-white/20 text-white font-mono text-lg"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                  >
                    <Copy className={`h-4 w-4 ${copied ? "text-green-500" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="referral-link" className="text-white/60 mb-2 block">
                Referral Link
              </Label>
              <div className="flex gap-2">
                <Input
                  id="referral-link"
                  value={referralLink}
                  readOnly
                  className="bg-white/10 border-white/20 text-white text-sm"
                />
                <Button
                  onClick={handleShare}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-white/70">
                <strong className="text-white">How it works:</strong> Share your referral code or link with friends.
                When they sign up and become members, you both earn 500 loyalty points!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Referral History
            </CardTitle>
            <CardDescription className="text-white/60">
              Track all your referrals and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralHistory && referralHistory.length > 0 ? (
              <div className="space-y-3">
                {referralHistory.map((referral) => (
                  <div
                    key={referral._id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(referral.status)}
                      <div>
                        <p className="font-medium text-white">{referral.refereeName}</p>
                        <p className="text-sm text-white/60">{referral.refereeEmail}</p>
                        <p className="text-xs text-white/40 mt-1">
                          Referred on {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${getStatusColor(referral.status)}`}>
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                      {referral.conversionDate && (
                        <p className="text-xs text-white/40 mt-1">
                          Converted {new Date(referral.conversionDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No referrals yet. Start sharing your code!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}

