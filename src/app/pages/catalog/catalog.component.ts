import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductDetailModalComponent } from './product-detail-modal.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, ProductDetailModalComponent],
  template: `
    <div class="catalog-page">
      <!-- Header & Search -->
      <section class="catalog-header">
        <div class="container">
          <span class="eyebrow">Complete Store Catalog</span>
          <h1>KSM Grocery Store</h1>
          <p>Find fresh fruits, vegetables, atta, basmati rice, cooking oils, snacks, and household essentials.</p>

          <div class="catalog-search-bar">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
            <input type="text" [(ngModel)]="searchQuery" (input)="filterProducts()" placeholder="Search grocery by name, brand, or item..." />
            @if (searchQuery) {
              <button class="clear-search" (click)="searchQuery = ''; filterProducts()">✕</button>
            }
          </div>
        </div>
      </section>

      <!-- Category Filter Pills (Mobile First Horizontal Scroll) -->
      <section class="filter-pills-section">
        <div class="container">
          <div class="pills-scroll">
            <button class="pill-btn" [class.active]="selectedCategory() === ''" (click)="selectCategory('')">
              🛍️ All Groceries
            </button>
            @for (cat of categories(); track cat.id) {
              <button class="pill-btn" [class.active]="selectedCategory() === cat.id || selectedCategory() === cat.slug" (click)="selectCategory(cat.id)">
                {{ cat.name }}
              </button>
            }
          </div>
        </div>
      </section>

      <!-- Main Products Grid -->
      <section class="catalog-grid-section section-sm">
        <div class="container">
          @if (loading()) {
            <div class="product-grid">
              @for (_ of [1,2,3,4,5,6,7,8,9,10]; track $index) {
                <div class="skeleton" style="height: 300px; border-radius: var(--radius-md)"></div>
              }
            </div>
          } @else if (filteredProducts().length === 0) {
            <div class="empty-state card">
              <span class="empty-emoji">🔍</span>
              <h3>No groceries found matching your search</h3>
              <p>Try clearing your search filters or check another category.</p>
              <button class="btn btn-primary btn-sm" (click)="resetFilters()">Reset Filters</button>
            </div>
          } @else {
            <div class="product-grid">
              @for (product of filteredProducts(); track product.id) {
                <app-product-card [product]="product" (openDetail)="selectedProduct.set($event)"></app-product-card>
              }
            </div>
          }
        </div>
      </section>

      <!-- Product Detail Modal -->
      @if (selectedProduct()) {
        <app-product-detail-modal [product]="selectedProduct()!" (closeModal)="selectedProduct.set(null)"></app-product-detail-modal>
      }
    </div>
  `,
  styles: [`
    .catalog-page {
      padding-top: 60px;
    }
    .catalog-header {
      padding: 2.5rem 0 1.5rem;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #fff;
      text-align: center;
    }
    .catalog-header h1 {
      font-family: var(--font-heading);
      font-size: clamp(1.75rem, 4vw, 2.75rem);
      font-weight: 800;
      margin-block: 0.35rem 0.5rem;
    }
    .catalog-header p {
      color: var(--text-muted);
      font-size: 0.9375rem;
      max-width: 580px;
      margin-inline: auto;
      margin-bottom: 1.25rem;
    }
    .catalog-search-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #fff;
      padding: 0.45rem 1rem;
      border-radius: var(--radius-full);
      max-width: 540px;
      margin-inline: auto;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.2);
    }
    .catalog-search-bar svg { color: var(--text-light); flex-shrink: 0; }
    .catalog-search-bar input {
      flex: 1;
      min-width: 0;
      border: none;
      background: none;
      font-size: 0.875rem;
      color: var(--text-dark);
    }
    .catalog-search-bar input:focus { outline: none; }
    .clear-search { background: none; border: none; font-size: 0.875rem; color: var(--text-light); cursor: pointer; }

    /* Category Filter Pills */
    .filter-pills-section {
      background: #fff;
      border-bottom: 1px solid var(--border);
      padding-block: 0.625rem;
      position: sticky;
      top: 60px;
      z-index: 80;
      box-shadow: var(--shadow-sm);
    }
    .pills-scroll {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.15rem;
      -webkit-overflow-scrolling: touch;
    }
    .pill-btn {
      flex: 0 0 auto;
      padding: 0.4rem 1rem;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--border);
      background: var(--bg-warm);
      color: var(--text-mid);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }
    .pill-btn:hover, .pill-btn.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      max-width: 440px;
      margin-inline: auto;
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
    }
    .empty-emoji { font-size: 2.5rem; }
  `]
})
export class CatalogComponent implements OnInit {
  private seo = inject(SeoService);
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);

  categories = signal<Category[]>([]);
  allProducts = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  loading = signal(true);

  selectedCategory = signal<string>('');
  searchQuery = '';
  selectedProduct = signal<Product | null>(null);

  async ngOnInit() {
    this.seo.setPage({
      title: 'Grocery Catalog — Khandelwal Supermart (KSM)',
      description: 'Explore 5000+ grocery staples, fresh vegetables, fruits, wheat flour, basmati rice, spices, oil, ghee, and dairy products at KSM Jabalpur.'
    });

    try {
      const [cats, prods] = await Promise.all([
        this.supabase.getCategories(),
        this.supabase.getAllProducts()
      ]);
      this.categories.set(cats);
      this.allProducts.set(prods);

      this.route.queryParams.subscribe(params => {
        if (params['category']) {
          this.selectedCategory.set(params['category']);
        }
        if (params['q']) {
          this.searchQuery = params['q'];
        }
        this.filterProducts();
      });
    } catch {
    } finally {
      this.loading.set(false);
    }
  }

  selectCategory(catId: string) {
    this.selectedCategory.set(catId);
    this.filterProducts();
  }

  filterProducts() {
    let list = this.allProducts();
    const cat = this.selectedCategory();
    if (cat) {
      list = list.filter(p => p.category_id === cat || p.category?.slug === cat);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    this.filteredProducts.set(list);
  }

  resetFilters() {
    this.selectedCategory.set('');
    this.searchQuery = '';
    this.filterProducts();
  }
}
