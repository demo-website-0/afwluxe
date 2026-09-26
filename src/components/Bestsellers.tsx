import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Flame, Star } from 'lucide-react';

interface BestsellersProps {
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: Set<string>;
}

export const Bestsellers: React.FC<BestsellersProps> = ({
  products,
  onOpenProductDetail,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
}) => {
  const bestsellerProducts = products.filter((p) => p.isBestseller).slice(0, 4);

  return (
    <section id="bestsellers" aria-labelledby="bestsellers-heading" className="py-12 sm:py-20 lg:py-28 bg-[#FDFCF7] scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F1E8] rounded-full border border-[#EFECE4] mb-2 sm:mb-3">
            <Flame size={12} className="text-[#C4A468]" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#5A6B5C] font-semibold">
              Community Favorites
            </span>
          </div>

          <h2 id="bestsellers-heading" className="text-2xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-semibold tracking-tight">
            Most Loved
          </h2>

          <p className="text-xs sm:text-sm text-[#6B605B] font-normal mt-1.5 tracking-normal">
            The signature pieces our community can’t stop wearing
          </p>

          <div className="w-12 h-[2px] bg-[#B2948C] mx-auto mt-3 sm:mt-4" />
        </div>

        {/* 2-Column Mobile, 4-Column Desktop Bestseller Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {bestsellerProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenProductDetail={onOpenProductDetail}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlistIds.has(product.id)}
            />
          ))}
        </div>

        {/* Social Proof Strip - 1 single unified row across all screen sizes */}
        <div className="mt-8 sm:mt-14 pt-5 sm:pt-8 border-t border-[#EFECE4] flex flex-row items-center justify-center gap-2 sm:gap-6 text-[10px] sm:text-xs text-[#6B605B] font-normal text-center whitespace-nowrap">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div className="flex text-[#C4A468]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} fill="#C4A468" className="sm:w-[13px] sm:h-[13px]" />
              ))}
            </div>
            <span><strong className="font-semibold text-[#1C1C1C]">4.9 / 5.0</strong> Rating</span>
          </div>

          <span className="text-[#D8D2C6] select-none shrink-0">•</span>

          <div className="shrink-0">
            <strong className="font-semibold text-[#1C1C1C]">10,000+</strong> Clients
          </div>

          <span className="text-[#D8D2C6] select-none shrink-0">•</span>

          <div className="shrink-0">
            <strong className="font-semibold text-[#1C1C1C]">100%</strong> Modest Cut
          </div>
        </div>
      </div>
    </section>
  );
};
