"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Users,
  ShoppingBag,
  Clock,
  BookOpen,
  UtensilsCrossed,
  TrendingUp,
} from "lucide-react";

export default function RecommendationsPage() {
  const { user } = useUser();

  const classRecommendations = useQuery(
    api.aiRecommendations.getClassRecommendations,
    user?.id ? { clerkId: user.id, limit: 5 } : "skip"
  );
  const trainerRecommendations = useQuery(
    api.aiRecommendations.getTrainerRecommendations,
    user?.id ? { clerkId: user.id, limit: 5 } : "skip"
  );
  const productRecommendations = useQuery(
    api.aiRecommendations.getProductRecommendations,
    user?.id ? { clerkId: user.id, limit: 5 } : "skip"
  );
  const optimalWorkoutTime = useQuery(
    api.aiRecommendations.getOptimalWorkoutTime,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const blogRecommendations = useQuery(
    api.aiRecommendations.getBlogRecommendations,
    user?.id ? { clerkId: user.id, limit: 5 } : "skip"
  );
  const recipeRecommendations = useQuery(
    api.aiRecommendations.getRecipeRecommendations,
    user?.id ? { clerkId: user.id, limit: 5 } : "skip"
  );

  if (!user) {
    return null;
  }

  return (
    <UserLayout title="Recommendations" subtitle="Personalized suggestions for you">
      <div className="space-y-6">
        {/* Optimal Workout Time */}
        {optimalWorkoutTime && (
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Optimal Workout Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white mb-2">
                {optimalWorkoutTime.suggestedTime}
              </p>
              <p className="text-white/70 text-sm">
                Based on your check-in history ({optimalWorkoutTime.checkInCount} check-ins)
              </p>
              <Badge className="mt-2" variant="secondary">
                Confidence: {optimalWorkoutTime.confidence}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Class Recommendations */}
        {classRecommendations && classRecommendations.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Recommended Classes
              </CardTitle>
              <CardDescription>Classes that match your fitness goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {classRecommendations.map((classItem: any) => (
                <div
                  key={classItem._id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{classItem.name}</p>
                    <p className="text-white/60 text-sm">{classItem.description}</p>
                  </div>
                  <Badge variant="secondary">
                    Score: {classItem.recommendationScore}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Trainer Recommendations */}
        {trainerRecommendations && trainerRecommendations.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recommended Trainers
              </CardTitle>
              <CardDescription>Trainers that match your goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {trainerRecommendations.map((trainer: any) => (
                <div
                  key={trainer._id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{trainer.name}</p>
                    <p className="text-white/60 text-sm">
                      {trainer.specializations?.join(", ") || "General fitness"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Score: {trainer.recommendationScore}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Product Recommendations */}
        {productRecommendations && productRecommendations.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Recommended Products
              </CardTitle>
              <CardDescription>Products you might like</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {productRecommendations.map((product: any) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-white/60 text-sm">${product.price}</p>
                  </div>
                  <Badge variant="secondary">
                    Score: {product.recommendationScore}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Blog Recommendations */}
        {blogRecommendations && blogRecommendations.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recommended Articles
              </CardTitle>
              <CardDescription>Articles relevant to your goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {blogRecommendations.map((post: any) => (
                <div
                  key={post._id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{post.title}</p>
                    <p className="text-white/60 text-sm">{post.category}</p>
                  </div>
                  <Badge variant="secondary">
                    Score: {post.recommendationScore}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recipe Recommendations */}
        {recipeRecommendations && recipeRecommendations.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Recommended Recipes
              </CardTitle>
              <CardDescription>Recipes that match your diet plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recipeRecommendations.map((recipe: any) => (
                <div
                  key={recipe._id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{recipe.title}</p>
                    <p className="text-white/60 text-sm">
                      {recipe.calories} cal • {recipe.protein}g protein
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Score: {recipe.recommendationScore}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}

