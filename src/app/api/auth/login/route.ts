import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/user-store";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email ID is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const authResult = authenticateUser(email, password);

    if (authResult.success && authResult.user) {
      return NextResponse.json({
        success: true,
        user: authResult.user,
      });
    }

    // Try Supabase auth if in real mode
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        return NextResponse.json({
          success: true,
          user: profile || {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || "Customer",
            email: data.user.email,
            role: "customer",
            created_at: data.user.created_at,
          },
        });
      }
    } catch {
      // In local mode
    }

    return NextResponse.json(
      { error: authResult.error || "Invalid email ID or password" },
      { status: 401 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
