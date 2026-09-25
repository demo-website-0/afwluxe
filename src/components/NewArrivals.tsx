import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

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
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filterTabs = [
    { id: 'all', label: 'All New In' },
    { id: 'abayas', label: 'Abayas & Kaftans' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'kurtis', label: 'Tops & Co-Ords' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const filteredProducts = products
    .filter((p) => activeFilter === 'all' || p.category === activeFilter)
    .slice(0, 8);

  return (
    <section id="new-arrivals" aria-labelledby="new-arrivals-heading" className="py-20 lg:py-28 bg-[#FDFCF7] border-y border-[#EFECE4] scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#EFECE4] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-[#C4A468]" />
              <span className="text-xs uppercase tracking-[0.22em] text-[#B2948C] font-semibold">
                London Studio Release
              </span>
            </div>
            <h2 id="new-arrivals-heading" className="text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-semibold tracking-tight">
              New Arrivals
            </h2>
            <p className="text-xs sm:text-sm text-[#6B605B] font-normal mt-1.5 tracking-normal">
              Fresh from our London studio • For Her
            </p>
          </div>

          {/* Filter Pills */}
          <div className="mt-6 md:mt-0 flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.14em] transition-all cursor-pointer rounded-full whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-[#C4A468] text-[#1C1C1C] font-bold shadow-xs'
                    : 'bg-[#F4F1E8] hover:bg-[#EFECE4] text-[#1C1C1C]/80 hover:text-[#1C1C1C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
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
        <div className="mt-14 text-center">
          <button
            id="view-all-new-arrivals-btn"
            onClick={onViewAll}
            className="btn-luxury-secondary"
          >
            <span>Explore Collection</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
