import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Heart,
  Check,
  Copy,
  AlertCircle,
  RefreshCw,
  Palette,
  SlidersHorizontal,
  Layers,
  Info,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  ThermometerSnowflake,
  ThermometerSun,
  Camera,
  CameraOff,
  SwitchCamera
} from 'lucide-react';
import {
  FASHION_COLORS,
  FASHION_STYLES,
  GARMENT_CATEGORIES,
  OCCASIONS_DATA,
  PRESET_GARMENTS
} from '../data/fashionData';
import {
  FashionColor,
  FashionStyle,
  GarmentCategory,
  GarmentPreset,
  Occasion,
  Season,
  OutfitRecommendation,
  TemperatureRange,
  WardrobeItem,
  WeatherCondition
} from '../types';
import { generateOutfitRecommendations } from '../services/stylingEngine';
import { isOutfitFavorited, saveFavoriteLook } from '../services/wardrobeStorage';
import { getTemperatureLabel, getWeatherLabel } from '../services/weatherStylingEngine';
import { decodeHtmlEntities } from '../services/textSanitizer';
import { GarmentVisual } from './GarmentVisual';
import { ProStylingTipsSidebar, ProStylingTipsHoverCard } from './ProStylingTips';

const formatCategoryBadge = (category: string): string => {
  const map: Record<string, string> = {
    tops: 'Top',
    bottoms: 'Bottom',
    one_piece: 'One-Piece',
    outerwear: 'Outerwear',
    footwear: 'Footwear',
    accessories: 'Accessory',
    bags: 'Bag',
    weather_protection: 'Weather Protection'
  };
  return map[category] || category;
};

interface OutfitStylistProps {
  initialGarment?: GarmentPreset | WardrobeItem | null;
  wardrobe: WardrobeItem[];
  currentWeather?: WeatherCondition;
  currentTemperature?: TemperatureRange;
  currentOccasion?: Occasion;
  currentSeason?: Season;
  onWeatherChange?: (w: WeatherCondition) => void;
  onTemperatureChange?: (t: TemperatureRange) => void;
  onOccasionChange?: (o: Occasion) => void;
  onSeasonChange?: (s: Season) => void;
  onFavoriteSaved: () => void;
  onExploreColorInStudio: (color: FashionColor) => void;
  onScheduleInCalendar?: (outfit: OutfitRecommendation) => void;
}

