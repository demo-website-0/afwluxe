import { Product } from '../types';

/**
 * Currency configuration: Single currency across the entire application — Taka (৳ / BDT).
 * Formats with prefix symbol (e.g. ৳500, ৳1630, ৳2130) matching boutique design.
 */
export const CURRENCY_SYMBOL = '৳';
export const CURRENCY_CODE = 'BDT';

/**
 * Free shipping threshold in Taka (৳3,000 as in boutique reference)
 */
export const FREE_SHIPPING_THRESHOLD_BDT = 3000;
export const STANDARD_DELIVERY_FEE_BDT = 70;
export const STANDARD_SHIPPING_FEE_BDT = 70;

/**
 * Returns the price in Taka (BDT) for any given product.
 * If priceBDT is defined, uses it. Otherwise calculates from standard rate.
 */
export function getProductPriceBDT(product: Product): number {
  if (typeof product.priceBDT === 'number') {
    return product.priceBDT;
  }
  // Fallback conversion for items: default to realistic modest boutique Taka prices
  return Math.round(product.price * 28);
}

export function getProductOriginalPriceBDT(product: Product): number | undefined {
  if (typeof product.originalPrice === 'number') {
    return Math.round(product.originalPrice * 28);
  }
  return undefined;
}

/**
 * Formats a number as a clean Taka amount: e.g. "৳500", "৳1630", "৳2,130"
 */
export function formatTaka(amount: number, showDecimals: boolean = false): string {
  if (showDecimals) {
    return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-US')}`;
}

