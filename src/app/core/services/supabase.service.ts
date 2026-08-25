import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';
import { CloudinaryService } from './cloudinary.service';

// ─── Initial Grocery Mock Data ────────────────────────────────────────────────
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Fresh Fruits & Veggies', slug: 'fruits-veggies', description: 'Farm fresh organic fruits and green vegetables', display_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Atta, Rice & Dal', slug: 'atta-rice-dal', description: 'Chakki fresh wheat flour, basmati rice, and pulses', display_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Oil, Ghee & Spices', slug: 'oil-ghee-spices', description: 'Pure mustard oil, cow ghee, and aromatic whole spices', display_order: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Dairy, Milk & Bakery', slug: 'dairy-bakery', description: 'Fresh milk, butter, paneer, and daily bread', display_order: 4, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-5', name: 'Snacks, Biscuits & Drinks', slug: 'snacks-drinks', description: 'Namkeen, instant noodles, tea, coffee & juices', display_order: 5, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-6', name: 'Household & Cleaning', slug: 'household-cleaning', description: 'Detergents, surface cleaners, and home care items', display_order: 6, is_active: true, created_at: new Date().toISOString() },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aashirvaad Shuddh Chakki Atta',
    slug: 'aashirvaad-shuddh-chakki-atta',
    description: '100% pure whole wheat chakki flour. Rich in dietary fiber, absorbs more water to keep rotis soft and fresh for hours.',
    price: 280,
    original_price: 320,
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'],
    category_id: 'cat-2',
    category: { name: 'Atta, Rice & Dal', slug: 'atta-rice-dal' },
    unit: '5 kg Pack',
    sizes: ['5 kg Pack', '10 kg Pack'],
    tags: ['Bestseller', 'Daily Essential'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    slug: 'fortune-sunlite-sunflower-oil',
    description: 'Light, healthy refined sunflower oil rich in Vitamin E. Perfect for everyday cooking, frying, and baking.',
    price: 135,
    original_price: 160,
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
    category_id: 'cat-3',
    category: { name: 'Oil, Ghee & Spices', slug: 'oil-ghee-spices' },
    unit: '1 Litre Pouch',
    sizes: ['1 Litre Pouch', '5 Litre Jar'],
    tags: ['Essential', 'Healthy'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Fresh Farm Cavendish Bananas',
    slug: 'fresh-farm-cavendish-bananas',
    description: 'Naturally ripened, sweet, nutrient-dense fresh yellow bananas sourced directly from local orchards.',
    price: 50,
    original_price: 65,
    images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80'],
    category_id: 'cat-1',
    category: { name: 'Fresh Fruits & Veggies', slug: 'fruits-veggies' },
    unit: '1 Dozen (12 Pcs)',
    sizes: ['1 Dozen', '2 Dozen'],
    tags: ['Organic', 'Farm Fresh'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Amul Pasteurised Salted Butter',
    slug: 'amul-pasteurised-salted-butter',
    description: 'The iconic taste of India! Made from pure milk fat. Creamy, delicious, and ideal for toasts, parathas, and cooking.',
    price: 58,
    original_price: 60,
    images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80'],
    category_id: 'cat-4',
    category: { name: 'Dairy, Milk & Bakery', slug: 'dairy-bakery' },
    unit: '100g Pack',
    sizes: ['100g Pack', '500g Pack'],
    tags: ['Dairy', 'Amul'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Daawat Rozana Super Basmati Rice',
    slug: 'daawat-rozana-super-basmati-rice',
    description: 'Aromatic, long-grain basmati rice aged to perfection. Non-sticky texture, ideal for daily pulao, biryani, and steam rice.',
    price: 360,
    original_price: 420,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
    category_id: 'cat-2',
    category: { name: 'Atta, Rice & Dal', slug: 'atta-rice-dal' },
    unit: '5 kg Pack',
    sizes: ['5 kg Pack', '10 kg Pack'],
    tags: ['Aromatic', 'Basmati'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Maggi 2-Minute Masala Noodles',
    slug: 'maggi-2-minute-masala-noodles',
    description: 'India\'s favorite instant snack! Made with finest quality spices and wheat flour. Delicious, quick, and satisfying.',
    price: 96,
    original_price: 110,
    images: ['https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80'],
    category_id: 'cat-5',
    category: { name: 'Snacks, Biscuits & Drinks', slug: 'snacks-drinks' },
    unit: 'Pack of 8 (560g)',
    sizes: ['Pack of 4', 'Pack of 8', 'Pack of 12'],
    tags: ['Instant Food', 'Bestseller'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'Fresh Crisp Red Apples (Shimla)',
    slug: 'fresh-crisp-red-apples-shimla',
    description: 'Sweet, juicy, hand-picked Shimla red apples rich in antioxidants and vitamins.',
    price: 140,
    original_price: 180,
    images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80'],
    category_id: 'cat-1',
    category: { name: 'Fresh Fruits & Veggies', slug: 'fruits-veggies' },
    unit: '1 kg Pack',
    sizes: ['500g', '1 kg', '2 kg'],
    tags: ['Fresh', 'Fruit'],
    is_active: true,
    is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-8',
    name: 'Surf Excel Easy Wash Detergent Powder',
    slug: 'surf-excel-easy-wash-detergent-powder',
    description: 'Removes tough stains like tea, oil, and curry easily without fading fabric colors.',
    price: 195,
    original_price: 230,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
    category_id: 'cat-6',
    category: { name: 'Household & Cleaning', slug: 'household-cleaning' },
    unit: '1 kg Pack',
    sizes: ['1 kg Pack', '3 kg Pack'],
    tags: ['Cleaning', 'Household'],
    is_active: true,
    is_featured: false,
    created_at: new Date().toISOString()
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customer_name: 'Suresh Khandelwal',
    rating: 5,
    message: 'KSM always delivers fresh groceries within 45 minutes in Jabalpur. Ordering on WhatsApp is super fast!',
    product_name: 'Aashirvaad Shuddh Chakki Atta',
    is_approved: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'rev-2',
    customer_name: 'Meena Sharma',
    rating: 5,
    message: 'The fruits and vegetables are always clean and fresh. Wholesale rates are much better than local markets.',
    product_name: 'Fresh Farm Cavendish Bananas',
    is_approved: true,
    created_at: new Date().toISOString()
  }
];

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private isMockMode = true;

  private mockCategories: Category[] = [];
  private mockProducts: Product[] = [];
  private mockReviews: Review[] = [];

  constructor() {
    this.initMockData();

    const url = environment.supabase?.url || '';
    const key = environment.supabase?.anonKey || '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        this.supabase = createClient(url, key);
        this.isMockMode = false;
      } catch (err) {
        this.isMockMode = true;
      }
    } else {
      this.isMockMode = true;
    }
  }

  private async initMockData() {
    try {
      const storedCats = localStorage.getItem('ksm_mock_cats');
      this.mockCategories = storedCats ? JSON.parse(storedCats) : INITIAL_CATEGORIES;

      const storedProds = localStorage.getItem('ksm_mock_prods');
      if (storedProds) {
        const parsed = JSON.parse(storedProds);
        if (Array.isArray(parsed) && parsed.length > 10) {
          this.mockProducts = parsed;
        } else {
          await this.loadFullMappedItemList();
        }
      } else {
        await this.loadFullMappedItemList();
      }

      const storedRevs = localStorage.getItem('ksm_mock_revs');
      this.mockReviews = storedRevs ? JSON.parse(storedRevs) : INITIAL_REVIEWS;
    } catch {
      this.mockCategories = [...INITIAL_CATEGORIES];
      this.mockProducts = [...INITIAL_PRODUCTS];
      this.mockReviews = [...INITIAL_REVIEWS];
    }
  }

  private async loadFullMappedItemList() {
    try {
      const res = await fetch('/itemlist_mapped.json');
      if (res.ok) {
        const mapped: Product[] = await res.json();
        this.mockProducts = mapped.slice(0, 250);
        this.saveMockData();
      } else {
        this.mockProducts = [...INITIAL_PRODUCTS];
      }
    } catch {
      this.mockProducts = [...INITIAL_PRODUCTS];
    }
  }

  private saveMockData() {
    try {
      localStorage.setItem('ksm_mock_cats', JSON.stringify(this.mockCategories));
      localStorage.setItem('ksm_mock_prods', JSON.stringify(this.mockProducts));
      localStorage.setItem('ksm_mock_revs', JSON.stringify(this.mockReviews));
    } catch {}
  }

  // ─── Site Settings / CMS ──────────────────────────────────────────────────
  async getSiteSettings(): Promise<any | null> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('site_settings').select('*').eq('key', 'ksm_config').single();
        if (!error && data) return data.value;
      } catch {}
    }
    const stored = localStorage.getItem('ksm_site_settings');
    return stored ? JSON.parse(stored) : null;
  }

  async updateSiteSettings(settings: any): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      try {
        await this.supabase.from('site_settings').upsert({ key: 'ksm_config', value: settings, updated_at: new Date().toISOString() });
        return;
      } catch {}
    }
    localStorage.setItem('ksm_site_settings', JSON.stringify(settings));
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────
  async signIn(email: string, _password: string): Promise<AuthResponse> {
    if (!this.isMockMode && this.supabase) {
      try {
        const res = await this.supabase.auth.signInWithPassword({ email, password: _password });
        if (!res.error) return res;
      } catch {}
    }

    const mockSession = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh',
      user: { id: 'ksm-user-1', email, role: 'authenticated', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' }
    } as Session;

    localStorage.setItem('ksm_mock_session', JSON.stringify(mockSession));
    return { data: { user: mockSession.user, session: mockSession }, error: null };
  }

  async signOut(): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.auth.signOut();
    }
    localStorage.removeItem('ksm_mock_session');
  }

  async getSession(): Promise<Session | null> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data } = await this.supabase.auth.getSession();
        if (data.session) return data.session;
      } catch {}
    }
    const stored = localStorage.getItem('ksm_mock_session');
    return stored ? JSON.parse(stored) : null;
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    if (!this.isMockMode && this.supabase) {
      return this.supabase.auth.onAuthStateChange((_event, session) => callback(session));
    }
    callback(this.getSession() as any);
    return { subscription: { unsubscribe: () => {} } };
  }

  // ─── Categories ────────────────────────────────────────────────────────────
  async getCategories(): Promise<Category[]> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('categories').select('*').eq('is_active', true).order('display_order');
        if (!error && data) return data;
      } catch {}
    }
    return this.mockCategories.filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order);
  }

  async getAllCategories(): Promise<Category[]> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('categories').select('*').order('display_order');
        if (!error && data) return data;
      } catch {}
    }
    return [...this.mockCategories].sort((a, b) => a.display_order - b.display_order);
  }

  async createCategory(cat: Partial<Category>): Promise<Category> {
    if (!this.isMockMode && this.supabase) {
      const { data, error } = await this.supabase.from('categories').insert(cat).select().single();
      if (!error && data) return data;
    }
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: cat.name || 'New Category',
      slug: cat.slug || (cat.name || 'cat').toLowerCase().replace(/\s+/g, '-'),
      description: cat.description,
      display_order: cat.display_order ?? this.mockCategories.length + 1,
      is_active: cat.is_active ?? true,
      created_at: new Date().toISOString()
    };
    this.mockCategories.push(newCat);
    this.saveMockData();
    return newCat;
  }

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    if (!this.isMockMode && this.supabase) {
      const { data, error } = await this.supabase.from('categories').update(cat).eq('id', id).select().single();
      if (!error && data) return data;
    }
    const index = this.mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCategories[index] = { ...this.mockCategories[index], ...cat };
      this.saveMockData();
      return this.mockCategories[index];
    }
    throw new Error('Category not found');
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.from('categories').delete().eq('id', id);
    }
    this.mockCategories = this.mockCategories.filter(c => c.id !== id);
    this.saveMockData();
  }

  // ─── Products ──────────────────────────────────────────────────────────────
  async getProducts(opts?: { categoryId?: string; featured?: boolean; limit?: number; offset?: number; search?: string }): Promise<Product[]> {
    if (this.supabase) {
      try {
        let query = this.supabase.from('products').select('*, category:categories(name, slug)').eq('is_active', true).order('created_at', { ascending: false });
        if (opts?.categoryId) query = query.eq('category_id', opts.categoryId);
        if (opts?.featured) query = query.eq('is_featured', true);
        if (opts?.search) query = query.ilike('name', `%${opts.search}%`);
        if (opts?.limit) query = query.limit(opts.limit);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch {}
    }

    let list = this.mockProducts.filter(p => p.is_active);
    if (opts?.categoryId) {
      list = list.filter(p => p.category_id === opts.categoryId || p.category?.slug === opts.categoryId);
    }
    if (opts?.featured) {
      list = list.filter(p => p.is_featured);
    }
    if (opts?.search) {
      const s = opts.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    if (opts?.limit) {
      list = list.slice(0, opts.limit);
    }
    return list;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (this.supabase) {
      try {
        const { data } = await this.supabase.from('products').select('*, category:categories(name, slug)').eq('slug', slug).eq('is_active', true).single();
        if (data) return data;
      } catch {}
    }
    return this.mockProducts.find(p => p.slug === slug && p.is_active) || null;
  }

  async getAllProducts(opts?: { limit?: number; offset?: number }): Promise<Product[]> {
    if (this.supabase) {
      try {
        let query = this.supabase.from('products').select('*, category:categories(name, slug)').order('created_at', { ascending: false });
        if (opts?.limit) query = query.limit(opts.limit);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch {}
    }
    return [...this.mockProducts];
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    if (!this.isMockMode && this.supabase) {
      const { data, error } = await this.supabase.from('products').insert(product).select().single();
      if (!error && data) return data;
    }
    const catObj = this.mockCategories.find(c => c.id === product.category_id);
    const newProd: Product = {
      id: 'prod-' + Date.now(),
      name: product.name || 'New Grocery Product',
      slug: product.slug || (product.name || 'prod').toLowerCase().replace(/\s+/g, '-'),
      description: product.description || '',
      price: product.price || 100,
      original_price: product.original_price,
      images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
      category_id: product.category_id || 'cat-1',
      category: catObj ? { name: catObj.name, slug: catObj.slug } : undefined,
      unit: product.unit || '1 Pack',
      sizes: product.sizes || [],
      tags: product.tags || [],
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      created_at: new Date().toISOString()
    };
    this.mockProducts.unshift(newProd);
    this.saveMockData();
    return newProd;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    if (!this.isMockMode && this.supabase) {
      const { data, error } = await this.supabase.from('products').update(product).eq('id', id).select().single();
      if (!error && data) return data;
    }
    const index = this.mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      const updated = { ...this.mockProducts[index], ...product };
      if (product.category_id) {
        const cat = this.mockCategories.find(c => c.id === product.category_id);
        if (cat) updated.category = { name: cat.name, slug: cat.slug };
      }
      this.mockProducts[index] = updated;
      this.saveMockData();
      return updated;
    }
    throw new Error('Product not found');
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.from('products').delete().eq('id', id);
    }
    this.mockProducts = this.mockProducts.filter(p => p.id !== id);
    this.saveMockData();
  }

  // ─── Reviews ───────────────────────────────────────────────────────────────
  async getApprovedReviews(): Promise<Review[]> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch {}
    }
    return this.mockReviews.filter(r => r.is_approved);
  }

  async getAllReviews(): Promise<Review[]> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch {}
    }
    return [...this.mockReviews];
  }

  async submitReview(review: Partial<Review>): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.from('reviews').insert({ ...review, is_approved: false });
      return;
    }
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      customer_name: review.customer_name || 'Anonymous',
      rating: review.rating || 5,
      message: review.message || '',
      product_name: review.product_name,
      is_approved: false,
      created_at: new Date().toISOString()
    };
    this.mockReviews.unshift(newRev);
    this.saveMockData();
  }

  async approveReview(id: string): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    }
    const rev = this.mockReviews.find(r => r.id === id);
    if (rev) {
      rev.is_approved = true;
      this.saveMockData();
    }
  }

  async deleteReview(id: string): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.from('reviews').delete().eq('id', id);
    }
    this.mockReviews = this.mockReviews.filter(r => r.id !== id);
    this.saveMockData();
  }

  private cloudinary = inject(CloudinaryService);

  // ─── Storage ───────────────────────────────────────────────────────────────
  async uploadImage(file: File, _bucket: string = 'product-images'): Promise<string> {
    try {
      return await this.cloudinary.uploadImage(file);
    } catch {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
  }

  async deleteImage(_url: string, _bucket: string = 'product-images'): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      const fileName = _url.split('/').pop();
      if (fileName) await this.supabase.storage.from(_bucket).remove([fileName]);
    }
  }
}
