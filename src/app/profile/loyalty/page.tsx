"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, Gift, History, ArrowUp, ArrowDown } from "lucide-react";

export default function LoyaltyPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const loyaltyBalance = useQuery(
    api.loyalty.getLoyaltyBalance,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const loyaltyHistory = useQuery(
    api.loyalty.getLoyaltyHistory,
    user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <UserLayout title="Loyalty Points" subtitle="Earn and redeem points">
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

  const points = loyaltyBalance?.points || 0;
  const totalEarned = loyaltyBalance?.totalEarned || 0;
  const totalRedeemed = loyaltyBalance?.totalRedeemed || 0;

  return (
    <UserLayout title="Loyalty Points" subtitle="Earn and redeem points">
      <div className="space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 backdrop-blur-sm border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              Your Points Balance
            </CardTitle>
            <CardDescription className="text-white/70">
              Earn points through check-ins, referrals, purchases, and more!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-yellow-500 mb-2">
              {points.toLocaleString()}
            </div>
            <p className="text-white/60 text-sm">Available Points</p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Earned
              </CardDescription>
              <CardTitle className="text-2xl text-green-500">
                {totalEarned.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Total Redeemed
              </CardDescription>
              <CardTitle className="text-2xl text-blue-500">
                {totalRedeemed.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* How to Earn Points */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle>How to Earn Points</CardTitle>
            <CardDescription className="text-white/60">
              Ways to accumulate loyalty points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-500 font-bold">+50</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Daily Check-in</p>
                    <p className="text-sm text-white/60">Check in at the gym</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-500 font-bold">+500</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Refer a Friend</p>
                    <p className="text-sm text-white/60">When they become a member</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-500 font-bold">+100</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Marketplace Purchase</p>
                    <p className="text-sm text-white/60">1 point per $1 spent</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-yellow-500 font-bold">+200</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Complete Challenge</p>
                    <p className="text-sm text-white/60">Finish a fitness challenge</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription className="text-white/60">
              Your recent point transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loyaltyHistory && loyaltyHistory.length > 0 ? (
              <div className="space-y-3">
                {loyaltyHistory.slice(0, 20).map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === "earned" ? (
                        <ArrowUp className="h-5 w-5 text-green-500" />
                      ) : transaction.type === "redeemed" ? (
                        <ArrowDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <History className="h-5 w-5 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-white">{transaction.description}</p>
                        <p className="text-sm text-white/60 capitalize">
                          {transaction.source.replace("_", " ")}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${
                          transaction.amount > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount.toLocaleString()}
                      </span>
                      <p className="text-xs text-white/40 mt-1">
                        Balance: {transaction.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet. Start earning points!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}

