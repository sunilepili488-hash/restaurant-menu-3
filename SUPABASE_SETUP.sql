-- ============================================================
-- AuraMenu — Supabase Database Setup Script
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── restaurants ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  name TEXT NOT NULL,
  logo_url TEXT,
  welcome_message TEXT,
  splash_custom_code TEXT,
  operating_hours TEXT,
  currency_symbol TEXT DEFAULT '₹',
  admin_username TEXT DEFAULT 'admin',
  admin_password TEXT DEFAULT 'admin123',
  hide_user_icon BOOLEAN DEFAULT FALSE,

  order_routing_mode TEXT DEFAULT 'whatsapp',
  whatsapp_numbers JSONB DEFAULT '[]',
  website_endpoint TEXT,

  table_qr_enabled BOOLEAN DEFAULT FALSE,
  payment_enabled BOOLEAN DEFAULT FALSE,
  upi_id TEXT,
  upi_payee_name TEXT,

  price_slider_min NUMERIC DEFAULT 0,
  price_slider_max NUMERIC DEFAULT 1500,
  dietary_tags JSONB DEFAULT '["Veg","Non-Veg","Vegan","Jain","Gluten-Free"]',
  prep_time_filters JSONB DEFAULT '["Under 5 min","Under 10 min","Under 15 min","Under 30 min"]',
  waiter_call_options JSONB DEFAULT '[]',

  theme_primary_color TEXT DEFAULT '#C5A572',
  theme_bg_color TEXT DEFAULT '#1A1A1A',
  theme_mode TEXT DEFAULT 'dark',

  top_dishes JSONB DEFAULT '[]',
  supabase_config JSONB DEFAULT '{"url":"","anon_key":"","connected":false}',
  icon_settings JSONB DEFAULT '{}',
  feature_locks JSONB DEFAULT '{}',
  developer_password TEXT DEFAULT 'saas',

  hosting_url TEXT,
  hosting_api_key TEXT,
  hosting_connected BOOLEAN DEFAULT FALSE,
  custom_domain TEXT,
  domain_dns_records TEXT,
  domain_connected BOOLEAN DEFAULT FALSE,
  backend_mode TEXT DEFAULT 'supabase',
  hosting_config JSONB DEFAULT '{}',
  domain_config JSONB DEFAULT '{}'
);

-- ─── categories ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  sort_order NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ─── dishes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  image_url TEXT,
  regular_price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC,
  category_id TEXT,
  is_veg BOOLEAN DEFAULT TRUE,
  dietary_tags JSONB DEFAULT '[]',
  prep_time_value NUMERIC,
  prep_time_unit TEXT DEFAULT 'min',
  like_count NUMERIC DEFAULT 0,
  ordered_today_count NUMERIC DEFAULT 0,
  ordered_today_date TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order NUMERIC DEFAULT 0,
  spice_level TEXT DEFAULT 'medium',
  calories NUMERIC
);

-- ─── banners ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  bg_color TEXT DEFAULT '#C5A572',
  text_color TEXT DEFAULT '#FFFFFF',
  sort_order NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ─── orders ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  table_number TEXT,
  items JSONB DEFAULT '[]',
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  cancel_reason TEXT,
  customer_note TEXT,
  payment_mode TEXT
);

-- ─── reviews ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dish_id TEXT,
  rating NUMERIC DEFAULT 5,
  comment TEXT,
  reviewer_name TEXT
);

-- ─── table_mappings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS table_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  table_number TEXT,
  qr_url TEXT,
  label TEXT
);

-- ─── RLS Policies ────────────────────────────────────────────
-- Public read access for all tables (customers can see menu)
-- Public write for orders (customers place orders)
-- All other writes require anon key (admin uses it from admin panel)

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_mappings ENABLE ROW LEVEL SECURITY;

-- Allow full access with anon key (admin panel uses anon key)
CREATE POLICY "anon_all_restaurants" ON restaurants FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_categories" ON categories FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_dishes" ON dishes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_banners" ON banners FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_orders" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_reviews" ON reviews FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_table_mappings" ON table_mappings FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── Storage bucket for menu images ──────────────────────────
-- Run this separately in Supabase Dashboard > Storage > New Bucket
-- Bucket name: menu-images, Public: YES

-- ─── Seed first restaurant row ───────────────────────────────
-- (Only needed once per restaurant deployment)
INSERT INTO restaurants (name, admin_username, admin_password)
VALUES ('My Restaurant', 'admin', 'admin123')
ON CONFLICT DO NOTHING;

-- ✅ Setup complete! Now go to Supabase > Storage and create a public bucket called "menu-images"
