/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as advancedPayments from "../advancedPayments.js";
import type * as aiRecommendations from "../aiRecommendations.js";
import type * as analytics from "../analytics.js";
import type * as availability from "../availability.js";
import type * as blog from "../blog.js";
import type * as blogComments from "../blogComments.js";
import type * as bookings from "../bookings.js";
import type * as cart from "../cart.js";
import type * as challenges from "../challenges.js";
import type * as community from "../community.js";
import type * as contact from "../contact.js";
import type * as debug from "../debug.js";
import type * as demo from "../demo.js";
import type * as emails from "../emails.js";
import type * as equipmentReservations from "../equipmentReservations.js";
import type * as events from "../events.js";
import type * as friends from "../friends.js";
import type * as groupClasses from "../groupClasses.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as liveStreaming from "../liveStreaming.js";
import type * as loyalty from "../loyalty.js";
import type * as marketingAutomation from "../marketingAutomation.js";
import type * as marketplace from "../marketplace.js";
import type * as memberCheckIns from "../memberCheckIns.js";
import type * as memberMessages from "../memberMessages.js";
import type * as memberships from "../memberships.js";
import type * as migrations from "../migrations.js";
import type * as newsletter from "../newsletter.js";
import type * as notificationScheduler from "../notificationScheduler.js";
import type * as notifications from "../notifications.js";
import type * as nutritionTracking from "../nutritionTracking.js";
import type * as optimizedQueries from "../optimizedQueries.js";
import type * as orders from "../orders.js";
import type * as organizations from "../organizations.js";
import type * as plans from "../plans.js";
import type * as predictiveAnalytics from "../predictiveAnalytics.js";
import type * as progressTracking from "../progressTracking.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as recipes from "../recipes.js";
import type * as referralEmails from "../referralEmails.js";
import type * as referrals from "../referrals.js";
import type * as reviews from "../reviews.js";
import type * as salary from "../salary.js";
import type * as seedBlog from "../seedBlog.js";
import type * as seedBlogTest from "../seedBlogTest.js";
import type * as smsNotifications from "../smsNotifications.js";
import type * as socialSharing from "../socialSharing.js";
import type * as specialOffers from "../specialOffers.js";
import type * as stripeDiscounts from "../stripeDiscounts.js";
import type * as trainerProfiles from "../trainerProfiles.js";
import type * as trainers from "../trainers.js";
import type * as users from "../users.js";
import type * as videoWorkouts from "../videoWorkouts.js";
import type * as wearables from "../wearables.js";
import type * as webhooks from "../webhooks.js";
import type * as winBackCampaigns from "../winBackCampaigns.js";
import type * as workoutLogging from "../workoutLogging.js";
import type * as workoutPlanAdjustments from "../workoutPlanAdjustments.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  advancedPayments: typeof advancedPayments;
  aiRecommendations: typeof aiRecommendations;
  analytics: typeof analytics;
  availability: typeof availability;
  blog: typeof blog;
  blogComments: typeof blogComments;
  bookings: typeof bookings;
  cart: typeof cart;
  challenges: typeof challenges;
  community: typeof community;
  contact: typeof contact;
  debug: typeof debug;
  demo: typeof demo;
  emails: typeof emails;
  equipmentReservations: typeof equipmentReservations;
  events: typeof events;
  friends: typeof friends;
  groupClasses: typeof groupClasses;
  groups: typeof groups;
  http: typeof http;
  inventory: typeof inventory;
  liveStreaming: typeof liveStreaming;
  loyalty: typeof loyalty;
  marketingAutomation: typeof marketingAutomation;
  marketplace: typeof marketplace;
  memberCheckIns: typeof memberCheckIns;
  memberMessages: typeof memberMessages;
  memberships: typeof memberships;
  migrations: typeof migrations;
  newsletter: typeof newsletter;
  notificationScheduler: typeof notificationScheduler;
  notifications: typeof notifications;
  nutritionTracking: typeof nutritionTracking;
  optimizedQueries: typeof optimizedQueries;
  orders: typeof orders;
  organizations: typeof organizations;
  plans: typeof plans;
  predictiveAnalytics: typeof predictiveAnalytics;
  progressTracking: typeof progressTracking;
  pushNotifications: typeof pushNotifications;
  recipes: typeof recipes;
  referralEmails: typeof referralEmails;
  referrals: typeof referrals;
  reviews: typeof reviews;
  salary: typeof salary;
  seedBlog: typeof seedBlog;
  seedBlogTest: typeof seedBlogTest;
  smsNotifications: typeof smsNotifications;
  socialSharing: typeof socialSharing;
  specialOffers: typeof specialOffers;
  stripeDiscounts: typeof stripeDiscounts;
  trainerProfiles: typeof trainerProfiles;
  trainers: typeof trainers;
  users: typeof users;
  videoWorkouts: typeof videoWorkouts;
  wearables: typeof wearables;
  webhooks: typeof webhooks;
  winBackCampaigns: typeof winBackCampaigns;
  workoutLogging: typeof workoutLogging;
  workoutPlanAdjustments: typeof workoutPlanAdjustments;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
