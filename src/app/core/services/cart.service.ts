import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { Offer } from '../models/offer.model';
import { environment } from '../../../environments/environment';

export const SAMPLE_OFFERS: Offer[] = [
  {
    id: 'off-1',
    code: 'KSM100',
    title: 'Flat ₹100 OFF',
    description: 'Get flat ₹100 instant discount on all grocery orders above ₹999.',
    discount_type: 'flat',
    discount_value: 100,
    min_order_amount: 999,
    bg_gradient: 'linear-gradient(135deg, #2563EB, #0284C7)',
    icon: '🏷️',
    is_active: true
  },
  {
    id: 'off-2',
    code: 'SUPER20',
    title: '20% OFF on Staples',
    description: 'Save 20% up to ₹150 on your grocery orders above ₹499.',
    discount_type: 'percentage',
    discount_value: 20,
    max_discount: 150,
    min_order_amount: 499,
    bg_gradient: 'linear-gradient(135deg, #10B981, #059669)',
    icon: '🌾',
    is_active: true
  },
  {
    id: 'off-3',
    code: 'FRESH50',
    title: '₹50 OFF + Free Delivery',
    description: 'Enjoy ₹50 OFF on fresh fruits, vegetables & dairy orders above ₹299.',
    discount_type: 'flat',
    discount_value: 50,
    min_order_amount: 299,
    bg_gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    icon: '🥬',
    is_active: true
  }
];

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());
  isOpen = signal<boolean>(false);
  appliedCoupon = signal<Offer | null>(null);

  items = this.cartItems.asReadonly();

  totalItems = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  subtotalPrice = computed(() =>
    this.cartItems().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  discountAmount = computed(() => {
    const coupon = this.appliedCoupon();
    const subtotal = this.subtotalPrice();
    if (!coupon || subtotal < coupon.min_order_amount) return 0;

    if (coupon.discount_type === 'flat') {
      return coupon.discount_value;
    } else {
      const calc = (subtotal * coupon.discount_value) / 100;
      return coupon.max_discount ? Math.min(calc, coupon.max_discount) : calc;
    }
  });

  finalTotalPrice = computed(() => Math.max(0, this.subtotalPrice() - this.discountAmount()));

  private loadCartFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem('ksm_grocery_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveCartToStorage(items: CartItem[]) {
    try {
      localStorage.setItem('ksm_grocery_cart', JSON.stringify(items));
    } catch {}
  }

  toggleCart() { this.isOpen.update(v => !v); }
  openCart() { this.isOpen.set(true); }
  closeCart() { this.isOpen.set(false); }

  applyCouponCode(code: string): { success: boolean; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const offer = SAMPLE_OFFERS.find(o => o.code === cleanCode && o.is_active);

    if (!offer) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }

    if (this.subtotalPrice() < offer.min_order_amount) {
      return { success: false, message: `Minimum order amount for ${offer.code} is ₹${offer.min_order_amount}.` };
    }

    this.appliedCoupon.set(offer);
    return { success: true, message: `Coupon ${offer.code} applied successfully!` };
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
  }

  addItem(product: Product, quantity = 1, selectedSize?: string) {
    const current = this.cartItems();
    const sizeToUse = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : product.unit);
    const index = current.findIndex(
      i => i.product.id === product.id && i.selectedSize === sizeToUse
    );

    let updated: CartItem[];
    if (index > -1) {
      updated = current.map((item, idx) =>
        idx === index ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [...current, { product, quantity, selectedSize: sizeToUse }];
    }

    this.cartItems.set(updated);
    this.saveCartToStorage(updated);
  }

  getItemQuantity(productId: string, selectedSize?: string): number {
    const item = this.cartItems().find(
      i => i.product.id === productId && (!selectedSize || i.selectedSize === selectedSize)
    );
    return item ? item.quantity : 0;
  }

  updateQuantity(productId: string, quantity: number, selectedSize?: string) {
    if (quantity <= 0) {
      this.removeItem(productId, selectedSize);
      return;
    }

    const updated = this.cartItems().map(item => {
      if (item.product.id === productId && item.selectedSize === selectedSize) {
        return { ...item, quantity };
      }
      return item;
    });

    this.cartItems.set(updated);
    this.saveCartToStorage(updated);
  }

  removeItem(productId: string, selectedSize?: string) {
    const updated = this.cartItems().filter(
      item => !(item.product.id === productId && item.selectedSize === selectedSize)
    );
    this.cartItems.set(updated);
    this.saveCartToStorage(updated);
  }

  clearCart() {
    this.cartItems.set([]);
    this.appliedCoupon.set(null);
    this.saveCartToStorage([]);
  }

  sendWhatsAppOrder(whatsappNumber = environment.whatsapp.number) {
    const items = this.cartItems();
    if (items.length === 0) return;

    let msg = `🛒 *Khandelwal Supermart (KSM) — New Order*\n`;
    msg += `-----------------------------------\n`;

    items.forEach((item, index) => {
      const sizeStr = item.selectedSize ? ` (${item.selectedSize})` : '';
      msg += `${index + 1}. *${item.product.name}*${sizeStr}\n   Qty: ${item.quantity} × ₹${item.product.price} = ₹${item.product.price * item.quantity}\n`;
    });

    msg += `-----------------------------------\n`;
    msg += `Subtotal: ₹${this.subtotalPrice()}\n`;

    const coupon = this.appliedCoupon();
    if (coupon && this.discountAmount() > 0) {
      msg += `🎟️ Coupon (*${coupon.code}*): -₹${this.discountAmount()}\n`;
    }

    msg += `💰 *Final Payable Total:* ₹${this.finalTotalPrice()}\n\n`;
    msg += `📌 *Delivery Details:*\nPlease deliver to my address in Jabalpur.\n\nThank you! 🙏`;

    const encoded = encodeURIComponent(msg);
    const cleanNumber = whatsappNumber.replace('+', '').replace(/\s/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
  }
}
