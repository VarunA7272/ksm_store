import { Component, OnInit, inject, signal } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { CartService, SAMPLE_OFFERS } from '../../core/services/cart.service';
import { Offer } from '../../core/models/offer.model';

@Component({
  selector: 'app-offers',
  standalone: true,
  template: `
    <div class="offers-page">
      <!-- Header -->
      <section class="offers-hero">
        <div class="container">
          <span class="eyebrow" style="background: rgba(245,158,11,0.15); color: #F59E0B; border-color: rgba(245,158,11,0.3)">🏷️ Exclusive Discounts</span>
          <h1>KSM Supermart Offers & Coupons</h1>
          <p>Save big on your daily groceries! Copy any coupon code below and apply it to your basket at checkout.</p>
        </div>
      </section>

      <!-- Offers Cards Grid -->
      <section class="offers-body section">
        <div class="container">
          <div class="offers-grid">
            @for (offer of offers(); track offer.id) {
              <div class="offer-card card" [style.background]="offer.bg_gradient">
                <div class="offer-card-inner">
                  <div class="offer-badge-header">
                    <span class="offer-icon">{{ offer.icon || '🎟️' }}</span>
                    <span class="offer-type-tag">
                      {{ offer.discount_type === 'flat' ? 'Flat Discount' : 'Percentage OFF' }}
                    </span>
                  </div>

                  <h2 class="offer-title">{{ offer.title }}</h2>
                  <p class="offer-desc">{{ offer.description }}</p>

                  <div class="offer-rules">
                    <span class="rule-item">Min. Order: ₹{{ offer.min_order_amount }}</span>
                    @if (offer.max_discount) {
                      <span class="rule-item">Max Discount: ₹{{ offer.max_discount }}</span>
                    }
                  </div>

                  <!-- Coupon Code Box & Actions -->
                  <div class="coupon-action-box">
                    <div class="code-box">
                      <span class="code-label">PROMO CODE</span>
                      <strong class="code-val">{{ offer.code }}</strong>
                    </div>

                    <div class="btn-group">
                      <button class="btn-copy" (click)="copyCode(offer.code)">
                        {{ copiedCode() === offer.code ? '✅ Copied!' : '📋 Copy Code' }}
                      </button>
                      <button class="btn-apply-direct" (click)="applyToCart(offer.code)">
                        🛒 Apply to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- How to Redeem Section -->
      <section class="redeem-guide-section section-sm" style="background: var(--bg-white)">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow">Quick Guide</span>
            <h2>How to Use Grocery Coupons</h2>
          </div>

          <div class="steps-grid">
            <div class="step-card card">
              <span class="step-num">1</span>
              <h3>Copy Code</h3>
              <p>Click "Copy Code" on any offer card above.</p>
            </div>
            <div class="step-card card">
              <span class="step-num">2</span>
              <h3>Add Groceries</h3>
              <p>Add your daily staples & items to your cart.</p>
            </div>
            <div class="step-card card">
              <span class="step-num">3</span>
              <h3>Paste in Basket</h3>
              <p>Paste the coupon code in your cart drawer.</p>
            </div>
            <div class="step-card card">
              <span class="step-num">4</span>
              <h3>Enjoy Savings!</h3>
              <p>Discount applies instantly to your total bill!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .offers-page {
      padding-top: 60px;
    }
    .offers-hero {
      padding: 3rem 0 2rem;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #fff;
      text-align: center;
    }
    .offers-hero h1 {
      font-family: var(--font-heading);
      font-size: clamp(1.75rem, 4vw, 2.75rem);
      font-weight: 800;
      margin-block: 0.5rem;
    }
    .offers-hero p {
      color: var(--text-muted);
      font-size: 0.9375rem;
      max-width: 540px;
      margin-inline: auto;
    }
    .offers-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      .offers-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 580px) {
      .offers-grid { grid-template-columns: 1fr; }
    }
    .offer-card {
      border: none;
      color: #fff;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      transition: transform var(--transition-base);
    }
    .offer-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
    .offer-card-inner {
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .offer-badge-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .offer-icon { font-size: 2.25rem; }
    .offer-type-tag {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(8px);
      padding: 0.2rem 0.65rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
    }
    .offer-title {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 800;
      margin-bottom: 0.35rem;
    }
    .offer-desc {
      font-size: 0.875rem;
      opacity: 0.9;
      line-height: 1.4;
      margin-bottom: 1rem;
      flex: 1;
    }
    .offer-rules {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .rule-item {
      background: rgba(0,0,0,0.2);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-xs);
      font-size: 0.75rem;
      font-weight: 600;
    }
    .coupon-action-box {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(12px);
      border: 1px dashed rgba(255,255,255,0.4);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .code-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .code-label { font-size: 0.6875rem; opacity: 0.8; font-weight: 700; letter-spacing: 0.05em; }
    .code-val { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; letter-spacing: 0.1em; color: #FFF; }

    .btn-group { display: flex; gap: 0.5rem; }
    .btn-copy {
      flex: 1;
      background: #fff;
      color: var(--text-dark);
      border: none;
      padding: 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      font-weight: 800;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-copy:hover { background: var(--bg-warm); }
    .btn-apply-direct {
      flex: 1;
      background: rgba(0,0,0,0.25);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-apply-direct:hover { background: rgba(0,0,0,0.4); }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-top: 1.5rem;
    }
    @media (max-width: 900px) { .steps-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .steps-grid { grid-template-columns: 1fr; } }
    .step-card {
      padding: 1.25rem;
      text-align: center;
      position: relative;
    }
    .step-num {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: var(--gradient-blue);
      color: #fff;
      font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      margin-inline: auto; margin-bottom: 0.75rem;
    }
    .step-card h3 { font-family: var(--font-heading); font-size: 0.9375rem; font-weight: 700; margin-bottom: 0.25rem; }
    .step-card p { font-size: 0.8125rem; color: var(--text-light); }
  `]
})
export class OffersComponent implements OnInit {
  private seo = inject(SeoService);
  private cart = inject(CartService);

  offers = signal<Offer[]>(SAMPLE_OFFERS);
  copiedCode = signal<string | null>(null);

  ngOnInit() {
    this.seo.setPage({
      title: 'Grocery Offers & Coupon Codes — Khandelwal Supermart (KSM)',
      description: 'Find active discount coupons, flat OFF deals, and promo codes for grocery orders at Khandelwal Supermart Jabalpur.'
    });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
    this.copiedCode.set(code);
    setTimeout(() => this.copiedCode.set(null), 2500);
  }

  applyToCart(code: string) {
    this.cart.applyCouponCode(code);
    this.cart.openCart();
  }
}
