import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(60, "Full name must be under 60 characters"),
    email: z.string().email("Please provide a valid email address"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number")
      .optional()
      .or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const orderItemInputSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50, "Max quantity is 50"),
});

export const orderCreateSchema = z.object({
  customer_name: z
    .string()
    .min(2, "Customer name must be at least 2 characters")
    .max(80, "Customer name too long"),
  customer_phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  delivery_address: z
    .string()
    .min(10, "Please enter a complete delivery address (street, landmark, flat no)")
    .max(255, "Address too long"),
  items: z
    .array(orderItemInputSchema)
    .min(1, "Your cart cannot be empty"),
  notes: z.string().max(200, "Notes cannot exceed 200 characters").optional().nullable(),
});

export const productSchema = z.object({
  name: z.string().min(3, "Dish name must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  category_id: z.string().uuid("Please select a category"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  image_url: z.string().url("Must be a valid image URL"),
  is_available: z.boolean().default(true),
  is_vegetarian: z.boolean().default(false),
  preparation_time_mins: z.coerce.number().int().min(5).max(120).default(20),
});

export const orderStatusUpdateSchema = z.object({
  order_id: z.string().uuid("Invalid order ID"),
  order_status: z.enum(["pending", "in_process", "completed", "cancelled"]),
});

export const paymentVerifySchema = z.object({
  order_id: z.string().uuid("Invalid order ID"),
  provider_payment_id: z.string().optional(),
  provider_order_id: z.string().optional(),
  signature: z.string().optional(),
  is_simulation: z.boolean().optional().default(false),
});
