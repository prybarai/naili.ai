import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required query parameter: userId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("is_pro")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error checking pro status:", error);
      return NextResponse.json(
        { isPro: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { isPro: data?.is_pro === true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stripe check-status error:", error);
    return NextResponse.json(
      { isPro: false },
      { status: 200 }
    );
  }
}
