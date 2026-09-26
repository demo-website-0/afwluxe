import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    let currentlyVisible = false;

    const toggleVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 320;
          if (scrolled !== currentlyVisible) {
            currentlyVisible = scrolled;
            setIsVisible(scrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="scroll-to-top-btn"
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.85, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Smooth scroll back to top of page"
          title="Back to top"
          className="fixed bottom-6 right-4 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1C1C1C] text-[#FDFCF7] border border-[#C4A468]/60 shadow-[0_6px_20px_rgba(28,28,28,0.22)] flex items-center justify-center cursor-pointer transition-colors hover:bg-[#C4A468] hover:text-[#1C1C1C] group focus:outline-hidden transform-gpu"
        >
          <ArrowUp
            size={18}
            className="transition-transform duration-200 group-hover:-translate-y-0.5"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
