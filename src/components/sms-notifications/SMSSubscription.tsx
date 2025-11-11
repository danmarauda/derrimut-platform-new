"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function SMSSubscription() {
  const { user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  const smsSubscription = useQuery(api.smsNotifications.getUserSMSSubscription);
  const subscribe = useMutation(api.smsNotifications.subscribeToSMS);
  const unsubscribe = useMutation(api.smsNotifications.unsubscribeFromSMS);
  const verify = useMutation(api.smsNotifications.verifySMSPhone);
  const updatePreferences = useMutation(api.smsNotifications.updateSMSPreferences);

  const handleSubscribe = async () => {
    if (!user?.id || !phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      await subscribe({
        phoneNumber,
        preferences: {
          bookingConfirmations: true,
          classReminders: true,
          paymentAlerts: true,
          accountUpdates: true,
          emergencyNotifications: true,
        },
      });
      setShowVerification(true);
      toast.success("Verification code sent!");
    } catch (error: any) {
      console.error("Error subscribing to SMS:", error);
      toast.error("Failed to subscribe to SMS notifications");
    }
  };

  const handleVerify = async () => {
    if (!smsSubscription?._id || !verificationCode) {
      toast.error("Please enter verification code");
      return;
    }

    try {
      await verify({
        subscriptionId: smsSubscription._id,
        code: verificationCode,
      });
      setShowVerification(false);
      toast.success("Phone number verified!");
    } catch (error: any) {
      console.error("Error verifying SMS:", error);
      toast.error("Invalid verification code");
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe({});
      toast.success("SMS notifications disabled");
    } catch (error: any) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to disable SMS notifications");
    }
  };

  const handlePreferenceChange = async (preference: string, value: boolean) => {
    if (!smsSubscription) return;

    const newPreferences = {
      ...smsSubscription.preferences,
      [preference]: value,
    };

    try {
      await updatePreferences({ preferences: newPreferences });
      toast.success("Preferences updated");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          SMS Notifications
        </CardTitle>
        <CardDescription className="text-white/60">
          Receive important alerts via text message
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!smsSubscription ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-white/70 mb-2 block">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+61 4XX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <Button onClick={handleSubscribe} className="w-full bg-primary hover:bg-primary/90">
              Subscribe to SMS Notifications
            </Button>
          </div>
        ) : showVerification && !smsSubscription.verified ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-500">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">Verification code sent to {smsSubscription.phoneNumber}</span>
            </div>
            <div>
              <Label htmlFor="code" className="text-white/70 mb-2 block">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                maxLength={6}
              />
            </div>
            <Button onClick={handleVerify} className="w-full bg-primary hover:bg-primary/90">
              Verify Phone Number
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                SMS notifications enabled for {smsSubscription.phoneNumber}
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <Label className="text-white font-medium">SMS Preferences</Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="bookingConfirmations" className="text-white/70">
                  Booking Confirmations
                </Label>
                <Switch
                  id="bookingConfirmations"
                  checked={smsSubscription.preferences.bookingConfirmations}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("bookingConfirmations", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="classReminders" className="text-white/70">
                  Class Reminders
                </Label>
                <Switch
                  id="classReminders"
                  checked={smsSubscription.preferences.classReminders}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("classReminders", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="paymentAlerts" className="text-white/70">
                  Payment Alerts
                </Label>
                <Switch
                  id="paymentAlerts"
                  checked={smsSubscription.preferences.paymentAlerts}
                  onCheckedChange={(checked) => handlePreferenceChange("paymentAlerts", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="accountUpdates" className="text-white/70">
                  Account Updates
                </Label>
                <Switch
                  id="accountUpdates"
                  checked={smsSubscription.preferences.accountUpdates}
                  onCheckedChange={(checked) => handlePreferenceChange("accountUpdates", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emergencyNotifications" className="text-white/70">
                  Emergency Notifications
                </Label>
                <Switch
                  id="emergencyNotifications"
                  checked={smsSubscription.preferences.emergencyNotifications}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("emergencyNotifications", checked)
                  }
                />
              </div>
            </div>

            <Button
              onClick={handleUnsubscribe}
              variant="outline"
              className="w-full border-white/20 hover:bg-white/10"
            >
              Disable SMS Notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

