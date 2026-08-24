require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cloudinary = require('cloudinary').v2;

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USER_IDS = (process.env.TELEGRAM_ALLOWED_USERS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'ksm-grocery';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
}

if (!BOT_TOKEN) {
  console.error('❌ ERROR: TELEGRAM_BOT_TOKEN missing in bot/.env');
  process.exit(1);
}

const supabase = (SUPABASE_URL.startsWith('http')) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🛒 Khandelwal Supermart (KSM) Telegram AI Admin Bot running...');
console.log('📱 Allowed User IDs:', ALLOWED_USER_IDS.length > 0 ? ALLOWED_USER_IDS.join(', ') : 'All users allowed');

function isAuthorized(msg) {
  if (ALLOWED_USER_IDS.length === 0) return true;
  const userId = msg.from?.id?.toString();
  const username = msg.from?.username ? `@${msg.from.username}` : '';
  return ALLOWED_USER_IDS.includes(userId) || (username && ALLOWED_USER_IDS.includes(username));
}

bot.onText(/\/start/, (msg) => {
  if (!isAuthorized(msg)) return bot.sendMessage(msg.chat.id, '⛔ Unauthorized user.');
  bot.sendMessage(msg.chat.id,
    `🛒 *Welcome to KSM Mobile Admin Bot!*\n\n` +
    `Simply upload a grocery photo with caption format:\n` +
    `*Item Name | Price | Category*\n` +
    `Example:\n\`Aashirvaad Atta 5kg | 280 | Atta, Rice & Dal\`\n\n` +
    `1. Photo is automatically uploaded to *Cloudinary* ☁️\n` +
    `2. *Gemini AI* generates description & weight variants 🧠\n` +
    `3. Product is published live to KSM Store! 🚀`,
    { parse_mode: 'Markdown' }
  );
});

bot.on('photo', async (msg) => {
  if (!isAuthorized(msg)) return bot.sendMessage(msg.chat.id, '⛔ Unauthorized access.');

  const chatId = msg.chat.id;
  const caption = msg.caption || '';

  if (!caption) {
    return bot.sendMessage(chatId, '⚠️ Please provide a caption: *Item Name | Price | Category*\n\nExample: `Fortune Sunflower Oil 5L | 650 | Oil & Ghee`', { parse_mode: 'Markdown' });
  }

  const parts = caption.split('|').map(s => s.trim());
  const name = parts[0] || 'Grocery Product';
  const price = parseFloat(parts[1]) || 100;
  const categoryInput = parts[2] || 'General Grocery';

  bot.sendMessage(chatId, `⏳ Processing *${name}* via Cloudinary & AI...`, { parse_mode: 'Markdown' });

  try {
    // 1. Get highest resolution photo from Telegram
    const photo = msg.photo[msg.photo.length - 1];
    const fileLink = await bot.getFileLink(photo.file_id);

    // 2. Upload photo to Cloudinary
    let imageUrl = fileLink;
    if (CLOUDINARY_API_KEY) {
      const uploadRes = await cloudinary.uploader.upload(fileLink, {
        folder: 'ksm_products',
        public_id: `prod_${Date.now()}`
      });
      imageUrl = uploadRes.secure_url;
    }

    // 3. AI Description & Unit Extraction via Gemini
    let aiDescription = `Fresh, high quality ${name} delivered to your doorstep in Jabalpur by Khandelwal Supermart.`;
    let unit = '1 Pack';

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Write a appetizing 2-sentence product description for grocery item "${name}" priced at ₹${price}. Mention Jabalpur delivery. Keep it under 25 words.`;
        const result = await model.generateContent(prompt);
        aiDescription = result.response.text().trim();
      } catch (aiErr) {
        console.warn('Gemini AI fallback:', aiErr.message);
      }
    }

    // Extract unit weight from name if present (e.g. 5kg, 1L, 500g)
    const weightMatch = name.match(/(\d+\s*(kg|g|l|ml|pack|pcs))/i);
    if (weightMatch) {
      unit = weightMatch[0];
    }

    // 4. Save to Supabase DB if configured
    if (supabase) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Match category
      let categoryId = null;
      const { data: catData } = await supabase.from('categories').select('id, name');
      if (catData && catData.length > 0) {
        const matched = catData.find(c => c.name.toLowerCase().includes(categoryInput.toLowerCase()));
        categoryId = matched ? matched.id : catData[0].id;
      }

      await supabase.from('products').insert({
        name,
        slug,
        description: aiDescription,
        price,
        unit,
        category_id: categoryId,
        images: [imageUrl],
        is_active: true,
        is_featured: true
      });
    }

    // 5. Send Success Confirmation back to Telegram
    bot.sendMessage(chatId,
      `✅ *Product Live on KSM Store!*\n\n` +
      `📦 *Name:* ${name}\n` +
      `💰 *Price:* ₹${price}\n` +
      `⚖️ *Unit:* ${unit}\n` +
      `☁️ *Cloudinary Image:* [View Image](${imageUrl})\n\n` +
      `📝 *AI Description:* ${aiDescription}`,
      { parse_mode: 'Markdown' }
    );

  } catch (error) {
    console.error('Error processing Telegram product:', error);
    bot.sendMessage(chatId, `❌ Error uploading product: ${error.message}`);
  }
});
