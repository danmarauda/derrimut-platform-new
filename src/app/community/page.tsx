"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { CreatePost, CommunityFeed } from "@/components/community";
import { MessageSquare } from "lucide-react";

export default function CommunityPage() {
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
          Please sign in to view the community feed
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <MessageSquare className="h-8 w-8" />
          Community Feed
        </h1>
        <p className="text-white/70">
          Share your fitness journey and connect with other members
        </p>
      </div>
      
      {locations && locations.length > 1 && (
        <div className="mb-6">
          <select
            value={selectedLocation || ""}
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
      
      <CreatePost />
      <CommunityFeed locationId={selectedLocation || undefined} />
    </div>
  );
}
