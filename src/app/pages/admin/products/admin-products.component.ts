import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminShellComponent } from '../admin-shell.component';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

const CATEGORY_MAP = [
  { id: "cat-1", name: "Fresh Fruits & Veggies", slug: "fruits-veggies", keywords: ["FRUIT", "VEG", "BANANA", "APPLE", "MANGO", "ONION", "POTATO", "TOMATO"] },
  { id: "cat-2", name: "Atta, Rice & Dal", slug: "atta-rice-dal", keywords: ["AATA", "ATT", "RICE", "DAL", "PULSE", "SUJI", "BESAN", "MAIDA", "OATS", "POHA", "SOOJI"] },
  { id: "cat-3", name: "Oil, Ghee & Spices", slug: "oil-ghee-spices", keywords: ["OIL", "GHEE", "MASALA", "HALDI", "MIRCH", "DHANIA", "JEERA", "MUSTARD", "SPICE", "SALT", "SUGAR"] },
  { id: "cat-4", name: "Dairy, Milk & Bakery", slug: "dairy-bakery", keywords: ["MILK", "BUTTER", "CHEESE", "PANEER", "CURD", "BREAD", "DAIRY", "YOGURT", "AMUL"] },
  { id: "cat-5", name: "Snacks, Biscuits & Drinks", slug: "snacks-drinks", keywords: ["BISCUIT", "COOKIES", "CHOCOLATE", "CHIPS", "PAPAD", "MIXTURE", "NAMKEEN", "SWEET", "ICE CREAM", "FOOD", "MAGGI", "NOODLES", "TEA", "COFFEE", "JUICE", "DRINK", "COCA", "PEPSI"] },
  { id: "cat-6", name: "Household & Cleaning", slug: "household-cleaning", keywords: ["SOAP", "SHAMPOO", "WIPER", "AGARBATI", "DEO", "FACE WASH", "COSMATIC", "NON FOOD", "DETERGENT", "TIDE", "SURF", "CLEAN", "TISSUE", "PADS", "TOOTHPASTE", "BRUSH"] }
];

const COVER_IMAGES: { [key: string]: string } = {
  "cat-1": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
  "cat-2": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
  "cat-3": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
  "cat-4": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80",
  "cat-5": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80",
  "cat-6": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"
};

