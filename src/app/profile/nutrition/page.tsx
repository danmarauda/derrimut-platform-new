"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UtensilsCrossed,
  Apple,
  Coffee,
  Utensils,
  Cookie,
  Zap,
  Plus,
  Search,
  Target,
  TrendingUp,
  Flame
} from "lucide-react";
import { toast } from "sonner";

export default function NutritionPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const nutritionEntries = useQuery(
    api.nutritionTracking.getNutritionEntries,
    user?.id ? { date: todayTimestamp } : "skip"
  );
  const nutritionSummary = useQuery(
    api.nutritionTracking.getNutritionSummary,
    user?.id ? { date: todayTimestamp } : "skip"
  );

  const addEntry = useMutation(api.nutritionTracking.addNutritionEntry);
  const searchFood = useMutation(api.nutritionTracking.searchFood);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <UserLayout title="Nutrition Tracking" subtitle="Track your meals and macros">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const handleAddFood = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a food name");
      return;
    }

    try {
      // In a real app, you'd search for the food and get nutrition data
      // For now, we'll use placeholder values
      await addEntry({
        date: todayTimestamp,
        mealType: "snack",
        foodName: searchQuery,
        quantity: 100,
        unit: "g",
        calories: 200,
        protein: 10,
        carbs: 30,
        fats: 5,
      });
      toast.success("Food added successfully!");
      setSearchQuery("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add food");
    }
  };

  const summary = nutritionSummary || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    targetCalories: 2000,
    calorieProgress: 0,
  };

  const macroPercentages = {
    protein: summary.totalProtein * 4,
    carbs: summary.totalCarbs * 4,
    fats: summary.totalFats * 9,
  };
  const totalMacroCalories = macroPercentages.protein + macroPercentages.carbs + macroPercentages.fats;
  const proteinPercent = totalMacroCalories > 0 ? (macroPercentages.protein / totalMacroCalories) * 100 : 0;
  const carbsPercent = totalMacroCalories > 0 ? (macroPercentages.carbs / totalMacroCalories) * 100 : 0;
  const fatsPercent = totalMacroCalories > 0 ? (macroPercentages.fats / totalMacroCalories) * 100 : 0;

  return (
    <UserLayout title="Nutrition Tracking" subtitle="Track your meals and macros">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalCalories}
                {summary.targetCalories && (
                  <span className="text-sm font-normal ml-1 text-muted-foreground">
                    / {summary.targetCalories}
                  </span>
                )}
              </div>
              {summary.targetCalories && (
                <div className="mt-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${Math.min(summary.calorieProgress || 0, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protein</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalProtein}g</div>
              <p className="text-xs text-muted-foreground mt-1">
                {proteinPercent.toFixed(0)}% of calories
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbs</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalCarbs}g</div>
              <p className="text-xs text-muted-foreground mt-1">
                {carbsPercent.toFixed(0)}% of calories
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fats</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalFats}g</div>
              <p className="text-xs text-muted-foreground mt-1">
                {fatsPercent.toFixed(0)}% of calories
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="add">Add Food</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Food Log</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nutritionEntries && nutritionEntries.length > 0 ? (
                  <div className="space-y-3">
                    {nutritionEntries.map((entry: any) => (
                      <div
                        key={entry._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {entry.mealType === "breakfast" && <Coffee className="h-4 w-4" />}
                            {entry.mealType === "lunch" && <Utensils className="h-4 w-4" />}
                            {entry.mealType === "dinner" && <UtensilsCrossed className="h-4 w-4" />}
                            {entry.mealType === "snack" && <Cookie className="h-4 w-4" />}
                            {(entry.mealType === "pre_workout" || entry.mealType === "post_workout") && (
                              <Zap className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{entry.foodName}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {entry.mealType.replace("_", " ")} • {entry.quantity}
                              {entry.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{entry.calories} kcal</p>
                          <p className="text-xs text-muted-foreground">
                            P: {entry.protein}g C: {entry.carbs}g F: {entry.fats}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-white/5">
                    <Apple className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No entries for today</p>
                    <Button onClick={() => setActiveTab("add")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Food
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Food</CardTitle>
                <CardDescription>Search and add foods to your log</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for food..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddFood();
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleAddFood}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Meal Type</Label>
                    <select className="w-full h-9 rounded-md border bg-background px-3 mt-1">
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                      <option value="pre_workout">Pre-Workout</option>
                      <option value="post_workout">Post-Workout</option>
                    </select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="100" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meal Breakdown</CardTitle>
                <CardDescription>View meals by type</CardDescription>
              </CardHeader>
              <CardContent>
                {summary.mealBreakdown && Object.keys(summary.mealBreakdown).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(summary.mealBreakdown).map(([mealType, entries]: [string, any]) => {
                      if (!entries || entries.length === 0) return null;
                      return (
                        <div key={mealType} className="space-y-2">
                          <h3 className="font-semibold capitalize">{mealType.replace(/([A-Z])/g, " $1")}</h3>
                          <div className="space-y-2">
                            {entries.map((entry: any) => (
                              <div
                                key={entry._id}
                                className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                              >
                                <span className="text-sm">{entry.foodName}</span>
                                <span className="text-sm font-medium">{entry.calories} kcal</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No meals logged yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Analytics</CardTitle>
                <CardDescription>Weekly and monthly insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg bg-white/5">
                  <p className="text-muted-foreground">Analytics charts coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
}

