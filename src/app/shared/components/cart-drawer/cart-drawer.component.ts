import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    @if (cart.isOpen()) {
      <div class="cart-backdrop animate-fade-in" (click)="closeCart()"></div>

      <div class="cart-drawer animate-fade-in">
        <!-- Header -->
        <div class="drawer-header">
          <div class="drawer-title">
            <span>🛒 Your Grocery Basket</span>
            <span class="item-count">({{ cart.totalItems() }} items)</span>
          </div>
          <button class="close-btn" (click)="closeCart()" aria-label="Close Cart">✕</button>
        </div>

        <!-- Body -->
        <div class="drawer-body">
          @if (cart.items().length === 0) {
            <div class="empty-cart">
              <span class="empty-icon">🛍️</span>
              <h3>Your basket is empty!</h3>
              <p>Explore our fresh produce, staples, and daily deals to add items to your cart.</p>
              <button class="btn btn-primary btn-sm" (click)="closeCart()">Browse Grocery</button>
            </div>
          } @else {
            <div class="cart-items-list">
              @for (item of cart.items(); track item.product.id + (item.selectedSize || '')) {
                <div class="cart-item-row">
                  <img [src]="item.product.images[0]" [alt]="item.product.name" class="item-thumb" />
                  <div class="item-details">
                    <h4 class="item-name">{{ item.product.name }}</h4>
                    @if (item.selectedSize) {
                      <span class="item-variant">{{ item.selectedSize }}</span>
                    }
                    <span class="item-price">{{ item.product.price | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>

                  <div class="item-actions">
                    <div class="drawer-stepper">
                      <button (click)="decQty(item)">-</button>
                      <span>{{ item.quantity }}</span>
                      <button (click)="incQty(item)">+</button>
                    </div>
                    <button class="remove-btn" (click)="removeItem(item)" title="Remove item">🗑️</button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Footer -->
        @if (cart.items().length > 0) {
          <div class="drawer-footer">
            <div class="summary-row">
              <span>Subtotal:</span>
              <strong class="total-val">{{ cart.totalPrice() | currency:'INR':'symbol':'1.0-0' }}</strong>
            </div>

            <div class="delivery-notice">
              <span>🚀 Delivery to Jabalpur within 45 mins</span>
            </div>

            <button class="btn btn-fresh wa-order-btn" (click)="orderOnWhatsApp()" id="wa-checkout-btn">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
              Order via WhatsApp ({{ cart.totalPrice() | currency:'INR':'symbol':'1.0-0' }})
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .cart-backdrop {
      position: fixed;
      inset: 0;
      z-index: var(--z-drawer);
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
    }
    .cart-drawer {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: 100%;
      max-width: 440px;
      z-index: calc(var(--z-drawer) + 1);
      background: #fff;
      display: flex;
      flex-direction: column;
      box-shadow: -8px 0 32px rgba(15, 23, 42, 0.2);
    }
    .drawer-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-warm);
    }
    .drawer-title {
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 800;
      color: var(--text-dark);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .item-count {
      font-size: 0.875rem;
      color: var(--text-light);
      font-weight: 600;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-light);
      padding: 0.25rem;
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }
    .empty-cart {
      text-align: center;
      padding: 4rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .empty-icon { font-size: 3.5rem; }
    .empty-cart h3 { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; }
    .empty-cart p { font-size: 0.875rem; color: var(--text-light); max-width: 280px; }
    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .cart-item-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: #F8FAFC;
    }
    .item-thumb {
      width: 60px; height: 60px;
      object-fit: contain;
      background: #fff;
      border-radius: var(--radius-xs);
      padding: 0.25rem;
      border: 1px solid var(--border);
    }
    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .item-name {
      font-family: var(--font-heading);
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-dark);
      line-height: 1.2;
    }
    .item-variant {
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 700;
    }
    .item-price {
      font-size: 0.875rem;
      font-weight: 800;
      color: var(--text-dark);
    }
    .item-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }
    .drawer-stepper {
      display: flex;
      align-items: center;
      background: var(--primary);
      color: #fff;
      border-radius: var(--radius-xs);
      overflow: hidden;
    }
    .drawer-stepper button {
      background: none; border: none; color: #fff;
      width: 24px; height: 24px; font-weight: 800; cursor: pointer;
    }
    .drawer-stepper span {
      font-size: 0.8125rem; font-weight: 800; padding-inline: 0.4rem;
    }
    .remove-btn {
      background: none; border: none; cursor: pointer; font-size: 0.875rem; opacity: 0.7;
    }
    .remove-btn:hover { opacity: 1; }
    .drawer-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--border);
      background: var(--bg-warm);
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-dark);
    }
    .total-val { font-size: 1.375rem; color: var(--primary); font-family: var(--font-heading); }
    .delivery-notice {
      font-size: 0.8125rem;
      color: var(--accent-fresh);
      font-weight: 700;
      background: var(--accent-fresh-bg);
      padding: 0.4rem 0.8rem;
      border-radius: var(--radius-xs);
      text-align: center;
    }
    .wa-order-btn {
      width: 100%;
      padding: 0.875rem;
      font-size: 1rem;
      border-radius: var(--radius-full);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
    }
  `]
})
export class CartDrawerComponent {
  cart = inject(CartService);

  closeCart() { this.cart.closeCart(); }
  incQty(item: any) { this.cart.addItem(item.product, 1, item.selectedSize); }
  decQty(item: any) { this.cart.updateQuantity(item.product.id, item.quantity - 1, item.selectedSize); }
  removeItem(item: any) { this.cart.removeItem(item.product.id, item.selectedSize); }
  orderOnWhatsApp() { this.cart.sendWhatsAppOrder(); }
}
