import React, { useState, useEffect } from 'react';
import { PRODUCTS } from './data/products';
import { Product, CartItem } from './types';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { CategoryCards } from './components/CategoryCards';
import { NewArrivals } from './components/NewArrivals';
import { BrandStory } from './components/BrandStory';
import { Bestsellers } from './components/Bestsellers';
import { EditorialBanner } from './components/EditorialBanner';
import { Testimonials } from './components/Testimonials';
import { InstagramFeed } from './components/InstagramFeed';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { ShoppingCartPage } from './components/ShoppingCartPage';
import { WishlistDrawer } from './components/WishlistDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';
import { StoryModal } from './components/StoryModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { ShopPage } from './components/ShopPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CheckoutPage, OrderSuccessData } from './components/CheckoutPage';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminDataProvider, useAdminData } from './context/AdminDataContext';
import { TrackOrderModal } from './components/TrackOrderModal';
import { LegalPolicyModal } from './components/LegalPolicyModal';
import { CheckCircle2 } from 'lucide-react';

function StoreApp() {
  const { products, categories, reviews } = useAdminData();

  // Navigation view state: 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'admin'
  const [currentView, setCurrentView] = useState<
    'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'admin'
  >(() => {
    // Check if initial hash is #admin
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'admin';
    }
    return 'home';
  });

  // Listen to hash changes for #admin or #home
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '#shop') {
        setCurrentView('shop');
      } else if (window.location.hash === '#cart') {
        setCurrentView('cart');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Currently viewed product on dedicated product page
  const [activeProduct, setActiveProduct] = useState<Product>(() => products[0] || PRODUCTS[0]);

  // Initial products matching the user's attachment (Maroon Lace hijab & East-West Bag)
  const initialMaroonHijab = products.find((p) => p.id === 'maroon-lace-hijab') || products[0];
  const initialEastWestBag = products.find((p) => p.id === 'east-west-bag') || products[1];

  // Cart state - initialized with items matching the reference attachment
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: initialMaroonHijab,
      selectedColor: 'Rich Maroon',
      selectedSize: 'Standard',
      quantity: 1,
    },
    {
      product: initialEastWestBag,
      selectedColor: 'Olive Washed & Espresso',
      selectedSize: 'One Size',
      quantity: 1,
    },
  ]);

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(
    new Set([products[1]?.id || PRODUCTS[1].id])
  );

  // Selected Category filter for Catalog
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [activeLegalPolicyKey, setActiveLegalPolicyKey] = useState<
    'returnPolicy' | 'privacyPolicy' | 'termsOfService' | 'shippingPolicy' | null
  >(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [orderToast, setOrderToast] = useState<string | null>(null);

  // Cart Handlers
  const handleAddToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity }];
    });
    // Trigger toast notification
    setOrderToast(`Added ${quantity > 1 ? `${quantity}× ` : ''}${product.name} to your cart`);
    setTimeout(() => setOrderToast(null), 3000);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderInfo: OrderSuccessData) => {
    // Clear cart
    setCartItems([]);
    setOrderToast(`Order #${orderInfo.orderId} placed successfully!`);
    setTimeout(() => setOrderToast(null), 4000);
  };

  const handleToggleWishlist = (productOrId: Product | string) => {
    const id = typeof productOrId === 'string' ? productOrId : productOrId.id;
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Dedicated Product Page Handler
  const handleOpenProductDetail = (product: Product) => {
    setActiveProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated Shop Page Handler with Category Filter
  const handleNavigateToShop = (category: string = 'all') => {
    setSelectedCategory(category);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Home Handler
  const handleNavigateToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart page navigation
  const handleNavigateToCart = () => {
    setCurrentView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Buy Now immediate checkout
  const handleBuyNow = (product: Product, size: string, color: string, quantity: number = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity }];
    });
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to section helper (for home page anchors)
  const scrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    handleNavigateToShop(categoryId);
  };

  // If viewing admin panel, render the dedicated, distraction-free Admin Portal
  if (currentView === 'admin') {
    return <AdminPortal onViewWebsite={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF7] text-[#1C1C1C]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Header */}
      <Header
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlistIds.size}
        currentView={currentView}
        onOpenCart={handleNavigateToCart}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectCategory={handleSelectCategory}
        onOpenStory={() => setIsStoryModalOpen(true)}
        onScrollToSection={scrollToSection}
        onNavigateToShop={handleNavigateToShop}
        onNavigateToHome={handleNavigateToHome}
        onOpenAdmin={() => setCurrentView('admin')}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
      />

      {/* Main Flow: Switchable between Homepage, Dedicated Shop Page, Dedicated Product Page, Shopping Cart, and Checkout Page */}
      <main className="flex-1">
        {currentView === 'checkout' ? (
          <CheckoutPage
            items={cartItems}
            onBackToCart={handleNavigateToCart}
            onContinueShopping={() => handleNavigateToShop('all')}
            onOrderSuccess={handleOrderSuccess}
          />
        ) : currentView === 'cart' ? (
          <ShoppingCartPage
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveCartItem}
            onCheckout={handleCheckout}
            onContinueShopping={() => handleNavigateToShop('all')}
            onSelectProduct={handleOpenProductDetail}
          />
        ) : currentView === 'product-detail' ? (
          <ProductDetailPage
            product={activeProduct}
            allProducts={products}
            onBackToShop={handleNavigateToShop}
            onSelectProduct={handleOpenProductDetail}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlistIds.has(activeProduct.id)}
          />
        ) : currentView === 'shop' ? (
          <ShopPage
            products={products}
            onOpenProductDetail={handleOpenProductDetail}
            onQuickView={(p) => setQuickViewProduct(p)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            initialCategory={selectedCategory}
            onBackToHome={handleNavigateToHome}
          />
        ) : (
          <>
            {/* 3. Hero Section */}
            <Hero onShopNow={() => handleNavigateToShop('all')} />

            {/* 4. What's New Section */}
            <TrustBar onSelectCategory={handleSelectCategory} />

            {/* 5. Shop by Category */}
            <CategoryCards
              categories={categories}
              onSelectCategory={handleSelectCategory}
            />

            {/* 6. New Arrivals */}
            <NewArrivals
              products={products}
              onOpenProductDetail={handleOpenProductDetail}
              onQuickView={(p) => setQuickViewProduct(p)}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              onViewAll={() => handleNavigateToShop('all')}
            />

            {/* 7. Brand Story / London Design */}
            <BrandStory onOpenStoryModal={() => setIsStoryModalOpen(true)} />

            {/* 8. Bestsellers / Trending (Most Loved) */}
            <Bestsellers
              products={products}
              onOpenProductDetail={handleOpenProductDetail}
              onQuickView={(p) => setQuickViewProduct(p)}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
            />

            {/* 9. Editorial Banner (The Abaya Edit) */}
            <EditorialBanner
              onExploreAbayas={() => handleNavigateToShop('abayas')}
            />

            {/* 10. Testimonials */}
            <Testimonials />

            {/* 11. Instagram / UGC Feed */}
            <InstagramFeed />

            {/* 12. Newsletter */}
            <Newsletter />
          </>
        )}
      </main>

      {/* 13. Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenStory={() => setIsStoryModalOpen(true)}
        onOpenAdmin={() => setCurrentView('admin')}
        onOpenPolicy={(policyKey) => setActiveLegalPolicyKey(policyKey)}
      />

      {/* Slide-out Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={products.filter((p) => wishlistIds.has(p.id))}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlistIds.has(quickViewProduct.id) : false}
        onOpenProductPage={(p) => {
          setQuickViewProduct(null);
          handleOpenProductDetail(p);
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          setIsSearchOpen(false);
          handleOpenProductDetail(p);
        }}
      />

      {/* Brand Atelier Story Modal */}
      <StoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />

      {/* Customer Live Order Tracking Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      {/* Legal & Policy Modal (CMS synced) */}
      <LegalPolicyModal
        policyKey={activeLegalPolicyKey}
        onClose={() => setActiveLegalPolicyKey(null)}
      />

      {/* Floating Scroll To Top */}
      <ScrollToTopButton />

      {/* Notification Toast */}
      {orderToast && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#1C1C1C] text-[#FDFCF7] px-5 py-3 rounded-full shadow-2xl border border-[#C4A468]/50 flex items-center gap-3 animate-fade-in text-xs tracking-wider uppercase font-medium">
          <CheckCircle2 size={16} className="text-[#C4A468]" />
          <span>{orderToast}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AdminDataProvider>
      <StoreApp />
    </AdminDataProvider>
  );
}
