import React, { useState, useRef } from 'react';
import {
  LayoutTemplate,
  Image as ImageIcon,
  Upload,
  Check,
  Save,
  Sparkles,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { compressAndReadFile } from '../../utils/imageCompressor';

type CMSSection = 'hero' | 'categoryGrid' | 'editorialBanner' | 'newsletter' | 'legalPages';

export const AdminCMS: React.FC = () => {
  const { cmsContent, updateCMSContent, updateLegalPolicy, categories, showToast } = useAdminData();
  const [activeSection, setActiveSection] = useState<CMSSection>('hero');

  // Hero Section State
  const [heroHeadline, setHeroHeadline] = useState(cmsContent.hero.headline);
  const [heroSubheadline, setHeroSubheadline] = useState(cmsContent.hero.subheadline);
  const [heroButtonText, setHeroButtonText] = useState(cmsContent.hero.buttonText);
  const [heroButtonLink, setHeroButtonLink] = useState(cmsContent.hero.buttonLink);
  const [heroImage, setHeroImage] = useState(cmsContent.hero.image);

  // Category Grid State (4 Slots)
  const [catSlots, setCatSlots] = useState({
    slot1: { ...cmsContent.categoryGrid.slot1 },
    slot2: { ...cmsContent.categoryGrid.slot2 },
    slot3: { ...cmsContent.categoryGrid.slot3 },
    slot4: { ...cmsContent.categoryGrid.slot4 },
  });

  // Editorial Banner State
  const [editorialHeadline, setEditorialHeadline] = useState(cmsContent.editorialBanner.headline);
  const [editorialSubheadline, setEditorialSubheadline] = useState(
    cmsContent.editorialBanner.subheadline
  );
  const [editorialButtonText, setEditorialButtonText] = useState(
    cmsContent.editorialBanner.buttonText
  );
  const [editorialButtonLink, setEditorialButtonLink] = useState(
    cmsContent.editorialBanner.buttonLink
  );
  const [editorialImage, setEditorialImage] = useState(cmsContent.editorialBanner.image);

  // Newsletter State
  const [newsletterHeadline, setNewsletterHeadline] = useState(cmsContent.newsletter.headline);
  const [newsletterSubheadline, setNewsletterSubheadline] = useState(
    cmsContent.newsletter.subheadline
  );
  const [newsletterButtonText, setNewsletterButtonText] = useState(
    cmsContent.newsletter.buttonText
  );

  // Legal Pages Policy State
  const [activePolicyTab, setActivePolicyTab] = useState<'returnPolicy' | 'privacyPolicy' | 'termsOfService' | 'shippingPolicy'>('returnPolicy');
  const [returnPolicyTitle, setReturnPolicyTitle] = useState(cmsContent.legalPages?.returnPolicy?.title || 'Return & Exchange Policy');
  const [returnPolicyContent, setReturnPolicyContent] = useState(cmsContent.legalPages?.returnPolicy?.content || '');
  const [privacyPolicyTitle, setPrivacyPolicyTitle] = useState(cmsContent.legalPages?.privacyPolicy?.title || 'Privacy Policy');
  const [privacyPolicyContent, setPrivacyPolicyContent] = useState(cmsContent.legalPages?.privacyPolicy?.content || '');
  const [termsTitle, setTermsTitle] = useState(cmsContent.legalPages?.termsOfService?.title || 'Terms of Service');
  const [termsContent, setTermsContent] = useState(cmsContent.legalPages?.termsOfService?.content || '');
  const [shippingTitle, setShippingTitle] = useState(cmsContent.legalPages?.shippingPolicy?.title || 'Shipping & Delivery Information');
  const [shippingContent, setShippingContent] = useState(cmsContent.legalPages?.shippingPolicy?.content || '');

  const heroFileRef = useRef<HTMLInputElement>(null);
  const editorialFileRef = useRef<HTMLInputElement>(null);
  const slot1FileRef = useRef<HTMLInputElement>(null);
  const slot2FileRef = useRef<HTMLInputElement>(null);
  const slot3FileRef = useRef<HTMLInputElement>(null);
  const slot4FileRef = useRef<HTMLInputElement>(null);

  const handleHeroImageUpload = async (file: File) => {
    try {
      const compressed = await compressAndReadFile(file, 1600, 1000);
      setHeroImage(compressed);
      showToast('Hero background uploaded');
    } catch (e: any) {
      showToast(e.message || 'Image upload error');
    }
  };

  const handleEditorialImageUpload = async (file: File) => {
    try {
      const compressed = await compressAndReadFile(file, 1400, 900);
      setEditorialImage(compressed);
      showToast('Banner image uploaded');
    } catch (e: any) {
      showToast(e.message || 'Image upload error');
    }
  };

  const handleSlotImageUpload = async (slotKey: 'slot1' | 'slot2' | 'slot3' | 'slot4', file: File) => {
    try {
      const compressed = await compressAndReadFile(file, 800, 1000);
      setCatSlots((prev) => ({
        ...prev,
        [slotKey]: {
          ...prev[slotKey],
          image: compressed,
        },
      }));
      showToast(`Category card image updated`);
    } catch (e: any) {
      showToast(e.message || 'Image upload error');
    }
  };

  const handleSaveHero = () => {
    updateCMSContent('hero', {
      headline: heroHeadline,
      subheadline: heroSubheadline,
      buttonText: heroButtonText,
      buttonLink: heroButtonLink,
      image: heroImage,
    });
  };

  const handleSaveCategoryGrid = () => {
    updateCMSContent('categoryGrid', catSlots);
  };

  const handleSaveEditorial = () => {
    updateCMSContent('editorialBanner', {
      headline: editorialHeadline,
      subheadline: editorialSubheadline,
      buttonText: editorialButtonText,
      buttonLink: editorialButtonLink,
      image: editorialImage,
    });
  };

  const handleSaveNewsletter = () => {
    updateCMSContent('newsletter', {
      headline: newsletterHeadline,
      subheadline: newsletterSubheadline,
      buttonText: newsletterButtonText,
    });
  };

  const handleSavePolicy = (key: 'returnPolicy' | 'privacyPolicy' | 'termsOfService' | 'shippingPolicy') => {
    let title = '';
    let content = '';
    if (key === 'returnPolicy') {
      title = returnPolicyTitle;
      content = returnPolicyContent;
    } else if (key === 'privacyPolicy') {
      title = privacyPolicyTitle;
      content = privacyPolicyContent;
    } else if (key === 'termsOfService') {
      title = termsTitle;
      content = termsContent;
    } else if (key === 'shippingPolicy') {
      title = shippingTitle;
      content = shippingContent;
    }
    updateLegalPolicy(key, { title, content });
  };

  const sections: { id: CMSSection; label: string; desc: string }[] = [
    { id: 'hero', label: 'Hero Section', desc: 'Main full-width banner at top of homepage' },
    { id: 'categoryGrid', label: 'Category Grid (4 Cards)', desc: 'The 4 prominent collection cards' },
    { id: 'editorialBanner', label: 'Editorial Banner', desc: 'Mid-page editorial luxury feature' },
    { id: 'newsletter', label: 'Newsletter Section', desc: 'VIP subscription and discount invitation' },
    { id: 'legalPages', label: 'Pages & Policies', desc: 'Return Policy, Privacy Policy, Shipping & Terms' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Website Content (CMS)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your homepage banners, titles, and button destinations section-by-section.
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {sections.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION */}
      {/* ========================================================================= */}
      {activeSection === 'hero' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hero Section</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The first impression visitors see when they open your store.
            </p>
          </div>

          <div className="space-y-4">
            {/* Headline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Headline (Title)
              </label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                placeholder="e.g. Step Into Luxury"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-serif focus:bg-white focus:outline-none"
              />
            </div>

            {/* Subheadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Subheadline
              </label>
              <textarea
                rows={2}
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                placeholder="Subtitle text underneath headline..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Button Text & Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Button Text
                </label>
                <input
                  type="text"
                  value={heroButtonText}
                  onChange={(e) => setHeroButtonText(e.target.value)}
                  placeholder="e.g. Shop Now"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Button Destination
                </label>
                <select
                  value={heroButtonLink}
                  onChange={(e) => setHeroButtonLink(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none font-medium"
                >
                  <option value="shop">Entire Shop Catalog</option>
                  <option value="hijab">Hijab Category</option>
                  <option value="abayas">Abayas & Kaftans</option>
                  <option value="dresses">Modest Dresses</option>
                  <option value="kurtis">Tops & Co-Ords</option>
                  <option value="bag">Bags & Accessories</option>
                </select>
              </div>
            </div>

            {/* Hero Image */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Hero Background Image
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <img
                  src={heroImage}
                  alt="Hero preview"
                  className="w-40 h-24 object-cover rounded-lg border border-slate-300 shadow-xs shrink-0"
                />
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => heroFileRef.current?.click()}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 inline-flex items-center gap-2"
                  >
                    <Upload size={14} />
                    <span>Upload New Photo</span>
                  </button>
                  <span className="text-[11px] text-slate-400 block">
                    High-resolution horizontal photo recommended (16:9 ratio).
                  </span>
                  <input
                    type="file"
                    ref={heroFileRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleHeroImageUpload(file);
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveHero}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                <span>Save Hero Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CATEGORY GRID (4 SLOTS) */}
      {/* ========================================================================= */}
      {activeSection === 'categoryGrid' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Category Grid</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              4 prominent category spotlight cards on the homepage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slot 1 */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Slot 1 (Top Left)
              </span>
              <div className="flex gap-3 items-center">
                <img
                  src={catSlots.slot1.image}
                  alt="Slot 1"
                  className="w-16 h-20 object-cover rounded-lg border border-slate-200 shadow-xs shrink-0"
                />
                <button
                  type="button"
                  onClick={() => slot1FileRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700"
                >
                  Change Photo
                </button>
                <input
                  type="file"
                  ref={slot1FileRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSlotImageUpload('slot1', file);
                  }}
                  className="hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={catSlots.slot1.title}
                  onChange={(e) =>
                    setCatSlots((prev) => ({
                      ...prev,
                      slot1: { ...prev.slot1, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Destination Category</label>
                <select
                  value={catSlots.slot1.link}
                  onChange={(e) =>
                    setCatSlots((prev) => ({
                      ...prev,
                      slot1: { ...prev.slot1, link: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                >
                  <option value="abayas">Abayas & Kaftans</option>
                  <option value="dresses">Modest Dresses</option>
                  <option value="kurtis">Tops & Co-Ords</option>
                  <option value="bag">Bags & Accessories</option>
                  <option value="hijab">Hijab</option>
                </select>
              </div>
            </div>

            {/* Slot 2 */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Slot 2 (Top Right)
              </span>
              <div className="flex gap-3 items-center">
                <img
                  src={catSlots.slot2.image}
                  alt="Slot 2"
                  className="w-16 h-20 object-cover rounded-lg border border-slate-200 shadow-xs shrink-0"
                />
                <button
                  type="button"
                  onClick={() => slot2FileRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700"
                >
                  Change Photo
                </button>
                <input
                  type="file"
                  ref={slot2FileRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSlotImageUpload('slot2', file);
                  }}
                  className="hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={catSlots.slot2.title}
                  onChange={(e) =>
                    setCatSlots((prev) => ({
                      ...prev,
                      slot2: { ...prev.slot2, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Destination Category</label>
                <select
                  value={catSlots.slot2.link}
                  onChange={(e) =>
                    setCatSlots((prev) => ({
                      ...prev,
                      slot2: { ...prev.slot2, link: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                >
                  <option value="dresses">Modest Dresses</option>
                  <option value="abayas">Abayas & Kaftans</option>
                  <option value="kurtis">Tops & Co-Ords</option>
                  <option value="bag">Bags & Accessories</option>
                  <option value="hijab">Hijab</option>
                </select>
              </div>
            </div>

            {/* Slot 3 */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Slot 3 (Bottom Left)
              </span>
              <div className="flex gap-3 items-center">
                <img
                  src={catSlots.slot3.image}
                  alt="Slot 3"
                  className="w-16 h-20 object-cover rounded-lg border border-slate-200 shadow-xs shrink-0"
                />
                <button
                  type="button"
                  onClick={() => slot3FileRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700"
                >
                  Change Photo
                </button>
                <input
                  type="file"
                  ref={slot3FileRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSlotImageUpload('slot3', file);
                  }}
                  className="hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={catSlots.slot3.title}
                  onChange={(e) =>
                    setCatSlots((prev) => ({
                      ...prev,
                      slot3: { ...prev.slot3, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Destination Category</label>
                <select
                  value={catSlots.slot3.link}
                  onChange={(e) =>
                    setCatSlots((prev) => ({
                      ...prev,
                      slot3: { ...prev.slot3, link: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                >
                  <option value="kurtis">Tops & Co-Ords</option>
                  <option value="abayas">Abayas & Kaftans</option>
                  <option value="dresses">Modest Dresses</option>
                  <option value="bag">Bags & Accessories</option>
                  <option value="hijab">Hijab</option>
                </select>
              </div>
            </div>

            {/* Slot 4 */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Slot 4 (Bottom Right)
              </span>
              <div className="flex gap-3 items-center">
                <img
                  src={catSlots.slot4.image}
                  alt="Slot 4"
                  className="w-16 h-20 object-cover rounded-lg border border-slate-200 shadow-xs shrink-0"
                />
                <button
                  type="button"
                  onClick={() => slot4FileRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700"
                >
                  Change Photo
                </button>
                <input
                  type="file"
                  ref={slot4FileRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSlotImageUpload('slot4', file);
                  }}
                  className="hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={catSlots.slot4.title}
                  onChange={(e) =>
                    setCatSlots((prev) => ({
                      ...prev,
                      slot4: { ...prev.slot4, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Destination Category</label>
                <select
                  value={catSlots.slot4.link}
                  onChange={(e) =>
                    setCatSlots((prev) => ({
                      ...prev,
                      slot4: { ...prev.slot4, link: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                >
                  <option value="bag">Bags & Accessories</option>
                  <option value="abayas">Abayas & Kaftans</option>
                  <option value="dresses">Modest Dresses</option>
                  <option value="kurtis">Tops & Co-Ords</option>
                  <option value="hijab">Hijab</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleSaveCategoryGrid}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              <span>Save Category Grid</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: EDITORIAL BANNER */}
      {/* ========================================================================= */}
      {activeSection === 'editorialBanner' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Editorial Banner</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The rich storytelling section in the middle of your homepage.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Headline
              </label>
              <input
                type="text"
                value={editorialHeadline}
                onChange={(e) => setEditorialHeadline(e.target.value)}
                placeholder="e.g. The Heritage Edition"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-serif focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Subheadline
              </label>
              <textarea
                rows={3}
                value={editorialSubheadline}
                onChange={(e) => setEditorialSubheadline(e.target.value)}
                placeholder="Story text describing the craftsmanship and luxury drape..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Button Text
                </label>
                <input
                  type="text"
                  value={editorialButtonText}
                  onChange={(e) => setEditorialButtonText(e.target.value)}
                  placeholder="e.g. Explore Collection"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Button Link
                </label>
                <select
                  value={editorialButtonLink}
                  onChange={(e) => setEditorialButtonLink(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="shop">Entire Shop</option>
                  <option value="abayas">Abayas & Kaftans</option>
                  <option value="dresses">Modest Dresses</option>
                  <option value="hijab">Hijabs</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Editorial Banner Photo
              </label>
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <img
                  src={editorialImage}
                  alt="Editorial preview"
                  className="w-32 h-20 object-cover rounded-lg border border-slate-300 shadow-xs shrink-0"
                />
                <div>
                  <button
                    type="button"
                    onClick={() => editorialFileRef.current?.click()}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 inline-flex items-center gap-2"
                  >
                    <Upload size={14} />
                    <span>Upload New Photo</span>
                  </button>
                  <input
                    type="file"
                    ref={editorialFileRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleEditorialImageUpload(file);
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveEditorial}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                <span>Save Banner Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: NEWSLETTER SECTION */}
      {/* ========================================================================= */}
      {activeSection === 'newsletter' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Newsletter Section</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The VIP invitation box at the bottom of the homepage.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Headline
              </label>
              <input
                type="text"
                value={newsletterHeadline}
                onChange={(e) => setNewsletterHeadline(e.target.value)}
                placeholder="e.g. Join the Atelier Circle"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-serif focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Subheadline
              </label>
              <textarea
                rows={2}
                value={newsletterSubheadline}
                onChange={(e) => setNewsletterSubheadline(e.target.value)}
                placeholder="Receive early access to seasonal drops..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Button Text
              </label>
              <input
                type="text"
                value={newsletterButtonText}
                onChange={(e) => setNewsletterButtonText(e.target.value)}
                placeholder="e.g. Subscribe"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveNewsletter}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                <span>Save Newsletter Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: LEGAL PAGES & POLICIES */}
      {/* ========================================================================= */}
      {activeSection === 'legalPages' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Legal Pages & Store Policies</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Draft and publish official customer policies for returns, privacy, delivery terms, and buyer rights.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
              Auto-saves drafts
            </span>
          </div>

          {/* Sub-tabs for policies */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'returnPolicy', label: 'Return & Exchange Policy' },
              { id: 'privacyPolicy', label: 'Privacy Policy' },
              { id: 'termsOfService', label: 'Terms of Service' },
              { id: 'shippingPolicy', label: 'Shipping & Delivery' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePolicyTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  activePolicyTab === tab.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Policy Editor */}
          {activePolicyTab === 'returnPolicy' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={returnPolicyTitle}
                  onChange={(e) => setReturnPolicyTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Policy Content (Terms, Timeframes, Conditions)
                </label>
                <textarea
                  rows={10}
                  value={returnPolicyContent}
                  onChange={(e) => setReturnPolicyContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 leading-relaxed font-sans focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSavePolicy('returnPolicy')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Save Return Policy</span>
                </button>
              </div>
            </div>
          )}

          {activePolicyTab === 'privacyPolicy' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={privacyPolicyTitle}
                  onChange={(e) => setPrivacyPolicyTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Privacy Policy Content
                </label>
                <textarea
                  rows={10}
                  value={privacyPolicyContent}
                  onChange={(e) => setPrivacyPolicyContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 leading-relaxed font-sans focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSavePolicy('privacyPolicy')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Save Privacy Policy</span>
                </button>
              </div>
            </div>
          )}

          {activePolicyTab === 'termsOfService' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={termsTitle}
                  onChange={(e) => setTermsTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Terms of Service Content
                </label>
                <textarea
                  rows={10}
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 leading-relaxed font-sans focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSavePolicy('termsOfService')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Save Terms of Service</span>
                </button>
              </div>
            </div>
          )}

          {activePolicyTab === 'shippingPolicy' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={shippingTitle}
                  onChange={(e) => setShippingTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Shipping & Delivery Information Content
                </label>
                <textarea
                  rows={10}
                  value={shippingContent}
                  onChange={(e) => setShippingContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 leading-relaxed font-sans focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSavePolicy('shippingPolicy')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Save Shipping Policy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
