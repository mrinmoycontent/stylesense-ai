import React, { useState, useRef, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  Search,
  Filter,
  Check,
  Upload,
  AlertCircle,
  X,
  Layers,
  BarChart3,
  Camera,
  ArrowRight,
  RotateCcw,
  Tag,
  Palette,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  FASHION_COLORS,
  FASHION_STYLES,
  GARMENT_CATEGORIES,
  OCCASIONS_DATA
} from '../data/fashionData';
import {
  FashionColor,
  FashionStyle,
  GarmentCategory,
  Occasion,
  WardrobeItem
} from '../types';
import {
  calculateWardrobeAnalytics,
  deleteWardrobeItem,
  saveWardrobeItem,
  updateWardrobeItem
} from '../services/wardrobeStorage';
import { GarmentVisual } from './GarmentVisual';
import { CameraCaptureModal } from './CameraCaptureModal';

interface WardrobePlannerProps {
  wardrobe: WardrobeItem[];
  onWardrobeUpdated: (updated: WardrobeItem[]) => void;
  onStyleItem: (item: WardrobeItem) => void;
}

const CATEGORY_DISPLAY_NAMES: Record<GarmentCategory, string> = {
  tops: 'Tops & Knitwear',
  bottoms: 'Trousers & Skirts',
  one_piece: 'Dresses & Jumpsuits',
  outerwear: 'Jackets & Coats',
  footwear: 'Footwear',
  accessories: 'Accessories',
  bags: 'Bags & Leather Goods',
  weather_protection: 'Weather Gear'
};

const SEASONS: Array<'spring' | 'summer' | 'autumn' | 'winter'> = [
  'spring',
  'summer',
  'autumn',
  'winter'
];

