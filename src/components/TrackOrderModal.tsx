import React, { useState } from 'react';
import {
  Search,
  X,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { formatTaka } from '../utils/currency';

interface TrackOrderModalProps {
  isOpen: boolean;
  initialOrderId?: string;
  onClose: () => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  initialOrderId,
  onClose,
}) => {
  const { orders } = useAdminData();
  const [query, setQuery] = useState(initialOrderId || '');
  const [hasSearched, setHasSearched] = useState(!!initialOrderId);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Search by orderNumber (e.g. #ORD-2041 or AFW-10492) or phone
  const cleanQ = query.trim().toLowerCase().replace('#', '');
  const foundOrder = orders.find(
    (o) =>
      o.orderNumber.toLowerCase().replace('#', '').includes(cleanQ) ||
      o.id.toLowerCase().includes(cleanQ) ||
      o.customer.phone.replace(/[^0-9]/g, '').includes(cleanQ.replace(/[^0-9]/g, ''))
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const handleCopyLink = () => {
    if (!foundOrder) return;
    const url = `https://afwluxe.com/track/${foundOrder.orderNumber.replace('#', '')}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center">
              <Truck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1C1C]">Track Your Order</h3>
              <p className="text-xs text-stone-500">Live shipping & delivery status</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Enter Order # (e.g. ORD-2041) or phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-[#1C1C1C]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1C1C1C] hover:bg-[#2B0F15] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Track
            </button>
          </form>

          {/* Result Card */}
          {hasSearched && foundOrder ? (
            <div className="space-y-5">
              {/* Order summary header */}
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE6DC] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-stone-500 uppercase tracking-wider block">Order Reference</span>
                  <span className="text-base font-bold text-[#1C1C1C] font-mono">{foundOrder.orderNumber}</span>
                  <span className="text-xs text-stone-400 block">{foundOrder.date}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-500 block">Total Amount</span>
                  <span className="text-base font-bold text-[#1C1C1C]">{formatTaka(foundOrder.totalBDT, false)}</span>
                  <span className="text-[11px] font-semibold block text-emerald-700">
                    {foundOrder.paymentStatus === 'Paid' ? '✓ Paid' : 'Cash on Delivery'}
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-4">
                  Shipment Progress
                </span>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {/* Step 1: Placed */}
                  <div className="relative flex items-start gap-3">
                    <div className="absolute -left-6 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#1C1C1C]">Order Placed & Verified</h4>
                      <p className="text-[11px] text-stone-500">Order successfully received by AFW Atelier.</p>
                    </div>
                  </div>

                  {/* Step 2: Quality Check & Packing */}
                  <div className="relative flex items-start gap-3">
                    <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      foundOrder.fulfillmentStatus === 'Processing' || foundOrder.fulfillmentStatus === 'Shipped' || foundOrder.fulfillmentStatus === 'Delivered'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}>
                      {foundOrder.fulfillmentStatus !== 'Cancelled' ? '✓' : '✕'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#1C1C1C]">Atelier Inspection & Packing</h4>
                      <p className="text-[11px] text-stone-500">
                        Garments checked for premium quality, boxed with signature ribbon.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Courier Dispatch */}
                  <div className="relative flex items-start gap-3">
                    <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      foundOrder.fulfillmentStatus === 'Shipped' || foundOrder.fulfillmentStatus === 'Delivered'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}>
                      {foundOrder.fulfillmentStatus === 'Shipped' || foundOrder.fulfillmentStatus === 'Delivered' ? '✓' : '3'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#1C1C1C]">Handed Over to Courier</h4>
                      {foundOrder.courier ? (
                        <div className="mt-1 p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950">
                          <span>Dispatched via <strong>{foundOrder.courier.provider} Express</strong></span>
                          <div className="font-mono font-bold mt-0.5 select-all">Tracking ID: {foundOrder.courier.trackingId}</div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-500">Preparing for courier pickup.</p>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="relative flex items-start gap-3">
                    <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      foundOrder.fulfillmentStatus === 'Delivered'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}>
                      {foundOrder.fulfillmentStatus === 'Delivered' ? '✓' : '4'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#1C1C1C]">Delivered to Destination</h4>
                      <p className="text-[11px] text-stone-500">
                        {foundOrder.customer.address}, {foundOrder.customer.city}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share/Copy Tracking Link */}
              <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between">
                <span className="text-xs text-stone-500">Shareable tracking link</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedLink ? 'Link Copied' : 'Copy Tracking Link'}</span>
                </button>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-8 space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <AlertCircle size={20} />
              </div>
              <h4 className="font-bold text-sm text-[#1C1C1C]">No Order Found</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                We could not find an order matching "{query}". Please double-check your Order ID (e.g. ORD-2041) or phone number.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
