export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  valid_till?: string;
  bg_gradient?: string;
  icon?: string;
  is_active: boolean;
}
