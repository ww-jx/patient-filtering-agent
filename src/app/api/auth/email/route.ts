import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, profile } = await req.json();

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  try {
    // check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!existingUser && profile) {
      // insert new user row
      const { error: dbError } = await supabase.from("users").insert([profile]);
      if (dbError) throw dbError;
    }

    return NextResponse.json({ needsProfile: !existingUser });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
