import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="product-card card">
      <!-- Discount Badge -->
      @if (discountPercent > 0) {
        <span class="discount-pill">{{ discountPercent }}% OFF</span>
      }

      <!-- Image Section -->
      <div class="card-image-wrap" (click)="openDetail.emit(product)">
        <img [src]="product.images[0]" [alt]="product.name" loading="lazy" class="card-img" />
      </div>

      <!-- Content -->
      <div class="card-body">
        <!-- Category & Weight Unit -->
        <div class="card-meta">
          <span class="card-unit">{{ selectedVariant() }}</span>
        </div>

        <h3 class="card-title" (click)="openDetail.emit(product)">{{ product.name }}</h3>

        <!-- Variant Selector if available -->
        @if (product.sizes && product.sizes.length > 1) {
          <div class="variant-select-wrap">
            <select class="variant-select" (change)="onVariantChange($event)">
              @for (size of product.sizes; track size) {
                <option [value]="size" [selected]="size === selectedVariant()">{{ size }}</option>
              }
            </select>
          </div>
        }

        <!-- Price & Quick Add -->
        <div class="card-footer">
          <div class="price-box">
            <span class="current-price">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</span>
            @if (product.original_price && product.original_price > product.price) {
              <span class="original-price">{{ product.original_price | currency:'INR':'symbol':'1.0-0' }}</span>
            }
          </div>

          <!-- Quick Add / Stepper Button -->
          <div class="add-box">
            @if (currentQty() === 0) {
              <button class="btn-add" (click)="addToCart($event)" id="add-btn-{{product.id}}">
                <span>+ ADD</span>
              </button>
            } @else {
              <div class="stepper">
                <button class="step-btn" (click)="decQty($event)">-</button>
                <span class="step-qty">{{ currentQty() }}</span>
                <button class="step-btn" (click)="incQty($event)">+</button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: all var(--transition-base);
    }
    .product-card:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--primary-light);
    }
    .discount-pill {
      position: absolute;
      top: 8px; left: 8px;
      z-index: 2;
      background: var(--gradient-fresh);
      color: #fff;
      font-size: 0.625rem;
      font-weight: 800;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
    }
    .card-image-wrap {
      aspect-ratio: 1 / 1;
      width: 100%;
      background: #F8FAFC;
      overflow: hidden;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      padding: 0.75rem;
    }
    .card-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform var(--transition-base);
    }
    .product-card:hover .card-img {
      transform: scale(1.04);
    }
    .card-body {
      padding: 0.625rem 0.75rem 0.75rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 0.35rem;
    }
    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-unit {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--primary);
      background: rgba(37, 99, 235, 0.08);
      padding: 0.12rem 0.45rem;
      border-radius: var(--radius-xs);
    }
    .card-title {
      font-family: var(--font-heading);
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-dark);
      line-height: 1.25;
      cursor: pointer;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.2rem;
    }
    .variant-select-wrap {
      margin-top: 0.1rem;
    }
    .variant-select {
      width: 100%;
      padding: 0.2rem 0.35rem;
      font-size: 0.6875rem;
      border-radius: var(--radius-xs);
      border: 1px solid var(--border);
      background: var(--bg-warm);
      color: var(--text-mid);
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 0.35rem;
      gap: 0.25rem;
    }
    .price-box {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .current-price {
      font-family: var(--font-heading);
      font-size: 0.9375rem;
      font-weight: 800;
      color: var(--text-dark);
    }
    .original-price {
      font-size: 0.6875rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }
    .btn-add {
      background: rgba(37, 99, 235, 0.08);
      color: var(--primary);
      border: 1.5px solid var(--primary);
      padding: 0.3rem 0.65rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }
    .btn-add:hover {
      background: var(--primary);
      color: #fff;
    }
    .stepper {
      display: flex;
      align-items: center;
      background: var(--primary);
      color: #fff;
      border-radius: var(--radius-sm);
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
    }
    .step-btn {
      background: none;
      border: none;
      color: #fff;
      width: 24px; height: 24px;
      font-size: 0.875rem;
      font-weight: 800;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .step-qty {
      font-size: 0.75rem;
      font-weight: 800;
      padding-inline: 0.25rem;
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
