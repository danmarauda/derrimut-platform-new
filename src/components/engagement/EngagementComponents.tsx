"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target,
  Flame,
  Trophy,
  Users,
  Calendar,
  Activity
} from "lucide-react";

/**
 * Engagement Score Component
 * Shows overall engagement score with breakdown
 */
export function EngagementScore() {
  const { user } = useUser();
  const engagement = useQuery(
    api.memberCheckIns.getMemberEngagement,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  if (!engagement) {
    return (
      <Card variant="premium">
        <CardContent className="py-12">
          <div className="text-center">
            <Activity className="h-12 w-12 text-white/30 mx-auto mb-4 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const score = engagement.score || 0;
  const percentage = score;
  
  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          Engagement Score
        </CardTitle>
        <CardDescription>
          Your overall fitness engagement level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-white mb-2">
            {score}
          </div>
          <div className="text-sm text-white/70">out of 100</div>
          <Progress value={percentage} className="mt-4 h-3" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white/70">Check-Ins</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {engagement.checkInCount || 0}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-white/70">Streak</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {engagement.checkInStreak || 0} days
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-white/70">Workouts</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {engagement.workoutCompletions || 0}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-white/70">Challenges</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {engagement.challengeCompletions || 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Engagement Analytics Component
 * Detailed analytics dashboard
 */
export function EngagementAnalytics() {
  const { user } = useUser();
  const engagement = useQuery(
    api.memberCheckIns.getMemberEngagement,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const checkIns = useQuery(
    api.memberCheckIns.getMemberCheckIns,
    user?.id ? { clerkId: user.id, limit: 100 } : "skip"
  );
  
  const achievements = useQuery(
    api.memberCheckIns.getMemberAchievements,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  // Calculate weekly stats
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weeklyCheckIns = checkIns?.filter(ci => ci.checkInTime >= weekAgo).length || 0;
  
  // Calculate monthly stats
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const monthlyCheckIns = checkIns?.filter(ci => ci.checkInTime >= monthAgo).length || 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="text-lg">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-1">
            {weeklyCheckIns}
          </div>
          <div className="text-sm text-white/70">Check-ins</div>
        </CardContent>
      </Card>
      
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="text-lg">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-1">
            {monthlyCheckIns}
          </div>
          <div className="text-sm text-white/70">Check-ins</div>
        </CardContent>
      </Card>
      
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="text-lg">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-1">
            {achievements?.length || 0}
          </div>
          <div className="text-sm text-white/70">Unlocked</div>
        </CardContent>
      </Card>
      
      {engagement && (
        <>
          <Card variant="premium">
            <CardHeader>
              <CardTitle className="text-lg">Total Check-Ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {engagement.checkInCount || 0}
              </div>
              <div className="text-sm text-white/70">All time</div>
            </CardContent>
          </Card>
          
          <Card variant="premium">
            <CardHeader>
              <CardTitle className="text-lg">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {engagement.checkInStreak || 0}
              </div>
              <div className="text-sm text-white/70">Days</div>
            </CardContent>
          </Card>
          
          <Card variant="premium">
            <CardHeader>
              <CardTitle className="text-lg">Engagement Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {engagement.score || 0}
              </div>
              <div className="text-sm text-white/70">Out of 100</div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
