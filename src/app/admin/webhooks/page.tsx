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
  Webhook,
  Plus,
  CheckCircle2,
  X,
  Clock,
  AlertCircle,
  RefreshCw,
  Trash2,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";

export default function WebhooksPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);

  const subscriptions = useQuery(
    api.webhooks.getWebhookSubscriptions,
    user?.id ? {} : "skip"
  );
  const webhookEvents = useQuery(
    api.webhooks.getWebhookEvents,
    user?.id ? { limit: 100 } : "skip"
  );

  const createSubscription = useMutation(api.webhooks.createWebhookSubscription);
  const deleteSubscription = useMutation(api.webhooks.deleteWebhookSubscription);
  const retryWebhook = useMutation(api.webhooks.retryWebhook);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <AdminLayout title="Webhooks" subtitle="Manage webhook subscriptions">
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

  const availableEvents = [
    "member.check_in",
    "booking.created",
    "payment.received",
    "membership.created",
    "membership.cancelled",
    "challenge.completed",
  ];

  const handleCreateSubscription = async () => {
    if (!newWebhookUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }

    if (newWebhookEvents.length === 0) {
      toast.error("Please select at least one event");
      return;
    }

    try {
      await createSubscription({
        url: newWebhookUrl,
        events: newWebhookEvents,
      });
      toast.success("Webhook subscription created!");
      setNewWebhookUrl("");
      setNewWebhookEvents([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to create webhook subscription");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Success</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Failed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="Webhooks" subtitle="Manage webhook subscriptions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Webhook Subscriptions</h2>
            <p className="text-muted-foreground">Configure webhooks for external integrations</p>
          </div>
          <Button onClick={() => setActiveTab("new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Webhook
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="new">New Webhook</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-4">
            {subscriptions && subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map((sub: any) => (
                  <Card key={sub._id} className="bg-white/5 border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{sub.url}</CardTitle>
                            {sub.isActive ? (
                              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <CardDescription>
                            {sub.events.length} event{sub.events.length !== 1 ? "s" : ""} subscribed
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold mb-2">Subscribed Events:</p>
                          <div className="flex flex-wrap gap-2">
                            {sub.events.map((event: string) => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Last triggered:{" "}
                            {sub.lastTriggeredAt
                              ? new Date(sub.lastTriggeredAt).toLocaleDateString()
                              : "Never"}
                          </span>
                          {sub.failureCount > 0 && (
                            <span className="text-red-500">
                              {sub.failureCount} failure{sub.failureCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this webhook?")) {
                                try {
                                  await deleteSubscription({ subscriptionId: sub._id });
                                  toast.success("Webhook deleted");
                                } catch (error: any) {
                                  toast.error(error.message);
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No webhook subscriptions yet</p>
                  <Button onClick={() => setActiveTab("new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Webhook
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Events</CardTitle>
                <CardDescription>Recent webhook delivery attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {webhookEvents && webhookEvents.length > 0 ? (
                  <div className="space-y-3">
                    {webhookEvents.map((event: any) => (
                      <div
                        key={event._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusBadge(event.status)}
                          <div>
                            <p className="font-medium">{event.eventType}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.triggeredAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.responseCode && (
                            <span className="text-sm text-muted-foreground">
                              {event.responseCode}
                            </span>
                          )}
                          {event.status === "failed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await retryWebhook({ eventId: event._id });
                                  toast.success("Webhook retried");
                                } catch (error: any) {
                                  toast.error(error.message);
                                }
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No webhook events yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Webhook Subscription</CardTitle>
                <CardDescription>
                  Configure a webhook endpoint to receive platform events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    placeholder="https://your-domain.com/webhook"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your endpoint URL that will receive webhook events
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Subscribe to Events</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableEvents.map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={event}
                          checked={newWebhookEvents.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhookEvents([...newWebhookEvents, event]);
                            } else {
                              setNewWebhookEvents(newWebhookEvents.filter((e) => e !== event));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={event} className="text-sm cursor-pointer">
                          {event}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={handleCreateSubscription}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webhook Subscription
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  • Each webhook includes a signature header (<code className="bg-white/10 px-1 rounded">X-Webhook-Signature</code>) for verification
                </p>
                <p>
                  • Verify the signature using the webhook secret provided when creating the subscription
                </p>
                <p>
                  • Failed webhooks will be retried automatically up to 3 times
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

