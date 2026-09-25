import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { getProductPriceBDT, formatTaka } from '../utils/currency';
import { fuzzyFilterProducts } from '../utils/fuzzySearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  const trendingSearches = [
    'Kurti',
    'Floral Tunic',
    'Golden Sparkle Kaftan',
    'Stone Work Abaya',
    'Dusty Mauve Maxi',
    'Floral Co-ord Set',
    'AFW Handbag',
    'Khimars',
  ];

  const filtered = query.trim() ? fuzzyFilterProducts(products, query) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1C1C1C]/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative w-full max-w-2xl bg-[#FDFCF7] border border-[#EFECE4] shadow-2xl rounded-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-[#EFECE4] flex items-center gap-3">
              <Search size={20} className="text-[#C4A468] shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dresses, kurtis, abayas, fabrics..."
                className="w-full bg-transparent text-[#1C1C1C] text-base placeholder-[#1C1C1C]/40 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1.5 text-[#1C1C1C]/60 hover:text-[#C4A468] transition-colors cursor-pointer"
                aria-label="Close search modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {query.trim() === '' ? (
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#5A6B5C] font-semibold block mb-3">
                    Trending In London
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3.5 py-1.5 bg-[#F4F1E8] hover:bg-[#EFECE4] text-xs text-[#1C1C1C] font-medium transition-colors rounded-full border border-[#EFECE4] cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-[#1C1C1C]/60 font-light">
                  No pieces found matching "{query}". Try browsing our curated categories.
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#1C1C1C]/60 font-semibold block mb-2">
                    {filtered.length} {filtered.length === 1 ? 'Design Found' : 'Designs Found'}
                  </span>
                  {filtered.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectProduct(item);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 bg-white hover:bg-[#F4F1E8] border border-[#EFECE4] transition-colors cursor-pointer rounded-xl group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-14 object-cover rounded-lg bg-[#F4F1E8]"
                        />
                        <div>
                          <h4 className="text-base text-[#1C1C1C] font-semibold group-hover:text-[#C4A468] transition-colors">
                            {item.name}
                          </h4>
                          <span className="text-xs text-[#6B605B] font-light">
                            {item.categoryLabel} • {item.fabric}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[#1C1C1C]">
                          {formatTaka(getProductPriceBDT(item))}
                        </span>
                        <ArrowRight size={14} className="text-[#1C1C1C]/40 group-hover:text-[#C4A468] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
