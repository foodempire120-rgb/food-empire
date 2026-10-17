-- ====================================================================
-- FOOD EMPIRE PRODUCT CMS - DATABASE MIGRATION
-- ====================================================================

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (lower(email));
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users (user_id);

-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  image_path TEXT DEFAULT NULL,
  rating NUMERIC(3, 1) DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5.0),
  badge TEXT DEFAULT '',
  suppliers INTEGER DEFAULT 1,
  features TEXT[] DEFAULT '{}'::TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_country ON public.products (country);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON public.products (is_published);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products (sort_order ASC, created_at DESC);

-- 3. Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER trigger_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Function & trigger to link authenticated user_id to admin_users when user logs in
CREATE OR REPLACE FUNCTION public.handle_admin_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admin_users
  SET user_id = NEW.id
  WHERE lower(email) = lower(NEW.email)
    AND (user_id IS NULL OR user_id != NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_admin_user_login();

-- 5. Helper function for Row Level Security: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE (user_id = auth.uid() OR lower(email) = lower(auth.jwt()->>'email'))
      AND active = true
  );
$$;

-- 6. ROW LEVEL SECURITY (RLS) FOR PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can ONLY view published products
DROP POLICY IF EXISTS "Public read published products" ON public.products;
CREATE POLICY "Public read published products"
ON public.products
FOR SELECT
TO public
USING (is_published = true);

-- Authorized admins can view all products (including drafts)
DROP POLICY IF EXISTS "Admin select all products" ON public.products;
CREATE POLICY "Admin select all products"
ON public.products
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Authorized admins can insert products
DROP POLICY IF EXISTS "Admin insert products" ON public.products;
CREATE POLICY "Admin insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Authorized admins can update products
DROP POLICY IF EXISTS "Admin update products" ON public.products;
CREATE POLICY "Admin update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Authorized admins can delete products
DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Admin delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 7. ROW LEVEL SECURITY (RLS) FOR ADMIN_USERS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Authenticated user can read their own admin record to verify status
DROP POLICY IF EXISTS "Admin view own status" ON public.admin_users;
CREATE POLICY "Admin view own status"
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR lower(email) = lower(auth.jwt()->>'email') OR public.is_admin());

-- Notice: No INSERT/UPDATE/DELETE policies for clients on admin_users.
-- User management is strictly server/admin console only, preventing unauthorized promotion.

-- 8. STORAGE CONFIGURATION FOR PRODUCT IMAGES
-- Create public storage bucket for product images if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public view product images" ON storage.objects;
CREATE POLICY "Public view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
CREATE POLICY "Admin upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
CREATE POLICY "Admin update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;
CREATE POLICY "Admin delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin());
