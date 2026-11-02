import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET not set; rejecting webhook");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });
    }

    if (!signature || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.warn("Invalid webhook signature received");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.notes?.cloud_kitchen_order_id;
      const razorpayPaymentId = paymentEntity.id;
      const razorpayOrderId = paymentEntity.order_id;
      const amountInRupees = paymentEntity.amount / 100;

      if (!orderId) {
        return NextResponse.json({ received: true, note: "No cloud_kitchen_order_id in notes" });
      }

      const supabase = createAdminClient();

      // Check for duplicate webhook processing
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("provider_payment_id", razorpayPaymentId)
        .single();

      if (existingPayment) {
        return NextResponse.json({ received: true, note: "Already processed" });
      }

      // Update order payment status
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Record payment
      await supabase.from("payments").insert({
        order_id: orderId,
        user_id: paymentEntity.notes?.user_id || "auth-user",
        payment_provider: "razorpay_webhook",
        provider_payment_id: razorpayPaymentId,
        provider_order_id: razorpayOrderId,
        amount: amountInRupees,
        currency: paymentEntity.currency || "INR",
        payment_status: "paid",
        verified_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
