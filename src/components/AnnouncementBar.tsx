import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MESSAGES = [
  'Complimentary shipping on orders over 2,500৳',
  'Exclusive luxury modest womenswear collection',
  'Fast delivery across Bangladesh & Easy returns',
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + MESSAGES.length) % MESSAGES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
  };

  return (
    <aside
      id="announcement-bar"
      aria-label="Announcements"
      className="bg-[#1C1C1C] text-[#FDFCF7] text-xs font-normal tracking-[0.14em] py-2.5 px-4 select-none relative z-40 border-b border-[#C4A468]/20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between text-center">
        <button
          id="announcement-prev-btn"
          onClick={handlePrev}
          aria-label="Previous announcement"
          className="p-1 hover:text-[#C4A468] transition-colors cursor-pointer text-[#FDFCF7]/70"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="overflow-hidden h-5 flex items-center justify-center flex-1 mx-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-center font-medium uppercase tracking-[0.15em] text-[11px] sm:text-[11.5px] truncate text-[#FDFCF7]"
            >
              {MESSAGES[currentIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <button
          id="announcement-next-btn"
          onClick={handleNext}
          aria-label="Next announcement"
          className="p-1 hover:text-[#C4A468] transition-colors cursor-pointer text-[#FDFCF7]/70"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </aside>
  );
};
