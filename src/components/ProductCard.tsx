import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { getProductPriceBDT, getProductOriginalPriceBDT, formatTaka } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  onOpenProductDetail?: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  onOpenProductDetail,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] || product.sizes[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedSize, selectedColor);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (onOpenProductDetail) {
          onOpenProductDetail(product);
        } else {
          onQuickView(product);
        }
      }}
    >
      {/* Image Container with 3:4 aspect ratio and rounded-2xl */}
      <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-[#FDFCF7] border border-[#EFECE4] shadow-[0_4px_16px_rgba(28,28,28,0.05)] transition-all duration-300 group-hover:shadow-[0_12px_28px_rgba(28,28,28,0.12)]">
        <img
          src={isHovered && product.secondaryImage ? product.secondaryImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center zoom-image"
          loading="lazy"
          decoding="async"
        />

        {/* Badges: Heritage Sage for seasonal tags / Antique Glint for Bestseller */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="bg-[#5A6B5C] text-white text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 font-semibold rounded-full shadow-xs">
              New In
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-[#C4A468] text-[#1C1C1C] text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 font-bold rounded-full shadow-xs">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-toggle-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-3 right-3 p-2 bg-[#FDFCF7]/95 hover:bg-white text-[#1C1C1C] rounded-full shadow-xs transition-colors z-10 cursor-pointer border border-[#EFECE4]"
        >
          <Heart
            size={16}
            className={isWishlisted ? 'fill-[#B2948C] text-[#B2948C]' : 'text-[#1C1C1C]/60'}
          />
        </button>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          aria-label={`Quick view ${product.name}`}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#FDFCF7]/95 hover:bg-[#C4A468] text-[#1C1C1C] text-[11px] uppercase tracking-[0.14em] px-4 py-2 rounded-full border border-[#EFECE4] shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5 cursor-pointer z-10 whitespace-nowrap font-medium"
        >
          <Eye size={13} className="text-[#1C1C1C]" />
          <span>Quick View</span>
        </button>

        {/* Quick Add Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#1C1C1C]/90 via-[#1C1C1C]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
          <button
            onClick={handleQuickAdd}
            className={`w-full py-2.5 px-3 text-xs uppercase tracking-[0.12em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer rounded-full shadow-md ${
              justAdded
                ? 'bg-[#1C1C1C] text-[#FDFCF7]'
                : 'bg-[#C4A468] hover:bg-[#B39255] text-[#1C1C1C] hover:text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check size={14} />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Quick Add • {selectedSize}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="pt-3.5 pb-1 flex flex-col flex-1">
        {/* Color Swatches */}
        <div className="flex items-center gap-1.5 mb-2">
          {product.colors.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColor(c.name);
              }}
              style={{ backgroundColor: c.hex }}
              className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                selectedColor === c.name
                  ? 'ring-1 ring-offset-1 ring-[#C4A468] scale-110 border-transparent'
                  : 'border-[#1C1C1C]/20 hover:scale-105'
              }`}
            />
          ))}
          <span className="text-[10px] text-[#6B605B] ml-1 font-medium uppercase tracking-wider">
            {product.colors.length} {product.colors.length === 1 ? 'shade' : 'shades'}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="text-base sm:text-[17px] text-[#1C1C1C] font-semibold tracking-tight leading-snug group-hover:text-[#C4A468] transition-colors">
          {product.name}
        </h3>

        {/* Subtitle / Fabric notes */}
        <p className="text-xs text-[#B2948C] font-medium truncate mt-0.5">
          {product.subtitle}
        </p>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-[#1C1C1C] tracking-wide">
            {formatTaka(getProductPriceBDT(product))}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-[#6B605B]/60 line-through">
              {formatTaka(getProductOriginalPriceBDT(product)!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
