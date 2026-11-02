export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  display_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_vegetarian: boolean;
  preparation_time_mins: number;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus = 'pending' | 'in_process' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  user_id: string;
  payment_provider: string;
  provider_payment_id?: string;
  provider_order_id?: string;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  verified_at?: string;
  created_at: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProcessOrders: number;
  completedOrders: number;
  totalRevenue: number;
}
