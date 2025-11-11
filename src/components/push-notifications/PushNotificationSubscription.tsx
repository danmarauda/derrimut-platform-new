"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function PushNotificationSubscription() {
  const { user } = useUser();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const userSubscriptions = useQuery(
    api.pushNotifications.getUserPushSubscriptions,
    user?.id ? {} : "skip"
  );
  const subscribe = useMutation(api.pushNotifications.subscribeToPush);
  const unsubscribe = useMutation(api.pushNotifications.unsubscribeFromPush);
  const updatePreferences = useMutation(api.pushNotifications.updatePushPreferences);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in this browser");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Notification permission denied");
      return;
    }

    return permission === "granted";
  };

  const subscribeToPush = async () => {
    if (!user?.id) return;

    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      // Register service worker
      if (!("serviceWorker" in navigator)) {
        toast.error("Service workers not supported");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Get VAPID public key from environment
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        toast.error("Push notifications not configured");
        return;
      }

      // Subscribe to push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const subscriptionData = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey("p256dh")!),
          auth: arrayBufferToBase64(pushSubscription.getKey("auth")!),
        },
        userAgent: navigator.userAgent,
        deviceType: "browser" as const,
        preferences: {
          achievements: true,
          challenges: true,
          classReminders: true,
          bookings: true,
          streakReminders: true,
          workoutReminders: true,
          specialOffers: true,
          social: true,
        },
      };

      await subscribe(subscriptionData);
      setSubscription(pushSubscription);
      setIsSubscribed(true);
      toast.success("Push notifications enabled!");
    } catch (error: any) {
      console.error("Error subscribing to push:", error);
      toast.error("Failed to enable push notifications");
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription || !user?.id) return;

    try {
      await subscription.unsubscribe();
      await unsubscribe({ endpoint: subscription.endpoint });
      setSubscription(null);
      setIsSubscribed(false);
      toast.success("Push notifications disabled");
    } catch (error: any) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to disable push notifications");
    }
  };

  const handlePreferenceChange = async (
    subscriptionId: string,
    preference: string,
    value: boolean
  ) => {
    if (!user?.id) return;

    const currentSub = userSubscriptions?.find((s) => s._id === subscriptionId);
    if (!currentSub) return;

    const newPreferences = {
      ...currentSub.preferences,
      [preference]: value,
    };

    try {
      await updatePreferences({
        subscriptionId: subscriptionId as any,
        preferences: newPreferences,
      });
      toast.success("Preferences updated");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    }
  };

  // Helper functions
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  if (!isSupported) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="py-8 text-center">
          <XCircle className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">Push notifications are not supported in this browser</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription className="text-white/60">
          Get notified about important updates and activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSubscribed ? (
          <div className="space-y-4">
            <p className="text-white/70 text-sm">
              Enable push notifications to stay updated with achievements, challenges, bookings,
              and more!
            </p>
            <Button onClick={subscribeToPush} className="w-full bg-primary hover:bg-primary/90">
              <Bell className="h-4 w-4 mr-2" />
              Enable Push Notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Push notifications enabled</span>
            </div>

            {userSubscriptions && userSubscriptions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <Label className="text-white font-medium">Notification Preferences</Label>
                {userSubscriptions.map((sub) => (
                  <div key={sub._id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="achievements" className="text-white/70">
                        Achievements
                      </Label>
                      <Switch
                        id="achievements"
                        checked={sub.preferences.achievements}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(sub._id, "achievements", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="challenges" className="text-white/70">
                        Challenges
                      </Label>
                      <Switch
                        id="challenges"
                        checked={sub.preferences.challenges}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(sub._id, "challenges", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="classReminders" className="text-white/70">
                        Class Reminders
                      </Label>
                      <Switch
                        id="classReminders"
                        checked={sub.preferences.classReminders}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(sub._id, "classReminders", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bookings" className="text-white/70">
                        Bookings
                      </Label>
                      <Switch
                        id="bookings"
                        checked={sub.preferences.bookings}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(sub._id, "bookings", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="streakReminders" className="text-white/70">
                        Streak Reminders
                      </Label>
                      <Switch
                        id="streakReminders"
                        checked={sub.preferences.streakReminders}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(sub._id, "streakReminders", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="workoutReminders" className="text-white/70">
                        Workout Reminders
                      </Label>
                      <Switch
                        id="workoutReminders"
                        checked={sub.preferences.workoutReminders}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(sub._id, "workoutReminders", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="specialOffers" className="text-white/70">
                        Special Offers
                      </Label>
                      <Switch
                        id="specialOffers"
                        checked={sub.preferences.specialOffers}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(sub._id, "specialOffers", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="social" className="text-white/70">
                        Social Updates
                      </Label>
                      <Switch
                        id="social"
                        checked={sub.preferences.social}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(sub._id, "social", checked)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={unsubscribeFromPush}
              variant="outline"
              className="w-full border-white/20 hover:bg-white/10"
            >
              Disable Push Notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

