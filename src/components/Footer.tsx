import React from 'react';
import { Instagram, Facebook, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BRAND_LOGO } from '../constants/branding';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenStory: () => void;
  onOpenAdmin?: () => void;
  onOpenPolicy?: (key: 'privacyPolicy' | 'termsOfService' | 'returnPolicy' | 'shippingPolicy') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenStory,
  onOpenAdmin,
  onOpenPolicy,
}) => {
  return (
    <footer id="main-footer" aria-label="Footer" className="bg-[#1C1C1C] text-[#FDFCF7] pt-12 sm:pt-16 lg:pt-20 pb-12 border-t border-[#C4A468]/20 content-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 pb-10 sm:pb-14 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col items-start">
              <img
                src={BRAND_LOGO.light}
                alt={BRAND_LOGO.alt}
                className="h-16 sm:h-20 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = BRAND_LOGO.remoteUrl;
                  target.className = 'h-16 sm:h-20 w-auto object-contain brightness-0 invert';
                }}
              />
              <span className="text-[10px] tracking-[0.3em] text-[#C4A468] uppercase font-semibold pl-0.5 mt-1.5">
                London Atelier • For Her
              </span>
            </div>

            <p className="text-sm text-[#FDFCF7]/75 font-light leading-relaxed max-w-sm">
              AFW LUXE | London-designed luxury womenswear. Trendy women’s tops, elegant long dresses, Kurtis, and chic abayas—designed by our in-house team in London for luxury collections.
            </p>

            <div className="pt-2 flex items-center space-x-3 text-[#FDFCF7]/80">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-[#C4A468] hover:text-[#C4A468] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-[#C4A468] hover:text-[#C4A468] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={15} />
              </a>
            </div>
          </div>

          {/* Col 1: Shop */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold tracking-wider text-white">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs uppercase tracking-[0.12em] font-medium text-[#FDFCF7]/70">
              <li>
                <button
                  onClick={() => onSelectCategory('abayas')}
                  className="hover:text-[#C4A468] transition-colors cursor-pointer"
                >
                  Abayas & Kaftans
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('dresses')}
                  className="hover:text-[#C4A468] transition-colors cursor-pointer"
                >
                  Modest Maxi Dresses
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('kurtis')}
                  className="hover:text-[#C4A468] transition-colors cursor-pointer"
                >
                  Tops & Co-Ords
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('accessories')}
                  className="hover:text-[#C4A468] transition-colors cursor-pointer"
                >
                  Accessories & Khimars
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('all')}
                  className="hover:text-[#C4A468] transition-colors cursor-pointer"
                >
                  All Collections
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: About & Atelier */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold tracking-wider text-white">
              About
            </h4>
            <ul className="space-y-2 text-xs uppercase tracking-[0.12em] font-medium text-[#FDFCF7]/70">
              <li>
                <button
                  onClick={onOpenStory}
                  className="hover:text-[#C4A468] transition-colors cursor-pointer"
                >
                  Our London Atelier
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenStory}
                  className="hover:text-[#C4A468] transition-colors cursor-pointer"
                >
                  Fabric & Modest Cuts
                </button>
              </li>
              <li>
                <span className="text-white/40">Sustainability</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Help & Contact */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold tracking-wider text-white">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-xs font-normal text-[#FDFCF7]/75">
              <li className="flex items-center gap-2">
                <MapPin size={13} className="text-[#C4A468] shrink-0" />
                <span>Mayfair & Chelsea, London UK</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-[#C4A468] shrink-0" />
                <span>concierge@afwluxe.co.uk</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-[#C4A468] shrink-0" />
                <span>+44 (0) 20 7946 0928</span>
              </li>
              <li className="pt-2 text-[11px] text-[#FDFCF7]/50">
                Monday–Friday: 9am – 6pm GMT
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#FDFCF7]/60 font-light">
          <div>
            © 2025 AFW LUXE. All rights reserved.
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            {onOpenPolicy ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('privacyPolicy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('termsOfService')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('returnPolicy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Delivery & Returns
                </button>
              </>
            ) : (
              <>
                <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
                <span>•</span>
                <a href="#returns" className="hover:text-white transition-colors">Delivery & Returns</a>
              </>
            )}
            {onOpenAdmin && (
              <>
                <span>•</span>
                <button
                  id="admin-portal-footer-link"
                  onClick={onOpenAdmin}
                  className="text-[#C4A468] hover:text-white transition-colors cursor-pointer font-medium"
                >
                  Admin Portal
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