export const OutfitStylist: React.FC<OutfitStylistProps> = ({
  initialGarment,
  wardrobe,
  currentWeather = 'sunny',
  currentTemperature = '20_29',
  currentOccasion = 'office',
  currentSeason = 'autumn',
  onWeatherChange,
  onTemperatureChange,
  onOccasionChange,
  onSeasonChange,
  onFavoriteSaved,
  onExploreColorInStudio,
  onScheduleInCalendar
}) => {
  // Local fallback if callbacks not provided
  const [localWeather, setLocalWeather] = useState<WeatherCondition>(currentWeather);
  const [localTemp, setLocalTemp] = useState<TemperatureRange>(currentTemperature);
  const [localOccasion, setLocalOccasion] = useState<Occasion>(currentOccasion);
  const [localSeason, setLocalSeason] = useState<Season>(currentSeason);

  const activeWeather = onWeatherChange ? currentWeather : localWeather;
  const activeTemp = onTemperatureChange ? currentTemperature : localTemp;
  const activeOccasion = onOccasionChange ? currentOccasion : localOccasion;
  const activeSeason = onSeasonChange ? currentSeason : localSeason;

  const handleSetWeather = (w: WeatherCondition) => {
    if (onWeatherChange) onWeatherChange(w);
    else setLocalWeather(w);
    generateWithState({ weather: w });
  };

  const handleSetTemp = (t: TemperatureRange) => {
    if (onTemperatureChange) onTemperatureChange(t);
    else setLocalTemp(t);
    generateWithState({ temp: t });
  };

  const handleSetOccasion = (o: Occasion) => {
    if (onOccasionChange) onOccasionChange(o);
    else setLocalOccasion(o);
    generateWithState({ occasion: o });
  };

  const handleSetSeason = (s: Season) => {
    if (onSeasonChange) onSeasonChange(s);
    else setLocalSeason(s);
    generateWithState({ season: s });
  };

  // Garment Attributes State
  const [garmentName, setGarmentName] = useState(initialGarment?.name || 'Camel Double-Breasted Trench');
  const [category, setCategory] = useState<GarmentCategory>(initialGarment?.category || 'outerwear');
  const [specificType, setSpecificType] = useState(
    initialGarment?.specificType || 'Double-Breasted Wool Trench'
  );
  const [selectedColor, setSelectedColor] = useState<FashionColor>(() => {
    const matched = FASHION_COLORS.find(c => c.name.toLowerCase() === (initialGarment?.colorName || 'Camel Tan').toLowerCase());
    return matched || FASHION_COLORS[2];
  });
  const [selectedStyle, setSelectedStyle] = useState<FashionStyle>(
    initialGarment?.style || 'classic_elegance'
  );

  // Upload & Wardrobe state
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialGarment?.imageUrl || null);
  const [isUploaded, setIsUploaded] = useState<boolean>(Boolean(initialGarment?.imageUrl && !('createdAt' in (initialGarment || {}))));
  const [wardrobeItemId, setWardrobeItemId] = useState<string | null>(
    initialGarment && 'id' in initialGarment && 'createdAt' in initialGarment ? initialGarment.id : null
  );
  const [isColorConfirmed, setIsColorConfirmed] = useState<boolean>(
    !initialGarment?.imageUrl || ('createdAt' in (initialGarment || {}))
  );

  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [variationSeed, setVariationSeed] = useState(0);
  const variationSeedRef = React.useRef(0);
  const [shuffleFeedback, setShuffleFeedback] = useState<{
    type: 'success' | 'no_alternatives';
    message: string;
  } | null>(null);

  // Live Camera Interface State & Refs
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Recommendations State
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>(() => {
    const isUp = Boolean(initialGarment?.imageUrl && !('createdAt' in (initialGarment || {})));
    return generateOutfitRecommendations({
      coreName: initialGarment?.name || 'Camel Double-Breasted Trench',
      category: initialGarment?.category || 'outerwear',
      specificType: initialGarment?.specificType || 'Double-Breasted Wool Trench',
      colorHex: initialGarment?.colorHex || '#C19A6B',
      colorName: initialGarment?.colorName || 'Camel Tan',
      style: initialGarment?.style || 'classic_elegance',
      occasion: activeOccasion,
      season: activeSeason,
      weather: activeWeather,
      temperature: activeTemp,
      imageUrl: initialGarment?.imageUrl,
      isUploaded: isUp,
      isColorConfirmed: !isUp,
      wardrobeItemId: initialGarment && 'id' in initialGarment && 'createdAt' in initialGarment ? initialGarment.id : undefined,
      wardrobe,
      seed: 0
    });
  });

  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Helper to re-generate with current or overridden params
  const generateWithState = (overrides?: {
    name?: string;
    cat?: GarmentCategory;
    specType?: string;
    color?: FashionColor;
    style?: FashionStyle;
    occasion?: Occasion;
    season?: Season;
    weather?: WeatherCondition;
    temp?: TemperatureRange;
    img?: string | null;
    uploaded?: boolean;
    colorConfirmed?: boolean;
    wItemId?: string | null;
    seed?: number;
    preserveLookIndex?: boolean;
  }) => {
    const curName = (overrides?.name !== undefined ? overrides.name : garmentName).trim() || 'Core Piece';
    const curCat = overrides?.cat || category;
    const curType = overrides?.specType || specificType;
    const curColor = overrides?.color || selectedColor;
    const curStyle = overrides?.style || selectedStyle;
    const curOcc = overrides?.occasion || activeOccasion;
    const curSeason = overrides?.season || activeSeason;
    const curWeather = overrides?.weather || activeWeather;
    const curTemp = overrides?.temp || activeTemp;
    const curImg = overrides?.img !== undefined ? overrides.img : uploadedImage;
    const curUploaded = overrides?.uploaded !== undefined ? overrides.uploaded : isUploaded;
    const curColorConfirmed = overrides?.colorConfirmed !== undefined ? overrides.colorConfirmed : isColorConfirmed;
    const curWItemId = overrides?.wItemId !== undefined ? overrides.wItemId : wardrobeItemId;
    const curSeed = overrides?.seed !== undefined ? overrides.seed : variationSeedRef.current;

    const recs = generateOutfitRecommendations({
      coreName: curName,
      category: curCat,
      specificType: curType,
      colorHex: curColor.hex,
      colorName: curColor.name,
      style: curStyle,
      occasion: curOcc,
      season: curSeason,
      weather: curWeather,
      temperature: curTemp,
      imageUrl: curImg || undefined,
      isUploaded: curUploaded,
      isColorConfirmed: curColorConfirmed,
      wardrobeItemId: curWItemId || undefined,
      wardrobe,
      seed: curSeed
    });

    setRecommendations(recs);
    if (!overrides?.preserveLookIndex) {
      setActiveLookIndex(0);
    } else {
      setActiveLookIndex(prev => Math.min(prev, Math.max(0, recs.length - 1)));
    }
  };

  // Sync when initialGarment changes
  useEffect(() => {
    if (initialGarment) {
      const isWItem = 'createdAt' in initialGarment;
      const isUp = Boolean(initialGarment.imageUrl && !isWItem);
      const wId = isWItem ? initialGarment.id : null;

      const matchedColor = FASHION_COLORS.find(
        c => c.name.toLowerCase() === initialGarment.colorName.toLowerCase() ||
             c.hex.toLowerCase() === initialGarment.colorHex.toLowerCase()
      ) || {
        id: `custom-${initialGarment.colorHex}`,
        name: initialGarment.colorName,
        hex: initialGarment.colorHex,
        family: 'neutral' as const,
        undertone: 'neutral' as const,
        complementaryHex: '#161617',
        analogousHexes: [initialGarment.colorHex],
        monochromaticHexes: [initialGarment.colorHex],
        bestNeutrals: ['#F7F4EE', '#161617'],
        stylingAdvice: 'Custom color tone.'
      };

      setGarmentName(initialGarment.name);
      setCategory(initialGarment.category);
      setSpecificType(initialGarment.specificType);
      setSelectedColor(matchedColor);
      setSelectedStyle(initialGarment.style);
      setUploadedImage(initialGarment.imageUrl || null);
      setIsUploaded(isUp);
      setWardrobeItemId(wId);

      const targetOcc = initialGarment.occasions?.[0] || activeOccasion;
      if (initialGarment.occasions?.[0] && onOccasionChange && initialGarment.occasions[0] !== activeOccasion) {
        onOccasionChange(initialGarment.occasions[0]);
      }

      generateWithState({
        name: initialGarment.name,
        cat: initialGarment.category,
        specType: initialGarment.specificType,
        color: matchedColor,
        style: initialGarment.style,
        occasion: targetOcc,
        img: initialGarment.imageUrl || null,
        uploaded: isUp,
        wItemId: wId
      });
    }
  }, [initialGarment]);

  // Re-generate if wardrobe changes
  useEffect(() => {
    generateWithState();
  }, [wardrobe]);

  // Handle Photo Upload
  const handleFileChange = (file: File) => {
    setImageError(null);
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setImageError('Image exceeds 15MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        try {
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
          let finalDataUrl = dataUrl;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            finalDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          }

          // 1. Analyze image canvas pixels for dominant color
          let detectedColor: FashionColor | null = null;
          if (ctx) {
            try {
              const startX = Math.floor(width * 0.15);
              const startY = Math.floor(height * 0.15);
              const sampleW = Math.max(1, Math.floor(width * 0.7));
              const sampleH = Math.max(1, Math.floor(height * 0.7));
              const imgData = ctx.getImageData(startX, startY, sampleW, sampleH).data;

              let totalR = 0;
              let totalG = 0;
              let totalB = 0;
              let validPixelCount = 0;

              for (let p = 0; p < imgData.length; p += 16) {
                const r = imgData[p];
                const g = imgData[p + 1];
                const b = imgData[p + 2];
                const a = imgData[p + 3];

                if (a < 120) continue;
                totalR += r;
                totalG += g;
                totalB += b;
                validPixelCount++;
              }

              if (validPixelCount > 0) {
                const avgR = totalR / validPixelCount;
                const avgG = totalG / validPixelCount;
                const avgB = totalB / validPixelCount;
                const spread = Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB);

                // High brightness and neutral spread = White / Off-white
                if (avgR > 195 && avgG > 195 && avgB > 195 && spread < 40) {
                  detectedColor =
                    FASHION_COLORS.find(c => c.name === 'Chalk White') ||
                    FASHION_COLORS.find(c => c.name === 'Ivory Cream') ||
                    null;
                } else if (avgR < 50 && avgG < 50 && avgB < 50) {
                  detectedColor = FASHION_COLORS.find(c => c.name === 'Obsidian Black') || null;
                } else {
                  let bestDist = Infinity;
                  let closest: FashionColor | null = null;
                  for (const fc of FASHION_COLORS) {
                    const hex = fc.hex.replace('#', '');
                    const cr = parseInt(hex.substring(0, 2), 16);
                    const cg = parseInt(hex.substring(2, 4), 16);
                    const cb = parseInt(hex.substring(4, 6), 16);
                    const dist = Math.sqrt((avgR - cr) ** 2 + (avgG - cg) ** 2 + (avgB - cb) ** 2);
                    if (dist < bestDist) {
                      bestDist = dist;
                      closest = fc;
                    }
                  }
                  if (bestDist < 85) {
                    detectedColor = closest;
                  }
                }
              }
            } catch {
              // Canvas sampling fallback
            }
          }

          // 2. Classify filename for explicit color or category cues
          const baseFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toLowerCase();

          let fileColor: FashionColor | null = null;
          if (
            baseFileName.includes('white') ||
            baseFileName.includes('chalk') ||
            baseFileName.includes('snow')
          ) {
            fileColor = FASHION_COLORS.find(c => c.name === 'Chalk White') || null;
          } else if (
            baseFileName.includes('ivory') ||
            baseFileName.includes('cream') ||
            baseFileName.includes('bone')
          ) {
            fileColor = FASHION_COLORS.find(c => c.name === 'Ivory Cream') || null;
          } else if (
            baseFileName.includes('black') ||
            baseFileName.includes('obsidian') ||
            baseFileName.includes('noir')
          ) {
            fileColor = FASHION_COLORS.find(c => c.name === 'Obsidian Black') || null;
          } else if (baseFileName.includes('camel') || baseFileName.includes('tan')) {
            fileColor = FASHION_COLORS.find(c => c.name === 'Camel Tan') || null;
          } else if (
            baseFileName.includes('navy') ||
            baseFileName.includes('blue') ||
            baseFileName.includes('indigo')
          ) {
            fileColor = FASHION_COLORS.find(c => c.name === 'Midnight Navy') || null;
          } else if (
            baseFileName.includes('charcoal') ||
            baseFileName.includes('grey') ||
            baseFileName.includes('gray')
          ) {
            fileColor = FASHION_COLORS.find(c => c.name === 'Charcoal Heather') || null;
          } else if (baseFileName.includes('emerald') || baseFileName.includes('forest')) {
            fileColor = FASHION_COLORS.find(c => c.name === 'Emerald Forest') || null;
          } else if (baseFileName.includes('sage') || baseFileName.includes('olive')) {
            fileColor = FASHION_COLORS.find(c => c.name === 'Muted Sage') || null;
          }

          // Determine if we reliably identified a color from the file name or image canvas
          const hasReliableColor = Boolean(fileColor || detectedColor);
          const nextColor = fileColor || detectedColor || selectedColor;
          setIsColorConfirmed(hasReliableColor);
          setSelectedColor(nextColor);

          // 3. Garment name and category classification
          let nextName = garmentName;
          let nextCat = category;
          let nextType = specificType;

          // Check if current name was an automated default or preset
          const isPresetName =
            !garmentName.trim() ||
            garmentName === 'Camel Double-Breasted Trench' ||
            garmentName === 'Emerald Silk Midi Slip' ||
            garmentName === 'Silk Ivory Shirt' ||
            garmentName === 'Wide-Leg Navy Trousers' ||
            garmentName === 'Calfskin Horsebit Loafers' ||
            garmentName.startsWith('Uploaded ') ||
            PRESET_GARMENTS.some(p => p.name.toLowerCase() === garmentName.toLowerCase());

          if (
            baseFileName.includes('shirt') ||
            baseFileName.includes('button') ||
            baseFileName.includes('oxford') ||
            baseFileName.includes('blouse') ||
            baseFileName.includes('poplin') ||
            baseFileName.includes('tee') ||
            baseFileName.includes('top')
          ) {
            nextCat = 'tops';
            nextType = 'Crisp Poplin Shirt';
            nextName = isPresetName
              ? hasReliableColor
                ? (nextColor.name.includes('White') ? 'White Button-Down Shirt' : `Uploaded ${nextColor.name} Shirt`)
                : 'Uploaded Shirt'
              : garmentName;
          } else if (
            baseFileName.includes('pant') ||
            baseFileName.includes('trouser') ||
            baseFileName.includes('jean') ||
            baseFileName.includes('skirt') ||
            baseFileName.includes('chino') ||
            baseFileName.includes('shorts')
          ) {
            nextCat = 'bottoms';
            nextType = 'Tailored Trousers';
            nextName = isPresetName
              ? hasReliableColor
                ? `Uploaded ${nextColor.name} Trousers`
                : 'Uploaded Trousers'
              : garmentName;
          } else if (
            baseFileName.includes('coat') ||
            baseFileName.includes('jacket') ||
            baseFileName.includes('blazer') ||
            baseFileName.includes('trench')
          ) {
            nextCat = 'outerwear';
            nextType = 'Tailored Blazer';
            nextName = isPresetName
              ? hasReliableColor
                ? `Uploaded ${nextColor.name} Outerwear`
                : 'Uploaded Outerwear'
              : garmentName;
          } else if (baseFileName.includes('dress') || baseFileName.includes('jumpsuit') || baseFileName.includes('slip')) {
            nextCat = 'one_piece';
            nextType = 'Tailored Dress';
            nextName = isPresetName
              ? hasReliableColor
                ? `Uploaded ${nextColor.name} Dress`
                : 'Uploaded Dress'
              : garmentName;
          } else if (
            baseFileName.includes('shoe') ||
            baseFileName.includes('boot') ||
            baseFileName.includes('loafer') ||
            baseFileName.includes('sneaker')
          ) {
            nextCat = 'footwear';
            nextType = 'Leather Loafers';
            nextName = isPresetName
              ? hasReliableColor
                ? `Uploaded ${nextColor.name} Footwear`
                : 'Uploaded Footwear'
              : garmentName;
          } else if (isPresetName) {
            // General uploaded garment fallback when no specific category keyword was in filename
            nextName = hasReliableColor
              ? (nextColor.name.includes('White') ? 'White Button-Down Shirt' : `Uploaded ${nextColor.name} Garment`)
              : 'Uploaded Garment';
            if (hasReliableColor && nextColor.name.includes('White') && isPresetName) {
              nextCat = 'tops';
              nextType = 'Crisp Poplin Shirt';
            }
          }

          setGarmentName(nextName);
          setCategory(nextCat);
          setSpecificType(nextType);

          setUploadedImage(finalDataUrl);
          setIsUploaded(true);
          setWardrobeItemId(null);

          // Immediately regenerate recommendations with this uploaded photo as the core piece
          generateWithState({
            name: nextName,
            cat: nextCat,
            specType: nextType,
            color: nextColor,
            colorConfirmed: hasReliableColor,
            img: finalDataUrl,
            uploaded: true,
            wItemId: null
          });
        } catch {
          const isPresetName =
            !garmentName.trim() ||
            garmentName === 'Camel Double-Breasted Trench' ||
            garmentName.startsWith('Uploaded ') ||
            PRESET_GARMENTS.some(p => p.name.toLowerCase() === garmentName.toLowerCase());
          const fallbackName = isPresetName ? 'Uploaded Garment' : garmentName;
          setGarmentName(fallbackName);
          setUploadedImage(dataUrl);
          setIsUploaded(true);
          setIsColorConfirmed(false);
          setWardrobeItemId(null);
          generateWithState({
            name: fallbackName,
            img: dataUrl,
            uploaded: true,
            colorConfirmed: false,
            wItemId: null
          });
        }
      };
      img.onerror = () => {
        setImageError('Invalid image file format.');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setImageError('Failed to read image file. Please try another.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    stopCamera();
    setUploadedImage(null);
    setIsUploaded(false);
    setIsColorConfirmed(true);
    generateWithState({ img: null, uploaded: false, colorConfirmed: true });
  };

  // Stop camera tracks cleanly
  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
        try {
          track.stop();
        } catch {
          // ignore track stop error
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCameraLoading(false);
    setCameraError(null);
  }, []);

  // Cleanup camera tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
        streamRef.current = null;
      }
    };
  }, []);

  // Start live camera stream
  const startCamera = React.useCallback(async (targetFacing: 'environment' | 'user' = facingMode) => {
    setImageError(null);
    setCameraError(null);
    setIsCameraOpen(true);
    setCameraLoading(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setCameraError(
        'Camera API (getUserMedia) is not available or supported in this browser context (requires HTTPS or localhost). Please use Browse File to upload a photo.'
      );
      setCameraLoading(false);
      return;
    }

    // Check multiple devices
    try {
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }
    } catch {
      // Ignore enumeration errors
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: targetFacing },
          audio: false
        });
      } catch (firstErr: any) {
        // If the failure was due to Permissions Policy or explicit user denial, bubble up
        const isPolicyOrPermission =
          firstErr?.name === 'SecurityError' ||
          firstErr?.name === 'NotAllowedError' ||
          firstErr?.name === 'PermissionDeniedError' ||
          (typeof firstErr?.message === 'string' &&
            firstErr.message.toLowerCase().includes('permissions policy'));

        if (isPolicyOrPermission) {
          throw firstErr;
        }

        // Sensible fallback without facingMode constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // auto-play or stream play started
        }
      }
      setCameraLoading(false);
    } catch (err: any) {
      setCameraLoading(false);

      const errName = err?.name || '';
      const errMsg = typeof err?.message === 'string' ? err.message : '';
      const isPolicyViolation =
        errName === 'SecurityError' ||
        errMsg.toLowerCase().includes('permissions policy') ||
        errMsg.toLowerCase().includes('permission policy') ||
        errMsg.toLowerCase().includes('not allowed in this document') ||
        errMsg.toLowerCase().includes('policy violation');

      if (isPolicyViolation) {
        setCameraError(
          'Permissions Policy Restriction: Camera access is blocked by the iframe/document permissions policy in this preview environment. The host container does not allow camera capture in this frame. Please test the app by opening the URL directly in a full browser tab, or use Browse File.'
        );
      } else if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraError(
          'Camera access was denied by browser permissions. Please allow camera permissions in your browser address bar/settings, or click Browse File.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraError(
          'No camera hardware detected on this device. Please upload an image using Browse File.'
        );
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setCameraError(
          'Camera hardware is currently in use by another application or tab. Please release the camera and try again, or click Browse File.'
        );
      } else if (errName === 'OverconstrainedError' || errName === 'ConstraintNotSatisfiedError') {
        setCameraError(
          'The requested camera configuration is not supported by your camera hardware. Please use Browse File.'
        );
      } else {
        setCameraError(
          errMsg || 'Unable to access device camera. Please use Browse File instead.'
        );
      }
    }
  }, [facingMode]);

  // Switch facing mode if multiple cameras available
  const handleSwitchFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    await startCamera(nextFacing);
  };

  // Capture frame from active video element and pass to handleFileChange
  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, vw, vh);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera-garment-${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopCamera();
      handleFileChange(file);
    }, 'image/jpeg', 0.9);
  };

  const handleCategoryChange = (newCat: GarmentCategory) => {
    setCategory(newCat);
    const catData = GARMENT_CATEGORIES.find(c => c.id === newCat);
    const newType = catData && catData.types.length > 0 ? catData.types[0] : specificType;
    setSpecificType(newType);
    generateWithState({ cat: newCat, specType: newType });
  };

  const handleApplyPreset = (preset: GarmentPreset) => {
    setGarmentName(preset.name);
    setCategory(preset.category);
    setSpecificType(preset.specificType);
    const col = FASHION_COLORS.find(c => c.name.toLowerCase() === preset.colorName.toLowerCase()) || FASHION_COLORS[0];
    setSelectedColor(col);
    setSelectedStyle(preset.style);
    setUploadedImage(null);
    setIsUploaded(false);
    setIsColorConfirmed(true);
    setWardrobeItemId(null);

    const targetOcc = preset.occasions[0] || activeOccasion;
    if (onOccasionChange && preset.occasions[0]) {
      onOccasionChange(preset.occasions[0]);
    }

    generateWithState({
      name: preset.name,
      cat: preset.category,
      specType: preset.specificType,
      color: col,
      style: preset.style,
      occasion: targetOcc,
      img: null,
      uploaded: false,
      colorConfirmed: true,
      wItemId: null
    });
  };

  const handleGenerate = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    setValidationError(null);
    setShuffleFeedback(null);

    if (!garmentName.trim()) {
      setValidationError('Please give your garment a name (e.g., "Cashmere Coat" or "Silk Camisole").');
      return;
    }

    try {
      generateWithState();
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'An error occurred while generating recommendations.');
    }
  };

  const handleShuffle = () => {
    setValidationError(null);
    const nextSeed = variationSeedRef.current + 1;
    variationSeedRef.current = nextSeed;
    setVariationSeed(nextSeed);

    const prevSignature = recommendations.map(look =>
      look.pieces.map(p => `${p.category}:${p.name}:${p.colorHex}`).join('|')
    ).join('||');

    const curName = garmentName.trim() || 'Core Piece';
    const recs = generateOutfitRecommendations({
      coreName: curName,
      category,
      specificType,
      colorHex: selectedColor.hex,
      colorName: selectedColor.name,
      style: selectedStyle,
      occasion: activeOccasion,
      season: activeSeason,
      weather: activeWeather,
      temperature: activeTemp,
      imageUrl: uploadedImage || undefined,
      isUploaded,
      isColorConfirmed,
      wardrobeItemId: wardrobeItemId || undefined,
      wardrobe,
      seed: nextSeed
    });

    const newSignature = recs.map(look =>
      look.pieces.map(p => `${p.category}:${p.name}:${p.colorHex}`).join('|')
    ).join('||');

    setRecommendations(recs);
    setActiveLookIndex(prev => Math.min(prev, Math.max(0, recs.length - 1)));

    if (prevSignature === newSignature && recommendations.length > 0) {
      setShuffleFeedback({
        type: 'no_alternatives',
        message: 'No further distinct garment combinations available for this specific wardrobe, climate, and formality combination.'
      });
    } else {
      setShuffleFeedback({
        type: 'success',
        message: `Alternative ensemble combination #${nextSeed} loaded with fresh compatible pieces.`
      });
    }
  };

  const handleCycleAlternatives = handleShuffle;

  const handleSaveToLookbook = (look: OutfitRecommendation) => {
    saveFavoriteLook(look);
    setSavedSuccessId(look.id);
    onFavoriteSaved();
    setTimeout(() => setSavedSuccessId(null), 3000);
  };

  const handleCopyOutfitRecipe = (look: OutfitRecommendation) => {
    const text = `StyleSense Curated Look: ${look.title} (${look.subtitle})
Occasion: ${OCCASIONS_DATA[look.occasion].name}
Climate: ${getWeatherLabel(activeWeather)} · ${getTemperatureLabel(activeTemp)}
Aesthetic: ${look.aesthetic}
Core Piece: ${look.corePieceName} (${look.corePieceColor})
Pieces:
${look.pieces.map(p => `• [${p.role}] ${p.name} (${p.colorName}) - ${p.stylingTip}`).join('\n')}
Metal Tone: ${look.recommendedMetal}
Pro Stylist Rule: ${look.proStylistRule}
Rationale: ${look.stylistRationale}`;

    navigator.clipboard.writeText(text);
    setCopiedId(look.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const activeLook = recommendations[activeLookIndex] || recommendations[0];

  return (
    <div
      id="recommendation-interface"
      data-testid="recommendation-interface"
      role="region"
      aria-label="Style Recommendation"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12"
    >
      {/* Studio Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C8275] font-semibold mb-1">
          <span>Virtual Atelier</span>
          <span aria-hidden="true">·</span>
          <span>Adaptive Recommendation Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-[#141413]">
          Curate Your Ensemble
        </h2>
        <p className="text-sm sm:text-base text-[#5A554E] mt-1 max-w-2xl font-light">
          Upload a garment photograph or configure its silhouette, color, occasion, and ambient weather. StyleSense makes that piece the anchored core and generates 3 distinct, climate-calibrated ensembles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form: Garment, Climate & Occasion Configuration (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xs border border-[#E8DFC8] shadow-xs space-y-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Step 1: Photo Upload with Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413]">
                  1. Garment Photograph
                </label>
                {uploadedImage && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-[11px] text-[#A64B2A] hover:underline"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {isCameraOpen ? (
                <div className="rounded-xs overflow-hidden border border-[#141413] bg-[#141413] text-white p-3 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#333]">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#C19A6B]" />
                      <span className="text-xs font-medium tracking-wide uppercase">Live Camera Capture</span>
                    </div>
                    {hasMultipleCameras && (
                      <button
                        type="button"
                        onClick={handleSwitchFacing}
                        className="flex items-center gap-1 text-[11px] text-[#D9CFC4] hover:text-white px-2 py-0.5 rounded-xs bg-[#242423] transition-colors"
                        title="Switch front / rear camera"
                      >
                        <SwitchCamera className="w-3.5 h-3.5" />
                        <span>Flip</span>
                      </button>
                    )}
                  </div>

                  <div className="relative aspect-4/3 w-full bg-black rounded-xs overflow-hidden flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />

                    {/* Viewfinder crosshairs / frame guide */}
                    <div className="absolute inset-4 pointer-events-none border border-white/25 rounded-xs flex items-center justify-center">
                      <div className="w-8 h-8 border-t-2 border-l-2 border-white/60 absolute top-0 left-0" />
                      <div className="w-8 h-8 border-t-2 border-r-2 border-white/60 absolute top-0 right-0" />
                      <div className="w-8 h-8 border-b-2 border-l-2 border-white/60 absolute bottom-0 left-0" />
                      <div className="w-8 h-8 border-b-2 border-r-2 border-white/60 absolute bottom-0 right-0" />
                      <span className="text-[10px] uppercase tracking-wider text-white/70 bg-black/40 px-2 py-0.5 rounded-xs">
                        Center garment in frame
                      </span>
                    </div>

                    {cameraLoading && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-white">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#C19A6B]" />
                        <span className="text-xs">Initializing camera feed...</span>
                      </div>
                    )}
                  </div>

                  {cameraError && (
                    <div className="flex items-start gap-2 bg-[#2D1614] border border-[#A64B2A] text-[#F5C2B8] p-2.5 rounded-xs text-xs">
                      <CameraOff className="w-4 h-4 shrink-0 mt-0.5 text-[#F28B82]" />
                      <span className="flex-1">{cameraError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3.5 py-1.5 text-xs text-[#E8E2D9] hover:text-white bg-[#262624] hover:bg-[#333330] rounded-xs transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleCaptureFromCamera}
                      disabled={cameraLoading || Boolean(cameraError)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#8C4A2F] hover:bg-[#A64B2A] disabled:opacity-50 disabled:cursor-not-allowed rounded-xs shadow-xs transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Photo</span>
                    </button>
                  </div>
                </div>
              ) : uploadedImage ? (
                <div className="relative group rounded-xs overflow-hidden border border-[#E8DFC8] bg-[#F7F4EE]">
                  <img
                    src={uploadedImage}
                    alt="Uploaded garment preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 text-white text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs tracking-wider">
                    Anchored Core Piece
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="cursor-pointer px-3.5 py-2 bg-[#141413] text-white text-xs font-semibold rounded-xs shadow-md hover:bg-[#262624] transition-colors flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo</span>
                    </button>
                    <label className="cursor-pointer px-3.5 py-2 bg-white text-xs font-semibold text-[#141413] rounded-xs shadow-md hover:bg-[#F2EDE4] transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xs p-6 text-center transition-colors ${
                    isDragging
                      ? 'border-[#141413] bg-[#F2EDE4]'
                      : 'border-[#D9CFC4] hover:border-[#8C8275] bg-[#FAF8F5]'
                  }`}
                >
                  <Upload className="w-6 h-6 mx-auto text-[#8C8275] mb-2" />
                  <p className="text-xs text-[#4A4742] font-medium">
                    Drag & drop your garment photo here, or
                  </p>
                  <div className="flex items-center justify-center gap-2.5 mt-2.5">
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#8C4A2F] hover:bg-[#A64B2A] rounded-xs shadow-xs transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo</span>
                    </button>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 text-xs font-medium text-[#141413] bg-white border border-[#D9CFC4] hover:bg-[#F2EDE4] rounded-xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#5A554E]" />
                      <span>Browse File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-[#8C8275] mt-2">
                    Browser-side processing only (PNG, JPG, WEBP under 15MB)
                  </p>
                </div>
              )}

              {imageError && (
                <div className="flex items-center gap-1.5 text-xs text-[#A64B2A] pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}
            </div>

            {/* Step 2: Garment Name & Type */}
            <div className="space-y-4 pt-2 border-t border-[#F0EAE1]">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413]">
                2. Garment Details
              </label>

              <div>
                <label className="block text-xs text-[#5A554E] mb-1 font-medium">
                  Garment Name / Description
                </label>
                <input
                  type="text"
                  value={garmentName}
                  onChange={(e) => {
                    setGarmentName(e.target.value);
                    generateWithState({ name: e.target.value });
                  }}
                  placeholder="e.g., Camel Wool Trench Coat"
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#D9CFC4] rounded-xs text-[#141413] focus:outline-hidden focus:border-[#141413] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#5A554E] mb-1 font-medium">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as GarmentCategory)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D9CFC4] rounded-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
                  >
                    {GARMENT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#5A554E] mb-1 font-medium">
                    Specific Cut / Silhouette
                  </label>
                  <select
                    value={specificType}
                    onChange={(e) => {
                      setSpecificType(e.target.value);
                      generateWithState({ specType: e.target.value });
                    }}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D9CFC4] rounded-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
                  >
                    {GARMENT_CATEGORIES.find(c => c.id === category)?.types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Color Palette Selection */}
            <div className="space-y-2 pt-2 border-t border-[#F0EAE1]">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413]">
                  3. Primary Garment Color
                </label>
                <span className="text-xs font-medium text-[#5A554E] flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  {selectedColor.name}
                </span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-6 gap-2 pt-1">
                {FASHION_COLORS.map((col) => {
                  const isSelected = selectedColor.id === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        setSelectedColor(col);
                        setIsColorConfirmed(true);
                        generateWithState({ color: col, colorConfirmed: true });
                      }}
                      className={`relative aspect-square rounded-xs p-1 flex items-center justify-center transition-transform ${
                        isSelected ? 'ring-2 ring-[#141413] scale-105' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={`${col.name} (${col.family} · ${col.undertone})`}
                      aria-label={col.name}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            col.hex === '#F7F4EE' || col.hex === '#DEC1B9' || col.hex === '#A5C4D4'
                              ? 'text-[#141413]'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#7A7369] italic pt-1">
                {selectedColor.stylingAdvice}
              </p>
            </div>

            {/* Step 4: Sartorial Style Aesthetic */}
            <div className="space-y-2 pt-2 border-t border-[#F0EAE1]">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413]">
                4. Aesthetic Mood and Cut
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => {
                  const newStyle = e.target.value as FashionStyle;
                  setSelectedStyle(newStyle);
                  generateWithState({ style: newStyle });
                }}
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D9CFC4] rounded-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
              >
                {Object.entries(FASHION_STYLES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.name} — {item.description.slice(0, 48)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Step 5: Occasion Selection */}
            <div className="space-y-2 pt-2 border-t border-[#F0EAE1]">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413]">
                5. Target Occasion
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {(Object.keys(OCCASIONS_DATA) as Occasion[]).map((occ) => {
                  const isSelected = activeOccasion === occ;
                  const data = OCCASIONS_DATA[occ];
                  return (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => handleSetOccasion(occ)}
                      className={`p-2.5 text-left border rounded-xs transition-colors ${
                        isSelected
                          ? 'border-[#141413] bg-[#141413] text-white'
                          : 'border-[#D9CFC4] bg-[#FAF8F5] text-[#383531] hover:bg-[#F2EDE4]'
                      }`}
                    >
                      <div className="text-xs font-semibold">{data.name}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-[#D4C9BC]' : 'text-[#8C8275]'
                        }`}
                      >
                        {data.formalityLevel}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 6: Atelier Season Calibration */}
            <div className="space-y-2 pt-2 border-t border-[#F0EAE1]">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413]">
                  6. Atelier Season
                </label>
                <span className="text-[10px] text-[#7A7369] font-medium capitalize">
                  {activeSeason} Calibration
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { id: 'spring' as Season, label: 'Spring', icon: '🌸' },
                  { id: 'summer' as Season, label: 'Summer', icon: '☀️' },
                  { id: 'autumn' as Season, label: 'Autumn', icon: '🍂' },
                  { id: 'winter' as Season, label: 'Winter', icon: '❄️' }
                ].map((s) => {
                  const isSelected = activeSeason === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSetSeason(s.id)}
                      className={`py-2 px-1 text-center border rounded-xs transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'border-[#141413] bg-[#141413] text-white'
                          : 'border-[#D9CFC4] bg-[#FAF8F5] text-[#383531] hover:bg-[#F2EDE4]'
                      }`}
                    >
                      <span className="text-xs" aria-hidden="true">{s.icon}</span>
                      <span className="text-[10px] font-semibold">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 7: Ambient Climate & Weather Synchronization */}
            <div className="space-y-3 pt-2 border-t border-[#F0EAE1]">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413]">
                  7. Ambient Weather & Temperature
                </label>
                <span className="text-[10px] text-[#7A7369] font-medium">
                  {getWeatherLabel(activeWeather)} · {getTemperatureLabel(activeTemp)}
                </span>
              </div>

              {/* Weather Icons Row */}
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'sunny' as WeatherCondition, label: 'Sunny', icon: <Sun className="w-4 h-4" /> },
                  { id: 'cloudy' as WeatherCondition, label: 'Cloudy', icon: <Cloud className="w-4 h-4" /> },
                  { id: 'rainy' as WeatherCondition, label: 'Rainy', icon: <CloudRain className="w-4 h-4" /> },
                  { id: 'windy' as WeatherCondition, label: 'Windy', icon: <Wind className="w-4 h-4" /> },
                  { id: 'cold' as WeatherCondition, label: 'Cold', icon: <ThermometerSnowflake className="w-4 h-4" /> }
                ].map((w) => {
                  const isSelected = activeWeather === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSetWeather(w.id)}
                      className={`p-2 flex flex-col items-center justify-center gap-1 border rounded-xs transition-colors ${
                        isSelected
                          ? 'border-[#141413] bg-[#141413] text-white'
                          : 'border-[#D9CFC4] bg-[#FAF8F5] text-[#4A4742] hover:bg-[#F2EDE4]'
                      }`}
                      title={w.label}
                    >
                      {w.icon}
                      <span className="text-[9px] font-medium leading-none">{w.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Temperature Range Row */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'below_10' as TemperatureRange, label: '<10°C', desc: 'Cold' },
                  { id: '10_19' as TemperatureRange, label: '10–19°C', desc: 'Cool' },
                  { id: '20_29' as TemperatureRange, label: '20–29°C', desc: 'Mild' },
                  { id: '30_plus' as TemperatureRange, label: '30°C+', desc: 'Heat' }
                ].map((t) => {
                  const isSelected = activeTemp === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSetTemp(t.id)}
                      className={`py-1.5 px-1 text-center border rounded-xs transition-colors ${
                        isSelected
                          ? 'border-[#141413] bg-[#141413] text-white'
                          : 'border-[#D9CFC4] bg-[#FAF8F5] text-[#4A4742] hover:bg-[#F2EDE4]'
                      }`}
                    >
                      <div className="text-[10px] font-bold leading-tight">{decodeHtmlEntities(t.label)}</div>
                      <div className={`text-[8px] uppercase tracking-wider ${isSelected ? 'text-[#D4C9BC]' : 'text-[#8C8275]'}`}>
                        {t.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-[#7A7369] italic">
                Directly modulates layering density, footwear suitability, and rainproofing across all looks.
              </p>
            </div>

            {validationError && (
              <div
                role="alert"
                className="p-3 bg-[#FBF0EA] border border-[#EAC1AF] rounded-xs text-xs text-[#9C381E] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Submit & Shuffle Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                id="generate-recommendation-button"
                data-testid="generate-recommendation-button"
                aria-label="Generate Recommendation"
                title="Generate Recommendation"
                className="flex-1 py-3.5 text-xs tracking-wider uppercase font-semibold text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Recommendation</span>
              </button>

              <button
                type="button"
                id="shuffle-button"
                data-testid="shuffle-button"
                aria-label="Shuffle"
                onClick={handleShuffle}
                className="px-3.5 py-3.5 text-xs font-semibold text-[#141413] bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#D9CFC4] rounded-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                title="Shuffle valid alternative combinations"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            </div>
          </form>

          {/* Quick Preset Selector in Form */}
          <div className="pt-4 border-t border-[#F0EAE1]">
            <p className="text-[11px] uppercase tracking-wider text-[#8C8275] font-semibold mb-2">
              Or style a classic staple:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_GARMENTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2 py-1 text-[11px] bg-[#FAF8F5] border border-[#E2D8CC] hover:bg-[#F0EAE1] rounded-xs text-[#524E48] transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pro-Styling Tips Sidebar Widget */}
          <div id="pro-styling-tips-sidebar" className="pt-4 border-t border-[#F0EAE1]">
            <ProStylingTipsSidebar
              currentSeason={activeSeason}
              currentOccasion={activeOccasion}
              onSeasonChange={handleSetSeason}
              onOccasionChange={handleSetOccasion}
            />
          </div>
        </div>

        {/* Right Panel: Curated Recommendations Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Look Variation Selector Tabs */}
          <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              {recommendations.map((rec, idx) => (
                <button
                  key={rec.id || idx}
                  onClick={() => setActiveLookIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-all ${
                    activeLookIndex === idx
                      ? 'bg-[#141413] text-white font-semibold shadow-xs'
                      : 'bg-[#FAF8F5] text-[#5A554E] hover:bg-[#F2EDE4] border border-[#E8DFC8]'
                  }`}
                >
                  <span>Look {idx + 1}: {rec.title.replace('The ', '')}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <ProStylingTipsHoverCard
                currentSeason={activeSeason}
                currentOccasion={activeOccasion}
                onSeasonChange={handleSetSeason}
                onOccasionChange={handleSetOccasion}
                onOpenFullSidebar={() => {
                  const el = document.getElementById('pro-styling-tips-sidebar');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />

              <button
                type="button"
                id="shuffle-alternatives-button"
                data-testid="shuffle-alternatives-button"
                aria-label="Shuffle"
                onClick={handleShuffle}
                className="text-xs text-[#7A7369] hover:text-[#141413] inline-flex items-center gap-1.5 font-medium cursor-pointer transition-colors"
                title="Shuffle pieces for distinct valid alternatives"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>

          {/* Feedback banner for shuffling */}
          {shuffleFeedback && (
            <div
              role="status"
              className={`p-3 rounded-xs text-xs flex items-center justify-between gap-2 transition-all ${
                shuffleFeedback.type === 'no_alternatives'
                  ? 'bg-[#FFF8E7] border border-[#E8DFC8] text-[#856404]'
                  : 'bg-[#F2F7F2] border border-[#D2E3D2] text-[#285728]'
              }`}
            >
              <div className="flex items-center gap-2">
                {shuffleFeedback.type === 'no_alternatives' ? (
                  <Info className="w-4 h-4 shrink-0 text-[#B8860B]" />
                ) : (
                  <Sparkles className="w-4 h-4 shrink-0 text-[#3C763D]" />
                )}
                <span>{shuffleFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setShuffleFeedback(null)}
                className="text-[11px] font-medium underline opacity-80 hover:opacity-100 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeLook && (
            <div className="bg-white p-6 sm:p-8 rounded-xs border border-[#E8DFC8] shadow-xs space-y-6">
              {/* Look Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#F0EAE1] pb-5">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#8C8275] font-semibold mb-1">
                    {activeLook.aesthetic}
                  </div>
                  <h3 className="text-2xl font-serif text-[#141413]">
                    {decodeHtmlEntities(activeLook.title)}
                  </h3>
                  <p className="text-xs text-[#5A554E] mt-0.5">
                    {decodeHtmlEntities(activeLook.subtitle)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-[#FAF8F5] text-[#141413] border border-[#E5DACD] text-[10px] font-medium tracking-wide">
                      {OCCASIONS_DATA[activeLook.occasion]?.name || activeLook.occasion}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-[#FAF8F5] text-[#4A4742] border border-[#E5DACD] text-[10px] font-medium">
                      {getWeatherLabel(activeWeather)} · {getTemperatureLabel(activeTemp)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-[#FAF8F5] text-[#141413] border border-[#E5DACD] text-[10px] font-medium tracking-wide capitalize">
                      {activeSeason} Season
                    </span>
                    {activeLook.silhouetteName && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-[#FAF8F5] text-[#141413] border border-[#E5DACD] text-[10px] font-medium tracking-wide">
                        {activeLook.silhouetteName}
                      </span>
                    )}
                    {typeof activeLook.wardrobeMatchCount === 'number' && activeLook.wardrobeMatchCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#E8E2D9] text-[#3D3A34] text-[10px] font-semibold border border-[#D5CABE]">
                        <Check className="w-2.5 h-2.5 text-[#5A554E]" />
                        {activeLook.wardrobeMatchCount} from Your Wardrobe
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSaveToLookbook(activeLook)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xs border transition-colors ${
                      savedSuccessId === activeLook.id || isOutfitFavorited(activeLook.id)
                        ? 'bg-[#F2ECE1] border-[#141413] text-[#141413]'
                        : 'bg-white border-[#D9CFC4] text-[#141413] hover:bg-[#FAF8F5]'
                    }`}
                    title="Save to favorites lookbook"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        savedSuccessId === activeLook.id || isOutfitFavorited(activeLook.id)
                          ? 'fill-[#141413]'
                          : ''
                      }`}
                    />
                    <span>
                      {savedSuccessId === activeLook.id
                        ? 'Saved'
                        : isOutfitFavorited(activeLook.id)
                        ? 'Saved'
                        : 'Save Look'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleCopyOutfitRecipe(activeLook)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-[#D9CFC4] hover:bg-[#FAF8F5] rounded-xs text-[#4A4742] transition-colors"
                    title="Copy full outfit formula"
                  >
                    {copiedId === activeLook.id ? (
                      <Check className="w-3.5 h-3.5 text-[#2E6B4F]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">
                      {copiedId === activeLook.id ? 'Copied' : 'Copy'}
                    </span>
                  </button>

                  {onScheduleInCalendar && (
                    <button
                      onClick={() => onScheduleInCalendar(activeLook)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#141413] hover:bg-[#2B2926] text-white rounded-xs transition-colors shadow-2xs"
                      title="Schedule in Outfit Calendar"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Schedule</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Garment Ensemble Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#141413]">
                    Ensemble Components ({activeLook.pieces.length} Pieces)
                  </h4>
                  <span className="text-xs text-[#7A7369]">Sartorial Blueprint</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeLook.pieces.map((piece, pIdx) => {
                    const isCore = piece.role === 'Core Piece';
                    const pieceImage = isCore ? (uploadedImage || piece.imageUrl) : piece.imageUrl;

                    return (
                      <div
                        key={`${piece.category}-${piece.name}-${piece.colorHex}-${pIdx}`}
                        className={`p-4 rounded-xs border transition-all ${
                          isCore
                            ? 'bg-[#F9F6F0] border-[#D4C9BC] ring-1 ring-[#D4C9BC]'
                            : 'bg-[#FAF8F5] border-[#E8DFC8]'
                        }`}
                      >
                        <div className="flex gap-3.5 items-start">
                          {/* Visual thumbnail */}
                          <div className="w-16 h-16 shrink-0 rounded-xs overflow-hidden bg-[#EFE9DF]">
                            {pieceImage ? (
                              <img
                                src={pieceImage}
                                alt={piece.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <GarmentVisual
                                category={piece.category}
                                name={piece.name}
                                colorHex={piece.colorHex}
                                compact
                              />
                            )}
                          </div>

                          {/* Piece details */}
                          <div className="flex-1 min-w-0">
                            {/* Category and source tags */}
                            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] mb-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs bg-[#F4EFEA] text-[#6E665D] border border-[#E0D5C7] text-[9px] font-medium uppercase tracking-wider">
                                  {formatCategoryBadge(piece.category)}
                                </span>
                                {isCore && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs bg-[#FBF0E4] text-[#8C4A2F] border border-[#E8CDBB] text-[9px] font-semibold uppercase tracking-wider">
                                    Core Piece
                                  </span>
                                )}
                              </div>

                              <div>
                                {piece.sourceLabel === 'Uploaded Piece' ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-[#EAF2ED] text-[#2E6B4F] border border-[#C5DED0] text-[9px] font-semibold uppercase tracking-wider">
                                    Uploaded Photo
                                  </span>
                                ) : piece.isWardrobeOwned ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-[#E8E2D9] text-[#4A453E] border border-[#D5CABE] text-[9px] font-semibold uppercase tracking-wider">
                                    <Check className="w-2.5 h-2.5 text-[#5A554E]" /> In Wardrobe
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-[#FAF8F5] text-[#8C8275] border border-[#E8DFC8] text-[9px] font-semibold uppercase tracking-wider">
                                    Curated Catalog
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="font-semibold text-sm text-[#141413] truncate" title={piece.name}>
                              {piece.name}
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                              <span
                                className="w-2 h-2 rounded-full border border-black/15 shrink-0"
                                style={{ backgroundColor: piece.colorHex }}
                              />
                              <span className="text-[#7A7369]">{piece.colorName}</span>
                            </div>

                            <p className="text-xs text-[#5A554E] mt-1 line-clamp-2">
                              {piece.description}
                            </p>

                            <p className="text-[11px] text-[#7A7369] italic mt-1.5 border-t border-[#E8DFC8]/50 pt-1">
                              Tip: {piece.stylingTip}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Color Balance & Metal Tone Banner */}
              <div className="bg-[#FAF8F5] p-5 rounded-xs border border-[#E5DACD] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#8C8275] font-semibold">
                      Color Harmony Engine
                    </span>
                    <h5 className="text-sm font-semibold text-[#141413]">
                      {activeLook.colorHarmony.name}
                    </h5>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {activeLook.colorHarmony.hexes.map((hex, hIdx) => (
                        <span
                          key={hIdx}
                          className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => onExploreColorInStudio(selectedColor)}
                      className="text-xs text-[#141413] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Explore in Color Studio</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#5A554E]">
                  {activeLook.colorHarmony.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8DFC8]">
                  <div className="text-xs">
                    <span className="font-medium text-[#141413]">Curated Metal Finish: </span>
                    <span className="text-[#5A554E]">{activeLook.recommendedMetal}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium text-[#141413]">Fabric Texture Contrast: </span>
                    <span className="text-[#5A554E]">{activeLook.textureTip}</span>
                  </div>
                </div>
              </div>

              {/* Stylist Rationale & Golden Rule */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#141413]">
                  Editorial Stylist Notes
                </div>
                <div className="p-4 bg-[#F5EFE6] border border-[#E2D8CC] rounded-xs space-y-2">
                  <p className="text-xs sm:text-sm text-[#4A4742] leading-relaxed">
                    {decodeHtmlEntities(activeLook.stylistRationale)}
                  </p>
                  <div className="text-xs text-[#8C4A2F] font-medium pt-2 border-t border-[#E8DEC9]">
                    Rule: {decodeHtmlEntities(activeLook.proStylistRule)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};