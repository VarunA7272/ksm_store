import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="blinkit-product-card">
      <!-- Discount Badge -->
      @if (discountPercent > 0) {
        <div class="blinkit-discount-badge">{{ discountPercent }}% OFF</div>
      }

      <!-- Image Section -->
      <div class="blinkit-img-box" (click)="openDetail.emit(product)">
        <img [src]="product.images[0]" [alt]="product.name" loading="lazy" class="blinkit-img" />
      </div>

      <!-- Time & Unit Badge -->
      <div class="blinkit-time-row">
        <span class="blinkit-time-tag">⏱️ 8 MINS</span>
        <span class="blinkit-weight-tag">{{ selectedVariant() }}</span>
      </div>

      <!-- Title -->
      <h3 class="blinkit-title" (click)="openDetail.emit(product)" [title]="product.name">
        {{ product.name }}
      </h3>

      <!-- Variant Select (If multiple sizes) -->
      @if (product.sizes && product.sizes.length > 1) {
        <div class="variant-select-wrap">
          <select class="variant-select" (change)="onVariantChange($event)">
            @for (size of product.sizes; track size) {
              <option [value]="size" [selected]="size === selectedVariant()">{{ size }}</option>
            }
          </select>
        </div>
      }

      <!-- Footer: Price & Add Button -->
      <div class="blinkit-footer">
        <div class="blinkit-price-wrap">
          <span class="blinkit-curr-price">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</span>
          @if (product.original_price && product.original_price > product.price) {
            <span class="blinkit-orig-price">{{ product.original_price | currency:'INR':'symbol':'1.0-0' }}</span>
          }
        </div>

        <!-- Blinkit Style Green Add / Stepper Button -->
        <div class="blinkit-btn-wrap">
          @if (currentQty() === 0) {
            <button class="blinkit-add-btn" (click)="addToCart($event)" id="add-btn-{{product.id}}">
              ADD
            </button>
          } @else {
            <div class="blinkit-stepper">
              <button class="blinkit-step-btn" (click)="decQty($event)">-</button>
              <span class="blinkit-step-qty">{{ currentQty() }}</span>
              <button class="blinkit-step-btn" (click)="incQty($event)">+</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .blinkit-product-card {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 12px;
      padding: 0.75rem;
      transition: all 200ms ease;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .blinkit-product-card:hover {
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      border-color: #0c831f;
    }

    .blinkit-discount-badge {
      position: absolute;
      top: 8px; left: 8px;
      z-index: 2;
      background: #2563eb;
      color: #ffffff;
      font-size: 0.625rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .blinkit-img-box {
      width: 100%;
      height: 130px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-bottom: 0.5rem;
    }
    .blinkit-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 200ms ease;
    }
    .blinkit-product-card:hover .blinkit-img {
      transform: scale(1.05);
    }

    .blinkit-time-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.25rem;
      margin-bottom: 0.35rem;
    }
    .blinkit-time-tag {
      font-size: 0.625rem;
      font-weight: 800;
      color: #666666;
      background: #f4f4f5;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .blinkit-weight-tag {
      font-size: 0.6875rem;
      color: #666666;
      font-weight: 600;
    }

    .blinkit-title {
      font-family: inherit;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #1f1f1f;
      line-height: 1.3;
      margin-bottom: 0.5rem;
      cursor: pointer;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.1rem;
    }

    .variant-select-wrap {
      margin-bottom: 0.5rem;
    }
    .variant-select {
      width: 100%;
      padding: 2px 4px;
      font-size: 0.6875rem;
      border-radius: 4px;
      border: 1px solid #e8e8e8;
      background: #fafafa;
    }

    .blinkit-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 0.35rem;
    }

    .blinkit-price-wrap {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .blinkit-curr-price {
      font-size: 0.875rem;
      font-weight: 800;
      color: #1f1f1f;
    }
    .blinkit-orig-price {
      font-size: 0.6875rem;
      color: #888888;
      text-decoration: line-through;
    }

    /* Blinkit Signature Green ADD Button */
    .blinkit-add-btn {
      background: #f7fff9;
      color: #0c831f;
      border: 1px solid #0c831f;
      padding: 5px 18px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 800;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: all 150ms ease;
    }
    .blinkit-add-btn:hover {
      background: #0c831f;
      color: #ffffff;
    }

    .blinkit-stepper {
      display: flex;
      align-items: center;
      background: #0c831f;
      color: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      height: 28px;
    }
    .blinkit-step-btn {
      background: none;
      border: none;
      color: #ffffff;
      width: 24px;
      height: 100%;
      font-size: 0.9375rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .blinkit-step-btn:hover {
      background: rgba(0,0,0,0.15);
    }
    .blinkit-step-qty {
      font-size: 0.75rem;
      font-weight: 800;
      padding-inline: 4px;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() openDetail = new EventEmitter<Product>();

  private cart = inject(CartService);

  selectedVariant = signal<string>('');

  ngOnInit() {
    const defaultVariant = (this.product.sizes && this.product.sizes.length > 0)
      ? this.product.sizes[0]
      : (this.product.unit || '1 Unit');
    this.selectedVariant.set(defaultVariant);
  }

  get discountPercent(): number {
    if (this.product.original_price && this.product.original_price > this.product.price) {
      return Math.round(((this.product.original_price - this.product.price) / this.product.original_price) * 100);
    }
    return 0;
  }

  get currentQty(): () => number {
    return () => this.cart.getItemQuantity(this.product.id, this.selectedVariant());
  }

  onVariantChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedVariant.set(val);
  }

  addToCart(e: Event) {
    e.stopPropagation();
    this.cart.addItem(this.product, 1, this.selectedVariant());
  }

  incQty(e: Event) {
    e.stopPropagation();
    this.cart.addItem(this.product, 1, this.selectedVariant());
  }

  decQty(e: Event) {
    e.stopPropagation();
    const curr = this.currentQty();
    this.cart.updateQuantity(this.product.id, curr - 1, this.selectedVariant());
  }
}
