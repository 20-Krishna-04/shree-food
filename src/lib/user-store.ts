import { UserProfile } from "@/types";

export interface RegisteredCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  role: "customer";
  created_at: string;
  total_orders: number;
  total_spent: number;
}

// Single Admin Definition
export const SINGLE_ADMIN = {
  id: "u-admin-shreefood-001",
  email: "admin@shreefood.com",
  password: "admin123",
  name: "श्री फूड Admin",
  role: "admin" as const,
  phone: "+91 92843 66544",
  address: "श्री फूड Cloud Kitchen Facility",
  created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
};

// Global in-memory customer store attached to globalThis to share state across Next.js route chunks
const globalForUsers = globalThis as unknown as {
  globalCustomerStore?: RegisteredCustomer[];
};

export const globalCustomerStore: RegisteredCustomer[] =
  globalForUsers.globalCustomerStore || [];

globalForUsers.globalCustomerStore = globalCustomerStore;

export function getRegisteredCustomers(): RegisteredCustomer[] {
  return [...globalCustomerStore];
}

export function findCustomerByEmail(email: string): RegisteredCustomer | undefined {
  const normalized = email.trim().toLowerCase();
  return globalCustomerStore.find((c) => c.email.trim().toLowerCase() === normalized);
}

export function registerCustomer(params: {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}): { success: boolean; customer?: RegisteredCustomer; error?: string } {
  const { name, email, phone, address, password } = params;

  if (!name?.trim()) return { success: false, error: "Name is required" };
  if (!email?.trim()) return { success: false, error: "Email is required" };
  if (!phone?.trim()) return { success: false, error: "Contact number is required" };
  if (!address?.trim()) return { success: false, error: "Address is required" };
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Ensure customer does not register with the admin email
  if (
    normalizedEmail === SINGLE_ADMIN.email.toLowerCase() ||
    normalizedEmail === "admin@cloudkitchen.com"
  ) {
    return { success: false, error: "This email address is reserved for the Kitchen Administrator" };
  }

  // Check if customer already exists
  if (findCustomerByEmail(normalizedEmail)) {
    return { success: false, error: "An account with this email address already exists. Please log in." };
  }

  const newCustomer: RegisteredCustomer = {
    id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    address: address.trim(),
    password: password,
    role: "customer",
    created_at: new Date().toISOString(),
    total_orders: 0,
    total_spent: 0,
  };

  globalCustomerStore.unshift(newCustomer);

  return { success: true, customer: newCustomer };
}

export function authenticateUser(
  email: string,
  pass: string
): { success: boolean; user?: UserProfile & { email: string; address?: string }; error?: string } {
  const normalized = email.trim().toLowerCase();

  // 1. Check Single Admin authentication
  if (
    (normalized === SINGLE_ADMIN.email.toLowerCase() || normalized === "admin@cloudkitchen.com") &&
    pass === SINGLE_ADMIN.password
  ) {
    return {
      success: true,
      user: {
        id: SINGLE_ADMIN.id,
        full_name: SINGLE_ADMIN.name,
        role: "admin",
        email: SINGLE_ADMIN.email,
        phone: SINGLE_ADMIN.phone,
        address: SINGLE_ADMIN.address,
        created_at: SINGLE_ADMIN.created_at,
      },
    };
  }

  // 2. Check Customer authentication
  const customer = findCustomerByEmail(normalized);
  if (customer && customer.password === pass) {
    return {
      success: true,
      user: {
        id: customer.id,
        full_name: customer.name,
        role: "customer",
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        created_at: customer.created_at,
      },
    };
  }

  return {
    success: false,
    error: "Invalid email ID or password. Please check your credentials or register a new account.",
  };
}
