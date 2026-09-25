import React, { useState, useEffect } from 'react';
import {
  Minus,
  Plus,
  Heart,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Ruler,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { getProductPriceBDT, formatTaka } from '../utils/currency';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onBackToShop: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
  onBuyNow: (product: Product, size: string, color: string, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

const STANDARD_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBackToShop,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
}) => {
  // Gallery images collection (fallback to product image and secondary)
  const images = React.useMemo(() => {
    const list: string[] = [];
    if (product.galleryImages && product.galleryImages.length > 0) {
      list.push(...product.galleryImages);
    } else {
      if (product.image) list.push(product.image);
      if (product.secondaryImage && product.secondaryImage !== product.image) {
        list.push(product.secondaryImage);
      }
    }
    // Also include any variant color images not already in the list
    if (product.colors && product.colors.length > 0) {
      product.colors.forEach((col) => {
        if (col.image && !list.includes(col.image)) {
          list.push(col.image);
        }
      });
    }
    return list.length > 0 ? list : [product.image];
  }, [product]);

  const availableSizes = React.useMemo(() => {
    return product.sizes && product.sizes.length > 0 ? product.sizes : STANDARD_SIZES;
  }, [product.sizes]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Standard');
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'S'
  );
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Sync state if product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedColor(product.colors?.[0]?.name || 'Standard');
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'S');
    setQuantity(1);
    setIsDescriptionOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id, product.colors, product.sizes]);

  // Variant Image Swap: when color changes, swap main image if that color has a dedicated image
  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    const colorObj = product.colors?.find(
      (c) => c.name.toLowerCase() === colorName.toLowerCase()
    );
    if (colorObj?.image) {
      const idx = images.indexOf(colorObj.image);
      if (idx !== -1) {
        setActiveImageIndex(idx);
      }
    }
  };

  // Check inventory per variant (Color + Size combination)
  const currentVariantStock = React.useMemo(() => {
    if (product.variantStock && typeof product.variantStock === 'object') {
      const key1 = `${selectedColor}_${selectedSize}`;
      const key2 = `${selectedColor.toLowerCase()}_${selectedSize.toLowerCase()}`;
      for (const [k, val] of Object.entries(product.variantStock)) {
        if (k === key1 || k.toLowerCase() === key2) {
          return Number(val);
        }
      }
    }
    // Fallback if product.inStock is false
    if (product.inStock === false) return 0;
    return typeof product.stockCount === 'number' ? product.stockCount : 12;
  }, [product, selectedColor, selectedSize]);

  const isOutOfStock = currentVariantStock <= 0;

  // Conditional size guide check
  const shouldShowSizeGuide = React.useMemo(() => {
    if (typeof product.showSizeGuide === 'boolean') {
      return product.showSizeGuide;
    }
    // Hide for accessories, bags, hijabs, rings by default
    const cat = (product.category || '').toLowerCase();
    if (
      cat.includes('bag') ||
      cat.includes('hijab') ||
      cat.includes('ring') ||
      cat.includes('accessories') ||
      cat.includes('jewelry')
    ) {
      return false;
    }
    return true;
  }, [product.showSizeGuide, product.category]);

  // Formatted price with Bangladeshi Taka ৳ symbol (e.g. 4,884.00৳)
  const formattedPrice = React.useMemo(() => {
    return formatTaka(getProductPriceBDT(product), true);
  }, [product]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, currentVariantStock || 99)));
  };

  const handleAddToCartClick = () => {
    if (isOutOfStock) return;
    const sizeToUse = selectedSize || availableSizes[0] || 'Standard';
    const colorToUse = selectedColor || product.colors?.[0]?.name || 'Standard';
    onAddToCart(product, sizeToUse, colorToUse, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  const handleBuyNowClick = () => {
    if (isOutOfStock) return;
    const sizeToUse = selectedSize || availableSizes[0] || 'Standard';
    const colorToUse = selectedColor || product.colors?.[0]?.name || 'Standard';
    onBuyNow(product, sizeToUse, colorToUse, quantity);
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) return;
    setNotifySuccess(true);
    setTimeout(() => {
      setNotifySuccess(false);
      setIsNotifyModalOpen(false);
      setNotifyEmail('');
    }, 2500);
  };

  const handleClearSize = () => {
    setSelectedSize('');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Recommendation items: pull from manually configured related products or same category
  const recommendations = React.useMemo(() => {
    if (product.relatedProductIds && product.relatedProductIds.length > 0) {
      const manualMatches = allProducts.filter((p) =>
        product.relatedProductIds?.includes(p.id)
      );
      if (manualMatches.length > 0) {
        const filler = allProducts.filter(
          (p) =>
            p.id !== product.id &&
            !product.relatedProductIds?.includes(p.id) &&
            p.category === product.category
        );
        return [...manualMatches, ...filler].slice(0, 4);
      }
    }
    // Pull strictly from the same category first, never random
    const sameCategory = allProducts.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }
    const otherProducts = allProducts.filter(
      (p) => p.id !== product.id && p.category !== product.category
    );
    return [...sameCategory, ...otherProducts].slice(0, 4);
  }, [allProducts, product.id, product.category, product.relatedProductIds]);

  return (
    <div id="product-detail-page" className="min-h-screen bg-[#FDFCF7] text-[#1C1C1C] pb-24">
      {/* Top Navigation Bar: Minimal "— Back to shop" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button
            id="back-to-shop-btn"
            onClick={onBackToShop}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-normal text-stone-600 hover:text-[#1C1C1C] transition-colors cursor-pointer group"
          >
            <span className="text-stone-400 group-hover:text-[#1C1C1C] transition-colors">—</span>
            <span>Back to shop</span>
          </button>

          {/* Share Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 text-stone-500 hover:text-[#1C1C1C] rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer relative"
              title="Share product link"
            >
              <Share2 size={16} />
              {copiedLink && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-[#1C1C1C] text-white px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                  Link copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ================= LEFT COLUMN: IMAGES & THUMBNAILS ================= */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Main Stage Image */}
            <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] bg-[#F7F4EC] rounded-2xl overflow-hidden border border-[#EFECE4] shadow-[0_6px_24px_rgba(28,28,28,0.04)] flex items-center justify-center p-2 sm:p-4">
              <img
                src={images[activeImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-contain sm:object-cover rounded-xl transition-all duration-300"
              />

              {/* Wishlist Floating Button */}
              <button
                type="button"
                onClick={() => onToggleWishlist(product)}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white text-[#1C1C1C] rounded-full shadow-sm border border-stone-200/80 transition-all cursor-pointer z-10"
              >
                <Heart
                  size={18}
                  className={isWishlisted ? 'fill-[#B2948C] text-[#B2948C]' : 'text-stone-600'}
                />
              </button>
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                {images.map((img, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-20 sm:w-18 sm:h-22 rounded-xl overflow-hidden border transition-all cursor-pointer bg-[#F7F4EC] p-0.5 ${
                        isActive
                          ? 'border-[#1C1C1C] ring-1 ring-[#1C1C1C] shadow-xs'
                          : 'border-stone-300 hover:border-stone-500 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: EXACT MINIMAL USER-SPECIFIED LAYOUT ================= */}
          <div className="lg:col-span-6 flex flex-col pt-1">
            
            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#1C1C1C] mb-2">
              {product.name}
            </h1>

            {/* Price: Exact styling from attachment image (e.g. 4,884.00৳ in large display) */}
            <div className="mb-7">
              <span className="text-4xl sm:text-5xl font-medium tracking-tight text-[#1C1C1C]">
                {formattedPrice}
              </span>
            </div>

            {/* 1. COLOR SECTION */}
            <div className="mb-6">
              <div className="text-sm text-[#1C1C1C] mb-3">
                <span className="font-normal text-stone-700">Color</span>{' '}
                <span className="font-semibold text-[#1C1C1C] ml-1">{selectedColor}</span>
              </div>

              {/* Color Swatches: Circular buttons with active checkmark icon */}
              <div className="flex items-center gap-3">
                {product.colors && product.colors.length > 0 ? (
                  product.colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    const isLightColor =
                      c.hex.toLowerCase() === '#ffffff' ||
                      c.hex.toLowerCase() === '#fff' ||
                      c.hex.toLowerCase() === '#fce5c8' ||
                      c.hex.toLowerCase() === '#faf7f2' ||
                      c.hex.toLowerCase() === '#eae6dd';

                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleSelectColor(c.name)}
                        className={`relative w-10 h-10 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'border-2 border-[#1C1C1C] ring-1 ring-[#1C1C1C]'
                            : 'border-stone-300 hover:border-stone-400'
                        }`}
                        title={c.name}
                        aria-label={`Select color ${c.name}`}
                      >
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-transform shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && (
                            <Check
                              size={14}
                              strokeWidth={3}
                              className={isLightColor ? 'text-stone-900' : 'text-white drop-shadow-xs'}
                            />
                          )}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSelectColor('Peach')}
                      className={`relative w-10 h-10 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                        selectedColor === 'Peach'
                          ? 'border-2 border-[#1C1C1C] ring-1 ring-[#1C1C1C]'
                          : 'border-stone-300'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full bg-[#FCE5C8] flex items-center justify-center">
                        {selectedColor === 'Peach' && <Check size={14} strokeWidth={3} className="text-black" />}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectColor('Camel')}
                      className={`relative w-10 h-10 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                        selectedColor === 'Camel'
                          ? 'border-2 border-[#1C1C1C] ring-1 ring-[#1C1C1C]'
                          : 'border-stone-300'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full bg-[#D1A76F]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 2. SIZE SECTION: S, M, L, etc. with Conditional Size Guide and Clear button */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-[#1C1C1C]">
                  <span className="font-normal text-stone-700">Size</span>{' '}
                  <span className="font-semibold text-[#1C1C1C] ml-1">{selectedSize || 'None'}</span>
                </div>
                {/* CONDITIONAL SIZE GUIDE: Only show if enabled for apparel/clothing, hidden for bags/hijabs/accessories */}
                {shouldShowSizeGuide && (
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-sm font-normal text-[#1C1C1C] underline hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    Size guide
                  </button>
                )}
              </div>

              {/* Size Blocks */}
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {availableSizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[48px] h-11 px-3.5 text-sm font-medium transition-all cursor-pointer flex items-center justify-center rounded-lg ${
                        isSelected
                          ? 'bg-white border-2 border-[#1C1C1C] text-[#1C1C1C] shadow-xs font-semibold'
                          : 'bg-[#EDEDED] hover:bg-[#E2E2E2] text-[#1C1C1C] border border-transparent'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* Clear button in red with cross (as in reference image) */}
              {selectedSize && (
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={handleClearSize}
                    className="inline-flex items-center gap-1 text-xs text-[#E11D48] hover:text-[#BE123C] font-medium transition-colors cursor-pointer"
                  >
                    <X size={12} strokeWidth={2.5} />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>

            {/* Stock status indicator */}
            {isOutOfStock ? (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800">
                  Out of Stock ({selectedColor} / {selectedSize || 'Standard'})
                </span>
                <span className="text-[11px] text-amber-600">Variant unavailable</span>
              </div>
            ) : currentVariantStock <= 3 ? (
              <div className="mb-4 text-xs text-rose-600 font-medium">
                Only {currentVariantStock} left in stock for {selectedColor} ({selectedSize})!
              </div>
            ) : null}

            {/* 3. QUANTITY SECTION + ACTIONS (Exact match to attachment image) */}
            <div className="mb-7">
              <div className="text-sm font-normal text-stone-700 mb-2">
                Quantity
              </div>

              {/* Row with [ - 1 + ] stepper on left, solid black "+ Add to cart" or Out of stock on right */}
              <div className="flex items-stretch gap-3">
                {/* Stepper with grey fill matching attachment image */}
                <div className="inline-flex items-center justify-between bg-[#EDEDED] w-28 sm:w-32 px-3 py-3 select-none">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="text-stone-700 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-1 text-base font-light"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="text-sm font-normal text-[#1C1C1C]">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={isOutOfStock || quantity >= currentVariantStock}
                    className="text-stone-700 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-1 text-base font-light"
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* + Add to cart: Disabled or Out of Stock when stock is 0 */}
                {isOutOfStock ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 bg-stone-300 text-stone-600 text-sm sm:text-base font-medium py-3.5 px-6 flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>Out of Stock</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="pdp-add-to-cart-btn"
                    onClick={handleAddToCartClick}
                    className="flex-1 bg-[#000000] hover:bg-[#1C1C1C] text-white text-sm sm:text-base font-medium py-3.5 px-6 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    <span>+ Add to cart</span>
                  </button>
                )}
              </div>

              {/* Buy Now OR Notify Me When Back In Stock */}
              {isOutOfStock ? (
                <button
                  type="button"
                  onClick={() => setIsNotifyModalOpen(true)}
                  className="mt-3 w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-white text-sm sm:text-base font-medium transition-all cursor-pointer shadow-xs active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>Notify Me When Back In Stock</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="pdp-buy-now-btn"
                  onClick={handleBuyNowClick}
                  className="mt-3 w-full py-3.5 px-6 bg-white hover:bg-stone-50 text-[#1C1C1C] text-sm sm:text-base font-medium border border-stone-300 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  Buy Now
                </button>
              )}
            </div>

            {/* Added to cart toast alert */}
            <AnimatePresence>
              {addedToast && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-5 p-3 bg-[#FAF7F2] border border-[#EFECE4] rounded-lg flex items-center gap-2 text-xs text-[#1C1C1C]"
                >
                  <Check size={14} className="text-emerald-600" />
                  <span>
                    Added <strong>{quantity}× {product.name}</strong> ({selectedSize || 'Standard'}, {selectedColor}) to your cart.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ================= MINIMIZED DESCRIPTION ACCORDION ================= */}
            {/* User instruction: "there would be no detailes, only description, which would be minimize, after clicking it will pop out" */}
            <div className="pt-2 border-t border-[#EFECE4]">
              <button
                type="button"
                id="description-accordion-toggle"
                onClick={() => setIsDescriptionOpen((prev) => !prev)}
                className="w-full py-4 flex items-center justify-between text-left text-sm font-medium text-[#1C1C1C] hover:text-stone-700 transition-colors cursor-pointer group"
                aria-expanded={isDescriptionOpen}
              >
                <span className="font-semibold text-stone-900 tracking-tight">
                  Description
                </span>
                <span className="p-1 text-stone-500 group-hover:text-[#1C1C1C] transition-transform duration-200">
                  {isDescriptionOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              <AnimatePresence>
                {isDescriptionOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden pb-6 text-sm text-stone-600 leading-relaxed space-y-3"
                  >
                    <p>{product.description}</p>
                    {product.fabric && (
                      <p className="text-xs text-stone-500 pt-1">
                        <strong className="font-medium text-stone-800">Fabric:</strong> {product.fabric}
                      </p>
                    )}
                    {product.care && (
                      <p className="text-xs text-stone-500">
                        <strong className="font-medium text-stone-800">Care:</strong> {product.care}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* ================= SIZE GUIDE MODAL ================= */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="fixed inset-0 bg-[#1C1C1C]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-2xl border border-stone-200 p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
                <div className="flex items-center gap-2">
                  <Ruler size={18} className="text-[#C4A468]" />
                  <h3 className="text-lg font-semibold text-[#1C1C1C]">Size Guide</h3>
                </div>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-full transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500">
                      <th className="py-2 px-3 font-semibold">Size</th>
                      <th className="py-2 px-3 font-semibold">Bust (in)</th>
                      <th className="py-2 px-3 font-semibold">Waist (in)</th>
                      <th className="py-2 px-3 font-semibold">Length (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    <tr><td className="py-2 px-3 font-semibold">XXS</td><td className="py-2 px-3">30-32</td><td className="py-2 px-3">24-26</td><td className="py-2 px-3">52</td></tr>
                    <tr><td className="py-2 px-3 font-semibold">XS</td><td className="py-2 px-3">32-34</td><td className="py-2 px-3">26-28</td><td className="py-2 px-3">54</td></tr>
                    <tr><td className="py-2 px-3 font-semibold">S</td><td className="py-2 px-3">34-36</td><td className="py-2 px-3">28-30</td><td className="py-2 px-3">54</td></tr>
                    <tr><td className="py-2 px-3 font-semibold">M</td><td className="py-2 px-3">36-38</td><td className="py-2 px-3">30-32</td><td className="py-2 px-3">56</td></tr>
                    <tr><td className="py-2 px-3 font-semibold">L</td><td className="py-2 px-3">38-40</td><td className="py-2 px-3">32-34</td><td className="py-2 px-3">56</td></tr>
                    <tr><td className="py-2 px-3 font-semibold">XL</td><td className="py-2 px-3">40-42</td><td className="py-2 px-3">34-36</td><td className="py-2 px-3">58</td></tr>
                    <tr><td className="py-2 px-3 font-semibold">XXL</td><td className="py-2 px-3">42-44</td><td className="py-2 px-3">36-38</td><td className="py-2 px-3">58</td></tr>
                    <tr><td className="py-2 px-3 font-semibold">3XL</td><td className="py-2 px-3">44-48</td><td className="py-2 px-3">38-42</td><td className="py-2 px-3">60</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-5 text-right">
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="px-4 py-2 bg-[#1C1C1C] text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= NOTIFY ME WHEN BACK IN STOCK MODAL ================= */}
      <AnimatePresence>
        {isNotifyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotifyModalOpen(false)}
              className="fixed inset-0 bg-[#1C1C1C]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl border border-stone-200 p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Notify Me When Restocked</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {product.name} — {selectedColor} ({selectedSize || 'Standard'})
                  </p>
                </div>
                <button
                  onClick={() => setIsNotifyModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-full transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {notifySuccess ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <Check size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-800">You're on the priority list!</h4>
                  <p className="text-xs text-slate-600">
                    We'll email you immediately the moment this piece is crafted and restocked.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Enter your email address below. We'll send you an instant notification as soon as this item is available again.
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.name@example.com"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsNotifyModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Notify Me
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= BOTTOM SECTION: "YOU MAY ALSO LIKE" ================= */}
      {recommendations.length > 0 && (
        <section className="border-t border-[#EFECE4] pt-14 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-xs sm:text-[13px] tracking-[0.2em] font-semibold text-stone-800 uppercase mb-8">
              You May Also Like
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((rec) => {
                const recDisplayPrice = formatTaka(getProductPriceBDT(rec));
                return (
                  <div
                    key={rec.id}
                    id={`recommendation-card-${rec.id}`}
                    onClick={() => onSelectProduct(rec)}
                    className="group flex flex-col cursor-pointer transition-all duration-300"
                  >
                    <div className="relative aspect-[4/5] bg-[#EFECE4]/70 rounded-2xl overflow-hidden border border-[#EFECE4] shadow-[0_4px_16px_rgba(28,28,28,0.03)] group-hover:shadow-[0_10px_24px_rgba(28,28,28,0.08)] transition-all">
                      <img
                        src={rec.image}
                        alt={rec.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <div className="pt-3 pb-1">
                      <h4 className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-[#1C1C1C] group-hover:text-[#C4A468] transition-colors truncate">
                        {rec.name}
                      </h4>
                      <p className="text-xs sm:text-sm font-semibold text-stone-800 mt-1">
                        {recDisplayPrice}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
