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
          <span class="eyebrow">Complete Store Catalog (41,714 Items)</span>
          <h1>KSM Grocery Store</h1>
          <p>Search across all 41,000+ groceries, staples, spices, cooking oils, snacks, and household essentials.</p>

          <div class="catalog-search-bar">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearchInput()" placeholder="Search 41,000+ items by name, brand, or barcode..." />
            @if (searchQuery) {
              <button class="clear-search" (click)="searchQuery = ''; filterProducts()">✕</button>
            }
          </div>
        </div>
      </section>

      <!-- Category Filter Pills -->
      <section class="filter-pills-section">
        <div class="container">
          <div class="pills-scroll">
            <button class="pill-btn" [class.active]="selectedCategory() === ''" (click)="selectCategory('')">
              🛍️ All Groceries ({{ totalCount() }})
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
          <div class="catalog-meta-bar">
            <span class="meta-count">Showing <strong>{{ visibleProducts().length }}</strong> of <strong>{{ filteredProducts().length }}</strong> items</span>
            @if (searchQuery) {
              <span class="search-tag">Search query: "{{ searchQuery }}"</span>
            }
          </div>

          @if (loading()) {
            <div class="product-grid">
              @for (_ of [1,2,3,4,5,6,7,8,9,10,11,12]; track $index) {
                <div class="skeleton" style="height: 300px; border-radius: var(--radius-md)"></div>
              }
            </div>
          } @else if (filteredProducts().length === 0) {
            <div class="empty-state card">
              <span class="empty-emoji">🔍</span>
              <h3>No groceries found matching "{{ searchQuery }}"</h3>
              <p>Try searching another brand name or keyword.</p>
              <button class="btn btn-primary btn-sm" (click)="resetFilters()">Reset Filters</button>
            </div>
          } @else {
            <div class="product-grid">
              @for (product of visibleProducts(); track product.id) {
                <app-product-card [product]="product" (openDetail)="selectedProduct.set($event)"></app-product-card>
              }
            </div>

            @if (visibleProducts().length < filteredProducts().length) {
              <div class="load-more-wrap">
                <button class="btn btn-secondary btn-lg load-more-btn" (click)="loadMore()">
                  ⚡ Load Next 40 Groceries ({{ filteredProducts().length - visibleProducts().length }} remaining)
                </button>
              </div>
            }
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
    .catalog-page { padding-top: 60px; }
    .catalog-header { padding: 2.5rem 0 1.5rem; background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: #fff; text-align: center; }
    .catalog-header h1 { font-family: var(--font-heading); font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; margin-block: 0.35rem 0.5rem; }
    .catalog-header p { color: var(--text-muted); font-size: 0.9375rem; max-width: 580px; margin-inline: auto; margin-bottom: 1.25rem; }
    .catalog-search-bar { display: flex; align-items: center; gap: 0.5rem; background: #fff; padding: 0.45rem 1rem; border-radius: var(--radius-full); max-width: 540px; margin-inline: auto; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.2); }
    .catalog-search-bar svg { color: var(--text-light); flex-shrink: 0; }
    .catalog-search-bar input { flex: 1; min-width: 0; border: none; background: none; font-size: 0.875rem; color: var(--text-dark); }
    .catalog-search-bar input:focus { outline: none; }
    .clear-search { background: none; border: none; font-size: 0.875rem; color: var(--text-light); cursor: pointer; }

    /* Category Filter Pills */
    .filter-pills-section { background: #fff; border-bottom: 1px solid var(--border); padding-block: 0.625rem; position: sticky; top: 60px; z-index: 80; box-shadow: var(--shadow-sm); }
    .pills-scroll { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.15rem; -webkit-overflow-scrolling: touch; }
    .pill-btn { flex: 0 0 auto; padding: 0.4rem 1rem; border-radius: var(--radius-full); border: 1.5px solid var(--border); background: var(--bg-warm); color: var(--text-mid); font-size: 0.8125rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all var(--transition-fast); }
    .pill-btn:hover, .pill-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }

    .catalog-meta-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.875rem; color: var(--text-light); }
    .meta-count strong { color: var(--primary); font-weight: 800; }
    .search-tag { background: rgba(37, 99, 235, 0.1); color: var(--primary); padding: 0.2rem 0.65rem; border-radius: var(--radius-full); font-weight: 700; font-size: 0.75rem; }

    .load-more-wrap { text-align: center; margin-top: 2.5rem; }
    .load-more-btn { padding: 0.875rem 2rem; font-weight: 800; }

    .empty-state { text-align: center; padding: 3rem 1.5rem; max-width: 440px; margin-inline: auto; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
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
  visibleProducts = signal<Product[]>([]);
  totalCount = signal<number>(41714);

  loading = signal(true);
  selectedCategory = signal<string>('');
  searchQuery = '';
  selectedProduct = signal<Product | null>(null);

  displayLimit = 40;

  async ngOnInit() {
    this.seo.setPage({
      title: 'Grocery Catalog (41,000+ Items) — Khandelwal Supermart (KSM)',
      description: 'Search 41,000+ grocery items from GoFrugal billing software at KSM Jabalpur.'
    });

    try {
      const [cats, prods] = await Promise.all([
        this.supabase.getCategories(),
        this.supabase.getAllProducts()
      ]);
      this.categories.set(cats);
      this.allProducts.set(prods);
      this.totalCount.set(prods.length || 41713);

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

  onSearchInput() {
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
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.tags && p.tags.some(t => t.toLowerCase().includes(q))));
    }

    this.filteredProducts.set(list);
    this.displayLimit = 40;
    this.visibleProducts.set(list.slice(0, this.displayLimit));
  }

  loadMore() {
    this.displayLimit += 40;
    this.visibleProducts.set(this.filteredProducts().slice(0, this.displayLimit));
  }

  resetFilters() {
    this.selectedCategory.set('');
    this.searchQuery = '';
    this.filterProducts();
  }
}
