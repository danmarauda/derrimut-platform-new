/**
 * Fitness plan and AI-related type definitions
 */

export interface WorkoutRoutine {
  name: string;
  sets: number;
  reps: number;
}

export interface WorkoutDay {
  day: string;
  routines: WorkoutRoutine[];
}

export interface WorkoutPlan {
  schedule: string[];
  exercises: WorkoutDay[];
}

export interface DietMeal {
  name: string;
  foods: string[];
}

export interface DietPlan {
  dailyCalories: number;
  meals: DietMeal[];
}

export interface FitnessPlanRequest {
  user_id: string;
  age: number;
  height: number;
  weight: number;
  injuries: string;
  workout_days: number;
  fitness_goal: string;
  fitness_level: string;
  dietary_restrictions: string;
}

export interface FitnessPlanResponse {
  success: boolean;
  data?: {
    planId: string;
    workoutPlan: WorkoutPlan;
    dietPlan: DietPlan;
  };
  error?: string;
}
