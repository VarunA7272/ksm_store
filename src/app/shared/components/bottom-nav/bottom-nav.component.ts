import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (!isAdminPage()) {
      <nav class="bottom-nav hide-desktop">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="bottom-nav-item">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
          <span>Home</span>
        </a>

        <a routerLink="/catalog" routerLinkActive="active" class="bottom-nav-item">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <span>Catalog</span>
        </a>

        <a routerLink="/offers" routerLinkActive="active" class="bottom-nav-item offers-item">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z"/></svg>
          <span>Offers</span>
        </a>

        <!-- Cart Drawer Toggle -->
        <button class="bottom-nav-item cart-item-btn" (click)="toggleCart()">
          <div class="cart-icon-wrapper">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9Z"/></svg>
            @if (cartCount() > 0) {
              <span class="nav-cart-badge">{{ cartCount() }}</span>
            }
          </div>
          <span>Cart</span>
        </button>

        <a href="https://wa.me/919876543210" target="_blank" class="bottom-nav-item wa-item">
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
          <span>WhatsApp</span>
        </a>
      </nav>
    }
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: var(--z-bottom-nav);
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid var(--border);
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      height: 64px;
      box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.08);
    }
    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      color: var(--text-light);
      font-size: 0.6875rem;
      font-weight: 600;
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .bottom-nav-item.active, .bottom-nav-item:hover {
      color: var(--primary);
    }
    .offers-item.active, .offers-item:hover {
      color: #F59E0B;
    }
    .cart-icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nav-cart-badge {
      position: absolute;
      top: -4px; right: -8px;
      background: #EF4444;
      color: #fff;
      font-size: 0.6875rem;
      font-weight: 800;
      width: 17px; height: 17px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .wa-item {
      color: #25D366;
    }
    .wa-item.active, .wa-item:hover {
      color: #128C7E;
    }
    @media (min-width: 769px) {
      .hide-desktop { display: none !important; }
    }
  `]
})
export class BottomNavComponent {
  private cart = inject(CartService);
  private router = inject(Router);

  cartCount = computed(() => this.cart.totalItems());
  isAdminPage = signal(false);

  constructor() {
    this.router.events.subscribe(() => {
      this.isAdminPage.set(this.router.url.startsWith('/admin'));
    });
    this.isAdminPage.set(this.router.url.startsWith('/admin'));
  }

  toggleCart() {
    this.cart.toggleCart();
  }
}
