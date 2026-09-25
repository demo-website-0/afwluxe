import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS } from '../data/products';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="py-20 lg:py-28 bg-[#FDFCF7] border-b border-[#EFECE4] scroll-mt-20 lg:scroll-mt-24 content-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.22em] text-[#B2948C] font-semibold block mb-2">
            Client Impressions
          </span>
          <h2 id="testimonials-heading" className="text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-semibold tracking-tight">
            Elegance in the Words of Our Patrons
          </h2>
          <div className="w-12 h-[2px] bg-[#B2948C] mx-auto mt-4" />
        </div>

        {/* 3 Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              id={`testimonial-${testimonial.id}`}
              className="bg-white p-8 sm:p-10 border border-[#EFECE4] shadow-[0_4px_20px_rgba(28,28,28,0.04)] flex flex-col justify-between rounded-2xl relative group hover:border-[#C4A468] hover:shadow-[0_12px_32px_rgba(28,28,28,0.08)] transition-all duration-300"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-6 text-[#C4A468]">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#C4A468" />
                  ))}
                </div>

                {/* Quote Text */}
                <blockquote className="font-serif text-lg sm:text-xl text-[#1C1C1C] font-normal leading-relaxed italic mb-6">
                  “{testimonial.quote}”
                </blockquote>
              </div>

              {/* Author Info */}
              <div className="pt-6 border-t border-[#EFECE4] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wider">
                      {testimonial.author}
                    </span>
                    <span title="Verified Client">
                      <CheckCircle2 size={13} className="text-[#5A6B5C]" />
                    </span>
                  </div>
                  <span className="text-xs text-[#6B605B] font-normal block">
                    {testimonial.location}
                  </span>
                </div>

                <div className="text-[11px] text-[#6B605B] text-right font-light italic max-w-[120px] truncate">
                  {testimonial.purchasedItem}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
