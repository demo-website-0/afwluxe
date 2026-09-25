import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Truck } from 'lucide-react';
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
  currentView = 'home',
  onOpenCart,
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
      className={`sticky top-0 z-30 transition-all duration-300 transform-gpu ${
        isScrolled
          ? 'bg-[#FDFCF7]/98 backdrop-blur-xs shadow-[0_4px_20px_rgba(28,28,28,0.06)] border-b border-[#EFECE4] py-3'
          : 'bg-[#FDFCF7] border-b border-[#EFECE4]/70 py-4 lg:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-4">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#1C1C1C] hover:text-[#C4A468] transition-colors cursor-pointer"
            aria-label="Open mobile navigation menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <a
            id="brand-logo"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateToHome) onNavigateToHome();
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center select-none py-1"
            aria-label="AFW LUXE London Homepage"
          >
            <img
              src={BRAND_LOGO.dark}
              alt={BRAND_LOGO.alt}
              className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
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
              className={`text-[14px] font-medium tracking-[-0.01em] transition-colors cursor-pointer py-1 whitespace-nowrap relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#C4A468] hover:after:w-full after:transition-all after:duration-200 ${
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
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Track Order shortcut */}
          {onOpenTrackOrder && (
            <button
              id="track-order-nav-btn"
              onClick={onOpenTrackOrder}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 hover:border-stone-800 text-[#1C1C1C] text-[11px] font-semibold transition-colors cursor-pointer"
              title="Track your live order status"
            >
              <Truck size={13} />
              <span>Track Order</span>
            </button>
          )}

          {/* Admin Dashboard shortcut */}
          {onOpenAdmin && (
            <button
              id="admin-dashboard-nav-btn"
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-[#C4A468] text-white hover:text-slate-900 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
              title="Access Admin Panel"
            >
              <span>Admin</span>
            </button>
          )}

          {/* Search Button */}
          <button
            id="search-open-btn"
            onClick={onOpenSearch}
            className="p-2 text-[#1C1C1C] hover:text-[#C4A468] transition-colors cursor-pointer relative"
            aria-label="Search collections"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>

          {/* Cart Button */}
          <button
            id="cart-drawer-open-btn"
            onClick={onOpenCart}
            className="p-2 text-[#1C1C1C] hover:text-[#C4A468] transition-colors cursor-pointer relative flex items-center gap-1"
            aria-label={`Shopping cart, ${cartCount} items`}
          >
            <CartIcon size={20} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#1C1C1C] text-[#FDFCF7] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold border border-[#FDFCF7]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#1C1C1C]/50 z-50 lg:hidden backdrop-blur-xs"
            />
            <motion.aside
              aria-label="Mobile Navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#FDFCF7] z-50 lg:hidden shadow-2xl flex flex-col justify-between p-6 border-r border-[#EFECE4]"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#EFECE4]">
                  <img
                    src={BRAND_LOGO.dark}
                    alt={BRAND_LOGO.alt}
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = BRAND_LOGO.remoteUrl;
                    }}
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-[#1C1C1C]/70 hover:text-[#C4A468] cursor-pointer"
                    aria-label="Close navigation"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="py-6 space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-3.5 px-2 text-[15px] font-medium tracking-[-0.01em] text-[#1C1C1C] hover:text-[#C4A468] border-b border-[#EFECE4]/70 flex items-center justify-between transition-colors"
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-[#C4A468]">→</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[#EFECE4] space-y-3">
                {onOpenTrackOrder && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenTrackOrder();
                    }}
                    className="w-full py-2.5 px-3 bg-white border border-stone-300 hover:bg-stone-100 text-[#1C1C1C] rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Truck size={14} />
                    <span>Track Your Order</span>
                  </button>
                )}
                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Store Admin Panel</span>
                  </button>
                )}
                <div className="text-[12px] text-[#6B605B] tracking-normal text-center font-normal">
                  Designed in London • For Her
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
