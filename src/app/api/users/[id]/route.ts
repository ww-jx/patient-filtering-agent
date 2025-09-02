import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, dob, country, city, gender, firstName, lastName, conditions")
      .eq("id", id)
      .single();

    if (error || !user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Fetch user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const body = await req.json();

    // Validate body fields if needed
    const { email, dob, country, city, gender, firstName, lastName, conditions } = body;

    const { data, error } = await supabase
      .from("users")
      .update({ email, dob, country, city, gender, firstName, lastName, conditions })
      .eq("id", id)
      .select()
      .single(); // Return the updated row

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
