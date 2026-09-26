import React from 'react';

interface TrustBarProps {
  onSelectCategory?: (category: string) => void;
}

interface WhatsNewCategory {
  id: string;
  categoryId: string;
  label: string;
  image: string;
}

const WHATS_NEW_CATEGORIES: WhatsNewCategory[] = [
  {
    id: 'kaftans',
    categoryId: 'abayas',
    label: 'KAFTANS',
    image: 'https://i.ibb.co/sp39TtJ0/Black-with-Golden-Sparkle-AFW-Kaftan-1.jpg',
  },
  {
    id: 'stone-abayas',
    categoryId: 'abayas',
    label: 'STONE ABAYAS',
    image: 'https://i.ibb.co/4gmzbf8y/Premium-Heavy-Stone-Work-Abaya-1.jpg',
  },
  {
    id: 'modest-maxi',
    categoryId: 'dresses',
    label: 'MODEST MAXI',
    image: 'https://i.ibb.co/bRCb3TDG/Dusty-Mauve-Modest-Maxi.jpg',
  },
  {
    id: 'co-ord-sets',
    categoryId: 'kurtis',
    label: 'CO-ORD SETS',
    image: 'https://i.ibb.co/DDs9bKNd/Floral-Co-Ord-Set-1.jpg',
  },
  {
    id: 'khimars',
    categoryId: 'accessories',
    label: 'KHIMARS',
    image: 'https://i.ibb.co/0RYHVyCS/khimar-1.jpg',
  },
  {
    id: 'handbags',
    categoryId: 'accessories',
    label: 'HANDBAGS',
    image: 'https://i.ibb.co/zHTdbnw3/ladies-handbag-1.jpg',
  },
  {
    id: 'white-lace',
    categoryId: 'abayas',
    label: 'WHITE LACE',
    image: 'https://i.ibb.co/sdQD0DcP/Premium-White-Lace-Kaftan.jpg',
  },
  {
    id: 'linen-maxi',
    categoryId: 'dresses',
    label: 'LINEN MAXI',
    image: 'https://i.ibb.co/HT34Wn3Z/Tie-Ups-Linen-Maxi-Dress-1.jpg',
  },
];

// Triplicated categories for a seamless, continuous infinite loop
const LOOPED_CATEGORIES = [
  ...WHATS_NEW_CATEGORIES.map((cat, idx) => ({ ...cat, loopKey: `${cat.id}-set0-${idx}` })),
  ...WHATS_NEW_CATEGORIES.map((cat, idx) => ({ ...cat, loopKey: `${cat.id}-set1-${idx}` })),
  ...WHATS_NEW_CATEGORIES.map((cat, idx) => ({ ...cat, loopKey: `${cat.id}-set2-${idx}` })),
];

export const TrustBar: React.FC<TrustBarProps> = ({ onSelectCategory }) => {
  const handleCategoryClick = (categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    const catalogElement = document.getElementById('category-cards') || document.getElementById('new-arrivals');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="trust-bar-section"
      aria-label="What's New Categories"
      className="bg-[#FDFCF7] border-y border-[#EFECE4] h-[96px] sm:h-auto py-2 sm:py-7 lg:py-9 select-none overflow-hidden scroll-mt-20 lg:scroll-mt-24 flex items-center"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-row items-center justify-between gap-2.5 sm:gap-6 lg:gap-8">
          {/* Left Title: WHAT'S NEW (Stacked vertically side-by-side on all screens) */}
          <div className="shrink-0 flex flex-col items-start pr-1 sm:pr-3 select-none">
            <h2 className="text-[19px] sm:text-3xl md:text-4xl lg:text-[44px] font-extrabold uppercase tracking-tight leading-[0.9] flex flex-col">
              <span className="text-[#1A1A1A]">WHAT'S</span>
              <span className="text-[#C4A468] mt-0.5 sm:mt-1">NEW</span>
            </h2>
          </div>

          {/* Categories Continuous Looping Track */}
          <div className="w-full relative flex-1 min-w-0 overflow-hidden">
            {/* Soft edge gradient masks for luxury fade effect matching screenshot */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#FDFCF7] via-[#FDFCF7]/60 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-l from-[#FDFCF7] to-transparent z-10" />

            <div
              className="animate-marquee-slow flex items-start gap-2.5 sm:gap-6 lg:gap-7 py-0.5 sm:py-1 px-1 hover:[animation-play-state:paused] active:[animation-play-state:paused] touch-pan-x"
            >
              {LOOPED_CATEGORIES.map((cat) => (
                <button
                  key={cat.loopKey}
                  id={`whats-new-cat-${cat.loopKey}`}
                  type="button"
                  onClick={() => handleCategoryClick(cat.categoryId)}
                  className="flex flex-col items-center group cursor-pointer shrink-0 focus:outline-hidden active:scale-95 transition-transform"
                >
                  {/* Circular Avatar / Image */}
                  <div className="w-14 h-14 sm:w-22 sm:h-22 md:w-26 md:h-26 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-[#FDFCF7] relative shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md border border-[#EFECE4] group-hover:border-[#C4A468]">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110 pointer-events-none select-none"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* Uppercase Category Label */}
                  <span className="mt-1 sm:mt-2 text-center text-[9px] sm:text-[11px] md:text-xs font-bold tracking-wider text-[#1C1C1C] uppercase whitespace-nowrap group-hover:text-[#C4A468] transition-colors pointer-events-none select-none">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

