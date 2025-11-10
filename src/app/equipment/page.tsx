"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { EquipmentList, UserReservations } from "@/components/equipment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Calendar } from "lucide-react";

export default function EquipmentPage() {
  const { user } = useUser();
  const [selectedLocation, setSelectedLocation] = useState<Id<"organizations"> | null>(null);
  
  // Get user's organization if they have one
  const userOrg = useQuery(
    api.organizations.getUserOrganization,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  // Get all locations
  const locations = useQuery(api.organizations.getAllOrganizations);
  
  // Set default location
  useEffect(() => {
    if (userOrg && !selectedLocation) {
      setSelectedLocation(userOrg._id);
    } else if (locations && locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0]._id);
    }
  }, [userOrg, locations, selectedLocation]);
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white/70">
          Please sign in to reserve equipment
        </div>
      </div>
    );
  }
  
  if (!selectedLocation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white/70">
          Loading locations...
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Equipment Reservations</h1>
        <p className="text-white/70">
          Reserve gym equipment for your workout sessions
        </p>
      </div>
      
      {locations && locations.length > 1 && (
        <div className="mb-6">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value as Id<"organizations">)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <Tabs defaultValue="browse" className="mb-6">
        <TabsList>
          <TabsTrigger value="browse">
            <Dumbbell className="h-4 w-4 mr-2" />
            Browse Equipment
          </TabsTrigger>
          <TabsTrigger value="reservations">
            <Calendar className="h-4 w-4 mr-2" />
            My Reservations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="mt-6">
          <EquipmentList locationId={selectedLocation} />
        </TabsContent>
        
        <TabsContent value="reservations" className="mt-6">
          <UserReservations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
