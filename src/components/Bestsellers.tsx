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
    <section id="bestsellers" aria-labelledby="bestsellers-heading" className="py-20 lg:py-28 bg-[#FDFCF7] scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F4F1E8] rounded-full border border-[#EFECE4] mb-3">
            <Flame size={12} className="text-[#C4A468]" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#5A6B5C] font-semibold">
              Community Favorites
            </span>
          </div>

          <h2 id="bestsellers-heading" className="text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-semibold tracking-tight">
            Most Loved
          </h2>

          <p className="text-xs sm:text-sm text-[#6B605B] font-normal mt-2 tracking-normal">
            The signature pieces our community can’t stop wearing
          </p>

          <div className="w-12 h-[2px] bg-[#B2948C] mx-auto mt-4" />
        </div>

        {/* Bestseller Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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

        {/* Social Proof Strip */}
        <div className="mt-14 pt-8 border-t border-[#EFECE4] flex flex-wrap items-center justify-center gap-8 text-xs text-[#6B605B] font-normal">
          <div className="flex items-center gap-2">
            <div className="flex text-[#C4A468]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} fill="#C4A468" />
              ))}
            </div>
            <span className="font-semibold text-[#1C1C1C]">4.9 / 5.0</span> Average Customer Rating
          </div>
          <span className="hidden sm:inline text-[#EFECE4]">•</span>
          <div>
            <span className="font-semibold text-[#1C1C1C]">10,000+</span> London & International Clients
          </div>
          <span className="hidden sm:inline text-[#EFECE4]">•</span>
          <div>
            <span className="font-semibold text-[#1C1C1C]">100%</span> Modest Cut Assurance
          </div>
        </div>
      </div>
    </section>
  );
};
