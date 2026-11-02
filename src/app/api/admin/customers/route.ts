import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRegisteredCustomers } from "@/lib/user-store";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify admin role
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";
    }

    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isAdmin && !isMock) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can access customer records." },
        { status: 403 }
      );
    }

    // Try fetching real profiles and orders from Supabase
    try {
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("id, full_name, role, phone, created_at")
        .order("created_at", { ascending: false });

      const { data: orders } = await supabase
        .from("orders")
        .select("id, user_id, total_amount, payment_status, created_at");

      if (!pError && profiles && profiles.length > 0) {
        // Aggregate customer statistics
        const customers = profiles
          .filter((p) => p.role === "customer")
          .map((p) => {
            const customerOrders = orders?.filter((o) => o.user_id === p.id) || [];
            const totalOrders = customerOrders.length;
            const totalSpent = customerOrders
              .filter((o) => o.payment_status === "paid")
              .reduce((sum, o) => sum + Number(o.total_amount), 0);

            return {
              id: p.id,
              full_name: p.full_name,
              email: `${p.full_name.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
              phone: p.phone || "N/A",
              created_at: p.created_at,
              total_orders: totalOrders,
              total_spent: totalSpent,
            };
          });

        return NextResponse.json({ success: true, data: customers });
      }
    } catch {
      // In offline or fallback mode
    }

    // Real registered customer dataset (all previous dummy customers removed!)
    const registered = getRegisteredCustomers().map((c) => ({
      id: c.id,
      full_name: c.name,
      email: c.email,
      phone: c.phone || "N/A",
      address: c.address || "N/A",
      created_at: c.created_at,
      total_orders: c.total_orders || 0,
      total_spent: c.total_spent || 0,
    }));

    return NextResponse.json({ success: true, data: registered });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
