"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { 
  QrCode, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Flame,
  TrendingUp,
  Activity,
  Download,
  RefreshCw
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";

/**
 * QR Code Display Component
 * Shows member's QR code for scanning at gym entrance
 */
export function QRCodeDisplay({ userId, locationId }: { userId: string; locationId: Id<"organizations"> }) {
  const qrValue = `${userId}-${locationId}-${Date.now()}`;
  
  return (
    <Card variant="premium" className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Your Check-In QR Code
        </CardTitle>
        <CardDescription>
          Show this QR code at the gym entrance scanner
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-xl">
          <QRCodeSVG
            value={qrValue}
            size={256}
            level="H"
            includeMargin={true}
            fgColor="#000000"
            bgColor="#ffffff"
            data-qr="true"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            // Download QR code as SVG
            const svg = document.querySelector('svg[data-qr]');
            if (svg) {
              const svgData = new XMLSerializer().serializeToString(svg);
              const blob = new Blob([svgData], { type: "image/svg+xml" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "checkin-qr.svg";
              link.click();
              URL.revokeObjectURL(url);
            }
          }}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Check-In Status Component
 * Shows current check-in status and allows check-in/check-out
 */
export function CheckInStatus({ locationId }: { locationId: Id<"organizations"> }) {
  const { user } = useUser();
  const checkIn = useQuery(
    api.memberCheckIns.getMemberCheckIns,
    user?.id ? { clerkId: user.id, locationId, limit: 1 } : "skip"
  );
  
  const checkInMember = useMutation(api.memberCheckIns.checkInMember);
  const checkOutMember = useMutation(api.memberCheckIns.checkOutMember);
  
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const currentCheckIn = checkIn?.[0];
  const isCheckedIn = currentCheckIn && !currentCheckIn.checkOutTime;
  
  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);
      await checkInMember({
        locationId,
        method: "app",
      });
    } catch (error: any) {
      alert(error.message || "Failed to check in");
    } finally {
      setIsCheckingIn(false);
    }
  };
  
  const handleCheckOut = async () => {
    if (!currentCheckIn?._id) return;
    try {
      setIsCheckingOut(true);
      await checkOutMember({
        checkInId: currentCheckIn._id,
      });
    } catch (error: any) {
      alert(error.message || "Failed to check out");
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Check-In Status
        </CardTitle>
        <CardDescription>
          {isCheckedIn ? "You're currently checked in" : "Ready to check in"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCheckedIn ? (
          <>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Checked In</span>
            </div>
            {currentCheckIn.checkInTime && (
              <div className="text-sm text-white/70">
                <Clock className="h-4 w-4 inline mr-2" />
                Checked in {formatDistanceToNow(new Date(currentCheckIn.checkInTime), { addSuffix: true })}
              </div>
            )}
            <Button
              variant="secondary"
              onClick={handleCheckOut}
              disabled={isCheckingOut}
              className="w-full"
            >
              {isCheckingOut ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking Out...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Check Out
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            onClick={handleCheckIn}
            disabled={isCheckingIn}
            className="w-full"
            size="lg"
          >
            {isCheckingIn ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Check In Now
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Check-In Streak Component
 * Displays member's check-in streak and achievements
 */
export function CheckInStreak() {
  const { user } = useUser();
  const streak = useQuery(
    api.memberCheckIns.getCheckInStreak,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-400" />
          Check-In Streak
        </CardTitle>
        <CardDescription>
          Keep your streak going!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-white mb-1">
              {streak?.streak || 0}
            </div>
            <div className="text-sm text-white/70">
              Day{streak?.streak !== 1 ? "s" : ""} Streak
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-white">
              {streak?.totalCheckIns || 0}
            </div>
            <div className="text-sm text-white/70">
              Total Check-Ins
            </div>
          </div>
        </div>
        {streak?.streak && streak.streak > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <TrendingUp className="h-4 w-4" />
              <span>
                Last check-in: {streak.lastCheckIn 
                  ? formatDistanceToNow(new Date(streak.lastCheckIn), { addSuffix: true })
                  : "Never"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Check-In History Component
 * Shows recent check-in history
 */
export function CheckInHistory({ locationId }: { locationId?: Id<"organizations"> }) {
  const { user } = useUser();
  const checkIns = useQuery(
    api.memberCheckIns.getMemberCheckIns,
    user?.id ? { clerkId: user.id, locationId, limit: 10 } : "skip"
  );
  
  if (!checkIns || checkIns.length === 0) {
    return (
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Check-In History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-center py-4">
            No check-ins yet. Start your fitness journey today!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Check-Ins
        </CardTitle>
        <CardDescription>
          Your last {checkIns.length} check-ins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn._id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                {checkIn.checkOutTime ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Activity className="h-5 w-5 text-blue-400" />
                )}
                <div>
                  <div className="font-medium text-white">
                    {new Date(checkIn.checkInTime).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-white/70">
                    {new Date(checkIn.checkInTime).toLocaleTimeString()}
                    {checkIn.checkOutTime && (
                      <> - {new Date(checkIn.checkOutTime).toLocaleTimeString()}</>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={checkIn.method === "qr" ? "premium" : "standard"}>
                  {checkIn.method === "qr" ? "QR Code" : checkIn.method === "app" ? "App" : "Manual"}
                </Badge>
                {checkIn.duration && (
                  <div className="text-xs text-white/70 mt-1">
                    {Math.floor(checkIn.duration / 60)}h {checkIn.duration % 60}m
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Location Selector Component
 * Allows members to select a location for check-in
 */
export function LocationSelector({ 
  onSelect 
}: { 
  onSelect: (locationId: Id<"organizations">) => void 
}) {
  const locations = useQuery(api.organizations.getAllOrganizations);
  
  if (!locations) {
    return (
      <Card variant="premium">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-white/70" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const activeLocations = locations.filter(loc => loc.status === "active");
  
  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Location
        </CardTitle>
        <CardDescription>
          Choose a gym location to check in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeLocations.map((location) => (
            <Button
              key={location._id}
              variant="secondary"
              onClick={() => onSelect(location._id)}
              className="w-full justify-start h-auto py-3"
            >
              <div className="text-left">
                <div className="font-medium text-white">{location.name}</div>
                <div className="text-sm text-white/70">
                  {location.address.city}, {location.address.state}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
