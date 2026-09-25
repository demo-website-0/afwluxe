export type ProductCategory =
  | 'dresses'
  | 'kurtis'
  | 'abayas'
  | 'tops'
  | 'accessories'
  | 'hijab'
  | 'bag'
  | 'rings';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  priceBDT?: number;
  compareAtPriceBDT?: number;
  costPriceBDT?: number;
  inStock?: boolean;
  stockCount?: number;
  brand?: string;
  rating: number;
  reviewsCount: number;
  image: string;
  secondaryImage: string;
  galleryImages?: string[];
  colors: { name: string; hex: string; image?: string }[];
  sizes: string[];
  description: string;
  fabric: string;
  fit: string;
  care: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isSale?: boolean;
  isLimitedEdition?: boolean;
  status?: 'active' | 'draft';
  labels?: string[];
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  showSizeGuide?: boolean;
  relatedProductIds?: string[];
  variantStock?: Record<string, number>;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export interface CategoryCardData {
  id: string;
  title: string;
  description: string;
  image: string;
  itemCount: number;
  slug?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
  rating: number;
  purchasedItem: string;
  status?: 'published' | 'hidden';
  date?: string;
}

export interface InstagramPost {
  id: string;
  image: string;
  handle: string;
  likes: number;
  taggedProduct: string;
  caption: string;
}

export interface AdminOrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  priceBDT: number;
}

export type PaymentStatus = 'Pending' | 'Verification Needed' | 'Paid' | 'Failed' | 'Refunded';

export interface PaymentDetails {
  method: 'cod' | 'bkash' | 'nagad';
  senderNumber?: string;
  trxId?: string;
  paidAmount?: number;
  paymentDate?: string;
  merchantNumber?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  date: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
  items: AdminOrderItem[];
  subtotalBDT: number;
  shippingBDT: number;
  discountBDT?: number;
  totalBDT: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  paymentStatus: PaymentStatus;
  fulfillmentStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  paymentDetails?: PaymentDetails;
  internalNotes?: string;
  partialPayment?: {
    paidAmount: number;
    dueAmount: number;
    notes?: string;
  };
  courier?: {
    provider: 'Pathao' | 'Steadfast' | 'RedX';
    trackingId: string;
    consignmentId: string;
    shippedAt: string;
  };
}

export interface AdminLabel {
  id: string;
  name: string;
  color?: string;
}

export interface LegalPolicy {
  title: string;
  lastUpdated: string;
  content: string;
}

export interface WebsiteCMSContent {
  hero: {
    headline: string;
    subheadline: string;
    buttonText: string;
    buttonLink: string;
    image: string;
  };
  categoryGrid: {
    slot1: { title: string; image: string; link: string };
    slot2: { title: string; image: string; link: string };
    slot3: { title: string; image: string; link: string };
    slot4: { title: string; image: string; link: string };
  };
  editorialBanner: {
    headline: string;
    subheadline: string;
    buttonText: string;
    buttonLink: string;
    image: string;
  };
  newsletter: {
    headline: string;
    subheadline: string;
    buttonText: string;
  };
  legalPages: {
    returnPolicy: LegalPolicy;
    privacyPolicy: LegalPolicy;
    termsOfService: LegalPolicy;
    shippingPolicy: LegalPolicy;
  };
}

export interface InventoryLock {
  id: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  lockedUntil: number; // timestamp ms
}
