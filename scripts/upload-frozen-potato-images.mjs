#!/usr/bin/env node

/**
 * FOOD EMPIRE - UPLOAD 05_FROZEN_POTATO IMAGES TO SUPABASE CLOUD STORAGE
 * Matches all 16 product codes from public/05_Frozen_Potato/
 * Uploads images to 'product-images' bucket in Supabase Storage,
 * updates products records with the public cloud URL and path,
 * and upserts into product_images table.
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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || envConfig.VITE_SUPABASE_ANON_KEY;
const isDryRun = process.argv.includes('--dry-run');

console.log('====================================================');
console.log(' FOOD EMPIRE — 05_FROZEN_POTATO CLOUD IMAGE UPLOAD');
console.log('====================================================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found.');
  process.exit(1);
}

const BUCKET_NAME = 'product-images';
const supabase = createClient(supabaseUrl, supabaseKey);

const potatoDir = path.join(projectRoot, 'public', '05_Frozen_Potato');

async function uploadPotatoImages() {
  if (!fs.existsSync(potatoDir)) {
    console.error(`❌ Folder not found: ${potatoDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(potatoDir).filter((f) => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp'));
  console.log(`Found ${files.length} images in ${potatoDir}`);

  // Fetch all Frozen Potato products from Supabase
  const { data: potatoProducts, error: fetchErr } = await supabase
    .from('products')
    .select('id, name, category, features, image, image_path')
    .eq('category', 'Frozen Potato');

  if (fetchErr) {
    console.error('❌ Error fetching products:', fetchErr.message);
    process.exit(1);
  }

  console.log(`Fetched ${potatoProducts.length} Frozen Potato products from Supabase.\n`);

  let successCount = 0;
  let failedCount = 0;
  const failures = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const code = path.basename(file, path.extname(file)).trim();
    const product = potatoProducts.find((p) => Array.isArray(p.features) && p.features.includes(code));

    const progress = `[${i + 1}/${files.length}] ${code}`;

    if (!product) {
      console.warn(`⚠️  ${progress} No matching product found in database for code ${code}`);
      failedCount++;
      failures.push({ code, reason: 'Product not found in database' });
      continue;
    }

    const filePath = path.join(potatoDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(file).toLowerCase();
    const contentType = fileExt === '.png' ? 'image/png' : fileExt === '.webp' ? 'image/webp' : 'image/jpeg';
    
    // Cloud storage path: products/{productId}/{code}{ext}
    const storagePath = `products/${product.id}/${code}${fileExt}`;

    if (isDryRun) {
      console.log(`[DRY RUN] ${progress} -> Would upload to ${storagePath} for "${product.name}"`);
      successCount++;
      continue;
    }

    try {
      // 1. Upload to Supabase Storage bucket
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType,
          cacheControl: '31536000',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // 2. Get Public Cloud URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. Update products table
      const { error: updateError } = await supabase
        .from('products')
        .update({
          image: publicUrl,
          image_path: storagePath
        })
        .eq('id', product.id);

      if (updateError) {
        throw new Error(`Products table update failed: ${updateError.message}`);
      }

      // 4. Upsert into product_images gallery table
      try {
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', product.id);

        await supabase
          .from('product_images')
          .insert([
            {
              product_id: product.id,
              storage_path: storagePath,
              public_url: publicUrl,
              alt_text: product.name,
              is_primary: true,
              sort_order: 0
            }
          ]);
      } catch (gErr) {
        console.warn(`Gallery table warning for ${code}:`, gErr.message);
      }

      console.log(`✅ ${progress} -> Connected to Cloud: "${product.name}" (${fileBuffer.length} bytes)`);
      successCount++;
    } catch (err) {
      console.error(`❌ ${progress} Failed:`, err.message);
      failedCount++;
      failures.push({ code, reason: err.message });
    }
  }

  console.log('\n====================================================');
  console.log(' UPLOAD & CLOUD CONNECTION SUMMARY');
  console.log('====================================================');
  console.log(`Total images processed: ${files.length}`);
  console.log(`Successfully uploaded & connected: ${successCount}`);
  console.log(`Failures: ${failedCount}`);
  if (failures.length > 0) {
    console.log('Failure details:', failures);
  }

  // Verification step
  if (!isDryRun) {
    const { data: verifiedPotato } = await supabase
      .from('products')
      .select('id, name, features, image')
      .eq('category', 'Frozen Potato');

    const withCloudImages = verifiedPotato.filter((p) => p.image && p.image.includes('supabase.co/storage/v1/object/public/product-images'));
    console.log(`Verified Frozen Potato products with live Cloud Storage URLs: ${withCloudImages.length} / ${verifiedPotato.length}`);
  }
}

uploadPotatoImages().catch(console.error);
