import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

export const TrustBar: React.FC<TrustBarProps> = ({ onSelectCategory }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const moved = useRef(false);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    moved.current = false;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    if (Math.abs(walk) > 4) {
      moved.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleCategoryClick = (categoryId: string) => {
    if (moved.current) {
      moved.current = false;
      return;
    }
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
      className="bg-[#FDFCF7] border-y border-[#EFECE4] py-8 sm:py-10 lg:py-12 select-none overflow-hidden scroll-mt-20 lg:scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 lg:gap-8 xl:gap-12">
          {/* Left Title: WHAT'S NEW & Controls */}
          <div className="shrink-0 flex items-center justify-between w-full lg:w-auto lg:flex-col lg:items-start gap-3">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1C1C1C] uppercase tracking-tight leading-[1.05]">
              WHAT'S
              <br />
              <span className="text-[#C4A468]">NEW</span>
            </h2>

            {/* Arrow Controls (visible on all screens for effortless navigation) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                aria-label="Scroll left in categories"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#EFECE4] bg-white flex items-center justify-center text-[#1C1C1C] hover:text-[#C4A468] hover:border-[#C4A468] hover:shadow-xs transition-all cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                aria-label="Scroll right in categories"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#EFECE4] bg-white flex items-center justify-center text-[#1C1C1C] hover:text-[#C4A468] hover:border-[#C4A468] hover:shadow-xs transition-all cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Categories Horizontal Carousel / Row */}
          <div className="w-full relative flex-1 min-w-0">
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex items-start justify-start lg:justify-between gap-5 sm:gap-6 lg:gap-5 xl:gap-7 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth cursor-grab active:cursor-grabbing overscroll-contain"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {WHATS_NEW_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`whats-new-cat-${cat.id}`}
                  type="button"
                  onClick={() => handleCategoryClick(cat.categoryId)}
                  className="flex flex-col items-center group cursor-pointer shrink-0 focus:outline-hidden"
                >
                  {/* Circular Avatar / Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-30 md:h-30 lg:w-26 lg:h-26 xl:w-28 xl:h-28 rounded-full overflow-hidden bg-[#FDFCF7] relative shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md border border-[#EFECE4] group-hover:border-[#C4A468]">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* Uppercase Category Label */}
                  <span className="mt-3 text-center text-xs sm:text-[13px] font-bold tracking-wider text-[#1C1C1C] uppercase whitespace-nowrap group-hover:text-[#C4A468] transition-colors pointer-events-none">
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
