import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (!isAdminPage()) {
      <footer class="footer">
        <div class="footer-top">
          <div class="container">
            <div class="footer-grid">
              <!-- Brand -->
              <div class="footer-brand">
                <div class="logo-box">
                  <span class="logo-icon">🛒</span>
                  <div class="logo-text">
                    <span class="brand-name">KHANDELWAL</span>
                    <span class="brand-sub">SUPERMART (KSM)</span>
                  </div>
                </div>
                <p class="footer-tagline">Your trusted neighborhood supermart in Jabalpur. Fresh fruits, vegetables, daily staple rice, atta, ghee & daily essentials.</p>
                <div class="social-links">
                  <a href="https://wa.me/917848827245" target="_blank" aria-label="WhatsApp" class="social-btn wa">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
                  </a>
                </div>
              </div>

              <!-- Links -->
              <div class="footer-col">
                <h4>Quick Navigation</h4>
                <ul>
                  <li><a routerLink="/">Home</a></li>
                  <li><a routerLink="/catalog">Store Catalog</a></li>
                  <li><a routerLink="/about">About KSM</a></li>
                  <li><a routerLink="/reviews">Customer Reviews</a></li>
                  <li><a routerLink="/contact">Contact & Location</a></li>
                </ul>
              </div>

              <!-- Categories -->
              <div class="footer-col">
                <h4>Top Categories</h4>
                <ul>
                  <li><a routerLink="/catalog">Fresh Fruits & Veggies</a></li>
                  <li><a routerLink="/catalog">Atta, Rice & Dal</a></li>
                  <li><a routerLink="/catalog">Oil, Ghee & Spices</a></li>
                  <li><a routerLink="/catalog">Dairy & Bakery</a></li>
                  <li><a routerLink="/catalog">Snacks & Drinks</a></li>
                </ul>
              </div>

              <!-- Contact -->
              <div class="footer-col">
                <h4>Store Info</h4>
                <div class="contact-items">
                  <div class="contact-item">📍 Khandelwal Supermart, Near Arun Dairy, Gate No 4, Opposite Kothari Hospital, Jabalpur, MP</div>
                  <div class="contact-item">📞 +91 7848827245</div>
                  <div class="contact-item">💬 WhatsApp 24/7 Orders</div>
                  <div class="contact-item">🕐 9:00 AM – 10:00 PM (Mon-Sat)</div>
                  <div class="contact-item">🕐 9:00 AM – 10:00 PM (Sun)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="container">
            <p>&copy; {{ year }} Khandelwal Supermart (KSM). All Rights Reserved.</p>
            <p class="admin-link"><a routerLink="/admin">Store Admin</a></p>
          </div>
        </div>
      </footer>
    }
  `,
  styles: [`
    .footer { background: #0F172A; color: rgba(255,255,255,0.8); margin-top: auto; border-top: 1px solid rgba(255,255,255,0.08); }
    .footer-top { padding: 4rem 0 2.5rem; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 3rem; }
    @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
    @media (max-width: 580px) { .footer-grid { grid-template-columns: 1fr; } }
    .logo-box { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1rem; }
    .logo-icon { font-size: 1.75rem; background: rgba(37,99,235,0.2); width: 44px; height: 44px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
    .brand-name { font-family: var(--font-heading); font-weight: 800; font-size: 1.125rem; color: #fff; }
    .brand-sub { font-size: 0.6875rem; font-weight: 700; color: var(--primary-light); }
    .footer-tagline { font-size: 0.875rem; line-height: 1.6; color: var(--text-muted); margin-bottom: 1.25rem; }
    .social-links { display: flex; gap: 0.5rem; }
    .social-btn { width: 38px; height: 38px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; background: rgba(37,211,102,0.15); color: #25D366; }
    .footer-col h4 { font-family: var(--font-heading); font-size: 0.9375rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
    .footer-col ul { display: flex; flex-direction: column; gap: 0.625rem; list-style: none; }
    .footer-col a { font-size: 0.875rem; color: var(--text-muted); transition: color var(--transition-fast); }
    .footer-col a:hover { color: var(--primary-light); }
    .contact-items { display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem; color: var(--text-muted); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding: 1.25rem 0; }
    .footer-bottom .container { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
    .footer-bottom p { font-size: 0.8125rem; color: var(--text-muted); }
    .admin-link a { color: rgba(255,255,255,0.3); }
    .admin-link a:hover { color: #fff; }
  `]
})
export class FooterComponent {
  private router = inject(Router);
  year = new Date().getFullYear();
  isAdminPage = signal(false);

  constructor() {
    this.router.events.subscribe(() => {
      this.isAdminPage.set(this.router.url.startsWith('/admin'));
    });
    this.isAdminPage.set(this.router.url.startsWith('/admin'));
  }
}
