import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scissors, Compass, Feather, Award } from 'lucide-react';
import { BRAND_LOGO } from '../constants/branding';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1C1C1C]/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="relative w-full max-w-2xl bg-[#FDFCF7] border border-[#EFECE4] shadow-2xl rounded-2xl overflow-hidden z-10 my-8 p-6 sm:p-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#1C1C1C]/60 hover:text-[#C4A468] cursor-pointer rounded-full hover:bg-white transition-colors"
              aria-label="Close story modal"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto">
                <img
                  src={BRAND_LOGO.dark}
                  alt={BRAND_LOGO.alt}
                  className="h-10 w-auto object-contain mx-auto mb-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = BRAND_LOGO.remoteUrl;
                  }}
                />
                <span className="text-xs uppercase tracking-[0.25em] text-[#C4A468] font-semibold block mb-2">
                  The London Atelier
                </span>
                <h2 className="text-3xl sm:text-4xl text-[#1C1C1C] font-semibold leading-tight">
                  Designed in London. Made for You.
                </h2>
                <div className="w-12 h-[2px] bg-[#B2948C] mx-auto mt-4" />
              </div>

              <div className="text-sm text-[#6B605B] font-light leading-relaxed space-y-4">
                <p>
                  Born in London, AFW LUXE was conceived from a desire to bridge high-fashion European atelier design with the enduring values of modest elegance.
                </p>
                <p>
                  Our in-house design team in London creates each AFW LUXE piece with intention—blending luxury fabrics, modern silhouettes, and timeless detail. We believe elegance should feel effortless, never cumbersome.
                </p>
                <blockquote className="border-l-2 border-[#C4A468] pl-4 italic font-serif text-base text-[#1C1C1C]">
                  “Trendy women’s tops, elegant long dresses, Kurtis, and chic abayas—designed by our in-house team in London for luxury collections.”
                </blockquote>
              </div>

              {/* 3 Hallmarks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#EFECE4]">
                <div className="p-4 bg-[#F4F1E8] rounded-xl border border-[#EFECE4] text-center space-y-1.5">
                  <div className="w-8 h-8 mx-auto rounded-full bg-white text-[#C4A468] flex items-center justify-center border border-[#EFECE4] shadow-xs">
                    <Compass size={16} />
                  </div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1C1C1C]">
                    London Design
                  </h4>
                  <p className="text-[11px] text-[#6B605B] font-light">
                    Every pattern originated in our British design house.
                  </p>
                </div>

                <div className="p-4 bg-[#F4F1E8] rounded-xl border border-[#EFECE4] text-center space-y-1.5">
                  <div className="w-8 h-8 mx-auto rounded-full bg-white text-[#5A6B5C] flex items-center justify-center border border-[#EFECE4] shadow-xs">
                    <Feather size={16} />
                  </div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1C1C1C]">
                    Sensory Fabrics
                  </h4>
                  <p className="text-[11px] text-[#6B605B] font-light">
                    Breathable crepes, washed silks, and organic linen.
                  </p>
                </div>

                <div className="p-4 bg-[#F4F1E8] rounded-xl border border-[#EFECE4] text-center space-y-1.5">
                  <div className="w-8 h-8 mx-auto rounded-full bg-white text-[#B2948C] flex items-center justify-center border border-[#EFECE4] shadow-xs">
                    <Award size={16} />
                  </div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1C1C1C]">
                    Modest Precision
                  </h4>
                  <p className="text-[11px] text-[#6B605B] font-light">
                    Full sweeps, generous ease, zero cling.
                  </p>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="btn-luxury-primary text-xs py-3 px-8"
                >
                  Return to Boutique
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
