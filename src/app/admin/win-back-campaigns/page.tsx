"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, TrendingUp, Users, CheckCircle2 } from "lucide-react";

export default function WinBackCampaignsPage() {
  // Note: This would need a public query wrapper since getCampaignStats is internal
  // For now, we'll create a public version
  const campaigns = useQuery(api.winBackCampaigns.getPublicCampaignStats);

  if (campaigns === undefined) {
    return (
      <AdminLayout title="Win-Back Campaigns" subtitle="Re-engage inactive members">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const openRate = campaigns.total > 0 ? ((campaigns.opened / campaigns.total) * 100).toFixed(1) : "0";
  const clickRate = campaigns.total > 0 ? ((campaigns.clicked / campaigns.total) * 100).toFixed(1) : "0";
  const conversionRate = campaigns.total > 0 ? ((campaigns.converted / campaigns.total) * 100).toFixed(1) : "0";

  return (
    <AdminLayout title="Win-Back Campaigns" subtitle="Re-engage inactive members">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Total Campaigns</CardDescription>
              <CardTitle className="text-2xl">{campaigns.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Open Rate</CardDescription>
              <CardTitle className="text-2xl text-blue-500">{openRate}%</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Click Rate</CardDescription>
              <CardTitle className="text-2xl text-green-500">{clickRate}%</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/60">Conversion Rate</CardDescription>
              <CardTitle className="text-2xl text-yellow-500">{conversionRate}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Campaign Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                We Miss You
              </CardTitle>
              <CardDescription className="text-white/60">2 weeks inactive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{campaigns.weMissYou}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Come Back
              </CardTitle>
              <CardDescription className="text-white/60">1 month inactive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{campaigns.comeBack}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Special Return
              </CardTitle>
              <CardDescription className="text-white/60">3 months inactive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{campaigns.specialReturn}</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Campaign Performance
            </CardTitle>
            <CardDescription className="text-white/60">
              Track how well campaigns are performing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Emails Opened</span>
                <span className="text-white font-semibold">
                  {campaigns.opened} / {campaigns.total} ({openRate}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Links Clicked</span>
                <span className="text-white font-semibold">
                  {campaigns.clicked} / {campaigns.total} ({clickRate}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Members Returned</span>
                <span className="text-white font-semibold">
                  {campaigns.converted} / {campaigns.total} ({conversionRate}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

