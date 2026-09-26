import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';

interface NewArrivalsProps {
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: Set<string>;
  onViewAll: () => void;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({
  products,
  onOpenProductDetail,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  onViewAll,
}) => {
  const displayProducts = products.slice(0, 8);

  return (
    <section id="new-arrivals" aria-labelledby="new-arrivals-heading" className="py-12 sm:py-20 lg:py-28 bg-[#FDFCF7] border-y border-[#EFECE4] scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-[#EFECE4] pb-4 sm:pb-6">
          <div>
            <h2 id="new-arrivals-heading" className="text-2xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-semibold tracking-tight">
              New Arrivals
            </h2>
            <p className="text-xs sm:text-sm text-[#6B605B] font-normal mt-1 tracking-normal">
              Fresh from our London studio • For Her
            </p>
          </div>

          {/* Just an arrow button to see the rest */}
          <div className="shrink-0">
            <button
              type="button"
              id="view-rest-arrow-btn"
              onClick={onViewAll}
              aria-label="See the rest of the collection"
              className="group flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#1C1C1C] hover:bg-[#C4A468] text-[#FDFCF7] hover:text-[#1C1C1C] text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm cursor-pointer active:scale-95"
            >
              <span>See All</span>
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* 2-Column on Mobile, 4-Column on Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {displayProducts.map((product) => (
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

        {/* View All Button */}
        <div className="mt-10 sm:mt-14 text-center">
          <button
            id="view-all-new-arrivals-btn"
            onClick={onViewAll}
            className="btn-luxury-secondary text-xs sm:text-sm py-3 px-6 sm:py-3.5 sm:px-8"
          >
            <span>Explore Collection</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
