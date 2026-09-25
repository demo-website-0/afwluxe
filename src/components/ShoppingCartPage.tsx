import React from 'react';
import { X, Minus, Plus, Truck, ArrowLeft, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';
import { CartItem, Product } from '../types';
import {
  getProductPriceBDT,
  formatTaka,
  FREE_SHIPPING_THRESHOLD_BDT,
  STANDARD_DELIVERY_FEE_BDT,
} from '../utils/currency';

interface ShoppingCartPageProps {
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const ShoppingCartPage: React.FC<ShoppingCartPageProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  onSelectProduct,
}) => {
  // Financial calculations matching the reference design exactly
  const subtotal = items.reduce(
    (acc, item) => acc + getProductPriceBDT(item.product) * item.quantity,
    0
  );

  const isFreeDelivery = subtotal >= FREE_SHIPPING_THRESHOLD_BDT;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE_BDT;
  const total = subtotal + deliveryFee;

  const remainingForFreeDelivery = Math.max(0, FREE_SHIPPING_THRESHOLD_BDT - subtotal);
  const deliveryProgressPercent =
    items.length === 0
      ? 0
      : Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD_BDT) * 100));

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1C1C] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Top Link: — Continue Shopping */}
        <div className="mb-4">
          <button
            onClick={onContinueShopping}
            className="group inline-flex items-center gap-2 text-stone-600 hover:text-[#1C1C1C] text-sm font-medium transition-colors cursor-pointer"
          >
            <span className="text-stone-400 group-hover:text-[#1C1C1C] transition-colors">—</span>
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1C1C] tracking-tight mb-8">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-10 sm:p-16 border border-[#EFECE4] text-center max-w-2xl mx-auto shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EAE6DD] flex items-center justify-center mx-auto mb-5 text-[#1C1C1C]">
              <ShoppingBag size={28} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-[#1C1C1C] mb-2">Your Shopping Cart is Empty</h2>
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
              Looks like you haven't added anything to your cart yet. Explore our handcrafted modest abayas, hijabs, accessories, and curated jewelry.
            </p>
            <button
              onClick={onContinueShopping}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#3B0A14] hover:bg-[#4E0F1D] text-white text-sm font-semibold transition-all shadow-md cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowLeft size={16} className="rotate-180" />
            </button>
          </div>
        ) : (
          /* Cart Grid: Items on Left, Order Summary on Right */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {items.map((item, index) => {
                const itemPrice = getProductPriceBDT(item.product);
                const itemColorObj = item.product.colors?.find(
                  (c) => c.name.toLowerCase() === item.selectedColor?.toLowerCase()
                );

                return (
                  <div
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EFECE4] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4 relative transition-all"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                      {/* Product Thumbnail */}
                      <div
                        onClick={() => onSelectProduct?.(item.product)}
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#F6F4EF] border border-[#EAE6DD] shrink-0 flex items-center justify-center p-1 ${
                          onSelectProduct ? 'cursor-pointer hover:border-[#3B0A14] transition-colors' : ''
                        }`}
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Product Information */}
                      <div className="min-w-0">
                        <h2
                          onClick={() => onSelectProduct?.(item.product)}
                          className={`text-base sm:text-lg font-semibold text-[#1C1C1C] truncate ${
                            onSelectProduct ? 'cursor-pointer hover:text-[#3B0A14] transition-colors' : ''
                          }`}
                        >
                          {item.product.name}
                        </h2>

                        {/* Selected Size & Color Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 mb-1.5 text-xs text-stone-600">
                          {item.selectedSize && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EAE6DD] text-[#1C1C1C] text-[11px] font-medium">
                              Size: <strong className="font-semibold ml-1 text-[#1C1C1C]">{item.selectedSize}</strong>
                            </span>
                          )}

                          {item.selectedColor && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EAE6DD] text-[#1C1C1C] text-[11px] font-medium">
                              {itemColorObj?.hex && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-stone-300 shadow-2xs shrink-0"
                                  style={{ backgroundColor: itemColorObj.hex }}
                                  title={item.selectedColor}
                                />
                              )}
                              <span>Color: <strong className="font-semibold text-[#1C1C1C]">{item.selectedColor}</strong></span>
                            </span>
                          )}
                        </div>

                        <div className="text-base sm:text-lg font-bold text-[#1C1C1C] mb-2.5">
                          {formatTaka(itemPrice)}
                        </div>

                        {/* Quantity Pill Selector: [ -  1  + ] */}
                        <div className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 gap-3.5 text-xs sm:text-sm font-semibold text-[#1C1C1C] select-none">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                            className="text-stone-500 hover:text-[#1C1C1C] cursor-pointer transition-colors p-0.5"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>

                          <span className="min-w-[14px] text-center font-bold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            className="text-stone-500 hover:text-[#1C1C1C] cursor-pointer transition-colors p-0.5"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Remove Button (x) */}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="text-stone-400 hover:text-stone-800 transition-colors p-1.5 rounded-full hover:bg-stone-100 cursor-pointer self-start shrink-0 -mt-1 -mr-1"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      <X size={18} strokeWidth={2} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary Card (Sticky/Frozen on Scroll) */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 self-start">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFECE4] shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
                <h2 className="text-xl font-bold text-[#1C1C1C] mb-5">Order Summary</h2>

                {/* Free Delivery Progress Box */}
                <div className="bg-[#FAF0ED] rounded-2xl p-4 sm:p-4.5 border border-[#F4E3DF] mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-[#3B0A14]" />
                      <span className="text-xs font-bold text-[#1C1C1C]">Free Delivery</span>
                    </div>
                    <span className="text-xs font-bold text-[#1C1C1C]">
                      {deliveryProgressPercent}%
                    </span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="w-full h-2 bg-[#EADBD7] rounded-full overflow-hidden my-2.5">
                    <div
                      className="h-full bg-[#3B0A14] rounded-full transition-all duration-300"
                      style={{ width: `${deliveryProgressPercent}%` }}
                    />
                  </div>

                  {/* Hint Text */}
                  {remainingForFreeDelivery > 0 ? (
                    <p className="text-xs text-stone-700">
                      Add <strong className="font-bold text-[#1C1C1C]">{formatTaka(remainingForFreeDelivery)}</strong> more for{' '}
                      <strong className="font-bold text-[#1C1C1C]">Free Delivery!</strong>
                    </p>
                  ) : (
                    <p className="text-xs text-[#2D5A38] font-bold flex items-center gap-1.5">
                      <Sparkles size={13} />
                      <span>Complimentary Free Delivery Unlocked!</span>
                    </p>
                  )}
                </div>

                {/* Subtotal & Delivery Breakdown */}
                <div className="space-y-3 text-base">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-normal">Subtotal</span>
                    <span className="text-[#1C1C1C] font-semibold">{formatTaka(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-normal">Delivery</span>
                    <span className="text-[#1C1C1C] font-semibold">
                      {deliveryFee === 0 ? 'Free' : formatTaka(deliveryFee)}
                    </span>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="border-t border-[#1C1C1C] my-4" />

                {/* Total */}
                <div className="flex items-center justify-between text-base sm:text-lg font-bold text-[#1C1C1C]">
                  <span>Total</span>
                  <span>{formatTaka(total)}</span>
                </div>

                {/* Proceed to Checkout Button */}
                <button
                  type="button"
                  onClick={onCheckout}
                  className="w-full mt-6 py-4 rounded-full bg-[#3B0A14] hover:bg-[#4E0F1D] active:scale-[0.99] text-white font-semibold text-sm sm:text-base tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                </button>

                {/* Security trust note */}
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
                  <ShieldCheck size={14} className="text-[#C4A468]" />
                  <span>Secure SSL Checkout & Express Delivery across Bangladesh</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
