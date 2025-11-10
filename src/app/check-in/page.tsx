"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import {
  QRCodeDisplay,
  CheckInStatus,
  CheckInStreak,
  CheckInHistory,
  LocationSelector,
} from "@/components/checkin/CheckInComponents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Calendar } from "lucide-react";

export default function CheckInPage() {
  const { user } = useUser();
  const [selectedLocation, setSelectedLocation] = useState<Id<"organizations"> | null>(null);
  
  // Get user's organization if they have one
  const userOrg = useQuery(
    api.organizations.getUserOrganization,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  // Set default location if user has an organization
  useEffect(() => {
    if (userOrg && !selectedLocation) {
      setSelectedLocation(userOrg._id);
    }
  }, [userOrg, selectedLocation]);
  
  if (!user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white/70">
          Please sign in to check in
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Check In</h1>
        <p className="text-white/70">
          Check in to your gym location using QR code or app-based check-in
        </p>
      </div>
      
      {!selectedLocation ? (
        <LocationSelector onSelect={setSelectedLocation} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Check-In Status */}
            <div className="lg:col-span-2">
              <CheckInStatus locationId={selectedLocation} />
            </div>
            
            {/* Check-In Streak */}
            <div>
              <CheckInStreak />
            </div>
          </div>
          
          <Tabs defaultValue="qr" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qr">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="history">
                <Calendar className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="qr" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QRCodeDisplay 
                  userId={user.id} 
                  locationId={selectedLocation}
                />
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      How to Check In
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-white/70 text-sm">
                      <li>Open your QR code on this page</li>
                      <li>Scan the QR code at the gym entrance scanner</li>
                      <li>Or use the "Check In Now" button for app-based check-in</li>
                      <li>Remember to check out when you leave</li>
                    </ol>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <CheckInHistory locationId={selectedLocation} />
            </TabsContent>
          </Tabs>
          
          {/* Change Location Button */}
          <div className="mt-6">
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-white/70 hover:text-white text-sm underline"
            >
              Change Location
            </button>
          </div>
        </>
      )}
    </div>
  );
}
