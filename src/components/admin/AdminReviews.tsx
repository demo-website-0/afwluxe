import React, { useState } from 'react';
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { Testimonial } from '../../types';

export const AdminReviews: React.FC = () => {
  const { reviews, products, addReview, updateReview, deleteReview, toggleReviewStatus, showToast } =
    useAdminData();

  // Mode: 'list' | 'add' | 'edit'
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [productName, setProductName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Delete Confirmation
  const [reviewToDelete, setReviewToDelete] = useState<Testimonial | null>(null);

  const handleStartAdd = () => {
    setEditingReviewId(null);
    setCustomerName('');
    setReviewText('');
    setRating(5);
    setProductName(products[0]?.name || 'Maroon Lace hijab');
    setErrorMsg('');
    setIsEditing(true);
  };

  const handleStartEdit = (r: Testimonial) => {
    setEditingReviewId(r.id);
    setCustomerName(r.author);
    setReviewText(r.quote);
    setRating(r.rating || 5);
    setProductName(r.purchasedItem || '');
    setErrorMsg('');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!customerName.trim()) {
      setErrorMsg('Please enter the customer name.');
      return;
    }
    if (!reviewText.trim()) {
      setErrorMsg('Please enter the review text.');
      return;
    }

    if (editingReviewId) {
      updateReview(editingReviewId, {
        author: customerName.trim(),
        quote: reviewText.trim(),
        rating,
        purchasedItem: productName.trim() || 'AFW Luxury Item',
      });
    } else {
      addReview({
        author: customerName.trim(),
        location: 'Verified Customer',
        quote: reviewText.trim(),
        rating,
        purchasedItem: productName.trim() || 'AFW Luxury Item',
        status: 'published',
      });
    }

    setIsEditing(false);
    setEditingReviewId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Customer Reviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage feedback, publish positive client testimonials, or add manual reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
        >
          <Plus size={16} />
          <span>Add New Review</span>
        </button>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Review</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No reviews found. Click "Add New Review" to add the first one.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  const isPublished = r.status !== 'hidden';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Customer Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {r.author}
                        <span className="block text-[11px] font-normal text-slate-400">
                          {r.location || 'Verified Buyer'}
                        </span>
                      </td>

                      {/* Review Text (Truncated) */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <p className="text-slate-600 line-clamp-2 italic">
                          "{r.quote}"
                        </p>
                      </td>

                      {/* Rating Stars */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">
                        {r.purchasedItem || 'Store Purchase'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Hidden'}
                        </span>
                      </td>

                      {/* Actions: Edit, Hide/Show, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleReviewStatus(r.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title={isPublished ? 'Hide from store' : 'Publish to store'}
                          >
                            {isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(r)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Review"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewToDelete(r)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 size={15} />
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
      {/* ADD / EDIT REVIEW MODAL */}
      {/* ========================================================================= */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingReviewId ? 'Edit Review' : 'Add New Review'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Layla Khan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Rating Stars Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none font-medium"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                <option value={4}>⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                <option value={3}>⭐⭐⭐ 3 Stars (Average)</option>
                <option value={2}>⭐⭐ 2 Stars (Below Average)</option>
                <option value={1}>⭐ 1 Star (Poor)</option>
              </select>
            </div>

            {/* Product Link (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Name (Optional)
              </label>
              <input
                type="text"
                list="product-options"
                placeholder="Select or type product name..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
              <datalist id="product-options">
                {products.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Review Text *
              </label>
              <textarea
                rows={4}
                placeholder="What did the customer say about the quality, fabric, and delivery..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-xs"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Review?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete this review by <strong>{reviewToDelete.author}</strong>? This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteReview(reviewToDelete.id);
                  setReviewToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
