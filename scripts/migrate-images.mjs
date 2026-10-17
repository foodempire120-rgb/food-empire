#!/usr/bin/env node

/**
 * FOOD EMPIRE - BULK PRODUCT IMAGE MIGRATION TOOL
 * 
 * Safely migrates local product images from public/Images to Supabase Storage ('product-images'),
 * updates product database records, and creates primary entries in product_images table.
 * 
 * Usage:
 *   node scripts/migrate-images.mjs
 *   node scripts/migrate-images.mjs --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables from .env
const envPath = path.join(projectRoot, '.env');
let envConfig = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim();
        envConfig[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL || envConfig.VITE_SUPABASE_URL;
// Priority: SUPABASE_SERVICE_ROLE_KEY if set, otherwise anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || envConfig.VITE_SUPABASE_ANON_KEY;
const isDryRun = process.argv.includes('--dry-run');

console.log('====================================================');
console.log(' FOOD EMPIRE - SUPABASE IMAGE MIGRATION TOOL');
console.log('====================================================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found. Please verify your .env file.');
  process.exit(1);
}

console.log(`Connecting to: ${supabaseUrl}`);
if (isDryRun) {
  console.log('🔍 MODE: DRY RUN (No changes will be written to Supabase)');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const BUCKET_NAME = 'product-images';

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

const runMigration = async () => {
  // 1. Verify bucket access
  console.log(`\nVerifying storage bucket '${BUCKET_NAME}'...`);
  const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);

  if (bucketError || !bucketData) {
    if (isDryRun) {
      console.warn(`⚠️  Bucket '${BUCKET_NAME}' not found yet in Supabase. Continuing dry-run file audit...`);
    } else {
      console.error(`\n❌ Bucket '${BUCKET_NAME}' does not exist or is not accessible.`);
      console.error(`   Error details: ${bucketError?.message || 'Bucket not found'}`);
      console.error('\n👉 Required Action:');
      console.error('   1. In your Supabase Dashboard -> Storage: Click "New Bucket"');
      console.error('   2. Set name: product-images');
      console.error('   3. Toggle "Public bucket" to ON');
      console.error('   4. Or run the migration SQL: supabase/migrations/20261017_product_images_and_storage.sql in SQL Editor');
      process.exit(1);
    }
  } else {
    console.log(`✅ Bucket '${BUCKET_NAME}' verified.`);
  }

  // 2. Fetch all products from public.products
  console.log('\nFetching products from database...');
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  if (productsError) {
    console.error('❌ Failed to fetch products:', productsError.message);
    process.exit(1);
  }

  console.log(`Found ${products.length} products in database.`);

  const stats = {
    total: products.length,
    processed: 0,
    uploaded: 0,
    databaseUpdated: 0,
    skippedAlreadyMigrated: 0,
    failed: 0,
    failures: []
  };

  for (const product of products) {
    stats.processed++;
    const prodDesc = `[${stats.processed}/${stats.total}] "${product.name}"`;

    // Check if already using Supabase Storage
    if (product.image && product.image.includes(supabaseUrl) && product.image_path) {
      console.log(`⏩ ${prodDesc} - Already migrated to Supabase Storage (${product.image_path})`);
      stats.skippedAlreadyMigrated++;
      continue;
    }

    // Resolve local image path
    let localImagePath = product.image || '';
    if (localImagePath.startsWith('/')) {
      localImagePath = localImagePath.substring(1);
    }

    const absoluteFilePath = path.join(projectRoot, 'public', localImagePath);

    if (!fs.existsSync(absoluteFilePath)) {
      console.warn(`⚠️  ${prodDesc} - Local image file not found: ${absoluteFilePath}`);
      stats.failed++;
      stats.failures.push({ product: product.name, id: product.id, reason: `File not found at ${absoluteFilePath}` });
      continue;
    }

    try {
      const fileExt = path.extname(absoluteFilePath).toLowerCase();
      const contentType = MIME_MAP[fileExt] || 'image/jpeg';
      const fileBuffer = fs.readFileSync(absoluteFilePath);
      const uniqueSuffix = Math.random().toString(36).substring(2, 9);
      const storagePath = `products/${product.id}/main_${uniqueSuffix}${fileExt}`;

      if (isDryRun) {
        console.log(`[DRY RUN] Would upload ${localImagePath} -> ${storagePath} (${fileBuffer.length} bytes)`);
        stats.uploaded++;
        stats.databaseUpdated++;
        continue;
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType,
          cacheControl: '31536000',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Storage upload error: ${uploadError.message}`);
      }

      stats.uploaded++;

      // Retrieve durable public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData.publicUrl;

      // Update product record
      const { error: updateError } = await supabase
        .from('products')
        .update({
          image: publicUrl,
          image_path: storagePath
        })
        .eq('id', product.id);

      if (updateError) {
        throw new Error(`Database update error: ${updateError.message}`);
      }

      // Also create record in product_images table if exists
      try {
        await supabase
          .from('product_images')
          .upsert([
            {
              product_id: product.id,
              storage_path: storagePath,
              public_url: publicUrl,
              alt_text: product.name,
              is_primary: true,
              sort_order: 0
            }
          ]);
      } catch (piErr) {
        // Table might not exist if migration SQL not executed yet
      }

      stats.databaseUpdated++;
      console.log(`✅ ${prodDesc} -> Migrated successfully to ${storagePath}`);

    } catch (err) {
      console.error(`❌ ${prodDesc} Failed:`, err.message);
      stats.failed++;
      stats.failures.push({ product: product.name, id: product.id, reason: err.message });
    }
  }

  // Summary
  console.log('\n====================================================');
  console.log(' MIGRATION SUMMARY');
  console.log('====================================================');
  console.log(`Total Products:              ${stats.total}`);
  console.log(`Processed:                   ${stats.processed}`);
  console.log(`Already on Supabase Storage: ${stats.skippedAlreadyMigrated}`);
  console.log(`Images Uploaded:             ${stats.uploaded}`);
  console.log(`Database Records Updated:    ${stats.databaseUpdated}`);
  console.log(`Failed:                      ${stats.failed}`);

  if (stats.failures.length > 0) {
    console.log('\n⚠️  Failures Detail:');
    stats.failures.forEach((f) => {
      console.log(`   - ${f.product} (${f.id}): ${f.reason}`);
    });
  } else {
    console.log('\n🎉 All products processed with 0 failures!');
  }
  console.log('====================================================\n');
};

runMigration().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
