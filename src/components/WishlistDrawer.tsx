import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { getProductPriceBDT, formatTaka } from '../utils/currency';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1C1C1C]/50 z-50 backdrop-blur-xs"
          />

          <motion.aside
            aria-label="Wishlist Drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#FDFCF7] z-50 shadow-2xl flex flex-col justify-between border-l border-[#EFECE4]"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#EFECE4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-[#C4A468] fill-[#C4A468]" />
                <h3 className="text-xl font-semibold tracking-tight text-[#1C1C1C]">
                  Your Wishlist ({wishlistProducts.length})
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#1C1C1C]/70 hover:text-[#C4A468] transition-colors cursor-pointer rounded-full hover:bg-white"
                aria-label="Close wishlist drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {wishlistProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#F4F1E8] flex items-center justify-center text-[#C4A468] border border-[#EFECE4]">
                    <Heart size={24} />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-[#1C1C1C]">Your wishlist is empty</p>
                    <p className="text-xs text-[#6B605B] font-light mt-1 max-w-xs">
                      Tap the heart icon on any piece to save your favorite London designs.
                    </p>
                  </div>
                </div>
              ) : (
                wishlistProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 p-3 bg-white border border-[#EFECE4] rounded-2xl shadow-xs"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-24 object-cover rounded-xl bg-[#F4F1E8] shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="text-base text-[#1C1C1C] font-semibold leading-snug">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveFromWishlist(product)}
                            className="text-[#6B605B]/60 hover:text-red-700 p-1 transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <span className="text-xs text-[#6B605B] font-normal block mt-0.5">
                          {product.categoryLabel} • {formatTaka(getProductPriceBDT(product))}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onAddToCart(product, product.sizes[0], product.colors[0].name);
                          onRemoveFromWishlist(product);
                        }}
                        className="mt-2 py-2 px-3 bg-[#C4A468] text-[#1C1C1C] hover:bg-[#B39255] hover:text-white text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-full font-bold transition-all shadow-xs"
                      >
                        <ShoppingBag size={13} />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlistProducts.length > 0 && (
              <div className="p-4 border-t border-[#EFECE4] bg-white text-center">
                <p className="text-[11px] text-[#6B605B] font-light">
                  Saved items remain in your browser for this session.
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
