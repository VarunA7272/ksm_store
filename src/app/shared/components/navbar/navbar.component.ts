import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CartDrawerComponent],
  template: `
    @if (!isAdminPage()) {
      <nav class="navbar" [class.scrolled]="scrolled()">
        <div class="navbar-inner">
          <!-- Brand Logo -->
          <a routerLink="/catalog" class="navbar-logo" aria-label="KSM Catalog">
            <div class="logo-box">
              <span class="logo-icon">🛒</span>
              <div class="logo-text">
                <span class="brand-name">KHANDELWAL</span>
                <span class="brand-sub">SUPERMART (KSM)</span>
              </div>
            </div>
          </a>

          <!-- Navigation Links (Desktop) -->
          <ul class="navbar-links hide-mobile">
            <li><a routerLink="/catalog" routerLinkActive="active">Store Catalog</a></li>
            <li><a routerLink="/home" routerLinkActive="active">Home</a></li>
            <li><a routerLink="/offers" routerLinkActive="active" class="offers-link">🏷️ Special Offers</a></li>
            <li><a routerLink="/about" routerLinkActive="active">About KSM</a></li>
            <li><a routerLink="/reviews" routerLinkActive="active">Reviews</a></li>
            <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
          </ul>

          <!-- Actions -->
          <div class="navbar-actions">
            <!-- WhatsApp Order Quick Button -->
            <a href="https://wa.me/919876543210" target="_blank" class="wa-quick-btn hide-mobile">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
              <span>WhatsApp Order</span>
            </a>

            <!-- Cart Trigger Button -->
            <button class="cart-trigger-btn" (click)="toggleCart()" aria-label="Open Cart">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9Z"/>
              </svg>
              @if (cartCount() > 0) {
                <span class="cart-badge animate-fade-in">{{ cartCount() }}</span>
              }
            </button>

            <!-- Mobile Hamburger Toggle -->
            <button class="mobile-toggle hide-desktop" (click)="toggleMenu()" aria-label="Toggle Navigation">
              <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                @if (menuOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                }
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu Overlay -->
        @if (menuOpen()) {
          <div class="mobile-menu animate-fade-in">
            <ul>
              <li><a routerLink="/" (click)="closeMenu()">Home</a></li>
              <li><a routerLink="/catalog" (click)="closeMenu()">Store Catalog</a></li>
              <li><a routerLink="/offers" (click)="closeMenu()">🏷️ Special Offers</a></li>
              <li><a routerLink="/about" (click)="closeMenu()">About KSM</a></li>
              <li><a routerLink="/reviews" (click)="closeMenu()">Reviews</a></li>
              <li><a routerLink="/contact" (click)="closeMenu()">Contact Us</a></li>
            </ul>
          </div>
        }
      </nav>

      <!-- Cart Drawer Component -->
      <app-cart-drawer />
    }
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: var(--z-nav);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      transition: all var(--transition-base);
    }
    .navbar.scrolled {
      box-shadow: var(--shadow-sm);
      background: rgba(255, 255, 255, 0.98);
    }
    .navbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      max-width: 1320px;
      margin-inline: auto;
      padding-inline: clamp(0.75rem, 3.5vw, 2.5rem);
      gap: 1rem;
    }
    .logo-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logo-icon {
      font-size: 1.4rem;
      background: rgba(37, 99, 235, 0.1);
      width: 38px; height: 38px;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
    }
    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .brand-name {
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 0.9375rem;
      color: var(--primary);
      letter-spacing: 0.02em;
    }
    .brand-sub {
      font-size: 0.625rem;
      font-weight: 700;
      color: var(--text-light);
      letter-spacing: 0.06em;
    }
    .navbar-search {
      flex: 1;
      max-width: 400px;
      display: flex;
      align-items: center;
      gap: 0.625rem;
      background: var(--bg-warm);
      border: 1px solid var(--border);
      padding: 0.45rem 1rem;
      border-radius: var(--radius-full);
      color: var(--text-light);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .navbar-search:hover {
      border-color: var(--primary);
      background: #fff;
    }
    .navbar-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      list-style: none;
    }
    .navbar-links a {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-mid);
      transition: color var(--transition-fast);
      padding: 0.375rem 0;
      position: relative;
    }
    .navbar-links a:hover, .navbar-links a.active {
      color: var(--primary);
      font-weight: 600;
    }
    .offers-link {
      color: #D97706 !important;
      font-weight: 700 !important;
    }
    .navbar-links a.active::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 0; right: 0;
      height: 2px;
      background: var(--primary);
      border-radius: var(--radius-full);
    }
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .wa-quick-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #25D366;
      color: #fff;
      padding: 0.45rem 0.9rem;
      border-radius: var(--radius-full);
      font-size: 0.8125rem;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
      transition: transform var(--transition-fast);
    }
    .wa-quick-btn:hover {
      transform: translateY(-2px);
    }
    .cart-trigger-btn {
      position: relative;
      background: rgba(37, 99, 235, 0.1);
      color: var(--primary);
      border: none;
      width: 38px; height: 38px;
      border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .cart-trigger-btn:hover {
      background: var(--primary);
      color: #fff;
    }
    .cart-badge {
      position: absolute;
      top: -2px; right: -2px;
      background: #EF4444;
      color: #fff;
      font-size: 0.6875rem;
      font-weight: 800;
      width: 18px; height: 18px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
    }
    .mobile-toggle {
      background: none;
      border: none;
      color: var(--text-dark);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      padding: 0.25rem;
    }
    .mobile-menu {
      background: #fff;
      border-bottom: 1px solid var(--border);
      padding: 1rem 1.5rem;
      box-shadow: var(--shadow-md);
    }
    .mobile-menu ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .mobile-menu a {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-dark);
      display: block;
      padding: 0.5rem 0;
    }
    @media (max-width: 899px) {
      .hide-mobile { display: none !important; }
    }
    @media (min-width: 900px) {
      .hide-desktop { display: none !important; }
    }
  `]
})
export class NavbarComponent {
  private cart = inject(CartService);
  private router = inject(Router);

  cartCount = computed(() => this.cart.totalItems());
  scrolled = signal(false);
  menuOpen = signal(false);
  isAdminPage = signal(false);

  constructor() {
    this.router.events.subscribe(() => {
      this.isAdminPage.set(this.router.url.startsWith('/admin'));
    });
    this.isAdminPage.set(this.router.url.startsWith('/admin'));
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleCart() { this.cart.toggleCart(); }
  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }
  goToSearch() { this.router.navigate(['/catalog']); }
}
