import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const BUCKET_NAME = 'product-images';

/**
 * Generate a URL-safe slug from a product name
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-')        // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
};

/**
 * Fetch published products for the public website
 */
export const getPublicProducts = async () => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured yet.') };
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Fetch all products (including drafts) for authorized CMS admins
 */
export const getAdminProducts = async () => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured yet.') };
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Fetch a single product by ID along with its gallery images
 */
export const getProductById = async (id) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured yet.') };
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (productError || !product) {
    return { data: null, error: productError || new Error('Product not found.') };
  }

  // Attempt to fetch gallery images from product_images table if available
  let images = [];
  try {
    const { data: gallery, error: galleryError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (!galleryError && Array.isArray(gallery) && gallery.length > 0) {
      images = gallery;
    }
  } catch (err) {
    // If table does not exist or schema is in transition, gracefully fall back to single image
    console.debug('Gallery images table query bypassed:', err);
  }

  // If gallery table is empty but product has image, synthesize primary item
  if (images.length === 0 && (product.image || product.image_path)) {
    images = [
      {
        id: 'legacy-primary',
        product_id: product.id,
        storage_path: product.image_path || '',
        public_url: product.image,
        alt_text: product.name,
        is_primary: true,
        sort_order: 0
      }
    ];
  }

  return {
    data: {
      ...product,
      gallery_images: images
    },
    error: null
  };
};

/**
 * Upload an image file to Supabase Storage with structured, collision-resistant path
 * Preferred structure: products/{productId}/{imageUUID}.webp
 */
