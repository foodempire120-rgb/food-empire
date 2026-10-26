#!/usr/bin/env node

/**
 * FOOD EMPIRE - OFFICIAL CATALOGUE IMPORT & SYNCHRONIZATION TOOL
 * Source of truth: Food Empire Product Catalogue — September 2026 (148 products)
 * 
 * Features:
 * - Idempotent execution (can run multiple times safely without duplicates)
 * - Safe matching of existing products to preserve legitimate uploaded images
 * - Sets all new product image fields to empty / null (ready for manual CMS upload)
 * - Strict verification of category counts and product code uniqueness
 * 
 * Usage:
 *   node scripts/import-food-empire-catalogue.mjs
 *   node scripts/import-food-empire-catalogue.mjs --dry-run
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
console.log(' FOOD EMPIRE — SEPTEMBER 2026 CATALOGUE IMPORT TOOL');
console.log('====================================================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in environment or .env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Canonical 148 product dataset from the official September 2026 Catalogue
export const CATALOGUE_PRODUCTS = [
  // ============================================================
  // CATEGORY 1 — FROZEN BEEF (50 PRODUCTS)
  // ============================================================
  { code: 'FE-AU-0009', name: 'Beef Bone Brisket Bone', brand: 'CAG', origin: 'Australia', delivery: 'Same-day', category: 'Frozen Beef' },
  { code: 'FE-AU-0018', name: 'Beef Striploin Hokubee 352', brand: 'Hokubee', origin: 'Australia', delivery: 'Same-day', category: 'Frozen Beef' },
  { code: 'FE-AU-0027', name: 'Australian Beef D-Rump', brand: 'Ralphs', origin: 'Australia', delivery: 'Same-day', category: 'Frozen Beef' },
  { code: 'FE-AU-0053', name: 'Australian Beef *A* Oyster Blade', brand: 'Midfield', origin: 'Australia', delivery: 'Same-day', category: 'Frozen Beef' },
  { code: 'FE-AU-0055', name: 'Australian Beef Shin/Shank', brand: 'CAG/JBS', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-AU-0059', name: 'Australian Beef Striploin', brand: null, origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-AU-0060', name: 'Australian Beef Tenderloin Grade A', brand: 'GreenHamm / equivalent', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-AU-0063', name: 'Australian Beef Chuck Crest', brand: null, origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-AU-0064', name: 'Australian Beef Outside Skirt', brand: 'ACC', origin: 'Australia', delivery: 'On request', category: 'Frozen Beef' },
  { code: 'FE-AU-0065', name: 'Australian Beef Cube Roll', brand: 'GBP', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-AU-0066', name: 'Australian Beef Chuck Roll', brand: null, origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-AU-0067', name: 'Australian Beef Knuckle', brand: 'Kilcoy', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-AU-0068', name: 'Australian Shortloin (T-Bone)', brand: null, origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-AU-0186', name: 'Beef Cheek Borrello AU', brand: 'Borello', origin: 'Australia', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-AU-0079', name: 'Chilled Australian Beef Striploin', brand: 'Midfield', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-AU-0080', name: 'Australia Kilcoy Beef Chuck Eye Roll', brand: 'Kilcoy', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-AU-0098', name: 'Shin Shank - AUS', brand: 'Ralphs', origin: 'Australia', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-AU-0099', name: 'Australian Beef Hind Shank Boneless (Kilcoy)', brand: 'Kilcoy', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-BR-0074', name: 'Brazilian Beef Short Plate', brand: 'Grain Valley', origin: 'Brazil', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-BR-0075', name: 'Brazilian Beef Shin', brand: 'Friboi', origin: 'Brazil', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-BR-0076', name: 'Brazilian Beef Brisket', brand: 'Grain Valley', origin: 'Brazil', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-BR-0077', name: 'Brazilian Beef Topside', brand: 'Grain Valley', origin: 'Brazil', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-BR-0087', name: 'Brazil Friboi Beef Rib Finger', brand: 'Friboi', origin: 'Brazil', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-CND-0048', name: 'Canadian Bone-in Short Ribs AA', brand: 'Excel / equivalent', origin: 'Canada', delivery: 'Same-day', category: 'Frozen Beef' },
  { code: 'FE-CND-0054', name: 'Canadian Beef Short Plate', brand: null, origin: 'Canada', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-CND-0056', name: 'Canadian AAA Top Blade', brand: 'Blue Ribbon / 1855 Black Angus', origin: 'Canada', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-CND-0070', name: 'Canadian Digital Muscle', brand: null, origin: 'Canada', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-CND-0083', name: 'CND 1855 Black Angus AAA Striploin', brand: '1855 Black Angus', origin: 'Canada', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-CND-0085', name: 'CND 1855 Black Angus AAA Boneless Shortribs', brand: '1855 Black Angus', origin: 'Canada', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-CND-0089', name: 'AAA Outside Skirt', brand: 'Blue Ribbon', origin: 'Canada', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-CND-0090', name: 'AA Boneless Short Rib', brand: 'Blue Ribbon', origin: 'Canada', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-ESP-0078', name: 'Spanish Bonein Beef Short Ribs', brand: 'Roca', origin: 'Spain', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-JP-0086', name: 'Kagoshima Japan Wagyu Beef Striploin A5', brand: 'Kagoshima', origin: 'Japan', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-JP-0091', name: 'A5 Tenderloin', brand: 'Kagoshima', origin: 'Japan', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-JP-0092', name: 'A5 Ribeye', brand: 'Kagoshima', origin: 'Japan', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-JP-0093', name: 'A5 Rib Cap', brand: 'Kagoshima', origin: 'Japan', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-JP-0094', name: 'A4 Rib Cap', brand: 'Kagoshima', origin: 'Japan', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-JP-0095', name: 'A3 Rib Cap', brand: 'Kagoshima', origin: 'Japan', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-JP-0096', name: 'A3 Chuck Rib', brand: 'Kagoshima', origin: 'Japan', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-JP-0097', name: 'A5 Chuck Roll', brand: 'Kagoshima', origin: 'Japan', delivery: '24–48h', category: 'Frozen Beef' },
  { code: 'FE-US-0049', name: 'US Beef Short Plate', brand: 'Excel', origin: 'USA', delivery: 'Same-day', category: 'Frozen Beef' },
  { code: 'FE-US-0057', name: 'US Beef Brisket', brand: 'Swift', origin: 'USA', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-US-0058', name: 'US Beef Rib Finger', brand: 'Swift', origin: 'USA', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-US-0061', name: 'US Bonein Short Rib', brand: 'Swift', origin: 'USA', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-US-0062', name: 'US Boneless Short Rib', brand: 'Excel/Cargill', origin: 'USA', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-US-0071', name: 'US Choice Striploin', brand: 'Cargill', origin: 'USA', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-US-0072', name: 'US Choice T-Bone', brand: null, origin: 'USA', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-US-0081', name: 'JBS U.S Beef Top Blade', brand: 'Swift/JBS', origin: 'USA', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-US-0082', name: 'U.S 1855 Black Angus Choice Tenderloin', brand: '1855 Black Angus', origin: 'USA', delivery: 'Within 24h', category: 'Frozen Beef' },
  { code: 'FE-US-0088', name: 'US Beef Back-Ribs', brand: 'Swift', origin: 'USA', delivery: '24–48h', category: 'Frozen Beef' },

  // ============================================================
  // CATEGORY 2 — FROZEN LAMB (14 PRODUCTS)
  // ============================================================
  { code: 'FE-AU-0001', name: 'Australian Boneless Lamb Leg', brand: 'Hardwicks', origin: 'Australia', delivery: 'Same-day', category: 'Frozen Lamb' },
  { code: 'FE-AU-0100', name: 'Australian Bonein Lamb Leg', brand: 'Mc Herd', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-AU-0101', name: 'Lamb Rack French Cap On', brand: 'Junee Gold / Midfield', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-AU-0102', name: 'Lamb Rack', brand: 'Junee Gold / Midfield', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-AU-0103', name: 'Bonein Lamb Leg Chump Off', brand: 'Junee Gold / Midfield', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-AU-0104', name: 'Lamb Foreshanks', brand: 'Mc Herd', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-AU-0105', name: 'French Mutton Rack CFO', brand: 'Midfield', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-AU-0106', name: 'Boneless Mutton Leg', brand: 'Midfield', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-AU-0107', name: 'Leg Mutton Bonein', brand: 'Midfield', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-AU-0108', name: 'Mutton Rack Standard', brand: 'Midfield', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-AU-0111', name: 'Australia Lamb Rack French Cap Off (Hardwicks)', brand: 'Hardwicks', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-NZ-0109', name: 'Lamb Tenderloin', brand: 'Ovation', origin: 'New Zealand', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-NZ-0110', name: 'Boneless Lamb Shoulder', brand: 'Ovation', origin: 'New Zealand', delivery: 'Within 24h', category: 'Frozen Lamb' },
  { code: 'FE-NZ-0112', name: 'Boneless Lamb Minced', brand: 'Ovation', origin: 'New Zealand', delivery: 'Within 24h', category: 'Frozen Lamb' },

  // ============================================================
  // CATEGORY 3 — IMPORTED POULTRY (6 PRODUCTS)
  // ============================================================
  { code: 'FE-AU-0136', name: 'Imported Chicken Wing', brand: null, origin: null, delivery: 'Within 24h', category: 'Imported Poultry' },
  { code: 'FE-AU-0138', name: 'Chicken Leg Quarter', brand: null, origin: null, delivery: 'Within 24h', category: 'Imported Poultry' },
  { code: 'FE-AU-0139', name: 'Chicken Mid Wing', brand: null, origin: null, delivery: 'Within 24h', category: 'Imported Poultry' },
  { code: 'FE-BR-0141', name: 'Brazil Chicken 3-Joint Wing', brand: 'Seara', origin: 'Brazil', delivery: 'Within 24h', category: 'Imported Poultry' },
  { code: 'FE-US-0137', name: 'Chicken Leg Quarter (Boneless)', brand: null, origin: null, delivery: 'Within 24h', category: 'Imported Poultry' },
  { code: 'FE-US-0140', name: 'U.S Chicken Leg Quarter 15Kg', brand: 'Mountaire / Keystone', origin: 'USA', delivery: 'Within 24h', category: 'Imported Poultry' },

  // ============================================================
  // CATEGORY 4 — FROZEN SEAFOOD (15 PRODUCTS)
  // ============================================================
  { code: 'FE-CH-0147', name: 'Frozen Half-Shell Mussel', brand: null, origin: 'China', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-CH-0156', name: 'Scallops Baby 1Kg', brand: null, origin: 'China', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-CL-0144', name: 'Frozen Coho Salmon (H&G)', brand: 'South Seafood', origin: 'Chile', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-CL-0145', name: 'Frozen Coho Salmon Fillet', brand: 'Aqua', origin: 'Chile', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-CL-0146', name: 'Frozen Coho Salmon Fillet (large)', brand: 'Aqua', origin: 'Chile', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-CL-0153', name: 'Chile Patagonian Toothfish ~3-4Kg', brand: null, origin: 'Chile', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-CL-0154', name: 'Chile Coho Salmon (Head Off)', brand: null, origin: 'Chile', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-CL-0157', name: 'Chile Whole Mussels', brand: 'Proyecta', origin: 'Chile', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-NL-0152', name: 'Amacore Black Cod Fish 1.8-2.3Kg', brand: 'Amacore', origin: 'Netherlands', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-NO-0149', name: 'Frozen Seasoned Herring Fillet', brand: 'Nishimi', origin: 'Norway', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-NO-0151', name: 'Frozen Whole Salmon', brand: null, origin: 'Norway', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-NZ-0148', name: 'Greenshell Mussel Half Shell', brand: null, origin: 'New Zealand', delivery: '24–48h', category: 'Frozen Seafood' },
  { code: 'FE-US-0150', name: 'Frozen Cod (US)', brand: 'Pacific Seafood', origin: 'USA', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-VN-0142', name: 'Frozen Tuna Fillet', brand: null, origin: 'Vietnam', delivery: 'Within 24h', category: 'Frozen Seafood' },
  { code: 'FE-VN-0143', name: 'Frozen Tuna Loin', brand: null, origin: 'Vietnam', delivery: 'Within 24h', category: 'Frozen Seafood' },

  // ============================================================
  // CATEGORY 5 — FROZEN POTATO (16 PRODUCTS)
  // ============================================================
  { code: 'FE-AU-0114', name: 'Straight Cut Fries 10x10', brand: 'Baris Gourmet', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Potato' },
  { code: 'FE-AU-0115', name: 'Shoestring Sure Crisp 6/6 - 2.5kg', brand: 'Mc Cain', origin: 'Australia', delivery: '24–48h', category: 'Frozen Potato' },
  { code: 'FE-AU-0116', name: 'Steak Fries - 2.5kg', brand: 'Mc Cain', origin: 'Australia', delivery: '24–48h', category: 'Frozen Potato' },
  { code: 'FE-AU-0118', name: 'Hash Brown (Triangles) - 800g', brand: 'Mc Cain', origin: 'Australia', delivery: '24–48h', category: 'Frozen Potato' },
  { code: 'FE-AU-0119', name: 'Country Wedges - 2.5kg', brand: 'Mc Cain', origin: 'Australia', delivery: '24–48h', category: 'Frozen Potato' },
  { code: 'FE-AU-0121', name: 'Straight Cut Fries 10x10 - 2.5kg', brand: 'Baris Gourmet', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Potato' },
  { code: 'FE-AU-0123', name: 'Golden Long Fries SC 6/6 - 750g', brand: 'Mc Cain', origin: 'Australia', delivery: '24–48h', category: 'Frozen Potato' },
  { code: 'FE-AU-0124', name: 'Straight Cut Fries 9/9 - 2.5kg', brand: 'Mc Cain', origin: 'Australia', delivery: '24–48h', category: 'Frozen Potato' },
  { code: 'FE-AU-0125', name: 'Country Wedges - 1kg (Baris Gourmet)', brand: 'Baris Gourmet', origin: 'Australia', delivery: 'Within 24h', category: 'Frozen Potato' },
  { code: 'FE-CH-0031', name: 'Frozen Shoestring Acrispy 7*7', brand: 'Acrispy', origin: 'China', delivery: 'Same-day', category: 'Frozen Potato' },
  { code: 'FE-CH-0032', name: 'Frozen Shoestring Acrispy 10*10', brand: 'Acrispy', origin: 'China', delivery: 'Same-day', category: 'Frozen Potato' },
  { code: 'FE-IN-0002', name: 'Crinkle Cut Hungritos', brand: 'Hungritos', origin: 'India', delivery: 'Same-day', category: 'Frozen Potato' },
  { code: 'FE-IN-0113', name: 'Straight Cut Fries 9/9 - 1kg', brand: 'Farm Best', origin: 'India', delivery: '24–48h', category: 'Frozen Potato' },
  { code: 'FE-IN-0117', name: 'Hash Brown (Rosti Rounds) - 1kg', brand: 'Farm Best', origin: 'India', delivery: '24–48h', category: 'Frozen Potato' },
  { code: 'FE-IN-0120', name: 'Wedges skin, 1kg/bags', brand: 'Farm Best', origin: 'India', delivery: 'Within 24h', category: 'Frozen Potato' },
  { code: 'FE-IN-0122', name: 'Country Wedges - 1kg', brand: 'Farm Best', origin: 'India', delivery: 'Within 24h', category: 'Frozen Potato' },

  // ============================================================
  // CATEGORY 6 — BUTTER, CHEESE & DAIRY (28 PRODUCTS)
  // ============================================================
  { code: 'FE-ARG-0047', name: 'Mozzarella BonLe', brand: 'Bonle', origin: 'Argentina', delivery: 'Same-day', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-AU-0036', name: 'Unsalted Buttery Spread 84% 25kg', brand: 'Peerless', origin: 'Australia', delivery: 'Same-day', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-AU-0126', name: 'Butter Oil Substitute Hard (Bos)', brand: 'Peerless', origin: 'Australia', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-AU-0159', name: 'Tasty Cheddar Cheese 250g', brand: 'Bega', origin: 'Australia', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-AU-0160', name: 'Cream Cheese Block 2kg', brand: 'Philadelphia', origin: 'Australia', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-AU-0168', name: 'Milklab Full Cream Dairy Milk 1L', brand: 'Milklab', origin: 'Australia', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-AU-0171', name: 'Greek Style Natural Yogurt 1kg', brand: 'Farmers Union', origin: 'Australia', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-ESP-0128', name: 'Unsalted Butter 82% Fat 250gr', brand: 'Larsa', origin: 'Spain', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-ESP-0129', name: 'Unsalted Butter 82% Fat 1kg', brand: 'Larsa', origin: 'Spain', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-ESP-0166', name: 'Cooking Cream 18% 1L', brand: 'Larsa', origin: 'Spain', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-ESP-0167', name: 'Whipping Cream 35.1% 1L', brand: 'Larsa', origin: 'Spain', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-ESP-0170', name: 'Whole Milk 3.5% 1L', brand: 'Larsa', origin: 'Spain', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-FR-0127', name: 'Unsalted Butter 82% Fat 10kg', brand: 'Président', origin: 'France', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-FR-0158', name: 'Processed Cheese Slices (Burger)', brand: 'Président', origin: 'France', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-FR-0163', name: 'Petit Camembert 50% Fat 125g', brand: 'Président', origin: 'France', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-FR-0164', name: 'Whipping Cream 1L', brand: 'Président', origin: 'France', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-GER-0050', name: 'Mozzarella 2.5kg', brand: 'DMK', origin: 'Germany', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-GER-0132', name: 'Feta White 40% Fat 4kg', brand: 'Grand\'Or', origin: 'Germany', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-IE-0161', name: 'Red Cheddar Block 32% Fat 2.5kg', brand: 'Avonmore', origin: 'Ireland', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-IE-0165', name: 'Whipping Cream 1L', brand: 'Avonmore', origin: 'Ireland', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-IT-0131', name: 'Shredded Mozzarella 2.5kg', brand: 'Galbani', origin: 'Italy', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-IT-0162', name: 'Parmesan Cheese (Grana Padano) 1kg', brand: 'Grand\'Or', origin: 'Italy', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-JP-0169', name: 'Pasteurized Fresh Milk 946ml', brand: 'Meiji', origin: 'Japan', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-JP-0172', name: 'Low Fat Yoghurt Drink 150ml', brand: 'Meiji', origin: 'Japan', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-PL-0035', name: 'Pizza Topping Mozzarella', brand: 'Mleczarnia Goscino', origin: 'Poland', delivery: 'Same-day', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-PL-0130', name: 'Mozzarella Block', brand: 'Mlekpol', origin: 'Poland', delivery: '24–48h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-PL-0004', name: 'Lisolla UHT Full Cream Milk 1L', brand: 'Lisolla', origin: 'Poland', delivery: 'Within 24h', category: 'Butter, Cheese & Dairy' },
  { code: 'FE-SG-0040', name: 'Margarine Palffy Unsalted 15kg', brand: 'Vivo', origin: 'Singapore', delivery: 'Same-day', category: 'Butter, Cheese & Dairy' },

  // ============================================================
  // CATEGORY 7 — OILS, SAUCES & DRY GOODS (19 PRODUCTS)
  // ============================================================
  { code: 'FE-AU-0173', name: 'Oregano Rubbed 500g', brand: 'Atlas', origin: 'Australia', delivery: 'Within 24h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-AU-0174', name: 'Paprika Noble Sweet 1kg', brand: 'Atlas', origin: 'Australia', delivery: 'Within 24h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-ESP-0041', name: 'Black Olive Pitted 1450g/3000g', brand: 'Fragata', origin: 'Spain', delivery: 'Same-day', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-ESP-0176', name: 'Balsamic Vinegar 5L', brand: 'Mas Portell', origin: 'Spain', delivery: 'Within 24h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-IT-0133', name: 'Extra Virgin Olive Oil 5L', brand: 'Mazza', origin: 'Italy', delivery: '24–48h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-IT-0134', name: 'Sun-dried Tomatoes In Oil 1kg', brand: 'Mazza', origin: 'Italy', delivery: '24–48h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-IT-0175', name: 'Balsamic Vinegar Di Modena 5L', brand: 'Mazza', origin: 'Italy', delivery: '24–48h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-IT-0177', name: 'Whole Peeled Tomatoes 2.5kg', brand: 'Mazza', origin: 'Italy', delivery: '24–48h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-IT-0178', name: 'White Beans 400g', brand: 'Contel', origin: 'Italy', delivery: '24–48h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-IT-0179', name: 'Pitted Black Olives 397g', brand: 'Mazza', origin: 'Italy', delivery: '24–48h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-IT-0180', name: 'Red Kidney Beans 400g', brand: 'Contel', origin: 'Italy', delivery: '24–48h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-NL-0184', name: 'Heinz Classic BBQ Sauce 480G', brand: 'Heinz', origin: 'Netherlands', delivery: 'Within 24h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-PL-0037', name: 'Olive Pomace Oil 5L', brand: 'Urzante', origin: 'Poland', delivery: 'Same-day', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-TH-0182', name: 'Heinz Chilli Sauce 300G', brand: 'Heinz', origin: 'Thailand', delivery: 'Within 24h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-TH-0183', name: 'Heinz Tomato Ketchup 300G', brand: 'Heinz', origin: 'Thailand', delivery: 'Within 24h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-UK-0135', name: 'Heinz Mayonnaise 2Kg', brand: 'Heinz', origin: 'UK', delivery: 'Within 24h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-US-0181', name: 'Syrup Country Kitchen 710ml', brand: 'Country Kitchen', origin: 'USA', delivery: 'Within 24h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-US-0185', name: 'Heinz Yellow Mustard 255G', brand: 'Heinz', origin: 'USA', delivery: 'Within 24h', category: 'Oils, Sauces & Dry Goods' },
  { code: 'FE-VN-0013', name: 'Mayonnaise 3kg', brand: 'Aji-Mayo', origin: 'Vietnam', delivery: 'Same-day', category: 'Oils, Sauces & Dry Goods' }
];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Curated mappings for matching existing products in database that predate product codes
// Maps SKU -> existing database product ID
const KNOWN_EXISTING_MAPPINGS = {
  'FE-IN-0002': '1ea89bf2-cc9b-4680-bfe4-a1ca3986c787', // Crinkle Cut Hungritos
  'FE-CH-0031': 'cb28d043-d43b-43e5-9126-ff2d03e048dd', // Frozen Shoestring Acrispy 7×7
  'FE-CH-0032': '977238c0-1160-4376-a6df-e89a72df5eb5', // Frozen Shoestring Acrispy 10×10
  'FE-AU-0009': '5361dbec-6f4c-4480-8127-c788244b62d2', // Beef Bone Brisket Bone CAG (has verified image)
  'FE-AU-0018': '0dbae045-14a9-4c53-b440-5f09fa87de98', // Striploin Hokubee 352 (has verified image)
  'FE-AU-0055': 'f92a2c18-467e-43d5-9cbc-3d753933cbe1', // Shin Shank AUS
  'FE-AU-0027': '463e24ca-4011-413b-81e9-8d6424135927', // Australian Beef D-Rump
  'FE-CND-0048': 'aa0dfc79-9094-4cca-aa53-6d06080fe1f7', // Canadian Bone-in Short Ribs
  'FE-CND-0056': '735b05d1-4634-4de3-840a-eff1e3817792', // Canadian AAA Top Blade
  'FE-US-0049': '64ecec26-111a-4ec8-ac17-9b45c18ffd40', // US Beef Short Plate
  'FE-US-0058': '4109e745-95c5-473f-826c-b9a8b6953aeb', // US Beef Rib Finger
  'FE-AU-0001': '565144fe-4832-46b6-b7fb-999cc0cc2761', // Australian Boneless Lamb Leg
  'FE-PL-0130': '439bd5cd-9f0b-4f67-8ab6-6659e7685596', // Mozzarella Cheese - Mlekpol
  'FE-PL-0035': 'cdbe1550-9c4a-4940-bb87-911df2697e52', // Pizza Topping Mozzarella
  'FE-AU-0036': '7bf313ce-f6a2-4a58-8908-768d509a7d6b', // Peerless AU Unsalted Butter
  'FE-SG-0040': 'dd758263-e55a-4703-afce-1fcac1768a99', // Margarine Palffy Unsalted Vivo
  'FE-PL-0037': '6b11af64-10d3-427b-8849-bcf04f696d2c', // Urzante Olive Pomace Oil
  'FE-ESP-0041': 'edfa1b32-8a72-4265-bc7b-420828a2f320', // Fragata Seedless Black Olives
  'FE-VN-0013': '2ca86dbd-94b9-4d97-baa6-784c9771e2c7'  // Ajinomoto Mayonnaise 3kg
};

async function runImport() {
  console.log(`Connecting to: ${supabaseUrl}`);
  if (isDryRun) {
    console.log('🔍 MODE: DRY RUN (no database writes will occur)\n');
  }

  // 1. Fetch current database state
  const { data: dbProducts, error: dbError } = await supabase.from('products').select('*');
  if (dbError) {
    console.error('❌ Failed to fetch existing products from Supabase:', dbError);
    process.exit(1);
  }
  console.log(`Found ${dbProducts.length} existing products in database.`);

  const existingByCode = new Map();
  const existingById = new Map();
  const allExistingSlugs = new Set();

  for (const p of dbProducts) {
    existingById.set(p.id, p);
    if (p.slug) allExistingSlugs.add(p.slug);

    // If product already has SKU in features, index it
    if (Array.isArray(p.features)) {
      const codeFeature = p.features.find((f) => f.startsWith('FE-'));
      if (codeFeature) {
        existingByCode.set(codeFeature.trim(), p);
      }
    }
  }

  let matchedCount = 0;
  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const duplicateSKUs = [];
  const processedCodes = new Set();
  const usedSlugs = new Set(allExistingSlugs);

  console.log(`\nBeginning processing of ${CATALOGUE_PRODUCTS.length} catalogue items...`);

  for (let idx = 0; idx < CATALOGUE_PRODUCTS.length; idx++) {
    const item = CATALOGUE_PRODUCTS[idx];

    // Check uniqueness in catalogue dataset
    if (processedCodes.has(item.code)) {
      duplicateSKUs.push(item.code);
    }
    processedCodes.add(item.code);

    // Determine if product already exists
    let existingRecord = existingByCode.get(item.code);

    // If not found by explicit SKU code feature, check curated existing mapping
    if (!existingRecord && KNOWN_EXISTING_MAPPINGS[item.code]) {
      const matchedId = KNOWN_EXISTING_MAPPINGS[item.code];
      existingRecord = existingById.get(matchedId);
    }

    // Build features array: [Code, Delivery, Origin]
    const features = [
      item.code,
      item.delivery ? `Delivery: ${item.delivery}` : '',
      item.origin ? `${item.origin} origin` : ''
    ].filter(Boolean);

    if (existingRecord) {
      // Safely update existing record while strictly PRESERVING verified images
      matchedCount++;
      const preserveImage = existingRecord.image || '';
      const preserveImagePath = existingRecord.image_path || null;

      const updatePayload = {
        name: item.name,
        category: item.category,
        country: item.origin || '',
        badge: item.brand || '',
        features,
        is_published: true,
        sort_order: idx + 1,
        image: preserveImage,
        image_path: preserveImagePath
      };

      if (!isDryRun) {
        const { error: updateErr } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', existingRecord.id);

        if (updateErr) {
          console.error(`❌ Failed to update ${item.code} (${item.name}):`, updateErr.message);
        } else {
          updatedCount++;
        }
      } else {
        updatedCount++;
      }
    } else {
      // Insert new product with empty / null image fields
      // Ensure unique slug
      let baseSlug = slugify(item.name);
      if (!baseSlug) baseSlug = slugify(item.code);
      let targetSlug = baseSlug;

      if (usedSlugs.has(targetSlug)) {
        targetSlug = `${baseSlug}-${slugify(item.code)}`;
      }
      let counter = 1;
      while (usedSlugs.has(targetSlug)) {
        targetSlug = `${baseSlug}-${slugify(item.code)}-${counter}`;
        counter++;
      }
      usedSlugs.add(targetSlug);

      const insertPayload = {
        name: item.name,
        slug: targetSlug,
        category: item.category,
        country: item.origin || '',
        description: '', // Empty/NULL per prompt instructions
        badge: item.brand || '',
        image: '',       // EMPTY / NULL per prompt instructions
        image_path: null,
        rating: 4.8,
        suppliers: 1,
        features,
        is_published: true,
        sort_order: idx + 1
      };

      if (!isDryRun) {
        const { error: insertErr } = await supabase
          .from('products')
          .insert([insertPayload]);

        if (insertErr) {
          console.error(`❌ Failed to insert ${item.code} (${item.name}):`, insertErr.message);
        } else {
          insertedCount++;
        }
      } else {
        insertedCount++;
      }
    }
  }

  console.log('\n====================================================');
  console.log(' IMPORT SUMMARY & VERIFICATION');
  console.log('====================================================');

  if (isDryRun) {
    console.log('Dry run completed successfully. Summary:');
    console.log(`Matched existing products: ${matchedCount}`);
    console.log(`New products to insert:    ${insertedCount}`);
    console.log(`Duplicate SKUs in source:  ${duplicateSKUs.length}`);
    return;
  }

  // 2. Programmatic Verification against live Supabase database
  const { data: finalProducts, error: finalError } = await supabase
    .from('products')
    .select('*');

  if (finalError) {
    console.error('❌ Failed to verify database state:', finalError);
    process.exit(1);
  }

  // Filter catalogue products (those having SKU in features)
  const catalogueInDb = finalProducts.filter((p) =>
    Array.isArray(p.features) && p.features.some((f) => f.startsWith('FE-'))
  );

  const categoryCounts = {
    'Frozen Beef': 0,
    'Frozen Lamb': 0,
    'Imported Poultry': 0,
    'Frozen Seafood': 0,
    'Frozen Potato': 0,
    'Butter, Cheese & Dairy': 0,
    'Oils, Sauces & Dry Goods': 0
  };

  const dbCodeSet = new Set();
  const dbDupeCodes = [];
  let withoutImagesCount = 0;
  let withVerifiedImagesCount = 0;

  for (const p of catalogueInDb) {
    const code = p.features.find((f) => f.startsWith('FE-'));
    if (code) {
      if (dbCodeSet.has(code)) dbDupeCodes.push(code);
      dbCodeSet.add(code);
    }

    if (categoryCounts[p.category] !== undefined) {
      categoryCounts[p.category]++;
    }

    if (!p.image || p.image.trim() === '') {
      withoutImagesCount++;
    } else {
      withVerifiedImagesCount++;
    }
  }

  console.log(`TOTAL CATALOGUE PRODUCTS: ${catalogueInDb.length}`);
  console.log('');
  console.log(`Frozen Beef: ${categoryCounts['Frozen Beef']} (Expected: 50)`);
  console.log(`Frozen Lamb: ${categoryCounts['Frozen Lamb']} (Expected: 14)`);
  console.log(`Imported Poultry: ${categoryCounts['Imported Poultry']} (Expected: 6)`);
  console.log(`Frozen Seafood: ${categoryCounts['Frozen Seafood']} (Expected: 15)`);
  console.log(`Frozen Potato: ${categoryCounts['Frozen Potato']} (Expected: 16)`);
  console.log(`Butter, Cheese & Dairy: ${categoryCounts['Butter, Cheese & Dairy']} (Expected: 28)`);
  console.log(`Oils, Sauces & Dry Goods: ${categoryCounts['Oils, Sauces & Dry Goods']} (Expected: 19)`);
  console.log('----------------------------------------------------');
  console.log(`Existing products matched:       ${matchedCount}`);
  console.log(`New products inserted:           ${insertedCount}`);
  console.log(`Existing products safely updated:${updatedCount}`);
  console.log(`Duplicate SKUs found:            ${dbDupeCodes.length}`);
  console.log(`Products without images:         ${withoutImagesCount}`);
  console.log(`Products with preserved images:  ${withVerifiedImagesCount}`);
  console.log(`Import failures:                 ${148 - (matchedCount + insertedCount)}`);
  console.log('====================================================\n');

  const allPassed =
    catalogueInDb.length === 148 &&
    dbCodeSet.size === 148 &&
    dbDupeCodes.length === 0 &&
    categoryCounts['Frozen Beef'] === 50 &&
    categoryCounts['Frozen Lamb'] === 14 &&
    categoryCounts['Imported Poultry'] === 6 &&
    categoryCounts['Frozen Seafood'] === 15 &&
    categoryCounts['Frozen Potato'] === 16 &&
    categoryCounts['Butter, Cheese & Dairy'] === 28 &&
    categoryCounts['Oils, Sauces & Dry Goods'] === 19;

  if (allPassed) {
    console.log('✅ ALL VERIFICATION CHECKS PASSED PERFECTLY!');
  } else {
    console.error('❌ VERIFICATION CHECK FAILED. Please review counts.');
    process.exit(1);
  }
}

runImport().catch((err) => {
  console.error('Unexpected error during catalogue import:', err);
  process.exit(1);
});
