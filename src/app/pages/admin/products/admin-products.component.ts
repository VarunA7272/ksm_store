import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminShellComponent } from '../admin-shell.component';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

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
            <p>Add, edit, or import products from GoFrugal billing software</p>
          </div>
          <div class="header-btns">
            <button class="btn btn-fresh btn-sm" (click)="showCsvModal.set(true)">📥 Import GoFrugal CSV</button>
            <button class="btn btn-primary btn-sm" (click)="openAddModal()">+ Add New Product</button>
          </div>
        </header>

        <!-- Product Table -->
        <div class="table-card glass-panel">
          @if (loading()) {
            <p class="loading-text">Loading inventory...</p>
          } @else {
            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Weight / Unit</th>
                    <th>Price</th>
                    <th>Original Price</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (prod of products(); track prod.id) {
                    <tr>
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
                <select class="form-select dark-input" [(ngModel)]="form.category_id" name="category_id" required>
                  <option value="">Select Category</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Unit / Primary Weight *</label>
                <input class="form-input dark-input" [(ngModel)]="form.unit" name="unit" required placeholder="e.g. 5 kg Pack / 1 Litre" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Selling Price (₹) *</label>
                <input class="form-input dark-input" type="number" [(ngModel)]="form.price" name="price" required placeholder="280" />
              </div>

              <div class="form-group">
                <label class="form-label">Original Price (MRP ₹)</label>
                <input class="form-input dark-input" type="number" [(ngModel)]="form.original_price" name="original_price" placeholder="320" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Weight Variants (comma-separated)</label>
              <input class="form-input dark-input" [(ngModel)]="formSizesInput" name="formSizesInput" placeholder="e.g. 500g, 1 kg, 5 kg" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea dark-input" [(ngModel)]="form.description" name="description" placeholder="Item description, quality, ingredients..."></textarea>
            </div>

            <!-- Image Upload -->
            <div class="form-group">
              <label class="form-label">Product Image</label>
              <div class="image-upload-box">
                @if (form.images && form.images.length > 0) {
                  <img [src]="form.images[0]" class="preview-img" />
                }
                <input type="file" (change)="onFileSelected($event)" accept="image/*" />
              </div>
            </div>

            <div class="form-checkboxes">
              <label class="chk-label">
                <input type="checkbox" [(ngModel)]="form.is_featured" name="is_featured" />
                <span>Feature on Home Page</span>
              </label>

              <label class="chk-label">
                <input type="checkbox" [(ngModel)]="form.is_active" name="is_active" />
                <span>Active / In Stock</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" [disabled]="saving()">
              {{ saving() ? 'Saving Product...' : 'Save Product' }}
            </button>
          </form>
        </div>
      }

      <!-- GoFrugal CSV Import Modal -->
      @if (showCsvModal()) {
        <div class="modal-backdrop animate-fade-in" (click)="showCsvModal.set(false)"></div>
        <div class="modal-dialog glass-panel animate-fade-in">
          <div class="modal-header">
            <h3>📥 Bulk Import GoFrugal Grocery CSV</h3>
            <button class="close-btn" (click)="showCsvModal.set(false)">✕</button>
          </div>

          <div class="modal-body-content">
            <p class="csv-help">
              Export your Item Master from GoFrugal (Reports ➔ Item Master ➔ Export CSV/Excel), then select the file below:
            </p>

            <div class="csv-upload-box card">
              <span class="file-icon">📄</span>
              <input type="file" (change)="onCsvFileSelected($event)" accept=".csv, .txt" id="csv-file-input" />
              <p class="upload-label">Click to select GoFrugal CSV file</p>
            </div>

            @if (importingCsv()) {
              <div class="import-progress">
                <span class="spinner">⏳</span>
                <span>Importing GoFrugal items into KSM database...</span>
              </div>
            }

            @if (csvSuccessMessage()) {
              <div class="success-box">
                ✅ {{ csvSuccessMessage() }}
              </div>
            }
          </div>
        </div>
      }
    </app-admin-shell>
  `,
  styles: [`
    .admin-page { padding: 2rem; max-width: 1200px; margin-inline: auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .header-btns { display: flex; gap: 0.75rem; }
    .page-header h1 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #fff; }
    .page-header p { color: var(--text-muted); font-size: 0.9375rem; }
    .table-card { padding: 1.5rem; overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.8125rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .admin-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.875rem; color: #fff; }
    .prod-cell { display: flex; align-items: center; gap: 0.75rem; }
    .prod-thumb { width: 44px; height: 44px; object-fit: contain; background: #fff; border-radius: var(--radius-xs); padding: 0.2rem; }
    .cat-tag { background: rgba(37,99,235,0.15); color: var(--primary-light); padding: 0.2rem 0.5rem; border-radius: var(--radius-xs); font-size: 0.75rem; font-weight: 700; }
    .unit-tag { background: rgba(255,255,255,0.1); color: #fff; padding: 0.2rem 0.5rem; border-radius: var(--radius-xs); font-size: 0.75rem; }
    .orig-price { text-decoration: line-through; color: var(--text-muted); }
    .badge-btn { background: rgba(255,255,255,0.08); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.15); padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.75rem; cursor: pointer; }
    .badge-btn.badge-active { background: rgba(16,185,129,0.2); color: #10B981; border-color: rgba(16,185,129,0.3); }
    .action-btns { display: flex; gap: 0.35rem; }
    .btn-icon-sm { background: rgba(255,255,255,0.08); border: none; border-radius: var(--radius-xs); padding: 0.35rem 0.5rem; cursor: pointer; }
    .btn-icon-sm.danger:hover { background: rgba(239,68,68,0.2); }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; z-index: var(--z-modal); background: rgba(15,23,42,0.8); }
    .modal-dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; z-index: calc(var(--z-modal) + 1); padding: 2rem; color: #fff; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem; }
    .close-btn { background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer; }
    .modal-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .preview-img { width: 60px; height: 60px; object-fit: contain; background: #fff; border-radius: var(--radius-xs); margin-bottom: 0.5rem; }
    .form-checkboxes { display: flex; gap: 1.5rem; }
    .chk-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer; }

    /* CSV Import Styles */
    .modal-body-content { display: flex; flex-direction: column; gap: 1.25rem; }
    .csv-help { color: var(--text-muted); font-size: 0.875rem; line-height: 1.5; }
    .csv-upload-box {
      border: 2px dashed rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.05);
      padding: 2.5rem;
      text-align: center;
      position: relative;
      cursor: pointer;
      border-radius: var(--radius-md);
    }
    .csv-upload-box input[type="file"] {
      position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
    }
    .file-icon { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    .upload-label { font-size: 0.9375rem; font-weight: 700; color: #fff; }
    .import-progress { display: flex; align-items: center; gap: 0.75rem; background: rgba(37,99,235,0.15); padding: 1rem; border-radius: var(--radius-sm); color: var(--primary-light); font-weight: 700; font-size: 0.875rem; }
    .success-box { background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.3); color: #10B981; padding: 1rem; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.875rem; }
  `]
})
export class AdminProductsComponent implements OnInit {
  private supabase = inject(SupabaseService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<string | null>(null);

  showCsvModal = signal(false);
  importingCsv = signal(false);
  csvSuccessMessage = signal('');

  form: Partial<Product> = {
    name: '', category_id: '', unit: '', price: 0, original_price: undefined,
    description: '', images: [], is_featured: false, is_active: true
  };
  formSizesInput = '';

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
    } catch {
    } finally {
      this.loading.set(false);
    }
  }

  openAddModal() {
    this.editingId.set(null);
    this.form = {
      name: '', category_id: this.categories()[0]?.id || '', unit: '1 kg Pack',
      price: 100, original_price: undefined, description: '',
      images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
      is_featured: false, is_active: true
    };
    this.formSizesInput = '500g, 1 kg, 5 kg';
    this.showModal.set(true);
  }

  openEditModal(product: Product) {
    this.editingId.set(product.id);
    this.form = { ...product };
    this.formSizesInput = product.sizes ? product.sizes.join(', ') : '';
    this.showModal.set(true);
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const url = await this.supabase.uploadImage(file);
      this.form.images = [url];
    }
  }

  // GoFrugal CSV Importer Engine
  async onCsvFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.importingCsv.set(true);
    this.csvSuccessMessage.set('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/);
      if (lines.length <= 1) {
        alert('Empty CSV file.');
        this.importingCsv.set(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

      // Helper to find column index by potential GoFrugal header names
      const findCol = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

      const nameIdx = findCol(['name', 'item', 'item_name', 'itemname', 'description']);
      const priceIdx = findCol(['price', 'rate', 'selling_price', 'sale_rate', 'mop']);
      const mrpIdx = findCol(['mrp', 'original_price', 'list_price']);
      const unitIdx = findCol(['uom', 'unit', 'pack', 'size']);
      const catIdx = findCol(['category', 'group', 'dept']);

      let importedCount = 0;
      const defaultCatId = this.categories()[0]?.id || 'cat-1';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Naive CSV split ignoring commas inside quotes
        const row = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        const cleanCell = (idx: number) => idx >= 0 && row[idx] ? row[idx].replace(/^"|"$/g, '').trim() : '';

        const name = cleanCell(nameIdx);
        if (!name) continue;

        const price = parseFloat(cleanCell(priceIdx)) || 100;
        const mrpVal = parseFloat(cleanCell(mrpIdx));
        const mrp = (!isNaN(mrpVal) && mrpVal > price) ? mrpVal : undefined;
        const unit = cleanCell(unitIdx) || '1 Pack';
        const catName = cleanCell(catIdx);

        // Find or map category
        let matchedCatId = defaultCatId;
        if (catName) {
          const found = this.categories().find(c => c.name.toLowerCase().includes(catName.toLowerCase()));
          if (found) matchedCatId = found.id;
        }

        await this.supabase.createProduct({
          name,
          price,
          original_price: mrp,
          unit,
          category_id: matchedCatId,
          images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
          is_active: true,
          is_featured: false
        });

        importedCount++;
      }

      this.importingCsv.set(false);
      this.csvSuccessMessage.set(`Successfully imported ${importedCount} items from GoFrugal CSV!`);
      await this.loadData();
    };

    reader.readAsText(file);
  }

  async saveProduct() {
    if (!this.form.name || !this.form.price) return;
    this.saving.set(true);

    const sizesArr = this.formSizesInput.split(',').map(s => s.trim()).filter(Boolean);
    this.form.sizes = sizesArr.length > 0 ? sizesArr : undefined;

    try {
      if (this.editingId()) {
        await this.supabase.updateProduct(this.editingId()!, this.form);
      } else {
        await this.supabase.createProduct(this.form);
      }
      this.showModal.set(false);
      await this.loadData();
    } catch {
      alert('Failed to save product.');
    } finally {
      this.saving.set(false);
    }
  }

  async toggleFeatured(product: Product) {
    await this.supabase.updateProduct(product.id, { is_featured: !product.is_featured });
    await this.loadData();
  }

  async toggleActive(product: Product) {
    await this.supabase.updateProduct(product.id, { is_active: !product.is_active });
    await this.loadData();
  }

  async deleteProd(id: string) {
    if (confirm('Are you sure you want to delete this grocery item?')) {
      await this.supabase.deleteProduct(id);
      await this.loadData();
    }
  }
}
