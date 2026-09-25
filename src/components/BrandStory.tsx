import React from 'react';
import { ArrowRight, Scissors, Feather, Sparkles } from 'lucide-react';
import { BRAND_LOGO } from '../constants/branding';

interface BrandStoryProps {
  onOpenStoryModal: () => void;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ onOpenStoryModal }) => {
  return (
    <section id="brand-story" aria-labelledby="story-heading" className="py-20 lg:py-28 bg-[#FBF9F3] border-b border-[#EFECE4] scroll-mt-20 lg:scroll-mt-24 content-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Image Left */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-[#FDFCF7] shadow-[0_8px_32px_rgba(28,28,28,0.08)] group">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85"
                alt="AFW LUXE London In-House Atelier & Design Studio"
                className="w-full h-full object-cover object-center zoom-image"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-[#1C1C1C]/10" />

              {/* Atelier Floating Stamp */}
              <div className="absolute top-6 left-6 bg-[#FDFCF7]/95 backdrop-blur-xs p-4 border border-[#EFECE4] max-w-[210px] rounded-xl shadow-md">
                <img
                  src={BRAND_LOGO.dark}
                  alt={BRAND_LOGO.alt}
                  className="h-6 w-auto object-contain mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = BRAND_LOGO.remoteUrl;
                  }}
                />
                <span className="block text-[10px] uppercase tracking-[0.22em] text-[#5A6B5C] font-semibold mb-1">
                  Atelier Note
                </span>
                <p className="font-serif text-sm italic text-[#1C1C1C] leading-snug">
                  “Pattern-cut, sampled, and refined in our London studio.”
                </p>
              </div>

              {/* Corner badge */}
              <div className="absolute bottom-6 right-6 bg-[#1C1C1C] text-[#FDFCF7] px-4 py-2 text-[11px] uppercase tracking-[0.18em] font-medium rounded-full shadow-md border border-[#C4A468]/30">
                London Atelier • For Her
              </div>
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={BRAND_LOGO.dark}
                alt={BRAND_LOGO.alt}
                className="h-7 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = BRAND_LOGO.remoteUrl;
                }}
              />
              <div className="inline-flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#C4A468]" />
                <span className="text-xs uppercase tracking-[0.22em] text-[#5A6B5C] font-semibold">
                  The London Heritage
                </span>
              </div>
            </div>

            <h2 id="story-heading" className="text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-semibold tracking-tight leading-[1.15]">
              Designed in London. <br />
              <span className="font-light italic text-[#C4A468]">Made for You.</span>
            </h2>

            <p className="text-[#6B605B] text-base sm:text-lg font-light leading-relaxed">
              Our in-house design team in London creates each AFW LUXE piece with intention—blending luxury fabrics, modern silhouettes, and timeless detail. We believe elegance should feel effortless.
            </p>

            <blockquote className="border-l-2 border-[#C4A468] pl-4 py-1 italic font-serif text-base sm:text-lg text-[#1C1C1C]/85">
              “Born in London, made for the modern woman. AFW LUXE blends contemporary trends with timeless elegance.”
            </blockquote>

            {/* Atelier hallmarks */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#EFECE4]">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-full bg-white text-[#5A6B5C] shrink-0 border border-[#EFECE4] shadow-xs">
                  <Scissors size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1C1C1C]">
                    In-House Tailoring
                  </h4>
                  <p className="text-[12px] text-[#6B605B] font-normal mt-0.5">
                    Meticulous darting and flattering modest ease.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-full bg-white text-[#5A6B5C] shrink-0 border border-[#EFECE4] shadow-xs">
                  <Feather size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1C1C1C]">
                    Fluid Fabrics
                  </h4>
                  <p className="text-[12px] text-[#6B605B] font-normal mt-0.5">
                    Breathable crepes, washed silks, and soft rayon.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                id="brand-story-cta-btn"
                onClick={onOpenStoryModal}
                className="btn-luxury-primary"
              >
                <span>Read Full Story</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
