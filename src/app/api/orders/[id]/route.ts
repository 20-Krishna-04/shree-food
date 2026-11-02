import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user is admin
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", params.id)
      .single();

    if (error || !order) {
      // In demo mode or if order in demo memory
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Ownership check: Customer can only view their own order
    if (!isAdmin && user && order.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view this order" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
