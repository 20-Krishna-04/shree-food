import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("id", params.id)
      .single();

    if (!error && product) {
      return NextResponse.json({
        success: true,
        data: {
          ...product,
          category_name: product.categories?.name,
        },
      });
    }

    // Fallback lookup from mock catalogue
    const mockItem = MOCK_PRODUCTS.find((p) => p.id === params.id);
    if (mockItem) {
      return NextResponse.json({ success: true, data: mockItem });
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  return PUT(request, context);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
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
    const partialSchema = productSchema.partial();
    const validation = partialSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .update(validation.data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
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

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
