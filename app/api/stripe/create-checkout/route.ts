import { NextRequest, NextResponse } from "next/server";
import { getStripeServer, getProPriceId } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment." },
        { status: 503, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { priceId, userId, email } = body;

    if (!priceId || !userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: priceId, userId, email" },
        { status: 400, headers: corsHeaders }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      customer_email: email,
      success_url: `https://www.naili.ai/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "https://www.naili.ai/pro",
      metadata: {
        userId,
      },
    });

    return NextResponse.json(
      { sessionId: session.id, url: session.url },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Stripe create-checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
