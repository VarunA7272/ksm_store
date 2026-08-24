import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminShellComponent } from '../admin-shell.component';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AdminShellComponent, RouterLink],
  template: `
    <app-admin-shell>
      <div class="admin-page">
        <header class="page-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Khandelwal Supermart (KSM) Store Metrics & Quick Actions</p>
          </div>
          <a routerLink="/admin/products" class="btn btn-primary btn-sm">+ Add New Grocery Item</a>
        </header>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card glass-panel">
            <span class="st-icon">📦</span>
            <div class="st-info">
              <span class="st-label">Total Grocery Items</span>
              <strong class="st-value">{{ totalProducts() }}</strong>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <span class="st-icon">📁</span>
            <div class="st-info">
              <span class="st-label">Categories</span>
              <strong class="st-value">{{ totalCategories() }}</strong>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <span class="st-icon">⭐</span>
            <div class="st-info">
              <span class="st-label">Customer Reviews</span>
              <strong class="st-value">{{ totalReviews() }}</strong>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <span class="st-icon">🤖</span>
            <div class="st-info">
              <span class="st-label">Mobile AI Bot</span>
              <strong class="st-value" style="color:#10B981">Active</strong>
            </div>
          </div>
        </div>

        <!-- Quick Links Grid -->
        <div class="quick-grid">
          <a routerLink="/admin/products" class="quick-card glass-panel">
            <span class="q-icon">🛒</span>
            <h3>Manage Grocery Inventory</h3>
            <p>Upload photos, set prices, discount rates, weights (e.g. 500g, 1kg, 5kg), and feature items on home screen.</p>
          </a>

          <a routerLink="/admin/categories" class="quick-card glass-panel">
            <span class="q-icon">📂</span>
            <h3>Manage Categories</h3>
            <p>Organize products into Atta, Rice, Oils, Dairy, Fruits & Veggies, Household & Cleaning.</p>
          </a>

          <a routerLink="/admin/settings" class="quick-card glass-panel">
            <span class="q-icon">🎨</span>
            <h3>Site Content CMS</h3>
            <p>Edit hero headings, WhatsApp banner copy, store timings, and location details in real time.</p>
          </a>
        </div>
      </div>
    </app-admin-shell>
  `,
  styles: [`
    .admin-page { padding: 2rem; max-width: 1200px; margin-inline: auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .page-header h1 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; }
    .page-header p { color: var(--text-muted); font-size: 0.9375rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 540px) { .stats-grid { grid-template-columns: 1fr; } }
    .stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; }
    .st-icon { font-size: 2.25rem; }
    .st-label { font-size: 0.8125rem; color: var(--text-muted); display: block; }
    .st-value { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; }
    .quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    @media (max-width: 900px) { .quick-grid { grid-template-columns: 1fr; } }
    .quick-card { padding: 2rem; text-decoration: none; color: #fff; transition: transform var(--transition-fast); }
    .quick-card:hover { transform: translateY(-4px); }
    .q-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
    .quick-card h3 { font-family: var(--font-heading); font-size: 1.125rem; font-weight: 700; margin-bottom: 0.35rem; }
    .quick-card p { font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private supabase = inject(SupabaseService);

  totalProducts = signal(0);
  totalCategories = signal(0);
  totalReviews = signal(0);

  async ngOnInit() {
    try {
      const [prods, cats, revs] = await Promise.all([
        this.supabase.getAllProducts(),
        this.supabase.getAllCategories(),
        this.supabase.getAllReviews()
      ]);
      this.totalProducts.set(prods.length);
      this.totalCategories.set(cats.length);
      this.totalReviews.set(revs.length);
    } catch {}
  }
}
