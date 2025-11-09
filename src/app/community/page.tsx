import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Trophy, TrendingUp, Heart, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Community",
  description: "Join 1000+ active members supporting each other. Share progress, get motivation, and celebrate success together.",
};

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Derrimut Community</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join 1000+ active members supporting each other. Share progress, get motivation, and celebrate success together.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.8+</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support Available</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">300+</div>
              <div className="text-sm text-muted-foreground">Success Stories</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Progress Sharing</CardTitle>
            <CardDescription>
              Share your fitness journey and inspire others with your achievements
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Heart className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Motivation & Support</CardTitle>
            <CardDescription>
              Get encouragement from fellow members and stay motivated on your fitness journey
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Trophy className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Success Celebrations</CardTitle>
            <CardDescription>
              Celebrate milestones and achievements with the community
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Card className="bg-card/50 border-primary/20">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Ready to Join the Community?</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to start sharing your progress and connecting with other members
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

