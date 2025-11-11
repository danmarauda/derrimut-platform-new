"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, CheckCircle2, Clock } from "lucide-react";

export default function AdminReferralsPage() {
  const allReferrals = useQuery(api.referrals.getAllReferrals);

  if (allReferrals === undefined) {
    return (
      <AdminLayout title="Referrals" subtitle="Manage referral program">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = {
    total: allReferrals.length,
    converted: allReferrals.filter((r) => r.status === "converted").length,
    pending: allReferrals.filter((r) => r.status === "pending").length,
    rewarded: allReferrals.filter((r) => r.status === "rewarded").length,
  };

  return (
    <AdminLayout title="Referrals" subtitle="Manage referral program">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Total Referrals</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Converted</CardDescription>
              <CardTitle className="text-2xl text-green-500">{stats.converted}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Pending</CardDescription>
              <CardTitle className="text-2xl text-blue-500">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Rewarded</CardDescription>
              <CardTitle className="text-2xl text-yellow-500">{stats.rewarded}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Referrals Table */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Referrals
            </CardTitle>
            <CardDescription className="text-white/60">
              Complete referral history across all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allReferrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 text-white/60">Referrer</th>
                      <th className="text-left p-3 text-white/60">Referee</th>
                      <th className="text-left p-3 text-white/60">Code</th>
                      <th className="text-left p-3 text-white/60">Status</th>
                      <th className="text-left p-3 text-white/60">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allReferrals.map((referral) => (
                      <tr key={referral._id} className="border-b border-white/5">
                        <td className="p-3">
                          <div>
                            <p className="text-white font-medium">{referral.referrerName}</p>
                            <p className="text-sm text-white/60">{referral.referrerEmail}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="text-white font-medium">{referral.refereeName}</p>
                            <p className="text-sm text-white/60">{referral.refereeEmail}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <code className="text-sm bg-white/10 px-2 py-1 rounded text-white">
                            {referral.referralCode}
                          </code>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-sm font-medium ${
                              referral.status === "converted"
                                ? "text-green-500"
                                : referral.status === "pending"
                                ? "text-blue-500"
                                : referral.status === "rewarded"
                                ? "text-yellow-500"
                                : "text-gray-500"
                            }`}
                          >
                            {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-3 text-white/60 text-sm">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No referrals yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

