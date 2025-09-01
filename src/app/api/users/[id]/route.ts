import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client with service role key for secure access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request, { params }: { params: { id: string } }) {

  const { id } = params;
  try {

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // fetch user by UUID
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, dob, country, city, gender, conditions") // explicitly select fields
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
