"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail,
  Plus,
  Send,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Clock,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

export default function MarketingCampaignsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("campaigns");

  const campaigns = useQuery(
    api.marketingAutomation.getAllCampaigns,
    user?.id ? {} : "skip"
  );

  const createCampaign = useMutation(api.marketingAutomation.createMarketingCampaign);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <AdminLayout title="Marketing Campaigns" subtitle="Create and manage email campaigns">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>;
      case "draft":
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">Draft</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Paused</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome_series: "Welcome Series",
      onboarding: "Onboarding",
      re_engagement: "Re-engagement",
      birthday: "Birthday",
      anniversary: "Anniversary",
      custom: "Custom",
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout title="Marketing Campaigns" subtitle="Create and manage email campaigns">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Email Campaigns</h2>
            <p className="text-muted-foreground">Automate your marketing communications</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            {campaigns && campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign: any) => (
                  <Card key={campaign._id} className="bg-white/5 border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle>{campaign.name}</CardTitle>
                            {getStatusBadge(campaign.status)}
                          </div>
                          <CardDescription>{campaign.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-semibold">{getTypeLabel(campaign.type)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sent</p>
                          <p className="font-semibold">{campaign.sentCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Opened</p>
                          <p className="font-semibold">{campaign.openedCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Clicked</p>
                          <p className="font-semibold">{campaign.clickedCount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {campaign.status === "draft" && (
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Send Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No campaigns yet</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Templates</CardTitle>
                <CardDescription>Pre-built email campaign templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { type: "welcome_series", name: "Welcome Series", description: "3-email welcome sequence for new members" },
                    { type: "onboarding", name: "Onboarding", description: "Guide new members through platform features" },
                    { type: "re_engagement", name: "Re-engagement", description: "Win back inactive members" },
                    { type: "birthday", name: "Birthday", description: "Celebrate member birthdays with special offers" },
                  ].map((template) => (
                    <Card key={template.type} className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                  <Send className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaigns?.reduce((sum: number, c: any) => sum + c.sentCount, 0).toLocaleString() || "0"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                  <Eye className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaigns && campaigns.length > 0
                      ? `${(
                          (campaigns.reduce((sum: number, c: any) => sum + c.openedCount, 0) /
                            campaigns.reduce((sum: number, c: any) => sum + c.sentCount, 0)) *
                          100
                        ).toFixed(1)}%`
                      : "0%"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaigns && campaigns.length > 0
                      ? `${(
                          (campaigns.reduce((sum: number, c: any) => sum + c.clickedCount, 0) /
                            campaigns.reduce((sum: number, c: any) => sum + c.sentCount, 0)) *
                          100
                        ).toFixed(1)}%`
                      : "0%"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaigns?.reduce((sum: number, c: any) => sum + c.convertedCount, 0).toLocaleString() || "0"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

