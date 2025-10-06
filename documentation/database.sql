-- =====================================================
-- ASTROVENEZUELA.COM DATABASE SCHEMA
-- =====================================================
-- This file contains the complete SQL schema for the AstroVenezuela e-commerce platform
-- Generated from current TypeScript types and database structure
-- 
-- Database: Supabase (PostgreSQL)
-- Last Updated: $(date)
-- =====================================================

-- =====================================================
-- EXTENSIONS AND SETUP
-- =====================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- =====================================================
-- CUSTOM TYPES AND ENUMS
-- =====================================================

-- Order status enum
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');

-- User role enum
CREATE TYPE user_role AS ENUM ('admin', 'customer');

-- =====================================================
-- TABLES CREATION
-- =====================================================

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
-- Stores product categories with hierarchical structure (parent-child relationships)
-- Supports both main categories and subcategories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    banner_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- Stores user profile information linked to Supabase Auth users
-- One-to-one relationship with auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
-- Main products table storing product information
-- Each product belongs to a category
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    reference_number TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    main_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCT DETAIL IMAGES TABLE
-- =====================================================
-- Stores multiple images for each product
-- Supports ordering of images via order_index
CREATE TABLE IF NOT EXISTS product_detail_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCT VARIANTS TABLE
-- =====================================================
-- Stores different variants of products (sizes, colors, etc.)
-- Each variant belongs to a product
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    reference_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
-- Stores customer orders
-- Each order belongs to a user (from Supabase Auth) OR is a guest order
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status order_status DEFAULT 'pending',
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    -- Guest order fields
    customer_email TEXT,
    customer_first_name TEXT,
    customer_last_name TEXT,
    customer_dni TEXT,
    customer_phone TEXT,
    shipping_method TEXT,
    order_notes TEXT,
    agency_address TEXT,
    order_access_token UUID NOT NULL DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraints
    CONSTRAINT orders_user_or_guest_check CHECK (
        (user_id IS NOT NULL) OR 
        (user_id IS NULL AND customer_email IS NOT NULL AND customer_first_name IS NOT NULL AND customer_last_name IS NOT NULL AND customer_phone IS NOT NULL AND shipping_method IS NOT NULL)
    )
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
-- Stores individual items within an order
-- Links orders to products and their variants
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Product images indexes
CREATE INDEX IF NOT EXISTS idx_product_detail_images_product_id ON product_detail_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_detail_images_order_index ON product_detail_images(order_index);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_size ON product_variants(size);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_access_token ON orders(order_access_token);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_detail_images_updated_at BEFORE UPDATE ON product_detail_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_detail_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Only admins can insert categories" ON categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update categories" ON categories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete categories" ON categories FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Only admins can insert products" ON products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update products" ON products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete products" ON products FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Product images policies (public read, admin write)
CREATE POLICY "Product images are viewable by everyone" ON product_detail_images FOR SELECT USING (true);
CREATE POLICY "Only admins can insert product images" ON product_detail_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update product images" ON product_detail_images FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete product images" ON product_detail_images FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Product variants policies (public read, admin write)
CREATE POLICY "Product variants are viewable by everyone" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Only admins can insert product variants" ON product_variants FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update product variants" ON product_variants FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete product variants" ON product_variants FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders policies (users can only see their own orders, admins can see all, guests can only create via RPC)
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Note: Guest orders are created via RPC functions with SECURITY DEFINER, no direct INSERT policy for anon
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order items policies (users can see items from their orders, admins can see all, guests access via RPC)
CREATE POLICY "Users can view items from their own orders" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create items for their own orders" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
);
-- Note: Guest order items are created via RPC functions with SECURITY DEFINER, no direct INSERT policy for anon
CREATE POLICY "Admins can update order items" ON order_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete order items" ON order_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profiles policies (users can see their own profile, admins can see all)
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- FUNCTIONS AND STORED PROCEDURES
-- =====================================================

-- Function to create order with items in a transaction
CREATE OR REPLACE FUNCTION create_order_with_items(
    p_user_id UUID,
    p_status TEXT,
    p_total_amount NUMERIC,
    p_shipping_address TEXT,
    p_payment_method TEXT,
    p_whatsapp_number TEXT,
    p_items JSONB
)
RETURNS orders AS $$
DECLARE
    new_order orders;
    item JSONB;
