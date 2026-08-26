import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductDetailModalComponent } from './product-detail-modal.component';
import { expandGroceryQuery } from '../../core/utils/grocery-search.utils';

export interface CategoryGroup {
  categoryName: string;
  categorySlug: string;
  products: Product[];
}

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

      <!-- Main Products Grid Grouped Category-Wise (Strictly 1-Row Carousels with Arrows) -->
      <section class="catalog-grid-section section-sm">
        <div class="container">
          <div class="catalog-meta-bar">
            <span class="meta-count">Showing <strong>{{ visibleProducts().length }}</strong> of <strong>{{ filteredProducts().length }}</strong> items</span>
            @if (searchQuery) {
              <span class="search-tag">Search query: "{{ searchQuery }}"</span>
            }
          </div>

          @if (loading()) {
            <div class="shimmer-rail-group">
              <div class="shimmer-rail-grid">
                @for (_ of [1,2,3,4,5,6]; track $index) {
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
          } @else if (categoryGroups().length === 0) {
            <div class="empty-state card">
              <span class="empty-emoji">🔍</span>
              <h3>No groceries found matching "{{ searchQuery }}"</h3>
              <p>Try searching another brand name or keyword.</p>
              <button class="btn btn-primary btn-sm" (click)="resetFilters()">Reset Filters</button>
            </div>
          } @else {
            <!-- Strict 1-Row Category Carousels -->
            @for (group of categoryGroups(); track group.categoryName) {
              @if (group.products.length > 0) {
                <div class="category-block">
                  <div class="category-block-header">
                    <h2>{{ group.categoryName }}</h2>
                    <span class="category-count-badge">{{ group.products.length }} items</span>
                  </div>

                  <!-- 1-Row Carousel Slider with Arrow Buttons -->
                  <div class="rail-carousel-wrap">
                    <button class="carousel-arrow left-arrow" (click)="scrollRail(railRef, -360)" aria-label="Scroll left">
                      ‹
                    </button>

                    <div #railRef class="horizontal-rail">
                      @for (product of group.products; track product.id) {
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
    .catalog-page { padding-top: 60px; background: #f8fafc; }
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
    .pill-btn:hover, .pill-btn.active { background: #0c831f; color: #fff; border-color: #0c831f; box-shadow: 0 4px 12px rgba(12, 131, 31, 0.25); }

    .catalog-meta-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; font-size: 0.875rem; color: var(--text-light); }
    .meta-count strong { color: #0c831f; font-weight: 800; }
    .search-tag { background: rgba(12, 131, 31, 0.1); color: #0c831f; padding: 0.2rem 0.65rem; border-radius: var(--radius-full); font-weight: 700; font-size: 0.75rem; }

    /* Grouped Category 1-Row Carousel Blocks */
    .category-block { margin-bottom: 2.25rem; }
    .category-block-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.4rem; border-bottom: 2px solid #e2e8f0; }
    .category-block-header h2 { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #1e293b; }
    .category-count-badge { font-size: 0.75rem; font-weight: 700; background: #f1f5f9; color: #64748b; padding: 3px 10px; border-radius: 999px; }

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
  categoryGroups = signal<CategoryGroup[]>([]);
  totalCount = signal<number>(0);

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
      this.totalCount.set(prods.length || 0);

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

  scrollRail(element: HTMLDivElement, offset: number) {
    element.scrollBy({ left: offset, behavior: 'smooth' });
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
      const expandedTerms = expandGroceryQuery(this.searchQuery);
      list = list.filter(p => {
        const text = (p.name + ' ' + (p.description || '') + ' ' + (p.tags ? p.tags.join(' ') : '')).toLowerCase();
        return expandedTerms.some(term => text.includes(term));
      });
    }

    list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    this.filteredProducts.set(list);
    this.displayLimit = 40;
    const slice = list.slice(0, this.displayLimit);
    this.visibleProducts.set(slice);

    // Group current visible slice by Category Name
    const map = new Map<string, Product[]>();
    slice.forEach(p => {
      const catName = p.category?.name || 'Other Groceries';
      if (!map.has(catName)) {
        map.set(catName, []);
      }
      map.get(catName)!.push(p);
    });

    const groups: CategoryGroup[] = [];
    map.forEach((prods, name) => {
      groups.push({ categoryName: name, categorySlug: prods[0]?.category?.slug || '', products: prods });
    });

    this.categoryGroups.set(groups);
  }

  loadMore() {
    this.displayLimit += 40;
    const slice = this.filteredProducts().slice(0, this.displayLimit);
    this.visibleProducts.set(slice);

    const map = new Map<string, Product[]>();
    slice.forEach(p => {
      const catName = p.category?.name || 'Other Groceries';
      if (!map.has(catName)) {
        map.set(catName, []);
      }
      map.get(catName)!.push(p);
    });

    const groups: CategoryGroup[] = [];
    map.forEach((prods, name) => {
      groups.push({ categoryName: name, categorySlug: prods[0]?.category?.slug || '', products: prods });
    });

    this.categoryGroups.set(groups);
  }

  resetFilters() {
    this.selectedCategory.set('');
    this.searchQuery = '';
    this.filterProducts();
  }
}
