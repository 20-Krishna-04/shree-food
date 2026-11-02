import crypto from "crypto";
import Razorpay from "razorpay";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

export function isRazorpayConfigured(): boolean {
  return Boolean(
    razorpayKeyId &&
    razorpayKeySecret &&
    !razorpayKeyId.includes("yourkeyid") &&
    !razorpayKeySecret.includes("your_razorpay_secret")
  );
}

export function getRazorpayClient(): Razorpay | null {
  if (!isRazorpayConfigured()) {
    return null;
  }
  return new Razorpay({
    key_id: razorpayKeyId!,
    key_secret: razorpayKeySecret!,
  });
}

export interface PaymentOrderResult {
  provider_order_id: string;
  amount: number;
  currency: string;
  key_id?: string;
  is_simulation: boolean;
}

/**
 * Creates a payment order via Razorpay API or generates a safe development simulation order
 */
export async function createPaymentOrder(
  orderId: string,
  amountInRupees: number
): Promise<PaymentOrderResult> {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (isRazorpayConfigured()) {
    try {
      const razorpay = getRazorpayClient()!;
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${orderId.slice(0, 16)}`,
        notes: {
          cloud_kitchen_order_id: orderId,
        },
      });

      return {
        provider_order_id: rzpOrder.id,
        amount: amountInRupees,
        currency: "INR",
        key_id: razorpayKeyId,
        is_simulation: false,
      };
    } catch (error) {
      console.error("Razorpay order creation failed, falling back to simulation:", error);
    }
  }

  // Explicitly labeled development simulation
  return {
    provider_order_id: `sim_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    amount: amountInRupees,
    currency: "INR",
    is_simulation: true,
  };
}

/**
 * Verifies Razorpay payment signature cryptographically (HMAC SHA256)
 */
export function verifyPaymentSignature(
  providerOrderId: string,
  providerPaymentId: string,
  signature: string
): boolean {
  if (!razorpayKeySecret) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${providerOrderId}|${providerPaymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Verifies Razorpay webhook signature
 */
export function verifyWebhookSignature(
  payloadString: string,
  receivedSignature: string,
  webhookSecret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payloadString)
    .digest("hex");

  return expectedSignature === receivedSignature;
}