BEGIN
    -- Validate user exists (only if user_id is provided)
    IF p_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Create the order
    INSERT INTO orders (
        user_id,
        status,
        total_amount,
        shipping_address,
        payment_method,
        whatsapp_number
    ) VALUES (
        p_user_id,
        p_status,
        p_total_amount,
        p_shipping_address,
        p_payment_method,
        p_whatsapp_number
    ) RETURNING * INTO new_order;

    -- Insert order items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Validate product and variant exist
        IF NOT EXISTS (SELECT 1 FROM products WHERE id = (item->>'product_id')::UUID) THEN
            RAISE EXCEPTION 'Product not found: %', item->>'product_id';
        END IF;

        IF item->>'variant_id' IS NOT NULL AND 
           NOT EXISTS (SELECT 1 FROM product_variants WHERE id = (item->>'variant_id')::UUID) THEN
            RAISE EXCEPTION 'Product variant not found: %', item->>'variant_id';
        END IF;

        -- Insert order item
        INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            quantity,
            price
        ) VALUES (
            new_order.id,
            (item->>'product_id')::UUID,
            NULLIF(item->>'variant_id','')::UUID,
            (item->>'quantity')::INTEGER,
            (item->>'price')::NUMERIC
        );
    END LOOP;

    RETURN new_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create guest order with items in a transaction
CREATE OR REPLACE FUNCTION create_guest_order_with_items(
    p_status TEXT,
    p_total_amount NUMERIC,
    p_shipping_address TEXT,
    p_payment_method TEXT,
    p_whatsapp_number TEXT,
    p_customer_email TEXT,
    p_customer_first_name TEXT,
    p_customer_last_name TEXT,
    p_customer_dni TEXT,
    p_customer_phone TEXT,
    p_shipping_method TEXT,
    p_order_notes TEXT,
    p_agency_address TEXT,
    p_items JSONB
)
RETURNS TABLE (
    id UUID,
    order_access_token UUID,
    total_amount NUMERIC,
    status TEXT,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    new_order orders;
    item JSONB;
BEGIN
    -- Create the guest order
    INSERT INTO orders (
        user_id,
        status,
        total_amount,
        shipping_address,
        payment_method,
        whatsapp_number,
        customer_email,
        customer_first_name,
        customer_last_name,
        customer_dni,
        customer_phone,
        shipping_method,
        order_notes,
        agency_address
    ) VALUES (
        NULL,
        p_status,
        p_total_amount,
        p_shipping_address,
        p_payment_method,
        p_whatsapp_number,
        p_customer_email,
        p_customer_first_name,
        p_customer_last_name,
        p_customer_dni,
        p_customer_phone,
        p_shipping_method,
        p_order_notes,
        p_agency_address
    ) RETURNING * INTO new_order;

    -- Insert order items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Validate product and variant exist (qualify column names to avoid ambiguity)
        IF NOT EXISTS (SELECT 1 FROM products p WHERE p.id = (item->>'product_id')::UUID) THEN
            RAISE EXCEPTION 'Product not found: %', item->>'product_id';
        END IF;

        IF item->>'variant_id' IS NOT NULL AND 
           NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.id = (item->>'variant_id')::UUID) THEN
            RAISE EXCEPTION 'Product variant not found: %', item->>'variant_id';
        END IF;

        -- Insert order item
        INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            quantity,
            price
        ) VALUES (
            new_order.id,
            (item->>'product_id')::UUID,
            NULLIF(item->>'variant_id','')::UUID,
            (item->>'quantity')::INTEGER,
            (item->>'price')::NUMERIC
        );
    END LOOP;

    -- Return the order details
    RETURN QUERY SELECT 
        new_order.id,
        new_order.order_access_token,
        new_order.total_amount,
        new_order.status,
        new_order.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order with items by access token
CREATE OR REPLACE FUNCTION get_order_with_items_by_token(
    p_order_id UUID,
    p_access_token UUID
)
RETURNS TABLE (
    order_id UUID,
    status TEXT,
    total_amount NUMERIC,
    shipping_address TEXT,
    payment_method TEXT,
    whatsapp_number TEXT,
    customer_email TEXT,
    customer_first_name TEXT,
    customer_last_name TEXT,
    customer_dni TEXT,
    customer_phone TEXT,
    shipping_method TEXT,
    order_notes TEXT,
    agency_address TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    items JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.shipping_address,
        o.payment_method,
        o.whatsapp_number,
        o.customer_email,
        o.customer_first_name,
        o.customer_last_name,
        o.customer_dni,
        o.customer_phone,
        o.shipping_method,
        o.order_notes,
        o.agency_address,
        o.created_at,
        o.updated_at,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', oi.id,
                    'product_id', oi.product_id,
                    'variant_id', oi.variant_id,
                    'quantity', oi.quantity,
                    'price', oi.price,
                    'product_name', p.name,
                    'product_slug', p.slug,
                    'variant_size', pv.size,
                    'variant_reference', pv.reference_number,
                    'image_url', COALESCE(pv.image_url, p.main_image_url, '')
                )
            ) FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_variants pv ON oi.variant_id = pv.id
            WHERE oi.order_id = o.id),
            '[]'::jsonb
        ) as items
    FROM orders o
    WHERE o.id = p_order_id 
    AND o.order_access_token = p_access_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get products with details (images and variants)
