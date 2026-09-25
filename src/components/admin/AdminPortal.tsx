import React, { useState } from 'react';
import { AdminLayout, AdminTab } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminCMS } from './AdminCMS';
import { AdminReviews } from './AdminReviews';

interface AdminPortalProps {
  onViewWebsite: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onViewWebsite }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [targetProductId, setTargetProductId] = useState<string | null>(null);
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);

  const handleEditProductFromDashboard = (productId: string) => {
    setTargetProductId(productId);
    setCurrentTab('products');
  };

  const handleViewOrderFromDashboard = (orderId: string) => {
    setTargetOrderId(orderId);
    setCurrentTab('orders');
  };

  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={(tab) => {
        setCurrentTab(tab);
        if (tab !== 'products') setTargetProductId(null);
        if (tab !== 'orders') setTargetOrderId(null);
      }}
      onViewWebsite={onViewWebsite}
    >
      {currentTab === 'dashboard' && (
        <AdminDashboard
          onNavigate={(tab) => setCurrentTab(tab)}
          onEditProduct={handleEditProductFromDashboard}
          onViewOrder={handleViewOrderFromDashboard}
        />
      )}

      {currentTab === 'products' && (
        <AdminProducts
          initialEditProductId={targetProductId}
          onClearInitialEdit={() => setTargetProductId(null)}
        />
      )}

      {currentTab === 'categories' && <AdminCategories />}

      {currentTab === 'orders' && (
        <AdminOrders
          initialOrderId={targetOrderId}
          onClearInitialOrder={() => setTargetOrderId(null)}
        />
      )}

      {currentTab === 'cms' && <AdminCMS />}

      {currentTab === 'reviews' && <AdminReviews />}
    </AdminLayout>
  );
};
