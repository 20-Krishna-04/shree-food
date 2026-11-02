-- ==============================================================================
-- CLOUD KITCHEN SEED DATA
-- Categories and Initial Product Catalog
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, image_url, display_order)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Biryani', 'biryani', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80', 1),
  ('c2222222-2222-2222-2222-222222222222', 'Indian Meals', 'indian-meals', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', 2),
  ('c3333333-3333-3333-3333-333333333333', 'Pizza', 'pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', 3),
  ('c4444444-4444-4444-4444-444444444444', 'Burgers', 'burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', 4),
  ('c5555555-5555-5555-5555-555555555555', 'Snacks', 'snacks', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80', 5),
  ('c6666666-6666-6666-6666-666666666666', 'Desserts', 'desserts', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', 6),
  ('c7777777-7777-7777-7777-777777777777', 'Beverages', 'beverages', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', 7)
ON CONFLICT (name) DO UPDATE 
SET image_url = EXCLUDED.image_url,
    slug = EXCLUDED.slug,
    display_order = EXCLUDED.display_order;

-- 2. Insert Products
INSERT INTO public.products (id, category_id, name, description, price, image_url, is_available, is_vegetarian, preparation_time_mins)
VALUES
  -- Biryani
  (
    'p1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Hyderabadi Chicken Biryani',
    'Fragrant aged basmati rice cooked with succulent chicken pieces infused with authentic whole spices and saffron. Served with salan and mirchi ka raita.',
    199.00,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    true,
    false,
    25
  ),
  (
    'p1111111-1111-1111-1111-111111111112',
    'c1111111-1111-1111-1111-111111111111',
    'Dum Paneer Biryani',
    'Tender cottage cheese cubes marinated in mint yogurt and slow cooked in sealed handi with basmati rice and royal saffron.',
    189.00,
    'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    20
  ),

  -- Indian Meals
  (
    'p2222222-2222-2222-2222-222222222221',
    'c2222222-2222-2222-2222-222222222222',
    'Paneer Butter Masala',
    'Fresh soft cottage cheese cubes simmered in a velvety rich tomato, cashew nut gravy, finished with butter and kasuri methi.',
    179.00,
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    20
  ),
  (
    'p2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Dal Makhani Royal Meal',
    'Black lentils slow-cooked overnight with creamy butter, served with 2 flaky butter parathas and fragrant jeera rice.',
    159.00,
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    15
  ),

  -- Pizza
  (
    'p3333333-3333-3333-3333-333333333331',
    'c3333333-3333-3333-3333-333333333333',
    'Classic Margherita Pizza',
    'Hand-tossed sourdough crust topped with artisanal San Marzano tomato sauce, fresh mozzarella, extra virgin olive oil, and basil.',
    249.00,
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    20
  ),
  (
    'p3333333-3333-3333-3333-333333333332',
    'c3333333-3333-3333-3333-333333333333',
    'Spicy Paneer Tikka Pizza',
    'Crisp crust loaded with tandoori spiced paneer cubes, crisp bell peppers, red onions, and melted mozzarella blend.',
    289.00,
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    20
  ),

  -- Burgers
  (
    'p4444444-4444-4444-4444-444444444441',
    'c4444444-4444-4444-4444-444444444444',
    'Crispy Veg Supreme Burger',
    'Golden-fried spiced vegetable and corn patty topped with crunchy iceberg lettuce, cheddar slice, and secret house sauce in a toasted brioche bun.',
    129.00,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    15
  ),
  (
    'p4444444-4444-4444-4444-444444444442',
    'c4444444-4444-4444-4444-444444444444',
    'Smoky Grilled Chicken Burger',
    'Juicy grilled chicken fillet layered with caramelized onions, melted gouda cheese, and smokey BBQ mayonnaise.',
    169.00,
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    true,
    false,
    18
  ),

  -- Snacks
  (
    'p5555555-5555-5555-5555-555555555551',
    'c5555555-5555-5555-5555-555555555555',
    'Peri Peri French Fries',
    'Crispy golden potato fries generously tossed in zesty African peri-peri spice mix. Served with cheesy garlic dip.',
    99.00,
    'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    10
  ),
  (
    'p5555555-5555-5555-5555-555555555552',
    'c5555555-5555-5555-5555-555555555555',
    'Crispy Corn Salt & Pepper',
    'Batter-fried sweet corn tossed with crunchy peppers, spring onion, fresh garlic, and cracked pepper.',
    119.00,
    'https://images.unsplash.com/photo-1514944298350-0220677a2856?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    12
  ),

  -- Desserts
  (
    'p6666666-6666-6666-6666-666666666661',
    'c6666666-6666-6666-6666-666666666666',
    'Warm Gulab Jamun (2 pcs)',
    'Traditional melt-in-mouth milk solids dumplings fried to golden hue and soaked in fragrant rose and green cardamom syrup.',
    79.00,
    'https://images.unsplash.com/photo-1667053508464-eb11b394df83?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    5
  ),
  (
    'p6666666-6666-6666-6666-666666666662',
    'c6666666-6666-6666-6666-666666666666',
    'Molten Chocolate Lava Cake',
    'Decadent chocolate sponge with a warm, gooey liquid chocolate center. Served warm.',
    109.00,
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    10
  ),

  -- Beverages
  (
    'p7777777-7777-7777-7777-777777777771',
    'c7777777-7777-7777-7777-777777777777',
    'Fresh Masala Chaas (Spiced Buttermilk)',
    'Churned fresh yogurt tempered with toasted cumin, ginger, green chilies, and fresh coriander leaves. Cooling and digestive.',
    49.00,
    'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    5
  ),
  (
    'p7777777-7777-7777-7777-777777777772',
    'c7777777-7777-7777-7777-777777777777',
    'Kesar Mango Lassi',
    'Thick chilled Punjabi style sweetened yogurt smoothie blended with ripe Alphonso mangoes and saffron strands.',
    89.00,
    'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    5
  )
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    is_available = EXCLUDED.is_available,
    is_vegetarian = EXCLUDED.is_vegetarian;

-- 3. SQL Verification Queries
-- Check categories
SELECT id, name, slug FROM public.categories ORDER BY display_order;

-- Check products
SELECT p.name, c.name as category, p.price, p.is_vegetarian, p.is_available 
FROM public.products p 
JOIN public.categories c ON p.category_id = c.id
ORDER BY c.display_order, p.price;
