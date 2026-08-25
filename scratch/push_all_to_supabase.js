const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');

const url = 'https://yhyubqnfmsfnomboregn.supabase.co';
const key = 'sb_publishable_kNP61uYOmhi9P9ZcOkQiDA_thiFUWwf';
const supabase = createClient(url, key);

function getDeterministicUUID(str) {
  const hash = crypto.createHash('sha1').update('ksm-namespace-' + str).digest('hex');
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
}

const CATEGORIES = [
  { id: getDeterministicUUID('cat-1'), name: 'Fresh Fruits & Veggies', slug: 'fruits-veggies', description: 'Farm fresh organic fruits and green vegetables', display_order: 1, is_active: true },
  { id: getDeterministicUUID('cat-2'), name: 'Atta, Rice & Dal', slug: 'atta-rice-dal', description: 'Chakki fresh wheat flour, basmati rice, and pulses', display_order: 2, is_active: true },
  { id: getDeterministicUUID('cat-3'), name: 'Oil, Ghee & Spices', slug: 'oil-ghee-spices', description: 'Pure mustard oil, cow ghee, and aromatic whole spices', display_order: 3, is_active: true },
  { id: getDeterministicUUID('cat-4'), name: 'Dairy, Milk & Bakery', slug: 'dairy-bakery', description: 'Fresh milk, butter, paneer, and daily bread', display_order: 4, is_active: true },
  { id: getDeterministicUUID('cat-5'), name: 'Snacks, Biscuits & Drinks', slug: 'snacks-drinks', description: 'Namkeen, instant noodles, tea, coffee & juices', display_order: 5, is_active: true },
  { id: getDeterministicUUID('cat-6'), name: 'Household & Cleaning', slug: 'household-cleaning', description: 'Detergents, surface cleaners, and home care items', display_order: 6, is_active: true }
];

async function pushAll() {
  console.log('🚀 Step 1: Upserting 6 Core Categories in Supabase...');
  const { data: dbCats, error: catErr } = await supabase.from('categories').upsert(CATEGORIES, { onConflict: 'slug' }).select();
  if (catErr) {
    console.error('Category Upsert Error:', catErr.message);
    return;
  }
  const catIdMap = {};
  dbCats.forEach(c => { catIdMap[c.slug] = c.id; });
  console.log('✅ Categories Ready!\n');

  console.log('🚀 Step 2: Reading public/itemlist_mapped.json...');
  const rawProducts = JSON.parse(fs.readFileSync('public/itemlist_mapped.json', 'utf8'));
  const validProducts = rawProducts.filter(p => p.price && p.price > 0 && p.name && p.name !== 'ITEM NAME');
  console.log(`Loaded ${validProducts.length} valid products out of ${rawProducts.length} total entries.`);

  const formattedProducts = validProducts.map(p => ({
    id: getDeterministicUUID(p.id),
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    original_price: p.original_price || Math.round(p.price * 1.1),
    images: p.images,
    category_id: catIdMap[p.category.slug] || dbCats[0].id,
    unit: p.unit || '1 Pack',
    sizes: p.sizes || ['Standard Pack'],
    tags: p.tags || ['KSM Direct'],
    is_active: true,
    is_featured: false,
    created_at: new Date().toISOString()
  }));

  const CHUNK_SIZE = 500;
  const totalChunks = Math.ceil(formattedProducts.length / CHUNK_SIZE);
  console.log(`📦 Uploading ${formattedProducts.length} items in ${totalChunks} chunks of ${CHUNK_SIZE} items...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < totalChunks; i++) {
    const chunk = formattedProducts.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    try {
      const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'slug' });
      if (error) {
        console.error(`❌ Chunk ${i + 1}/${totalChunks} failed:`, error.message);
        failCount += chunk.length;
      } else {
        successCount += chunk.length;
        process.stdout.write(`✅ Chunk ${i + 1}/${totalChunks} uploaded (${successCount}/${formattedProducts.length} items)\r`);
      }
    } catch (e) {
      console.error(`❌ Chunk ${i + 1}/${totalChunks} exception:`, e.message);
      failCount += chunk.length;
    }
  }

  console.log('\n\n🎉 ================================================');
  console.log(`✅ BULK SUPABASE MIGRATION FINISHED!`);
  console.log(`Total Uploaded to Supabase DB: ${successCount} products`);
  if (failCount > 0) console.log(`Failed: ${failCount} products`);
  console.log('====================================================\n');
}

pushAll();
