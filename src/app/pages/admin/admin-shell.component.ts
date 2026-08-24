import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="admin-shell">
      <!-- Mobile Top Bar -->
      <header class="mobile-admin-header">
        <div class="mobile-logo">
          <span class="m-icon">🛒</span>
          <span class="m-title">KSM Admin</span>
        </div>
        <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" aria-label="Toggle Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            @if (mobileMenuOpen()) {
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            }
          </svg>
        </button>
      </header>

      <!-- Mobile Navigation Drawer -->
      @if (mobileMenuOpen()) {
        <div class="mobile-drawer animate-fade-in">
          <nav class="mobile-nav-list">
            <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-item">📊 Dashboard</a>
            <a routerLink="/admin/products" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-item">📦 Products</a>
            <a routerLink="/admin/categories" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-item">📁 Categories</a>
            <a routerLink="/admin/reviews" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-item">⭐ Reviews</a>
            <a routerLink="/admin/settings" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-item">🎨 Site Content CMS</a>
          </nav>

          <div class="mobile-drawer-footer">
            <a href="/" target="_blank" class="nav-item view-site">🌐 View KSM Site</a>
            <button class="nav-item sign-out" (click)="signOut()">🚪 Sign Out</button>
          </div>
        </div>
      }

      <!-- Desktop Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <span class="s-icon">🛒</span>
          <div>
            <h3 class="s-brand">KSM Portal</h3>
            <span class="s-badge">Admin Suite</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg>
            Products
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"/></svg>
            Categories
          </a>
          <a routerLink="/admin/reviews" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>
            Reviews
          </a>
          <a routerLink="/admin/settings" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h97.5M10.5 12h97.5M10.5 18h97.5M3 6h.01M3 12h.01M3 18h.01"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"/></svg>
            Site Content CMS
          </a>
        </nav>

        <div class="sidebar-footer">
          <a href="/" target="_blank" class="nav-item view-site">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
            View KSM Store
          </a>
          <button class="nav-item sign-out" (click)="signOut()">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Admin Content -->
      <main class="admin-main">
        <ng-content />
      </main>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 100vh;
      background: #0F172A;
      color: #fff;
    }
    .mobile-admin-header {
      display: none;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      background: #0F172A;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 0; z-index: 100;
    }
    .mobile-logo { display: flex; align-items: center; gap: 0.5rem; }
    .m-icon { font-size: 1.5rem; }
    .m-title { font-family: var(--font-heading); font-weight: 800; font-size: 1.125rem; }
    .mobile-menu-toggle {
      background: rgba(37, 99, 235, 0.2);
      border: 1px solid rgba(37, 99, 235, 0.4);
      color: #fff; padding: 0.4rem; border-radius: var(--radius-xs); cursor: pointer;
    }
    .mobile-drawer {
      display: none;
      position: fixed; top: 55px; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.98);
      backdrop-filter: blur(12px);
      z-index: 99;
      flex-direction: column;
      padding: 1.5rem;
      overflow-y: auto;
    }
    .mobile-nav-list { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
    .mobile-drawer-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; flex-direction: column; gap: 0.5rem; }

    .admin-sidebar {
      background: #1E293B;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 0;
      position: sticky; top: 0; height: 100vh;
      overflow-y: auto;
    }
    .sidebar-header {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0 1.25rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 1rem;
    }
    .s-icon { font-size: 2rem; }
    .s-brand { font-family: var(--font-heading); font-size: 1.0625rem; font-weight: 800; }
    .s-badge { font-size: 0.6875rem; color: var(--primary-light); background: rgba(56, 189, 248, 0.15); padding: 0.1rem 0.5rem; border-radius: var(--radius-full); font-weight: 700; }
    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; padding: 0 0.875rem; }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-xs);
      color: rgba(255, 255, 255, 0.65);
      font-size: 0.9375rem; font-weight: 500;
      transition: all var(--transition-fast);
      text-decoration: none; border: none; background: none; cursor: pointer; width: 100%; text-align: left;
    }
    .nav-item:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
    .nav-item.active { background: var(--primary); color: #fff; font-weight: 700; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); }
    .sidebar-footer { padding: 1rem 0.875rem; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column; gap: 0.25rem; }
    .view-site { color: var(--text-muted); font-size: 0.875rem; }
    .sign-out { color: #FCA5A5; font-size: 0.875rem; }
    .sign-out:hover { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
    .admin-main { background: #0F172A; overflow-y: auto; min-height: 100vh; }

    @media (max-width: 768px) {
      .admin-shell { grid-template-columns: 1fr; }
      .admin-sidebar { display: none; }
      .mobile-admin-header { display: flex; }
      .mobile-drawer { display: flex; }
    }
  `]
})
export class AdminShellComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);

  toggleMobileMenu() { this.mobileMenuOpen.update(v => !v); }
  closeMobileMenu() { this.mobileMenuOpen.set(false); }

  async signOut() {
    await this.supabase.signOut();
    this.router.navigate(['/admin/login']);
  }
}
