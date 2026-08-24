export interface HeroSettings {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  primaryBtnText: string;
  secondaryBtnText: string;
  statProducts: string;
  statCustomers: string;
  statDelivery: string;
  imageUrl?: string;
}

export interface AboutSettings {
  eyebrow: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  imageUrl?: string;
  badgeText: string;
  badgeSub: string;
}

export interface WaBannerSettings {
  title: string;
  subtext: string;
  buttonText: string;
}

export interface ContactSettings {
  whatsappNumber: string;
  phone: string;
  email: string;
  location: string;
  hoursMonSat: string;
  hoursSun: string;
  hoursWa: string;
}

export interface SiteSettings {
  hero: HeroSettings;
  about: AboutSettings;
  waBanner: WaBannerSettings;
  contact: ContactSettings;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero: {
    eyebrow: '🛒 Khandelwal Supermart (KSM) • Jabalpur',
    title: 'Fresh Grocery Delivered to Your Doorstep',
    subtitle: 'Best Quality, Wholesale Prices',
    description: 'Shop fresh fruits, vegetables, daily staple rice, atta, oils, spices, dairy, and household essentials at Khandelwal Supermart.',
    primaryBtnText: 'Start Shopping',
    secondaryBtnText: 'Order via WhatsApp',
    statProducts: '5000+',
    statCustomers: '10k+',
    statDelivery: '45 Mins',
    imageUrl: 'assets/ksm-logo.png',
  },
  about: {
    eyebrow: 'About KSM',
    title: 'Your Trusted Neighborhood Supermart',
    paragraph1: 'Khandelwal Supermart (KSM) has been serving families across Jabalpur with farm-fresh produce, premium grocery staples, and daily essentials at honest prices.',
    paragraph2: 'We source directly from trusted local farmers and brand distributors to guarantee 100% freshness, top quality hygiene, and unbeatable savings.',
    paragraph3: 'Order online or via WhatsApp for fast home delivery across Jabalpur, MP.',
    imageUrl: 'assets/ksm-logo.png',
    badgeText: '100% Fresh',
    badgeSub: 'Guaranteed',
  },
  waBanner: {
    title: 'Need Express Grocery Delivery in Jabalpur?',
    subtext: 'Send your grocery list or cart items on WhatsApp for instant home delivery!',
    buttonText: 'Order Grocery on WhatsApp',
  },
  contact: {
    whatsappNumber: '+91 7848827245',
    phone: '+91 7848827245',
    email: 'khandelwalsupermart@gmail.com',
    location: 'Khandelwal Supermart, Near Arun Dairy, Gate No 4, Opposite Kothari Hospital, Jabalpur, MP',
    hoursMonSat: '9:00 AM – 10:00 PM',
    hoursSun: '9:00 AM – 10:00 PM',
    hoursWa: '24/7 Orders Accepted',
  },
};
