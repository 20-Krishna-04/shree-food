-- ==============================================================================
-- CLOUD KITCHEN PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status_type AS ENUM ('pending', 'in_process', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM ('pending', 'paid', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCTS (FOOD ITEMS) TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_vegetarian BOOLEAN NOT NULL DEFAULT false,
  preparation_time_mins INT DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 40.00 CHECK (delivery_fee >= 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_status payment_status_type NOT NULL DEFAULT 'pending',
  order_status order_status_type NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ORDER ITEMS (Normalized item breakdown)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  payment_provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_payment_id TEXT,
  provider_order_id TEXT,
  signature TEXT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_status payment_status_type NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);

-- 10. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 11. AUTOMATIC PROFILE CREATION ON USER SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an administrator?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --- PROFILES POLICIES ---
-- Users can read their own profile; admins can read all profiles
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admin can view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile (CANNOT change their role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Role cannot be changed by customer
  );

-- Admins can update any profile (including promoting users)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- --- CATEGORIES POLICIES ---
-- Everyone can read categories (including anonymous customers)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- Only admins can insert, update, delete categories
DROP POLICY IF EXISTS "Admins can modify categories" ON public.categories;
CREATE POLICY "Admins can modify categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- PRODUCTS POLICIES ---
-- Everyone can read products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

-- Only admins can insert, update, or delete products
DROP POLICY IF EXISTS "Admins can modify products" ON public.products;
CREATE POLICY "Admins can modify products"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- ORDERS POLICIES ---
-- Customers can view their own orders; admins can view all orders
DROP POLICY IF EXISTS "Customers view own orders or admin view all" ON public.orders;
CREATE POLICY "Customers view own orders or admin view all"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Authenticated customers can insert orders for themselves
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND payment_status = 'pending' -- Customers cannot create already-paid orders
    AND order_status = 'pending'   -- Customers cannot set order to completed
  );

-- Only admins can update order status (e.g. pending -> in_process -> completed)
-- Service role or verified payment endpoints can update payment_status
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- ORDER ITEMS POLICIES ---
DROP POLICY IF EXISTS "Users can view own order items or admin view all" ON public.order_items;
CREATE POLICY "Users can view own order items or admin view all"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- --- PAYMENTS POLICIES ---
-- Users can view their own payments; admins can view all payments
DROP POLICY IF EXISTS "Users can view own payments or admin view all" ON public.payments;
CREATE POLICY "Users can view own payments or admin view all"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Only admins or server service role can insert or update payments
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 13. ENABLE SUPABASE REALTIME REPLICATION FOR ORDERS
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
