"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LiveOrderTrackingPage from "@/app/order-tracking/[id]/page";

export default function OrderRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      router.replace(`/order-tracking/${orderId}`);
    }
  }, [orderId, router]);

  return <LiveOrderTrackingPage />;
}
