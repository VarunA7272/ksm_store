const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = 'https://yhyubqnfmsfnomboregn.supabase.co';
const key = 'sb_publishable_kNP61uYOmhi9P9ZcOkQiDA_thiFUWwf';
const supabase = createClient(url, key);

const CATEGORIES = [
  { id: 'cat-1', name: 'Fresh Fruits & Veggies', slug: 'fruits-veggies', description: 'Farm fresh organic fruits and green vegetables', display_order: 1, is_active: true },
  { id: 'cat-2', name: 'Atta, Rice & Dal', slug: 'atta-rice-dal', description: 'Chakki fresh wheat flour, basmati rice, and pulses', display_order: 2, is_active: true },
  { id: 'cat-3', name: 'Oil, Ghee & Spices', slug: 'oil-ghee-spices', description: 'Pure mustard oil, cow ghee, and aromatic whole spices', display_order: 3, is_active: true },
  { id: 'cat-4', name: 'Dairy, Milk & Bakery', slug: 'dairy-bakery', description: 'Fresh milk, butter, paneer, and daily bread', display_order: 4, is_active: true },
  { id: 'cat-5', name: 'Snacks, Biscuits & Drinks', slug: 'snacks-drinks', description: 'Namkeen, instant noodles, tea, coffee & juices', display_order: 5, is_active: true },
  { id: 'cat-6', name: 'Household & Cleaning', slug: 'household-cleaning', description: 'Detergents, surface cleaners, and home care items', display_order: 6, is_active: true }
];

async function pushData() {
  console.log('🚀 Step 1: Inserting Categories into Supabase...');
  const { error: catErr } = await supabase.from('categories').upsert(CATEGORIES);
  if (catErr) {
    console.error('Error inserting categories:', catErr.message);
    return;
  }
  console.log('✅ 6 Categories inserted/upserted successfully!\n');

  console.log('🚀 Step 2: Reading public/itemlist_mapped.json (41,714 items)...');
  const rawProducts = JSON.parse(fs.readFileSync('public/itemlist_mapped.json', 'utf8'));
  console.log(`Loaded ${rawProducts.length} items from JSON file.`);

  // Format products for Supabase schema
  const formattedProducts = rawProducts.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    original_price: p.original_price,
    images: p.images,
    category_id: p.category_id,
    unit: p.unit || '1 Pack',
    sizes: p.sizes || ['Standard Pack'],
    tags: p.tags || ['KSM Direct'],
    is_active: true,
    is_featured: p.is_featured || false,
    created_at: p.created_at || new Date().toISOString()
  }));

  const CHUNK_SIZE = 500;
  const totalChunks = Math.ceil(formattedProducts.length / CHUNK_SIZE);
  console.log(`📦 Preparing to upload ${formattedProducts.length} products in ${totalChunks} chunks of ${CHUNK_SIZE} items...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < totalChunks; i++) {
    const chunk = formattedProducts.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    
    try {
      const { error: prodErr } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
      if (prodErr) {
        console.error(`❌ Chunk ${i + 1}/${totalChunks} failed:`, prodErr.message);
        failCount += chunk.length;
      } else {
        successCount += chunk.length;
        console.log(`✅ Chunk ${i + 1}/${totalChunks} pushed! (${successCount}/${formattedProducts.length} items completed)`);
      }
    } catch (err) {
      console.error(`❌ Chunk ${i + 1}/${totalChunks} exception:`, err.message);
      failCount += chunk.length;
    }
  }

  console.log('\n🎉 ================================================');
  console.log(`✅ BULK SUPABASE MIGRATION FINISHED!`);
  console.log(`Successfully Uploaded: ${successCount} products`);
  if (failCount > 0) console.log(`Failed: ${failCount} products`);
  console.log('====================================================\n');
}

pushData();
