import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="modal-backdrop animate-fade-in" (click)="closeModal.emit()"></div>

    <div class="modal-card animate-fade-in">
      <button class="close-btn" (click)="closeModal.emit()">✕</button>

      <div class="modal-grid">
        <!-- Image Gallery -->
        <div class="modal-img-wrap">
          <img [src]="activeImage()" [alt]="product.name" class="main-img" />
        </div>

        <!-- Info & Actions -->
        <div class="modal-info">
          <span class="modal-cat">{{ product.category?.name || 'Grocery Item' }}</span>
          <h2 class="modal-title">{{ product.name }}</h2>

          <div class="modal-price-box">
            <span class="modal-price">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</span>
            @if (product.original_price && product.original_price > product.price) {
              <span class="modal-orig-price">{{ product.original_price | currency:'INR':'symbol':'1.0-0' }}</span>
              <span class="modal-save-pill">Save {{ discountPercent }}%</span>
            }
          </div>

          <p class="modal-desc">{{ product.description }}</p>

          <!-- Variant Selector -->
          @if (product.sizes && product.sizes.length > 0) {
            <div class="variant-picker">
              <label>Select Weight / Pack Unit:</label>
              <div class="variant-pills">
                @for (size of product.sizes; track size) {
                  <button class="variant-pill" [class.active]="selectedVariant() === size" (click)="selectedVariant.set(size)">
                    {{ size }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Quantity & Add to Basket -->
          <div class="modal-actions">
            <div class="modal-stepper">
              <button (click)="decQty()">-</button>
              <span>{{ qty() }}</span>
              <button (click)="incQty()">+</button>
            </div>

            <button class="btn btn-primary btn-lg add-basket-btn" (click)="addToBasket()">
              🛒 Add to Basket ({{ (product.price * qty()) | currency:'INR':'symbol':'1.0-0' }})
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(6px);
    }
    .modal-card {
      position: relative;
      z-index: 2;
      width: 90%;
      max-width: 760px;
      max-height: 85vh;
      overflow-y: auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 2rem;
      margin: auto;
    }
    .close-btn {
      position: absolute;
      top: 16px; right: 16px;
      background: #f1f5f9;
      border: none;
      width: 36px; height: 36px;
      border-radius: 50%;
      font-size: 1.125rem;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 10;
    }
    .close-btn:hover {
      background: #e2e8f0;
    }
    .modal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: center;
    }
    @media (max-width: 640px) {
      .modal-grid { grid-template-columns: 1fr; }
      .modal-card { padding: 1.25rem; width: 94%; }
    }
    .modal-img-wrap {
      aspect-ratio: 1 / 1;
      background: #F8FAFC;
      border-radius: 12px;
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }
    .main-img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .modal-cat { font-size: 0.75rem; font-weight: 700; color: #2563eb; text-transform: uppercase; }
    .modal-title { font-family: var(--font-heading); font-size: 1.375rem; font-weight: 800; color: #1e293b; margin-block: 0.35rem 0.75rem; }
    .modal-price-box { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .modal-price { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #0f172a; }
    .modal-orig-price { font-size: 1rem; color: #94a3b8; text-decoration: line-through; }
    .modal-save-pill { background: #dcfce7; color: #15803d; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 999px; }
    .modal-desc { font-size: 0.9375rem; color: #475569; line-height: 1.6; margin-bottom: 1.25rem; }
    .variant-picker { margin-bottom: 1.25rem; }
    .variant-picker label { font-size: 0.8125rem; font-weight: 700; color: #334155; display: block; margin-bottom: 0.5rem; }
    .variant-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .variant-pill { padding: 0.4rem 0.85rem; border-radius: 6px; border: 1.5px solid #cbd5e1; background: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
    .variant-pill.active { border-color: #2563eb; background: rgba(37, 99, 235, 0.08); color: #2563eb; font-weight: 800; }
    .modal-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .modal-stepper { display: flex; align-items: center; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 999px; overflow: hidden; }
    .modal-stepper button { width: 36px; height: 36px; border: none; background: none; font-size: 1.125rem; font-weight: 800; cursor: pointer; }
    .modal-stepper span { font-size: 1rem; font-weight: 800; padding-inline: 0.75rem; }
    .add-basket-btn { flex: 1; min-width: 200px; }
  `]
})
export class ProductDetailModalComponent {
  @Input({ required: true }) product!: Product;
  @Output() closeModal = new EventEmitter<void>();

  private cart = inject(CartService);

  activeImage = signal('');
  selectedVariant = signal('');
  qty = signal(1);

  ngOnInit() {
    this.activeImage.set(this.product.images[0]);
    const def = (this.product.sizes && this.product.sizes.length > 0) ? this.product.sizes[0] : (this.product.unit || '1 Pack');
    this.selectedVariant.set(def);
  }

  get discountPercent(): number {
    if (this.product.original_price && this.product.original_price > this.product.price) {
      return Math.round(((this.product.original_price - this.product.price) / this.product.original_price) * 100);
    }
    return 0;
  }

  incQty() { this.qty.update(v => v + 1); }
  decQty() { this.qty.update(v => Math.max(1, v - 1)); }

  addToBasket() {
    this.cart.addItem(this.product, this.qty(), this.selectedVariant());
    this.cart.openCart();
    this.closeModal.emit();
  }
}
