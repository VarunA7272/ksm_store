import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminShellComponent } from '../admin-shell.component';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [AdminShellComponent, FormsModule],
  template: `
    <app-admin-shell>
      <div class="admin-page">
        <header class="page-header">
          <div>
            <h1>Category Manager</h1>
            <p>Manage grocery product categories & display order</p>
          </div>
          <button class="btn btn-primary" (click)="openAddModal()">+ Add Category</button>
        </header>

        <!-- Categories Table -->
        <div class="table-card glass-panel">
          @if (loading()) {
            <p>Loading categories...</p>
          } @else {
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (cat of categories(); track cat.id) {
                  <tr>
                    <td><strong>#{{ cat.display_order }}</strong></td>
                    <td><strong>{{ cat.name }}</strong></td>
                    <td><code>{{ cat.slug }}</code></td>
                    <td><span class="desc-text">{{ cat.description || '-' }}</span></td>
                    <td>
                      <button class="badge-btn" [class.badge-active]="cat.is_active" (click)="toggleActive(cat)">
                        {{ cat.is_active ? 'Active' : 'Disabled' }}
                      </button>
                    </td>
                    <td>
                      <div class="action-btns">
                        <button class="btn-icon-sm" (click)="openEditModal(cat)">✏️</button>
                        <button class="btn-icon-sm danger" (click)="deleteCat(cat.id)">🗑️</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="modal-backdrop animate-fade-in" (click)="showModal.set(false)"></div>
        <div class="modal-dialog glass-panel animate-fade-in">
          <div class="modal-header">
            <h3>{{ editingId() ? 'Edit Category' : 'Add New Category' }}</h3>
            <button class="close-btn" (click)="showModal.set(false)">✕</button>
          </div>

          <form (ngSubmit)="saveCategory()" class="modal-form">
            <div class="form-group">
              <label class="form-label">Category Name *</label>
              <input class="form-input dark-input" [(ngModel)]="form.name" name="name" required placeholder="e.g. Spices & Seasonings" />
            </div>

            <div class="form-group">
              <label class="form-label">Display Order</label>
              <input class="form-input dark-input" type="number" [(ngModel)]="form.display_order" name="display_order" placeholder="1" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea dark-input" [(ngModel)]="form.description" name="description" placeholder="Brief category summary..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" [disabled]="saving()">
              {{ saving() ? 'Saving...' : 'Save Category' }}
            </button>
          </form>
        </div>
      }
    </app-admin-shell>
  `,
  styles: [`
    .admin-page { padding: 2rem; max-width: 1200px; margin-inline: auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .page-header h1 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #fff; }
    .page-header p { color: var(--text-muted); font-size: 0.9375rem; }
    .table-card { padding: 1.5rem; overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.8125rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .admin-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.875rem; color: #fff; }
    .desc-text { color: var(--text-muted); }
    .badge-btn { background: rgba(255,255,255,0.08); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.15); padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.75rem; cursor: pointer; }
    .badge-btn.badge-active { background: rgba(16,185,129,0.2); color: #10B981; border-color: rgba(16,185,129,0.3); }
    .action-btns { display: flex; gap: 0.35rem; }
    .btn-icon-sm { background: rgba(255,255,255,0.08); border: none; border-radius: var(--radius-xs); padding: 0.35rem 0.5rem; cursor: pointer; }
    .btn-icon-sm.danger:hover { background: rgba(239,68,68,0.2); }

    .modal-backdrop { position: fixed; inset: 0; z-index: var(--z-modal); background: rgba(15,23,42,0.8); }
    .modal-dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 500px; z-index: calc(var(--z-modal) + 1); padding: 2rem; color: #fff; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem; }
    .close-btn { background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer; }
    .modal-form { display: flex; flex-direction: column; gap: 1rem; }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  private supabase = inject(SupabaseService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<string | null>(null);

  form: Partial<Category> = { name: '', display_order: 1, description: '', is_active: true };

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const cats = await this.supabase.getAllCategories();
      this.categories.set(cats);
    } catch {
    } finally {
      this.loading.set(false);
    }
  }

  openAddModal() {
    this.editingId.set(null);
    this.form = { name: '', display_order: this.categories().length + 1, description: '', is_active: true };
    this.showModal.set(true);
  }

  openEditModal(cat: Category) {
    this.editingId.set(cat.id);
    this.form = { ...cat };
    this.showModal.set(true);
  }

  async saveCategory() {
    if (!this.form.name) return;
    this.saving.set(true);
    try {
      if (this.editingId()) {
        await this.supabase.updateCategory(this.editingId()!, this.form);
      } else {
        await this.supabase.createCategory(this.form);
      }
      this.showModal.set(false);
      await this.loadData();
    } catch {
      alert('Failed to save category.');
    } finally {
      this.saving.set(false);
    }
  }

  async toggleActive(cat: Category) {
    await this.supabase.updateCategory(cat.id, { is_active: !cat.is_active });
    await this.loadData();
  }

  async deleteCat(id: string) {
    if (confirm('Delete this category?')) {
      await this.supabase.deleteCategory(id);
      await this.loadData();
    }
  }
}
