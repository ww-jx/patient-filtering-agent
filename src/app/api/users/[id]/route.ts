import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface User {
  id: string;
  email: string;
  dob?: string;
  country?: string;
  city?: string;
  gender?: string;
  firstName?: string;
  lastName?: string;
  conditions?: string[];
}

// Use the Next.js expected type for context.params
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  // Await the params promise
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Fetch user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { email, dob, country, city, gender, firstName, lastName, conditions } =
      body;

    const { data, error } = await supabase
      .from("users")
      .update({ email, dob, country, city, gender, firstName, lastName, conditions })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
