import React from 'react';

interface CartIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Supermarket wire-grid shopping cart icon matching the attachment:
 * - Angled top-left push handle
 * - Wire mesh basket with 3 horizontal and 4 vertical interior bars
 * - Rear chassis support strut
 * - Horizontal axle connecting two hollow-center wheels
 */
export const CartIcon: React.FC<CartIconProps> = ({
  size = 20,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Wheels: Circular rings with hollow centers */}
      <circle cx="88" cy="436" r="38" strokeWidth="28" fill="none" />
      <circle cx="424" cy="436" r="38" strokeWidth="28" fill="none" />

      {/* Horizontal axle connecting the two wheels */}
      <line x1="126" y1="436" x2="386" y2="436" strokeWidth="28" />

      {/* Frame strut from basket base down to rear wheel */}
      <line x1="112" y1="344" x2="96" y2="398" strokeWidth="28" />

      {/* Angled handle at top-left */}
      <polyline points="24,44 74,74 112,344" strokeWidth="28" strokeLinecap="round" />

      {/* Basket outer rim (slanted trapezoid with front lip) */}
      <polygon points="86,114 492,146 436,344 112,344" strokeWidth="28" fill="none" />

      {/* 3 Horizontal grid divider wires */}
      <line x1="93" y1="172" x2="478" y2="196" strokeWidth="20" />
      <line x1="99" y1="229" x2="464" y2="245" strokeWidth="20" />
      <line x1="106" y1="287" x2="450" y2="295" strokeWidth="20" />

      {/* 4 Vertical grid divider wires */}
      <line x1="167" y1="120" x2="177" y2="344" strokeWidth="20" />
      <line x1="248" y1="127" x2="242" y2="344" strokeWidth="20" />
      <line x1="329" y1="133" x2="307" y2="344" strokeWidth="20" />
      <line x1="411" y1="140" x2="372" y2="344" strokeWidth="20" />
    </svg>
  );
};
