import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, FormsModule],
  template: `
    @if (cart.isOpen()) {
      <div class="cart-backdrop animate-fade-in" (click)="cart.closeCart()"></div>
      <div class="cart-drawer animate-slide-left">
        <!-- Header -->
        <div class="drawer-header">
          <div class="dh-title">
            <span>🛒 Your Grocery Basket</span>
            <span class="dh-badge">{{ cart.totalItems() }} items</span>
          </div>
          <button class="close-btn" (click)="cart.closeCart()">✕</button>
        </div>

        <!-- Body -->
        <div class="drawer-body">
          @if (cart.items().length === 0) {
            <div class="empty-cart">
              <span class="empty-icon">🛒</span>
              <h3>Your basket is empty</h3>
              <p>Add fresh groceries, fruits, vegetables, and daily staples to your cart!</p>
              <button class="btn btn-primary btn-sm" (click)="cart.closeCart()" routerLink="/catalog">Browse Store Catalog</button>
            </div>
          } @else {
            <div class="cart-items-list">
              @for (item of cart.items(); track item.product.id + item.selectedSize) {
                <div class="cart-item-card">
                  <img [src]="item.product.images[0]" [alt]="item.product.name" class="item-img" />
                  <div class="item-details">
                    <h4 class="item-name">{{ item.product.name }}</h4>
                    <span class="item-size">{{ item.selectedSize || item.product.unit }}</span>
                    <span class="item-price">{{ item.product.price | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="item-actions">
                    <div class="stepper">
                      <button class="step-btn" (click)="cart.updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)">-</button>
                      <span class="step-qty">{{ item.quantity }}</span>
                      <button class="step-btn" (click)="cart.addItem(item.product, 1, item.selectedSize)">+</button>
                    </div>
                    <button class="remove-btn" (click)="cart.removeItem(item.product.id, item.selectedSize)">🗑️</button>
                  </div>
                </div>
              }
            </div>

            <!-- Coupon Promo Section -->
            <div class="coupon-section card">
              <div class="coupon-title">
                <span>🎟️ Have a Promo / Coupon Code?</span>
                <a routerLink="/offers" (click)="cart.closeCart()" class="view-offers-link">View Offers →</a>
              </div>

              @if (cart.appliedCoupon()) {
                <div class="applied-coupon-badge">
                  <div>
                    <strong>{{ cart.appliedCoupon()?.code }} Applied!</strong>
                    <p>Discount: ₹{{ cart.discountAmount() }} OFF</p>
                  </div>
                  <button class="remove-coupon-btn" (click)="cart.removeCoupon()">Remove</button>
                </div>
              } @else {
                <div class="coupon-input-group">
                  <input type="text" [(ngModel)]="couponInput" placeholder="Enter code (e.g. KSM100)" class="coupon-input" (keyup.enter)="applyCoupon()" />
                  <button class="btn btn-secondary btn-sm" (click)="applyCoupon()">Apply</button>
                </div>
              }

              @if (couponMsg()) {
                <p class="coupon-feedback" [class.success]="couponSuccess()" [class.error]="!couponSuccess()">
                  {{ couponMsg() }}
                </p>
              }
            </div>

            <!-- Summary Footer -->
            <div class="drawer-summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ cart.subtotalPrice() | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>

              @if (cart.discountAmount() > 0) {
                <div class="summary-row discount-row">
                  <span>Coupon Discount ({{ cart.appliedCoupon()?.code }})</span>
                  <span>- {{ cart.discountAmount() | currency:'INR':'symbol':'1.0-0' }}</span>
                </div>
              }

              <div class="summary-row total-row">
                <span>Total Payable Amount</span>
                <span class="total-price">{{ cart.finalTotalPrice() | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>

              <button class="btn btn-fresh btn-lg checkout-btn" (click)="checkout()">
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
                Place Order via WhatsApp
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .cart-backdrop {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.7);
      z-index: var(--z-drawer);
      backdrop-filter: blur(4px);
    }
    .cart-drawer {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 100%; max-width: 440px;
      background: #fff;
      z-index: calc(var(--z-drawer) + 1);
      display: flex; flex-direction: column;
      box-shadow: -8px 0 32px rgba(15, 23, 42, 0.2);
    }
    .drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      background: var(--bg-dark);
      color: #fff;
    }
    .dh-title { display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-heading); font-weight: 700; font-size: 1.0625rem; }
    .dh-badge { background: var(--primary); color: #fff; font-size: 0.75rem; font-weight: 800; padding: 0.15rem 0.6rem; border-radius: var(--radius-full); }
    .close-btn { background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer; }

    .drawer-body { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .empty-cart { text-align: center; padding: 4rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .empty-icon { font-size: 3.5rem; }
    .empty-cart h3 { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; }
    .empty-cart p { color: var(--text-light); font-size: 0.875rem; }

    .cart-items-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .cart-item-card { display: flex; align-items: center; gap: 0.875rem; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-warm); }
    .item-img { width: 54px; height: 54px; object-fit: contain; background: #fff; border-radius: var(--radius-xs); padding: 0.25rem; }
    .item-details { flex: 1; display: flex; flex-direction: column; }
    .item-name { font-family: var(--font-heading); font-size: 0.875rem; font-weight: 700; color: var(--text-dark); line-height: 1.2; }
    .item-size { font-size: 0.6875rem; color: var(--text-light); }
    .item-price { font-size: 0.875rem; font-weight: 800; color: var(--primary); }
    .item-actions { display: flex; align-items: center; gap: 0.5rem; }
    .stepper { display: flex; align-items: center; background: var(--primary); color: #fff; border-radius: var(--radius-xs); overflow: hidden; }
    .step-btn { background: none; border: none; color: #fff; width: 24px; height: 24px; font-weight: 800; cursor: pointer; }
    .step-qty { font-size: 0.75rem; font-weight: 800; padding-inline: 0.25rem; }
    .remove-btn { background: none; border: none; cursor: pointer; opacity: 0.6; font-size: 0.875rem; }
    .remove-btn:hover { opacity: 1; }

    /* Coupon Section */
    .coupon-section { padding: 0.875rem; background: #F8FAFC; border: 1px dashed var(--primary); }
    .coupon-title { display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-dark); }
    .view-offers-link { color: var(--primary); font-size: 0.75rem; font-weight: 700; }
    .coupon-input-group { display: flex; gap: 0.5rem; }
    .coupon-input { flex: 1; padding: 0.45rem 0.75rem; border-radius: var(--radius-xs); border: 1px solid var(--border); font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; }
    .applied-coupon-badge { display: flex; justify-content: space-between; align-items: center; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.5rem 0.75rem; border-radius: var(--radius-xs); }
    .applied-coupon-badge strong { color: #10B981; font-size: 0.8125rem; display: block; }
    .applied-coupon-badge p { color: var(--text-mid); font-size: 0.75rem; margin: 0; }
    .remove-coupon-btn { background: none; border: none; color: #EF4444; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
    .coupon-feedback { font-size: 0.75rem; font-weight: 700; margin-top: 0.35rem; }
    .coupon-feedback.success { color: #10B981; }
    .coupon-feedback.error { color: #EF4444; }

    .drawer-summary { margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.5rem; }
    .summary-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-mid); }
    .discount-row { color: #10B981; font-weight: 700; }
    .total-row { font-size: 1.0625rem; font-weight: 800; color: var(--text-dark); border-top: 1px dashed var(--border); padding-top: 0.5rem; }
    .total-price { color: var(--primary); font-family: var(--font-heading); font-size: 1.25rem; }
    .checkout-btn { width: 100%; padding: 0.875rem; margin-top: 0.5rem; }
  `]
})
export class CartDrawerComponent {
  cart = inject(CartService);

  couponInput = '';
  couponMsg = signal('');
  couponSuccess = signal(false);

  applyCoupon() {
    if (!this.couponInput.trim()) return;
    const res = this.cart.applyCouponCode(this.couponInput);
    this.couponMsg.set(res.message);
    this.couponSuccess.set(res.success);
    if (res.success) {
      this.couponInput = '';
    }
  }

  checkout() {
    this.cart.sendWhatsAppOrder();
  }
}
