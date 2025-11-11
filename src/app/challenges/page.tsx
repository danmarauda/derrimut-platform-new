"use client";

import { useUser } from "@clerk/nextjs";
import { ChallengesList } from "@/components/challenges";
import { Trophy } from "lucide-react";

export default function ChallengesPage() {
  const { user } = useUser();
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white/70">
          Please sign in to view challenges
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Challenges</h1>
        <p className="text-white/70">
          Join fitness challenges and compete with other members
        </p>
      </div>
      
      <ChallengesList />
    </div>
  );
}
