import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  LayoutTemplate,
  Star,
  Search,
  Bell,
  ExternalLink,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'cms'
  | 'reviews';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onViewWebsite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onViewWebsite,
  children,
}) => {
  const { products, orders, toastMessage } = useAdminData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Compute notifications (Low stock items & new orders)
  const lowStockItems = products.filter((p) => (p.stockCount ?? 10) < 3);
  const processingOrders = orders.filter((o) => o.fulfillmentStatus === 'Processing');
  const verificationNeededOrders = orders.filter((o) => o.paymentStatus === 'Verification Needed');
  const notificationCount = lowStockItems.length + processingOrders.length + verificationNeededOrders.length;

  const navItems: { id: AdminTab; label: string; icon: any; count?: number; urgentCount?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'categories', label: 'Categories & Labels', icon: FolderTree },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      count: processingOrders.length,
      urgentCount: verificationNeededOrders.length,
    },
    { id: 'cms', label: 'Website Content', icon: LayoutTemplate },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification (Green Box, Non-Technical Rule #6) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-bounce-short">
          <CheckCircle2 size={18} className="text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider">
              AFW
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight block leading-tight">
                AFW Atelier
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                Store Manager
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm rounded-lg border border-transparent focus:border-slate-300 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-semibold text-slate-800">
                  <span>Notifications</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {notificationCount} new alerts
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto mt-1">
                  {verificationNeededOrders.length > 0 && (
                    <div className="py-2.5 bg-amber-50/80 -mx-1 px-2.5 rounded-lg border border-amber-200/80 my-1">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-0.5 text-xs">
                        <AlertTriangle size={13} className="text-amber-700" />
                        <span>Payment Verification Needed ({verificationNeededOrders.length})</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-snug">
                        Customers sent bKash/Nagad transactions awaiting TrxID confirmation.
                      </p>
                    </div>
                  )}

                  {lowStockItems.length > 0 && (
                    <div className="py-2.5">
                      <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
                        <AlertTriangle size={14} />
                        <span>Low Stock Alert ({lowStockItems.length} items)</span>
                      </div>
                      <ul className="space-y-1 text-slate-600 pl-5 list-disc">
                        {lowStockItems.slice(0, 3).map((item) => (
                          <li key={item.id} className="truncate">
                            {item.name} ({item.stockCount ?? 0} left)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {processingOrders.length > 0 && (
                    <div className="py-2.5">
                      <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                        <ShoppingBag size={14} />
                        <span>Orders to fulfill ({processingOrders.length})</span>
                      </div>
                      <p className="text-slate-500">
                        Orders are waiting for packaging & shipping.
                      </p>
                    </div>
                  )}

                  {notificationCount === 0 && (
                    <div className="py-6 text-center text-slate-400">
                      All caught up! No active alerts.
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      onSelectTab('orders');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View all orders & alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* "View Website" button (Prominent per prompt) */}
          <button
            type="button"
            id="admin-view-website-btn"
            onClick={onViewWebsite}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-xs"
          >
            <Store size={15} />
            <span className="hidden sm:inline">View Website</span>
            <ExternalLink size={13} className="text-slate-400" />
          </button>

          {/* Profile / Admin Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-slate-900 block leading-tight">
                Store Owner
              </span>
              <span className="text-[10px] text-slate-400 block">Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (Left: Always visible, large icons + text) */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 select-none">
          <div className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.urgentCount !== undefined && item.urgentCount > 0 && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold animate-pulse ${
                          isActive
                            ? 'bg-amber-400 text-amber-950'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                        title={`${item.urgentCount} payment(s) awaiting verification`}
                      >
                        {item.urgentCount} verify
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto p-4 border-t border-slate-200 space-y-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800 block mb-1">
                Client Mode
              </span>
              <p className="text-slate-500 leading-relaxed">
                Simple forms, auto-saving drafts, and zero technical jargon.
              </p>
            </div>

            <button
              onClick={onViewWebsite}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              <span>Exit Admin & Shop</span>
            </button>
          </div>
        </aside>

        {/* Mobile Slide-over Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-50 p-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900 text-base">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.urgentCount !== undefined && item.urgentCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {item.urgentCount} verify
                          </span>
                        )}
                        {item.count !== undefined && item.count > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onViewWebsite();
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white font-medium text-xs rounded-lg text-center flex items-center justify-center gap-2"
                >
                  <Store size={14} />
                  <span>View Customer Website</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
