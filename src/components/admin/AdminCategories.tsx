import React, { useState, useRef } from 'react';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Upload,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { CategoryCardData } from '../../types';
import { compressAndReadFile, generateSlug } from '../../utils/imageCompressor';

export const AdminCategories: React.FC = () => {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
    labels,
    addLabel,
    deleteLabel,
  } = useAdminData();

  // Category modal or form mode
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Category Form State
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Label Form State
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#631D27');

  // Confirmation Modal for Category Deletion
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryCardData | null>(null);

  // Compute live product counts per category
  const getProductCount = (catId: string) => {
    return products.filter((p) => p.category === catId).length;
  };

  const handleStartAdd = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryImage('');
    setCategoryError('');
    setIsAddingCategory(true);
  };

  const handleStartEdit = (cat: CategoryCardData) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.title);
    setCategoryDescription(cat.description || '');
    setCategoryImage(cat.image);
    setCategoryError('');
    setIsAddingCategory(true);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const compressed = await compressAndReadFile(file);
      setCategoryImage(compressed);
    } catch (err: any) {
      setCategoryError(err.message || 'Error processing image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      setCategoryError('Please enter a category name.');
      return;
    }
    if (!categoryImage) {
      setCategoryError('Please choose or upload a category image.');
      return;
    }

    if (editingCategoryId) {
      updateCategory(editingCategoryId, {
        title: categoryName.trim(),
        description: categoryDescription.trim(),
        image: categoryImage,
        slug: `/category/${generateSlug(categoryName)}`,
      });
    } else {
      addCategory({
        title: categoryName.trim(),
        description: categoryDescription.trim(),
        image: categoryImage,
      });
    }

    setIsAddingCategory(false);
    setEditingCategoryId(null);
  };

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;
    addLabel(newLabelName.trim(), newLabelColor);
    setNewLabelName('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Categories & Labels
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize your product catalog into shop collections and promotional badge tags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ========================================================================= */}
        {/* LEFT 2 COLS: CATEGORIES MANAGEMENT */}
        {/* ========================================================================= */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FolderTree size={18} className="text-slate-700" />
                  <span>Store Categories</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  These appear in your navigation menu and homepage category grid.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                <Plus size={15} />
                <span>Add Category</span>
              </button>
            </div>

            {/* Category Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {categories.map((cat) => {
                const count = getProductCount(cat.id);
                const generatedUrl = cat.slug || `/category/${cat.id}`;

                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3 relative group"
                  >
                    <div className="flex gap-3">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="w-16 h-20 object-cover rounded-lg border border-slate-200 shadow-xs shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {cat.description || 'No description provided.'}
                        </p>
                        <span className="inline-block mt-2 text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {count} Products
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px] truncate max-w-[140px]">
                        {generatedUrl}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT 1 COL: LABELS (TAGS) MANAGEMENT */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag size={18} className="text-slate-700" />
                <span>Product Labels (Tags)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Labels automatically become checkboxes in your Product Form (e.g. "Festive Collection").
              </p>
            </div>

            {/* Add Label Form */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
              <span className="text-xs font-semibold text-slate-700 block">
                Create New Label
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent shrink-0"
                  title="Choose badge color"
                />
                <input
                  type="text"
                  placeholder="e.g. Eid Exclusive"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddLabel}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors"
              >
                + Add Label
              </button>
            </div>

            {/* Current Labels List */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Active Labels ({labels.length})
              </span>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {labels.map((lbl) => (
                  <div
                    key={lbl.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: lbl.color || '#1E293B' }}
                      />
                      <span className="text-xs font-medium text-slate-800">{lbl.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteLabel(lbl.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete label"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT CATEGORY MODAL */}
      {/* ========================================================================= */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCategoryId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            {categoryError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{categoryError}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Kurtis"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
              {/* Auto-generate URL feature (Blueprint instruction) */}
              <p className="text-[11px] text-slate-400 mt-1">
                Auto-generated page URL: <strong className="text-slate-600">/category/{generateSlug(categoryName) || 'name'}</strong>
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Brief description displayed on the homepage card..."
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Image Upload / Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category Card Image *
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {categoryImage ? (
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-xs shrink-0 group">
                    <img
                      src={categoryImage}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCategoryImage('')}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs shrink-0">
                    <Upload size={16} className="mb-1" />
                    <span>No Image</span>
                  </div>
                )}

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload size={14} />
                      <span>{isUploadingImage ? 'Processing...' : 'Upload Device Image'}</span>
                    </button>
                    <span className="text-xs text-slate-400">or paste URL below</span>
                  </div>

                  <input
                    type="url"
                    placeholder="https://... direct image link"
                    value={categoryImage}
                    onChange={(e) => setCategoryImage(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-xs"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Category?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete <strong>{categoryToDelete.title}</strong>? Products will not be deleted, but will be unassigned from this category.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCategory(categoryToDelete.id);
                  setCategoryToDelete(null);
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
