import React from 'react';
import { Instagram, Heart, ExternalLink } from 'lucide-react';
import { INSTAGRAM_POSTS } from '../data/products';

export const InstagramFeed: React.FC = () => {
  return (
    <section id="instagram-feed" aria-labelledby="instagram-heading" className="py-12 sm:py-20 lg:py-28 bg-[#FDFCF7] scroll-mt-20 lg:scroll-mt-24 content-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#C4A468] font-semibold mb-1.5 sm:mb-2">
            <Instagram size={14} />
            <span>London Lifestyle & Muse</span>
          </div>

          <h2 id="instagram-heading" className="text-2xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-semibold tracking-tight">
            Follow @afwluxe
          </h2>

          <p className="text-xs sm:text-sm text-[#6B605B] font-light mt-1.5 tracking-wide">
            Tag us for a chance to be featured
          </p>

          <div className="w-12 h-[2px] bg-[#B2948C] mx-auto mt-3 sm:mt-4" />
        </div>

        {/* 3-column mobile, 6-column desktop Instagram Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-3 lg:gap-4">
          {INSTAGRAM_POSTS.map((post) => (
            <div
              key={post.id}
              id={`instagram-post-${post.id}`}
              className="group relative aspect-square overflow-hidden bg-[#FDFCF7] rounded-lg sm:rounded-xl cursor-pointer shadow-2xs border border-[#EFECE4]"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover object-center zoom-image"
                loading="lazy"
                decoding="async"
              />

              {/* Hover / Active Overlay */}
              <div className="absolute inset-0 bg-[#1C1C1C]/80 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2 sm:p-3.5 text-white">
                <div className="flex items-center justify-between">
                  <Instagram size={14} className="text-[#FDFCF7]" />
                  <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-light">
                    <Heart size={11} fill="#C4A468" className="text-[#C4A468]" />
                    {post.likes}
                  </span>
                </div>

                <div>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#C4A468] block font-semibold">
                    Shop Look
                  </span>
                  <p className="text-[9px] sm:text-[11px] font-normal line-clamp-1 sm:line-clamp-2 text-[#FDFCF7] leading-tight mt-0.5">
                    {post.taggedProduct}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Link Button */}
        <div className="mt-10 text-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#1C1C1C] hover:text-[#C4A468] transition-colors py-1.5 border-b border-[#1C1C1C] hover:border-[#C4A468]"
          >
            <span>Join Our London Journal</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </section>
  );
};
