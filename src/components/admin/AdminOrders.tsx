import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  Eye,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Printer,
  Download,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  AlertTriangle,
  Smartphone,
  Plus,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Send,
  RotateCcw,
  DollarSign,
  Barcode,
  Save,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { AdminOrder, AdminOrderItem } from '../../types';
import { formatTaka } from '../../utils/currency';

interface AdminOrdersProps {
  initialOrderId?: string | null;
  onClearInitialOrder?: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  initialOrderId,
  onClearInitialOrder,
}) => {
  const {
    orders,
    products,
    addOrder,
    updateOrder,
    updateOrderFulfillment,
    updateOrderPayment,
    shipOrderWithCourier,
    showToast,
  } = useAdminData();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedTrx, setCopiedTrx] = useState(false);

  // Active Order for Modal Detail View
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(() => {
    if (initialOrderId) {
      return orders.find((o) => o.id === initialOrderId) || null;
    }
    return null;
  });

  // Edit Order Mode inside Modal
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerAddress, setEditCustomerAddress] = useState('');
  const [editCustomerCity, setEditCustomerCity] = useState('');
  const [editCustomerNotes, setEditCustomerNotes] = useState('');
  const [editItems, setEditItems] = useState<AdminOrderItem[]>([]);
  const [newItemProductId, setNewItemProductId] = useState('');

  // Internal Notes State in Modal
  const [internalNoteInput, setInternalNoteInput] = useState('');

  // Partial Payment Modal / State
  const [isPartialPaymentOpen, setIsPartialPaymentOpen] = useState(false);
  const [partialAmountInput, setPartialAmountInput] = useState('');
  const [partialNoteInput, setPartialNoteInput] = useState('');

  // Create Manual Order Modal
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualCity, setManualCity] = useState('Dhaka');
  const [manualNotes, setManualNotes] = useState('Manual sale (WhatsApp/FB)');
  const [manualPaymentMethod, setManualPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [manualShippingBDT, setManualShippingBDT] = useState<number>(70);
  const [manualItems, setManualItems] = useState<
    { productId: string; size: string; color: string; quantity: number }[]
  >([]);
  const [selectedAddProdId, setSelectedAddProdId] = useState(products[0]?.id || '');
  const [selectedAddSize, setSelectedAddSize] = useState('Standard');
  const [selectedAddColor, setSelectedAddColor] = useState('Default');
  const [selectedAddQty, setSelectedAddQty] = useState(1);

  const handleCopyTrx = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedTrx(true);
    showToast('Transaction ID copied to clipboard');
    setTimeout(() => setCopiedTrx(false), 2000);
  };

  // Open Edit Mode for an order
  const handleStartEditOrder = (order: AdminOrder) => {
    if (order.fulfillmentStatus === 'Shipped' || order.fulfillmentStatus === 'Delivered') {
      showToast('Cannot edit orders that are already shipped or delivered.');
      return;
    }
    setEditCustomerName(order.customer.name);
    setEditCustomerPhone(order.customer.phone);
    setEditCustomerAddress(order.customer.address);
    setEditCustomerCity(order.customer.city);
    setEditCustomerNotes(order.customer.notes || '');
    setEditItems([...order.items]);
    setIsEditingOrder(true);
  };

  const handleSaveEditedOrder = () => {
    if (!selectedOrder) return;
    if (editItems.length === 0) {
      showToast('An order must have at least one item.');
      return;
    }

    const newSubtotal = editItems.reduce((acc, it) => acc + it.priceBDT * it.quantity, 0);
    const newTotal = newSubtotal + selectedOrder.shippingBDT - (selectedOrder.discountBDT || 0);

    const updatedData: Partial<AdminOrder> = {
      customer: {
        name: editCustomerName.trim(),
        phone: editCustomerPhone.trim(),
        address: editCustomerAddress.trim(),
        city: editCustomerCity.trim(),
        notes: editCustomerNotes.trim() || undefined,
        email: selectedOrder.customer.email,
      },
      items: editItems,
      subtotalBDT: newSubtotal,
      totalBDT: Math.max(0, newTotal),
    };

    updateOrder(selectedOrder.id, updatedData);
    setSelectedOrder({ ...selectedOrder, ...updatedData });
    setIsEditingOrder(false);
    showToast('Order details and items successfully updated!');
  };

  const handleAddEditItem = () => {
    const prod = products.find((p) => p.id === newItemProductId);
    if (!prod) return;
    const newItem: AdminOrderItem = {
      productId: prod.id,
      name: prod.name,
      image: prod.image,
      size: prod.sizes?.[0] || 'Standard',
      color: prod.colors?.[0]?.name || 'Default',
      quantity: 1,
      priceBDT: prod.priceBDT || prod.price * 27,
    };
    setEditItems((prev) => [...prev, newItem]);
  };

  // Save Internal Notes
  const handleSaveInternalNote = () => {
    if (!selectedOrder) return;
    updateOrder(selectedOrder.id, { internalNotes: internalNoteInput });
    setSelectedOrder({ ...selectedOrder, internalNotes: internalNoteInput });
    showToast('Internal note saved.');
  };

  // Save Partial Payment
  const handleSavePartialPayment = () => {
    if (!selectedOrder) return;
    const paid = Number(partialAmountInput);
    if (!paid || paid <= 0) {
      showToast('Please enter a valid partial amount.');
      return;
    }
    const due = Math.max(0, selectedOrder.totalBDT - paid);
    const partialData = {
      paidAmount: paid,
      dueAmount: due,
      notes: partialNoteInput.trim() || undefined,
    };
    updateOrder(selectedOrder.id, {
      partialPayment: partialData,
      paymentStatus: 'Pending', // Pending due
    });
    setSelectedOrder({
      ...selectedOrder,
      partialPayment: partialData,
    });
    setIsPartialPaymentOpen(false);
    showToast(`Partial payment of ৳${paid} recorded! Due: ৳${due}`);
  };

  // Export Orders to CSV for Accounting/Taxes
  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast('No orders to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'Email',
      'Address',
      'City',
      'Items Count',
      'Items Summary',
      'Subtotal (BDT)',
      'Delivery Fee (BDT)',
      'Discount (BDT)',
      'Total (BDT)',
      'Payment Method',
      'Payment Status',
      'Fulfillment Status',
      'TrxID',
      'Sender Number',
      'Courier Provider',
      'Courier Tracking ID',
    ];

    const rows = orders.map((o) => {
      const itemsSummary = o.items
        .map((it) => `${it.name} (${it.size}, ${it.color}) x${it.quantity}`)
        .join('; ');
      return [
        o.orderNumber,
        `"${o.date}"`,
        `"${o.customer.name}"`,
        `"${o.customer.phone}"`,
        `"${o.customer.email || ''}"`,
        `"${o.customer.address.replace(/"/g, '""')}"`,
        `"${o.customer.city}"`,
        o.items.reduce((sum, it) => sum + it.quantity, 0),
        `"${itemsSummary.replace(/"/g, '""')}"`,
        o.subtotalBDT,
        o.shippingBDT,
        o.discountBDT || 0,
        o.totalBDT,
        o.paymentMethod.toUpperCase(),
        o.paymentStatus,
        o.fulfillmentStatus,
        `"${o.paymentDetails?.trxId || ''}"`,
        `"${o.paymentDetails?.senderNumber || ''}"`,
        `"${o.courier?.provider || 'N/A'}"`,
        `"${o.courier?.trackingId || 'N/A'}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AFW_Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported to CSV successfully!');
  };

  // Manual Order Item Add
  const handleAddManualItem = () => {
    const prod = products.find((p) => p.id === selectedAddProdId);
    if (!prod) return;
    setManualItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        size: selectedAddSize,
        color: selectedAddColor,
        quantity: selectedAddQty,
      },
    ]);
  };

  const handleCreateManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim() || !manualAddress.trim()) {
      showToast('Please enter customer name, phone, and delivery address.');
      return;
    }
    if (manualItems.length === 0) {
      showToast('Please add at least one item to this manual order.');
      return;
    }

    const itemsPayload: AdminOrderItem[] = manualItems.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const priceBDT = prod?.priceBDT || (prod ? prod.price * 27 : 500);
      return {
        productId: it.productId,
        name: prod?.name || 'AFW Product',
        image: prod?.image || '',
        size: it.size,
        color: it.color,
        quantity: it.quantity,
        priceBDT,
      };
    });

    const subtotal = itemsPayload.reduce((acc, it) => acc + it.priceBDT * it.quantity, 0);
    const total = subtotal + manualShippingBDT;

    const newOrd = addOrder({
      customer: {
        name: manualName.trim(),
        phone: manualPhone.trim(),
        address: manualAddress.trim(),
        city: manualCity.trim() || 'Dhaka',
        notes: manualNotes.trim() || undefined,
      },
      items: itemsPayload,
      subtotalBDT: subtotal,
      shippingBDT: manualShippingBDT,
      totalBDT: total,
      paymentMethod: manualPaymentMethod,
      paymentStatus: manualPaymentMethod === 'cod' ? 'Pending' : 'Paid',
      fulfillmentStatus: 'Processing',
      internalNotes: 'Created manually via Admin Portal for Social Media sales.',
    });

    setIsCreateOrderModalOpen(false);
    setManualItems([]);
    setManualName('');
    setManualPhone('');
    setManualAddress('');
    showToast(`Manual order ${newOrd.orderNumber} created!`);
  };

  // Clean, minimal thermal-printer friendly slip (Zero product images)
  const generateSlipHTML = (order: AdminOrder): string => {
    const isPaid = order.paymentStatus === 'Paid';
    const dueAmount = order.partialPayment
      ? order.partialPayment.dueAmount
      : order.paymentMethod === 'cod' && !isPaid
      ? order.totalBDT
      : 0;
    const totalQty = order.items.reduce((acc, item) => acc + item.quantity, 0);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Packing_Slip_${order.orderNumber}</title>
  <style>
    @page {
      size: auto;
      margin: 6mm 8mm;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      line-height: 1.35;
      color: #000;
      background: #fff;
      padding: 12px;
      max-width: 650px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-name {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 9.5px;
      color: #333;
      margin-top: 1px;
    }
    .slip-title-box {
      text-align: right;
    }
    .slip-title {
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .slip-order-num {
      font-size: 14px;
      font-family: monospace;
      font-weight: 900;
      margin-top: 2px;
    }
    .slip-date {
      font-size: 10px;
      color: #444;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ccc;
    }
    .section-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      margin-bottom: 4px;
    }
    .consignee-name {
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .consignee-phone {
      font-size: 12px;
      font-family: monospace;
      font-weight: 700;
      margin-bottom: 3px;
    }
    .consignee-addr {
      font-size: 10.5px;
      line-height: 1.3;
    }
    .customer-note {
      font-size: 10px;
      margin-top: 4px;
      padding: 4px;
      background: #f4f4f4;
      border-left: 2px solid #000;
    }
    .cod-due {
      margin-top: 6px;
      padding: 6px 8px;
      border: 2px dashed #000;
      font-size: 14px;
      font-weight: 900;
      text-align: center;
      background: #f9f9f9;
    }
    .payment-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 6px;
      margin-top: 4px;
      border: 1px solid #000;
    }
    .courier-box {
      margin-top: 6px;
      padding: 4px 6px;
      background: #f0f0f0;
      font-size: 10px;
      font-weight: bold;
    }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    table.items-table th, table.items-table td {
      border: 1px solid #000;
      padding: 5px 6px;
      font-size: 10px;
      text-align: left;
    }
    table.items-table th {
      background: #f0f0f0;
      font-weight: 800;
      text-transform: uppercase;
    }
    .text-right {
      text-align: right !important;
    }
    .text-center {
      text-align: center !important;
    }
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 12px;
    }
    table.totals-table {
      width: 240px;
      border-collapse: collapse;
      font-size: 10.5px;
    }
    table.totals-table td {
      padding: 2px 4px;
    }
    table.totals-table tr.grand-total {
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      font-weight: 900;
      font-size: 12px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px dashed #999;
    }
    .sign-box {
      width: 180px;
      text-align: center;
      font-size: 9.5px;
      border-top: 1px solid #000;
      padding-top: 4px;
    }
    .barcode-section {
      text-align: center;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
    }
    .barcode-lines {
      font-family: monospace;
      font-size: 24px;
      letter-spacing: 3px;
      line-height: 1;
      transform: scaleY(1.2);
      user-select: none;
      font-weight: bold;
    }
    .barcode-num {
      font-family: monospace;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-top: 2px;
    }
    .footer-note {
      text-align: center;
      font-size: 9px;
      color: #444;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-name">AFW ATELIER</div>
      <div class="brand-sub">London Designed Luxury Modest Womenswear</div>
      <div class="brand-sub">Dhaka, Bangladesh • Helpline: +880 1792-208949</div>
    </div>
    <div class="slip-title-box">
      <div class="slip-title">Packing & Delivery Slip</div>
      <div class="slip-order-num">${order.orderNumber}</div>
      <div class="slip-date">Date: ${order.date}</div>
    </div>
  </div>

  <div class="grid-2">
    <div>
      <div class="section-title">DELIVER TO (CONSIGNEE)</div>
      <div class="consignee-name">${order.customer.name}</div>
      <div class="consignee-phone">Phone: ${order.customer.phone}</div>
      <div class="consignee-addr">${order.customer.address}, ${order.customer.city}</div>
      ${order.customer.notes ? `<div class="customer-note"><strong>Note:</strong> ${order.customer.notes}</div>` : ''}
    </div>
    <div>
      <div class="section-title">LOGISTICS & PAYMENT</div>
      <div><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</div>
      <div><strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}</div>
      ${order.courier ? `<div class="courier-box">${order.courier.provider} Tracking: ${order.courier.trackingId}</div>` : ''}
      
      ${dueAmount > 0 ? `
        <div class="cod-due">
          COLLECT CASH: ৳${dueAmount.toLocaleString()}
        </div>
      ` : `
        <div class="payment-badge" style="background:#f0f0f0;">
          ✓ FULLY PAID (COLLECT ৳0)
        </div>
      `}
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 25px;">#</th>
        <th>Item Description</th>
        <th style="width: 50px;">Size</th>
        <th style="width: 60px;">Color</th>
        <th class="text-center" style="width: 35px;">Qty</th>
        <th class="text-right" style="width: 70px;">Price</th>
        <th class="text-right" style="width: 75px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((it, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${it.name}</strong></td>
          <td>${it.size || '-'}</td>
          <td>${it.color || '-'}</td>
          <td class="text-center"><strong>${it.quantity}</strong></td>
          <td class="text-right">৳${it.priceBDT.toLocaleString()}</td>
          <td class="text-right"><strong>৳${(it.priceBDT * it.quantity).toLocaleString()}</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals-wrapper">
    <table class="totals-table">
      <tr>
        <td>Total Pieces:</td>
        <td class="text-right"><strong>${totalQty} pcs</strong></td>
      </tr>
      <tr>
        <td>Subtotal:</td>
        <td class="text-right">৳${order.subtotalBDT.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Delivery:</td>
        <td class="text-right">৳${order.shippingBDT.toLocaleString()}</td>
      </tr>
      ${order.partialPayment ? `
        <tr>
          <td>Advance Paid:</td>
          <td class="text-right">-৳${order.partialPayment.paidAmount.toLocaleString()}</td>
        </tr>
      ` : ''}
      <tr class="grand-total">
        <td>Total Payable:</td>
        <td class="text-right">৳${(order.partialPayment ? order.partialPayment.dueAmount : order.totalBDT).toLocaleString()}</td>
      </tr>
    </table>
  </div>

  <div class="signatures">
    <div class="sign-box">Consignee Receiver's Signature</div>
    <div class="sign-box">Courier Delivery Officer</div>
    <div class="sign-box">Warehouse Dispatch Inspection</div>
  </div>

  <div class="barcode-section">
    <div class="barcode-lines">||||| | |||| ||| |||| | ||| |||| | |||||</div>
    <div class="barcode-num">${order.orderNumber.replace('#', '')}</div>
  </div>

  <div class="footer-note">
    Clean Minimal Thermal Receipt • www.afwluxe.com • Thank you for choosing AFW Atelier
  </div>
</body>
</html>`;
  };

  const handleDownloadSlip = (order: AdminOrder) => {
    const html = generateSlipHTML(order);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Packing_Slip_${order.orderNumber.replace('#', '')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Clean packing slip downloaded.');
  };

  const handlePrintSlip = (order: AdminOrder) => {
    const html = generateSlipHTML(order);
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    } else {
      showToast('Popup blocked. Please allow popups to print slip.');
    }
  };

  // Courier Dispatch Action
  const handleCourierShip = (provider: 'Pathao' | 'Steadfast' | 'RedX') => {
    if (!selectedOrder) return;
    const { trackingId, consignmentId } = shipOrderWithCourier(selectedOrder.id, provider);
    setSelectedOrder({
      ...selectedOrder,
      fulfillmentStatus: 'Shipped',
      courier: {
        provider,
        trackingId,
        consignmentId,
        shippedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
    });
  };

  // Badges
  const getFulfillmentBadge = (status: AdminOrder['fulfillmentStatus']) => {
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
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw size={12} /> Returned
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (status: AdminOrder['paymentStatus']) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} /> Paid
          </span>
        );
      case 'Verification Needed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <ShieldAlert size={12} /> Verification Needed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Clock size={12} /> Pending (Unpaid)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
            {status}
          </span>
        );
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrder = o.orderNumber.toLowerCase().includes(q);
      const matchCustomer = o.customer.name.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.includes(q);
      const matchTrx = o.paymentDetails?.trxId?.toLowerCase().includes(q);
      const matchCourier = o.courier?.trackingId?.toLowerCase().includes(q);
      if (!matchOrder && !matchCustomer && !matchPhone && !matchTrx && !matchCourier) return false;
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'verification' && o.paymentStatus !== 'Verification Needed') return false;
      if (statusFilter === 'processing' && o.fulfillmentStatus !== 'Processing') return false;
      if (statusFilter === 'shipped' && o.fulfillmentStatus !== 'Shipped') return false;
      if (statusFilter === 'delivered' && o.fulfillmentStatus !== 'Delivered') return false;
      if (statusFilter === 'cancelled' && o.fulfillmentStatus !== 'Cancelled') return false;
      if (statusFilter === 'returned' && o.fulfillmentStatus !== 'Returned') return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Orders & Shipments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fulfill client purchases, verify bKash TrxIDs, dispatch couriers, and manage returns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export to CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Export full orders list to CSV for accounting & tax"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <span>Export Orders to CSV</span>
          </button>

          {/* Create Manual Order */}
          <button
            type="button"
            onClick={() => setIsCreateOrderModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Order (Manual)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by #ORD, customer, phone, TrxID, courier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 text-sm rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none text-slate-800 font-medium cursor-pointer"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="verification">Verification Needed ({orders.filter(o => o.paymentStatus === 'Verification Needed').length})</option>
            <option value="processing">Processing ({orders.filter(o => o.fulfillmentStatus === 'Processing').length})</option>
            <option value="shipped">Shipped ({orders.filter(o => o.fulfillmentStatus === 'Shipped').length})</option>
            <option value="delivered">Delivered ({orders.filter(o => o.fulfillmentStatus === 'Delivered').length})</option>
            <option value="returned">Returned ({orders.filter(o => o.fulfillmentStatus === 'Returned').length})</option>
            <option value="cancelled">Cancelled ({orders.filter(o => o.fulfillmentStatus === 'Cancelled').length})</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Courier / Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isMFS = order.paymentMethod !== 'cod';
                  const needsVerification = order.paymentStatus === 'Verification Needed';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        <span className="font-bold block">{order.orderNumber}</span>
                        <span className="text-xs text-slate-400 font-sans block">
                          {order.date}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block truncate max-w-xs">
                          {order.customer.name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono block">
                          {order.customer.phone}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block max-w-xs">
                          {order.customer.city}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">
                          {order.items.reduce((sum, it) => sum + it.quantity, 0)} pcs
                        </span>
                        <span className="text-xs text-slate-400 block truncate max-w-[180px]">
                          {order.items[0]?.name}
                          {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatTaka(order.totalBDT, false)}
                        {order.partialPayment && (
                          <span className="block text-[10px] text-amber-700 font-normal">
                            Due: {formatTaka(order.partialPayment.dueAmount, false)}
                          </span>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-xs font-semibold uppercase text-slate-600">
                            {order.paymentMethod.toUpperCase()}
                          </span>
                          {getPaymentBadge(order.paymentStatus)}
                        </div>
                      </td>

                      {/* Courier & Fulfillment */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          {getFulfillmentBadge(order.fulfillmentStatus)}
                          {order.courier && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {order.courier.provider}: {order.courier.trackingId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsEditingOrder(false);
                              setInternalNoteInput(order.internalNotes || '');
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ORDER DETAILS MODAL (With Edit Order, Courier Dispatch, bKash & Slip) */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  AFW
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Order {selectedOrder.orderNumber}
                    </h3>
                    {getFulfillmentBadge(selectedOrder.fulfillmentStatus)}
                  </div>
                  <span className="text-xs text-slate-400">Placed on {selectedOrder.date}</span>
                </div>
              </div>

              {/* Actions Header Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Edit Order Button */}
                {selectedOrder.fulfillmentStatus !== 'Shipped' && selectedOrder.fulfillmentStatus !== 'Delivered' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isEditingOrder) {
                        handleStartEditOrder(selectedOrder);
                      } else {
                        setIsEditingOrder(false);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                      isEditingOrder
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Edit3 size={13} />
                    <span>{isEditingOrder ? 'Cancel Edit' : 'Edit Order'}</span>
                  </button>
                )}

                {/* Download Slip */}
                <button
                  type="button"
                  onClick={() => handleDownloadSlip(selectedOrder)}
                  className="px-2.5 py-1.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-xs flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  title="Download clean thermal packing slip without images"
                >
                  <Download size={13} />
                  <span className="hidden sm:inline">Slip</span>
                </button>

                {/* Print Slip */}
                <button
                  type="button"
                  onClick={() => handlePrintSlip(selectedOrder)}
                  className="px-2.5 py-1.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-xs flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  title="Print slip directly"
                >
                  <Printer size={13} />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setIsEditingOrder(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-bold ml-1 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
              {/* EDIT ORDER MODE BANNER & FORM */}
              {isEditingOrder ? (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                        <Edit3 size={16} className="text-amber-800" />
                        <span>Edit Order Customer Details & Items</span>
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Update consignee delivery info or alter item quantities before handing to courier.
                      </p>
                    </div>
                  </div>

                  {/* Customer Edit Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={editCustomerName}
                        onChange={(e) => setEditCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editCustomerPhone}
                        onChange={(e) => setEditCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
                      <input
                        type="text"
                        value={editCustomerCity}
                        onChange={(e) => setEditCustomerCity(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address</label>
                      <input
                        type="text"
                        value={editCustomerAddress}
                        onChange={(e) => setEditCustomerAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Items in Edit Mode */}
                  <div className="space-y-2 pt-2 border-t border-amber-200">
                    <span className="text-xs font-bold uppercase text-slate-700 block">Edit Order Items</span>
                    <div className="space-y-2">
                      {editItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-slate-900 truncate">{item.name}</span>
                            <span className="text-slate-500">({item.size}, {item.color})</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">Qty:</span>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = Math.max(1, parseInt(e.target.value || '1', 10));
                                  setEditItems((prev) =>
                                    prev.map((it, i) => (i === idx ? { ...it, quantity: val } : it))
                                  );
                                }}
                                className="w-14 px-1.5 py-1 border border-slate-300 rounded text-center font-bold"
                              />
                            </div>
                            <span className="font-bold text-slate-900">{formatTaka(item.priceBDT * item.quantity, false)}</span>
                            <button
                              type="button"
                              onClick={() => setEditItems((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-rose-600 hover:text-rose-800 p-1"
                              title="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Item to Order dropdown */}
                    <div className="flex items-center gap-2 pt-2">
                      <select
                        value={newItemProductId}
                        onChange={(e) => setNewItemProductId(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 flex-1"
                      >
                        <option value="">-- Add another product to this order --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - {formatTaka(p.priceBDT || p.price * 27, false)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddEditItem}
                        disabled={!newItemProductId}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingOrder(false)}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedOrder}
                      className="px-5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Save size={14} />
                      <span>Save Order Changes</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Status Update Bar */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
                    Update Order & Payment Status
                  </span>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    Select "Cancelled" or "Returned" to automatically return items to inventory.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Fulfillment Status: Processing, Shipped, Delivered, Cancelled, Returned */}
                  <select
                    value={selectedOrder.fulfillmentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as AdminOrder['fulfillmentStatus'];
                      updateOrderFulfillment(selectedOrder.id, newStatus);
                      setSelectedOrder({ ...selectedOrder, fulfillmentStatus: newStatus });
                    }}
                    className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Processing">Status: Processing</option>
                    <option value="Shipped">Status: Shipped</option>
                    <option value="Delivered">Status: Delivered</option>
                    <option value="Returned">Status: Returned (Restore Stock)</option>
                    <option value="Cancelled">Status: Cancelled (Restore Stock)</option>
                  </select>

                  {/* Payment Status */}
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as AdminOrder['paymentStatus'];
                      updateOrderPayment(selectedOrder.id, newStatus);
                      setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
                    }}
                    className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Paid">Payment: Paid</option>
                    <option value="Verification Needed">Payment: Verification Needed</option>
                    <option value="Pending">Payment: Pending (Unpaid)</option>
                    <option value="Failed">Payment: Failed</option>
                  </select>
                </div>
              </div>

              {/* COURIER INTEGRATION PANEL (Phase 2 Courier Dispatch) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-slate-700" />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Courier Logistics & One-Click Shipping
                    </span>
                  </div>
                  {selectedOrder.courier ? (
                    <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded border border-emerald-300">
                      Dispatched via {selectedOrder.courier.provider} • ID: {selectedOrder.courier.trackingId}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Not yet assigned to courier</span>
                  )}
                </div>

                {selectedOrder.courier ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Courier Provider:</span>
                      <strong className="text-slate-900">{selectedOrder.courier.provider} Express</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Consignment Tracking ID:</span>
                      <strong className="font-mono text-slate-900 select-all">{selectedOrder.courier.trackingId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Dispatched Timestamp:</span>
                      <span className="text-slate-700">{selectedOrder.courier.shippedAt}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePrintSlip(selectedOrder)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Barcode size={14} />
                      <span>Print Courier Waybill</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-600 font-medium">1-Click Ship via:</span>
                    <button
                      type="button"
                      onClick={() => handleCourierShip('Pathao')}
                      className="px-3 py-1.5 bg-[#E21B23] hover:bg-[#C0151D] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <span>Ship via Pathao</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCourierShip('Steadfast')}
                      className="px-3 py-1.5 bg-[#1C538C] hover:bg-[#164372] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <span>Ship via Steadfast</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCourierShip('RedX')}
                      className="px-3 py-1.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <span>Ship via RedX</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Payment & Security Verification Card */}
              {selectedOrder.paymentMethod !== 'cod' ? (
                <div className="bg-[#FFFDF9] border-2 border-amber-300 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-2xs ${
                        selectedOrder.paymentMethod === 'bkash'
                          ? 'bg-[#E2136E] text-white'
                          : 'bg-[#C44D24] text-white'
                      }`}>
                        {selectedOrder.paymentMethod === 'bkash' ? 'bK' : 'NG'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                            {selectedOrder.paymentMethod === 'bkash' ? 'bKash Send Money' : 'Nagad Send Money'} Verification
                          </span>
                          {getPaymentBadge(selectedOrder.paymentStatus)}
                        </div>
                        <span className="text-[11px] text-amber-800">
                          AFW Atelier Receiving Number: <strong>01792208949</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Detail Metric Blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Customer Sender Number */}
                    <div className="bg-white p-3 rounded-lg border border-amber-200/90 shadow-2xs min-w-0 flex flex-col justify-between">
                      <span className="text-[11px] text-slate-500 font-medium block truncate mb-1">
                        Customer Sender Number
                      </span>
                      <div className="bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200/70 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono tracking-wide break-all block select-all leading-tight">
                          {selectedOrder.paymentDetails?.senderNumber || selectedOrder.customer.phone}
                        </span>
                      </div>
                    </div>

                    {/* Transaction ID (TrxID) - Fitted perfectly inside container without overflow */}
                    <div className="bg-white p-3 rounded-lg border border-amber-200/90 shadow-2xs min-w-0 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
                        <span className="text-[11px] text-slate-500 font-medium truncate">
                          Transaction ID (TrxID)
                        </span>
                        {selectedOrder.paymentDetails?.trxId && (
                          <button
                            type="button"
                            onClick={() => handleCopyTrx(selectedOrder.paymentDetails?.trxId || '')}
                            className="shrink-0 px-1.5 py-0.5 hover:bg-amber-100 rounded text-slate-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-amber-200/90"
                            title="Copy TrxID to clipboard"
                          >
                            {copiedTrx ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                            <span>{copiedTrx ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                      <div className="bg-amber-50/70 px-2.5 py-1.5 rounded border border-amber-200/70 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono tracking-wide break-all block select-all leading-tight">
                          {selectedOrder.paymentDetails?.trxId || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Paid Amount */}
                    <div className="bg-white p-3 rounded-lg border border-amber-200/90 shadow-2xs min-w-0 flex flex-col justify-between">
                      <span className="text-[11px] text-slate-500 font-medium block truncate mb-1">
                        Paid Amount
                      </span>
                      <div className="bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200/70 flex items-baseline justify-between gap-1 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {formatTaka(selectedOrder.paymentDetails?.paidAmount || selectedOrder.totalBDT, false)}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          Req: {formatTaka(selectedOrder.totalBDT, false)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Protocol & Action Toolbar */}
                  <div className="bg-white/95 border border-amber-200 rounded-lg p-3 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold flex items-center gap-1.5 text-amber-900">
                        <ShieldAlert size={14} className="text-amber-700" />
                        <span>Security Check: Anti-Bypass Verification</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Cross-check your bKash/Nagad merchant app for TrxID <strong className="font-mono break-all">{selectedOrder.paymentDetails?.trxId || 'above'}</strong> before confirming.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {selectedOrder.paymentStatus !== 'Paid' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderPayment(selectedOrder.id, 'Paid');
                              setSelectedOrder({ ...selectedOrder, paymentStatus: 'Paid' });
                            }}
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                          >
                            <ShieldCheck size={14} />
                            <span>Verify & Mark Paid</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsPartialPaymentOpen(true)}
                            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg cursor-pointer transition-colors"
                          >
                            Partial Payment
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderPayment(selectedOrder.id, 'Failed');
                              setSelectedOrder({ ...selectedOrder, paymentStatus: 'Failed' });
                            }}
                            className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-lg border border-rose-200 cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle size={14} />
                          <span>Payment Verified & Approved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 block">Payment Method: Cash on Delivery (COD)</span>
                    <span className="text-slate-500">
                      Collect {formatTaka(selectedOrder.totalBDT, false)} in cash upon delivery to customer.
                    </span>
                  </div>
                  {selectedOrder.paymentStatus === 'Paid' ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 self-start sm:self-auto">
                      Cash Collected
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPartialPaymentOpen(true)}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-xs cursor-pointer"
                      >
                        Advance / Partial Paid
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateOrderPayment(selectedOrder.id, 'Paid');
                          setSelectedOrder({ ...selectedOrder, paymentStatus: 'Paid' });
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs cursor-pointer"
                      >
                        Mark Cash Collected
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Partial Payment Info Banner if active */}
              {selectedOrder.partialPayment && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
                  <div>
                    <strong>Partial Payment Recorded:</strong> Advance ৳{selectedOrder.partialPayment.paidAmount} received. Remaining Due to collect upon delivery: <strong>৳{selectedOrder.partialPayment.dueAmount}</strong>.
                    {selectedOrder.partialPayment.notes && <span className="block text-slate-500">Note: {selectedOrder.partialPayment.notes}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPartialPaymentOpen(true)}
                    className="text-xs font-bold text-blue-700 underline"
                  >
                    Adjust
                  </button>
                </div>
              )}

              {/* Customer Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-0">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <User size={12} /> Customer Information
                  </span>
                  <div className="font-semibold text-slate-900 text-sm break-words">
                    {selectedOrder.customer.name}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 min-w-0">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span className="font-mono break-all">{selectedOrder.customer.phone}</span>
                  </div>
                  {selectedOrder.customer.email && (
                    <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5 min-w-0">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="break-all">{selectedOrder.customer.email}</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <MapPin size={12} /> Shipping Destination
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed break-words">
                    {selectedOrder.customer.address}, {selectedOrder.customer.city}
                  </p>
                  {selectedOrder.customer.notes && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-2 break-words">
                      <strong>Customer Delivery Note:</strong> {selectedOrder.customer.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  Ordered Items ({selectedOrder.items.reduce((s, it) => s + it.quantity, 0)} total pcs)
                </span>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-14 object-cover rounded-md border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>Size: <strong className="text-slate-700">{item.size}</strong></span>
                            <span>•</span>
                            <span>Color: <strong className="text-slate-700">{item.color}</strong></span>
                            <span>•</span>
                            <span>Qty: <strong className="text-slate-700">{item.quantity}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-bold text-slate-900 text-sm">
                        {formatTaka(item.priceBDT * item.quantity, false)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatTaka(selectedOrder.subtotalBDT, false)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span>{formatTaka(selectedOrder.shippingBDT, false)}</span>
                </div>
                {selectedOrder.discountBDT && selectedOrder.discountBDT > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Applied</span>
                    <span>-{formatTaka(selectedOrder.discountBDT, false)}</span>
                  </div>
                )}
                {selectedOrder.partialPayment && (
                  <div className="flex justify-between text-blue-700 font-medium">
                    <span>Advance Payment</span>
                    <span>-{formatTaka(selectedOrder.partialPayment.paidAmount, false)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-200">
                  <span>
                    {selectedOrder.partialPayment ? 'Remaining Due for Collection' : 'Grand Total'}
                  </span>
                  <span>
                    {formatTaka(
                      selectedOrder.partialPayment
                        ? selectedOrder.partialPayment.dueAmount
                        : selectedOrder.totalBDT,
                      false
                    )}
                  </span>
                </div>
              </div>

              {/* Internal Notes Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Merchant Internal Notes
                </label>
                <p className="text-[11px] text-slate-500">
                  Only visible to store administrators (e.g., "Customer confirmed size via WhatsApp", "Trx verified").
                </p>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="Add operational notes here..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveInternalNote}
                    className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSlip(selectedOrder)}
                  className="px-3 py-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-xs flex items-center gap-1.5 font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Download size={14} className="text-slate-600" />
                  <span>Download Slip (Clean)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintSlip(selectedOrder)}
                  className="px-3 py-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-xs flex items-center gap-1.5 font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Printer size={14} className="text-slate-600" />
                  <span>Print Slip</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setIsEditingOrder(false);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PARTIAL PAYMENT MODAL */}
      {/* ========================================================================= */}
      {isPartialPaymentOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Record Partial / Advance Payment</h3>
            </div>
            <p className="text-xs text-slate-500">
              Total Order Value: <strong>{formatTaka(selectedOrder.totalBDT, false)}</strong>. Enter the advance amount collected. The remaining will be assigned as COD collection upon delivery.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Advance Amount Paid (৳) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={partialAmountInput}
                  onChange={(e) => setPartialAmountInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Reference / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received advance via personal bKash"
                  value={partialNoteInput}
                  onChange={(e) => setPartialNoteInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPartialPaymentOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePartialPayment}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Save Partial Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CREATE MANUAL ORDER MODAL (For WhatsApp / Social sales) */}
      {/* ========================================================================= */}
      {isCreateOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-slate-900" />
                <h3 className="font-bold text-base text-slate-900">Create Manual Order (Offline / Social)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOrderModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualOrderSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Siddiqa"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Delivery Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House, Road, Sector / Area"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / District</label>
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={manualPaymentMethod}
                    onChange={(e) => setManualPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm"
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="bkash">bKash (Pre-paid)</option>
                    <option value="nagad">Nagad (Pre-paid)</option>
                  </select>
                </div>
              </div>

              {/* Add Items to Manual Order */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">Add Product Items</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Select Product</label>
                    <select
                      value={selectedAddProdId}
                      onChange={(e) => setSelectedAddProdId(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatTaka(p.priceBDT || p.price * 27, false)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Size & Color</label>
                    <input
                      type="text"
                      placeholder="Size S, Maroon"
                      value={selectedAddSize}
                      onChange={(e) => setSelectedAddSize(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddManualItem}
                      className="w-full py-1.5 bg-slate-900 text-white font-semibold rounded text-xs hover:bg-slate-800"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* Items List in Manual Order */}
                {manualItems.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                    {manualItems.map((item, idx) => {
                      const prod = products.find((p) => p.id === item.productId);
                      return (
                        <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-900">{prod?.name}</span>
                            <span className="text-slate-400 ml-2">({item.size}, Qty: {item.quantity})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setManualItems((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs text-center py-2">No items added to this manual order yet.</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOrderModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create & Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
