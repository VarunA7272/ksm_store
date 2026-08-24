import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { SiteSettingsService } from '../../core/services/site-settings.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { Review } from '../../core/models/review.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductDetailModalComponent } from '../catalog/product-detail-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent, ProductDetailModalComponent],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-content">
              <span class="eyebrow">{{ settings().hero.eyebrow }}</span>
              <h1 class="hero-title">{{ settings().hero.title }}</h1>
              <p class="hero-desc">{{ settings().hero.description }}</p>

              <!-- Live Mobile-Friendly Search Box -->
              <div class="hero-search-box">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
                <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" placeholder="Search Atta, Rice, Milk, Oil, Snacks..." />
                <button class="btn btn-primary btn-sm" (click)="onSearch()">Search</button>
              </div>

              <!-- Key Stats Pill -->
              <div class="hero-stats">
                <div class="stat-item">
                  <strong>{{ settings().hero.statProducts }}</strong>
                  <span>Groceries</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <strong>{{ settings().hero.statCustomers }}</strong>
                  <span>Jabalpur Families</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <strong>{{ settings().hero.statDelivery }}</strong>
                  <span>Express Delivery</span>
                </div>
              </div>
            </div>

            <!-- Hero Image Banner -->
            <div class="hero-banner-wrap">
              <div class="hero-card-badge">
                <span class="badge-icon">🚚</span>
                <div>
                  <strong>Free Home Delivery</strong>
                  <p>In Jabalpur on orders above ₹499</p>
                </div>
              </div>
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80" alt="KSM Grocery Store" class="hero-img" />
            </div>
          </div>
        </div>
      </section>

      <!-- Horizontal Category Pills Scroll (Mobile First) -->
      <section class="category-scroll-section section-sm">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow">Browse by Category</span>
            <h2>Fresh Grocery Categories</h2>
          </div>

          <div class="category-pills-row">
            @for (cat of categories(); track cat.id) {
              <a [routerLink]="['/catalog']" [queryParams]="{category: cat.slug}" class="cat-pill-card card">
                <span class="cat-icon">{{ getCategoryEmoji(cat.name) }}</span>
                <span class="cat-name">{{ cat.name }}</span>
              </a>
            }
          </div>
        </div>
      </section>

      <!-- Featured Grocery Products Grid -->
      <section class="section">
        <div class="container">
          <div class="section-header-flex">
            <div>
              <span class="eyebrow">Top Recommendations</span>
              <h2>Daily Grocery Staples</h2>
            </div>
            <a routerLink="/catalog" class="btn btn-secondary btn-sm">View All 5000+ Items →</a>
          </div>

          @if (loadingProducts()) {
            <div class="product-grid">
              @for (_ of [1,2,3,4,5,6,7,8]; track $index) {
                <div class="skeleton" style="height: 300px; border-radius: var(--radius-md)"></div>
              }
            </div>
          } @else {
            <div class="product-grid">
              @for (product of featuredProducts(); track product.id) {
                <app-product-card [product]="product" (openDetail)="selectedProduct.set($event)"></app-product-card>
              }
            </div>
          }
        </div>
      </section>

      <!-- WhatsApp Express Order Banner -->
      <section class="wa-banner-section section-sm">
        <div class="container">
          <div class="wa-banner-card glass-panel">
            <div class="wa-banner-content">
              <span class="eyebrow" style="background: rgba(37,211,102,0.15); color: #25D366; border-color: rgba(37,211,102,0.3)">💬 Express WhatsApp Checkout</span>
              <h2>{{ settings().waBanner.title }}</h2>
              <p>{{ settings().waBanner.subtext }}</p>
            </div>
            <a [href]="waLink()" target="_blank" class="btn btn-fresh btn-lg">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
              {{ settings().waBanner.buttonText }}
            </a>
          </div>
        </div>
      </section>

      <!-- Why Shop at KSM (Benefits) -->
      <section class="why-ksm-section section">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow">Why KSM</span>
            <h2>Why Families Choose Khandelwal Supermart</h2>
          </div>

          <div class="benefits-grid">
            <div class="benefit-card card">
              <div class="benefit-icon">🥬</div>
              <h3>100% Fresh Produce</h3>
              <p>Direct farm-sourced fruits & vegetables checked for top quality every morning.</p>
            </div>

            <div class="benefit-card card">
              <div class="benefit-icon">⚡</div>
              <h3>45-Min Express Delivery</h3>
              <p>Lightning fast home delivery across all neighborhoods in Jabalpur, MP.</p>
            </div>

            <div class="benefit-card card">
              <div class="benefit-icon">🏷️</div>
              <h3>Wholesale Savings</h3>
              <p>Guaranteed lower prices than local markets & supermarkets every day.</p>
            </div>

            <div class="benefit-card card">
              <div class="benefit-icon">📱</div>
              <h3>Easy WhatsApp Orders</h3>
              <p>Simply send your grocery list on WhatsApp — no tedious checkouts required!</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Customer Reviews -->
      @if (reviews().length > 0) {
        <section class="reviews-section section-sm" style="background: var(--bg-white)">
          <div class="container">
            <div class="section-header">
              <span class="eyebrow">Customer Love</span>
              <h2>What Jabalpur Says About KSM</h2>
            </div>

            <div class="reviews-grid">
              @for (rev of reviews(); track rev.id) {
                <div class="review-card card">
                  <div class="stars">★★★★★</div>
                  <p class="review-text">"{{ rev.message }}"</p>
                  <div class="reviewer">
                    <strong>{{ rev.customer_name }}</strong>
                    <span class="review-prod">{{ rev.product_name || 'Verified Grocery Customer' }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>
      }

      <!-- Modal Detail View -->
      @if (selectedProduct()) {
        <app-product-detail-modal [product]="selectedProduct()!" (closeModal)="selectedProduct.set(null)"></app-product-detail-modal>
      }
    </div>
  `,
  styles: [`
    .home-page {
      padding-top: 60px;
    }
    .hero-section {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #fff;
      padding-block: clamp(2rem, 5vw, 4rem);
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 2.5rem;
      align-items: center;
    }
    @media (max-width: 900px) {
      .hero-grid { grid-template-columns: 1fr; gap: 1.5rem; }
    }
    .hero-title {
      font-family: var(--font-heading);
      font-size: clamp(1.75rem, 5vw, 3rem);
      font-weight: 800;
      line-height: 1.25;
      margin-block: 0.5rem 0.75rem;
      color: #fff;
    }
    .hero-desc {
      color: var(--text-muted);
      font-size: 0.9375rem;
      margin-bottom: 1.5rem;
      max-width: 540px;
      line-height: 1.5;
    }
    .hero-search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.35rem 0.35rem 0.35rem 1rem;
      border-radius: var(--radius-full);
      max-width: 520px;
      margin-bottom: 1.5rem;
    }
    .hero-search-box svg { color: rgba(255, 255, 255, 0.6); flex-shrink: 0; }
    .hero-search-box input {
      flex: 1;
      min-width: 0;
      background: none;
      border: none;
      color: #fff;
      font-size: 0.875rem;
    }
    .hero-search-box input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    .hero-search-box input:focus {
      outline: none;
    }
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .stat-item strong {
      display: block;
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 800;
      color: var(--primary-light);
    }
    .stat-item span {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .stat-divider {
      width: 1px; height: 28px;
      background: rgba(255, 255, 255, 0.15);
    }
    .hero-banner-wrap {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }
    .hero-img {
      width: 100%; height: clamp(200px, 35vw, 340px);
      object-fit: cover;
    }
    .hero-card-badge {
      position: absolute;
      bottom: 12px; left: 12px; right: 12px;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(12px);
      padding: 0.75rem;
      border-radius: var(--radius-md);
      display: flex; align-items: center; gap: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .badge-icon { font-size: 1.5rem; }
    .hero-card-badge strong { color: #fff; font-size: 0.875rem; }
    .hero-card-badge p { color: var(--text-muted); font-size: 0.75rem; }

    /* Category Pills Row */
    .category-pills-row {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x mandatory;
    }
    .cat-pill-card {
      flex: 0 0 auto;
      scroll-snap-align: start;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.1rem;
      border-radius: var(--radius-full);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--text-dark);
      white-space: nowrap;
    }
    .cat-pill-card:hover {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }
    .cat-icon { font-size: 1.125rem; }

    .section-header-flex {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .section-header-flex h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.35rem, 3.5vw, 2rem);
      font-weight: 800;
    }

    /* WA Banner Card */
    .wa-banner-card {
      padding: 2rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      color: #fff;
    }
    .wa-banner-content h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.25rem, 3vw, 1.75rem);
      font-weight: 800;
      margin-block: 0.35rem;
    }
    .wa-banner-content p {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    /* Benefits Grid */
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-top: 1.5rem;
    }
    @media (max-width: 900px) {
      .benefits-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .benefits-grid { grid-template-columns: 1fr; }
    }
    .benefit-card {
      padding: 1.25rem 1rem;
      text-align: center;
    }
    .benefit-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .benefit-card h3 { font-family: var(--font-heading); font-size: 0.9375rem; font-weight: 700; margin-bottom: 0.25rem; }
    .benefit-card p { font-size: 0.8125rem; color: var(--text-light); }

    /* Reviews Grid */
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1.25rem;
    }
    @media (max-width: 768px) {
      .reviews-grid { grid-template-columns: 1fr; }
    }
    .review-card { padding: 1.25rem; }
    .stars { color: var(--accent-gold); margin-bottom: 0.35rem; font-size: 0.9375rem; letter-spacing: 1px; }
    .review-text { font-style: italic; color: var(--text-mid); margin-bottom: 0.5rem; font-size: 0.875rem; }
    .reviewer strong { font-size: 0.8125rem; display: block; color: var(--text-dark); }
    .review-prod { font-size: 0.6875rem; color: var(--primary); font-weight: 600; }
  `]
})
export class HomeComponent implements OnInit {
  private seo = inject(SeoService);
  private supabase = inject(SupabaseService);
  private siteSettings = inject(SiteSettingsService);
  private router = inject(Router);

  settings = this.siteSettings.settings;
  waLink = this.siteSettings.waLink;

  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);
  reviews = signal<Review[]>([]);
  loadingProducts = signal(true);

  searchQuery = '';
  selectedProduct = signal<Product | null>(null);

  async ngOnInit() {
    this.seo.setPage({
      title: 'Khandelwal Supermart (KSM) — Fresh Grocery Delivery in Jabalpur',
      description: 'Order fresh fruits, vegetables, chakki atta, basmati rice, mustard oil, ghee, and daily household items online from Khandelwal Supermart Jabalpur.'
    });

    try {
      const [cats, prods, revs] = await Promise.all([
        this.supabase.getCategories(),
        this.supabase.getProducts({ featured: true, limit: 10 }),
        this.supabase.getApprovedReviews()
      ]);
      this.categories.set(cats);
      this.featuredProducts.set(prods);
      this.reviews.set(revs);
    } catch {
    } finally {
      this.loadingProducts.set(false);
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/catalog'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  getCategoryEmoji(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('fruit') || n.includes('veg')) return '🥦';
    if (n.includes('atta') || n.includes('rice') || n.includes('dal')) return '🌾';
    if (n.includes('oil') || n.includes('ghee') || n.includes('spice')) return '🛢️';
    if (n.includes('dairy') || n.includes('milk') || n.includes('bakery')) return '🥛';
    if (n.includes('snack') || n.includes('drink')) return '🍿';
    if (n.includes('house') || n.includes('clean')) return '🧹';
    return '🛒';
  }
}
