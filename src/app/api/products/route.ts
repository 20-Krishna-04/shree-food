import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { productSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase();
    const vegetarian = searchParams.get("vegetarian");

    const supabase = createClient();
    let query = supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }
    if (vegetarian === "true") {
      query = query.eq("is_vegetarian", true);
    }

    const { data: dbProducts, error } = await query;

    let products = dbProducts && dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS;

    // Filter by category if using fallback data
    if (products === MOCK_PRODUCTS && categoryId && categoryId !== "all") {
      products = products.filter((p) => p.category_id === categoryId);
    }

    // Filter by vegetarian
    if (products === MOCK_PRODUCTS && vegetarian === "true") {
      products = products.filter((p) => p.is_vegetarian);
    }

    // Filter by search term
    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, data: products });
  } catch (err: unknown) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ success: true, data: MOCK_PRODUCTS });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Verify user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const json = await request.json();
    const validation = productSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert([validation.data])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
