import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { CategoryCardData } from '../types';

interface CategoryCardsProps {
  onSelectCategory: (categoryId: string) => void;
  categories?: CategoryCardData[];
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  onSelectCategory,
  categories = CATEGORIES,
}) => {
  return (
    <section id="shop-by-category" aria-labelledby="category-heading" className="py-12 sm:py-20 lg:py-28 bg-[#FDFCF7] scroll-mt-20 lg:scroll-mt-24 content-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
          <h2 id="category-heading" className="text-2xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-semibold tracking-tight">
            Shop by Category
          </h2>
          <div className="w-12 h-[2px] bg-[#B2948C] mx-auto mt-3 sm:mt-4" />
        </div>

        {/* 4 Cards Grid - 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              id={`category-card-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative cursor-pointer flex flex-col active:scale-[0.98] transition-transform select-none"
            >
              {/* Image Container with 3:4 aspect ratio and rounded-2xl */}
              <div className="relative aspect-3/4 overflow-hidden rounded-xl sm:rounded-2xl bg-[#FDFCF7] border border-[#EFECE4] shadow-[0_4px_16px_rgba(28,28,28,0.05)] transition-all duration-500 group-hover:shadow-[0_12px_32px_rgba(28,28,28,0.15)] group-hover:-translate-y-1">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-center zoom-image"
                  loading="lazy"
                  decoding="async"
                />

                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/90 via-[#1C1C1C]/35 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Hover Reveal "Shop Now" */}
                <div className="hidden sm:flex absolute top-4 right-4 bg-[#FDFCF7]/95 backdrop-blur-xs p-2.5 rounded-full text-[#1C1C1C] group-hover:bg-[#C4A468] group-hover:text-[#1C1C1C] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-md">
                  <ArrowUpRight size={16} />
                </div>

                {/* Category Card Bottom Content */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 text-white flex flex-col justify-end transform transition-transform duration-300">
                  <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#C4A468] font-medium mb-0.5 sm:mb-1">
                    {cat.itemCount} Designs
                  </span>
                  <h3 className="text-sm sm:text-xl lg:text-2xl font-semibold tracking-tight text-white group-hover:text-[#FDFCF7] transition-colors leading-snug">
                    {cat.title}
                  </h3>
                  <p className="hidden sm:block text-xs text-white/80 font-light mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="mt-1.5 sm:mt-3 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#C4A468] font-semibold opacity-95 group-hover:opacity-100">
                    <span>Shop</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
