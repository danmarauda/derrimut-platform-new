/**
 * User Validation Schemas
 *
 * Zod schemas for validating user-related data.
 *
 * Task: 2.1 - Input Validation
 */

import { z } from 'zod';

// Role enum
export const roleSchema = z.enum([
  'member',
  'trainer',
  'admin',
  'super_admin',
  'location_admin'
], {
  errorMap: () => ({ message: 'Invalid role' })
});

// User profile schema
export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+61|0)[2-478]( ?\d){8}$/, 'Invalid Australian phone number').optional(),
  dateOfBirth: z.string().datetime().optional(),
  emergencyContact: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(/^(\+61|0)[2-478]( ?\d){8}$/),
    relationship: z.string().max(50).optional(),
  }).optional(),
});

// Create user schema (from webhook)
export const createUserSchema = z.object({
  clerkId: z.string().min(1, 'Clerk ID is required'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  image: z.string().url('Invalid image URL').optional(),
  role: roleSchema.default('member'),
});

// Update user schema
export const updateUserSchema = z.object({
  clerkId: z.string().min(1, 'Clerk ID is required'),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(1).max(100).optional(),
  image: z.string().url('Invalid image URL').optional(),
  phone: z.string().regex(/^(\+61|0)[2-478]( ?\d){8}$/).optional(),
  dateOfBirth: z.string().datetime().optional(),
});

// Update role schema
export const updateRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: roleSchema,
});

// Fitness profile schema
export const fitnessProfileSchema = z.object({
  age: z.number().int().min(13, 'Must be at least 13 years old').max(120, 'Invalid age'),
  height: z.number().positive('Height must be positive').max(300, 'Invalid height'),
  weight: z.number().positive('Weight must be positive').max(500, 'Invalid weight'),
  fitnessGoal: z.enum([
    'lose_weight',
    'build_muscle',
    'improve_endurance',
    'increase_flexibility',
    'general_fitness',
    'sports_performance',
  ]),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  injuries: z.string().max(500, 'Description too long').optional(),
  dietaryRestrictions: z.string().max(500, 'Description too long').optional(),
  workoutDays: z.number().int().min(1, 'At least 1 workout day').max(7, 'Maximum 7 workout days'),
});

// AI program generation schema
export const generateProgramSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  age: z.number().int().min(13).max(120),
  height: z.number().positive().max(300),
  weight: z.number().positive().max(500),
  fitness_goal: z.string().min(1, 'Fitness goal is required'),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']),
  workout_days: z.number().int().min(1).max(7),
  injuries: z.string().max(500).optional().default('None'),
  dietary_restrictions: z.string().max(500).optional().default('None'),
});

// Type exports
export type Role = z.infer<typeof roleSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type FitnessProfile = z.infer<typeof fitnessProfileSchema>;
export type GenerateProgramInput = z.infer<typeof generateProgramSchema>;
