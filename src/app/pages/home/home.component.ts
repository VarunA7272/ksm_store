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

export interface CategorySection {
  category: Category;
  products: Product[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent, ProductDetailModalComponent],
  template: `
    <div class="home-page">
      <!-- Blinkit Style Hero Banners -->
      <section class="blinkit-hero-section">
        <div class="container">
          <!-- Main Hero Banner -->
          <div class="blinkit-banner-card">
            <div class="banner-content">
              <span class="banner-badge">⚡ Express Delivery in Jabalpur</span>
              <h1>Stock up on daily essentials</h1>
              <p>Get farm-fresh goodness & a range of exotic fruits, vegetables, staples & snacks</p>
              <a routerLink="/catalog" class="banner-btn">Shop Now</a>
            </div>
            <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80" alt="Daily Essentials" class="banner-img" />
          </div>

          <!-- 3 Feature Promo Cards -->
          <div class="blinkit-promo-grid">
            <div class="promo-card promo-teal">
              <div>
                <h3>Pharmacy & Health</h3>
                <p>Express doorstep delivery</p>
              </div>
              <span class="promo-icon">💊</span>
            </div>
            <div class="promo-card promo-gold">
              <div>
                <h3>Pet Care Supplies</h3>
                <p>Food, treats & toys</p>
              </div>
              <span class="promo-icon">🐶</span>
            </div>
            <div class="promo-card promo-blue">
              <div>
                <h3>Baby & Diaper Run?</h3>
                <p>Wipes, diapers & food</p>
              </div>
              <span class="promo-icon">👶</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Icon Bar (Blinkit Style Icon Grid) -->
      <section class="category-icon-bar-section section-sm">
        <div class="container">
          <div class="category-icon-grid">
            @for (cat of categories(); track cat.id) {
              <a [routerLink]="['/catalog']" [queryParams]="{category: cat.slug}" class="cat-icon-card">
                <div class="cat-icon-circle">
                  <span>{{ getCategoryEmoji(cat.name) }}</span>
                </div>
                <span class="cat-icon-label">{{ cat.name }}</span>
              </a>
            }
          </div>
        </div>
      </section>

      <!-- Category-Wise Product Carousel Rails (Single Row per Category with Slider Arrows) -->
      <section class="category-rails-section section-sm">
        <div class="container">
          @if (loadingProducts()) {
            <div class="rail-loading-box">
              @for (_ of [1,2,3]; track $index) {
                <div class="shimmer-rail-group">
                  <div class="shimmer shimmer-title" style="width: 200px; height: 24px; margin-bottom: 1rem;"></div>
                  <div class="shimmer-rail-grid">
                    @for (__ of [1,2,3,4,5,6]; track $index) {
                      <div class="shimmer-card">
                        <div class="shimmer shimmer-img"></div>
                        <div class="shimmer shimmer-title"></div>
                        <div class="shimmer-footer">
                          <div class="shimmer shimmer-price"></div>
                          <div class="shimmer shimmer-btn"></div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            @for (sec of categorySections(); track sec.category.id) {
              @if (sec.products.length > 0) {
                <div class="category-rail-box">
                  <div class="rail-header">
                    <h2>{{ sec.category.name }}</h2>
                    <a [routerLink]="['/catalog']" [queryParams]="{category: sec.category.slug}" class="see-all-link">
                      see all <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
                    </a>
                  </div>

                  <!-- 1-Row Carousel Slider with Arrow Buttons -->
                  <div class="rail-carousel-wrap">
                    <button class="carousel-arrow left-arrow" (click)="scrollRail(railRef, -360)" aria-label="Scroll left">
                      ‹
                    </button>

                    <div #railRef class="horizontal-rail">
                      @for (product of sec.products; track product.id) {
                        <div class="rail-item">
                          <app-product-card [product]="product" (openDetail)="selectedProduct.set($event)"></app-product-card>
                        </div>
                      }
                    </div>

                    <button class="carousel-arrow right-arrow" (click)="scrollRail(railRef, 360)" aria-label="Scroll right">
                      ›
                    </button>
                  </div>
                </div>
              }
            }
          }
        </div>
      </section>

      <!-- Customer Reviews -->
      @if (reviews().length > 0) {
        <section class="reviews-section section-sm">
          <div class="container">
            <div class="section-header">
              <span class="eyebrow">Customer Feedback</span>
              <h2>What Jabalpur Families Say</h2>
            </div>

            <div class="reviews-grid">
              @for (rev of reviews(); track rev.id) {
                <div class="review-card card">
                  <div class="stars">★★★★★</div>
                  <p class="review-text">"{{ rev.message }}"</p>
                  <div class="reviewer">
                    <strong>{{ rev.customer_name }}</strong>
                    <span class="review-prod">{{ rev.product_name || 'Verified Customer' }}</span>
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
    .home-page { padding-top: 60px; background: #f8fafc; }

    /* Blinkit Hero Banners */
    .blinkit-hero-section { padding-block: 1.25rem 0.5rem; }
    .blinkit-banner-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #15803d 0%, #166534 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 2rem 2.5rem;
      overflow: hidden;
      position: relative;
      margin-bottom: 1rem;
    }
    .banner-content { max-width: 540px; z-index: 2; }
    .banner-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 800; margin-bottom: 0.75rem; }
    .banner-content h1 { font-family: var(--font-heading); font-size: clamp(1.5rem, 3.5vw, 2.5rem); font-weight: 800; line-height: 1.2; margin-bottom: 0.5rem; }
    .banner-content p { color: rgba(255,255,255,0.85); font-size: 0.9375rem; margin-bottom: 1.25rem; }
    .banner-btn { display: inline-block; background: #ffffff; color: #15803d; font-weight: 800; padding: 0.65rem 1.5rem; border-radius: 8px; font-size: 0.875rem; transition: transform 150ms ease; }
    .banner-btn:hover { transform: translateY(-2px); }
    .banner-img { width: 220px; height: 160px; object-fit: cover; border-radius: 12px; z-index: 1; }

    @media (max-width: 768px) {
      .blinkit-banner-card { padding: 1.5rem; flex-direction: column; text-align: center; }
      .banner-img { display: none; }
    }

    /* 3 Promo Grid Cards */
    .blinkit-promo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    @media (max-width: 768px) { .blinkit-promo-grid { grid-template-columns: 1fr; } }
    .promo-card { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-radius: 12px; color: #ffffff; }
    .promo-teal { background: linear-gradient(135deg, #0d9488, #0f766e); }
    .promo-gold { background: linear-gradient(135deg, #d97706, #b45309); }
    .promo-blue { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
    .promo-card h3 { font-size: 1rem; font-weight: 800; margin-bottom: 2px; }
    .promo-card p { font-size: 0.75rem; opacity: 0.9; }
    .promo-icon { font-size: 2rem; }

    /* Category Icon Bar Grid */
    .category-icon-bar-section { padding-block: 1rem; }
    .category-icon-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.75rem; }
    @media (max-width: 768px) { .category-icon-grid { grid-template-columns: repeat(3, 1fr); } }
    .cat-icon-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.35rem; padding: 0.75rem 0.5rem; background: #ffffff; border-radius: 12px; border: 1px solid #e8e8e8; transition: all 150ms ease; }
    .cat-icon-card:hover { border-color: #0c831f; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .cat-icon-circle { width: 44px; height: 44px; border-radius: 50%; background: #f0fdf4; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .cat-icon-label { font-size: 0.75rem; font-weight: 700; color: #1f1f1f; line-height: 1.2; }

    /* Category Carousel Rails */
    .category-rail-box { margin-bottom: 2rem; }
    .rail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.875rem; padding-bottom: 0.35rem; border-bottom: 1.5px solid #e8e8e8; }
    .rail-header h2 { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #1f1f1f; }
    .see-all-link { display: inline-flex; align-items: center; gap: 2px; color: #0c831f; font-weight: 800; font-size: 0.875rem; text-transform: lowercase; }
    .see-all-link:hover { text-decoration: underline; }

    /* Carousel Slider Wrapper & Floating Arrows */
    .rail-carousel-wrap { position: relative; display: flex; align-items: center; }
    .horizontal-rail {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding-block: 0.25rem;
      width: 100%;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .horizontal-rail::-webkit-scrollbar { display: none; }
    .rail-item { flex: 0 0 190px; }
    @media (max-width: 600px) { .rail-item { flex: 0 0 155px; } }

    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      color: #1f1f1f;
      font-size: 1.25rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 150ms ease;
    }
    .carousel-arrow:hover {
      background: #0c831f;
      color: #ffffff;
      border-color: #0c831f;
      transform: translateY(-50%) scale(1.1);
    }
    .left-arrow { left: -16px; }
    .right-arrow { right: -16px; }

    @media (max-width: 768px) {
      .carousel-arrow { display: none; }
    }

    .shimmer-rail-group { margin-bottom: 2rem; }
    .shimmer-rail-grid { display: flex; gap: 1rem; overflow-x: hidden; }
    .shimmer-rail-grid .shimmer-card { flex: 0 0 190px; }

    .reviews-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem; }
    @media (max-width: 768px) { .reviews-grid { grid-template-columns: 1fr; } }
    .review-card { padding: 1.25rem; background: #ffffff; border-radius: 12px; border: 1px solid #e8e8e8; }
    .stars { color: #f59e0b; font-size: 0.9375rem; margin-bottom: 0.35rem; }
    .review-text { font-style: italic; color: #334155; font-size: 0.875rem; margin-bottom: 0.5rem; }
    .reviewer strong { font-size: 0.8125rem; color: #0f172a; display: block; }
    .review-prod { font-size: 0.6875rem; color: #0c831f; font-weight: 700; }
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
  categorySections = signal<CategorySection[]>([]);
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
      const [cats, allProds, revs] = await Promise.all([
        this.supabase.getCategories(),
        this.supabase.getAllProducts(),
        this.supabase.getApprovedReviews()
      ]);

      this.categories.set(cats);
      this.reviews.set(revs);

      // Group products category by category
      const sections: CategorySection[] = cats.map(cat => ({
        category: cat,
        products: allProds.filter(p => p.category_id === cat.id || p.category?.slug === cat.slug)
      }));

      this.categorySections.set(sections);
    } catch {
    } finally {
      this.loadingProducts.set(false);
    }
  }

  scrollRail(element: HTMLDivElement, offset: number) {
    element.scrollBy({ left: offset, behavior: 'smooth' });
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
