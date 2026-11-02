import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaymentOrder } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Fetch order to get authoritative amount
    let orderAmount = 0;
    try {
      const { data: order } = await supabase
        .from("orders")
        .select("total_amount, payment_status")
        .eq("id", order_id)
        .single();

      if (order) {
        if (order.payment_status === "paid") {
          return NextResponse.json(
            { error: "This order is already paid." },
            { status: 400 }
          );
        }
        orderAmount = Number(order.total_amount);
      }
    } catch {
      // Demo order
    }

    // If order was created in demo memory or fallback, set fallback amount if zero
    if (!orderAmount) {
      orderAmount = 249; // Default fallback amount for test
    }

    const paymentOrder = await createPaymentOrder(order_id, orderAmount);

    return NextResponse.json({
      success: true,
      data: paymentOrder,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Payment order creation failed:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
