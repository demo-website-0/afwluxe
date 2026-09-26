import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';

interface HeroProps {
  onShopNow: () => void;
}

const HERO_IMAGES = [
  {
    url: 'https://i.ibb.co/rGLLKb4B/ac38b14b7d2661736147ffc1076b39ae.webp',
    alt: 'AFW LUXE London Fashion Campaign 1',
  },
  {
    url: 'https://i.ibb.co/zhK6mr6r/e8f1a357e9118fd40106cf962650cc3b.webp',
    alt: 'AFW LUXE London Fashion Campaign 2',
  },
  {
    url: 'https://i.ibb.co/Rp45QRgk/de41fc1439bc1a8091fcc169096422bd.webp',
    alt: 'AFW LUXE London Fashion Campaign 3',
  },
  {
    url: 'https://i.ibb.co/601Dng0v/637872051-122099183907275716-2665112884096793721-n.webp',
    alt: 'AFW LUXE London Fashion Campaign 4',
  },
];

export const Hero: React.FC<HeroProps> = ({ onShopNow }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const { cmsContent } = useAdminData();

  const heroHeadline = cmsContent?.hero?.headline || 'Step Into Luxury';
  const heroButtonText = cmsContent?.hero?.buttonText || 'Shop Now';

  // Auto rotation timer (5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  return (
    <section
      id="hero-section"
      aria-label="Hero Showcase"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-[#1C1C1C] h-[calc(100vh-150px)] [height:calc(100dvh-150px)] min-h-[350px] sm:h-[540px] md:h-[620px] lg:h-[700px] flex items-center justify-center select-none transform-gpu touch-pan-y"
    >
      {/* Background Rotating Images */}
      <div className="absolute inset-0 z-0">
        {HERO_IMAGES.map((image, index) => (
          <div
            key={image.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        ))}

        {/* Soft elegant gradient overlay to ensure text and button have clear, prominent contrast */}
        <div className="absolute inset-0 z-10 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Navigation Arrows (Subtle on mobile, fully visible on desktop) */}
      <button
        type="button"
        id="hero-prev-btn"
        onClick={handlePrev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-3 sm:left-6 z-30 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        id="hero-next-btn"
        onClick={handleNext}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-3 sm:right-6 z-30 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
      >
        <ChevronRight size={20} />
      </button>

      {/* Hero Center: Headline "Step Into Luxury" + Button "Shop Now" */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          id="hero-headline"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-white font-serif text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-wide sm:tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] mb-3.5 sm:mb-8"
        >
          {heroHeadline}
        </motion.h1>

        <motion.button
          type="button"
          id="hero-shop-now-btn"
          onClick={onShopNow}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="px-7 py-3 sm:px-14 sm:py-5 bg-[#C4A468] hover:bg-[#B39255] text-[#1C1C1C] hover:text-white text-xs sm:text-sm uppercase tracking-[0.2em] font-bold rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.45)] border border-[#C4A468] transition-all cursor-pointer backdrop-blur-xs active:scale-95"
        >
          {heroButtonText}
        </motion.button>
      </div>

      {/* Slide Dots / Indicators at bottom */}
      <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-2 sm:gap-2.5">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
              index === currentIndex
                ? 'w-8 bg-[#C4A468] shadow-md'
                : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