// In-browser canvas image compression utility to prevent local storage quota overflow
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Clean JPEG compression with sensible quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const WardrobePlanner: React.FC<WardrobePlannerProps> = ({
  wardrobe,
  onWardrobeUpdated,
  onStyleItem
}) => {
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);

  // Deletion feedback
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Form input state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<GarmentCategory>('tops');
  const [formSpecificType, setFormSpecificType] = useState('Crisp Poplin Shirt');
  const [formColorName, setFormColorName] = useState('Ivory Cream');
  const [formColorHex, setFormColorHex] = useState('#F7F4EE');
  const [formStyle, setFormStyle] = useState<FashionStyle>('minimalist_tailored');
  const [formOccasions, setFormOccasions] = useState<Occasion[]>(['office', 'casual']);
  const [formSeasons, setFormSeasons] = useState<Array<'spring' | 'summer' | 'autumn' | 'winter'>>([
    'spring',
    'autumn',
    'winter'
  ]);
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Hidden file inputs for direct camera capture or browser upload
  const formCameraInputRef = useRef<HTMLInputElement | null>(null);
  const formFileInputRef = useRef<HTMLInputElement | null>(null);
  const dialogCameraInputRef = useRef<HTMLInputElement | null>(null);
  const dialogFileInputRef = useRef<HTMLInputElement | null>(null);

  // Notification helper
  const triggerNotification = (msg: string) => {
    setSuccessNotification(msg);
    setTimeout(() => {
      setSuccessNotification(null);
    }, 4000);
  };

  // Analytics computation
  const analytics = useMemo(() => calculateWardrobeAnalytics(wardrobe), [wardrobe]);

  // Specific types options for current category
  const availableTypes = useMemo(() => {
    const found = GARMENT_CATEGORIES.find((c) => c.id === formCategory);
    return found ? found.types : [];
  }, [formCategory]);

  // Reset form to defaults or given item
  const openAddModal = (initialPhoto?: string, initialColor?: FashionColor) => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('tops');
    setFormSpecificType('Crisp Poplin Shirt');
    if (initialColor) {
      setFormColorName(initialColor.name);
      setFormColorHex(initialColor.hex);
    } else {
      setFormColorName('Ivory Cream');
      setFormColorHex('#F7F4EE');
    }
    setFormStyle('minimalist_tailored');
    setFormOccasions(['office', 'casual']);
    setFormSeasons(['spring', 'summer', 'autumn', 'winter']);
    setFormImageUrl(initialPhoto || '');
    setFormNotes('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: WardrobeItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormSpecificType(item.specificType);
    setFormColorName(item.colorName);
    setFormColorHex(item.colorHex);
    setFormStyle(item.style);
    setFormOccasions(item.occasions || ['casual']);
    setFormSeasons(item.season || ['spring', 'summer', 'autumn', 'winter']);
    setFormImageUrl(item.imageUrl || '');
    setFormNotes(item.notes || '');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // File upload handler for both camera capture and standard picker
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file);
      setFormImageUrl(compressedDataUrl);
      setFormError(null);
    } catch (err: any) {
      setFormError('Failed to process image file. Please try another photo.');
    } finally {
      // Clear file input value so re-selecting same photo works
      e.target.value = '';
    }
  };

  // Dialog file upload handler (creates new garment form seeded with photo)
  const handleDialogPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file);
      setIsPhotoDialogOpen(false);
      openAddModal(compressedDataUrl);
    } catch {
      setFormError('Failed to process image. Please try again.');
    } finally {
      e.target.value = '';
    }
  };

  // Handle capture from live CameraCaptureModal
  const handleCameraPhotoCaptured = (imageDataUrl: string, matchedColor?: FashionColor) => {
    if (isPhotoDialogOpen) {
      setIsPhotoDialogOpen(false);
      openAddModal(imageDataUrl, matchedColor);
    } else {
      setFormImageUrl(imageDataUrl);
      if (matchedColor) {
        setFormColorName(matchedColor.name);
        setFormColorHex(matchedColor.hex);
      }
    }
  };

  // Save or update wardrobe item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter a name or title for this garment.');
      return;
    }

    try {
      if (editingItem) {
        const updatedList = updateWardrobeItem(editingItem.id, {
          name: formName.trim(),
          category: formCategory,
          specificType: formSpecificType,
          colorName: formColorName,
          colorHex: formColorHex,
          style: formStyle,
          occasions: formOccasions,
          season: formSeasons,
          imageUrl: formImageUrl || undefined,
          notes: formNotes.trim() || undefined
        });
        onWardrobeUpdated(updatedList);
        triggerNotification(`Updated "${formName.trim()}" in your wardrobe.`);
      } else {
        saveWardrobeItem({
          name: formName.trim(),
          category: formCategory,
          specificType: formSpecificType,
          colorName: formColorName,
          colorHex: formColorHex,
          style: formStyle,
          occasions: formOccasions,
          season: formSeasons,
          imageUrl: formImageUrl || undefined,
          notes: formNotes.trim() || undefined
        });
        // Reload fresh wardrobe state
        const updatedList = [
          {
            id: `item-${Date.now()}`,
            name: formName.trim(),
            category: formCategory,
            specificType: formSpecificType,
            colorName: formColorName,
            colorHex: formColorHex,
            style: formStyle,
            occasions: formOccasions,
            season: formSeasons,
            imageUrl: formImageUrl || undefined,
            notes: formNotes.trim() || undefined,
            createdAt: new Date().toISOString()
          },
          ...wardrobe
        ];
        onWardrobeUpdated(updatedList);
        triggerNotification(`Added "${formName.trim()}" to your wardrobe.`);
      }

      setIsFormModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      setFormError(err.message || 'Error saving wardrobe garment.');
    }
  };

  // Delete item handler
  const handleDeleteItem = (id: string, name: string) => {
    const updated = deleteWardrobeItem(id);
    onWardrobeUpdated(updated);
    setDeletingId(null);
    triggerNotification(`Removed "${name}" from your wardrobe.`);
  };

  // Filtered wardrobe list
  const filteredWardrobe = useMemo(() => {
    return wardrobe.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesColor = item.colorName.toLowerCase().includes(q);
        const matchesType = item.specificType.toLowerCase().includes(q);
        const matchesNotes = item.notes ? item.notes.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesColor && !matchesType && !matchesNotes) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Occasion filter
      if (selectedOccasion !== 'all') {
        if (!item.occasions || !item.occasions.includes(selectedOccasion as Occasion)) {
          return false;
        }
      }

      // Season filter
      if (selectedSeason !== 'all') {
        if (!item.season || !item.season.includes(selectedSeason as any)) {
          return false;
        }
      }

      return true;
    });
  }, [wardrobe, searchQuery, selectedCategory, selectedOccasion, selectedSeason]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Toast Notification */}
      {successNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#141413] text-[#FAF7F2] rounded-xs shadow-xl border border-[#3D3A34] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#D8B48D]" />
          <span className="text-xs font-medium">{successNotification}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E8E2D9]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8C8275] mb-2">
            <Layers className="w-3.5 h-3.5 text-[#8C4A2F]" />
            <span>Digital Wardrobe Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-[#141413]">
            Curated Capsule Collection
          </h1>
          <p className="mt-2 text-sm text-[#6B655B] max-w-2xl leading-relaxed">
            Catalog real-life garments with camera capture, organize seasonal foundations, and feed your owned pieces directly into the StyleSense recommendation engine.
          </p>
        </div>

        {/* Primary Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Prominent "+ Add Clothing Photo" Button */}
          <button
            type="button"
            onClick={() => setIsPhotoDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8C4A2F] hover:bg-[#723922] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-all shadow-sm cursor-pointer"
            title="Snap or upload a photo of your clothing item"
          >
            <Camera className="w-4 h-4" />
            <span>+ Add Clothing Photo</span>
          </button>

          {/* Standard "+ Add Garment" Button */}
          <button
            type="button"
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#141413] hover:bg-[#2B2926] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Garment</span>
          </button>

          {/* Analytics Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-xs border transition-colors cursor-pointer ${
              showAnalytics
                ? 'bg-[#EFE9DF] text-[#141413] border-[#D6CBB8]'
                : 'bg-white text-[#6B655B] border-[#E8E2D9] hover:bg-[#FAF7F2]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Capsule Insights</span>
          </button>
        </div>
      </div>

      {/* Capsule Insights Banner (Collapsible) */}
      {showAnalytics && (
        <div className="my-8 p-6 bg-white rounded-xs border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE1] mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8C4A2F]" />
              <h2 className="text-sm font-serif font-medium tracking-tight text-[#141413]">
                Capsule Wardrobe Health & Balance
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#8C8275]">
              {analytics.totalItems} Active Silhouettes
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Items */}
            <div className="p-4 bg-[#FAF7F2] rounded-xs border border-[#ECE5D8]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8275]">
                Total Pieces
              </span>
              <div className="mt-1 text-2xl font-serif font-light text-[#141413]">
                {analytics.totalItems}
              </div>
              <p className="mt-1 text-[11px] text-[#6B655B]">
                {analytics.totalItems >= 12
                  ? 'Complete versatile rotation'
                  : 'Add foundational pieces'}
              </p>
            </div>

            {/* Versatility Score */}
            <div className="p-4 bg-[#FAF7F2] rounded-xs border border-[#ECE5D8]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8275]">
                Versatility Score
              </span>
              <div className="mt-1 text-2xl font-serif font-light text-[#141413] flex items-baseline gap-1">
                {analytics.versatilityScore}
                <span className="text-xs text-[#8C8275]">/100</span>
              </div>
              <p className="mt-1 text-[11px] text-[#6B655B]">
                Category balance & flexibility
              </p>
            </div>

            {/* Occasion Coverage */}
            <div className="p-4 bg-[#FAF7F2] rounded-xs border border-[#ECE5D8]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8275]">
                Occasion Coverage
              </span>
              <div className="mt-1 text-2xl font-serif font-light text-[#141413] flex items-baseline gap-1">
                {analytics.occasionCoverage}
                <span className="text-xs text-[#8C8275]">%</span>
              </div>
              <p className="mt-1 text-[11px] text-[#6B655B]">
                Across office, casual & events
              </p>
            </div>

            {/* Dominant Color Palette */}
            <div className="p-4 bg-[#FAF7F2] rounded-xs border border-[#ECE5D8]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8275]">
                Anchor Color
              </span>
              <div className="mt-1 text-base font-serif font-medium text-[#141413] truncate">
                {analytics.dominantColor}
              </div>
              <p className="mt-1 text-[11px] text-[#6B655B]">
                Primary capsule foundation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="mt-8 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8275]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments by name, color, style, or notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E2D9] rounded-xs text-xs text-[#141413] placeholder-[#A69E90] focus:outline-hidden focus:border-[#141413] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8275] hover:text-[#141413]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Occasion Filter */}
          <div className="sm:w-44">
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#E8E2D9] rounded-xs text-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
            >
              <option value="all">All Occasions</option>
              {Object.entries(OCCASIONS_DATA).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.name}
                </option>
              ))}
            </select>
          </div>

          {/* Season Filter */}
          <div className="sm:w-36">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#E8E2D9] rounded-xs text-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
            >
              <option value="all">All Seasons</option>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="autumn">Autumn</option>
              <option value="winter">Winter</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#141413] text-[#FAF7F2]'
                : 'bg-white text-[#6B655B] hover:bg-[#EFE9DF] border border-[#E8E2D9]'
            }`}
          >
            All Pieces ({wardrobe.length})
          </button>
          {GARMENT_CATEGORIES.map((cat) => {
            const count = wardrobe.filter((item) => item.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#141413] text-[#FAF7F2]'
                    : 'bg-white text-[#6B655B] hover:bg-[#EFE9DF] border border-[#E8E2D9]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Wardrobe Items Grid */}
      {filteredWardrobe.length === 0 ? (
        <div className="my-12 p-12 bg-white rounded-xs border border-dashed border-[#D6CBB8] text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center mx-auto mb-4 text-[#8C8275]">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="text-base font-serif font-medium text-[#141413]">
            No Garments Found
          </h3>
          <p className="mt-1 text-xs text-[#6B655B] leading-relaxed">
            {searchQuery || selectedCategory !== 'all' || selectedOccasion !== 'all' || selectedSeason !== 'all'
              ? 'No items match your active search and filter filters.'
              : 'Your digital wardrobe is currently empty. Use the camera or upload feature to start curating your wardrobe.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsPhotoDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8C4A2F] hover:bg-[#723922] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>+ Add Clothing Photo</span>
            </button>
            {(searchQuery || selectedCategory !== 'all' || selectedOccasion !== 'all' || selectedSeason !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedOccasion('all');
                  setSelectedSeason('all');
                }}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#141413] text-xs rounded-xs border border-[#E8E2D9] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredWardrobe.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xs border border-[#E8E2D9] hover:border-[#C7BBA5] transition-all duration-200 overflow-hidden flex flex-col shadow-2xs hover:shadow-xs"
            >
              {/* Garment Image / Visual */}
              <div className="relative aspect-4/5 bg-[#F5EFE6] overflow-hidden">
                <GarmentVisual
                  category={item.category}
                  name={item.name}
                  colorHex={item.colorHex}
                  imageUrl={item.imageUrl}
                  aspect="portrait"
                  className="w-full h-full object-cover"
                />

                {/* Category Badge overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider uppercase rounded-xs">
                    {CATEGORY_DISPLAY_NAMES[item.category] || item.category}
                  </span>
                </div>

                {/* Camera Photo Indicator Badge if image exists */}
                {item.imageUrl && (
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center shadow-xs"
                      title="Real garment photo"
                    >
                      <Camera className="w-3 h-3 text-[#D8B48D]" />
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Color Swatch & Style */}
                  <div className="flex items-center justify-between text-[11px] text-[#6B655B] mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      <span className="font-medium text-[#141413]">{item.colorName}</span>
                    </div>
                    <span className="capitalize text-[#8C8275]">
                      {item.style.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-base font-normal text-[#141413] group-hover:text-[#8C4A2F] transition-colors line-clamp-1">
                    {item.name}
                  </h3>

                  {/* Specific Type */}
                  <p className="text-[11px] text-[#8C8275] mb-2 truncate">
                    {item.specificType}
                  </p>

                  {/* Occasion Tags */}
                  {item.occasions && item.occasions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.occasions.slice(0, 3).map((occ) => (
                        <span
                          key={occ}
                          className="px-1.5 py-0.5 bg-[#FAF7F2] text-[#6B655B] rounded-xs text-[10px] capitalize border border-[#ECE5D8]"
                        >
                          {occ.replace('_', ' ')}
                        </span>
                      ))}
                      {item.occasions.length > 3 && (
                        <span className="px-1 py-0.5 text-[#8C8275] text-[10px]">
                          +{item.occasions.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Notes snippet */}
                  {item.notes && (
                    <p className="text-[11px] text-[#6B655B] line-clamp-2 italic mb-2">
                      “{item.notes}”
                    </p>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-between gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => onStyleItem(item)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C4A2F] hover:text-[#723922] transition-colors cursor-pointer"
                    title="Generate outfit recommendations with this garment"
                  >
                    <span>Style Outfit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-[#8C8275] hover:text-[#141413] hover:bg-[#FAF7F2] rounded-xs transition-colors"
                      title="Edit garment details"
                      aria-label="Edit item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 text-[#8C8275] hover:text-[#B23B2A] hover:bg-[#FAF7F2] rounded-xs transition-colors"
                      title="Delete garment"
                      aria-label="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xs border border-[#E8E2D9] max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-serif font-medium text-[#141413]">
              Remove Garment?
            </h3>
            <p className="mt-2 text-xs text-[#6B655B] leading-relaxed">
              Are you sure you want to remove this piece from your personal capsule collection? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 text-xs text-[#6B655B] hover:text-[#141413] rounded-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = wardrobe.find((i) => i.id === deletingId);
                  if (target) handleDeleteItem(target.id, target.name);
                }}
                className="px-4 py-2 bg-[#B23B2A] hover:bg-[#962F20] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated "+ Add Clothing Photo" Choice Dialog */}
      {isPhotoDialogOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-dialog-title"
        >
          <div className="bg-white text-[#141413] rounded-xs border border-[#E8E2D9] w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE1]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#8C4A2F]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="photo-dialog-title" className="text-base font-serif font-medium">
                    Add Clothing Photo
                  </h3>
                  <p className="text-[11px] text-[#8C8275]">
                    Capture or upload a garment to add to your wardrobe
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoDialogOpen(false)}
                className="p-1.5 text-[#8C8275] hover:text-[#141413] rounded-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-3">
              {/* Option 1: Prominent Snap Photo */}
              <button
                type="button"
                onClick={() => {
                  if (
                    typeof navigator !== 'undefined' &&
                    Boolean(navigator?.mediaDevices?.getUserMedia)
                  ) {
                    setIsCameraModalOpen(true);
                  } else {
                    dialogCameraInputRef.current?.click();
                  }
                }}
                className="w-full p-4 bg-[#8C4A2F] hover:bg-[#723922] text-white rounded-xs flex items-center gap-4 transition-all shadow-sm group text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-wide flex items-center gap-2">
                    <span>Snap Photo</span>
                    <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-xs font-mono uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    Use your device camera with real-time viewfinder & auto color detection
                  </p>
                </div>
              </button>

              {/* Option 2: Upload Photo */}
              <button
                type="button"
                onClick={() => dialogFileInputRef.current?.click()}
                className="w-full p-4 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E8E2D9] rounded-xs flex items-center gap-4 transition-colors group text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#141413] shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#141413]">
                    Upload Photo
                  </div>
                  <p className="text-xs text-[#6B655B] mt-0.5">
                    Select an existing garment image file from your device storage
                  </p>
                </div>
              </button>

              {/* Hidden file inputs for dialog triggers */}
              <input
                ref={dialogCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleDialogPhotoUpload}
                className="hidden"
              />
              <input
                ref={dialogFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDialogPhotoUpload}
                className="hidden"
              />
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsPhotoDialogOpen(false)}
                className="text-xs text-[#8C8275] hover:text-[#141413] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Garment Full Form Modal */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xs border border-[#E8E2D9] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-[#E8E2D9] flex items-center justify-between shrink-0 bg-[#FAF7F2]">
              <div>
                <h3 className="text-base font-serif font-medium text-[#141413]">
                  {editingItem ? 'Edit Garment Piece' : 'Add Garment to Wardrobe'}
                </h3>
                <p className="text-[11px] text-[#6B655B]">
                  {editingItem
                    ? 'Update wardrobe metadata and styling characteristics'
                    : 'Add a new foundation item or take a photo of your real clothing'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1.5 text-[#8C8275] hover:text-[#141413] rounded-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-5 flex-1">
              {formError && (
                <div className="p-3 bg-[#FDF2F0] border border-[#F5C2BC] rounded-xs flex items-center gap-2 text-xs text-[#B23B2A]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Garment Photo (Camera Capture or Upload) */}
              <div className="p-4 bg-[#FAF7F2] rounded-xs border border-[#E8E2D9]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-2">
                  Garment Photo (Optional)
                </label>

                {formImageUrl ? (
                  /* Photo Preview */
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-28 h-32 bg-[#F5EFE6] rounded-xs overflow-hidden border border-[#D6CBB8] shrink-0">
                      <img
                        src={formImageUrl}
                        alt="Garment preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <div className="flex items-center gap-1.5 text-xs text-[#141413] font-medium justify-center sm:justify-start">
                        <Check className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Garment photo attached</span>
                      </div>
                      <p className="text-[11px] text-[#6B655B]">
                        This photo will appear on your wardrobe cards and outfit visualizations.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              typeof navigator !== 'undefined' &&
                              Boolean(navigator?.mediaDevices?.getUserMedia)
                            ) {
                              setIsCameraModalOpen(true);
                            } else {
                              formCameraInputRef.current?.click();
                            }
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-[#FAF7F2] border border-[#D6CBB8] text-[11px] font-medium text-[#141413] rounded-xs transition-colors"
                        >
                          Retake with Camera
                        </button>
                        <button
                          type="button"
                          onClick={() => formFileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-white hover:bg-[#FAF7F2] border border-[#D6CBB8] text-[11px] font-medium text-[#141413] rounded-xs transition-colors"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormImageUrl('')}
                          className="px-2.5 py-1 text-[11px] text-[#B23B2A] hover:bg-[#FDF2F0] rounded-xs transition-colors"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Two-column Photo Input Buttons */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Prominent Snap Photo with Device Camera */}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          typeof navigator !== 'undefined' &&
                          Boolean(navigator?.mediaDevices?.getUserMedia)
                        ) {
                          setIsCameraModalOpen(true);
                        } else {
                          formCameraInputRef.current?.click();
                        }
                      }}
                      className="p-3 bg-[#8C4A2F] hover:bg-[#723922] text-white rounded-xs border border-[#8C4A2F] flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <span>Snap Photo</span>
                    </button>

                    {/* Standard Upload Photo */}
                    <button
                      type="button"
                      onClick={() => formFileInputRef.current?.click()}
                      className="p-3 bg-white hover:bg-[#FAF7F2] border border-[#D6CBB8] rounded-xs flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#141413] transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#8C8275]" />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                )}

                {/* Hidden form file inputs */}
                <input
                  ref={formCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <input
                  ref={formFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Garment Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-1.5">
                  Garment Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Oversized Cashmere Crewneck, Tailored Navy Trousers"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D9] rounded-xs text-xs text-[#141413] placeholder-[#A69E90] focus:outline-hidden focus:border-[#141413]"
                />
              </div>

              {/* Category & Specific Silhouette Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const newCat = e.target.value as GarmentCategory;
                      setFormCategory(newCat);
                      const catObj = GARMENT_CATEGORIES.find((c) => c.id === newCat);
                      if (catObj && catObj.types.length > 0) {
                        setFormSpecificType(catObj.types[0]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D9] rounded-xs text-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
                  >
                    {GARMENT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-1.5">
                    Specific Silhouette
                  </label>
                  <select
                    value={formSpecificType}
                    onChange={(e) => setFormSpecificType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D9] rounded-xs text-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
                  >
                    {availableTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color Selection Swatches */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-2 flex items-center justify-between">
                  <span>Color Foundation</span>
                  <span className="font-mono text-[11px] text-[#8C8275] flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: formColorHex }}
                    />
                    {formColorName}
                  </span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {FASHION_COLORS.map((col) => {
                    const isSelected = formColorHex === col.hex;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setFormColorName(col.name);
                          setFormColorHex(col.hex);
                        }}
                        className={`p-2 rounded-xs border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#141413] bg-[#FAF7F2] ring-1 ring-[#141413]'
                            : 'border-[#E8E2D9] bg-white hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="text-[10px] font-medium text-[#141413] truncate">
                          {col.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fashion Style */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-1.5">
                  Aesthetic Style
                </label>
                <select
                  value={formStyle}
                  onChange={(e) => setFormStyle(e.target.value as FashionStyle)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D9] rounded-xs text-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
                >
                  {Object.entries(FASHION_STYLES).map(([key, s]) => (
                    <option key={key} value={key}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Occasions (Multi-select pills) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-2">
                  Suitable Occasions
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(OCCASIONS_DATA).map(([occKey, occData]) => {
                    const isChecked = formOccasions.includes(occKey as Occasion);
                    return (
                      <button
                        key={occKey}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (formOccasions.length > 1) {
                              setFormOccasions(formOccasions.filter((o) => o !== occKey));
                            }
                          } else {
                            setFormOccasions([...formOccasions, occKey as Occasion]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xs text-xs font-medium border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-[#141413] text-[#FAF7F2] border-[#141413]'
                            : 'bg-white text-[#6B655B] border-[#E8E2D9] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {occData.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seasons (Multi-select pills) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-2">
                  Seasonal Suitability
                </label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((season) => {
                    const isChecked = formSeasons.includes(season);
                    return (
                      <button
                        key={season}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (formSeasons.length > 1) {
                              setFormSeasons(formSeasons.filter((s) => s !== season));
                            }
                          } else {
                            setFormSeasons([...formSeasons, season]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xs text-xs font-medium capitalize border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-[#8C4A2F] text-white border-[#8C4A2F]'
                            : 'bg-white text-[#6B655B] border-[#E8E2D9] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {season}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes / Styling Tips */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413] mb-1.5">
                  Styling Notes & Fit Details
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g., Dry clean only. Pairs best with high-waisted silk trousers or tailored blazers."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D9] rounded-xs text-xs text-[#141413] placeholder-[#A69E90] focus:outline-hidden focus:border-[#141413]"
                />
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-[#E8E2D9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2.5 text-xs text-[#6B655B] hover:text-[#141413] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#141413] hover:bg-[#2B2926] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
                >
                  {editingItem ? 'Save Changes' : 'Add to Wardrobe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Device Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handleCameraPhotoCaptured}
      />
    </div>
  );
};