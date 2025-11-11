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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gift,
  Plus,
  Copy,
  CheckCircle2,
  Clock,
  DollarSign,
  CreditCard,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function GiftCardsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("purchase");
  const [amount, setAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [redeemCode, setRedeemCode] = useState("");

  const createGiftCard = useMutation(api.advancedPayments.createGiftCard);
  const redeemGiftCard = useMutation(api.advancedPayments.redeemGiftCard);
  const getGiftCard = useMutation(api.advancedPayments.getGiftCardByCode);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <UserLayout title="Gift Cards" subtitle="Purchase and redeem gift cards">
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

  const handlePurchase = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const result = await createGiftCard({
        amount: parseFloat(amount),
        recipientEmail: recipientEmail || undefined,
        recipientName: recipientName || undefined,
        message: message || undefined,
      });
      toast.success("Gift card created! Complete payment to activate.");
      // In a real app, you'd redirect to Stripe checkout
    } catch (error: any) {
      toast.error(error.message || "Failed to create gift card");
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      toast.error("Please enter a gift card code");
      return;
    }

    try {
      const result = await redeemGiftCard({ code: redeemCode.toUpperCase() });
      toast.success(`Gift card redeemed! ${result.amount} AUD added to your account.`);
      setRedeemCode("");
    } catch (error: any) {
      toast.error(error.message || "Failed to redeem gift card");
    }
  };

  return (
    <UserLayout title="Gift Cards" subtitle="Purchase and redeem gift cards">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="purchase">Purchase</TabsTrigger>
            <TabsTrigger value="redeem">Redeem</TabsTrigger>
          </TabsList>

          <TabsContent value="purchase" className="space-y-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <CardTitle>Purchase Gift Card</CardTitle>
                </div>
                <CardDescription>
                  Give the gift of fitness! Perfect for birthdays, holidays, or any occasion.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (AUD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                      min="10"
                      step="10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum amount: $10 AUD
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recipient Name (Optional)</Label>
                    <Input
                      placeholder="John Doe"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Email (Optional)</Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Personal Message (Optional)</Label>
                  <textarea
                    className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="Happy Birthday! Enjoy your fitness journey..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Gift Card Value</span>
                    <span className="text-lg font-bold">
                      ${amount || "0"} AUD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Processing Fee</span>
                    <span className="text-sm">Free</span>
                  </div>
                  <div className="border-t border-white/10 mt-2 pt-2 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">
                      ${amount || "0"} AUD
                    </span>
                  </div>
                </div>

                <Button className="w-full" onClick={handlePurchase} disabled={!amount}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase Gift Card
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Amounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 200, 500].map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      onClick={() => setAmount(value.toString())}
                      className={amount === value.toString() ? "bg-primary/10 border-primary" : ""}
                    >
                      ${value}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redeem" className="space-y-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-500" />
                  <CardTitle>Redeem Gift Card</CardTitle>
                </div>
                <CardDescription>
                  Enter your gift card code to add credit to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Gift Card Code</Label>
                  <Input
                    placeholder="GC123456789"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    className="font-mono text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the code found on your gift card
                  </p>
                </div>

                <Button className="w-full" onClick={handleRedeem} disabled={!redeemCode}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Redeem Gift Card
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Gift className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Purchase</p>
                    <p className="text-sm text-muted-foreground">
                      Buy a gift card for any amount and send it to friends or family
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Copy className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Receive Code</p>
                    <p className="text-sm text-muted-foreground">
                      Recipient receives a unique gift card code via email
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Redeem</p>
                    <p className="text-sm text-muted-foreground">
                      Enter the code to add credit to your account
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
}

