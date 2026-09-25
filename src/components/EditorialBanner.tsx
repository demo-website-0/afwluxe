import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { BRAND_LOGO } from '../constants/branding';

interface EditorialBannerProps {
  onExploreAbayas: () => void;
}

export const EditorialBanner: React.FC<EditorialBannerProps> = ({ onExploreAbayas }) => {
  return (
    <section
      id="editorial-banner"
      aria-label="Editorial Collection Spotlight"
      className="relative min-h-[480px] lg:min-h-[560px] flex items-center justify-center overflow-hidden bg-[#1C1C1C] scroll-mt-20 lg:scroll-mt-24 transform-gpu"
    >
      {/* Background Editorial Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://i.ibb.co/4gmzbf8y/Premium-Heavy-Stone-Work-Abaya-1.jpg"
          alt="The Abaya Edit by AFW LUXE London"
          className="w-full h-full object-cover object-center scale-100"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1C]/95 via-[#1C1C1C]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/85 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="max-w-xl text-white space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={BRAND_LOGO.light}
              alt={BRAND_LOGO.alt}
              className="h-7 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = BRAND_LOGO.remoteUrl;
                target.style.filter = 'brightness(0) invert(1)';
              }}
            />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FDFCF7]/15 border border-[#C4A468]/40 backdrop-blur-xs rounded-full">
              <Sparkles size={11} className="text-[#C4A468]" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#FDFCF7] font-medium">
                Signature Collection
              </span>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-white">
            The Abaya Edit
          </h2>

          <p className="text-[#FDFCF7]/90 text-base sm:text-lg font-light leading-relaxed">
            Modest luxury for every occasion. Fluid drapes cut from Japanese double georgette, accented with hand-rolled silk finishes and discreet tailoring.
          </p>

          <div className="pt-2">
            <button
              id="explore-abayas-cta"
              onClick={onExploreAbayas}
              className="px-8 py-3.5 bg-[#C4A468] hover:bg-[#B39255] text-[#1C1C1C] hover:text-white font-bold text-xs uppercase tracking-[0.14em] transition-all cursor-pointer inline-flex items-center gap-2 rounded-full shadow-lg"
            >
              <span>Explore Abayas</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
