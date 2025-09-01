import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, password } = body;

    if (!profile.email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // insert into Supabase
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: profile.email,
          dob: profile.dob,
          country: profile.country,
          city: profile.city,
          gender: profile.gender,
          conditions: profile.conditions,
          password_hash: password,
        },
      ])
      .select("id, email, dob, country, city, gender, conditions")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // create profile object to return
    const newProfile = {
      uuid: data.id,
      email: data.email,
      dob: data.dob,
      gender: data.gender,
      country: data.country,
      city: data.city,
      conditions: data.conditions || [],
    };

    return NextResponse.json({ user: newProfile }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
