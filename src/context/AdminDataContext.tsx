import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES, TESTIMONIALS } from '../data/products';
import {
  Product,
  CategoryCardData,
  Testimonial,
  AdminOrder,
  WebsiteCMSContent,
  AdminLabel,
  ProductCategory,
  LegalPolicy,
  InventoryLock,
  CartItem,
} from '../types';
import { generateSlug } from '../utils/imageCompressor';

interface AdminContextType {
  // Products
  products: Product[];
  addProduct: (productData: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  bulkUpdateProductStatus: (ids: string[], status: 'active' | 'draft') => void;
  bulkUpdateProductCategory: (ids: string[], category: ProductCategory, categoryLabel: string) => void;

  // Categories & Labels
  categories: CategoryCardData[];
  addCategory: (categoryData: Omit<CategoryCardData, 'id' | 'itemCount'>) => CategoryCardData;
  updateCategory: (id: string, categoryData: Partial<CategoryCardData>) => void;
  deleteCategory: (id: string) => void;
  labels: AdminLabel[];
  addLabel: (name: string, color?: string) => void;
  deleteLabel: (id: string) => void;

  // Orders
  orders: AdminOrder[];
  addOrder: (order: Omit<AdminOrder, 'id' | 'orderNumber' | 'date'>) => AdminOrder;
  updateOrder: (orderId: string, updatedOrder: Partial<AdminOrder>) => void;
  updateOrderFulfillment: (orderId: string, status: AdminOrder['fulfillmentStatus']) => void;
  updateOrderPayment: (orderId: string, status: AdminOrder['paymentStatus']) => void;
  shipOrderWithCourier: (
    orderId: string,
    provider: 'Pathao' | 'Steadfast' | 'RedX'
  ) => { trackingId: string; consignmentId: string };

  // Financial & Metrics
  totalProfit: number;
  totalSales: number;

  // Inventory Locking (Race condition prevention for concurrent checkouts)
  inventoryLocks: InventoryLock[];
  lockInventory: (items: CartItem[]) => { success: boolean; errorItemName?: string };
  releaseInventoryLocks: (cartItems?: CartItem[]) => void;
  isItemLocked: (productId: string, size?: string, color?: string) => boolean;

  // Back in stock alerts
  backInStockAlerts: { id: string; email: string; productId: string; productName: string; date: string }[];
  subscribeBackInStock: (email: string, productId: string, productName: string) => void;

  // CMS Content & Legal Pages
  cmsContent: WebsiteCMSContent;
  updateCMSContent: (section: keyof WebsiteCMSContent, data: any) => void;
  updateLegalPolicy: (key: keyof WebsiteCMSContent['legalPages'], data: Partial<LegalPolicy>) => void;

  // Reviews
  reviews: Testimonial[];
  addReview: (review: Omit<Testimonial, 'id'>) => void;
  updateReview: (id: string, reviewData: Partial<Testimonial>) => void;
  deleteReview: (id: string) => void;
  toggleReviewStatus: (id: string) => void;

  // Global Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Reset demo data
  resetAllData: () => void;
}

const DEFAULT_LABELS: AdminLabel[] = [
  { id: 'label-1', name: 'New Arrival', color: '#1E293B' },
  { id: 'label-2', name: 'Best Seller', color: '#C4A468' },
  { id: 'label-3', name: 'Sale', color: '#E11D48' },
  { id: 'label-4', name: 'Limited Edition', color: '#631D27' },
  { id: 'label-5', name: 'Festive Collection', color: '#7C3AED' },
];

const DEFAULT_ORDERS: AdminOrder[] = [
  {
    id: 'ord-1',
    orderNumber: '#ORD-2041',
    date: '2026-09-21 14:32',
    customer: {
      name: 'Sumaiya Rahman',
      email: 'sumaiya.r@gmail.com',
      phone: '01711223344',
      address: 'House 12, Road 5, Dhanmondi',
      city: 'Dhaka',
      notes: 'Please deliver after 3 PM',
    },
    items: [
      {
        productId: 'maroon-lace-hijab',
        name: 'Maroon Lace hijab',
        image: PRODUCTS[1]?.image || '',
        size: 'Standard',
        color: 'Rich Maroon',
        quantity: 1,
        priceBDT: 500,
      },
    ],
    subtotalBDT: 500,
    shippingBDT: 70,
    totalBDT: 570,
    paymentMethod: 'bkash',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Delivered',
    internalNotes: 'VIP customer. Requested discrete packaging.',
    courier: {
      provider: 'Pathao',
      trackingId: 'PTH-8894201',
      consignmentId: 'AFW-CN-2041',
      shippedAt: '2026-09-21 16:00',
    },
  },
  {
    id: 'ord-2',
    orderNumber: '#ORD-2042',
    date: '2026-09-21 18:15',
    customer: {
      name: 'Farhana Ahmed',
      email: 'farhana.a@hotmail.com',
      phone: '01822334455',
      address: 'Apt 4B, Gulshan 2',
      city: 'Dhaka',
    },
    items: [
      {
        productId: 'the-silhouette-cap',
        name: 'The Silhouette Cap',
        image: PRODUCTS[0]?.image || '',
        size: 'One Size',
        color: 'Navy Blue',
        quantity: 1,
        priceBDT: 490,
      },
      {
        productId: 'east-west-bag',
        name: 'Y2K Vintage East-West Bag',
        image: PRODUCTS[4]?.image || '',
        size: 'One Size',
        color: 'Olive Washed & Espresso',
        quantity: 1,
        priceBDT: 3450,
      },
    ],
    subtotalBDT: 3940,
    shippingBDT: 70,
    totalBDT: 4010,
    paymentMethod: 'nagad',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Shipped',
    courier: {
      provider: 'Steadfast',
      trackingId: 'STF-592810',
      consignmentId: 'AFW-CN-2042',
      shippedAt: '2026-09-22 11:30',
    },
  },
  {
    id: 'ord-3',
    orderNumber: '#ORD-2043',
    date: '2026-09-22 09:20',
    customer: {
      name: 'Nusrat Jahan',
      email: 'nusrat.jahan@gmail.com',
      phone: '01933445566',
      address: 'House 45, Sector 7, Uttara',
      city: 'Dhaka',
      notes: 'Call before delivery',
    },
    items: [
      {
        productId: 'maroon-lace-hijab',
        name: 'Maroon Lace hijab',
        image: PRODUCTS[1]?.image || '',
        size: 'Maxi',
        color: 'Rich Maroon',
        quantity: 2,
        priceBDT: 500,
      },
    ],
    subtotalBDT: 1000,
    shippingBDT: 70,
    totalBDT: 1070,
    paymentMethod: 'cod',
    paymentStatus: 'Pending',
    fulfillmentStatus: 'Processing',
  },
  {
    id: 'ord-4',
    orderNumber: '#ORD-2044',
    date: '2026-09-22 10:45',
    customer: {
      name: 'Sadia Karim',
      email: 'sadia.k@outlook.com',
      phone: '01644556677',
      address: 'GEC Circle, Nasirabad',
      city: 'Chittagong',
    },
    items: [
      {
        productId: 'white-black-lace-hijab',
        name: 'White & Black Lace Hijab',
        image: PRODUCTS[2]?.image || '',
        size: 'Standard',
        color: 'Ivory White',
        quantity: 1,
        priceBDT: 500,
      },
    ],
    subtotalBDT: 500,
    shippingBDT: 130,
    totalBDT: 630,
    paymentMethod: 'bkash',
    paymentStatus: 'Verification Needed',
    fulfillmentStatus: 'Processing',
    paymentDetails: {
      method: 'bkash',
      senderNumber: '01644556677',
      trxId: 'BL8A92K1',
      paidAmount: 630,
      paymentDate: '2026-09-22',
      merchantNumber: '01792208949',
    },
  },
];

const DEFAULT_CMS: WebsiteCMSContent = {
  hero: {
    headline: 'Step Into Luxury',
    subheadline: 'Artisanal hijabs, bespoke abayas, and vintage silhouettes curated with timeless London sophistication.',
    buttonText: 'Shop Now',
    buttonLink: 'shop',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1600',
  },
  categoryGrid: {
    slot1: {
      title: 'Abayas & Kaftans',
      image: 'https://i.ibb.co/4gmzbf8y/Premium-Heavy-Stone-Work-Abaya-1.jpg',
      link: 'abayas',
    },
    slot2: {
      title: 'Modest Maxi Dresses',
      image: 'https://i.ibb.co/bRCb3TDG/Dusty-Mauve-Modest-Maxi.jpg',
      link: 'dresses',
    },
    slot3: {
      title: 'Tops & Co-Ord Sets',
      image: 'https://i.ibb.co/DDs9bKNd/Floral-Co-Ord-Set-1.jpg',
      link: 'kurtis',
    },
    slot4: {
      title: 'Accessories & Bags',
      image: 'https://i.ibb.co/zHTdbnw3/ladies-handbag-1.jpg',
      link: 'bag',
    },
  },
  editorialBanner: {
    headline: 'The Heritage Edition',
    subheadline: 'Hand-embellished stonework, ethereal georgette, and modern modesty designed for life’s grandest moments.',
    buttonText: 'Explore Collection',
    buttonLink: 'shop',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600',
  },
  newsletter: {
    headline: 'Join the Atelier Circle',
    subheadline: 'Receive early access to seasonal drops, private runway previews, and exclusive VIP styling invitations.',
    buttonText: 'Subscribe',
  },
  legalPages: {
    returnPolicy: {
      title: 'Return & Exchange Policy',
      lastUpdated: 'September 2026',
      content: `At AFW Atelier, we pride ourselves on exceptional craftsmanship and client satisfaction. If you are not completely delighted with your purchase, we gladly accept returns and exchanges under the following terms:

1. Timeframe: Items may be returned or exchanged within 7 days of delivery receipt.
2. Condition: Garments must be unworn, unwashed, and with all original designer tags and security ribbons attached in original packaging.
3. Exceptions: Due to hygiene considerations, custom altered garments, bespoke embroidery, and sale items are final sale.
4. Process: Contact our Dhaka concierge via WhatsApp (+880 1792-208949) with your Order ID (#ORD-XXXX). Our courier will schedule a home pickup within 48 hours.
5. Refunds: Approved returns will be refunded via your original payment method (bKash/Nagad/Bank Transfer) within 3-5 business days of inspection.`,
    },
    privacyPolicy: {
      title: 'Privacy Policy',
      lastUpdated: 'September 2026',
      content: `AFW Atelier is committed to protecting your personal information and privacy.

1. Information We Collect: We collect your name, delivery address, contact phone number, and transaction references necessary to process orders and deliver shipments across Bangladesh.
2. Usage: Your information is used exclusively for order fulfillment, courier dispatch via Pathao/Steadfast, and customer support. We never sell, rent, or trade customer data to third parties.
3. Security: All online payments are securely processed through official Bangladesh MFS channels (bKash / Nagad). We never store credit card or MFS PIN numbers.
4. Updates: You may request review or deletion of your stored customer records at any time by contacting atelier@afwluxe.com.`,
    },
    termsOfService: {
      title: 'Terms of Service',
      lastUpdated: 'September 2026',
      content: `Welcome to AFW Atelier. By browsing our collections and placing orders, you agree to the following terms:

1. Orders & Pricing: All prices are listed in Bangladeshi Taka (৳). While we strive for absolute accuracy, errors may occur. In the event of a mispriced piece, we reserve the right to cancel or amend the order prior to dispatch.
2. Inventory & Stock: Due to the bespoke, limited-run nature of our collections, items in high demand may sell out quickly. Placing an item in checkout temporarily reserves the stock for 10 minutes.
3. Delivery: Delivery inside Dhaka is typically fulfilled within 1-2 business days; nationwide outside Dhaka delivery takes 3-5 business days.
4. Fabric Care: Please follow the garment care instructions outlined on each product label to preserve the delicate stonework, lace, and bespoke fabric weaves.`,
    },
    shippingPolicy: {
      title: 'Shipping & Delivery Information',
      lastUpdated: 'September 2026',
      content: `AFW Atelier provides door-to-door delivery across all 64 districts of Bangladesh.

• Inside Dhaka Metropolitan: ৳70 flat delivery fee. Estimated delivery: 24 - 48 hours.
• Outside Dhaka Region: ৳130 flat delivery fee. Estimated delivery: 3 - 5 business days via Pathao, Steadfast, or RedX.
• Tracking: Every dispatched order is assigned a real-time consignment tracking number. Customers receive an SMS notification with the tracking link once handed over to the courier.
• Cash on Delivery (COD): Available nationwide with package inspection upon delivery.`,
    },
  },
};

const AdminDataContext = createContext<AdminContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PRODUCTS = 'afw_admin_products_v3';
const LOCAL_STORAGE_KEY_CATEGORIES = 'afw_admin_categories_v3';
const LOCAL_STORAGE_KEY_LABELS = 'afw_admin_labels_v3';
const LOCAL_STORAGE_KEY_ORDERS = 'afw_admin_orders_v3';
const LOCAL_STORAGE_KEY_CMS = 'afw_admin_cms_v3';
const LOCAL_STORAGE_KEY_REVIEWS = 'afw_admin_reviews_v3';
const LOCAL_STORAGE_KEY_LOCKS = 'afw_admin_locks_v3';
const LOCAL_STORAGE_KEY_STOCK_ALERTS = 'afw_admin_stock_alerts_v3';

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading products from storage', e);
    }
    return PRODUCTS.map((p) => {
      const priceBDT = p.priceBDT || p.price * 27;
      const costPriceBDT = p.costPriceBDT || Math.round(priceBDT * 0.55);
      const isSizeAgnostic = ['hijab', 'bag', 'rings', 'accessories'].includes(p.category);
      return {
        ...p,
        costPriceBDT,
        showSizeGuide: p.showSizeGuide !== undefined ? p.showSizeGuide : !isSizeAgnostic,
        status: p.status || 'active',
        labels: p.labels || [
          ...(p.isNew ? ['New Arrival'] : []),
          ...(p.isBestseller ? ['Best Seller'] : []),
        ],
        slug: p.slug || generateSlug(p.name),
        variantStock: p.variantStock || {},
      };
    });
  });

  // Categories
  const [categories, setCategories] = useState<CategoryCardData[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading categories from storage', e);
    }
    return CATEGORIES.map((c) => ({
      ...c,
      slug: c.slug || generateSlug(c.title),
    }));
  });

  // Labels
  const [labels, setLabels] = useState<AdminLabel[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LABELS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading labels from storage', e);
    }
    return DEFAULT_LABELS;
  });

  // Orders
  const [orders, setOrders] = useState<AdminOrder[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading orders from storage', e);
    }
    return DEFAULT_ORDERS;
  });

  // CMS Content
  const [cmsContent, setCmsContent] = useState<WebsiteCMSContent>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure legalPages exists
        if (!parsed.legalPages) {
          parsed.legalPages = DEFAULT_CMS.legalPages;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading CMS content from storage', e);
    }
    return DEFAULT_CMS;
  });

  // Reviews
  const [reviews, setReviews] = useState<Testimonial[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REVIEWS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading reviews from storage', e);
    }
    return TESTIMONIALS.map((t, idx) => ({
      ...t,
      status: 'published',
      date: `2026-09-${15 + idx}`,
    }));
  });

  // Inventory Locks (10 minutes race condition guard)
  const [inventoryLocks, setInventoryLocks] = useState<InventoryLock[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LOCKS);
      if (saved) {
        const parsed: InventoryLock[] = JSON.parse(saved);
        const now = Date.now();
        return parsed.filter((lock) => lock.lockedUntil > now);
      }
    } catch (e) {
      console.error('Error loading locks', e);
    }
    return [];
  });

  // Back in stock notification subscribers
  const [backInStockAlerts, setBackInStockAlerts] = useState<
    { id: string; email: string; productId: string; productName: string; date: string }[]
  >(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STOCK_ALERTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading stock alerts', e);
    }
    return [];
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LABELS, JSON.stringify(labels));
  }, [labels]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CMS, JSON.stringify(cmsContent));
  }, [cmsContent]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOCKS, JSON.stringify(inventoryLocks));
  }, [inventoryLocks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STOCK_ALERTS, JSON.stringify(backInStockAlerts));
  }, [backInStockAlerts]);

  // Periodic cleanup of expired inventory locks every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setInventoryLocks((prev) => prev.filter((l) => l.lockedUntil > now));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute Total Sales
  const totalSales = orders.reduce((sum, o) => {
    if (o.fulfillmentStatus === 'Cancelled') return sum;
    return sum + (o.paymentStatus === 'Paid' || o.fulfillmentStatus === 'Delivered' || o.fulfillmentStatus === 'Shipped' ? o.totalBDT : 0);
  }, 0);

  // Compute Total Profit = (Selling Price - Cost Price) of items in paid/fulfilled orders
  const totalProfit = orders.reduce((sum, order) => {
    if (order.fulfillmentStatus === 'Cancelled' || order.fulfillmentStatus === 'Returned') return sum;
    if (order.paymentStatus !== 'Paid' && order.fulfillmentStatus !== 'Delivered' && order.fulfillmentStatus !== 'Shipped') {
      return sum;
    }
    const orderItemsProfit = order.items.reduce((itemSum, it) => {
      const prod = products.find((p) => p.id === it.productId);
      const costPrice = prod?.costPriceBDT ?? Math.round(it.priceBDT * 0.55);
      const profitPerItem = Math.max(0, it.priceBDT - costPrice);
      return itemSum + profitPerItem * it.quantity;
    }, 0);
    return sum + orderItemsProfit;
  }, 0);

  // Products CRUD
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newId = `prod-${Date.now()}`;
    const priceBDT = productData.priceBDT || productData.price * 27;
    const costPriceBDT = productData.costPriceBDT || Math.round(priceBDT * 0.55);
    const isSizeAgnostic = ['hijab', 'bag', 'rings', 'accessories'].includes(productData.category);

    const newProduct: Product = {
      ...productData,
      id: newId,
      priceBDT,
      costPriceBDT,
      slug: productData.slug || generateSlug(productData.name),
      status: productData.status || 'active',
      rating: productData.rating || 5.0,
      reviewsCount: productData.reviewsCount || 0,
      inStock: productData.stockCount !== undefined ? productData.stockCount > 0 : true,
      showSizeGuide: productData.showSizeGuide !== undefined ? productData.showSizeGuide : !isSizeAgnostic,
      variantStock: productData.variantStock || {},
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('Product added successfully');
    return newProduct;
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...productData };
        if (productData.name && !productData.slug) {
          updated.slug = generateSlug(productData.name);
        }
        if (updated.stockCount !== undefined) {
          updated.inStock = updated.stockCount > 0;
        }
        return updated;
      })
    );
    showToast('Product updated successfully');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed');
  };

  // Bulk Product Actions
  const bulkDeleteProducts = (ids: string[]) => {
    if (ids.length === 0) return;
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    showToast(`Removed ${ids.length} products`);
  };

  const bulkUpdateProductStatus = (ids: string[], status: 'active' | 'draft') => {
    if (ids.length === 0) return;
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status } : p))
    );
    showToast(`Updated ${ids.length} products to ${status}`);
  };

  const bulkUpdateProductCategory = (
    ids: string[],
    category: ProductCategory,
    categoryLabel: string
  ) => {
    if (ids.length === 0) return;
    setProducts((prev) =>
      prev.map((p) =>
        ids.includes(p.id) ? { ...p, category, categoryLabel } : p
      )
    );
    showToast(`Changed category for ${ids.length} products`);
  };

  // Categories CRUD
  const addCategory = (categoryData: Omit<CategoryCardData, 'id' | 'itemCount'>): CategoryCardData => {
    const newId = generateSlug(categoryData.title);
    const newCat: CategoryCardData = {
      ...categoryData,
      id: newId,
      itemCount: 0,
      slug: `/category/${newId}`,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast('Category created');
    return newCat;
  };

  const updateCategory = (id: string, categoryData: Partial<CategoryCardData>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...categoryData } : c))
    );
    showToast('Category updated');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category removed');
  };

  // Labels CRUD
  const addLabel = (name: string, color = '#1E293B') => {
    if (!name.trim()) return;
    const newLabel: AdminLabel = {
      id: `label-${Date.now()}`,
      name: name.trim(),
      color,
    };
    setLabels((prev) => [...prev, newLabel]);
    showToast(`Label "${name}" added`);
  };

  const deleteLabel = (id: string) => {
    setLabels((prev) => prev.filter((l) => l.id !== id));
    showToast('Label removed');
  };

  // Helper to return items to inventory upon cancellation/return
  const restoreStockForOrder = (order: AdminOrder) => {
    setProducts((prevProds) => {
      return prevProds.map((prod) => {
        const orderItem = order.items.find((i) => i.productId === prod.id);
        if (!orderItem) return prod;

        const updatedStock = (prod.stockCount ?? 10) + orderItem.quantity;
        const updatedVariantStock = { ...(prod.variantStock || {}) };
        const variantKey = `${orderItem.color}_${orderItem.size}`;
        if (updatedVariantStock[variantKey] !== undefined) {
          updatedVariantStock[variantKey] += orderItem.quantity;
        }

        return {
          ...prod,
          stockCount: updatedStock,
          inStock: updatedStock > 0,
          variantStock: updatedVariantStock,
        };
      });
    });
  };

  // Orders CRUD
  const addOrder = (orderData: Omit<AdminOrder, 'id' | 'orderNumber' | 'date'>): AdminOrder => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: AdminOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `#ORD-${randomSuffix}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    // Deduct stock for items placed in this order
    setProducts((prevProds) => {
      return prevProds.map((prod) => {
        const orderItem = orderData.items.find((i) => i.productId === prod.id);
        if (!orderItem) return prod;

        const updatedStock = Math.max(0, (prod.stockCount ?? 10) - orderItem.quantity);
        const updatedVariantStock = { ...(prod.variantStock || {}) };
        const variantKey = `${orderItem.color}_${orderItem.size}`;
        if (updatedVariantStock[variantKey] !== undefined) {
          updatedVariantStock[variantKey] = Math.max(0, updatedVariantStock[variantKey] - orderItem.quantity);
        }

        return {
          ...prod,
          stockCount: updatedStock,
          inStock: updatedStock > 0,
          variantStock: updatedVariantStock,
        };
      });
    });

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = (orderId: string, updatedOrder: Partial<AdminOrder>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updatedOrder } : o))
    );
    showToast('Order details updated');
  };

  const updateOrderFulfillment = (orderId: string, status: AdminOrder['fulfillmentStatus']) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        // If status changed to Cancelled or Returned, automatically return inventory
        if (
          (status === 'Cancelled' || status === 'Returned') &&
          o.fulfillmentStatus !== 'Cancelled' &&
          o.fulfillmentStatus !== 'Returned'
        ) {
          restoreStockForOrder(o);
          showToast(`Order marked as ${status}. Items restored to stock!`);
        } else {
          showToast(`Order status updated to ${status}`);
        }
        return { ...o, fulfillmentStatus: status };
      })
    );
  };

  const updateOrderPayment = (orderId: string, status: AdminOrder['paymentStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: status } : o))
    );
    showToast(`Payment marked as ${status}`);
  };

  // Courier Dispatch Integration (Pathao, Steadfast, RedX)
  const shipOrderWithCourier = (
    orderId: string,
    provider: 'Pathao' | 'Steadfast' | 'RedX'
  ) => {
    const prefix = provider === 'Pathao' ? 'PTH' : provider === 'Steadfast' ? 'STF' : 'RDX';
    const trackingId = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    const consignmentId = `AFW-CN-${Date.now().toString().slice(-6)}`;
    const shippedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const courierDetails = {
      provider,
      trackingId,
      consignmentId,
      shippedAt,
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              fulfillmentStatus: 'Shipped',
              courier: courierDetails,
            }
          : o
      )
    );
    showToast(`Dispatched via ${provider}! Tracking: ${trackingId}`);
    return { trackingId, consignmentId };
  };

  // Inventory Locking (10-minute hold on checkout)
  const lockInventory = (items: CartItem[]): { success: boolean; errorItemName?: string } => {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    // Check availability
    for (const item of items) {
      const prod = products.find((p) => p.id === item.product.id);
      if (!prod || prod.inStock === false || (prod.stockCount ?? 0) <= 0) {
        return { success: false, errorItemName: item.product.name };
      }

      // Check variant stock if specified
      if (item.selectedColor && item.selectedSize && prod.variantStock) {
        const vKey = `${item.selectedColor}_${item.selectedSize}`;
        if (prod.variantStock[vKey] !== undefined && prod.variantStock[vKey] < item.quantity) {
          return { success: false, errorItemName: `${item.product.name} (${item.selectedColor}, ${item.selectedSize})` };
        }
      }

      // Check existing active locks for other sessions
      const existingLocks = inventoryLocks.filter(
        (l) => l.productId === item.product.id && l.lockedUntil > now
      );
      const lockedQuantity = existingLocks.reduce((acc, l) => acc + l.quantity, 0);
      const availableStock = (prod.stockCount ?? 10) - lockedQuantity;
      if (availableStock < item.quantity) {
        return { success: false, errorItemName: item.product.name };
      }
    }

    // Create new locks
    const newLocks: InventoryLock[] = items.map((item) => ({
      id: `lock-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: item.product.id,
      productName: item.product.name,
      size: item.selectedSize || 'Standard',
      color: item.selectedColor || 'Default',
      quantity: item.quantity,
      lockedUntil: now + tenMinutes,
    }));

    setInventoryLocks((prev) => [...prev.filter((l) => l.lockedUntil > now), ...newLocks]);
    return { success: true };
  };

  const releaseInventoryLocks = (items?: CartItem[]) => {
    if (!items || items.length === 0) {
      setInventoryLocks([]);
      return;
    }
    const itemIds = items.map((i) => i.product.id);
    setInventoryLocks((prev) => prev.filter((l) => !itemIds.includes(l.productId)));
  };

  const isItemLocked = (productId: string, size?: string, color?: string): boolean => {
    const now = Date.now();
    const activeLocks = inventoryLocks.filter((l) => l.productId === productId && l.lockedUntil > now);
    if (activeLocks.length === 0) return false;

    const prod = products.find((p) => p.id === productId);
    const totalLocked = activeLocks.reduce((acc, l) => acc + l.quantity, 0);
    const totalStock = prod?.stockCount ?? 10;
    return totalStock - totalLocked <= 0;
  };

  // Back in stock notification subscription
  const subscribeBackInStock = (email: string, productId: string, productName: string) => {
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    const newAlert = {
      id: `alert-${Date.now()}`,
      email: email.trim(),
      productId,
      productName,
      date: new Date().toISOString().split('T')[0],
    };
    setBackInStockAlerts((prev) => [newAlert, ...prev]);
    showToast(`We will email ${email} when ${productName} is restocked!`);
  };

  // CMS Content
  const updateCMSContent = (section: keyof WebsiteCMSContent, data: any) => {
    setCmsContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }));
    showToast('Website content saved successfully');
  };

  const updateLegalPolicy = (
    key: keyof WebsiteCMSContent['legalPages'],
    data: Partial<LegalPolicy>
  ) => {
    setCmsContent((prev) => ({
      ...prev,
      legalPages: {
        ...prev.legalPages,
        [key]: {
          ...prev.legalPages[key],
          ...data,
          lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        },
      },
    }));
    showToast('Legal policy saved successfully');
  };

  // Reviews CRUD
  const addReview = (review: Omit<Testimonial, 'id'>) => {
    const newReview: Testimonial = {
      ...review,
      id: `rev-${Date.now()}`,
      status: review.status || 'published',
      date: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    showToast('Review added successfully');
  };

  const updateReview = (id: string, reviewData: Partial<Testimonial>) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...reviewData } : r))
    );
    showToast('Review updated');
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast('Review deleted');
  };

  const toggleReviewStatus = (id: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'published' ? 'hidden' : 'published' }
          : r
      )
    );
    showToast('Review visibility toggled');
  };

  const resetAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CATEGORIES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_LABELS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ORDERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CMS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_REVIEWS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_LOCKS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_STOCK_ALERTS);
    window.location.reload();
  };

  return (
    <AdminDataContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkDeleteProducts,
        bulkUpdateProductStatus,
        bulkUpdateProductCategory,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        labels,
        addLabel,
        deleteLabel,
        orders,
        addOrder,
        updateOrder,
        updateOrderFulfillment,
        updateOrderPayment,
        shipOrderWithCourier,
        totalProfit,
        totalSales,
        inventoryLocks,
        lockInventory,
        releaseInventoryLocks,
        isItemLocked,
        backInStockAlerts,
        subscribeBackInStock,
        cmsContent,
        updateCMSContent,
        updateLegalPolicy,
        reviews,
        addReview,
        updateReview,
        deleteReview,
        toggleReviewStatus,
        toastMessage,
        showToast,
        resetAllData,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
