import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());
  isOpen = signal<boolean>(false);

  items = this.cartItems.asReadonly();

  totalItems = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this.cartItems().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

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

  toggleCart() {
    this.isOpen.update(v => !v);
  }

  openCart() {
    this.isOpen.set(true);
  }

  closeCart() {
    this.isOpen.set(false);
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
    msg += `💰 *Total Amount:* ₹${this.totalPrice()}\n\n`;
    msg += `📌 *Delivery Details:*\nPlease deliver to my address in Jabalpur.\n\nThank you! 🙏`;

    const encoded = encodeURIComponent(msg);
    const cleanNumber = whatsappNumber.replace('+', '').replace(/\s/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
  }
}
