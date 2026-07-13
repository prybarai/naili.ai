import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeServer();
    if (!stripe) {
      console.warn("Stripe webhook received but Stripe is not configured.");
      return NextResponse.json({ received: true });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("STRIPE_WEBHOOK_SECRET not configured; skipping signature verification.");
      return NextResponse.json({ received: true });
    }

    const body = await request.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as import("stripe").Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as import("stripe").Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: import("stripe").Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId || session.client_reference_id;
    if (!userId) {
      console.warn("No userId found in checkout session", session.id);
      return;
    }

    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    // Store subscription info in user_profiles or a custom subscription table
    const { error } = await supabaseAdmin.from("user_profiles").upsert(
      {
        id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        is_pro: true,
        pro_updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Failed to update user profile with subscription:", error);
    } else {
      console.log(`Subscription activated for user ${userId}`);
    }
  } catch (error) {
    console.error("Error handling checkout.session.completed:", error);
  }
}

async function handleSubscriptionChange(subscription: import("stripe").Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const status = subscription.status;
    const isActive = status === "active" || status === "trialing";
    const items = subscription.items.data;
    const priceId = items[0]?.price.id;

    // Find user by stripe_customer_id
    const { data: profiles, error: findError } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    if (findError || !profiles || profiles.length === 0) {
      console.warn(`No user found with stripe_customer_id ${customerId}`);
      return;
    }

    const userId = profiles[0].id;

    const { error } = await supabaseAdmin.from("user_profiles").upsert(
      {
        id: userId,
        is_pro: isActive,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        pro_updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Failed to update subscription status:", error);
    } else {
      console.log(`Subscription ${subscription.id} status updated to ${status} for user ${userId}`);
    }
  } catch (error) {
    console.error("Error handling subscription change:", error);
  }
}