function getDeterministicUUID(str: string): string {
  // Simple deterministic UUID generator for web browser
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(32, '0');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [AdminShellComponent, CurrencyPipe, FormsModule],
  template: `
    <app-admin-shell>
      <div class="admin-page">
        <header class="page-header">
          <div>
            <h1>Grocery Inventory Manager</h1>
            <p>Select multiple items with checkboxes to delete or manage in bulk</p>
          </div>
          <div class="header-btns">
            @if (selectedIds().size > 0) {
              <button class="btn btn-danger btn-sm bulk-delete-btn" (click)="deleteSelectedProducts()" [disabled]="deletingBulk()">
                {{ deletingBulk() ? '⏳ Deleting...' : '🗑️ Delete Selected (' + selectedIds().size + ')' }}
              </button>
            }
            <button class="btn btn-secondary btn-sm" (click)="showCsvModal.set(true)">📥 Upload GoFrugal CSV</button>
            <button class="btn btn-primary btn-sm" (click)="openAddModal()">+ Add Product</button>
          </div>
        </header>

        @if (importStatus()) {
          <div class="import-status-banner">
            <span>{{ importStatus() }}</span>
          </div>
        }

        <!-- Bulk Action Floating Bar -->
        @if (selectedIds().size > 0) {
          <div class="bulk-floating-bar animate-fade-in">
            <span><strong>{{ selectedIds().size }}</strong> item(s) selected</span>
            <div class="bulk-bar-actions">
              <button class="btn btn-secondary btn-xs" (click)="clearSelection()">Clear Selection</button>
              <button class="btn btn-danger btn-sm" (click)="deleteSelectedProducts()" [disabled]="deletingBulk()">
                🗑️ Delete {{ selectedIds().size }} Selected
              </button>
            </div>
          </div>
        }

        <!-- Product Table -->
        <div class="table-card glass-panel">
          @if (loading()) {
            <p class="loading-text">Loading inventory from Supabase...</p>
          } @else {
            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th style="width: 40px; text-align: center;">
                      <input type="checkbox" [checked]="isAllSelected()" (change)="toggleSelectAll($event)" aria-label="Select all products" />
                    </th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Weight / Unit</th>
                    <th>Price</th>
                    <th>Original MRP</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (prod of products(); track prod.id) {
                    <tr [class.row-selected]="selectedIds().has(prod.id)">
                      <td style="text-align: center;">
                        <input type="checkbox" [checked]="selectedIds().has(prod.id)" (change)="toggleSelectProduct(prod.id)" />
                      </td>
                      <td>
                        <div class="prod-cell">
                          <img [src]="prod.images[0]" [alt]="prod.name" class="prod-thumb" />
                          <div>
                            <strong>{{ prod.name }}</strong>
                          </div>
                        </div>
                      </td>
                      <td><span class="cat-tag">{{ prod.category?.name || 'Uncategorized' }}</span></td>
                      <td><span class="unit-tag">{{ prod.unit || '1 Pack' }}</span></td>
                      <td><strong>{{ prod.price | currency:'INR':'symbol':'1.0-0' }}</strong></td>
                      <td><span class="orig-price">{{ prod.original_price ? (prod.original_price | currency:'INR':'symbol':'1.0-0') : '-' }}</span></td>
                      <td>
                        <button class="badge-btn" [class.badge-active]="prod.is_featured" (click)="toggleFeatured(prod)">
                          {{ prod.is_featured ? '⭐ Featured' : 'Normal' }}
                        </button>
                      </td>
                      <td>
                        <button class="badge-btn" [class.badge-active]="prod.is_active" (click)="toggleActive(prod)">
                          {{ prod.is_active ? 'Active' : 'Disabled' }}
                        </button>
                      </td>
                      <td>
                        <div class="action-btns">
                          <button class="btn-icon-sm" (click)="openEditModal(prod)" title="Edit">✏️</button>
                          <button class="btn-icon-sm danger" (click)="deleteProd(prod.id)" title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="modal-backdrop animate-fade-in" (click)="showModal.set(false)"></div>
        <div class="modal-dialog glass-panel animate-fade-in">
          <div class="modal-header">
            <h3>{{ editingId() ? 'Edit Grocery Item' : 'Add New Grocery Item' }}</h3>
            <button class="close-btn" (click)="showModal.set(false)">✕</button>
          </div>

          <form (ngSubmit)="saveProduct()" class="modal-form">
            <div class="form-group">
              <label class="form-label">Product Name *</label>
              <input class="form-input dark-input" [(ngModel)]="form.name" name="name" required placeholder="e.g. Daawat Rozana Super Basmati Rice" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select class="form-input dark-input" [(ngModel)]="form.category_id" name="category_id" required>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Unit / Size *</label>
                <input class="form-input dark-input" [(ngModel)]="form.unit" name="unit" required placeholder="e.g. 5 kg Pack" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Selling Price (₹) *</label>
                <input type="number" class="form-input dark-input" [(ngModel)]="form.price" name="price" required placeholder="280" />
              </div>
              <div class="form-group">
                <label class="form-label">Original MRP (₹)</label>
                <input type="number" class="form-input dark-input" [(ngModel)]="form.original_price" name="original_price" placeholder="320" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Product Image URL *</label>
              <input class="form-input dark-input" [(ngModel)]="form.image_url" name="image_url" required placeholder="https://..." />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea dark-input" [(ngModel)]="form.description" name="description" rows="3" placeholder="Item description..."></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="showModal.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save Product' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- GoFrugal CSV Importer Modal -->
      @if (showCsvModal()) {
        <div class="modal-backdrop animate-fade-in" (click)="showCsvModal.set(false)"></div>
        <div class="modal-dialog glass-panel animate-fade-in">
          <div class="modal-header">
            <h3>📥 GoFrugal POS Bulk CSV Importer</h3>
            <button class="close-btn" (click)="showCsvModal.set(false)">✕</button>
          </div>

          <div class="csv-modal-body">
            <p class="csv-intro">
              Upload your GoFrugal POS item list export (<code>itemlist.csv</code>). Our parser maps item names, brands, selling prices, MRPs, and batch uploads items directly into your Supabase database!
            </p>

            <div class="file-drop-area">
              <input type="file" accept=".csv" (change)="onCsvFileSelected($event)" id="csv-file-input" />
              <label for="csv-file-input" class="drop-label">
                <span class="upload-icon">📄</span>
                <strong>Click to select new itemlist.csv</strong>
                <span>Supports GoFrugal / POS export files</span>
              </label>
            </div>
          </div>
        </div>
      }
    </app-admin-shell>
  `,
  styles: [`
    .admin-page { padding: 2rem; max-width: 1240px; margin-inline: auto; position: relative; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
    .page-header h1 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 700; color: #fff; }
    .page-header p { color: rgba(255,255,255,0.45); font-size: 0.875rem; }
    .header-btns { display: flex; gap: 0.75rem; align-items: center; }

    .import-status-banner { background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); color: #10B981; padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-weight: 700; margin-bottom: 1.5rem; font-size: 0.9375rem; }

    /* Bulk Action Floating Bar */
    .bulk-floating-bar { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(40, 22, 32, 0.95)); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-md); padding: 0.875rem 1.25rem; margin-bottom: 1.25rem; color: #fff; box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2); }
    .bulk-bar-actions { display: flex; gap: 0.75rem; align-items: center; }
    .btn-danger { background: #EF4444; color: #fff; border: none; font-weight: 700; }
    .btn-danger:hover { background: #DC2626; }
    .btn-xs { padding: 0.35rem 0.65rem; font-size: 0.75rem; }

    .glass-panel { background: rgba(40, 22, 32, 0.8); border: 1px solid rgba(232, 105, 154, 0.2); border-radius: var(--radius-lg); padding: 1.5rem; color: #fff; }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: 0.875rem 1rem; color: rgba(255,255,255,0.45); font-size: 0.8125rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .admin-table td { padding: 0.875rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.875rem; vertical-align: middle; }
    .admin-table tr.row-selected { background: rgba(239, 68, 68, 0.08); }

    .admin-table input[type="checkbox"] { width: 18px; height: 18px; accent-color: #EF4444; cursor: pointer; }

    .prod-cell { display: flex; align-items: center; gap: 0.875rem; }
    .prod-thumb { width: 44px; height: 44px; object-fit: contain; background: #fff; border-radius: var(--radius-xs); padding: 0.2rem; }
    .cat-tag { background: rgba(255,255,255,0.08); padding: 0.2rem 0.55rem; border-radius: var(--radius-xs); font-size: 0.75rem; }
    .unit-tag { font-size: 0.75rem; color: rgba(255,255,255,0.6); }
    .orig-price { text-decoration: line-through; color: rgba(255,255,255,0.4); font-size: 0.8125rem; }

    .badge-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; cursor: pointer; }
    .badge-btn.badge-active { background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4); color: #10B981; }

    .action-btns { display: flex; gap: 0.35rem; }
    .btn-icon-sm { background: rgba(255,255,255,0.08); border: none; padding: 0.35rem 0.5rem; border-radius: var(--radius-xs); cursor: pointer; }
    .btn-icon-sm.danger:hover { background: rgba(239, 68, 68, 0.3); }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000; }
    .modal-dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 580px; z-index: 1001; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.875rem; margin-bottom: 1.25rem; }
    .modal-header h3 { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; }
    .close-btn { background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer; }

    .modal-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .dark-input { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); color: #fff; width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

    /* CSV Drop Area */
    .file-drop-area { border: 2px dashed rgba(255,255,255,0.2); border-radius: var(--radius-md); padding: 2rem; text-align: center; margin-block: 1rem; position: relative; background: rgba(255,255,255,0.02); }
    .file-drop-area input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
    .drop-label { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .upload-icon { font-size: 2.5rem; }
  `]
})
export class AdminProductsComponent implements OnInit {
  private supabase = inject(SupabaseService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedIds = signal<Set<string>>(new Set());

  loading = signal(true);
  saving = signal(false);
  deletingBulk = signal(false);
  importing = signal(false);
  importStatus = signal('');

  showModal = signal(false);
  showCsvModal = signal(false);
  editingId = signal<string | null>(null);

  form = {
    name: '',
    category_id: '',
    unit: '1 Pack',
    price: 0,
    original_price: undefined as number | undefined,
    image_url: '',
    description: ''
  };

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [prods, cats] = await Promise.all([
        this.supabase.getAllProducts(),
        this.supabase.getAllCategories()
      ]);
      this.products.set(prods);
      this.categories.set(cats);
    } catch {} finally {
      this.loading.set(false);
    }
  }

  isAllSelected(): boolean {
    const list = this.products();
    return list.length > 0 && list.every(p => this.selectedIds().has(p.id));
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    const current = new Set<string>();
    if (checked) {
      this.products().forEach(p => current.add(p.id));
    }
    this.selectedIds.set(current);
  }

  toggleSelectProduct(id: string) {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  clearSelection() {
    this.selectedIds.set(new Set());
  }

  async deleteSelectedProducts() {
    const count = this.selectedIds().size;
    if (count === 0) return;

    if (!confirm(`Are you sure you want to permanently delete ${count} selected item(s)?`)) {
      return;
    }

    this.deletingBulk.set(true);
    try {
      const idsToDelete = Array.from(this.selectedIds());
      for (const id of idsToDelete) {
        await this.supabase.deleteProduct(id);
      }
      this.clearSelection();
      await this.loadData();
      this.importStatus.set(`Successfully deleted ${count} selected item(s)!`);
      setTimeout(() => this.importStatus.set(''), 4000);
    } catch {
      alert('Failed to delete selected items. Please try again.');
    } finally {
      this.deletingBulk.set(false);
    }
  }

  openAddModal() {
    this.editingId.set(null);
    const firstCat = this.categories()[0]?.id || '';
    this.form = { name: '', category_id: firstCat, unit: '1 Pack', price: 0, original_price: undefined, image_url: '', description: '' };
    this.showModal.set(true);
  }

  openEditModal(prod: Product) {
    this.editingId.set(prod.id);
    this.form = {
      name: prod.name,
      category_id: prod.category_id || '',
      unit: prod.unit || '1 Pack',
      price: prod.price,
      original_price: prod.original_price,
      image_url: prod.images[0] || '',
      description: prod.description || ''
    };
    this.showModal.set(true);
  }

  async saveProduct() {
    if (!this.form.name || !this.form.price) return;
    this.saving.set(true);
    try {
      const cat = this.categories().find(c => c.id === this.form.category_id);
      const payload: Partial<Product> = {
        name: this.form.name,
        price: this.form.price,
        original_price: this.form.original_price,
        unit: this.form.unit,
        description: this.form.description,
        images: [this.form.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
        category_id: this.form.category_id,
        category: cat ? { name: cat.name, slug: cat.slug } : undefined,
        is_active: true
      };

      if (this.editingId()) {
        await this.supabase.updateProduct(this.editingId()!, payload);
      } else {
        await this.supabase.createProduct(payload as Product);
      }
      this.showModal.set(false);
      await this.loadData();
    } catch {} finally {
      this.saving.set(false);
    }
  }

  async toggleActive(prod: Product) {
    await this.supabase.updateProduct(prod.id, { is_active: !prod.is_active });
    await this.loadData();
  }

  async toggleFeatured(prod: Product) {
    await this.supabase.updateProduct(prod.id, { is_featured: !prod.is_featured });
    await this.loadData();
  }

  async deleteProd(id: string) {
    if (confirm('Delete this grocery item?')) {
      await this.supabase.deleteProduct(id);
      await this.loadData();
    }
  }

  // ─── Real Client-Side GoFrugal CSV Parser & Supabase Bulk Uploader ───────────
  async onCsvFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.showCsvModal.set(false);
    this.importing.set(true);
    this.importStatus.set(`Reading ${file.name}...`);

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const text: string = e.target.result;
        const lines = text.split(/\r?\n/);
        this.importStatus.set(`Parsing ${lines.length} lines from CSV...`);

        const catMap = new Map<string, string>();
        this.categories().forEach(c => catMap.set(c.slug, c.id));
        const defaultCatId = this.categories()[0]?.id || '';

        const parsedProducts: any[] = [];
        const seenNames = new Set<string>();

        const headerLine = lines[0].toLowerCase();
        const isGrofersFormat = headerLine.includes('product id') || (headerLine.includes('image url') && headerLine.includes('deeplink'));
        const isBlinkItFormat = !isGrofersFormat && headerLine.includes('name') && (headerLine.includes('offer_price') || headerLine.includes('search_query'));

        if (isGrofersFormat) {
          // Format 3: Product ID, Platform, Name, Brand, MRP, Category, Subcategory, Quantity, Updated at, Image URL, Deeplink
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
            const fields = matches.map(m => m.replace(/^"|"$/g, '').trim());
            if (fields.length < 5) continue;

            const prodId = fields[0];
            const name = fields[2];
            const brand = fields[3] || 'Grocery';
            const mrp = parseFloat(fields[4]);
            const catName = fields[5] || '';
            const qty = fields[7] || '1 Pack';
            const imgUrl = fields[9] || '';

            if (!name || isNaN(mrp) || mrp <= 0) continue;

            let matchedCat = CATEGORY_MAP.find(c => c.keywords.some(k => (name + ' ' + brand + ' ' + catName).toUpperCase().includes(k))) || CATEGORY_MAP[4];
            const lowerText = (catName + ' ' + name).toLowerCase();
            if (lowerText.includes('milk') || lowerText.includes('bread') || lowerText.includes('paneer') || lowerText.includes('butter') || lowerText.includes('dairy')) matchedCat = CATEGORY_MAP[3];
            if (lowerText.includes('rice') || lowerText.includes('dal') || lowerText.includes('flour') || lowerText.includes('atta')) matchedCat = CATEGORY_MAP[1];
            if (lowerText.includes('oil') || lowerText.includes('ghee') || lowerText.includes('spice') || lowerText.includes('masala')) matchedCat = CATEGORY_MAP[2];
            if (lowerText.includes('shampoo') || lowerText.includes('soap') || lowerText.includes('cleaning') || lowerText.includes('personal')) matchedCat = CATEGORY_MAP[5];

            const slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + prodId);
            const catId = catMap.get(matchedCat.slug) || defaultCatId;

            parsedProducts.push({
              id: getDeterministicUUID(prodId || slug),
              name,
              slug,
              description: `${name} by ${brand} (${qty}). Fresh grocery product from KSM Jabalpur.`,
              price: mrp,
              original_price: Math.round(mrp * 1.15),
              images: [imgUrl || COVER_IMAGES[matchedCat.id] || COVER_IMAGES['cat-5']],
              category_id: catId,
              unit: qty,
              sizes: [qty],
              tags: ['KSM Direct', brand, catName],
              is_active: true,
              is_featured: false,
              created_at: new Date().toISOString()
            });
          }
        } else if (isBlinkItFormat) {
          const headers = lines[0].split(',').map(s => s.trim().toLowerCase().replace(/^"|"$/g, ''));
          const idxName = headers.indexOf('name');
          const idxBrand = headers.indexOf('brand');
          const idxMrp = headers.indexOf('mrp');
          const idxOffer = headers.indexOf('offer_price');
          const idxQty = headers.indexOf('quantity');
          const idxQuery = headers.indexOf('search_query');

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
            if (parts.length <= Math.max(idxName, idxOffer)) continue;

            const name = parts[idxName];
            const brand = parts[idxBrand] || 'Grocery';
            const mrp = parseFloat(parts[idxMrp]);
            const selling = parseFloat(parts[idxOffer]);
            const qty = parts[idxQty] || '1 Pack';
            const q = (parts[idxQuery] || '').toLowerCase();

            if (!name || isNaN(selling) || selling <= 0) continue;

            let matchedCat = CATEGORY_MAP.find(c => c.keywords.some(k => (name + ' ' + brand + ' ' + q).toUpperCase().includes(k))) || CATEGORY_MAP[4];
            if (q.includes('milk') || q.includes('bread') || q.includes('paneer') || q.includes('butter') || q.includes('egg')) matchedCat = CATEGORY_MAP[3];
            if (q.includes('rice') || q.includes('dal') || q.includes('sugar')) matchedCat = CATEGORY_MAP[1];
            if (q.includes('ghee') || q.includes('oil')) matchedCat = CATEGORY_MAP[2];
            if (q.includes('shampoo') || q.includes('soap') || q.includes('detergent') || q.includes('toothpaste')) matchedCat = CATEGORY_MAP[5];

            const slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + i);
            const catId = catMap.get(matchedCat.slug) || defaultCatId;

            parsedProducts.push({
              id: getDeterministicUUID(slug),
              name,
              slug,
              description: `${name} by ${brand} (${qty}). Fresh grocery item from KSM Jabalpur.`,
              price: selling,
              original_price: (!isNaN(mrp) && mrp > selling) ? mrp : Math.round(selling * 1.1),
              images: [COVER_IMAGES[matchedCat.id] || COVER_IMAGES['cat-5']],
              category_id: catId,
              unit: qty,
              sizes: [qty],
              tags: ['KSM Direct', brand, q],
              is_active: true,
              is_featured: false,
              created_at: new Date().toISOString()
            });
          }
        } else {
          // GoFrugal POS Export Parser
          for (let i = 0; i < lines.length; i++) {
            if (i <= 5) continue; // Skip GoFrugal headers
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
            if (parts.length < 10) continue;

            const brand = parts[1] || '';
            const itemCode = parts[2];
            let name = parts[3];
            const selling = parseFloat(parts[9]);
            const mrp = parseFloat(parts[10]);

            if (!name || name.includes('..........') || name.includes('SAMPLE') || isNaN(selling) || selling <= 0) continue;

            name = name.replace(/\s+/g, ' ').trim();
            const lowerName = name.toLowerCase();
            if (seenNames.has(lowerName)) continue;
            seenNames.add(lowerName);

            const textToMatch = (brand + ' ' + name).toUpperCase();
            let matchedCat = CATEGORY_MAP.find(c => c.keywords.some(k => textToMatch.includes(k)));
            if (!matchedCat) matchedCat = CATEGORY_MAP[4];

            const slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + itemCode);
            const catId = catMap.get(matchedCat.slug) || defaultCatId;

            parsedProducts.push({
              id: getDeterministicUUID(itemCode || slug),
              name: name,
              slug: slug,
              description: `${name} — Genuine store product from Khandelwal Supermart (KSM), Jabalpur.`,
              price: selling,
              original_price: (!isNaN(mrp) && mrp > selling) ? mrp : Math.round(selling * 1.1),
              images: [COVER_IMAGES[matchedCat.id] || COVER_IMAGES['cat-5']],
              category_id: catId,
              unit: '1 Pack',
              sizes: ['Standard Pack'],
              tags: ['KSM Direct', brand !== '0' ? brand : 'Grocery'],
              is_active: true,
              is_featured: false,
              created_at: new Date().toISOString()
            });
          }
        }

        // Deduplicate items by id and slug to prevent ON CONFLICT DO UPDATE error 21000
        const uniqueMap = new Map<string, any>();
        parsedProducts.forEach(p => {
          if (!uniqueMap.has(p.id) && !uniqueMap.has(p.slug)) {
            uniqueMap.set(p.id, p);
            uniqueMap.set(p.slug, p);
          }
        });
        const finalProducts = Array.from(new Set(uniqueMap.values()));

        if (finalProducts.length === 0) {
          this.importStatus.set('❌ No valid unique products found in CSV file.');
          this.importing.set(false);
          return;
        }

        this.importStatus.set(`Found ${finalProducts.length} unique items. Uploading to Supabase...`);

        // Batch upload into Supabase in chunks of 250
        const CHUNK_SIZE = 250;
        const totalChunks = Math.ceil(finalProducts.length / CHUNK_SIZE);
        let uploaded = 0;

        for (let c = 0; c < totalChunks; c++) {
          const chunk = finalProducts.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
          try {
            await this.supabase.upsertProductsBatch(chunk);
            uploaded += chunk.length;
            this.importStatus.set(`⏳ Uploading to Supabase... (${uploaded} / ${finalProducts.length} items uploaded)`);
          } catch (err) {
            console.error(`Chunk ${c + 1} failed, retrying item by item:`, err);
            // Fallback: Upload item by item for this chunk to skip any problematic row
            for (const item of chunk) {
              try {
                await this.supabase.upsertProductsBatch([item]);
                uploaded++;
              } catch {}
            }
          }
        }

        this.importStatus.set(`🎉 Successfully uploaded ${uploaded} items into Supabase!`);
        await this.loadData();
      } catch (err: any) {
        this.importStatus.set(`❌ Error parsing CSV: ${err?.message || 'Invalid format'}`);
      } finally {
        this.importing.set(false);
      }
    };

    reader.readAsText(file);
  }
}
