import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Truck, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_LOGO } from '../constants/branding';
import { CartIcon } from './CartIcon';

interface HeaderProps {
  cartCount: number;
  wishlistCount?: number;
  currentView?: 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout';
  onOpenCart: () => void;
  onOpenWishlist?: () => void;
  onOpenSearch: () => void;
  onSelectCategory: (cat: string) => void;
  onOpenStory: () => void;
  onScrollToSection: (sectionId: string) => void;
  onNavigateToShop?: (cat?: string) => void;
  onNavigateToHome?: () => void;
  onOpenAdmin?: () => void;
  onOpenTrackOrder?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount = 0,
  currentView = 'home',
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onSelectCategory,
  onOpenStory,
  onScrollToSection,
  onNavigateToShop,
  onNavigateToHome,
  onOpenAdmin,
  onOpenTrackOrder,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    let ticking = false;
    let currentlyScrolled = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 35;
          if (scrolled !== currentlyScrolled) {
            currentlyScrolled = scrolled;
            setIsScrolled(scrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      label: 'Home',
      isActive: currentView === 'home',
      action: () => {
        if (onNavigateToHome) onNavigateToHome();
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      label: 'Shop',
      isActive: currentView === 'shop',
      action: () => {
        if (onNavigateToShop) onNavigateToShop('all');
      },
    },
    {
      label: 'Abayas & Kaftans',
      isActive: false,
      action: () => {
        if (onNavigateToShop) onNavigateToShop('abayas');
        else {
          onSelectCategory('abayas');
          onScrollToSection('shop-by-category');
        }
      },
    },
    {
      label: 'Modest Dresses',
      isActive: false,
      action: () => {
        if (onNavigateToShop) onNavigateToShop('dresses');
        else {
          onSelectCategory('dresses');
          onScrollToSection('shop-by-category');
        }
      },
    },
    {
      label: 'Accessories & Hijabs',
      isActive: false,
      action: () => {
        if (onNavigateToShop) onNavigateToShop('accessories');
        else {
          onSelectCategory('accessories');
          onScrollToSection('shop-by-category');
        }
      },
    },
    {
      label: 'About Us',
      isActive: false,
      action: () => {
        onOpenStory();
      },
    },
  ];

  return (
    <header
      id="main-header"
      className={`sticky top-0 z-30 transition-all duration-300 transform-gpu h-[54px] sm:h-16 lg:h-auto flex items-center ${
        isScrolled
          ? 'bg-[#FDFCF7]/98 backdrop-blur-xs shadow-[0_4px_20px_rgba(28,28,28,0.06)] border-b border-[#EFECE4] py-1.5 sm:py-2'
          : 'bg-[#FDFCF7] border-b border-[#EFECE4]/70 py-2 sm:py-2.5 lg:py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between w-full">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 -ml-1 text-[#1C1C1C] hover:text-[#C4A468] transition-colors cursor-pointer rounded-lg hover:bg-stone-100/60 active:scale-95 flex items-center justify-center"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>

          <a
            id="brand-logo"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateToHome) onNavigateToHome();
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center select-none py-0.5"
            aria-label="AFW LUXE London Homepage"
          >
            <img
              src={BRAND_LOGO.dark}
              alt={BRAND_LOGO.alt}
              className={`w-auto object-contain transition-all duration-200 group-hover:scale-105 drop-shadow-xs ${
                isScrolled ? 'h-8 sm:h-9 md:h-9.5' : 'h-9 sm:h-10 md:h-11'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = BRAND_LOGO.remoteUrl;
              }}
            />
          </a>
        </div>

        {/* Center: Desktop Navigation */}
        <nav id="desktop-nav" aria-label="Main Navigation" className="hidden lg:flex items-center space-x-5 xl:space-x-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              id={`nav-item-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
              onClick={item.action}
              className={`text-[13.5px] font-medium tracking-[-0.01em] transition-colors cursor-pointer py-1 whitespace-nowrap relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#C4A468] hover:after:w-full after:transition-all after:duration-200 ${
                item.isActive
                  ? 'text-[#C4A468] font-bold after:w-full'
                  : 'text-[#1C1C1C] hover:text-[#C4A468] after:w-0'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Track Order shortcut */}
          {onOpenTrackOrder && (
            <button
              id="track-order-nav-btn"
              onClick={onOpenTrackOrder}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-stone-300 hover:border-stone-800 text-[#1C1C1C] text-[11px] font-semibold transition-colors cursor-pointer"
              title="Track your live order status"
            >
              <Truck size={12} />
              <span>Track Order</span>
            </button>
          )}

          {/* Admin Dashboard shortcut */}
          {onOpenAdmin && (
            <button
              id="admin-dashboard-nav-btn"
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-[#C4A468] text-white hover:text-slate-900 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
              title="Access Admin Panel"
            >
              <span>Admin</span>
            </button>
          )}

          {/* Search Button */}
          <button
            id="search-open-btn"
            onClick={onOpenSearch}
            className="p-1.5 text-[#1C1C1C] hover:text-[#C4A468] transition-colors cursor-pointer relative"
            aria-label="Search collections"
          >
            <Search size={19} strokeWidth={1.5} />
          </button>

          {/* Cart Button */}
          <button
            id="cart-drawer-open-btn"
            onClick={onOpenCart}
            className="p-1.5 text-[#1C1C1C] hover:text-[#C4A468] transition-colors cursor-pointer relative flex items-center gap-1"
            aria-label={`Shopping cart, ${cartCount} items`}
          >
            <CartIcon size={19} />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#1C1C1C] text-[#FDFCF7] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold border border-[#FDFCF7]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Top Dropdown Slider Menu (Pops up from top on 3-bar slider button tap) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#1C1C1C]/60 z-50 lg:hidden backdrop-blur-xs"
            />
            <motion.aside
              id="header-top-slider-menu"
              aria-label="Navigation Menu"
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 right-0 bg-[#FDFCF7] z-50 lg:hidden shadow-2xl rounded-b-3xl border-b border-[#EFECE4] flex flex-col overflow-hidden"
            >
              {/* Header inside Top Slider: Logo + Close */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFECE4]">
                <img
                  src={BRAND_LOGO.dark}
                  alt={BRAND_LOGO.alt}
                  className="h-9 sm:h-10 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = BRAND_LOGO.remoteUrl;
                  }}
                />
                <button
                  type="button"
                  id="header-menu-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#F4F1E8] hover:bg-[#EFECE4] text-[#1C1C1C] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Exact 5 Clean Navigation Links */}
              <nav className="px-6 py-4 flex flex-col divide-y divide-[#EFECE4]/70">
                {/* 1. Home */}
                <button
                  type="button"
                  id="slider-nav-home"
                  onClick={() => {
                    if (onNavigateToHome) onNavigateToHome();
                    else window.scrollTo({ top: 0, behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                  className={`py-3.5 text-left text-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    currentView === 'home'
                      ? 'text-[#C4A468] font-bold'
                      : 'text-[#1C1C1C] hover:text-[#C4A468]'
                  }`}
                >
                  <span>Home</span>
                  <span className="text-xs text-[#C4A468]">→</span>
                </button>

                {/* 2. Shop */}
                <button
                  type="button"
                  id="slider-nav-shop"
                  onClick={() => {
                    if (onNavigateToShop) onNavigateToShop('all');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-3.5 text-left text-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    currentView === 'shop'
                      ? 'text-[#C4A468] font-bold'
                      : 'text-[#1C1C1C] hover:text-[#C4A468]'
                  }`}
                >
                  <span>Shop</span>
                  <span className="text-xs text-[#C4A468]">→</span>
                </button>

                {/* 3. Cart */}
                <button
                  type="button"
                  id="slider-nav-cart"
                  onClick={() => {
                    onOpenCart();
                    setMobileMenuOpen(false);
                  }}
                  className={`py-3.5 text-left text-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    currentView === 'cart'
                      ? 'text-[#C4A468] font-bold'
                      : 'text-[#1C1C1C] hover:text-[#C4A468]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="bg-[#1C1C1C] text-[#FDFCF7] text-xs font-bold px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-[#C4A468]">→</span>
                </button>

                {/* 4. Track Order */}
                {onOpenTrackOrder ? (
                  <button
                    type="button"
                    id="slider-nav-track-order"
                    onClick={() => {
                      onOpenTrackOrder();
                      setMobileMenuOpen(false);
                    }}
                    className="py-3.5 text-left text-lg font-medium text-[#1C1C1C] hover:text-[#C4A468] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Track Order</span>
                    <span className="text-xs text-[#C4A468]">→</span>
                  </button>
                ) : null}

                {/* 5. Our story */}
                <button
                  type="button"
                  id="slider-nav-our-story"
                  onClick={() => {
                    onOpenStory();
                    setMobileMenuOpen(false);
                  }}
                  className="py-3.5 text-left text-lg font-medium text-[#1C1C1C] hover:text-[#C4A468] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Our story</span>
                  <span className="text-xs text-[#C4A468]">→</span>
                </button>
              </nav>

              {/* Minimal Brand & Admin Footer */}
              <div className="px-6 py-3.5 bg-[#F8F6F0] border-t border-[#EFECE4] flex items-center justify-between text-xs text-[#6B605B]">
                <span className="text-[11px] tracking-wider uppercase">London Atelier • For Her</span>
                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="text-[11px] font-semibold text-slate-800 hover:text-[#C4A468] uppercase tracking-wider cursor-pointer"
                  >
                    Admin
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
