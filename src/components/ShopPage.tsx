import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Heart,
  Eye,
  ShoppingBag,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { getProductPriceBDT, getProductOriginalPriceBDT, formatTaka, CURRENCY_SYMBOL } from '../utils/currency';

interface ShopPageProps {
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: Set<string>;
  initialCategory?: string;
  onBackToHome: () => void;
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'bestsellers' | 'rating';
type AvailabilityOption = 'all' | 'in-stock' | 'out-of-stock';

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  onOpenProductDetail,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  initialCategory = 'all',
  onBackToHome,
}) => {
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Currency: Bangladeshi Taka (৳) exclusively
  const currencySymbol = CURRENCY_SYMBOL;

  // Category selection
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  // Availability selection
  const [availability, setAvailability] = useState<AvailabilityOption>('all');

  // Sort dropdown
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Temporary added-to-cart state for cards
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // Helper to get raw price in Taka
  const getProductPrice = (p: Product): number => {
    return getProductPriceBDT(p);
  };

  // Calculate global min and max prices across all products in Taka
  const { minPossiblePrice, maxPossiblePrice } = useMemo(() => {
    if (products.length === 0) return { minPossiblePrice: 0, maxPossiblePrice: 10000 };
    const prices = products.map(getProductPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { minPossiblePrice: min, maxPossiblePrice: max };
  }, [products]);

  // Price range filter state
  const [minPrice, setMinPrice] = useState<number>(minPossiblePrice);
  const [maxPrice, setMaxPrice] = useState<number>(maxPossiblePrice);

  // Update price range if bounds change
  React.useEffect(() => {
    setMinPrice(minPossiblePrice);
    setMaxPrice(maxPossiblePrice);
  }, [minPossiblePrice, maxPossiblePrice]);

  // Define Category display list with accurate labels matching the image and boutique
  const categoryOptions = useMemo(() => {
    return [
      { id: 'all', label: 'All' },
      { id: 'bag', label: 'Bag' },
      { id: 'hijab', label: 'Hijab' },
      { id: 'rings', label: 'Rings' },
      { id: 'abayas', label: 'Abayas & Kaftans' },
      { id: 'dresses', label: 'Modest Dresses' },
      { id: 'kurtis', label: 'Tops & Co-Ords' },
    ];
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    categoryOptions.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = products.filter((p) => {
          if (cat.id === 'bag') return p.category === 'bag' || p.category === 'accessories';
          if (cat.id === 'hijab') return p.category === 'hijab';
          if (cat.id === 'rings') return p.category === 'rings';
          return p.category === cat.id;
        }).length;
      }
    });
    return counts;
  }, [products, categoryOptions]);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesName = p.name.toLowerCase().includes(query);
          const matchesSubtitle = p.subtitle.toLowerCase().includes(query);
          const matchesCategory = p.categoryLabel.toLowerCase().includes(query);
          if (!matchesName && !matchesSubtitle && !matchesCategory) return false;
        }

        // 2. Category Filter
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'bag') {
            if (p.category !== 'bag' && p.category !== 'accessories') return false;
          } else if (selectedCategory === 'hijab') {
            if (p.category !== 'hijab') return false;
          } else if (selectedCategory === 'rings') {
            if (p.category !== 'rings') return false;
          } else if (p.category !== selectedCategory) {
            return false;
          }
        }

        // 3. Price Filter
        const price = getProductPrice(p);
        if (price < minPrice || price > maxPrice) return false;

        // 4. Availability Filter
        if (availability === 'in-stock') {
          if (p.inStock === false) return false;
        } else if (availability === 'out-of-stock') {
          if (p.inStock !== false) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = getProductPrice(a);
        const priceB = getProductPrice(b);
        switch (sortBy) {
          case 'price-low':
            return priceA - priceB;
          case 'price-high':
            return priceB - priceA;
          case 'bestsellers':
            return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
          default:
            return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        }
      });
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice, availability, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMinPrice(minPossiblePrice);
    setMaxPrice(maxPossiblePrice);
    setAvailability('all');
    setSortBy('newest');
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    minPrice > minPossiblePrice ||
    maxPrice < maxPossiblePrice ||
    availability !== 'all';

  // Quick add to cart handler
  const handleQuickAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const size = p.sizes[0] || 'Standard';
    const color = p.colors[0]?.name || 'Default';
    onAddToCart(p, size, color);
    setAddedItemIds((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [p.id]: false }));
    }, 1600);
  };

  const sortLabels: Record<SortOption, string> = {
    newest: 'Newest',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    bestsellers: 'Best Sellers',
    rating: 'Customer Rating',
  };

  return (
    <div id="shop-page-view" className="min-h-screen bg-[#FDFCF7] text-[#1C1C1C] pb-24">
      {/* Top Breadcrumb & Return bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-stone-500 gap-2">
          <button
            onClick={onBackToHome}
            className="hover:text-[#C4A468] transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-[#1C1C1C] font-semibold">Shop</span>
          {selectedCategory !== 'all' && (
            <>
              <span>/</span>
              <span className="capitalize text-[#C4A468] font-medium">
                {categoryOptions.find((c) => c.id === selectedCategory)?.label || selectedCategory}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Hero Header: Identical to the reference image */}
      <section className="text-center pt-6 pb-4 sm:pb-8 px-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1C1C1C]">
          Shop
        </h1>
        <p className="text-stone-500 text-sm sm:text-base mt-2 font-normal">
          Discover our full collection.
        </p>

        {/* Pill Search Bar centered underneath */}
        <div className="max-w-xl mx-auto mt-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-stone-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-white/70 hover:bg-white focus:bg-white text-sm text-[#1C1C1C] placeholder:text-stone-400 rounded-full border border-stone-300/80 focus:border-[#1C1C1C] focus:outline-none shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        {/* Mobile Filter & Sort Bar */}
        <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-[#EFECE4] gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-300 bg-white text-xs font-semibold text-[#1C1C1C] shadow-xs cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {isFiltered && (
              <span className="w-2 h-2 rounded-full bg-[#C4A468]" />
            )}
          </button>

          <span className="text-xs text-stone-500 font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </span>

          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-stone-300 bg-white text-xs font-medium text-[#1C1C1C] shadow-xs cursor-pointer"
            >
              <span>{sortLabels[sortBy]}</span>
              <ChevronDown size={14} className="text-stone-500" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-40">
                {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortBy(key);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      sortBy === key
                        ? 'font-bold text-[#1C1C1C] bg-[#FAF7F2]'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>{sortLabels[key]}</span>
                    {sortBy === key && <Check size={12} className="text-[#C4A468]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Desktop Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* ================= LEFT COLUMN: FILTERS CARD ================= */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-[#EFECE4] shadow-[0_8px_30px_rgba(28,28,28,0.03)] sticky top-28">
              {/* Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#EFECE4]">
                <div>
                  <div className="flex items-center gap-2 text-[#1C1C1C]">
                    <SlidersHorizontal size={17} strokeWidth={2} />
                    <h2 className="font-semibold text-base tracking-tight">Filters</h2>
                  </div>
                  <p className="text-xs text-stone-500 font-normal mt-1">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                  </p>
                </div>

                {/* Reset Filters if active */}
                {isFiltered && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] text-[#C4A468] hover:text-[#1C1C1C] transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* 1. Price Filter (matches the slider + pill in the image) */}
              <div className="pt-5 pb-5 border-b border-[#EFECE4]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#1C1C1C]">
                    Price ({currencySymbol})
                  </span>
                </div>

                {/* Range Slider Controls */}
                <div className="space-y-2">
                  <div className="relative pt-1 pb-2">
                    <input
                      type="range"
                      min={minPossiblePrice}
                      max={maxPossiblePrice}
                      value={maxPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= minPrice) setMaxPrice(val);
                      }}
                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#1C1C1C]"
                    />
                  </div>

                  {/* Range display pill underneath (as in reference image) */}
                  <div className="py-2.5 px-4 bg-[#FAF7F2] rounded-xl text-center text-xs font-semibold text-[#1C1C1C] tracking-wide border border-[#EFECE4]/80 select-none">
                    {formatTaka(minPrice)} — {formatTaka(maxPrice)}
                  </div>
                </div>
              </div>

              {/* 2. Categories Filter (Exact Radio styling from reference image) */}
              <div className="pt-5 pb-5 border-b border-[#EFECE4]">
                <h3 className="text-sm font-medium text-[#1C1C1C] mb-3">Categories</h3>
                <div className="space-y-2.5">
                  {categoryOptions.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const count = categoryCounts[cat.id] ?? 0;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className="flex items-center gap-3 w-full text-left py-1 text-sm group cursor-pointer transition-colors"
                      >
                        {/* Radio circle: outer ring with inner black dot when active */}
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? 'border-[#1C1C1C]'
                              : 'border-stone-400/80 group-hover:border-[#1C1C1C]'
                          }`}
                        >
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#1C1C1C]" />
                          )}
                        </span>

                        <span
                          className={`text-sm transition-colors ${
                            isSelected
                              ? 'font-semibold text-[#1C1C1C]'
                              : 'text-stone-700 group-hover:text-[#1C1C1C] font-normal'
                          }`}
                        >
                          {cat.label}
                        </span>

                        <span className="ml-auto text-xs text-stone-400 font-normal">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Availability Filter (matches reference image) */}
              <div className="pt-5">
                <h3 className="text-sm font-medium text-[#1C1C1C] mb-3">Availability</h3>
                <div className="space-y-2.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'in-stock', label: 'In Stock' },
                    { id: 'out-of-stock', label: 'Out of Stock' },
                  ].map((opt) => {
                    const isSelected = availability === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAvailability(opt.id as AvailabilityOption)}
                        className="flex items-center gap-3 w-full text-left py-1 text-sm group cursor-pointer transition-colors"
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? 'border-[#1C1C1C]'
                              : 'border-stone-400/80 group-hover:border-[#1C1C1C]'
                          }`}
                        >
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#1C1C1C]" />
                          )}
                        </span>
                        <span
                          className={`text-sm transition-colors ${
                            isSelected
                              ? 'font-semibold text-[#1C1C1C]'
                              : 'text-stone-700 group-hover:text-[#1C1C1C] font-normal'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* ================= RIGHT COLUMN: PRODUCTS CATALOG ================= */}
          <main className="flex-1 min-w-0">
            {/* Desktop Top Meta Bar */}
            <div className="hidden lg:flex items-center justify-between pb-5 mb-4 border-b border-[#EFECE4]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-stone-700">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
                {selectedCategory !== 'all' && (
                  <span className="text-xs bg-[#FAF7F2] text-stone-600 px-2.5 py-1 rounded-full border border-stone-200/80 capitalize">
                    Category: {categoryOptions.find((c) => c.id === selectedCategory)?.label}
                  </span>
                )}
              </div>

              {/* Pill Sort Dropdown (Exact look of the attachment image) */}
              <div className="relative">
                <button
                  id="sort-dropdown-trigger"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-3 px-5 py-2 rounded-full border border-stone-300 bg-white/90 hover:bg-white text-sm font-medium text-[#1C1C1C] shadow-xs cursor-pointer transition-all"
                  aria-expanded={isSortOpen}
                  aria-haspopup="true"
                >
                  <span>{sortLabels[sortBy]}</span>
                  <ChevronDown size={15} className="text-stone-500" />
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-40">
                    {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSortBy(key);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          sortBy === key
                            ? 'font-bold text-[#1C1C1C] bg-[#FAF7F2]'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span>{sortLabels[key]}</span>
                        {sortBy === key && <Check size={13} className="text-[#C4A468]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 xl:gap-8">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlistIds.has(product.id);
                  const justAdded = !!addedItemIds[product.id];
                  const displayPrice = getProductPrice(product);

                  return (
                    <div
                      key={product.id}
                      id={`shop-product-${product.id}`}
                      onClick={() => onOpenProductDetail(product)}
                      className="group flex flex-col cursor-pointer transition-transform duration-300"
                    >
                      {/* Image Container matching reference image card radius & aspect ratio */}
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#F7F4EC] border border-[#EFECE4]/80 shadow-[0_4px_16px_rgba(28,28,28,0.03)] group-hover:shadow-[0_12px_28px_rgba(28,28,28,0.08)] transition-all duration-300">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Top Left: BEST SELLER dark badge (as in reference image) */}
                        {product.isBestseller && (
                          <span className="absolute top-3.5 left-3.5 bg-[#1C1C1C] text-[#FDFCF7] text-[10px] tracking-wider font-bold px-3 py-1 rounded-full uppercase z-10 shadow-xs">
                            BEST SELLER
                          </span>
                        )}

                        {/* Top Left: NEW badge if not best seller */}
                        {!product.isBestseller && product.isNew && (
                          <span className="absolute top-3.5 left-3.5 bg-[#C4A468] text-[#1C1C1C] text-[10px] tracking-wider font-bold px-2.5 py-1 rounded-full uppercase z-10 shadow-xs">
                            NEW
                          </span>
                        )}

                        {/* Top Right: Wishlist Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(product);
                          }}
                          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                          className="absolute top-3.5 right-3.5 p-2 bg-white/90 hover:bg-white text-[#1C1C1C] rounded-full shadow-xs transition-colors z-10 cursor-pointer border border-[#EFECE4]"
                        >
                          <Heart
                            size={15}
                            className={isWishlisted ? 'fill-[#B2948C] text-[#B2948C]' : 'text-[#1C1C1C]/60'}
                          />
                        </button>

                        {/* Quick View Button on hover */}
                        {onQuickView && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickView(product);
                            }}
                            aria-label={`Quick view ${product.name}`}
                            className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-[#C4A468] text-[#1C1C1C] text-[11px] uppercase tracking-[0.14em] px-4 py-2 rounded-full border border-[#EFECE4] shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5 cursor-pointer z-10 whitespace-nowrap font-medium"
                          >
                            <Eye size={13} />
                            <span>Quick View</span>
                          </button>
                        )}

                        {/* Bottom Quick Add Pill Bar */}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#1C1C1C]/85 via-[#1C1C1C]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => handleQuickAdd(product, e)}
                            className={`w-full py-2 px-3 text-xs uppercase tracking-[0.12em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer rounded-full shadow-md ${
                              justAdded
                                ? 'bg-[#1C1C1C] text-white'
                                : 'bg-[#C4A468] hover:bg-[#B39255] text-[#1C1C1C] hover:text-white'
                            }`}
                          >
                            {justAdded ? (
                              <>
                                <Check size={13} />
                                <span>Added to Bag</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={13} />
                                <span>Add to Bag</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Product Info below image (Identical typography & layout to attachment) */}
                      <div className="pt-3.5 pb-1 flex flex-col">
                        {/* Title: UPPERCASE bold text */}
                        <h3 className="text-xs sm:text-[13px] font-bold tracking-wider uppercase text-[#1C1C1C] group-hover:text-[#C4A468] transition-colors leading-snug line-clamp-1">
                          {product.name}
                        </h3>

                        {/* Price: Clean price directly under title */}
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm sm:text-base font-semibold text-[#1C1C1C] tracking-wide">
                            {formatTaka(displayPrice)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-stone-400 line-through">
                              {formatTaka(getProductOriginalPriceBDT(product)!)}
                            </span>
                          )}
                        </div>

                        {/* Subtitle / category footnote */}
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {product.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20 px-4 bg-white/50 rounded-3xl border border-[#EFECE4]">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto text-stone-400 mb-3">
                  <Search size={20} />
                </div>
                <h3 className="text-base font-semibold text-[#1C1C1C]">
                  No products found
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  We couldn't find any products matching your current filters and search query.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1C1C] text-white hover:bg-[#C4A468] hover:text-[#1C1C1C] text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-Out Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-[#FDFCF7] rounded-t-3xl shadow-2xl z-50 lg:hidden flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#EFECE4]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={17} />
                  <h3 className="font-semibold text-base text-[#1C1C1C]">Filters</h3>
                </div>
                <div className="flex items-center gap-3">
                  {isFiltered && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-[#C4A468] font-medium"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 text-stone-500 hover:text-stone-900"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Mobile Price */}
              <div className="py-4 border-b border-[#EFECE4]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Price ({currencySymbol})</span>
                </div>
                <input
                  type="range"
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none accent-[#1C1C1C]"
                />
                <div className="mt-2 py-2 bg-[#FAF7F2] rounded-xl text-center text-xs font-semibold">
                  {formatTaka(minPrice)} — {formatTaka(maxPrice)}
                </div>
              </div>

              {/* Mobile Categories */}
              <div className="py-4 border-b border-[#EFECE4]">
                <h4 className="text-sm font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="flex items-center gap-3 w-full py-1.5 text-sm"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedCategory === cat.id ? 'border-[#1C1C1C]' : 'border-stone-400'
                        }`}
                      >
                        {selectedCategory === cat.id && (
                          <span className="w-2 h-2 rounded-full bg-[#1C1C1C]" />
                        )}
                      </span>
                      <span className={selectedCategory === cat.id ? 'font-semibold' : ''}>
                        {cat.label}
                      </span>
                      <span className="ml-auto text-xs text-stone-400">
                        {categoryCounts[cat.id] ?? 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Availability */}
              <div className="py-4">
                <h4 className="text-sm font-medium mb-3">Availability</h4>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'in-stock', label: 'In Stock' },
                    { id: 'out-of-stock', label: 'Out of Stock' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAvailability(opt.id as AvailabilityOption)}
                      className="flex items-center gap-3 w-full py-1.5 text-sm"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          availability === opt.id ? 'border-[#1C1C1C]' : 'border-stone-400'
                        }`}
                      >
                        {availability === opt.id && (
                          <span className="w-2 h-2 rounded-full bg-[#1C1C1C]" />
                        )}
                      </span>
                      <span className={availability === opt.id ? 'font-semibold' : ''}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3.5 bg-[#1C1C1C] text-white font-semibold rounded-full text-xs uppercase tracking-wider"
                >
                  View {filteredProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
