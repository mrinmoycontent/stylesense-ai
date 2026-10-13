import React from 'react';
import { GarmentCategory } from '../types';

interface GarmentVisualProps {
  category?: GarmentCategory;
  name?: string;
  colorHex?: string;
  imageUrl?: string;
  className?: string;
  aspect?: 'square' | 'portrait' | 'landscape';
  compact?: boolean;
}

const CATEGORY_NAMES: Record<GarmentCategory, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  one_piece: 'One-Piece',
  outerwear: 'Outerwear',
  footwear: 'Footwear',
  accessories: 'Accessories',
  bags: 'Bags',
  weather_protection: 'Weather Protection'
};

export const GarmentVisual: React.FC<GarmentVisualProps> = ({
  category = 'tops',
  name = '',
  colorHex = '#C19A6B',
  imageUrl,
  className = '',
  aspect = 'square',
  compact = false
}) => {
  const [imageError, setImageError] = React.useState(false);

  const aspectClass =
    aspect === 'portrait' ? 'aspect-[3/4]' : aspect === 'landscape' ? 'aspect-[16/9]' : 'aspect-square';

  const hasValidImageUrl = Boolean(
    imageUrl &&
    typeof imageUrl === 'string' &&
    !imageError &&
    (imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://') ||
      imageUrl.startsWith('data:image/') ||
      imageUrl.startsWith('/'))
  );

  // Clean, human-readable display name that never displays raw 'svg' or 'icon' placeholder strings
  const cleanName = (name || '').trim();
  const isSvgPlaceholder =
    !cleanName ||
    cleanName.toLowerCase() === 'svg' ||
    cleanName.toLowerCase() === 'icon' ||
    cleanName.toLowerCase() === 'svgicon' ||
    cleanName.toLowerCase().startsWith('svg ') ||
    cleanName.toLowerCase().endsWith('.svg');
  const displayName = isSvgPlaceholder ? (CATEGORY_NAMES[category] || category.replace('_', ' ')) : cleanName;

  if (hasValidImageUrl) {
    return (
      <div className={`relative overflow-hidden bg-[#F2EDE4] ${aspectClass} ${className}`}>
        <img
          src={imageUrl}
          alt={displayName}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // Determine if container is compact/thumbnail
  const isThumbnail = compact || className.includes('w-12') || className.includes('w-14') || className.includes('w-16');

  if (isThumbnail) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center p-2 bg-[#F5EFE6] border border-[#E8DFC8]/60 ${aspectClass} ${className}`}
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colorHex} 0%, transparent 70%)`
          }}
        />
        <div className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
          <SilhouetteIcon category={category} colorHex={colorHex} name={displayName} />
        </div>
      </div>
    );
  }

  // Full-size Silhouette Presentation with dynamic color tint
  return (
    <div
      className={`relative overflow-hidden flex flex-col items-center justify-center p-4 bg-[#F5EFE6] border border-[#E8DFC8]/60 ${aspectClass} ${className}`}
    >
      {/* Background radial lighting */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${colorHex} 0%, transparent 70%)`
        }}
      />

      {/* Dynamic Silhouette Vector based on Category */}
      <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <SilhouetteIcon category={category} colorHex={colorHex} name={displayName} />
      </div>

      {/* Color Swatch Dot */}
      <div className="relative z-10 mt-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-xs border border-[#E5DACD]">
        <span
          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
          style={{ backgroundColor: colorHex }}
          aria-hidden="true"
        />
        <span className="text-[11px] font-medium tracking-tight text-[#4A4742] truncate max-w-[120px] capitalize">
          {displayName}
        </span>
      </div>
    </div>
  );
};

const SilhouetteIcon: React.FC<{ category: GarmentCategory; colorHex: string; name: string }> = ({
  category,
  colorHex,
  name
}) => {
  const strokeColor = '#1F1E1C';
  const fillColor = colorHex;

  const lowerName = name.toLowerCase();

  if (category === 'outerwear' || lowerName.includes('coat') || lowerName.includes('trench')) {
    // Trench / Coat Silhouette
    return (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
        <path
          d="M32 18 L44 26 L50 34 L56 26 L68 18 L76 34 L70 90 L30 90 L24 34 Z"
          fill={fillColor}
          fillOpacity="0.45"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M44 26 L50 56 L56 26" stroke={strokeColor} strokeWidth="1.8" />
        <path d="M26 60 L74 60" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="60" r="3" fill={strokeColor} />
        <path d="M40 70 L40 78 M60 70 L60 78" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M50 34 L50 90" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    );
  }

  if (category === 'one_piece' || lowerName.includes('dress')) {
    // Elegant Slip / Evening Dress Silhouette
    return (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
        <path d="M38 16 L38 28 M62 16 L62 28" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M36 28 C42 32 58 32 64 28 L60 48 C56 52 54 54 58 60 L76 92 L24 92 L42 60 C46 54 44 52 40 48 Z"
          fill={fillColor}
          fillOpacity="0.45"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M36 28 C42 34 58 34 64 28" stroke={strokeColor} strokeWidth="1.5" />
      </svg>
    );
  }

  if (category === 'bottoms' || lowerName.includes('trouser') || lowerName.includes('pant') || lowerName.includes('jeans')) {
    // Tailored Trousers Silhouette
    return (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
        <path
          d="M32 20 L68 20 L66 88 L52 88 L50 48 L48 88 L34 88 Z"
          fill={fillColor}
          fillOpacity="0.45"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M32 26 L68 26" stroke={strokeColor} strokeWidth="1.5" />
        <path d="M40 26 L40 86 M60 26 L60 86" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 3" />
      </svg>
    );
  }

  if (category === 'footwear' || lowerName.includes('shoe') || lowerName.includes('loafer') || lowerName.includes('boot')) {
    // Minimalist Loafer / Heel Silhouette
    return (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
        <path
          d="M16 62 C22 46 36 44 48 48 C58 52 70 52 84 54 C88 64 86 72 82 74 L18 74 C16 70 14 66 16 62 Z"
          fill={fillColor}
          fillOpacity="0.45"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M72 74 L72 80 L84 80 L84 74" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="48" cy="53" r="3.5" stroke={strokeColor} strokeWidth="1.8" />
        <line x1="42" y1="53" x2="54" y2="53" stroke={strokeColor} strokeWidth="1.8" />
      </svg>
    );
  }

  if (category === 'weather_protection' || lowerName.includes('umbrella')) {
    // Weather Protection Umbrella Silhouette
    return (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
        <path
          d="M18 52 C18 32 32 20 50 20 C68 20 82 32 82 52 C74 48 66 48 58 52 C50 48 42 48 34 52 C26 48 18 52 18 52 Z"
          fill={fillColor}
          fillOpacity="0.5"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <line x1="50" y1="20" x2="50" y2="76" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M50 76 C50 82 44 86 38 82" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="50" y1="14" x2="50" y2="20" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (category === 'bags' || lowerName.includes('bag') || lowerName.includes('tote') || lowerName.includes('satchel') || lowerName.includes('pouch') || lowerName.includes('minaudière') || lowerName.includes('briefcase')) {
    // Handbag / Tote Silhouette
    return (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
        <path d="M38 42 C38 24 62 24 62 42" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
        <rect
          x="24"
          y="42"
          width="52"
          height="42"
          rx="4"
          fill={fillColor}
          fillOpacity="0.45"
          stroke={strokeColor}
          strokeWidth="2.2"
        />
        <path d="M24 54 L76 54" stroke={strokeColor} strokeWidth="1.5" />
        <circle cx="50" cy="54" r="3" fill={strokeColor} />
      </svg>
    );
  }

  if (category === 'accessories' || lowerName.includes('sunglasses') || lowerName.includes('eyewear')) {
    // Sunglasses / Eyewear Silhouette
    return (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
        <circle cx="34" cy="52" r="14" fill={fillColor} fillOpacity="0.4" stroke={strokeColor} strokeWidth="2.2" />
        <circle cx="66" cy="52" r="14" fill={fillColor} fillOpacity="0.4" stroke={strokeColor} strokeWidth="2.2" />
        <path d="M48 50 C50 48 50 48 52 50" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M20 50 L12 46 M80 50 L88 46" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Tops (Shirts, Blouses, Knitwear) default
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
      <path
        d="M36 18 C42 24 58 24 64 18 L82 32 L72 44 L64 38 L64 84 L36 84 L36 38 L28 44 L18 32 Z"
        fill={fillColor}
        fillOpacity="0.45"
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M50 22 L50 84" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M42 18 L50 28 L58 18" stroke={strokeColor} strokeWidth="1.8" />
    </svg>
  );
};
