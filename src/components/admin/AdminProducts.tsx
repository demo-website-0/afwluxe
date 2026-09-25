import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  AlertCircle,
  Bold,
  Italic,
  List,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
  Crop,
  CheckSquare,
  Square,
  DollarSign,
  Layers,
  Eye,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { useAdminData } from '../../context/AdminDataContext';
import { formatTaka } from '../../utils/currency';
import { compressAndReadFile, generateSlug } from '../../utils/imageCompressor';
import { matchProductFuzzy } from '../../utils/fuzzySearch';
import { ImageCropperModal } from './ImageCropperModal';

const STANDARD_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size'];

interface AdminProductsProps {
  initialEditProductId?: string | null;
  onClearInitialEdit?: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  initialEditProductId,
  onClearInitialEdit,
}) => {
  const {
    products,
    categories,
    labels,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateProductStatus,
    bulkUpdateProductCategory,
    showToast,
  } = useAdminData();

  // Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Bulk Selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<ProductCategory>('hijab');
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Delete Confirmation Modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // 4:5 Cropper Modal State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperTargetIdx, setCropperTargetIdx] = useState<number | null>(null);
  const [cropperImageSrc, setCropperImageSrc] = useState<string>('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceBDT, setPriceBDT] = useState<number | ''>('');
  const [compareAtPriceBDT, setCompareAtPriceBDT] = useState<number | ''>('');
  const [costPriceBDT, setCostPriceBDT] = useState<number | ''>('');
  const [category, setCategory] = useState<ProductCategory>('hijab');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(true);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);

  // Gallery Images (Up to 6 images)
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Badges / Labels
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Variants (Sizes & Colors)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [colorList, setColorList] = useState<{ name: string; hex: string; image?: string }[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#631D27');

  // Variant Stock Matrix (key: `${color}_${size}`)
  const [variantStock, setVariantStock] = useState<Record<string, number>>({});

  // Advanced Settings (Auto-generated)
  const [slug, setSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const colorFileInputRef = useRef<HTMLInputElement>(null);
  const [targetColorIndexForImage, setTargetColorIndexForImage] = useState<number | null>(null);

  // Handle initial edit passed from dashboard
  useEffect(() => {
    if (initialEditProductId) {
      handleStartEdit(initialEditProductId);
      if (onClearInitialEdit) onClearInitialEdit();
    }
  }, [initialEditProductId]);

  // Sync slug as user types title
  useEffect(() => {
    if (viewMode === 'create' && title) {
      setSlug(generateSlug(title));
      setSeoTitle(`${title} | AFW Luxury Modest Fashion`);
      setSeoDescription(
        description
          ? description.slice(0, 150)
          : `Shop ${title} online at AFW. Premium modest fashion curated in London.`
      );
    }
  }, [title, viewMode]);

  // Auto-calculate suggested cost price if empty when price is entered
  const handlePriceChange = (val: number | '') => {
    setPriceBDT(val);
    if (val !== '' && (costPriceBDT === '' || costPriceBDT === 0)) {
      setCostPriceBDT(Math.round(Number(val) * 0.55));
    }
  };

  // Open Edit Form
  const handleStartEdit = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    setSelectedProductId(prod.id);
    setTitle(prod.name);
    setDescription(prod.description || '');
    setPriceBDT(prod.priceBDT || prod.price * 27);
    setCompareAtPriceBDT(prod.compareAtPriceBDT || (prod.originalPrice ? prod.originalPrice * 27 : ''));
    setCostPriceBDT(prod.costPriceBDT || Math.round((prod.priceBDT || prod.price * 27) * 0.55));
    setCategory(prod.category);
    setStockQuantity(prod.stockCount ?? 10);
    setStatus(prod.status || 'active');

    // Default size guide: true for dresses/abayas/kurtis, false for bags/hijabs/rings
    setShowSizeGuide(
      prod.showSizeGuide !== undefined
        ? prod.showSizeGuide
        : !['hijab', 'bag', 'rings', 'accessories'].includes(prod.category)
    );

    // Gallery images: take up to 6
    const existingGallery = prod.galleryImages && prod.galleryImages.length > 0
      ? prod.galleryImages
      : [prod.image, ...(prod.secondaryImage && prod.secondaryImage !== prod.image ? [prod.secondaryImage] : [])];
    setGalleryImages(existingGallery.slice(0, 6));

    setSelectedLabels(prod.labels || []);
    setSelectedSizes(prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L']);
    setColorList(prod.colors && prod.colors.length > 0 ? prod.colors : [{ name: 'Default', hex: '#1C1C1C' }]);
    setVariantStock(prod.variantStock || {});
    setRelatedProductIds(prod.relatedProductIds || []);

    setSlug(prod.slug || generateSlug(prod.name));
    setSeoTitle(prod.seoTitle || `${prod.name} | AFW Atelier`);
    setSeoDescription(prod.seoDescription || prod.subtitle || '');
    setErrors({});
    setViewMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Create Form
  const handleStartCreate = () => {
    setSelectedProductId(null);
    setTitle('');
    setDescription('');
    setPriceBDT('');
    setCompareAtPriceBDT('');
    setCostPriceBDT('');
    setCategory('hijab');
    setStockQuantity(10);
    setStatus('active');
    setShowSizeGuide(false);
    setGalleryImages([]);
    setSelectedLabels(['New Arrival']);
    setSelectedSizes(['Standard']);
    setColorList([{ name: 'Rich Maroon', hex: '#631D27' }]);
    setVariantStock({});
    setRelatedProductIds([]);
    setSlug('');
    setSeoTitle('');
    setSeoDescription('');
    setErrors({});
    setViewMode('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gallery Image Upload with Automatic Compression
  const handleGalleryUpload = async (file: File) => {
    if (galleryImages.length >= 6) {
      showToast('Maximum 6 gallery images allowed');
      return;
    }
    try {
      setIsUploadingGallery(true);
      const compressedUrl = await compressAndReadFile(file, 1000, 1250);
      setGalleryImages((prev) => [...prev, compressedUrl].slice(0, 6));
      showToast('Image added to gallery');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  // Reorder Gallery Images (First image is main)
  const handleMoveImage = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= galleryImages.length) return;
    const updated = [...galleryImages];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setGalleryImages(updated);
    showToast(targetIdx === 0 ? 'Image set as Main Image' : 'Gallery order updated');
  };

  const handleSetAsMainImage = (idx: number) => {
    if (idx === 0) return;
    const updated = [...galleryImages];
    const [selected] = updated.splice(idx, 1);
    updated.unshift(selected);
    setGalleryImages(updated);
    showToast('Image promoted to Main Product Image');
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
    showToast('Image removed from gallery');
  };

  const handleOpenCropperForImage = (idx: number) => {
    setCropperTargetIdx(idx);
    setCropperImageSrc(galleryImages[idx]);
    setCropperOpen(true);
  };

  const handleCropComplete = (croppedUrl: string) => {
    if (cropperTargetIdx === null) return;
    const updated = [...galleryImages];
    updated[cropperTargetIdx] = croppedUrl;
    setGalleryImages(updated);
    showToast('4:5 aspect ratio crop applied');
  };

  // Variant Color Image Upload
  const handleColorImageUpload = async (file: File) => {
    if (targetColorIndexForImage === null) return;
    try {
      const compressedUrl = await compressAndReadFile(file, 1000, 1250);
      setColorList((prev) =>
        prev.map((c, idx) =>
          idx === targetColorIndexForImage ? { ...c, image: compressedUrl } : c
        )
      );
      showToast(`Variant image attached to color: ${colorList[targetColorIndexForImage]?.name}`);
    } catch (e: any) {
      showToast('Error uploading color image');
    } finally {
      setTargetColorIndexForImage(null);
    }
  };

  // Toggle Size
  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) => {
      const next = prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz];
      return next;
    });
  };

  const handleAddCustomSize = () => {
    if (customSizeInput.trim() && !selectedSizes.includes(customSizeInput.trim())) {
      setSelectedSizes((prev) => [...prev, customSizeInput.trim()]);
      setCustomSizeInput('');
    }
  };

  // Add Color
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColorList((prev) => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (index: number) => {
    setColorList((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant Stock Matrix updates
  const handleVariantStockChange = (color: string, size: string, val: number) => {
    const key = `${color}_${size}`;
    setVariantStock((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  // Toggle Label
  const toggleLabel = (labelName: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelName)
        ? prev.filter((l) => l !== labelName)
        : [...prev, labelName]
    );
  };

  // Toggle Related Product
  const toggleRelatedProduct = (id: string) => {
    setRelatedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Simple rich text insert helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    setDescription((prev) => `${prev} ${prefix}Sample Text${suffix}`);
  };

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleExecuteBulkDelete = () => {
    bulkDeleteProducts(selectedProductIds);
    setSelectedProductIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const handleExecuteBulkStatus = (newStatus: 'active' | 'draft') => {
    bulkUpdateProductStatus(selectedProductIds, newStatus);
    setSelectedProductIds([]);
  };

  const handleExecuteBulkCategory = () => {
    const targetCat = categories.find((c) => c.id === bulkCategoryTarget);
    const label = targetCat ? targetCat.title : 'Category';
    bulkUpdateProductCategory(selectedProductIds, bulkCategoryTarget, label);
    setSelectedProductIds([]);
  };

  // Validation & Save
  const handleSave = (saveAsDraft: boolean = false) => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Please enter a product title.';
    }
    if (priceBDT === '' || Number(priceBDT) <= 0) {
      newErrors.price = 'Please enter a price for this product.';
    }
    if (galleryImages.length === 0) {
      newErrors.image = 'Please upload at least 1 image for the product gallery.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const catObj = categories.find((c) => c.id === category);
    const categoryLabel = catObj ? catObj.title : 'Modest Fashion';
    const mainImg = galleryImages[0];
    const hoverImg = galleryImages[1] || galleryImages[0];

    const finalPrice = Number(priceBDT);
    const finalCostPrice = costPriceBDT ? Number(costPriceBDT) : Math.round(finalPrice * 0.55);

    // Sum up variant stock or use stockQuantity
    let calculatedStock = stockQuantity;
    const variantStockKeys = Object.keys(variantStock);
    if (variantStockKeys.length > 0 && selectedSizes.length > 0 && colorList.length > 0) {
      calculatedStock = Object.values(variantStock).reduce((a, b) => a + b, 0);
    }

    const productPayload: Omit<Product, 'id'> = {
      name: title.trim(),
      subtitle: description.split('.')[0] || 'Exclusive AFW atelier creation',
      category: category,
      categoryLabel: categoryLabel,
      price: Math.round(finalPrice / 27),
      priceBDT: finalPrice,
      compareAtPriceBDT: compareAtPriceBDT ? Number(compareAtPriceBDT) : undefined,
      originalPrice: compareAtPriceBDT ? Math.round(Number(compareAtPriceBDT) / 27) : undefined,
      costPriceBDT: finalCostPrice,
      inStock: calculatedStock > 0,
      stockCount: calculatedStock,
      showSizeGuide: showSizeGuide,
      brand: 'AFW Atelier',
      rating: 5.0,
      reviewsCount: 12,
      image: mainImg,
      secondaryImage: hoverImg,
      galleryImages: galleryImages,
      colors: colorList.length > 0 ? colorList : [{ name: 'Default', hex: '#1C1C1C' }],
      sizes: selectedSizes.length > 0 ? selectedSizes : ['Standard'],
      variantStock: variantStock,
      relatedProductIds: relatedProductIds,
      description: description.trim() || `${title} crafted with luxury textiles and precision tailoring.`,
      fabric: 'Ultra-Smooth Breathable Blend',
      fit: 'Fluid graceful modest drape',
      care: 'Dry clean or gentle cold wash',
      isNew: selectedLabels.includes('New Arrival'),
      isBestseller: selectedLabels.includes('Best Seller'),
      isSale: selectedLabels.includes('Sale'),
      isLimitedEdition: selectedLabels.includes('Limited Edition'),
      status: saveAsDraft ? 'draft' : status,
      labels: selectedLabels,
      slug: slug || generateSlug(title),
      seoTitle: seoTitle || `${title} | AFW`,
      seoDescription: seoDescription,
    };

    if (viewMode === 'edit' && selectedProductId) {
      updateProduct(selectedProductId, productPayload);
    } else {
      addProduct(productPayload);
    }

    setViewMode('list');
    setSelectedProductId(null);
  };

  // Filtered Products List with Fuzzy Search
  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim() && !matchProductFuzzy(p, searchQuery)) {
      return false;
    }
    if (categoryFilter !== 'all' && p.category !== categoryFilter) {
      return false;
    }
    if (statusFilter === 'active' && p.status === 'draft') return false;
    if (statusFilter === 'draft' && p.status !== 'draft') return false;
    return true;
  });

  const allAvailableLabels = [
    'New Arrival',
    'Best Seller',
    'Sale',
    'Limited Edition',
    ...labels.map((l) => l.name).filter((n) => !['New Arrival', 'Best Seller', 'Sale', 'Limited Edition'].includes(n)),
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. LIST VIEW WITH BULK ACTIONS */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Products & Inventory
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your store’s catalog, variants, cost prices, and stock counts.
              </p>
            </div>

            <button
              type="button"
              id="admin-add-product-btn"
              onClick={handleStartCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={18} />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Filters Bar with Fuzzy Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input with Fuzzy Match */}
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Fuzzy search title, tunic, kurti, fabrics, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 text-sm rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none focus:bg-white text-slate-900"
              />
            </div>

            {/* Category & Status Selectors */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 w-1/2 md:w-auto">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 bg-slate-50 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none text-slate-800 font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="hijab">Hijab & Khimars</option>
                  <option value="abayas">Abayas & Kaftans</option>
                  <option value="dresses">Modest Dresses</option>
                  <option value="kurtis">Tops & Co-Ords</option>
                  <option value="bag">Bags & Accessories</option>
                  <option value="rings">Rings</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-1/2 md:w-auto">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 bg-slate-50 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none text-slate-800 font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="draft">Drafts Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions Floating Bar */}
          {selectedProductIds.length > 0 && (
            <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-400" />
                <span className="text-sm font-semibold">
                  {selectedProductIds.length} product{selectedProductIds.length > 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Mark Active */}
                <button
                  type="button"
                  onClick={() => handleExecuteBulkStatus('active')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Mark as Active
                </button>

                {/* Mark Draft */}
                <button
                  type="button"
                  onClick={() => handleExecuteBulkStatus('draft')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Mark as Draft
                </button>

                {/* Change Category */}
                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-slate-400">Move to:</span>
                  <select
                    value={bulkCategoryTarget}
                    onChange={(e) => setBulkCategoryTarget(e.target.value as ProductCategory)}
                    className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="hijab" className="text-slate-900">Hijab</option>
                    <option value="abayas" className="text-slate-900">Abayas</option>
                    <option value="dresses" className="text-slate-900">Dresses</option>
                    <option value="kurtis" className="text-slate-900">Kurtis & Tops</option>
                    <option value="bag" className="text-slate-900">Bags</option>
                    <option value="rings" className="text-slate-900">Rings</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleExecuteBulkCategory}
                    className="ml-1 px-2 py-0.5 bg-white text-slate-900 font-bold rounded hover:bg-slate-100 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {/* Delete Selected */}
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProductIds([])}
                  className="text-slate-400 hover:text-white px-2 py-1 ml-1"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}

          {/* Product Table with Checkboxes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-slate-500 hover:text-slate-900 cursor-pointer"
                        title="Select all products"
                      >
                        {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                          <CheckSquare size={16} className="text-slate-900" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price & Cost</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Size Guide</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                        No products match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isDraft = p.status === 'draft';
                      const isOutOfStock = p.inStock === false || (p.stockCount ?? 0) === 0;
                      const isLowStock = !isOutOfStock && (p.stockCount ?? 10) <= 3;
                      const isChecked = selectedProductIds.includes(p.id);
                      const costBDT = p.costPriceBDT ?? Math.round((p.priceBDT || p.price * 27) * 0.55);

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-50/60 transition-colors ${
                            isChecked ? 'bg-slate-50' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectProduct(p.id)}
                              className="text-slate-400 hover:text-slate-900 cursor-pointer"
                            >
                              {isChecked ? (
                                <CheckSquare size={16} className="text-slate-900" />
                              ) : (
                                <Square size={16} />
                              )}
                            </button>
                          </td>

                          {/* Image & Title */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-12 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
                              />
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 block truncate max-w-xs">
                                  {p.name}
                                </span>
                                <span className="text-xs text-slate-400 truncate block">
                                  {p.subtitle || 'AFW Luxury Item'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                              {p.categoryLabel}
                            </span>
                          </td>

                          {/* Price & Cost */}
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div>{formatTaka(p.priceBDT || p.price * 27, false)}</div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              Cost: {formatTaka(costBDT, false)}
                            </div>
                          </td>

                          {/* Stock Status */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isOutOfStock
                                    ? 'bg-rose-500'
                                    : isLowStock
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              <span
                                className={`font-semibold ${
                                  isOutOfStock
                                    ? 'text-rose-600'
                                    : isLowStock
                                    ? 'text-amber-600'
                                    : 'text-slate-700'
                                }`}
                              >
                                {isOutOfStock
                                  ? 'Out of Stock'
                                  : `${p.stockCount ?? 10} left`}
                              </span>
                            </div>
                          </td>

                          {/* Size Guide Indicator */}
                          <td className="py-3.5 px-4">
                            {p.showSizeGuide !== false ? (
                              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Enabled
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                Hidden
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isDraft
                                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isDraft ? 'Draft' : 'Active'}
                            </span>
                          </td>

                          {/* Actions: Edit, Delete */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(p.id)}
                                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductToDelete(p)}
                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 size={16} />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADD / EDIT PRODUCT FORM */}
      {/* ========================================================================= */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="space-y-6 pb-28">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {viewMode === 'create' ? 'Add New Product' : `Edit Product: ${title}`}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Configure high-resolution gallery images, variant stocks, and pricing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'draft')}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800"
              >
                <option value="active">Active (Visible to customers)</option>
                <option value="draft">Draft (Hidden in store)</option>
              </select>
            </div>
          </div>

          {/* Form Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Details, Images, Variants */}
            <div className="lg:col-span-2 space-y-6">
              {/* Box 1: Product Gallery & 4:5 Aspect Ratio Cropper (Up to 6 images) */}
              <div id="field-image" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Product Gallery ({galleryImages.length}/6 Images)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      First image is main. Click "4:5 Crop" to align to the high-fashion standard. Drag or use arrows to reorder.
                    </p>
                  </div>
                  {errors.image && (
                    <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.image}
                    </span>
                  )}
                </div>

                {/* Gallery Slots Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden group flex flex-col items-center justify-between p-2 min-h-[220px]"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-full aspect-4/5 rounded-lg overflow-hidden bg-white border border-slate-200 shadow-2xs mb-2">
                        <img
                          src={imgUrl}
                          alt={`Gallery slot ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                            Main Image
                          </span>
                        )}
                      </div>

                      {/* Controls Toolbar */}
                      <div className="w-full flex items-center justify-between gap-1 pt-1 border-t border-slate-200/70">
                        <div className="flex items-center gap-1">
                          {/* Move Left */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, 'left')}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-20 cursor-pointer"
                            title="Move Left"
                          >
                            <ArrowLeft size={13} />
                          </button>
                          {/* Move Right */}
                          <button
                            type="button"
                            disabled={idx === galleryImages.length - 1}
                            onClick={() => handleMoveImage(idx, 'right')}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-20 cursor-pointer"
                            title="Move Right"
                          >
                            <ArrowLeftRight size={13} />
                          </button>
                          {/* Crop 4:5 */}
                          <button
                            type="button"
                            onClick={() => handleOpenCropperForImage(idx)}
                            className="p-1 hover:bg-amber-100 rounded text-amber-700 cursor-pointer"
                            title="Built-in 4:5 Aspect Ratio Cropper"
                          >
                            <Crop size={13} />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetAsMainImage(idx)}
                              className="text-[10px] font-semibold text-slate-700 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-200 cursor-pointer"
                              title="Set as first/main image"
                            >
                              Make Main
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete Image"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Image Slot (if < 6) */}
                  {galleryImages.length < 6 && (
                    <div
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all bg-slate-50/50 hover:bg-slate-50 cursor-pointer min-h-[220px] group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform mb-2">
                        <Upload size={18} />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        + Add Image ({galleryImages.length}/6)
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        JPEG, PNG (Auto 4:5)
                      </span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={galleryFileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleGalleryUpload(file);
                  }}
                  className="hidden"
                />
              </div>

              {/* Box 2: Product Details, Pricing, and Cost Price */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900">Product Details & Financials</h2>

                {/* Title */}
                <div id="field-title">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Maroon Georgette Hijab"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none transition-colors ${
                      errors.title ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-slate-400'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-xs text-rose-600 mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Description with Toolbar */}
                <div id="field-description">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Description
                    </label>
                    <div className="flex items-center gap-1 border border-slate-200 rounded-md p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                        title="Bold"
                      >
                        <Bold size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                        title="Italic"
                      >
                        <Italic size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n• ')}
                        className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                        title="Bullet list"
                      >
                        <List size={13} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Describe the fabric, texture, occasion, and handcrafted features..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Pricing: Selling Price, Compare-at Price, and Cost Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {/* Selling Price */}
                  <div id="field-price">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Selling Price (৳) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        ৳
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={priceBDT}
                        onChange={(e) => handlePriceChange(e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none ${
                          errors.price ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-slate-400'
                        }`}
                      />
                    </div>
                    {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
                  </div>

                  {/* Compare-at Price */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Compare-at Price (৳)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        ৳
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. 650"
                        value={compareAtPriceBDT}
                        onChange={(e) =>
                          setCompareAtPriceBDT(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Strikethrough original price
                    </span>
                  </div>

                  {/* Cost Price (NEW: Used for Owner Profit Tracking) */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <DollarSign size={13} className="text-emerald-600" />
                      <span>Cost Price (৳) *</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        ৳
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. 250"
                        value={costPriceBDT}
                        onChange={(e) =>
                          setCostPriceBDT(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full pl-8 pr-3.5 py-2.5 bg-emerald-50/30 border border-emerald-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-emerald-700 mt-1 block">
                      Tracks profit in your Dashboard
                    </span>
                  </div>
                </div>

                {/* Overall Stock Count */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Total Available Stock *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    className="w-full max-w-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {stockQuantity === 0 ? 'Will trigger "Out of Stock" mode' : `${stockQuantity} units in inventory`}
                  </span>
                </div>
              </div>

              {/* Box 3: Variants (Sizes & Colors) with Variant Images & Stock Tracking */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Variants (Sizes, Colors & Variant Stock)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Attach photos per color and track inventory per variant combination.
                  </p>
                </div>

                {/* Sizes Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Available Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_SIZES.map((sz) => {
                      const isChecked = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isChecked && <Check size={12} className="inline mr-1 -mt-0.5" />}
                          {sz}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Size */}
                  <div className="flex items-center gap-2 mt-3 max-w-xs">
                    <input
                      type="text"
                      placeholder="Add custom size (e.g. Maxi)"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 flex-1 focus:outline-none focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Colors List with Variant Image Upload */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Available Colors & Variant Images
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                    {colorList.map((col, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="font-semibold truncate">{col.name}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Variant Image Preview & Upload */}
                          {col.image ? (
                            <div className="flex items-center gap-1">
                              <img
                                src={col.image}
                                alt={col.name}
                                className="w-7 h-8 object-cover rounded border border-slate-300"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetColorIndexForImage(idx);
                                  colorFileInputRef.current?.click();
                                }}
                                className="text-[10px] text-slate-600 hover:text-slate-900 underline"
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setTargetColorIndexForImage(idx);
                                colorFileInputRef.current?.click();
                              }}
                              className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[10px] font-semibold rounded flex items-center gap-1 cursor-pointer"
                            >
                              <Upload size={10} />
                              <span>Attach Photo</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveColor(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Remove color"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hidden file input for color images */}
                  <input
                    type="file"
                    ref={colorFileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleColorImageUpload(file);
                    }}
                    className="hidden"
                  />

                  {/* Add Color Picker */}
                  <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                      title="Choose color shade"
                    />
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Rich Maroon)"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      + Add Color
                    </button>
                  </div>
                </div>

                {/* Variant Inventory Matrix (Color + Size Combination Stock) */}
                {selectedSizes.length > 0 && colorList.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Variant Stock Matrix (Color + Size Breakdown)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated: Record<string, number> = {};
                          const perVariant = Math.max(1, Math.floor(stockQuantity / (colorList.length * selectedSizes.length)));
                          colorList.forEach((c) => {
                            selectedSizes.forEach((s) => {
                              updated[`${c.name}_${s}`] = perVariant;
                            });
                          });
                          setVariantStock(updated);
                          showToast('Stock distributed across variants');
                        }}
                        className="text-[11px] text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
                      >
                        Auto-distribute total stock
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100/80 border-b border-slate-200 font-semibold text-slate-600 text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5">Color</th>
                            <th className="p-2.5">Size</th>
                            <th className="p-2.5 w-32">Units in Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60 bg-white">
                          {colorList.map((col) =>
                            selectedSizes.map((sz) => {
                              const key = `${col.name}_${sz}`;
                              const currentVal = variantStock[key] ?? Math.max(1, Math.floor(stockQuantity / Math.max(1, colorList.length * selectedSizes.length)));
                              return (
                                <tr key={key} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-medium flex items-center gap-2">
                                    <span
                                      className="w-3 h-3 rounded-full border border-slate-300"
                                      style={{ backgroundColor: col.hex }}
                                    />
                                    <span>{col.name}</span>
                                  </td>
                                  <td className="p-2.5 font-semibold text-slate-700">{sz}</td>
                                  <td className="p-2.5">
                                    <input
                                      type="number"
                                      min={0}
                                      value={currentVal}
                                      onChange={(e) =>
                                        handleVariantStockChange(
                                          col.name,
                                          sz,
                                          parseInt(e.target.value || '0', 10)
                                        )
                                      }
                                      className="w-20 px-2 py-1 border border-slate-200 rounded text-xs text-slate-900 font-bold bg-slate-50 focus:bg-white"
                                    />
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Category, Size Guide Toggle, Related Products, Labels & SEO */}
            <div className="space-y-6">
              {/* Category Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h2 className="text-base font-bold text-slate-900">Category Collection</h2>
                <p className="text-xs text-slate-500">
                  Select which collection this product belongs to.
                </p>

                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value as ProductCategory;
                    setCategory(newCat);
                    // Automatically toggle size guide off for bag, hijab, rings
                    if (['hijab', 'bag', 'rings', 'accessories'].includes(newCat)) {
                      setShowSizeGuide(false);
                    } else {
                      setShowSizeGuide(true);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="hijab">Hijab & Khimars</option>
                  <option value="abayas">Abayas & Kaftans</option>
                  <option value="dresses">Modest Maxi Dresses</option>
                  <option value="kurtis">Tops & Co-Ords</option>
                  <option value="bag">Bags & Accessories</option>
                  <option value="rings">Rings & Jewelry</option>
                </select>
              </div>

              {/* Conditional Size Guide Toggle */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Size Guide Visibility</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Rule #2
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Controls whether the "Size guide" button appears on the customer product page.
                </p>

                <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={showSizeGuide}
                    onChange={(e) => setShowSizeGuide(e.target.checked)}
                    className="w-4 h-4 text-slate-900 rounded border-slate-300 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Show Size Guide on this Product
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Uncheck this for bags, hijabs, and accessories so customers don't see an irrelevant size chart.
                    </span>
                  </div>
                </label>
              </div>

              {/* Related Products Selector */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h2 className="text-base font-bold text-slate-900">Related Products</h2>
                <p className="text-xs text-slate-500">
                  Manually choose up to 4 complementary pieces to show at the bottom of the product page (or defaults to same category).
                </p>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                  {products
                    .filter((p) => p.id !== selectedProductId)
                    .map((p) => {
                      const isSelected = relatedProductIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleRelatedProduct(p.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                            isSelected
                              ? 'bg-slate-900 text-white font-semibold'
                              : 'hover:bg-slate-100 text-slate-700 bg-white border border-slate-200/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-6 h-7 rounded object-cover shrink-0"
                            />
                            <span className="truncate">{p.name}</span>
                          </div>
                          <span className="text-[10px] shrink-0 opacity-80">
                            {formatTaka(p.priceBDT || p.price * 27, false)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Labels & Badges */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h2 className="text-base font-bold text-slate-900">Labels & Badges</h2>
                <p className="text-xs text-slate-500">
                  Check a box to display an artisanal badge on the product card.
                </p>

                <div className="space-y-2 pt-1">
                  {allAvailableLabels.map((lbl) => {
                    const isChecked = selectedLabels.includes(lbl);
                    return (
                      <label
                        key={lbl}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleLabel(lbl)}
                          className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-800">{lbl}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Advanced SEO Settings (Collapsed <details>) */}
              <details className="group bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <summary className="font-semibold text-xs text-slate-600 uppercase tracking-wider cursor-pointer list-none flex items-center justify-between">
                  <span>Advanced SEO (Auto-generated)</span>
                  <ChevronDown size={16} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>

                <div className="pt-4 space-y-3 text-xs text-slate-600">
                  <p className="text-slate-400 text-[11px]">
                    Optimized for Google Search & social sharing cards.
                  </p>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Preview: https://afwluxe.com/product/{slug || 'product-name'}
                    </span>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">SEO Meta Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">SEO Meta Description</label>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800"
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Sticky Save Bar at Bottom */}
          <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 sm:px-8 z-40 flex items-center justify-between shadow-lg">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4:5 Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperImageSrc}
        onClose={() => {
          setCropperOpen(false);
          setCropperTargetIdx(null);
        }}
        onCropComplete={handleCropComplete}
      />

      {/* Delete Single Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Product?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete <strong>{productToDelete.name}</strong>? This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete {selectedProductIds.length} Selected Products?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                This will permanently delete all selected items from your catalog and cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Yes, Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
