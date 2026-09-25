import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertOctagon,
  ArrowUpRight,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  Plus,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { AdminTab } from './AdminLayout';
import { formatTaka } from '../../utils/currency';

interface AdminDashboardProps {
  onNavigate: (tab: AdminTab) => void;
  onEditProduct: (productId: string) => void;
  onViewOrder: (orderId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onEditProduct,
  onViewOrder,
}) => {
  const { products, orders, totalProfit, totalSales } = useAdminData();

  const totalOrdersCount = orders.length;
  const pendingVerificationOrders = orders.filter((o) => o.paymentStatus === 'Verification Needed');
  const outOfStockProducts = products.filter((p) => p.inStock === false || (p.stockCount ?? 0) === 0);
  const lowStockProducts = products.filter((p) => {
    const count = p.stockCount ?? 10;
    return count > 0 && count <= 3;
  });

  const profitMarginPercent = totalSales > 0 ? Math.round((totalProfit / totalSales) * 100) : 45;

  const recentOrders = orders.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck size={12} /> Shipped
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is a quick snapshot of how your store is performing today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Security Payment Verification Alert Banner */}
      {pendingVerificationOrders.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {pendingVerificationOrders.length} Order{pendingVerificationOrders.length > 1 ? 's' : ''} Awaiting Payment Verification
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Customers submitted Transaction IDs via bKash / Nagad. Check your statement and verify payment before packing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer transition-colors"
          >
            <span>Review & Verify Orders</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Snapshot Cards Grid: Total Sales, Total Orders, Total Profit, Low Stock Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Sales
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {formatTaka(totalSales, false)}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
              <ArrowUpRight size={14} />
              <span>Fulfilled & paid revenue</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {totalOrdersCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {orders.filter((o) => o.fulfillmentStatus === 'Processing').length} awaiting fulfillment
            </div>
          </div>
        </div>

        {/* Card 3: Total Profit (Owner can track profit via Cost Price) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Total Profit (Net)
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {formatTaka(totalProfit, false)}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium mt-1">
              <PieChart size={13} />
              <span>~{profitMarginPercent}% estimated margin</span>
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Low Stock Alerts
            </span>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                lowStockProducts.length + outOfStockProducts.length > 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <AlertOctagon size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div
              className={`text-2xl sm:text-3xl font-bold ${
                lowStockProducts.length + outOfStockProducts.length > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {lowStockProducts.length + outOfStockProducts.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {outOfStockProducts.length} out of stock • {lowStockProducts.length} low
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900">Recent Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest customer purchases from your store
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {order.orderNumber}
                      <span className="block text-[11px] text-slate-400 font-sans">
                        {order.date.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {order.customer.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {order.customer.phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatTaka(order.totalBDT, false)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col items-start gap-1">
                        {getStatusBadge(order.fulfillmentStatus)}
                        {order.paymentStatus === 'Verification Needed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            <ShieldAlert size={10} /> Verify Payment
                          </span>
                        ) : order.paymentStatus === 'Paid' ? (
                          <span className="text-[10px] font-semibold text-emerald-700">
                            ✓ Paid
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            {order.paymentMethod === 'cod' ? 'COD' : 'Unpaid'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewOrder(order.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors inline-flex items-center gap-1"
                        title="View order details"
                      >
                        <Eye size={15} />
                        <span className="text-xs">Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900">Low Stock Alerts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Items with 3 or fewer left
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {lowStockProducts.length + outOfStockProducts.length} items
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
            {[...outOfStockProducts, ...lowStockProducts].length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                All products are well stocked!
              </div>
            ) : (
              [...outOfStockProducts, ...lowStockProducts].map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-12 object-cover rounded-md border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {item.categoryLabel}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-bold uppercase mt-0.5 ${
                          (item.stockCount ?? 0) === 0
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {(item.stockCount ?? 0) === 0
                          ? 'Out of Stock'
                          : `Only ${item.stockCount} left`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEditProduct(item.id)}
                    className="shrink-0 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
