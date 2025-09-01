import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // fetch user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // construct patient profile object (exclude password_hash)
    const profile = {
      uuid: user.id,
      name: user.name || "",
      email: user.email,
      dob: user.dob,
      gender: user.gender,
      country: user.country,
      city: user.city,
      conditions: user.conditions || [],
    };

    // return profile
    return NextResponse.json({ message: "Sign in successful", profile });
  } catch (err: any) {
    console.error("SignIn error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
