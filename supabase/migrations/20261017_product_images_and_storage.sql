-- ====================================================================
-- FOOD EMPIRE - PRODUCT IMAGES & STORAGE CONFIGURATION
-- Migration: 20261017_product_images_and_storage.sql
-- ====================================================================

-- 1. Create product_images table to support multiple gallery images per product
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON public.product_images (product_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON public.product_images (product_id, sort_order ASC);

-- 2. Row Level Security for product_images table
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Public can view images for published products
DROP POLICY IF EXISTS "Public read published product images" ON public.product_images;
CREATE POLICY "Public read published product images"
ON public.product_images
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id
      AND p.is_published = true
  )
);

-- Authorized CMS administrators can view all product images
DROP POLICY IF EXISTS "Admin select product images" ON public.product_images;
CREATE POLICY "Admin select product images"
ON public.product_images
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Authorized CMS administrators can insert product images
DROP POLICY IF EXISTS "Admin insert product images" ON public.product_images;
CREATE POLICY "Admin insert product images"
ON public.product_images
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Authorized CMS administrators can update product images
DROP POLICY IF EXISTS "Admin update product images" ON public.product_images;
CREATE POLICY "Admin update product images"
ON public.product_images
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Authorized CMS administrators can delete product images
DROP POLICY IF EXISTS "Admin delete product images" ON public.product_images;
CREATE POLICY "Admin delete product images"
ON public.product_images
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 3. Storage Bucket Configuration for 'product-images'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 4. Storage Security Policies on storage.objects
-- Anonymous & public visitors: READ ONLY
DROP POLICY IF EXISTS "Public view product images" ON storage.objects;
CREATE POLICY "Public view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Authorized CMS Admin: UPLOAD
DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
CREATE POLICY "Admin upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- Authorized CMS Admin: UPDATE
DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
CREATE POLICY "Admin update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin());

-- Authorized CMS Admin: DELETE
DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;
CREATE POLICY "Admin delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin());
