"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Clock,
  User,
  Heart,
  BookOpen,
  Utensils,
  Target
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Recipe {
  _id: any;
  name: string;
  description: string;
  imageUrl?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  category: string;
  difficulty: string;
  calories: number;
  authorName?: string;
  _creationTime?: number;
}

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-emerald-500/20 border-emerald-500/30 text-emerald-400";
      case "medium":
        return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400";
      case "hard":
        return "bg-red-500/20 border-red-500/30 text-red-400";
      default:
        return "bg-white/10 border-white/20 text-white/70";
    }
  };

  return (
    <Link href={`/recipes/${recipe._id}`}>
      <Card variant="premium" className="h-full hover:bg-white/10 transition-colors cursor-pointer group">
        {recipe.imageUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
            <Image
              src={recipe.imageUrl}
              alt={recipe.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              <Badge variant="standard" className={getDifficultyColor(recipe.difficulty)}>
                {recipe.difficulty}
              </Badge>
            </div>
          </div>
        )}
        <CardContent className="p-6">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-white/80 transition-colors">
            {recipe.name}
          </h3>
          <p className="text-white/60 text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(recipe.prepTime + recipe.cookTime)}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {recipe.servings} servings
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {recipe.calories} cal
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface RecipeSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
  categories: Array<{ value: string; label: string; icon?: any }>;
}

export function RecipeSearch({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  categories 
}: RecipeSearchProps) {
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === undefined || selectedCategory === "" ? "primary" : "tertiary"}
          size="sm"
          onClick={() => onCategoryChange("")}
        >
          All Recipes
        </Button>
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "primary" : "tertiary"}
              size="sm"
              onClick={() => onCategoryChange(category.value)}
            >
              {Icon && <Icon className="h-4 w-4 mr-2" />}
              {category.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}