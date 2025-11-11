"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  Flame
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";

/**
 * Challenge Card Component
 * Displays a challenge with progress and join button
 */
export function ChallengeCard({ challenge }: { challenge: any }) {
  const { user } = useUser();
  const joinChallenge = useMutation(api.challenges.joinChallenge);
  const [isJoining, setIsJoining] = useState(false);
  
  // Get user's participation for this challenge
  const userChallenges = useQuery(
    api.challenges.getUserChallenges,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const userParticipation = userChallenges?.find(
    (uc) => uc?._id === challenge._id
  )?.participation;
  
  const progress = userParticipation 
    ? (userParticipation.progress / challenge.goal) * 100 
    : 0;
  
  const getTypeIcon = () => {
    const iconMap: Record<string, any> = {
      check_in: CheckCircle2,
      workout: Zap,
      social: Users,
      streak: Flame,
    };
    const Icon = iconMap[challenge.type] || Target;
    return <Icon className="h-5 w-5" />;
  };
  
  const handleJoin = async () => {
    try {
      setIsJoining(true);
      await joinChallenge({ challengeId: challenge._id });
    } catch (error: any) {
      alert(error.message || "Failed to join challenge");
    } finally {
      setIsJoining(false);
    }
  };
  
  return (
    <Card variant="premium">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <CardTitle>{challenge.title}</CardTitle>
          </div>
          <Badge variant={challenge.isActive ? "accent" : "standard"}>
            {challenge.isActive ? "Active" : "Ended"}
          </Badge>
        </div>
        <CardDescription>{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-white/70">
              <Users className="h-4 w-4" />
              <span>{challenge.participantCount || 0} participants</span>
            </div>
            <div className="flex items-center gap-1 text-white/70">
              <Trophy className="h-4 w-4" />
              <span>{challenge.completedCount || 0} completed</span>
            </div>
          </div>
        </div>
        
        {userParticipation ? (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/90">Progress</span>
                <span className="text-sm font-semibold text-white">
                  {userParticipation.progress} / {challenge.goal}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            {userParticipation.completed && (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Completed!</span>
              </div>
            )}
          </>
        ) : (
          <Button
            variant="primary"
            onClick={handleJoin}
            disabled={isJoining || !challenge.isActive}
            className="w-full"
          >
            {isJoining ? "Joining..." : "Join Challenge"}
          </Button>
        )}
        
        <div className="pt-3 border-t border-white/10 text-xs text-white/60">
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="h-3 w-3" />
            <span>
              Ends {formatDistanceToNow(new Date(challenge.endDate), { addSuffix: true })}
            </span>
          </div>
          {challenge.reward && (
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span>Reward: {challenge.reward}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Challenges List Component
 * Displays all active challenges
 */
export function ChallengesList() {
  const { user } = useUser();
  const challenges = useQuery(api.challenges.getActiveChallenges);
  const userChallenges = useQuery(
    api.challenges.getUserChallenges,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  if (!challenges) {
    return (
      <Card variant="premium">
        <CardContent className="py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-white/30 mx-auto mb-4 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (challenges.length === 0) {
    return (
      <Card variant="premium">
        <CardContent className="py-12">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No Active Challenges
            </h3>
            <p className="text-white/70 text-sm">
              Check back soon for new challenges!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Merge user participation data
  const challengesWithParticipation = challenges.map(challenge => {
    const participation = userChallenges?.find(
      (uc) => uc?._id === challenge._id
    )?.participation;
    return { ...challenge, participation };
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {challengesWithParticipation.map((challenge) => (
        <ChallengeCard key={challenge._id} challenge={challenge} />
      ))}
    </div>
  );
}

/**
 * Challenge Leaderboard Component
 */
export function ChallengeLeaderboard({ challengeId }: { challengeId: Id<"challenges"> }) {
  const leaderboard = useQuery(api.challenges.getChallengeLeaderboard, { challengeId, limit: 10 });
  
  if (!leaderboard) {
    return <div className="text-white/70">Loading leaderboard...</div>;
  }
  
  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={entry._id}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex-shrink-0 w-8 text-center font-bold text-white">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{entry.userName}</div>
                <div className="text-sm text-white/70">
                  {entry.progress} / {entry.challengeId ? "?" : "?"} points
                </div>
              </div>
              {entry.completed && (
                <Badge variant="premium">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
