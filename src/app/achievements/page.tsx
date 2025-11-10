"use client";

import { useUser } from "@clerk/nextjs";
import { AchievementsGrid, AchievementStats } from "@/components/achievements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, BarChart3 } from "lucide-react";

export default function AchievementsPage() {
  const { user } = useUser();
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white/70">
          Please sign in to view your achievements
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Achievements</h1>
        <p className="text-white/70">
          Track your fitness milestones and unlock badges as you progress
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">
                <Trophy className="h-4 w-4 mr-2" />
                All Achievements
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <AchievementsGrid />
            </TabsContent>
            
            <TabsContent value="stats" className="mt-6">
              <AchievementStats />
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <AchievementStats />
        </div>
      </div>
    </div>
  );
}
