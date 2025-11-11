import { httpRouter } from "convex/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction, type ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import type { WorkoutPlan, DietPlan, WorkoutDay, WorkoutRoutine, DietMeal, FitnessPlanRequest } from "../src/types/fitness";
import type { StripeSession, StripeSubscription, ShippingAddress, BookingSessionMetadata, MarketplaceSessionMetadata } from "../src/types/stripe";

const http = httpRouter();

/**
 * Call AI Gateway API route to generate text
 * This uses Vercel AI Gateway for rate limiting, cost tracking, and monitoring
 */
async function generateTextViaGateway(prompt: string, model: string = "gemini-2.5-flash", temperature: number = 0.4, responseFormat?: { type: 'json_object' }): Promise<string> {
  // Get the Next.js app URL from environment or use default
  const nextjsUrl = process.env.NEXTJS_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/convex', '') || 'http://localhost:3000';
  const apiUrl = `${nextjsUrl}/api/ai/generate`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model,
      temperature,
      responseFormat,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`AI Gateway error: ${error.error || response.statusText}`);
  }

  const data = await response.json();
  return data.text;
}

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("No svix headers found", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    // Handle user events
    if (eventType === "user.created") {
      const { id, first_name, last_name, image_url, email_addresses } = evt.data;

      const email = email_addresses[0].email_address;

      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          email,
          name,
          image: image_url,
          clerkId: id,
        });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.updateUser, {
          clerkId: id,
          email,
          name,
          image: image_url,
        });
      } catch (error) {
        console.log("Error updating user:", error);
        return new Response("Error updating user", { status: 500 });
      }
    }

    // Handle organization events
    if (eventType === "organization.created") {
      const { id, name, slug, created_by } = evt.data;
      
      // Validate required fields
      if (!created_by) {
        console.log("Error: organization.created event missing created_by field");
        return new Response("Missing created_by field", { status: 400 });
      }
      
      try {
        // Get admin user
        const adminClerkId = created_by;
        
        // Create organization in Convex
        // Note: Full organization details should be set via admin interface
        // This creates a basic record that can be updated later
        await ctx.runMutation(api.organizations.createOrUpdateOrganization, {
          clerkOrganizationId: id,
          name: name || "New Location",
          slug: slug || id.toLowerCase().replace(/_/g, "-"),
          adminClerkId: adminClerkId,
          address: {
            street: "",
            city: "",
            state: "",
            postcode: "",
            country: "Australia",
          },
          type: "location",
          is24Hours: true,
          features: [],
        });
      } catch (error) {
        console.log("Error creating organization:", error);
        return new Response("Error creating organization", { status: 500 });
      }
    }

    if (eventType === "organization.updated") {
      const { id, name, slug } = evt.data;
      
      try {
        const organization = await ctx.runQuery(api.organizations.getOrganizationByClerkId, {
          clerkOrganizationId: id,
        });
        
        if (organization) {
          await ctx.runMutation(api.organizations.updateOrganization, {
            organizationId: organization._id,
            name: name,
          });
        }
      } catch (error) {
        console.log("Error updating organization:", error);
        return new Response("Error updating organization", { status: 500 });
      }
    }

    if (eventType === "organizationMembership.created") {
      const { organization, public_user_data } = evt.data;
      
      try {
        const org = await ctx.runQuery(api.organizations.getOrganizationByClerkId, {
          clerkOrganizationId: organization.id,
        });
        
        if (org && public_user_data?.user_id) {
          await ctx.runMutation(api.organizations.addMemberToOrganization, {
            organizationId: org._id,
            userClerkId: public_user_data.user_id,
            role: "org_member",
          });
        }
      } catch (error) {
        console.log("Error adding member to organization:", error);
        // Don't fail the webhook, just log the error
      }
    }

    if (eventType === "organizationMembership.deleted") {
      const { organization, public_user_data } = evt.data;
      
      try {
        const org = await ctx.runQuery(api.organizations.getOrganizationByClerkId, {
          clerkOrganizationId: organization.id,
        });
        
        if (org && public_user_data?.user_id) {
          await ctx.runMutation(api.organizations.removeMemberFromOrganization, {
            organizationId: org._id,
            userClerkId: public_user_data.user_id,
          });
        }
      } catch (error) {
        console.log("Error removing member from organization:", error);
        // Don't fail the webhook, just log the error
      }
    }

    return new Response("Webhooks processed successfully", { status: 200 });
  }),
});

