import { NextResponse } from "next/server";
import { registerCustomer } from "@/lib/user-store";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, password, confirmPassword } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email ID is required" }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "Contact number is required" }, { status: 400 });
    }
    if (!address || !address.trim()) {
      return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password and Confirm Password do not match" },
        { status: 400 }
      );
    }

    const result = registerCustomer({
      name,
      email,
      phone,
      address,
      password,
    });

    if (!result.success || !result.customer) {
      return NextResponse.json({ error: result.error || "Registration failed" }, { status: 400 });
    }

    // Attempt Supabase signUp if configured
    try {
      const supabase = createClient();
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone,
            address,
          },
        },
      });
    } catch {
      // In local/mock mode, memory store is sufficient
    }

    const { password: _, ...safeCustomer } = result.customer;

    return NextResponse.json({
      success: true,
      message: "Customer registered successfully",
      customer: safeCustomer,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
