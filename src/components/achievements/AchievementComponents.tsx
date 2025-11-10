"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Target, Flame, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * Achievement Badge Component
 * Displays a single achievement with icon, title, and description
 */
export function AchievementBadge({ 
  achievement 
}: { 
  achievement: {
    _id: string;
    title: string;
    description: string;
    icon: string;
    type: string;
    unlockedAt: number;
    metadata?: any;
  }
}) {
  const getIcon = () => {
    // Use emoji if provided, otherwise use Lucide icon based on type
    if (achievement.icon && achievement.icon.match(/[\u{1F300}-\u{1F9FF}]/u)) {
      return <span className="text-4xl">{achievement.icon}</span>;
    }
    
    const iconMap: Record<string, any> = {
      check_in_streak: Flame,
      total_check_ins: Target,
      workout_completed: Zap,
      challenge_completed: Trophy,
      milestone: Star,
      social: Award,
    };
    
    const Icon = iconMap[achievement.type] || Trophy;
    return <Icon className="h-8 w-8 text-yellow-400" />;
  };
  
  return (
    <Card variant="premium" className="hover:scale-105 transition-transform">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="mb-2">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg mb-1">
              {achievement.title}
            </h3>
            <p className="text-sm text-white/70 mb-2">
              {achievement.description}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Badge variant="premium" className="text-xs">
                {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Achievements Grid Component
 * Displays all user achievements in a grid
 */
export function AchievementsGrid() {
  const { user } = useUser();
  const achievements = useQuery(
    api.memberCheckIns.getMemberAchievements,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  if (!achievements || achievements.length === 0) {
    return (
      <Card variant="premium">
        <CardContent className="py-12">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No Achievements Yet
            </h3>
            <p className="text-white/70 text-sm">
              Start checking in and completing workouts to unlock achievements!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Group achievements by type
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.type]) {
      acc[achievement.type] = [];
    }
    acc[achievement.type].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedAchievements).map(([type, typeAchievements]) => (
        <div key={type}>
          <h3 className="text-xl font-semibold text-white mb-4 capitalize">
            {type.replace(/_/g, " ")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typeAchievements.map((achievement) => (
              <AchievementBadge key={achievement._id} achievement={achievement} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Achievement Stats Component
 * Shows achievement statistics
 */
export function AchievementStats() {
  const { user } = useUser();
  const achievements = useQuery(
    api.memberCheckIns.getMemberAchievements,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const totalAchievements = achievements?.length || 0;
  const recentAchievements = achievements?.slice(0, 3) || [];
  
  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Achievement Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-3xl font-bold text-white">
              {totalAchievements}
            </div>
            <div className="text-sm text-white/70">
              Total Achievements
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">
              {achievements?.filter(a => {
                const daysSince = (Date.now() - a.unlockedAt) / (1000 * 60 * 60 * 24);
                return daysSince <= 7;
              }).length || 0}
            </div>
            <div className="text-sm text-white/70">
              This Week
            </div>
          </div>
        </div>
        
        {recentAchievements.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white mb-2">Recent Achievements</h4>
            <div className="space-y-2">
              {recentAchievements.map((achievement) => (
                <div key={achievement._id} className="flex items-center gap-2 text-sm">
                  <span>{achievement.icon}</span>
                  <span className="text-white/90">{achievement.title}</span>
                  <span className="text-white/50 text-xs ml-auto">
                    {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
