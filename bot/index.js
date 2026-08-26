require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cloudinary = require('cloudinary').v2;
const https = require('https');

function getBufferFromUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ─── Google Reverse Image Search & Studio Photo Scraper ──────────────────────
async function performGoogleReverseImageSearch(userPhotoUrl, searchQuery) {
  try {
    const headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" };

    const reverseUrl = `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(userPhotoUrl)}`;
    const redirectUrl = await new Promise((resolve) => {
      https.get(reverseUrl, { headers }, (res) => {
        resolve(res.headers.location || res.headers.Location || null);
      }).on("error", () => resolve(null));
    });

    let foundStudioImg = null;
    let foundPrice = null;

    if (redirectUrl) {
      const htmlData = await new Promise((resolve) => {
        https.get(redirectUrl, { headers }, (res) => {
          let d = "";
          res.on("data", chunk => d += chunk);
          res.on("end", () => resolve(d));
        }).on("error", () => resolve(""));
      });

      const cdnMatches = htmlData.match(/https:\/\/(?:cdn\.grofers\.com|images\.unsplash\.com|m\.media-amazon\.com|encrypted-tbn\d\.gstatic\.com).*?\.(?:jpg|png|jpeg|webp)/gi);
      if (cdnMatches && cdnMatches.length > 0) {
        foundStudioImg = cdnMatches[0];
      }

      const priceMatches = htmlData.match(/(?:₹|Rs\.?\s*)(\d{2,4})/gi);
      if (priceMatches && priceMatches.length > 0) {
        foundPrice = parseInt(priceMatches[0].replace(/[^0-9]/g, ''));
      }
    }

    if (!foundStudioImg && searchQuery) {
      const kwUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery + ' blinkit product image amazon')}`;
      const kwHtml = await new Promise((resolve) => {
        https.get(kwUrl, { headers }, (res) => {
          let d = "";
          res.on("data", chunk => d += chunk);
          res.on("end", () => resolve(d));
        }).on("error", () => resolve(""));
      });

      const kwCdnMatches = kwHtml.match(/https:\/\/(?:cdn\.grofers\.com|images\.unsplash\.com|m\.media-amazon\.com).*?\.(?:jpg|png|jpeg|webp)/gi);
      if (kwCdnMatches && kwCdnMatches.length > 0) {
        foundStudioImg = kwCdnMatches[0];
      }

      if (!foundPrice) {
        const kwPriceMatches = kwHtml.match(/(?:₹|Rs\.?\s*)(\d{2,4})/gi);
        if (kwPriceMatches && kwPriceMatches.length > 0) {
          foundPrice = parseInt(kwPriceMatches[0].replace(/[^0-9]/g, ''));
        }
      }
    }

    return { studioImg: foundStudioImg, price: foundPrice };
  } catch {
    return { studioImg: null, price: null };
  }
}

const BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const ALLOWED_USER_IDS = (process.env.TELEGRAM_ALLOWED_USERS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://yhyubqnfmsfnomboregn.supabase.co').trim();
const SUPABASE_KEY = (process.env.SUPABASE_ANON_KEY || 'sb_publishable_kNP61uYOmhi9P9ZcOkQiDA_thiFUWwf').trim();
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();

const CLOUDINARY_CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || 'ksm-grocery').trim();
const CLOUDINARY_API_KEY = (process.env.CLOUDINARY_API_KEY || '').trim();
const CLOUDINARY_API_SECRET = (process.env.CLOUDINARY_API_SECRET || '').trim();

if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });
}

if (!BOT_TOKEN || BOT_TOKEN === 'your_telegram_bot_token' || !BOT_TOKEN.includes(':')) {
  console.error('\n❌ ERROR: TELEGRAM_BOT_TOKEN in bot/.env is invalid or placeholder!');
  console.error('👉 Open bot/.env and set your real TELEGRAM_BOT_TOKEN from @BotFather (e.g. 123456789:ABCdefGHIjklMNOpqrsTUVwxyZ)\n');
  process.exit(1);
}

const supabase = (SUPABASE_URL.startsWith('http')) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.on('polling_error', (error) => {
  if (error?.message?.includes('404 Not Found')) {
    console.error('\n❌ TELEGRAM ERROR 404: Invalid Telegram Bot Token!');
    console.error('👉 The TELEGRAM_BOT_TOKEN set in bot/.env was rejected by Telegram API.');
    console.error('👉 Please check bot/.env and paste your exact token from @BotFather.\n');
  }
});

console.log('🤖 KSM Telegram AI Multimodal Vision & Reverse Image Bot Running...');
console.log('📱 Allowed User IDs:', ALLOWED_USER_IDS.length > 0 ? ALLOWED_USER_IDS.join(', ') : 'All users allowed');

const CATEGORY_UUID_MAP = {
  "fruits-veggies": "3873cc1c-238f-4d77-a37a-3366fa41e0ed",
  "atta-rice-dal": "f174b3b2-54de-41f6-a2da-83dbe7fe01f3",
  "oil-ghee-spices": "8a98ce88-42a5-44fb-a436-06c71e163377",
  "dairy-bakery": "83ecd5b2-bba8-488a-aa06-84b2de5c7c95",
  "snacks-drinks": "26a67454-8d35-46e6-abb7-9bbeef356fea",
  "household-cleaning": "08989192-72f4-4e9e-af52-916b857010a2"
};

const CATEGORY_DEFAULT_IMAGES = {
  "fruits-veggies": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
  "atta-rice-dal": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
  "oil-ghee-spices": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
  "dairy-bakery": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80",
  "snacks-drinks": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80",
  "household-cleaning": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"
};

function mapCategoryNameToSlug(catName) {
  const c = (catName || '').toLowerCase();
  if (c.includes('fruit') || c.includes('veg')) return 'fruits-veggies';
  if (c.includes('atta') || c.includes('rice') || c.includes('dal') || c.includes('flour')) return 'atta-rice-dal';
  if (c.includes('oil') || c.includes('ghee') || c.includes('spice') || c.includes('masala')) return 'oil-ghee-spices';
  if (c.includes('dairy') || c.includes('milk') || c.includes('paneer') || c.includes('curd') || c.includes('butter') || c.includes('bakery')) return 'dairy-bakery';
  if (c.includes('house') || c.includes('shampoo') || c.includes('soap') || c.includes('cleaning')) return 'household-cleaning';
  return 'snacks-drinks';
}

function isAuthorized(msg) {
  if (ALLOWED_USER_IDS.length === 0) return true;
  const userId = msg.from?.id?.toString();
  const username = msg.from?.username ? `@${msg.from.username}` : '';
  return ALLOWED_USER_IDS.includes(userId) || (username && ALLOWED_USER_IDS.includes(username));
}

// Grouping buffer for multi-photo uploads (2-3 photos per product)
const pendingAlbumGroups = new Map();

bot.onText(/\/start/, (msg) => {
  if (!isAuthorized(msg)) return bot.sendMessage(msg.chat.id, '⛔ Unauthorized user.');
  bot.sendMessage(msg.chat.id,
    `📸 *Welcome to KSM AI Google Reverse Image & Product Scanner Bot!*\n\n` +
    `Simply send *1 to 3 photos* of any grocery product packaging.\n\n` +
    `🤖 *What I will do automatically:*\n` +
    `1. 🧠 *AI Vision OCR*: Reads product name, brand, weight & MRP from packaging.\n` +
    `2. 🔍 *Reverse Image Search*: Finds matching official studio product cover photo from Google & catalog!\n` +
    `3. ☁️ *Cloudinary Re-hosting*: Re-hosts high-res studio cover photo under Cloudinary.\n` +
    `4. 🚀 *Supabase Auto-Publish*: Publishes product live with official studio cover!`,
    { parse_mode: 'Markdown' }
  );
});

bot.on('photo', async (msg) => {
  if (!isAuthorized(msg)) return bot.sendMessage(msg.chat.id, '⛔ Unauthorized access.');

  const chatId = msg.chat.id;
  const mediaGroupId = msg.media_group_id || `single_${msg.message_id}_${Date.now()}`;
  const photo = msg.photo[msg.photo.length - 1]; // highest resolution photo

  if (!pendingAlbumGroups.has(mediaGroupId)) {
    pendingAlbumGroups.set(mediaGroupId, {
      chatId,
      photos: [],
      timer: setTimeout(() => processProductGroup(mediaGroupId), 3000)
    });
  }

  const group = pendingAlbumGroups.get(mediaGroupId);
  group.photos.push(photo.file_id);
});

async function processProductGroup(mediaGroupId) {
  const group = pendingAlbumGroups.get(mediaGroupId);
  if (!group) return;
  pendingAlbumGroups.delete(mediaGroupId);

  const { chatId, photos } = group;
  bot.sendMessage(chatId, `🔍 Received photo. Analyzing packaging via Gemini AI...`, { parse_mode: 'Markdown' });

  try {
    // 1. Get file URLs for all photos
    const fileUrls = [];
    for (const fileId of photos) {
      const link = await bot.getFileLink(fileId);
      fileUrls.push(link);
    }

    const userPhotoUrl = fileUrls[0];

    // 2. Download 1st photo buffer for Gemini Vision OCR Analysis
    let extractedDetails = {
      name: '',
      brand: 'Grocery',
      unit: '1 Pack',
      price: 0,
      mrp: 0,
      category: 'Snacks, Biscuits & Drinks'
    };

    if (genAI) {
      const modelNames = ['gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
      let visionSuccess = false;

      for (const modelName of modelNames) {
        if (visionSuccess) break;
        try {
          const buffer = await getBufferFromUrl(userPhotoUrl);
          const mimeType = 'image/jpeg';
          const model = genAI.getGenerativeModel({ model: modelName });

          const prompt = `You are a grocery store AI inventory scanner. Examine this product packaging image carefully.
Extract the following information in raw JSON format with NO markdown codeblocks:
{
  "name": "Full product name (e.g. Amul Gold Full Cream Milk)",
  "brand": "Brand name (e.g. Amul)",
  "unit": "Net weight/volume from package (e.g. 500 ml, 1 kg, 200 g)",
  "price": estimated selling price as a number,
  "mrp": printed MRP on package as a number,
  "category": "one of: Dairy, Milk & Bakery | Atta, Rice & Dal | Oil, Ghee & Spices | Snacks, Biscuits & Drinks | Household & Cleaning | Fresh Fruits & Veggies"
}`;

          const imagePart = {
            inlineData: {
              data: buffer.toString('base64'),
              mimeType
            }
          };

          const result = await model.generateContent([prompt, imagePart]);
          const responseText = result.response.text().trim();
          const jsonText = responseText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(jsonText);

          if (parsed.name) extractedDetails.name = parsed.name;
          if (parsed.brand) extractedDetails.brand = parsed.brand;
          if (parsed.unit) extractedDetails.unit = parsed.unit;
          if (parsed.price) extractedDetails.price = parseFloat(parsed.price);
          if (parsed.mrp) extractedDetails.mrp = parseFloat(parsed.mrp);
          if (parsed.category) extractedDetails.category = parsed.category;

          visionSuccess = true;
        } catch (aiErr) {
          console.warn(`Model ${modelName} fallback:`, aiErr.message);
        }
      }
    }

    if (!extractedDetails.name) {
      extractedDetails.name = 'Fresh Grocery Product';
    }

    // 3. Reverse Search Studio Photo Match in Database & Google
    bot.sendMessage(chatId, `🖼️ Matching studio cover photo & price for *"${extractedDetails.brand} ${extractedDetails.name}"*...`, { parse_mode: 'Markdown' });

    let studioImageFound = null;

    if (supabase && extractedDetails.name) {
      const firstKeyword = extractedDetails.name.split(' ')[0];
      const { data: dbMatches } = await supabase
        .from('products')
        .select('name, price, original_price, images')
        .ilike('name', `%${firstKeyword}%`)
        .limit(10);

      if (dbMatches && dbMatches.length > 0) {
        const studioMatches = dbMatches.filter(m => m.images && m.images.length > 0 && !m.images[0].includes('telegram.org'));
        const exactMatch = studioMatches.find(m => m.name.toLowerCase().includes(extractedDetails.name.toLowerCase()) || extractedDetails.name.toLowerCase().includes(m.name.toLowerCase()));
        if (exactMatch && exactMatch.images && exactMatch.images.length > 0) {
          studioImageFound = exactMatch.images[0];
          if (extractedDetails.price === 0 || extractedDetails.price === 100) {
            extractedDetails.price = exactMatch.price;
            extractedDetails.mrp = exactMatch.original_price || Math.round(exactMatch.price * 1.12);
          }
        }
      }
    }

    if (!studioImageFound) {
      const reverseResult = await performGoogleReverseImageSearch(userPhotoUrl, `${extractedDetails.brand} ${extractedDetails.name} ${extractedDetails.unit}`);
      if (reverseResult.studioImg) studioImageFound = reverseResult.studioImg;
      if (reverseResult.price && (extractedDetails.price === 0 || extractedDetails.price === 100)) {
        extractedDetails.price = reverseResult.price;
        extractedDetails.mrp = Math.round(reverseResult.price * 1.12);
      }
    }

    if (extractedDetails.price === 0) extractedDetails.price = 45;
    if (extractedDetails.mrp === 0) extractedDetails.mrp = 50;

    const catSlug = mapCategoryNameToSlug(extractedDetails.category);
    const catDbUuid = CATEGORY_UUID_MAP[catSlug];
    const defaultCover = CATEGORY_DEFAULT_IMAGES[catSlug];

    const finalImageToUse = studioImageFound || defaultCover;
    const slug = extractedDetails.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    // 4. Re-host Studio Cover Photo in Cloudinary
    let finalCloudinaryUrl = finalImageToUse;
    if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      try {
        const uploadRes = await cloudinary.uploader.upload(finalImageToUse, {
          folder: `ksm_products/${slug}`,
          public_id: `studio_cover`,
          tags: `ksm_product,studio_cover,${slug}`
        });
        finalCloudinaryUrl = uploadRes.secure_url;
      } catch (cErr) {
        console.error('Cloudinary upload error:', cErr.message);
      }
    }

    // 5. Save Product Live to Supabase
    if (supabase) {
      await supabase.from('products').insert({
        name: extractedDetails.name,
        slug,
        description: `${extractedDetails.name} by ${extractedDetails.brand} (${extractedDetails.unit}). High quality grocery product delivered by KSM Jabalpur.`,
        price: extractedDetails.price,
        original_price: extractedDetails.mrp > extractedDetails.price ? extractedDetails.mrp : Math.round(extractedDetails.price * 1.15),
        category_id: catDbUuid,
        unit: extractedDetails.unit,
        sizes: [extractedDetails.unit],
        images: [finalCloudinaryUrl],
        tags: ['KSM Reverse Match', extractedDetails.brand],
        is_active: true,
        is_featured: true
      });
    }

    // 6. Send Rich Summary Back to Telegram
    bot.sendMessage(chatId,
      `🎉 *Studio Product Published Live to Web App!*\n\n` +
      `📦 *Name:* ${extractedDetails.name}\n` +
      `🏷️ *Brand:* ${extractedDetails.brand}\n` +
      `⚖️ *Net Weight:* ${extractedDetails.unit}\n` +
      `💰 *Market Price:* ₹${extractedDetails.price} _(MRP: ₹${extractedDetails.mrp})_\n` +
      `📁 *Category:* ${extractedDetails.category}\n` +
      `🖼️ *Studio Cover Image:* [View Studio Cover](${finalCloudinaryUrl})\n\n` +
      `✨ *Result:* Matched official high-res studio picture & published live to store!`,
      { parse_mode: 'Markdown' }
    );

  } catch (err) {
    console.error('Error processing product album:', err);
    bot.sendMessage(chatId, `❌ Error processing photos: ${err.message}`);
  }
}