// validate and fix workout plan to ensure it has proper numeric types
function validateWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  const validatedPlan: WorkoutPlan = {
    schedule: plan.schedule,
    exercises: plan.exercises.map((exercise: WorkoutDay) => ({
      day: exercise.day,
      routines: exercise.routines.map((routine: WorkoutRoutine) => ({
        name: routine.name,
        sets: typeof routine.sets === "number" ? routine.sets : parseInt(String(routine.sets)) || 1,
        reps: typeof routine.reps === "number" ? routine.reps : parseInt(String(routine.reps)) || 10,
      })),
    })),
  };
  return validatedPlan;
}

// validate diet plan to ensure it strictly follows schema
function validateDietPlan(plan: DietPlan): DietPlan {
  // only keep the fields we want
  const validatedPlan: DietPlan = {
    dailyCalories: plan.dailyCalories,
    meals: plan.meals.map((meal: DietMeal) => ({
      name: meal.name,
      foods: meal.foods,
    })),
  };
  return validatedPlan;
}

http.route({
  path: "/vapi/generate-program",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json() as FitnessPlanRequest;

      const {
        user_id,
        age,
        height,
        weight,
        injuries,
        workout_days,
        fitness_goal,
        fitness_level,
        dietary_restrictions,
      } = payload;

      console.log("Payload is here:", payload);

      const workoutPrompt = `You are an experienced fitness coach creating a personalized workout plan based on:
      Age: ${age}
      Height: ${height}
      Weight: ${weight}
      Injuries or limitations: ${injuries}
      Available days for workout: ${workout_days}
      Fitness goal: ${fitness_goal}
      Fitness level: ${fitness_level}
      
      As a professional coach:
      - Consider muscle group splits to avoid overtraining the same muscles on consecutive days
      - Design exercises that match the fitness level and account for any injuries
      - Structure the workouts to specifically target the user's fitness goal
      
      CRITICAL SCHEMA INSTRUCTIONS:
      - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
      - "sets" and "reps" MUST ALWAYS be NUMBERS, never strings
      - For example: "sets": 3, "reps": 10
      - Do NOT use text like "reps": "As many as possible" or "reps": "To failure"
      - Instead use specific numbers like "reps": 12 or "reps": 15
      - For cardio, use "sets": 1, "reps": 1 or another appropriate number
      - NEVER include strings for numerical fields
      - NEVER add extra fields not shown in the example below
      
      Return a JSON object with this EXACT structure:
      {
        "schedule": ["Monday", "Wednesday", "Friday"],
        "exercises": [
          {
            "day": "Monday",
            "routines": [
              {
                "name": "Exercise Name",
                "sets": 3,
                "reps": 10
              }
            ]
          }
        ]
      }
      
      DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

      // Generate workout plan using Vercel AI Gateway
      const workoutPlanText = await generateTextViaGateway(
        workoutPrompt,
        "gemini-2.5-flash",
        0.4,
        { type: 'json_object' }
      );

      // VALIDATE THE INPUT COMING FROM AI
      let workoutPlan = JSON.parse(workoutPlanText);
      workoutPlan = validateWorkoutPlan(workoutPlan);

      const dietPrompt = `You are an experienced nutrition coach creating a personalized diet plan based on:
        Age: ${age}
        Height: ${height}
        Weight: ${weight}
        Fitness goal: ${fitness_goal}
        Dietary restrictions: ${dietary_restrictions}
        
        As a professional nutrition coach:
        - Calculate appropriate daily calorie intake based on the person's stats and goals
        - Create a balanced meal plan with proper macronutrient distribution
        - Include a variety of nutrient-dense foods while respecting dietary restrictions
        - Consider meal timing around workouts for optimal performance and recovery
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
        - "dailyCalories" MUST be a NUMBER, not a string
        - DO NOT add fields like "supplements", "macros", "notes", or ANYTHING else
        - ONLY include the EXACT fields shown in the example below
        - Each meal should include ONLY a "name" and "foods" array

        Return a JSON object with this EXACT structure and no other fields:
        {
          "dailyCalories": 2000,
          "meals": [
            {
              "name": "Breakfast",
              "foods": ["Oatmeal with berries", "Greek yogurt", "Black coffee"]
            },
            {
              "name": "Lunch",
              "foods": ["Grilled chicken salad", "Whole grain bread", "Water"]
            }
          ]
        }
        
        DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

      // Generate diet plan using Vercel AI Gateway
      const dietPlanText = await generateTextViaGateway(
        dietPrompt,
        "gemini-2.5-flash",
        0.4,
        { type: 'json_object' }
      );

      // VALIDATE THE INPUT COMING FROM AI
      let dietPlan = JSON.parse(dietPlanText);
      dietPlan = validateDietPlan(dietPlan);

      // save to our DB: CONVEX
      const planId = await ctx.runMutation(api.plans.createPlan, {
        userId: user_id,
        dietPlan,
        isActive: true,
        workoutPlan,
        name: `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            planId,
            workoutPlan,
            dietPlan,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error generating fitness plan:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Stripe webhook endpoint
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    console.log("🔥 Stripe webhook received!");
    console.log("📝 Request method:", request.method);
    console.log("🔗 Request URL:", request.url);
    
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      console.error("❌ Missing STRIPE_SECRET_KEY environment variable");
      console.error("💡 Set it in Convex dashboard: Settings > Environment Variables");
      throw new Error("Missing STRIPE_SECRET_KEY environment variable. Set it in Convex dashboard.");
    }

    if (!webhookSecret) {
      console.error("❌ Missing STRIPE_WEBHOOK_SECRET environment variable");
      console.error("💡 Set it in Convex dashboard: Settings > Environment Variables");
      throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable. Set it in Convex dashboard.");
    }
    
    const stripe = require("stripe")(stripeSecretKey);

    const body = await request.text();
    const sig = request.headers.get("stripe-signature");
    console.log("📝 Body length:", body.length);
    console.log("🔐 Signature present:", !!sig);
    console.log("🔐 Signature value:", sig);
    console.log("📋 Body preview:", body.substring(0, 200) + "...");

    let event;

    try {
      // For development/testing, check if this is a test webhook
      if (sig === "test-signature-for-development") {
        // This is a test webhook - parse the body as JSON
        event = JSON.parse(body);
        console.log("🧪 Processing test webhook event");
      } else if (!sig) {
        console.log("❌ No signature provided");
        return new Response("No signature", { status: 400 });
      } else {
        // Real Stripe webhook - verify signature
        event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
        console.log("✅ Webhook verified successfully");
      }
      console.log("📩 Event type:", event.type);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log(`❌ Webhook signature verification failed.`, errorMessage);
      // In development, if signature fails but we have a test event, try to parse it anyway
      if (body.includes('"type":"checkout.session.completed"') || body.includes('"type":"customer.subscription')) {
        try {
          event = JSON.parse(body);
          console.log("⚠️ Using fallback parsing for development");
        } catch (parseErr) {
          return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
        }
      } else {
        return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
      }
    }

    try {
      console.log("🔄 Processing event:", event.type);
      
      // Idempotency check: Check if this event has already been processed
      const eventId = event.id || `stripe_${Date.now()}_${Math.random()}`;
      const existingEvent = await ctx.runQuery(api.webhooks.getWebhookEvent, { eventId });
      
      if (existingEvent?.processed) {
        console.log("⚠️ Event already processed:", eventId);
        return new Response("Event already processed", { status: 200 });
      }
      
      // Mark event as processing
      await ctx.runMutation(api.webhooks.createWebhookEvent, {
        eventId,
        eventType: event.type,
        processed: false,
      });
      
      try {
        switch (event.type) {
        case "customer.subscription.created":
          console.log("💳 Processing subscription creation event");
          const createdSubscription = event.data.object;
          const createdCustomerId = createdSubscription.customer;
          console.log("👤 Customer ID:", createdCustomerId);
          console.log("📋 Subscription ID:", createdSubscription.id);
          
          // Get the checkout session that created this subscription
          const createdCheckoutSessions = await stripe.checkout.sessions.list({
            customer: createdCustomerId,
            limit: 10, // Get more sessions to find the right one
          });
          console.log("🛒 Found checkout sessions:", createdCheckoutSessions.data.length);
          
          let createdClerkId;
          let createdSessionMembershipType;
          
          // Find the session with metadata
          for (const session of createdCheckoutSessions.data) {
            if (session.metadata?.clerkId) {
              createdClerkId = session.metadata.clerkId;
              createdSessionMembershipType = session.metadata.membershipType;
              console.log("✅ Found metadata - ClerkId:", createdClerkId, "Type:", createdSessionMembershipType);
              break;
            }
          }

          if (!createdClerkId) {
            console.log("❌ No clerkId found in checkout session metadata for customer:", createdCustomerId);
            console.log("📋 Available sessions:", createdCheckoutSessions.data.map((s: any) => ({ id: s.id, metadata: s.metadata })));
            break;
          }

          // Update customer with metadata for future reference
          await stripe.customers.update(createdCustomerId, {
            metadata: { clerkId: createdClerkId }
          });

          // Get user from database
          const createdUser = await ctx.runQuery(api.users.getUserByClerkId, { clerkId: createdClerkId });
          if (!createdUser) {
            console.log("User not found for clerkId:", createdClerkId);
            break;
          }

          // Determine membership type from price ID or product ID
          const createdPriceId = createdSubscription.items.data[0].price.id;
          const createdProductId = createdSubscription.items.data[0].price.product;
          let createdMembershipType: "18-month-minimum" | "12-month-minimum" | "no-lock-in" | "12-month-upfront" = "18-month-minimum";
          
          // First try to get from session metadata if available
          if (createdSessionMembershipType) {
            const validTypes = ["18-month-minimum", "12-month-minimum", "no-lock-in", "12-month-upfront"];
            if (validTypes.includes(createdSessionMembershipType)) {
              createdMembershipType = createdSessionMembershipType as "18-month-minimum" | "12-month-minimum" | "no-lock-in" | "12-month-upfront";
            }
          } else {
            // Fallback to mapping product IDs to membership types - Updated with actual Derrimut product IDs
            switch (createdProductId) {
              case "prod_TO13HhWD4id9gk":
                createdMembershipType = "18-month-minimum";
                break;
              case "prod_TO13WeOKja1J3f":
                createdMembershipType = "12-month-minimum";
                break;
              case "prod_TO13CDZ0wbRcI2":
                createdMembershipType = "no-lock-in";
                break;
              case "prod_TO132agrJCpBrJ":
                createdMembershipType = "12-month-upfront";
                break;
              default:
                console.log("Unknown product ID:", createdProductId);
                createdMembershipType = "18-month-minimum";
                break;
            }
          }

          console.log("🎯 Creating membership with type:", createdMembershipType);
          console.log("👤 User ClerkId:", createdClerkId);
          console.log("💳 Stripe details:", { customerId: createdCustomerId, subscriptionId: createdSubscription.id, priceId: createdPriceId });
          console.log("📅 Subscription periods:", {
            current_period_start: createdSubscription.current_period_start,
            current_period_end: createdSubscription.current_period_end,
            start_date: createdSubscription.start_date,
            created: createdSubscription.created
          });

          // Calculate periods dynamically if not available
          let createdCurrentPeriodStart = createdSubscription.current_period_start;
          let createdCurrentPeriodEnd = createdSubscription.current_period_end;
          
          if (!createdCurrentPeriodStart || !createdCurrentPeriodEnd) {
            // Use subscription start date if current period not available
            const now = Math.floor(Date.now() / 1000);
            createdCurrentPeriodStart = createdSubscription.start_date || createdSubscription.created || now;
            
            // Calculate end date based on plan (assuming monthly billing)
            createdCurrentPeriodEnd = createdCurrentPeriodStart + (30 * 24 * 60 * 60); // 30 days in seconds
            
            console.log("⚠️ Using calculated periods:", {
              calculatedStart: createdCurrentPeriodStart,
              calculatedEnd: createdCurrentPeriodEnd
            });
          }

          await ctx.runMutation(api.memberships.upsertMembership, {
            userId: createdUser._id,
            clerkId: createdClerkId,
            membershipType: createdMembershipType,
            stripeCustomerId: createdCustomerId,
            stripeSubscriptionId: createdSubscription.id,
            stripePriceId: createdPriceId,
            currentPeriodStart: createdCurrentPeriodStart * 1000,
            currentPeriodEnd: createdCurrentPeriodEnd * 1000,
          });
          
          console.log("✅ Membership created successfully!");

          // Send membership welcome email
          try {
            const plan = await ctx.runQuery(api.memberships.getMembershipPlanByType, {
              membershipType: createdMembershipType,
            });

            if (createdUser.email && plan) {
              await ctx.runAction(api.emails.sendMembershipWelcome, {
                to: createdUser.email,
                userName: createdUser.name || "Member",
                membershipType: createdMembershipType,
                startDate: new Date(createdCurrentPeriodStart * 1000).toISOString(),
                endDate: new Date(createdCurrentPeriodEnd * 1000).toISOString(),
                price: plan.price,
              });
              console.log("✅ Membership welcome email sent");
            }
          } catch (emailError) {
            console.error("⚠️ Error sending membership welcome email:", emailError);
            // Don't fail the membership if email fails
          }
          break;

        case "customer.subscription.updated":
          console.log("🔄 Processing subscription update event");
          const updatedSubscription = event.data.object;
          console.log("📋 Updated Subscription ID:", updatedSubscription.id);
          console.log("🚫 Cancel at period end:", updatedSubscription.cancel_at_period_end);
          console.log("📊 Subscription status:", updatedSubscription.status);
          console.log("📅 Period start:", updatedSubscription.current_period_start);
          console.log("📅 Period end:", updatedSubscription.current_period_end);

          // Only include period dates if they exist and are valid
          const updateData: {
            stripeSubscriptionId: string;
            status: "active" | "cancelled";
            cancelAtPeriodEnd: boolean;
            currentPeriodStart?: number;
            currentPeriodEnd?: number;
          } = {
            stripeSubscriptionId: updatedSubscription.id,
            status: updatedSubscription.status === "active" ? "active" : "cancelled",
            cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end || false,
          };
          
          if (updatedSubscription.current_period_start && updatedSubscription.current_period_end) {
            updateData.currentPeriodStart = updatedSubscription.current_period_start * 1000;
            updateData.currentPeriodEnd = updatedSubscription.current_period_end * 1000;
            console.log("📅 Including period updates:", {
              start: updateData.currentPeriodStart,
              end: updateData.currentPeriodEnd
            });
          } else {
            console.log("⚠️ Skipping period updates - no valid period data");
          }
          
          // Update the existing membership with the new subscription details
          await ctx.runMutation(api.memberships.updateMembershipStatus, updateData);
          
          console.log("✅ Membership updated successfully from webhook!");
          break;

        case "customer.subscription.deleted":
          const deletedSubscription = event.data.object;
          await ctx.runMutation(api.memberships.updateMembershipStatus, {
            stripeSubscriptionId: deletedSubscription.id,
            status: "cancelled",
          });
          break;

        case "checkout.session.completed":
          console.log("💳 Processing checkout.session.completed");
          const session = event.data.object;
          console.log("📋 Session ID:", session.id);
          console.log("📋 Session mode:", session.mode);
          console.log("📋 Session metadata:", JSON.stringify(session.metadata, null, 2));
          
          if (session.mode === "subscription") {
            console.log("🏋️ Subscription checkout - handled by subscription events");
            // Subscription checkouts are handled by customer.subscription.created
          } else if (session.mode === "payment") {
            console.log("💰 Payment checkout detected");
            
            if (session.metadata?.type === "marketplace_order") {
              console.log("🛒 Processing marketplace order");
              await handleMarketplaceOrder(ctx, session);
            } else if (session.metadata?.type === "booking") {
              console.log("📅 Processing booking payment");
              await handleBookingPayment(ctx, session);
            } else {
              console.log("⚠️ Unknown payment type - treating as booking");
              await handleBookingPayment(ctx, session);
            }
          }
          break;

        case "invoice.payment_succeeded":
          const invoice = event.data.object;
          if (invoice.subscription) {
            await ctx.runMutation(api.memberships.updateMembershipStatus, {
              stripeSubscriptionId: invoice.subscription,
              status: "active",
              currentPeriodStart: invoice.period_start * 1000,
              currentPeriodEnd: invoice.period_end * 1000,
            });
          }
          break;

        case "invoice.payment_failed":
          const failedInvoice = event.data.object;
          if (failedInvoice.subscription) {
            await ctx.runMutation(api.memberships.updateMembershipStatus, {
              stripeSubscriptionId: failedInvoice.subscription,
              status: "pending",
            });
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
        }
        
        // Mark event as successfully processed
        await ctx.runMutation(api.webhooks.markWebhookEventProcessed, {
          eventId,
          processed: true,
        });

        return new Response("Success", { status: 200 });
      } catch (processingError) {
        console.error("Error processing webhook event:", processingError);
        
        // Mark event as failed
        try {
          await ctx.runMutation(api.webhooks.markWebhookEventFailed, {
            eventId,
            error: processingError instanceof Error ? processingError.message : String(processingError),
          });
        } catch (markError) {
          console.error("Error marking webhook as failed:", markError);
        }
        
        throw processingError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }),
});

// Helper function to handle marketplace orders
async function handleMarketplaceOrder(
  ctx: ActionCtx,
  session: StripeSession
) {
  try {
    console.log("🔄 Starting marketplace order processing...");
    console.log("📋 Session payment status:", session.payment_status);
    
    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      console.error("❌ Payment not completed. Status:", session.payment_status);
      return;
    }

    const metadata = session.metadata as MarketplaceSessionMetadata | null;

    if (!metadata?.clerkId) {
      console.error("❌ No clerkId in marketplace session metadata");
      console.error("📋 Available metadata keys:", Object.keys(session.metadata || {}));
      return;
    }

    if (!metadata.shippingAddress) {
      console.error("❌ No shipping address in marketplace session metadata");
      console.error("📋 Available metadata keys:", Object.keys(session.metadata || {}));
      return;
    }

    let parsedShippingAddress: any;
    try {
      parsedShippingAddress = JSON.parse(metadata.shippingAddress);
      console.log("✅ Shipping address parsed:", parsedShippingAddress);
    } catch (error) {
      console.error("❌ Error parsing shipping address:", error);
      console.error("❌ Raw shipping address:", metadata.shippingAddress);
      return;
    }

    const { clerkId } = metadata;

    console.log("🔄 Creating order for user:", clerkId);
    
    try {
      // Map ShippingAddress to Convex schema format
      // Handle both old format (street, state, postcode) and new format (name, phone, addressLine1, etc.)
      const shippingAddressForConvex = {
        name: parsedShippingAddress.name || parsedShippingAddress.street?.split(',')[0] || "Customer",
        phone: parsedShippingAddress.phone || "",
        addressLine1: parsedShippingAddress.addressLine1 || parsedShippingAddress.street || "",
        addressLine2: parsedShippingAddress.addressLine2 || undefined,
        city: parsedShippingAddress.city || "",
        postalCode: parsedShippingAddress.postalCode || parsedShippingAddress.postcode || "",
        country: parsedShippingAddress.country || "",
        email: parsedShippingAddress.email || undefined,
      };

      // Create order from cart
      const orderResult = await ctx.runMutation(api.orders.createOrderFromCart, {
        clerkId,
        shippingAddress: shippingAddressForConvex,
        stripeSessionId: session.id,
      });

      console.log("✅ Order created successfully:", orderResult);
      console.log("✅ Order number:", orderResult.orderNumber);
      console.log("✅ Order ID:", orderResult.orderId);

      // Update payment status
      const paymentUpdate = await ctx.runMutation(api.orders.updatePaymentStatus, {
        stripeSessionId: session.id,
        paymentStatus: "paid",
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
      });

      console.log("✅ Payment status updated successfully:", paymentUpdate);
      console.log("✅ Final order number:", orderResult.orderNumber);

      // Award loyalty points for purchase (1 point per $1 spent)
      try {
        const order = await ctx.runQuery(api.orders.getOrderById, {
          orderId: orderResult.orderId,
        });
        
        if (order && order.totalAmount > 0) {
          const pointsEarned = Math.floor(order.totalAmount); // 1 point per AUD
          await ctx.scheduler.runAfter(0, api.loyalty.addPoints, {
            clerkId,
            points: pointsEarned,
            source: "purchase",
            description: `Purchase: Order ${orderResult.orderNumber}`,
            relatedId: orderResult.orderId,
          });
          console.log(`✅ Awarded ${pointsEarned} loyalty points for purchase`);
        }
      } catch (pointsError) {
        console.error("⚠️ Error awarding loyalty points:", pointsError);
        // Don't fail the order if points fail
      }

      // Send order confirmation email
      try {
        const user = await ctx.runQuery(api.users.getUserByClerkId, {
          clerkId,
        });

        const order = await ctx.runQuery(api.orders.getOrderById, {
          orderId: orderResult.orderId,
        });

        if (user && order && user.email) {
          await ctx.runAction(api.emails.sendOrderConfirmation, {
            to: user.email,
            userName: user.name || "Customer",
            orderNumber: orderResult.orderNumber,
            orderDate: new Date(order.createdAt).toISOString(),
            items: order.items.map((item: any) => ({
              name: item.productName,
              quantity: item.quantity,
              price: item.pricePerItem,
            })),
            subtotal: order.subtotal,
            shipping: order.shippingCost,
            tax: order.tax,
            total: order.totalAmount,
            shippingAddress: order.shippingAddress,
          });
          console.log("✅ Order confirmation email sent");
        }
      } catch (emailError) {
        console.error("⚠️ Error sending order confirmation email:", emailError);
        // Don't fail the order if email fails
      }
      
    } catch (convexError) {
      console.error("❌ Error with Convex operations:", convexError);
      console.error("❌ Convex error details:", convexError instanceof Error ? convexError.message : String(convexError));
      throw convexError;
    }
  } catch (error) {
    console.error("❌ Error creating marketplace order:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");
  }
}

// Helper function to handle booking payments
async function handleBookingPayment(
  ctx: ActionCtx,
  session: StripeSession
) {
  try {
    console.log("🔄 Starting booking session processing...");
    console.log("📋 Session metadata:", JSON.stringify(session.metadata, null, 2));

    const metadata = session.metadata as BookingSessionMetadata | null;

    if (!metadata) {
      console.error("❌ No metadata found in session");
      return;
    }

    const {
      userId,
      trainerId,
      sessionType,
      sessionDate,
      startTime,
      duration,
      notes,
    } = metadata;

    // Validate required fields
    if (!userId || !trainerId || !sessionType || !sessionDate || !startTime || !duration) {
      console.error("❌ Missing required metadata fields:", {
        userId: !!userId,
        trainerId: !!trainerId,
        sessionType: !!sessionType,
        sessionDate: !!sessionDate,
        startTime: !!startTime,
        duration: !!duration
      });
      return;
    }

    console.log("👤 Looking up user with Clerk ID:", userId);
    
    // Get user from Clerk ID
    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: userId,
    });

    if (!user) {
      console.error("❌ User not found with Clerk ID:", userId);
      return;
    }

    console.log("✅ User found:", user._id, "Name:", user.name);

    // Get the total amount from Stripe session
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents to AUD

    console.log("💰 Total amount:", totalAmount, "AUD");
    console.log("🏃‍♂️ Creating paid booking with data:");

    // Validate and cast sessionType
    const validSessionTypes = [
      "personal_training",
      "zumba",
      "yoga",
      "crossfit",
      "cardio",
      "strength",
      "nutrition_consultation",
      "group_class",
    ] as const;
    
    type SessionType = typeof validSessionTypes[number];
    
    if (!validSessionTypes.includes(sessionType as SessionType)) {
      console.error("❌ Invalid session type:", sessionType);
      return;
    }

    // Create the booking with paid status
    const bookingId = await ctx.runMutation(api.bookings.createPaidBooking, {
      userId: user._id,
      trainerId: trainerId as Id<"trainerProfiles">,
      userClerkId: userId,
      sessionType: sessionType as SessionType,
      sessionDate,
      startTime,
      duration: parseInt(duration),
      totalAmount,
      paymentSessionId: session.id,
      notes: notes || undefined,
    });

    console.log("✅ Paid booking created successfully:", bookingId, "for session:", session.id);

    // Send booking confirmation email
    try {
      const trainer = await ctx.runQuery(api.trainerProfiles.getTrainerById, {
        trainerId: trainerId as Id<"trainerProfiles">,
      });

      if (trainer && user.email) {
        await ctx.runAction(api.emails.sendBookingConfirmation, {
          to: user.email,
          userName: user.name || "Member",
          trainerName: trainer.name,
          sessionDate,
          sessionTime: startTime,
          sessionType,
          duration: parseInt(duration),
          bookingId: bookingId.toString(),
        });
        console.log("✅ Booking confirmation email sent");
      }
    } catch (emailError) {
      console.error("⚠️ Error sending booking confirmation email:", emailError);
      // Don't fail the booking if email fails
    }
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");
  }
}

export default http;