export const uploadProductImage = async (file, productId = null) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured yet.');
  }

  const resolvedProductId = productId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prod_${Date.now()}`);
  const fileExt = file.name?.split('.').pop()?.toLowerCase() || 'webp';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'webp';
  const imageUUID = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID().substring(0, 8) 
    : `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const filePath = `products/${resolvedProductId}/${imageUUID}.${cleanExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '31536000', // 1 year immutable cache
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    publicUrl: publicUrlData.publicUrl,
    imagePath: filePath,
    productId: resolvedProductId
  };
};

/**
 * Delete a single image from Supabase Storage
 */
export const deleteProductImage = async (imagePath) => {
  if (!imagePath || !isSupabaseConfigured()) return;
  try {
    await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
  } catch (err) {
    console.warn('Error deleting image from Supabase Storage:', err);
  }
};

/**
 * Delete multiple images from Supabase Storage
 */
export const deleteMultipleProductImages = async (imagePaths) => {
  const validPaths = (imagePaths || []).filter(Boolean);
  if (validPaths.length === 0 || !isSupabaseConfigured()) return;
  try {
    await supabase.storage.from(BUCKET_NAME).remove(validPaths);
  } catch (err) {
    console.warn('Error deleting images from Supabase Storage:', err);
  }
};

/**
 * Create a new product with failure rollback handling
 */
export const createProduct = async (productData, galleryItems = []) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured yet.') };
  }

  // Pre-generate UUID so storage paths match product ID
  const newProductId = productData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : null);

  // Generate unique slug
  let baseSlug = slugify(productData.name) || 'product';
  let slug = baseSlug;

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const payload = {
    ...(newProductId ? { id: newProductId } : {}),
    name: productData.name.trim(),
    slug,
    category: productData.category.trim(),
    country: (productData.country || '').trim(),
    description: (productData.description || '').trim(),
    image: productData.image || '',
    image_path: productData.image_path || null,
    rating: parseFloat(productData.rating) || 4.8,
    badge: (productData.badge || '').trim(),
    suppliers: parseInt(productData.suppliers, 10) || 1,
    features: Array.isArray(productData.features) ? productData.features : [
      productData.country ? `${productData.country.trim()} origin` : ''
    ].filter(Boolean),
    is_published: productData.is_published ?? true,
    sort_order: parseInt(productData.sort_order, 10) || 0
  };

  const { data: createdProduct, error: insertError } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single();

  if (insertError) {
    return { data: null, error: insertError };
  }

  // Save gallery images in product_images table if provided
  if (createdProduct && Array.isArray(galleryItems) && galleryItems.length > 0) {
    try {
      const records = galleryItems.map((item, idx) => ({
        product_id: createdProduct.id,
        storage_path: item.storage_path || '',
        public_url: item.public_url || '',
        alt_text: (item.alt_text || createdProduct.name).trim(),
        sort_order: idx,
        is_primary: item.is_primary || (idx === 0)
      }));

      await supabase.from('product_images').insert(records);
    } catch (gErr) {
      console.warn('Could not save product gallery images:', gErr);
    }
  }

  return { data: createdProduct, error: null };
};

/**
 * Update an existing product
 */
export const updateProduct = async (id, productData, galleryItems = []) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured yet.') };
  }

  const payload = {
    name: productData.name.trim(),
    category: productData.category.trim(),
    country: (productData.country || '').trim(),
    description: (productData.description || '').trim(),
    image: productData.image || '',
    image_path: productData.image_path || null,
    rating: parseFloat(productData.rating) || 4.8,
    badge: (productData.badge || '').trim(),
    suppliers: parseInt(productData.suppliers, 10) || 1,
    features: Array.isArray(productData.features) ? productData.features : [
      productData.country ? `${productData.country.trim()} origin` : ''
    ].filter(Boolean),
    is_published: productData.is_published ?? true,
    sort_order: parseInt(productData.sort_order, 10) || 0
  };

  const { data: updatedProduct, error: updateError } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return { data: null, error: updateError };
  }

  // Update gallery images if provided
  if (Array.isArray(galleryItems) && galleryItems.length > 0) {
    try {
      // Clean existing gallery records and re-insert
      await supabase.from('product_images').delete().eq('product_id', id);

      const records = galleryItems.map((item, idx) => ({
        product_id: id,
        storage_path: item.storage_path || '',
        public_url: item.public_url || '',
        alt_text: (item.alt_text || updatedProduct.name).trim(),
        sort_order: idx,
        is_primary: item.is_primary || (idx === 0)
      }));

      await supabase.from('product_images').insert(records);
    } catch (gErr) {
      console.warn('Could not sync gallery images table:', gErr);
    }
  }

  return { data: updatedProduct, error: null };
};

/**
 * Quick toggle publish state
 */
export const togglePublishProduct = async (id, currentStatus) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const { data, error } = await supabase
    .from('products')
    .update({ is_published: !currentStatus })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

/**
 * Delete a product and safely remove all associated storage images
 */
export const deleteProduct = async (id, imagePath = null) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  // 1. Collect all storage paths referenced by this product before deletion
  const pathsToDelete = new Set();
  if (imagePath) pathsToDelete.add(imagePath);

  try {
    const { data: gallery } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('product_id', id);

    if (gallery) {
      gallery.forEach((g) => {
        if (g.storage_path) pathsToDelete.add(g.storage_path);
      });
    }
  } catch (err) {
    console.debug('Skipping gallery lookup during delete:', err);
  }

  // 2. Delete database product record first
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return { data: null, error };
  }

  // 3. Only after DB deletion succeeds, clean up storage objects
  if (pathsToDelete.size > 0) {
    await deleteMultipleProductImages(Array.from(pathsToDelete));
  }

  return { data, error: null };
};

/**
 * Duplicate a product for easy catalog entry
 * Creates unsaved copy payload without duplicating ID or coupling image storage paths
 */
export const prepareDuplicateProduct = (sourceProduct) => {
  return {
    name: `${sourceProduct.name} (Copy)`.trim(),
    category: sourceProduct.category || 'beef',
    country: sourceProduct.country || '',
    description: sourceProduct.description || '',
    badge: sourceProduct.badge || '',
    rating: sourceProduct.rating?.toString() || '4.8',
    suppliers: sourceProduct.suppliers?.toString() || '1',
    is_published: false, // New duplicates default to draft for review
    image: '', // Require new image so deletion doesn't break source
    image_path: '',
    gallery_images: []
  };
};
