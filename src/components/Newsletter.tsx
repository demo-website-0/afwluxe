import React, { useState } from 'react';
import { Mail, Check, Copy } from 'lucide-react';
import { BRAND_LOGO } from '../constants/branding';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitted(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('LUXE10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="newsletter-section" aria-labelledby="newsletter-heading" className="py-12 sm:py-20 lg:py-28 bg-[#FDFCF7] border-y border-[#EFECE4]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <img
          src={BRAND_LOGO.dark}
          alt={BRAND_LOGO.alt}
          className="h-12 sm:h-20 w-auto object-contain mx-auto mb-3 sm:mb-4 drop-shadow-xs"
          onError={(e) => {
            (e.target as HTMLImageElement).src = BRAND_LOGO.remoteUrl;
          }}
        />

        <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[#B2948C] font-semibold block mb-1.5 sm:mb-2">
          Private Invitations
        </span>

        <h2 id="newsletter-heading" className="text-2xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-semibold tracking-tight">
          Join the AFW LUXE List
        </h2>

        <p className="max-w-xl mx-auto text-xs sm:text-base text-[#6B605B] font-light leading-relaxed mt-2.5 sm:mt-4">
          Be the first to receive new collection drops, styling notes, and exclusive offers. Plus, enjoy 10% off your first order.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="mt-6 sm:mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5 sm:gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B605B]/60">
                <Mail size={16} />
              </div>
              <input
                id="newsletter-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-[#FFFFFF] border border-[#EFECE4] text-xs sm:text-sm text-[#1C1C1C] placeholder-[#6B605B]/50 focus:outline-none focus:border-[#C4A468] transition-colors rounded-full shadow-xs"
              />
            </div>

            <button
              id="newsletter-submit-btn"
              type="submit"
              className="btn-luxury-primary shrink-0 py-3 sm:py-3.5 px-7 w-full sm:w-auto justify-center active:scale-95"
            >
              <span>Subscribe</span>
            </button>
          </form>
        ) : (
          <div className="mt-8 max-w-md mx-auto bg-[#F4F1E8] border border-[#EFECE4] p-6 rounded-2xl text-center space-y-3 shadow-sm">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#5A6B5C] text-white flex items-center justify-center shadow-xs">
              <Check size={18} />
            </div>
            <h3 className="font-semibold text-xl text-[#1C1C1C]">
              Welcome to AFW LUXE
            </h3>
            <p className="text-xs text-[#6B605B] font-normal">
              Your 10% welcome voucher has been unlocked. Apply at checkout:
            </p>
            <div className="inline-flex items-center gap-3 bg-[#FFFFFF] border border-[#C4A468] px-4 py-2 rounded-full shadow-xs">
              <span className="font-mono text-sm tracking-wider font-bold text-[#1C1C1C]">
                LUXE10
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs uppercase tracking-wider text-[#1C1C1C] hover:text-[#C4A468] flex items-center gap-1 cursor-pointer font-semibold"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 text-[11px] text-[#1C1C1C]/50 font-light tracking-wide">
          Respecting your privacy. You can unsubscribe at any moment with one click.
        </div>
      </div>
    </section>
  );
};
