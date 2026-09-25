import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShoppingBag, Heart, Check, Shield, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { BRAND_LOGO } from '../constants/branding';
import { getProductPriceBDT, getProductOriginalPriceBDT, formatTaka } from '../utils/currency';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onOpenProductPage?: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onOpenProductPage,
}) => {
  if (!product) return null;

  const productSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['Standard'];
  const productColors = product.colors && product.colors.length > 0 ? product.colors : [{ name: 'Default', hex: '#1C1C1C' }];

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState(productColors[0]?.name || 'Default');
  const [selectedSize, setSelectedSize] = useState(productSizes[0] || 'Standard');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      const pSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['Standard'];
      const pColors = product.colors && product.colors.length > 0 ? product.colors : [{ name: 'Default', hex: '#1C1C1C' }];
      setActiveImage(product.image);
      setSelectedColor(pColors[0]?.name || 'Default');
      setSelectedSize(pSizes[0] || 'Standard');
    }
  }, [product]);

  const allImages = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.image, ...(product.secondaryImage && product.secondaryImage !== product.image ? [product.secondaryImage] : [])];

  const handleAdd = () => {
    onAddToCart(product, selectedSize || productSizes[0], selectedColor || productColors[0]?.name);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1C1C1C]/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-3xl bg-[#FDFCF7] border border-[#EFECE4] shadow-[0_20px_60px_rgba(28,28,28,0.2)] rounded-3xl overflow-hidden z-10 my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 text-[#1C1C1C]/70 hover:text-[#C4A468] bg-[#FDFCF7]/80 rounded-full hover:bg-white transition-colors cursor-pointer"
              aria-label="Close product preview"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              {/* Left Column: Image Preview */}
              <div className="md:col-span-6 bg-[#F4F1E8] relative flex flex-col justify-between p-6">
                <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-[#FFFFFF] shadow-xs">
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                  />
                  {product.isBestseller && (
                    <span className="absolute top-3 left-3 bg-[#C4A468] text-[#1C1C1C] text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full font-bold shadow-xs">
                      Bestseller
                    </span>
                  )}
                </div>

                {/* Thumbnail switchers */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 mt-4 justify-center flex-wrap max-h-24 overflow-x-auto py-1">
                    {allImages.map((imgUrl, idx) => (
                      <button
                        key={`${product.id}-thumb-${idx}`}
                        id={`quickview-thumb-${idx}`}
                        type="button"
                        onClick={() => setActiveImage(imgUrl)}
                        className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          activeImage === imgUrl
                            ? 'border-[#C4A468] scale-105 shadow-xs'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Product Specs */}
              <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#6B605B] mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={BRAND_LOGO.dark}
                        alt={BRAND_LOGO.alt}
                        className="h-5 w-auto object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = BRAND_LOGO.remoteUrl;
                        }}
                      />
                      <span className="uppercase tracking-[0.18em] text-[#5A6B5C] font-semibold text-[10px]">
                        {product.categoryLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#C4A468]">
                      <Star size={13} fill="#C4A468" />
                      <span className="font-semibold text-[#1C1C1C]">{product.rating}</span>
                      <span className="text-[#6B605B]/60">({product.reviewsCount})</span>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl text-[#1C1C1C] font-semibold tracking-tight leading-tight">
                    {product.name}
                  </h2>

                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="text-xl font-semibold text-[#1C1C1C]">
                      {formatTaka(getProductPriceBDT(product))}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-[#6B605B]/60 line-through">
                        {formatTaka(getProductOriginalPriceBDT(product)!)}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-[#6B605B] font-light leading-relaxed">
                    {product.description}
                  </p>

                  {/* Color Selector */}
                  <div className="mt-5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="uppercase tracking-wider text-[#1C1C1C]/80">
                        Color: <span className="font-semibold text-[#1C1C1C]">{selectedColor}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {productColors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          title={c.name}
                          style={{ backgroundColor: c.hex }}
                          className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                            selectedColor === c.name
                              ? 'ring-2 ring-offset-2 ring-[#C4A468] scale-105'
                              : 'border-[#1C1C1C]/20 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="mt-5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="uppercase tracking-wider text-[#1C1C1C]/80">
                        Size: <span className="font-semibold text-[#1C1C1C]">{selectedSize}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productSizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1.5 text-xs text-center border transition-all cursor-pointer rounded-lg font-medium ${
                            selectedSize === sz
                              ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] font-semibold'
                              : 'bg-white text-[#1C1C1C] border-[#EFECE4] hover:border-[#1C1C1C]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fabric & Fit Details */}
                  <div className="mt-5 pt-4 border-t border-[#EFECE4] space-y-1.5 text-[11px] text-[#6B605B] font-normal">
                    <div>
                      <strong className="font-semibold text-[#1C1C1C]">Fabric:</strong> {product.fabric}
                    </div>
                    <div>
                      <strong className="font-semibold text-[#1C1C1C]">Fit:</strong> {product.fit}
                    </div>
                    <div>
                      <strong className="font-semibold text-[#1C1C1C]">Care:</strong> {product.care}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#EFECE4] space-y-2.5">
                  <div className="flex gap-3">
                    <button
                      onClick={handleAdd}
                      className={`flex-1 py-3.5 text-xs uppercase tracking-[0.14em] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-full shadow-md ${
                        added
                          ? 'bg-[#1C1C1C] text-[#FDFCF7]'
                          : 'bg-[#C4A468] hover:bg-[#B39255] text-[#1C1C1C] hover:text-white font-bold'
                      }`}
                    >
                      {added ? (
                        <>
                          <Check size={16} />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          <span>Add to Bag • {formatTaka(getProductPriceBDT(product))}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onToggleWishlist(product)}
                      className="p-3.5 border border-[#EFECE4] hover:border-[#C4A468] rounded-full text-[#1C1C1C] cursor-pointer bg-white"
                      title={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart
                        size={18}
                        className={isWishlisted ? 'fill-[#B2948C] text-[#B2948C]' : ''}
                      />
                    </button>
                  </div>

                  {onOpenProductPage && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenProductPage(product);
                      }}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-stone-700 hover:text-[#1C1C1C] bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#EFECE4] rounded-full transition-colors cursor-pointer text-center"
                    >
                      View Dedicated Product Page →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
