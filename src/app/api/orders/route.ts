import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orderCreateSchema } from "@/lib/validations";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Order } from "@/types";

// In-memory demo store for testing before database setup
const globalOrdersStore: Order[] = [];

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const json = await request.json();
    const validation = orderCreateSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { customer_name, customer_phone, delivery_address, items, notes } = validation.data;

    // 1. Fetch trusted product records to calculate trusted prices
    const productIds = items.map((i) => i.product_id);
    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, name, price, image_url, category_id, is_available")
      .in("id", productIds);

    // Build trusted product lookup
    const trustedMap = new Map<string, { id: string; name: string; price: number; image_url: string; category_id: string }>();

    if (dbProducts && dbProducts.length > 0) {
      dbProducts.forEach((p) => {
        trustedMap.set(p.id, {
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image_url: p.image_url,
          category_id: p.category_id,
        });
      });
    }

    // Fallback to MOCK_PRODUCTS if database products not found
    MOCK_PRODUCTS.forEach((p) => {
      if (!trustedMap.has(p.id)) {
        trustedMap.set(p.id, {
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.image_url,
          category_id: p.category_id,
        });
      }
    });

    // 2. Compute trusted totals independently on the server
    let calculatedSubtotal = 0;
    const validatedCartItems = [];
    const normalizedOrderItems = [];

    for (const item of items) {
      const trustedProduct = trustedMap.get(item.product_id);
      if (!trustedProduct) {
        return NextResponse.json(
          { error: `Product with ID ${item.product_id} is no longer available` },
          { status: 400 }
        );
      }

      const itemSubtotal = trustedProduct.price * item.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedCartItems.push({
        product: {
          ...trustedProduct,
          description: "",
          is_available: true,
          is_vegetarian: false,
          preparation_time_mins: 20,
        },
        quantity: item.quantity,
      });

      normalizedOrderItems.push({
        product_id: trustedProduct.id,
        product_name: trustedProduct.name,
        quantity: item.quantity,
        unit_price: trustedProduct.price,
        subtotal: itemSubtotal,
      });
    }

    const calculatedDeliveryFee = calculatedSubtotal >= 499 ? 0 : 40;
    const calculatedTotalAmount = calculatedSubtotal + calculatedDeliveryFee;

    const userId = user?.id || "u1111111-1111-1111-1111-111111111111"; // Default fallback user for demo mode
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const newOrder: Order = {
      id: orderId,
      user_id: userId,
      customer_name,
      customer_phone,
      delivery_address,
      items: validatedCartItems,
      subtotal: calculatedSubtotal,
      delivery_fee: calculatedDeliveryFee,
      total_amount: calculatedTotalAmount,
      payment_status: "pending", // Always pending upon creation
      order_status: "pending",   // Always pending upon creation
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 3. Insert into Supabase if configured
    try {
      const { data: dbOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          customer_name,
          customer_phone,
          delivery_address,
          items: validatedCartItems,
          subtotal: calculatedSubtotal,
          delivery_fee: calculatedDeliveryFee,
          total_amount: calculatedTotalAmount,
          payment_status: "pending",
          order_status: "pending",
          notes: notes || null,
        })
        .select()
        .single();

      if (!orderError && dbOrder) {
        // Insert normalized order items
        const orderItemsRows = normalizedOrderItems.map((noi) => ({
          ...noi,
          order_id: dbOrder.id,
        }));
        await supabase.from("order_items").insert(orderItemsRows);

        return NextResponse.json({ success: true, data: dbOrder });
      }
    } catch (dbErr) {
      console.warn("Supabase order insert fallback to in-memory store:", dbErr);
    }

    // Store in global memory store for demo & fallback testing
    globalOrdersStore.unshift(newOrder);

    return NextResponse.json({ success: true, data: newOrder });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get("status");

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

    // Try fetching from Supabase
    try {
      let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

      if (!isAdmin && user) {
        query = query.eq("user_id", user.id);
      }

      if (filterStatus) {
        query = query.eq("order_status", filterStatus);
      }

      const { data: dbOrders, error } = await query;
      if (!error && dbOrders && dbOrders.length > 0) {
        return NextResponse.json({ success: true, data: dbOrders });
      }
    } catch {
      // Fallback
    }

    // Fallback store
    let orders = [...globalOrdersStore];
    if (filterStatus) {
      orders = orders.filter((o) => o.order_status === filterStatus);
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
