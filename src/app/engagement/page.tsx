"use client";

import { useUser } from "@clerk/nextjs";
import { EngagementScore, EngagementAnalytics } from "@/components/engagement";
import { BarChart3 } from "lucide-react";

export default function EngagementPage() {
  const { user } = useUser();
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white/70">
          Please sign in to view your engagement analytics
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Engagement Analytics
        </h1>
        <p className="text-white/70">
          Track your fitness engagement and progress
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <EngagementAnalytics />
        </div>
        <div>
          <EngagementScore />
        </div>
      </div>
    </div>
  );
}
