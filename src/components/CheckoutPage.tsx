import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Copy,
  Check,
  Truck,
  Package,
  ShoppingBag,
  Info,
  Clock,
  MapPin,
  Phone,
  User,
  AlertCircle
} from 'lucide-react';
import { CartItem } from '../types';
import { getProductPriceBDT, formatTaka } from '../utils/currency';
import { useAdminData } from '../context/AdminDataContext';
import { TrackOrderModal } from './TrackOrderModal';

interface CheckoutPageProps {
  items: CartItem[];
  onBackToCart: () => void;
  onContinueShopping: () => void;
  onOrderSuccess: (orderInfo: OrderSuccessData) => void;
}

export interface OrderSuccessData {
  orderId: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  cityArea?: string;
  shipmentZone: 'inside' | 'outside';
  deliveryFee: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  trxId?: string;
  mfsSenderNumber?: string;
  paidAmount?: number;
  paymentDate?: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  paymentStatus: 'Pending' | 'Verification Needed' | 'Paid';
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  onBackToCart,
  onContinueShopping,
  onOrderSuccess,
}) => {
  const { addOrder, lockInventory, releaseInventoryLocks } = useAdminData();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cityArea, setCityArea] = useState('');
  const [shipmentZone, setShipmentZone] = useState<'inside' | 'outside'>('inside');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  
  // MFS Payment Details (bKash & Nagad)
  const [mfsSenderNumber, setMfsSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [orderNotes, setOrderNotes] = useState('');

  // Inventory Locking
  const [lockConflict, setLockConflict] = useState<string | null>(null);

  // Tracking Modal State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [copiedTrackingUrl, setCopiedTrackingUrl] = useState(false);

  // Check and lock inventory for 10 minutes when arriving on checkout
  useEffect(() => {
    if (items.length > 0) {
      const lockRes = lockInventory(items);
      if (!lockRes.success) {
        setLockConflict(
          `Item "${lockRes.errorItemName}" is temporarily locked in another active checkout session or out of stock. Please return to bag.`
        );
      } else {
        setLockConflict(null);
      }
    }
    return () => {
      // release lock on leave if not completed
    };
  }, [items]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Validation & Submission state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderSuccessData | null>(null);

  // Financial calculations
  const subtotal = items.reduce(
    (acc, item) => acc + getProductPriceBDT(item.product) * item.quantity,
    0
  );

  // Shipment rate: Inside Dhaka = 70, Outside Dhaka = 130
  const deliveryFee = items.length === 0 ? 0 : shipmentZone === 'inside' ? 70 : 130;

  // Coupon discount
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Available coupons
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (cleanCode === 'AFW10' || cleanCode === 'WELCOME10') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 10, description: '10% off entire order' });
      setCouponSuccess('Promo code applied: 10% discount!');
    } else if (cleanCode === 'RAMADAN' || cleanCode === 'LUXE15') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 15, description: '15% Luxe Ramadan special' });
      setCouponSuccess('Promo code applied: 15% discount!');
    } else {
      setCouponError('Invalid coupon code. Try AFW10 for 10% off');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess(null);
    setCouponError(null);
  };

  const handleCopyNumber = (num: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  // Synchronize default paid amount with current total
  React.useEffect(() => {
    if (!paidAmount || Number(paidAmount) === 0) {
      setPaidAmount(total.toString());
    }
  }, [total]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name';
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678)';
    }

    if (!address.trim() || address.trim().length < 5) {
      newErrors.address = 'Please enter your complete delivery address';
    }

    if (!cityArea.trim()) {
      newErrors.cityArea = 'City / Area is mandatory for our courier delivery partners';
    }

    // Strict validation for bKash & Nagad payments to prevent bypasses
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      const provider = paymentMethod === 'bkash' ? 'bKash' : 'Nagad';
      const cleanSender = mfsSenderNumber.trim().replace(/[\s-]/g, '');

      if (!cleanSender) {
        newErrors.mfsSenderNumber = `${provider} sender number is required`;
      } else if (!/^01[3-9]\d{8}$/.test(cleanSender)) {
        newErrors.mfsSenderNumber = `Please enter a valid 11-digit ${provider} number`;
      }

      const cleanTrx = trxId.trim();
      if (!cleanTrx) {
        newErrors.trxId = `${provider} Transaction ID is required`;
      } else if (cleanTrx.length < 5) {
        newErrors.trxId = 'Please enter a valid Transaction ID (at least 5 characters)';
      }

      if (!paidAmount || isNaN(Number(paidAmount)) || Number(paidAmount) <= 0) {
        newErrors.paidAmount = 'Please enter a valid paid amount';
      }

      if (!paymentDate) {
        newErrors.paymentDate = 'Payment date is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrors({ form: 'Your cart is empty. Please add items before checking out.' });
      return;
    }

    if (!validateForm()) {
      // Scroll smoothly to checkout form section
      const formEl = document.getElementById('checkout-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 200, behavior: 'smooth' });
      }
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedOrderId = `AFW-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // CRITICAL SECURITY RULE:
      // An order paid via bKash or Nagad is NEVER marked 'Paid' automatically.
      // It is placed in 'Verification Needed' so the merchant can verify the TrxID.
      // Cash on Delivery is marked 'Pending'.
      const initialPaymentStatus: 'Pending' | 'Verification Needed' =
        paymentMethod === 'cod' ? 'Pending' : 'Verification Needed';

      const orderData: OrderSuccessData = {
        orderId: generatedOrderId,
        customerName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        cityArea: cityArea.trim(),
        shipmentZone,
        deliveryFee,
        paymentMethod,
        trxId: paymentMethod === 'cod' ? undefined : trxId.trim().toUpperCase(),
        mfsSenderNumber: paymentMethod === 'cod' ? undefined : mfsSenderNumber.trim(),
        paidAmount: paymentMethod === 'cod' ? total : (Number(paidAmount) || total),
        paymentDate: paymentMethod === 'cod' ? undefined : paymentDate,
        notes: orderNotes.trim() || undefined,
        items: [...items],
        subtotal,
        discount: discountAmount,
        total,
        paymentStatus: initialPaymentStatus,
        date: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };

      // Persist order in Admin Dashboard with rich payment details
      if (addOrder) {
        addOrder({
          customer: {
            name: fullName.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            address: address.trim(),
            city: cityArea.trim() || (shipmentZone === 'inside' ? 'Dhaka' : 'Outside Dhaka'),
            notes: orderNotes.trim() || undefined,
          },
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            size: i.selectedSize || 'Standard',
            color: i.selectedColor || 'Default',
            quantity: i.quantity,
            priceBDT: getProductPriceBDT(i.product),
            image: i.product.image,
          })),
          subtotalBDT: subtotal,
          shippingBDT: deliveryFee,
          discountBDT: discountAmount,
          totalBDT: total,
          paymentStatus: initialPaymentStatus,
          fulfillmentStatus: 'Processing',
          paymentMethod: paymentMethod,
          paymentDetails: {
            method: paymentMethod,
            senderNumber: paymentMethod === 'cod' ? undefined : mfsSenderNumber.trim(),
            trxId: paymentMethod === 'cod' ? undefined : trxId.trim().toUpperCase(),
            paidAmount: paymentMethod === 'cod' ? total : (Number(paidAmount) || total),
            paymentDate: paymentDate || new Date().toISOString().split('T')[0],
            merchantNumber: '01792208949',
          },
        });
      }

      // Release locks after successfully placing order
      releaseInventoryLocks(items);

      setIsSubmitting(false);
      setCompletedOrder(orderData);
      onOrderSuccess(orderData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  };

  // If order was successfully completed, show celebration confirmation screen
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#1C1C1C] py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE6DC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-center">
            {/* Success icon */}
            <div className="w-16 h-16 rounded-full bg-[#EBF0EC] text-[#5A6B5C] flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CheckCircle2 size={36} strokeWidth={2} />
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] text-xs font-semibold uppercase tracking-wider text-[#5A6B5C] mb-3">
              Order Confirmed
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1C1C] tracking-tight mb-2">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
              We have received your order{' '}
              <span className="font-semibold text-[#1C1C1C]">#{completedOrder.orderId}</span>. A confirmation SMS will be sent to{' '}
              <span className="font-medium text-[#1C1C1C]">{completedOrder.phone}</span>.
            </p>

            {/* Order snapshot card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 sm:p-6 border border-[#EBE6DC] text-left mb-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E2D8] pb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-stone-500">Order Number</div>
                  <div className="text-base font-bold text-[#1C1C1C]">#{completedOrder.orderId}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-stone-500">Estimated Delivery</div>
                  <div className="text-sm font-semibold text-[#1C1C1C] flex items-center gap-1.5">
                    <Clock size={14} className="text-[#C4A468]" />
                    <span>
                      {completedOrder.shipmentZone === 'inside'
                        ? '1-2 Days (Inside Dhaka)'
                        : '3-5 Days (Outside Dhaka)'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-stone-500">Payment Status</div>
                  <div className="text-sm font-semibold text-[#1C1C1C] flex items-center gap-1.5 mt-0.5">
                    {completedOrder.paymentMethod === 'cod' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        Cash on Delivery (Unpaid)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <Clock size={12} /> Verification in Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Instructions Box (If bKash / Nagad) */}
              {completedOrder.paymentMethod !== 'cod' ? (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                    <span className="font-bold uppercase tracking-wider text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                      <Smartphone size={16} className="text-[#E2136E]" />
                      <span>{completedOrder.paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Payment Transfer Details</span>
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-200/80 text-amber-900">
                      Action Required
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-amber-200">
                    <div>
                      <span className="text-[11px] text-stone-500 uppercase tracking-wider block">Send Money To Number</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="text-base font-bold text-[#E2136E] font-mono tracking-wider">01792208949</strong>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber('01792208949')}
                          className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedNumber ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 uppercase tracking-wider block">Exact Amount to Send</span>
                      <strong className="text-base font-bold text-stone-900 mt-0.5 block">
                        {formatTaka(completedOrder.total)}
                      </strong>
                    </div>
                  </div>

                  <ol className="list-decimal list-inside space-y-1 text-xs text-amber-950 leading-relaxed pt-1">
                    <li>Open your {completedOrder.paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} app and choose <strong>"Send Money"</strong></li>
                    <li>Enter recipient number: <strong>01792208949</strong></li>
                    <li>Enter exact amount: <strong>{formatTaka(completedOrder.total)}</strong></li>
                    <li>Reference: <strong>#{completedOrder.orderId}</strong></li>
                    <li>
                      {completedOrder.trxId ? (
                        <span>Submitted TrxID: <strong className="font-mono bg-amber-100 px-1.5 py-0.5 rounded select-all">{completedOrder.trxId}</strong> (Under Verification)</span>
                      ) : (
                        <span>Save your Transaction ID and SMS confirmation.</span>
                      )}
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 text-xs sm:text-sm text-emerald-950 text-left">
                  <p className="leading-relaxed">
                    <strong>Cash on Delivery:</strong> Please keep exactly <strong>{formatTaka(completedOrder.total)}</strong> in cash ready to hand to the delivery courier upon doorstep delivery.
                  </p>
                </div>
              )}

              {/* Unique Order Tracking Link */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E2D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                    Unique Tracking Link
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-semibold text-[#1C1C1C] break-all">
                    https://afwluxe.com/track/{completedOrder.orderId}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(`https://afwluxe.com/track/${completedOrder.orderId}`);
                      setCopiedTrackingUrl(true);
                      setTimeout(() => setCopiedTrackingUrl(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedTrackingUrl ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedTrackingUrl ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTrackModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#1C1C1C] hover:bg-[#2B0F15] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck size={13} />
                    <span>Track Status</span>
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-stone-600">
                <div>
                  <div className="font-semibold text-[#1C1C1C] mb-1 flex items-center gap-1.5">
                    <User size={14} className="text-stone-400" />
                    <span>Recipient</span>
                  </div>
                  <p>{completedOrder.customerName}</p>
                  <p>{completedOrder.phone}</p>
                  {completedOrder.email && <p>{completedOrder.email}</p>}
                </div>
                <div>
                  <div className="font-semibold text-[#1C1C1C] mb-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-stone-400" />
                    <span>Shipping Address</span>
                  </div>
                  <p>{completedOrder.address}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {completedOrder.shipmentZone === 'inside' ? 'Inside Dhaka Region' : 'Outside Dhaka Region'}
                  </p>
                </div>
              </div>

              {/* Items Summary list */}
              <div className="border-t border-[#E8E2D8] pt-4">
                <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">Items Ordered</div>
                <div className="space-y-2.5">
                  {completedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-medium text-[#1C1C1C]">{item.product.name}</div>
                          <div className="text-stone-500 text-xs flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span>Qty: {item.quantity}</span>
                            {item.selectedSize && (
                              <span>• Size: <strong className="text-stone-800 font-semibold">{item.selectedSize}</strong></span>
                            )}
                            {item.selectedColor && (
                              <span>• Color: <strong className="text-stone-800 font-semibold">{item.selectedColor}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-[#1C1C1C]">
                        {formatTaka(getProductPriceBDT(item.product) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Row */}
              <div className="border-t border-[#E8E2D8] pt-3 flex items-center justify-between font-bold text-base sm:text-lg text-[#1C1C1C]">
                <span>Total Amount</span>
                <span>{formatTaka(completedOrder.total)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onContinueShopping}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#2B0F15] hover:bg-[#3D141E] text-white text-sm font-semibold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1C1C] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb: — Back to cart */}
        <div className="mb-4">
          <button
            type="button"
            onClick={onBackToCart}
            className="group inline-flex items-center gap-2 text-stone-600 hover:text-[#1C1C1C] text-sm font-medium transition-colors cursor-pointer"
          >
            <span className="text-stone-400 group-hover:text-[#1C1C1C] transition-colors">—</span>
            <span>Back to cart</span>
          </button>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1C1C] tracking-tight mb-8">
          Checkout
        </h1>

        {lockConflict && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-700 flex-shrink-0" />
            <div className="flex-1 text-xs sm:text-sm">
              <strong className="block font-bold">Checkout Reservation Alert:</strong>
              {lockConflict}
            </div>
            <button
              type="button"
              onClick={onBackToCart}
              className="px-3 py-1.5 bg-amber-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
            >
              Back to Bag
            </button>
          </div>
        )}

        {errors.form && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Form Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Full name */}
              <div>
                <label htmlFor="checkout-full-name" className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                  Full name <span className="text-[#C43838]">*</span>
                </label>
                <input
                  id="checkout-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  placeholder="Your full name"
                  className={`w-full px-4 py-3.5 rounded-2xl bg-[#FAF7F2] sm:bg-[#FAF7F2] border ${
                    errors.fullName ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5DFD7] focus:border-[#2B0F15]'
                  } text-stone-800 placeholder-stone-400 text-sm sm:text-base outline-none transition-colors shadow-none`}
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* 2. Phone number */}
              <div>
                <label htmlFor="checkout-phone" className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                  Phone number <span className="text-[#C43838]">*</span>{' '}
                  <span className="text-xs font-normal text-stone-500">(11 digits)</span>
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  placeholder="01XXXXXXXXX"
                  className={`w-full px-4 py-3.5 rounded-2xl bg-[#FAF7F2] border ${
                    errors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5DFD7] focus:border-[#2B0F15]'
                  } text-stone-800 placeholder-stone-400 text-sm sm:text-base outline-none transition-colors shadow-none`}
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* 3. Email (optional) */}
              <div>
                <label htmlFor="checkout-email" className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                  Email <span className="text-xs font-normal text-stone-500">(optional)</span>
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD7] focus:border-[#2B0F15] text-stone-800 placeholder-stone-400 text-sm sm:text-base outline-none transition-colors shadow-none"
                />
              </div>

              {/* 4. Full address */}
              <div>
                <label htmlFor="checkout-address" className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                  Full address <span className="text-[#C43838]">*</span>
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  placeholder="House, road, area"
                  className={`w-full px-4 py-3.5 rounded-2xl bg-[#FAF7F2] border ${
                    errors.address ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5DFD7] focus:border-[#2B0F15]'
                  } text-stone-800 placeholder-stone-400 text-sm sm:text-base outline-none transition-colors shadow-none`}
                />
                {errors.address && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>

              {/* 4b. City / Area (Mandatory for Couriers) */}
              <div>
                <label htmlFor="checkout-city-area" className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                  City / Specific Area <span className="text-[#C43838]">*</span>
                </label>
                <input
                  id="checkout-city-area"
                  type="text"
                  value={cityArea}
                  onChange={(e) => {
                    setCityArea(e.target.value);
                    if (errors.cityArea) setErrors((prev) => ({ ...prev, cityArea: '' }));
                  }}
                  placeholder="e.g. Dhanmondi, Gulshan 2, Uttara Sector 7, Agrabad Chittagong, Zindabazar Sylhet"
                  className={`w-full px-4 py-3.5 rounded-2xl bg-[#FAF7F2] border ${
                    errors.cityArea ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5DFD7] focus:border-[#2B0F15]'
                  } text-stone-800 placeholder-stone-400 text-sm sm:text-base outline-none transition-colors shadow-none`}
                />
                {errors.cityArea && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <span>{errors.cityArea}</span>
                  </p>
                )}
              </div>

              {/* 5. Shipment */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-2.5">
                  Shipment <span className="text-[#C43838]">*</span>
                </label>
                <div className="space-y-3">
                  {/* Inside Dhaka */}
                  <div
                    onClick={() => setShipmentZone('inside')}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all cursor-pointer ${
                      shipmentZone === 'inside'
                        ? 'border-[#2B0F15] bg-[#ECE5DC]/70'
                        : 'border-[#E5DFD7] bg-[#FAF7F2] hover:bg-[#F3EEE7]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        shipmentZone === 'inside' ? 'border-[#2B0F15]' : 'border-stone-400'
                      }`}
                    >
                      {shipmentZone === 'inside' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2B0F15]" />
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-normal text-[#1C1C1C]">
                      Inside Dhaka: <span className="font-semibold">৳70.00</span>
                    </span>
                  </div>

                  {/* Outside Dhaka */}
                  <div
                    onClick={() => setShipmentZone('outside')}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all cursor-pointer ${
                      shipmentZone === 'outside'
                        ? 'border-[#2B0F15] bg-[#ECE5DC]/70'
                        : 'border-[#E5DFD7] bg-[#FAF7F2] hover:bg-[#F3EEE7]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        shipmentZone === 'outside' ? 'border-[#2B0F15]' : 'border-stone-400'
                      }`}
                    >
                      {shipmentZone === 'outside' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2B0F15]" />
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-normal text-[#1C1C1C]">
                      Outside Dhaka: <span className="font-semibold">৳130.00</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. Payment Method */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-2.5">
                  Payment Method <span className="text-[#C43838]">*</span>
                </label>
                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#2B0F15] bg-[#ECE5DC]/70'
                        : 'border-[#E5DFD7] bg-[#FAF7F2] hover:bg-[#F3EEE7]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-stone-200/60 border border-stone-300/80 flex items-center justify-center text-[#2B0F15]">
                        <Banknote size={20} strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-semibold text-[#1C1C1C]">
                          Cash on Delivery
                        </div>
                        <div className="text-xs sm:text-sm text-stone-500">
                          Pay in cash when your order arrives.
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === 'cod' ? 'border-[#2B0F15]' : 'border-stone-400'
                      }`}
                    >
                      {paymentMethod === 'cod' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2B0F15]" />
                      )}
                    </div>
                  </div>

                  {/* bKash */}
                  <div
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'bkash'
                        ? 'border-[#2B0F15] bg-[#ECE5DC]/70'
                        : 'border-[#E5DFD7] bg-[#FAF7F2] hover:bg-[#F3EEE7]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-stone-200/60 border border-stone-300/80 flex items-center justify-center text-[#2B0F15]">
                          <Smartphone size={20} strokeWidth={1.75} />
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-semibold text-[#1C1C1C]">bKash</div>
                          <div className="text-xs sm:text-sm text-stone-500">
                            Pay via bKash (Send Money). We'll confirm by SMS.
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === 'bkash' ? 'border-[#2B0F15]' : 'border-stone-400'
                        }`}
                      >
                        {paymentMethod === 'bkash' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#2B0F15]" />
                        )}
                      </div>
                    </div>

                    {/* Expandable bKash instructions */}
                    {paymentMethod === 'bkash' && (
                      <div
                        className="mt-4 pt-4 border-t border-rose-200/80 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Pink Instruction Box exactly matching screenshot */}
                        <div className="bg-[#FFF5F7] border border-[#FED7E2] rounded-2xl p-4 sm:p-5 text-stone-800 text-xs sm:text-sm">
                          <h4 className="font-bold text-[#D12053] text-sm sm:text-base mb-2.5">
                            bKash Payment Instructions
                          </h4>
                          <ol className="space-y-1.5 text-stone-700 leading-relaxed list-decimal list-inside font-normal">
                            <li>Open bKash app and select <span className="font-semibold text-stone-900">"Send Money"</span></li>
                            <li className="flex items-center gap-2 flex-wrap">
                              <span>Send to: <strong className="font-bold text-[#D12053] tracking-wider text-sm sm:text-base">01792208949</strong></span>
                              <button
                                type="button"
                                onClick={() => handleCopyNumber('01792208949')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-rose-200 text-xs font-semibold text-[#D12053] hover:bg-rose-50 cursor-pointer shadow-2xs"
                              >
                                {copiedNumber ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                              </button>
                            </li>
                            <li>Amount: <strong className="font-bold text-stone-900">{formatTaka(total)}</strong></li>
                            <li>Complete the transaction and note the <span className="font-semibold text-stone-900">Transaction ID</span></li>
                            <li>Fill in the details below</li>
                          </ol>
                        </div>

                        {/* 4 Required Form Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          {/* 1. bKash Sender Number */}
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              bKash Sender Number <span className="text-[#C43838]">*</span>
                            </label>
                            <input
                              type="tel"
                              value={mfsSenderNumber}
                              onChange={(e) => {
                                setMfsSenderNumber(e.target.value);
                                if (errors.mfsSenderNumber) {
                                  setErrors((prev) => ({ ...prev, mfsSenderNumber: '' }));
                                }
                              }}
                              placeholder="01XXXXXXXXX"
                              className={`w-full px-3.5 py-2.5 rounded-xl bg-white border ${
                                errors.mfsSenderNumber
                                  ? 'border-rose-400 focus:border-rose-500'
                                  : 'border-[#E5DFD7] focus:border-[#D12053]'
                              } text-xs sm:text-sm text-stone-800 outline-none`}
                            />
                            {errors.mfsSenderNumber && (
                              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                                {errors.mfsSenderNumber}
                              </p>
                            )}
                          </div>

                          {/* 2. Transaction ID */}
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Transaction ID <span className="text-[#C43838]">*</span>
                            </label>
                            <input
                              type="text"
                              value={trxId}
                              onChange={(e) => {
                                setTrxId(e.target.value.toUpperCase());
                                if (errors.trxId) {
                                  setErrors((prev) => ({ ...prev, trxId: '' }));
                                }
                              }}
                              placeholder="e.g. 9X8Y7Z"
                              className={`w-full px-3.5 py-2.5 rounded-xl bg-white border ${
                                errors.trxId
                                  ? 'border-rose-400 focus:border-rose-500'
                                  : 'border-[#E5DFD7] focus:border-[#D12053]'
                              } text-xs sm:text-sm text-stone-800 uppercase font-mono outline-none`}
                            />
                            {errors.trxId && (
                              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                                {errors.trxId}
                              </p>
                            )}
                          </div>

                          {/* 3. Paid Amount */}
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Paid Amount <span className="text-[#C43838]">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                                ৳
                              </span>
                              <input
                                type="number"
                                value={paidAmount}
                                onChange={(e) => {
                                  setPaidAmount(e.target.value);
                                  if (errors.paidAmount) {
                                    setErrors((prev) => ({ ...prev, paidAmount: '' }));
                                  }
                                }}
                                placeholder={total.toString()}
                                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border ${
                                  errors.paidAmount
                                    ? 'border-rose-400 focus:border-rose-500'
                                    : 'border-[#E5DFD7] focus:border-[#D12053]'
                                } text-xs sm:text-sm text-stone-800 font-semibold outline-none`}
                              />
                            </div>
                            {errors.paidAmount && (
                              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                                {errors.paidAmount}
                              </p>
                            )}
                          </div>

                          {/* 4. Payment Date */}
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Payment Date <span className="text-[#C43838]">*</span>
                            </label>
                            <input
                              type="date"
                              value={paymentDate}
                              onChange={(e) => {
                                setPaymentDate(e.target.value);
                                if (errors.paymentDate) {
                                  setErrors((prev) => ({ ...prev, paymentDate: '' }));
                                }
                              }}
                              className={`w-full px-3.5 py-2.5 rounded-xl bg-white border ${
                                errors.paymentDate
                                  ? 'border-rose-400 focus:border-rose-500'
                                  : 'border-[#E5DFD7] focus:border-[#D12053]'
                              } text-xs sm:text-sm text-stone-800 outline-none`}
                            />
                            {errors.paymentDate && (
                              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                                {errors.paymentDate}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nagad */}
                  <div
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'nagad'
                        ? 'border-[#C44D24] bg-[#FFF8F5]'
                        : 'border-[#E5DFD7] bg-[#FAF7F2] hover:bg-[#F3EEE7]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#C44D24]">
                          <Smartphone size={20} strokeWidth={1.75} />
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-semibold text-[#1C1C1C]">Nagad</div>
                          <div className="text-xs sm:text-sm text-stone-500">
                            Pay via Nagad (Send Money).
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === 'nagad' ? 'border-[#C44D24]' : 'border-stone-400'
                        }`}
                      >
                        {paymentMethod === 'nagad' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#C44D24]" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Nagad instructions */}
                    {paymentMethod === 'nagad' && (
                      <div
                        className="mt-4 pt-4 border-t border-orange-200/80 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Orange Instruction Box */}
                        <div className="bg-[#FFF5ED] border border-[#FED7AA] rounded-2xl p-4 sm:p-5 text-stone-800 text-xs sm:text-sm">
                          <h4 className="font-bold text-[#C44D24] text-sm sm:text-base mb-2.5">
                            Nagad Payment Instructions
                          </h4>
                          <ol className="space-y-1.5 text-stone-700 leading-relaxed list-decimal list-inside font-normal">
                            <li>Open Nagad app and select <span className="font-semibold text-stone-900">"Send Money"</span></li>
                            <li className="flex items-center gap-2 flex-wrap">
                              <span>Send to: <strong className="font-bold text-[#C44D24] tracking-wider text-sm sm:text-base">01792208949</strong></span>
                              <button
                                type="button"
                                onClick={() => handleCopyNumber('01792208949')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-orange-200 text-xs font-semibold text-[#C44D24] hover:bg-orange-50 cursor-pointer shadow-2xs"
                              >
                                {copiedNumber ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                              </button>
                            </li>
                            <li>Amount: <strong className="font-bold text-stone-900">{formatTaka(total)}</strong></li>
                            <li>Complete the transaction and note the <span className="font-semibold text-stone-900">Transaction ID</span></li>
                            <li>Fill in the details below</li>
                          </ol>
                        </div>

                        {/* 4 Required Form Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          {/* 1. Nagad Sender Number */}
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Nagad Sender Number <span className="text-[#C43838]">*</span>
                            </label>
                            <input
                              type="tel"
                              value={mfsSenderNumber}
                              onChange={(e) => {
                                setMfsSenderNumber(e.target.value);
                                if (errors.mfsSenderNumber) {
                                  setErrors((prev) => ({ ...prev, mfsSenderNumber: '' }));
                                }
                              }}
                              placeholder="01XXXXXXXXX"
                              className={`w-full px-3.5 py-2.5 rounded-xl bg-white border ${
                                errors.mfsSenderNumber
                                  ? 'border-rose-400 focus:border-rose-500'
                                  : 'border-[#E5DFD7] focus:border-[#C44D24]'
                              } text-xs sm:text-sm text-stone-800 outline-none`}
                            />
                            {errors.mfsSenderNumber && (
                              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                                {errors.mfsSenderNumber}
                              </p>
                            )}
                          </div>

                          {/* 2. Transaction ID */}
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Transaction ID <span className="text-[#C43838]">*</span>
                            </label>
                            <input
                              type="text"
                              value={trxId}
                              onChange={(e) => {
                                setTrxId(e.target.value.toUpperCase());
                                if (errors.trxId) {
                                  setErrors((prev) => ({ ...prev, trxId: '' }));
                                }
                              }}
                              placeholder="e.g. 9X8Y7Z"
                              className={`w-full px-3.5 py-2.5 rounded-xl bg-white border ${
                                errors.trxId
                                  ? 'border-rose-400 focus:border-rose-500'
                                  : 'border-[#E5DFD7] focus:border-[#C44D24]'
                              } text-xs sm:text-sm text-stone-800 uppercase font-mono outline-none`}
                            />
                            {errors.trxId && (
                              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                                {errors.trxId}
                              </p>
                            )}
                          </div>

                          {/* 3. Paid Amount */}
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Paid Amount <span className="text-[#C43838]">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                                ৳
                              </span>
                              <input
                                type="number"
                                value={paidAmount}
                                onChange={(e) => {
                                  setPaidAmount(e.target.value);
                                  if (errors.paidAmount) {
                                    setErrors((prev) => ({ ...prev, paidAmount: '' }));
                                  }
                                }}
                                placeholder={total.toString()}
                                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border ${
                                  errors.paidAmount
                                    ? 'border-rose-400 focus:border-rose-500'
                                    : 'border-[#E5DFD7] focus:border-[#C44D24]'
                                } text-xs sm:text-sm text-stone-800 font-semibold outline-none`}
                              />
                            </div>
                            {errors.paidAmount && (
                              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                                {errors.paidAmount}
                              </p>
                            )}
                          </div>

                          {/* 4. Payment Date */}
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Payment Date <span className="text-[#C43838]">*</span>
                            </label>
                            <input
                              type="date"
                              value={paymentDate}
                              onChange={(e) => {
                                setPaymentDate(e.target.value);
                                if (errors.paymentDate) {
                                  setErrors((prev) => ({ ...prev, paymentDate: '' }));
                                }
                              }}
                              className={`w-full px-3.5 py-2.5 rounded-xl bg-white border ${
                                errors.paymentDate
                                  ? 'border-rose-400 focus:border-rose-500'
                                  : 'border-[#E5DFD7] focus:border-[#C44D24]'
                              } text-xs sm:text-sm text-stone-800 outline-none`}
                            />
                            {errors.paymentDate && (
                              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                                {errors.paymentDate}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 7. Order notes (optional) */}
              <div>
                <label htmlFor="checkout-order-notes" className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                  Order notes <span className="text-xs font-normal text-stone-500">(optional)</span>
                </label>
                <textarea
                  id="checkout-order-notes"
                  rows={3}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Special delivery instructions..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD7] focus:border-[#2B0F15] text-stone-800 placeholder-stone-400 text-sm sm:text-base outline-none transition-colors resize-none shadow-none"
                />
              </div>
            </div>

            {/* Right Column: Order Summary Card (5 Cols, Frozen/Sticky on Scroll) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24 self-start">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EBE6DC] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                <h2 className="text-base sm:text-lg font-bold text-[#1C1C1C] tracking-tight mb-5">
                  Order Summary
                </h2>

                {/* Items List (Scrollable if many items to keep sticky panel in view) */}
                <div className="space-y-3.5 mb-6 max-h-[30vh] overflow-y-auto pr-1">
                  {items.map((item, index) => {
                    const itemTotal = getProductPriceBDT(item.product) * item.quantity;
                    return (
                      <div key={index} className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-2xl object-cover bg-stone-100 border border-stone-200/80 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-[#1C1C1C] text-sm leading-snug truncate">
                              {item.product.name}
                            </h3>
                            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-1 mt-0.5">
                              <span>Qty: {item.quantity}</span>
                              {item.selectedSize && (
                                <span>• Size: <strong className="text-stone-700 font-medium">{item.selectedSize}</strong></span>
                              )}
                              {item.selectedColor && (
                                <span>• Color: <strong className="text-stone-700 font-medium">{item.selectedColor}</strong></span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="font-semibold text-[#1C1C1C] text-sm sm:text-base flex-shrink-0">
                          {formatTaka(itemTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Input & Apply */}
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="flex-1 px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD7] focus:border-[#1C1C1C] text-stone-800 placeholder-stone-400 text-sm outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-5 py-3 rounded-2xl bg-[#1C1C1C] hover:bg-[#2B0F15] text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <p className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                      <span>{couponError}</span>
                    </p>
                  )}

                  {appliedCoupon && (
                    <div className="mt-2.5 flex items-center justify-between bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-xs text-stone-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Tag size={12} className="text-[#C4A468]" />
                        <span>{appliedCoupon.code} applied ({appliedCoupon.discountPercent}% off)</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-stone-400 hover:text-stone-700 font-semibold ml-2 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtotal & Delivery Breakdown */}
                <div className="space-y-3 text-sm sm:text-base border-t border-stone-100 pt-5">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="text-[#1C1C1C] font-semibold">{formatTaka(subtotal)}</span>
                  </div>

                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="font-semibold">-{formatTaka(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-stone-600">
                    <span>Delivery</span>
                    <span className="text-[#1C1C1C] font-semibold">{formatTaka(deliveryFee)}</span>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="border-t border-stone-200/80 my-4" />

                {/* Total */}
                <div className="flex items-center justify-between text-lg sm:text-xl font-bold text-[#1C1C1C]">
                  <span>Total</span>
                  <span>{formatTaka(total)}</span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#2B0F15] hover:bg-[#3D141E] active:scale-[0.99] text-white font-semibold text-base tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <span>Place Order</span>
                )}
              </button>

              {/* Dynamic Security badge matching reference */}
              <div className="flex items-center justify-center gap-2 text-xs text-stone-500 text-center">
                <ShieldCheck size={14} className="text-[#C4A468]" />
                <span>
                  {paymentMethod === 'cod'
                    ? 'Cash on Delivery • Secure checkout'
                    : paymentMethod === 'bkash'
                    ? 'bKash • Secure checkout'
                    : 'Nagad • Secure checkout'}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
