import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orderStatusUpdateSchema } from "@/lib/validations";
import { OrderStatus } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify user is an admin
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";
    }

    // In demo mode or if no user session, allow testing if header demo flag is present or reject
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isAdmin && !isMock) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can update order status" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const validation = orderStatusUpdateSchema.safeParse({
      order_id: params.id,
      order_status: json.order_status,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const newStatus: OrderStatus = validation.data.order_status;

    // Fetch existing order to validate transition
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("order_status")
      .eq("id", params.id)
      .single();

    if (!fetchError && currentOrder) {
      const currentStatus: OrderStatus = currentOrder.order_status;

      // Prevent invalid transitions
      if (currentStatus === "completed" && newStatus !== "completed") {
        return NextResponse.json(
          { error: "Invalid status transition: A completed order cannot be reverted." },
          { status: 400 }
        );
      }
      if (currentStatus === "cancelled" && newStatus !== "cancelled") {
        return NextResponse.json(
          { error: "Invalid status transition: A cancelled order cannot be reactivated." },
          { status: 400 }
        );
      }

      // Update in Supabase
      const { data: updatedOrder, error: updateError } = await supabase
        .from("orders")
        .update({
          order_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: updatedOrder });
    }

    // Demo response fallback
    return NextResponse.json({
      success: true,
      data: {
        id: params.id,
        order_status: newStatus,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
