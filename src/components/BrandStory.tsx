import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BrandStoryProps {
  onOpenStoryModal: () => void;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ onOpenStoryModal }) => {
  return (
    <section
      id="brand-story"
      aria-labelledby="story-heading"
      className="py-12 sm:py-20 lg:py-24 bg-[#FBF9F3] border-b border-[#EFECE4] scroll-mt-20 lg:scroll-mt-24 content-auto"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Pure, Clean Editorial Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#FDFCF7] shadow-[0_8px_30px_rgba(28,28,28,0.06)] group">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85"
                alt="AFW LUXE London In-House Atelier & Design Studio"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/5" />

              {/* 13+ Years Atelier Badge */}
              <div className="absolute bottom-3.5 left-3.5 sm:bottom-5 sm:left-5 z-10 bg-[#1C1C1C]/90 backdrop-blur-md text-[#FDFCF7] border border-[#C4A468]/35 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 select-none pointer-events-none">
                <span className="font-serif text-lg sm:text-2xl font-bold text-[#C4A468] tracking-tight leading-none">
                  13+
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white leading-tight">
                    Years of Atelier
                  </span>
                  <span className="text-[8px] sm:text-[9.5px] text-[#C4A468] tracking-wide font-medium">
                    London Craftsmanship
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal, Sleek Editorial Content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6 lg:pl-4">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#C4A468] font-bold">
              The London Atelier
            </span>

            <h2
              id="story-heading"
              className="text-2xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-semibold tracking-tight leading-[1.15]"
            >
              Designed in London. <br />
              <span className="font-light italic text-[#C4A468]">Made for You.</span>
            </h2>

            <p className="text-[#6B605B] text-sm sm:text-base lg:text-lg font-light leading-relaxed max-w-xl">
              Every AFW LUXE piece is pattern-cut in our London studio, pairing fluid luxury fabrics with timeless modest silhouettes.
            </p>

            <div className="pt-2">
              <button
                type="button"
                id="brand-story-cta-btn"
                onClick={onOpenStoryModal}
                className="group inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-[#1C1C1C] hover:text-[#C4A468] transition-colors cursor-pointer py-2 border-b border-[#1C1C1C] hover:border-[#C4A468]"
              >
                <span>Read Our Story</span>
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