CREATE OR REPLACE FUNCTION get_product_with_details(p_product_id UUID)
RETURNS TABLE (
    product_id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    price NUMERIC,
    reference_number TEXT,
    category_id UUID,
    stock INTEGER,
    main_image_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    images JSONB,
    variants JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.reference_number,
        p.category_id,
        p.stock,
        p.main_image_url,
        p.is_active,
        p.created_at,
        p.updated_at,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', pdi.id,
                    'image_url', pdi.image_url,
                    'order_index', pdi.order_index
                ) ORDER BY pdi.order_index
            ) FROM product_detail_images pdi WHERE pdi.product_id = p.id),
            '[]'::jsonb
        ) as images,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', pv.id,
                    'size', pv.size,
                    'stock', pv.stock,
                    'reference_number', pv.reference_number,
                    'image_url', pv.image_url
                ) ORDER BY pv.size
            ) FROM product_variants pv WHERE pv.product_id = p.id),
            '[]'::jsonb
        ) as variants
    FROM products p
    WHERE p.id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('Telescopios', 'telescopios', 'Telescopios astronómicos profesionales y amateur', true),
('Binoculares', 'binoculares', 'Binoculares para observación astronómica y terrestre', true),
('Accesorios', 'accesorios', 'Accesorios y complementos para telescopios', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active) VALUES
('Telescopios Refractores', 'telescopios-refractores', 'Telescopios con lentes', (SELECT id FROM categories WHERE slug = 'telescopios'), true),
('Telescopios Reflectores', 'telescopios-reflectores', 'Telescopios con espejos', (SELECT id FROM categories WHERE slug = 'telescopios'), true),
('Oculares', 'oculares', 'Oculares para telescopios', (SELECT id FROM categories WHERE slug = 'accesorios'), true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for products with category information
CREATE OR REPLACE VIEW products_with_categories AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    pc.name as parent_category_name,
    pc.slug as parent_category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN categories pc ON c.parent_id = pc.id;

-- View for orders with customer information
CREATE OR REPLACE VIEW orders_with_customers AS
SELECT 
    o.*,
    p.role as customer_role,
    au.email as customer_email
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LEFT JOIN auth.users au ON o.user_id = au.id;

-- View for order items with product details
CREATE OR REPLACE VIEW order_items_with_details AS
SELECT 
    oi.*,
    p.name as product_name,
    p.slug as product_slug,
    pv.size as variant_size,
    pv.reference_number as variant_reference
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
LEFT JOIN product_variants pv ON oi.variant_id = pv.id;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE categories IS 'Product categories with hierarchical structure supporting subcategories';
COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth users';
COMMENT ON TABLE products IS 'Main products catalog with pricing and inventory';
COMMENT ON TABLE product_detail_images IS 'Multiple images per product with ordering support';
COMMENT ON TABLE product_variants IS 'Product variants like sizes, colors, etc.';
COMMENT ON TABLE orders IS 'Customer orders with shipping and payment information. Supports both authenticated users and guest orders';
COMMENT ON TABLE order_items IS 'Individual items within orders linking to products and variants';

COMMENT ON COLUMN categories.parent_id IS 'Self-referencing foreign key for subcategories (NULL for main categories)';
COMMENT ON COLUMN products.reference_number IS 'Internal product reference number';
COMMENT ON COLUMN product_variants.size IS 'Variant size or specification';
COMMENT ON COLUMN orders.whatsapp_number IS 'Customer WhatsApp number for order communication';
COMMENT ON COLUMN orders.customer_email IS 'Guest customer email address (required for guest orders)';
COMMENT ON COLUMN orders.customer_first_name IS 'Guest customer first name (required for guest orders)';
COMMENT ON COLUMN orders.customer_last_name IS 'Guest customer last name (required for guest orders)';
COMMENT ON COLUMN orders.customer_dni IS 'Guest customer DNI/ID number';
COMMENT ON COLUMN orders.customer_phone IS 'Guest customer phone number (required for guest orders)';
COMMENT ON COLUMN orders.shipping_method IS 'Selected shipping method (required for guest orders)';
COMMENT ON COLUMN orders.order_notes IS 'Additional notes from customer';
COMMENT ON COLUMN orders.agency_address IS 'Agency address for MRW/Zoom shipping';
COMMENT ON COLUMN orders.order_access_token IS 'Unique token for guest order access';
COMMENT ON COLUMN order_items.variant_id IS 'Optional reference to product variant (NULL if product has no variants)';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
