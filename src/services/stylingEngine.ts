import { FASHION_COLORS, FASHION_STYLES, OCCASIONS_DATA } from '../data/fashionData';
import {
  FashionColor,
  FashionStyle,
  GarmentCategory,
  Occasion,
  Season,
  OutfitPiece,
  OutfitRecommendation,
  TemperatureRange,
  WardrobeItem,
  WeatherCondition
} from '../types';
import { enrichOutfitWithRealDerivations } from './outfitDerivations';
import { getTemperatureLabel, getWeatherLabel, validateOutfitWeatherRules } from './weatherStylingEngine';
import { decodeHtmlEntities } from './textSanitizer';

export interface StylingRequest {
  coreName: string;
  category: GarmentCategory;
  specificType: string;
  colorHex: string;
  colorName: string;
  style: FashionStyle;
  occasion: Occasion;
  season?: Season;
  weather?: WeatherCondition;
  temperature?: TemperatureRange;
  imageUrl?: string;
  isUploaded?: boolean;
  isColorConfirmed?: boolean;
  wardrobeItemId?: string;
  wardrobe?: WardrobeItem[];
  seed?: number;
}

export function generateOutfitRecommendations(request: StylingRequest): OutfitRecommendation[] {
  const {
    coreName,
    category,
    specificType,
    colorHex,
    colorName,
    style,
    occasion,
    weather = 'sunny',
    temperature = '20_29',
    imageUrl,
    isUploaded = false,
    wardrobeItemId,
    wardrobe = [],
    seed = 0
  } = request;

  // Identify matching fashion color in our palette or find the closest
  const baseColor = findClosestFashionColor(colorHex, colorName);
  const metalTone = determineMetalTone(baseColor);

  const usedWardrobeIds1 = new Set<string>();
  if (wardrobeItemId) usedWardrobeIds1.add(wardrobeItemId);
  const usedWardrobeIds2 = new Set<string>();
  if (wardrobeItemId) usedWardrobeIds2.add(wardrobeItemId);
  const usedWardrobeIds3 = new Set<string>();
  if (wardrobeItemId) usedWardrobeIds3.add(wardrobeItemId);

  const rawLooks: OutfitRecommendation[] = [
    createSignatureLook(request, baseColor, metalTone, wardrobe, weather, temperature, usedWardrobeIds1, seed),
    createContemporaryLook(request, baseColor, metalTone, wardrobe, weather, temperature, usedWardrobeIds2, seed),
    createTonalLuxeLook(request, baseColor, metalTone, wardrobe, weather, temperature, usedWardrobeIds3, seed)
  ];

  return rawLooks.map((look, index) => {
    let wardrobeCount = 0;
    let catalogCount = 0;

    const pieces = look.pieces.map((p, pIdx) => {
      // Piece 0 is the user's Core Piece (either uploaded or selected from wardrobe/catalog)
      if (pIdx === 0) {
        if (isUploaded) {
          return {
            ...p,
            imageUrl: imageUrl || p.imageUrl,
            sourceLabel: 'Uploaded Piece' as const,
            isWardrobeOwned: false
          };
        }
        if (p.isWardrobeOwned || wardrobeItemId || wardrobe.some(w => w.id === p.wardrobeItemId || w.name === p.name)) {
          wardrobeCount++;
          return {
            ...p,
            imageUrl: imageUrl || p.imageUrl,
            wardrobeItemId: wardrobeItemId || p.wardrobeItemId,
            sourceLabel: 'From Your Wardrobe' as const,
            isWardrobeOwned: true
          };
        }
        catalogCount++;
        return {
          ...p,
          sourceLabel: 'Curated Catalog' as const,
          isWardrobeOwned: false
        };
      }

      // Complementary pieces
      const isOwned = p.isWardrobeOwned ?? false;
      if (isOwned) {
        wardrobeCount++;
        return {
          ...p,
          isWardrobeOwned: true,
          sourceLabel: 'From Your Wardrobe' as const
        };
      } else {
        catalogCount++;
        return {
          ...p,
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog' as const
        };
      }
    });

    const silhouetteTitles = [
      'Signature Tailored Silhouette',
      'Relaxed Contemporary Silhouette',
      'Monochromatic Drape Silhouette'
    ];

    const weatherBadge = `${getWeatherLabel(weather)} · ${getTemperatureLabel(temperature)}`;

    const enriched = enrichOutfitWithRealDerivations(
      {
        ...look,
        pieces,
        silhouetteName: look.silhouetteName || silhouetteTitles[index % silhouetteTitles.length],
        wardrobeMatchCount: wardrobeCount,
        catalogMatchCount: catalogCount,
        weatherCompatibility: {
          condition: weather,
          temperature,
          badge: weatherBadge
        }
      },
      weather,
      temperature
    );

    return enriched;
  });
}

function findClosestFashionColor(hex: string, name: string): FashionColor {
  const cleanHex = hex.trim().toLowerCase();
  const cleanName = name.trim().toLowerCase();

  const found = FASHION_COLORS.find(
    (c) => c.hex.toLowerCase() === cleanHex || c.name.toLowerCase() === cleanName
  );
  if (found) return found;

  const foundByNameWord = FASHION_COLORS.find(c =>
    cleanName.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(cleanName)
  );
  if (foundByNameWord) return foundByNameWord;

  return FASHION_COLORS[0];
}

function determineMetalTone(
  color: FashionColor
): 'Warm Gold' | 'Cool Silver' | 'Rose Gold' | 'Mixed Metallics' {
  if (color.undertone === 'warm') return 'Warm Gold';
  if (color.undertone === 'cool') return 'Cool Silver';
  if (color.family === 'earth') return 'Warm Gold';
  if (color.family === 'jewel') return 'Warm Gold';
  return 'Mixed Metallics';
}

function pickSeededItem<T>(items: T[], seed: number, offset: number = 0): T {
  if (items.length === 0) {
    throw new Error('Candidate item list cannot be empty');
  }
  // Multiplicative dispersion ensures incrementing seeds step through items without modulo resonances
  const hash = Math.abs((seed + 1) * 7919 + offset * 31337);
  const index = hash % items.length;
  return items[index];
}

function buildCorePiece(
  req: StylingRequest,
  weather: WeatherCondition,
  temp: TemperatureRange
): OutfitPiece {
  const isWardrobeOwned = !req.isUploaded && Boolean(
    req.wardrobeItemId || req.wardrobe?.some((w) => w.id === req.wardrobeItemId || w.name === req.coreName)
  );

  const sourceLabel = req.isUploaded
    ? 'Uploaded Piece'
    : isWardrobeOwned
      ? 'From Your Wardrobe'
      : 'Curated Catalog';

  const isColorConfirmed = req.isUploaded ? (req.isColorConfirmed ?? false) : true;

  return {
    category: req.category,
    name: decodeHtmlEntities(req.coreName),
    colorName: decodeHtmlEntities(req.colorName),
    colorHex: req.colorHex,
    role: 'Core Piece',
    imageUrl: req.imageUrl,
    wardrobeItemId: req.wardrobeItemId,
    sourceLabel,
    isWardrobeOwned,
    isColorConfirmed,
    description: req.isUploaded
      ? (isColorConfirmed
          ? `Your uploaded ${decodeHtmlEntities(req.coreName)} in ${decodeHtmlEntities(req.colorName)} serves as the anchored foundational piece.`
          : `Your uploaded ${decodeHtmlEntities(req.coreName)} serves as the anchored foundational piece.`)
      : req.specificType
        ? `Your featured ${req.specificType} serves as the foundational silhouette anchor.`
        : `Your selected ${decodeHtmlEntities(req.coreName)} anchors the ensemble.`,
    stylingTip: getCorePieceStylingTip(req.category, req.specificType, weather, temp)
  };
}

function getCorePieceStylingTip(
  category: GarmentCategory,
  specificType: string,
  weather: WeatherCondition,
  temp: TemperatureRange
): string {
  const isHot = temp === '30_plus';
  const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');

  if (category === 'tops') {
    if (isHot) {
      return 'Wear untucked or with an effortless half-tuck to facilitate cooling airflow.';
    }
    if (isCold) {
      return 'Tuck cleanly into high-waisted bottoms to lock in core body temperature.';
    }
    return 'Tuck neatly into the waistband to establish clear vertical proportions.';
  }

  if (category === 'bottoms') {
    if (isHot) {
      return 'Select lightweight, fluid drape that clears footwear cleanly.';
    }
    return 'Ensure the center crease breaks slightly over footwear for clean line elongation.';
  }

  if (category === 'outerwear') {
    if (weather === 'rainy') {
      return 'Fasten storm flaps and belt securely to repel wet precipitation.';
    }
    if (isHot) {
      return 'Drape unbuttoned over shoulders for light transitional coverage.';
    }
    return 'Fasten waist belt or leave unbuttoned to reveal interior color coordination.';
  }

  if (category === 'one_piece') {
    return 'Let the silhouette drape fluidly without competing waist accessories.';
  }

  return 'Ground the outfit with clean visual posture.';
}

// ----------------------------------------------------------------------------
// WARDROBE COMPATIBILITY FINDER & UNIFIED SEED ROTATION POOL
// ----------------------------------------------------------------------------

function getMatchingWardrobePieces(
  targetCategory: GarmentCategory,
  occasion: Occasion,
  weather: WeatherCondition,
  temperature: TemperatureRange,
  wardrobe: WardrobeItem[],
  excludedIds: Set<string>,
  variation: 'classic' | 'contemporary' | 'tonal',
  baseColor?: FashionColor
): OutfitPiece[] {
  const isHot = temperature === '30_plus';
  const isCold = temperature === 'below_10' || (weather === 'cold' && temperature !== '30_plus' && temperature !== '20_29');
  const isRain = weather === 'rainy';

  const candidates = wardrobe.filter((w) => {
    if (w.category !== targetCategory) return false;
    if (excludedIds.has(w.id)) return false;
    if (!w.occasions.includes(occasion)) return false;

    const txt = `${w.name} ${w.specificType} ${w.notes || ''}`.toLowerCase();

    // Weather exclusions
    if (isRain && txt.includes('suede')) return false;

    if (isHot) {
      if (
        txt.includes('heavy wool') ||
        txt.includes('flannel') ||
        txt.includes('cashmere') ||
        txt.includes('fleece') ||
        txt.includes('turtleneck') ||
        txt.includes('melton') ||
        txt.includes('down')
      ) {
        return false;
      }
      if (targetCategory === 'outerwear' && !isRain) return false;
    }

    if (isCold) {
      if (
        txt.includes('shorts') ||
        txt.includes('linen shorts') ||
        txt.includes('sandals') ||
        txt.includes('slides') ||
        txt.includes('tank top') ||
        txt.includes('sleeveless') ||
        txt.includes('camisole')
      ) {
        return false;
      }
    }

    return true;
  });

  if (candidates.length === 0) return [];

  let sortedCandidates = candidates;
  if (variation === 'tonal' && baseColor) {
    const tonal = candidates.filter(c => {
      const cColor = c.colorName.toLowerCase();
      return (
        cColor.includes(baseColor.name.toLowerCase()) ||
        cColor.includes(baseColor.family.toLowerCase())
      );
    });
    if (tonal.length > 0) {
      sortedCandidates = [...tonal, ...candidates.filter(c => !tonal.includes(c))];
    }
  }

  const roleMap: Record<GarmentCategory, OutfitPiece['role']> = {
    tops: 'Essential Top',
    bottoms: 'Essential Bottom',
    outerwear: 'Complementary Layer',
    footwear: 'Footwear Anchor',
    accessories: 'Accent Accessory',
    bags: 'Statement Bag',
    weather_protection: 'Accent Accessory',
    one_piece: 'Core Piece'
  };

  return sortedCandidates.map((selected) => ({
    category: selected.category,
    name: selected.name,
    colorName: selected.colorName,
    colorHex: selected.colorHex,
    role: roleMap[selected.category] || 'Complementary Layer',
    isWardrobeOwned: true,
    sourceLabel: 'From Your Wardrobe',
    imageUrl: selected.imageUrl,
    wardrobeItemId: selected.id,
    description: `From your wardrobe: ${selected.specificType}.`,
    stylingTip: 'Complements your core piece with established personal staples.'
  }));
}

function selectPieceFromPool(
  catalogOptions: OutfitPiece[],
  wardrobePieces: OutfitPiece[],
  seed: number,
  varOffset: number,
  excludedWardrobeIds: Set<string>
): OutfitPiece {
  const pool = [...wardrobePieces, ...catalogOptions];
  const chosen = pickSeededItem(pool, seed, varOffset);
  if (chosen.isWardrobeOwned && chosen.wardrobeItemId) {
    excludedWardrobeIds.add(chosen.wardrobeItemId);
  }
  return chosen;
}

function selectOuterwearFromPool(
  catalogOptions: OutfitPiece[],
  wardrobePieces: OutfitPiece[],
  seed: number,
  varOffset: number,
  excludedWardrobeIds: Set<string>
): OutfitPiece | null {
  const pool = [...wardrobePieces, ...catalogOptions];
  if (pool.length === 0) return null;
  const chosen = pickSeededItem(pool, seed, varOffset);
  if (chosen.isWardrobeOwned && chosen.wardrobeItemId) {
    excludedWardrobeIds.add(chosen.wardrobeItemId);
  }
  return chosen;
}

function findWardrobeMatch(
  targetCategory: GarmentCategory,
  occasion: Occasion,
  weather: WeatherCondition,
  temperature: TemperatureRange,
  wardrobe: WardrobeItem[],
  excludedIds: Set<string>,
  variation: 'classic' | 'contemporary' | 'tonal',
  baseColor?: FashionColor,
  seed: number = 0
): OutfitPiece | null {
  const pieces = getMatchingWardrobePieces(targetCategory, occasion, weather, temperature, wardrobe, excludedIds, variation, baseColor);
  if (pieces.length === 0) return null;
  const chosen = pickSeededItem(pieces, seed, variation === 'classic' ? 0 : variation === 'contemporary' ? 1 : 2);
  if (chosen.isWardrobeOwned && chosen.wardrobeItemId) {
    excludedIds.add(chosen.wardrobeItemId);
  }
  return chosen;
}

// ----------------------------------------------------------------------------
// LOOK BUILDERS
// ----------------------------------------------------------------------------

function createSignatureLook(
  req: StylingRequest,
  baseColor: FashionColor,
  metalTone: 'Warm Gold' | 'Cool Silver' | 'Rose Gold' | 'Mixed Metallics',
  wardrobe: WardrobeItem[],
  weather: WeatherCondition,
  temperature: TemperatureRange,
  usedWardrobeIds: Set<string>,
  seed: number
): OutfitRecommendation {
  const pieces: OutfitPiece[] = [buildCorePiece(req, weather, temperature)];

  // Assemble complementary components based on core garment category
  if (req.category === 'tops') {
    pieces.push(getMatchingBottom(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed));
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  } else if (req.category === 'bottoms') {
    pieces.push(getMatchingTop(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed));
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  } else if (req.category === 'one_piece') {
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  } else if (req.category === 'outerwear') {
    pieces.push(getMatchingTop(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed));
    pieces.push(getMatchingBottom(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed));
  } else {
    pieces.push(getMatchingTop(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed));
    pieces.push(getMatchingBottom(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed));
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  }

  // Add footwear if core is not footwear
  if (req.category !== 'footwear') {
    pieces.push(getMatchingFootwear(req.occasion, req.style, baseColor, 'classic', wardrobe, weather, temperature, usedWardrobeIds, seed));
  }

  // Accessories
  const accessories = getMatchingAccessories(req.occasion, req.style, baseColor, 'classic', metalTone, weather, temperature, seed);
  pieces.push(...accessories);

  const neutralAnchorHex = baseColor.bestNeutrals[0] || '#161617';

  return {
    id: `look-signature-${Date.now()}-${seed}`,
    title: 'The Signature Ensemble',
    subtitle: 'Timeless Sartorial Harmony',
    aesthetic: `${FASHION_STYLES[req.style]?.name || 'Classic'} · ${OCCASIONS_DATA[req.occasion]?.formalityLevel}`,
    occasion: req.occasion,
    style: req.style,
    corePieceName: req.coreName,
    corePieceCategory: req.category,
    corePieceColor: req.colorName,
    pieces,
    colorHarmony: {
      name: 'Balanced Complementary & Grounded Neutrals',
      description: `60% primary ${req.colorName}, 30% structural neutral, and 10% high-intent accent tones.`,
      hexes: [req.colorHex, neutralAnchorHex, baseColor.complementaryHex, '#F7F4EE']
    },
    recommendedMetal: metalTone,
    stylistRationale: `This ensemble balances the presence of ${req.coreName} with quiet structural counterweights. By anchoring ${req.colorName} against refined neutrals and subtle hardware, your look communicates deliberate taste without visual clutter.`,
    proStylistRule: 'The Foundational Balance Rule: Grounding your core piece with refined neutral coordinates keeps the focal silhouette deliberate and refined.',
    textureTip: 'Contrast smooth surfaces with tactile weaves for clean textural depth.',
    formalityScore: req.occasion === 'wedding_guest' ? 9 : req.occasion === 'office' ? 8 : req.occasion === 'party' ? 8 : req.occasion === 'date_night' ? 7 : 5
  };
}

function createContemporaryLook(
  req: StylingRequest,
  baseColor: FashionColor,
  metalTone: 'Warm Gold' | 'Cool Silver' | 'Rose Gold' | 'Mixed Metallics',
  wardrobe: WardrobeItem[],
  weather: WeatherCondition,
  temperature: TemperatureRange,
  usedWardrobeIds: Set<string>,
  seed: number
): OutfitRecommendation {
  const pieces: OutfitPiece[] = [buildCorePiece(req, weather, temperature)];

  if (req.category === 'tops') {
    pieces.push(getMatchingBottom(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed));
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  } else if (req.category === 'bottoms') {
    pieces.push(getMatchingTop(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed));
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  } else if (req.category === 'one_piece') {
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  } else if (req.category === 'outerwear') {
    pieces.push(getMatchingTop(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed));
    pieces.push(getMatchingBottom(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed));
  } else {
    pieces.push(getMatchingTop(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed));
    pieces.push(getMatchingBottom(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed));
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  }

  if (req.category !== 'footwear') {
    pieces.push(getMatchingFootwear(req.occasion, req.style, baseColor, 'contemporary', wardrobe, weather, temperature, usedWardrobeIds, seed));
  }

  const accessories = getMatchingAccessories(req.occasion, req.style, baseColor, 'contemporary', metalTone, weather, temperature, seed);
  pieces.push(...accessories);

  return {
    id: `look-contemporary-${Date.now() + 1}-${seed}`,
    title: 'The Contemporary Twist',
    subtitle: 'Modern Proportions & Architectural Contrast',
    aesthetic: 'Modern High-Low · Editorial Proportions',
    occasion: req.occasion,
    style: req.style,
    corePieceName: req.coreName,
    corePieceCategory: req.category,
    corePieceColor: req.colorName,
    pieces,
    colorHarmony: {
      name: 'Dynamic High-Contrast Tension',
      description: 'Pairs high-key luminosity with deep anchors to create architectural visual interest.',
      hexes: [req.colorHex, '#161617', '#C19A6B', '#A5C4D4']
    },
    recommendedMetal: metalTone,
    stylistRationale: `Injects modern dynamism by pairing tailored structure with relaxed architectural lines. Mixing structured tailoring with subtle casual ease brings an authentic "off-duty editor" mood.`,
    proStylistRule: 'The Proportional Tension Rule: Juxtaposing structured tailoring with relaxed complementary pieces brings fresh architectural dimension to classic staples.',
    textureTip: 'Pair crisp geometric lines with fluid matte draping to prevent the silhouette from appearing rigid.',
    formalityScore: req.occasion === 'wedding_guest' ? 8 : req.occasion === 'office' ? 7 : 6
  };
}

function createTonalLuxeLook(
  req: StylingRequest,
  baseColor: FashionColor,
  metalTone: 'Warm Gold' | 'Cool Silver' | 'Rose Gold' | 'Mixed Metallics',
  wardrobe: WardrobeItem[],
  weather: WeatherCondition,
  temperature: TemperatureRange,
  usedWardrobeIds: Set<string>,
  seed: number
): OutfitRecommendation {
  const pieces: OutfitPiece[] = [buildCorePiece(req, weather, temperature)];

  if (req.category === 'tops') {
    pieces.push(getMatchingBottom(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed));
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  } else if (req.category === 'bottoms') {
    pieces.push(getMatchingTop(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed));
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  } else if (req.category === 'one_piece') {
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  } else if (req.category === 'outerwear') {
    pieces.push(getMatchingTop(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed));
    pieces.push(getMatchingBottom(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed));
  } else {
    pieces.push(getMatchingTop(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed));
    pieces.push(getMatchingBottom(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed));
    const outer = getMatchingOuterwear(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed);
    if (outer) pieces.push(outer);
  }

  if (req.category !== 'footwear') {
    pieces.push(getMatchingFootwear(req.occasion, req.style, baseColor, 'tonal', wardrobe, weather, temperature, usedWardrobeIds, seed));
  }

  const accessories = getMatchingAccessories(req.occasion, req.style, baseColor, 'tonal', metalTone, weather, temperature, seed);
  pieces.push(...accessories);

  const tonalSwatches = baseColor.monochromaticHexes.slice(0, 4);

  return {
    id: `look-tonal-${Date.now() + 2}-${seed}`,
    title: 'Monochromatic Tonal Luxe',
    subtitle: 'Quiet Luxury & Rich Tactile Depth',
    aesthetic: 'Tone-on-Tone · Monochromatic Mastery',
    occasion: req.occasion,
    style: req.style,
    corePieceName: req.coreName,
    corePieceCategory: req.category,
    corePieceColor: req.colorName,
    pieces,
    colorHarmony: {
      name: 'Monochromatic Gradient Spectrum',
      description: `Layered shades of ${baseColor.name} varying subtly in lightness and saturation.`,
      hexes: tonalSwatches.length >= 4 ? tonalSwatches : [req.colorHex, '#FAF7F2', '#E8E2D9', '#2E2D2B']
    },
    recommendedMetal: metalTone,
    stylistRationale: `Monochromatic dressing elongates the silhouette and communicates immense sartorial confidence. By relying on varying fiber weights rather than hue shifts, the ensemble radiates quiet luxury.`,
    proStylistRule: 'The Monochromatic Column Rule: Continuing cohesive tonal values throughout your silhouette elongates vertical proportions without visual breaks.',
    textureTip: 'Ensure one layer catches the light (silk or leather) while adjacent layers absorb light (wool or matte twill).',
    formalityScore: req.occasion === 'wedding_guest' ? 9 : req.occasion === 'office' ? 8 : 7
  };
}

// ----------------------------------------------------------------------------
// COMPONENT BUILDERS (CALIBRATED FOR WEATHER, OCCASION, & SEED)
// ----------------------------------------------------------------------------

function getMatchingTop(
  occasion: Occasion,
  style: FashionStyle,
  baseColor: FashionColor,
  variation: 'classic' | 'contemporary' | 'tonal',
  wardrobe: WardrobeItem[],
  weather: WeatherCondition,
  temperature: TemperatureRange,
  excludedWardrobeIds: Set<string>,
  seed: number
): OutfitPiece {
  // Check wardrobe pieces with seeded rotation pool
  const wardrobeTops = getMatchingWardrobePieces('tops', occasion, weather, temperature, wardrobe, excludedWardrobeIds, variation, baseColor);

  const isHot = temperature === '30_plus';
  const isCold = temperature === 'below_10' || (weather === 'cold' && temperature !== '30_plus' && temperature !== '20_29');
  const varOffset = variation === 'classic' ? 0 : variation === 'contemporary' ? 1 : 2;

  // Tonal options
  if (variation === 'tonal') {
    const toneHex1 = baseColor.monochromaticHexes[1] || '#F7F4EE';
    const toneHex2 = baseColor.monochromaticHexes[0] || baseColor.hex;
    const toneHex3 = baseColor.monochromaticHexes[2] || '#4A4E57';

    if (isHot) {
      const hotTonalOptions: OutfitPiece[] = [
        {
          category: 'tops',
          name: `Airy Open-Weave Cotton-Linen Knit in ${baseColor.name}`,
          colorName: baseColor.name,
          colorHex: toneHex1,
          role: 'Essential Top',
          description: 'Open-stitch breathable natural fiber knit that facilitates air movement in warm climates.',
          stylingTip: 'Tuck loosely into waistband to accentuate relaxed proportions.'
        },
        {
          category: 'tops',
          name: `Short-Sleeve Washed Silk Shirt in ${baseColor.name}`,
          colorName: baseColor.name,
          colorHex: toneHex2,
          role: 'Essential Top',
          description: 'Matte washed silk with a fluid drape that rests lightly on the skin without clinging.',
          stylingTip: 'Leave top collar button undone for refined heat-resistant styling.'
        },
        {
          category: 'tops',
          name: `Fine Tencel Cap-Sleeve Shell in ${baseColor.name}`,
          colorName: baseColor.name,
          colorHex: toneHex1,
          role: 'Essential Top',
          description: 'Smooth cellulosic fiber top with architectural cap sleeves and clean finished hem.',
          stylingTip: 'Pairs with high-waisted bottoms to create an elongated monochrome column.'
        }
      ];
      return selectPieceFromPool(hotTonalOptions, wardrobeTops, seed, varOffset, excludedWardrobeIds);
    }

    if (isCold) {
      const coldTonalOptions: OutfitPiece[] = [
        {
          category: 'tops',
          name: `Fine Ribbed ${baseColor.name} Turtleneck`,
          colorName: baseColor.name,
          colorHex: toneHex1,
          role: 'Essential Top',
          description: 'Second-skin fine merino wool knit that forms a sleek tonal base layer.',
          stylingTip: 'Tuck cleanly into the waistband to accentuate vertical proportion.'
        },
        {
          category: 'tops',
          name: `Substantial Cashmere Mock-Neck in ${baseColor.name}`,
          colorName: baseColor.name,
          colorHex: toneHex3,
          role: 'Essential Top',
          description: 'Pure Mongolian cashmere knit offering warm thermal insulation with clean lines.',
          stylingTip: 'Half-tuck into structured trousers for a relaxed architectural break.'
        },
        {
          category: 'tops',
          name: `Dense Milanese-Knit High-Neck Top in ${baseColor.name}`,
          colorName: baseColor.name,
          colorHex: toneHex2,
          role: 'Essential Top',
          description: 'Heavy gauge structured knit engineered for wind resistance and warmth.',
          stylingTip: 'Forms a cohesive monochromatic thermal foundation under your outer layer.'
        }
      ];
      return selectPieceFromPool(coldTonalOptions, wardrobeTops, seed, varOffset, excludedWardrobeIds);
    }

    const temperateTonalOptions: OutfitPiece[] = [
      {
        category: 'tops',
        name: `Fluid Silk Charmeuse Blouse in ${baseColor.name}`,
        colorName: baseColor.name,
        colorHex: toneHex1,
        role: 'Essential Top',
        description: 'Lustrous silk blouse with concealed buttons that reflects ambient light subtly.',
        stylingTip: 'Tuck into tailored bottoms for a sophisticated tone-on-tone gradient.'
      },
      {
        category: 'tops',
        name: `Fine-Gauge Merino Crewneck in ${baseColor.name}`,
        colorName: baseColor.name,
        colorHex: toneHex2,
        role: 'Essential Top',
        description: 'Ultra-soft lightweight merino wool with micro-rib trim at the neck and cuffs.',
        stylingTip: 'Wear solo or layer smoothly beneath tailoring.'
      },
      {
        category: 'tops',
        name: `Structured Cotton-Poplin Shirt in ${baseColor.name}`,
        colorName: baseColor.name,
        colorHex: toneHex1,
        role: 'Essential Top',
        description: 'Crisp high-thread poplin with clean French cuffs in a tonal shade.',
        stylingTip: 'Fasten fully to the collar for an editorial monochromatic statement.'
      }
    ];
    return selectPieceFromPool(temperateTonalOptions, wardrobeTops, seed, varOffset, excludedWardrobeIds);
  }

  // Hot weather options (30°C+)
  if (isHot) {
    if (occasion === 'office') {
      const officeHotTops: OutfitPiece[] = [
        {
          category: 'tops',
          name: 'Crisp Short-Sleeve Egyptian Cotton Poplin Shirt',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Essential Top',
          description: 'Lightweight high-thread-count poplin with structured collar and tailored short sleeves.',
          stylingTip: 'Tuck cleanly into trousers for polished elegance without heat retention.'
        },
        {
          category: 'tops',
          name: 'Concealed-Placket Short-Sleeve Tencel Shirt',
          colorName: 'Muted Sage',
          colorHex: '#9BA899',
          role: 'Essential Top',
          description: 'Smooth cellulosic fiber with clean hidden buttons and cooling drape.',
          stylingTip: 'Leave the top button undone for refined warm-weather tailoring.'
        },
        {
          category: 'tops',
          name: 'Breathable Cotton-Silk Knit Polo',
          colorName: 'Chalk White',
          colorHex: '#FAF7F2',
          role: 'Essential Top',
          description: 'Fine 18-gauge knit with neat collar stand offering cooling airflow.',
          stylingTip: 'Fasten all buttons for clean architectural symmetry.'
        },
        {
          category: 'tops',
          name: 'Tailored Cap-Sleeve Linen-Cotton Blouse',
          colorName: 'French Sky Blue',
          colorHex: '#A5C4D4',
          role: 'Essential Top',
          description: 'Crisp blended weave with subtle boat neckline and clean side slits.',
          stylingTip: 'Wear with pressed trousers for executive hot-weather ease.'
        }
      ];
      return selectPieceFromPool(officeHotTops, wardrobeTops, seed, varOffset, excludedWardrobeIds);
    }

    if (occasion === 'party' || occasion === 'date_night') {
      const eveningHotTops: OutfitPiece[] = [
        {
          category: 'tops',
          name: 'Bias-Cut Silk Camisole',
          colorName: 'Champagne Ivory',
          colorHex: '#F7F4EE',
          role: 'Essential Top',
          description: 'Delicate scoop neckline cut on the bias in lustrous washed silk.',
          stylingTip: 'Pairs with high-waisted fluid trousers for effortless summer evening style.'
        },
        {
          category: 'tops',
          name: 'Draped Asymmetric Silk Chiffon Top',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Essential Top',
          description: 'Bias-draped neckline with fluid diagonal hemlines for modern evening allure.',
          stylingTip: 'Balances wide trousers with sculptural upper asymmetry.'
        },
        {
          category: 'tops',
          name: 'Lustrous Charmeuse Square-Neck Halter',
          colorName: 'Rich Bronze',
          colorHex: '#8C6239',
          role: 'Essential Top',
          description: 'Clean backless halter silhouette crafted from liquid-drape silk charmeuse.',
          stylingTip: 'Leave collar unembellished to spotlight the neckline cut.'
        }
      ];
      return selectPieceFromPool(eveningHotTops, wardrobeTops, seed, varOffset, excludedWardrobeIds);
    }

    // Casual / other hot
    const casualHotTops: OutfitPiece[] = [
      {
        category: 'tops',
        name: 'Breezy Linen Band-Collar Shirt',
        colorName: 'Chalk White',
        colorHex: '#F7F4EE',
        role: 'Essential Top',
        description: 'Pure washed linen with clean mandarin collar for warm-weather breathability.',
        stylingTip: 'Wear untucked with sleeves rolled loosely to the forearm.'
      },
      {
        category: 'tops',
        name: 'Relaxed Camp-Collar Washed Tencel Shirt',
        colorName: 'Sandstone Tan',
        colorHex: '#D8C4B6',
        role: 'Essential Top',
        description: 'Fluid drape with architectural Cuban collar engineered for maximum ventilation.',
        stylingTip: 'Wear unbuttoned over a light tank or fastened loosely.'
      },
      {
        category: 'tops',
        name: 'Lightweight Slub Cotton Crewneck Tee',
        colorName: 'Ivory Cream',
        colorHex: '#FAF7F2',
        role: 'Essential Top',
        description: '160gsm organic combed cotton with natural textured slub that lets air pass freely.',
        stylingTip: 'Half-tuck in front for effortless casual posture.'
      },
      {
        category: 'tops',
        name: 'Open-Weave Cotton Resort Shirt',
        colorName: 'Ecru Stone',
        colorHex: '#E8E2D9',
        role: 'Essential Top',
        description: 'Textured geometric weave that creates micro-ventilation channels in high heat.',
        stylingTip: 'Leave unfastened over summer bottoms.'
      }
    ];
    return selectPieceFromPool(casualHotTops, wardrobeTops, seed, varOffset, excludedWardrobeIds);
  }

  // Cold weather options (<10°C)
  if (isCold) {
    if (occasion === 'office') {
      const officeColdTops: OutfitPiece[] = [
        {
          category: 'tops',
          name: 'Dense 4-Ply Cashmere Crewneck',
          colorName: 'Charcoal Heather',
          colorHex: '#4A4E57',
          role: 'Essential Top',
          description: 'Substantial Scottish cashmere offering thermal insulation in cold conditions.',
          stylingTip: 'Forms a warm, streamlined foundation under tailored outer layers.'
        },
        {
          category: 'tops',
          name: 'Architectural Mock-Neck Heavy Ribbed Knit',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Essential Top',
          description: 'Chunky dense ribbing with a high sculpted collar for modern winter warmth.',
          stylingTip: 'Balances wide-leg heavy trousers with sculpted upper structure.'
        },
        {
          category: 'tops',
          name: 'Fine Merino Wool Turtleneck',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Top',
          description: 'Pure 100% merino wool that layers cleanly under winter coats without bulk.',
          stylingTip: 'Tuck cleanly into wool trousers to lock in core warmth.'
        },
        {
          category: 'tops',
          name: 'Structured Milanese-Knit High-Neck Top',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Essential Top',
          description: 'Dense double-knit merino wool offering substantial wind blocking.',
          stylingTip: 'Fasten sleek leather belt over waistband.'
        }
      ];
      return selectPieceFromPool(officeColdTops, wardrobeTops, seed, varOffset, excludedWardrobeIds);
    }

    if (occasion === 'party' || occasion === 'date_night') {
      const eveningColdTops: OutfitPiece[] = [
        {
          category: 'tops',
          name: 'Fine-Ribbed Silk-Cashmere Turtleneck',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Essential Top',
          description: 'Lustrous second-skin blend with refined shimmer under evening lights.',
          stylingTip: 'Frame with structured tailoring or heavy statement necklace.'
        },
        {
          category: 'tops',
          name: 'Sculpted Sweetheart-Neck Ribbed Wool Top',
          colorName: 'Deep Burgundy',
          colorHex: '#5C1D24',
          role: 'Essential Top',
          description: 'Compact-knit merino wool featuring a sculpted neckline and long tailored sleeves.',
          stylingTip: 'Pairs with high-waisted wool or leather trousers.'
        },
        {
          category: 'tops',
          name: 'Dense Metallic-Spun Cashmere Knit',
          colorName: 'Charcoal Shimmer',
          colorHex: '#3A3A3C',
          role: 'Essential Top',
          description: 'Subtle reflective metallic threads woven into insulating Scottish cashmere.',
          stylingTip: 'Tuck smoothly into evening bottoms.'
        }
      ];
      return selectPieceFromPool(eveningColdTops, wardrobeTops, seed, varOffset, excludedWardrobeIds);
    }

    // Casual / other cold
    const casualColdTops: OutfitPiece[] = [
      {
        category: 'tops',
        name: 'Chunky Cable-Knit Wool Crewneck',
        colorName: 'Oatmeal Heather',
        colorHex: '#D8C4B6',
        role: 'Essential Top',
        description: 'Traditional fisherman cable-stitch in untreated warm wool for freezing winds.',
        stylingTip: 'Wear relaxed over thermal underlayers.'
      },
      {
        category: 'tops',
        name: 'Dense Waffle-Knit Merino Henley',
        colorName: 'Charcoal Heather',
        colorHex: '#4A4E57',
        role: 'Essential Top',
        description: 'Heavy honeycomb thermal knit with horn buttons for maximum insulation.',
        stylingTip: 'Unbutton top button to reveal layered inner neck.'
      },
      {
        category: 'tops',
        name: 'Brushed Alpaca-Blend Mock Neck',
        colorName: 'Dark Forest',
        colorHex: '#243324',
        role: 'Essential Top',
        description: 'Soft brushed cloud-like alpaca providing lofty air-trapping warmth.',
        stylingTip: 'Pair with heavy twill or denim bottoms.'
      },
      {
        category: 'tops',
        name: 'Dense 400gsm Heavyweight Cotton-Fleece Sweatshirt',
        colorName: 'Heather Gray',
        colorHex: '#8E9298',
        role: 'Essential Top',
        description: 'Loopback terry with dense ribbed side panels and collar.',
        stylingTip: 'Layer under heavy wool coat for elevated casual warmth.'
      }
    ];
    return selectPieceFromPool(casualColdTops, wardrobeTops, seed, varOffset, excludedWardrobeIds);
  }

  // Temperate / Mild weather (10–29°C)
  if (occasion === 'office') {
    const officeTops: OutfitPiece[] = [
      {
        category: 'tops',
        name: 'Crisp Poplin Button-Down Shirt',
        colorName: 'Ivory Cream',
        colorHex: '#F7F4EE',
        role: 'Essential Top',
        description: 'Structured menswear collar with relaxed French cuffs.',
        stylingTip: 'Roll cuffs once and keep collar unbuttoned for refined ease.'
      },
      {
        category: 'tops',
        name: 'Clean Silk-Cotton Concealed-Placket Shirt',
        colorName: 'French Sky Blue',
        colorHex: '#A5C4D4',
        role: 'Essential Top',
        description: 'Minimalist hidden front placket with crisp spread collar.',
        stylingTip: 'Fasten fully to the top collar button for sleek architectural lines.'
      },
      {
        category: 'tops',
        name: 'Fine Supima Cotton Spread-Collar Shirt',
        colorName: 'Pure White',
        colorHex: '#FFFFFF',
        role: 'Essential Top',
        description: 'High-density two-ply Supima cotton with a silky hand and tailored seams.',
        stylingTip: 'Tuck cleanly into high-rise trousers.'
      },
      {
        category: 'tops',
        name: 'Fluid Crepe de Chine Point-Collar Blouse',
        colorName: 'Chalk White',
        colorHex: '#FAF7F2',
        role: 'Essential Top',
        description: 'Matte silk crepe with subtle shoulder pleating and mother-of-pearl buttons.',
        stylingTip: 'Leave top two buttons undone for effortless executive presence.'
      },
      {
        category: 'tops',
        name: 'Tailored Striped Poplin Executive Shirt',
        colorName: 'Classic Oxford Blue',
        colorHex: '#7A9CC6',
        role: 'Essential Top',
        description: 'Subtle micro-stripe pattern that adds tailored depth to neutral outfits.',
        stylingTip: 'Pair with solid neutral trousers to balance the pattern.'
      }
    ];
    return selectPieceFromPool(officeTops, wardrobeTops, seed, varOffset, excludedWardrobeIds);
  }

  if (occasion === 'party' || occasion === 'date_night') {
    const eveningTops: OutfitPiece[] = [
      {
        category: 'tops',
        name: 'Bias-Cut Silk Camisole',
        colorName: 'Champagne Ivory',
        colorHex: '#F7F4EE',
        role: 'Essential Top',
        description: 'Delicate scoop neckline cut on the bias in lustrous washed silk.',
        stylingTip: 'Layer under structured outerwear for alluring décolletage framing.'
      },
      {
        category: 'tops',
        name: 'Draped Asymmetric Silk Chiffon Top',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Essential Top',
        description: 'Bias-draped neckline with fluid diagonal hemlines for modern evening allure.',
        stylingTip: 'Pairs with high-waisted cigarette trousers or structured skirts.'
      },
      {
        category: 'tops',
        name: 'Structured Satin Square-Neck Top',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Essential Top',
        description: 'Heavy architectural duchesse satin cut with sharp geometric lines.',
        stylingTip: 'Contrast against fluid drapey bottoms.'
      },
      {
        category: 'tops',
        name: 'Fluid Wrap Blouse in Washed Cupro',
        colorName: 'Deep Olive',
        colorHex: '#3E4A3D',
        role: 'Essential Top',
        description: 'Silky cupro wrap top with dramatic tie belt at the hip.',
        stylingTip: 'Cinch waist securely to establish an hourglass silhouette.'
      }
    ];
    return selectPieceFromPool(eveningTops, wardrobeTops, seed, varOffset, excludedWardrobeIds);
  }

  if (occasion === 'wedding_guest') {
    const weddingTops: OutfitPiece[] = [
      {
        category: 'tops',
        name: 'Lustrous Silk Crepe Cowl-Neck Top',
        colorName: 'Champagne Ivory',
        colorHex: '#F7F4EE',
        role: 'Essential Top',
        description: 'Graceful draped cowl neckline that pools effortlessly over the collarbones.',
        stylingTip: 'Pairs with high-waisted palazzo trousers or a floor-length skirt.'
      },
      {
        category: 'tops',
        name: 'Sculptural Origami-Fold Dupioni Top',
        colorName: 'Muted Rose',
        colorHex: '#C89B9B',
        role: 'Essential Top',
        description: 'Crisp raw silk with geometric lapel pleats that hold architectural volume.',
        stylingTip: 'Keep jewelry edited to let the collar fold shine.'
      },
      {
        category: 'tops',
        name: 'Pleated Georgette Halter Blouse',
        colorName: 'Soft Taupe',
        colorHex: '#B8A99A',
        role: 'Essential Top',
        description: 'Accordion pleating in sheer layered georgette with a clean keyhole back.',
        stylingTip: 'Tuck cleanly into high-waisted neutral tailoring.'
      }
    ];
    return selectPieceFromPool(weddingTops, wardrobeTops, seed, varOffset, excludedWardrobeIds);
  }

  // Casual
  const casualTops: OutfitPiece[] = [
    {
      category: 'tops',
      name: 'Oatmeal Fine Merino Crewneck',
      colorName: 'Ivory Cream',
      colorHex: '#F7F4EE',
      role: 'Essential Top',
      description: 'Clean architectural cut crafted in luxury organic fiber.',
      stylingTip: 'Half-tuck in front for relaxed casual drape.'
    },
    {
      category: 'tops',
      name: 'Heavyweight Boxy Cotton Tee',
      colorName: 'Pure White',
      colorHex: '#FFFFFF',
      role: 'Essential Top',
      description: '240gsm combed organic cotton with dropped shoulders and a dense ribbed collar.',
      stylingTip: 'Contrast relaxed silhouette against sharp pleated trousers.'
    },
    {
      category: 'tops',
      name: 'Washed Slub Cotton Long-Sleeve Henley',
      colorName: 'Sandstone Tan',
      colorHex: '#D8C4B6',
      role: 'Essential Top',
      description: 'Relaxed three-button placket with washed vintage hand feel.',
      stylingTip: 'Roll sleeves to forearm for nonchalant styling.'
    },
    {
      category: 'tops',
      name: 'Textured Breton Stripe Long-Sleeve Tee',
      colorName: 'Navy & Cream',
      colorHex: '#2B3A4A',
      role: 'Essential Top',
      description: 'Heavyweight knitted cotton with classic horizontal nautical stripes.',
      stylingTip: 'Pair with solid chinos or raw denim.'
    }
  ];
  return selectPieceFromPool(casualTops, wardrobeTops, seed, varOffset, excludedWardrobeIds);
}

function getMatchingBottom(
  occasion: Occasion,
  style: FashionStyle,
  baseColor: FashionColor,
  variation: 'classic' | 'contemporary' | 'tonal',
  wardrobe: WardrobeItem[],
  weather: WeatherCondition,
  temperature: TemperatureRange,
  excludedWardrobeIds: Set<string>,
  seed: number
): OutfitPiece {
  // Check wardrobe pieces with seeded rotation pool
  const wardrobeBottoms = getMatchingWardrobePieces('bottoms', occasion, weather, temperature, wardrobe, excludedWardrobeIds, variation, baseColor);

  const isHot = temperature === '30_plus';
  const isCold = temperature === 'below_10' || (weather === 'cold' && temperature !== '30_plus' && temperature !== '20_29');
  const varOffset = variation === 'classic' ? 0 : variation === 'contemporary' ? 1 : 2;

  // Tonal options
  if (variation === 'tonal') {
    const toneHex1 = baseColor.monochromaticHexes[3] || baseColor.bestNeutrals[0] || '#161617';
    const toneHex2 = baseColor.monochromaticHexes[2] || '#4A4E57';
    const toneHex3 = baseColor.monochromaticHexes[1] || '#D8C4B6';

    const tonalBottoms: OutfitPiece[] = [
      {
        category: 'bottoms',
        name: isHot
          ? `Relaxed Linen-Blend Trousers in ${baseColor.name}`
          : `Tailored Wide-Leg Trousers in ${baseColor.name}`,
        colorName: baseColor.name,
        colorHex: toneHex1,
        role: 'Essential Bottom',
        description: isHot
          ? 'Airy natural linen blend with relaxed drape for high temperatures.'
          : 'Double-pleated fluid trousers that pool gracefully over footwear.',
        stylingTip: 'High-waisted fit creates continuous leg-lengthening lines.'
      },
      {
        category: 'bottoms',
        name: `Pleated High-Waisted Trousers in Deep ${baseColor.name}`,
        colorName: baseColor.name,
        colorHex: toneHex2,
        role: 'Essential Bottom',
        description: 'Superfine gabardine twill with sharp front crease in a saturated tonal hue.',
        stylingTip: 'Anchor with matching footwear for monochromatic elongation.'
      },
      {
        category: 'bottoms',
        name: `Fluid Silk-Crepe Maxi Skirt in ${baseColor.name}`,
        colorName: baseColor.name,
        colorHex: toneHex3,
        role: 'Essential Bottom',
        description: 'Bias-cut column silhouette that provides clean vertical visual flow.',
        stylingTip: 'Pair with tonal knitwear to create textural contrast.'
      }
    ];
    return selectPieceFromPool(tonalBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
  }

  // Hot weather options (30°C+)
  if (isHot) {
    if (occasion === 'office') {
      const officeHotBottoms: OutfitPiece[] = [
        {
          category: 'bottoms',
          name: 'Tailored Lightweight Tropical Wool Trousers',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'Ultra-lightweight high-twist wool woven specifically for breathability in warm climates.',
          stylingTip: 'High-waisted fit maintains sharp drape even in summer temperatures.'
        },
        {
          category: 'bottoms',
          name: 'Pleated High-Waisted Linen-Blend Culottes',
          colorName: 'Ecru Stone',
          colorHex: '#E8E2D9',
          role: 'Essential Bottom',
          description: 'A-line wide cut with crisp pressed front pleats that channel cooling breezes.',
          stylingTip: 'Pairs with leather loafers for heat-resistant professional polish.'
        },
        {
          category: 'bottoms',
          name: 'Fluid High-Rise Tencel Wide-Leg Pants',
          colorName: 'Sandstone Tan',
          colorHex: '#D8C4B6',
          role: 'Essential Bottom',
          description: 'Lightweight cellulosic twill that glides effortlessly with every step.',
          stylingTip: 'Tuck shirt neatly to showcase the clean waistband.'
        },
        {
          category: 'bottoms',
          name: 'Ankle-Graze Lightweight Chino Trousers',
          colorName: 'Chalk White',
          colorHex: '#F7F4EE',
          role: 'Essential Bottom',
          description: 'Finely spun lightweight cotton with a slim tapered cuff.',
          stylingTip: 'Wear with unlined leather loafers for ventilated polish.'
        }
      ];
      return selectPieceFromPool(officeHotBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
    }

    if (occasion === 'party' || occasion === 'date_night') {
      const eveningHotBottoms: OutfitPiece[] = [
        {
          category: 'bottoms',
          name: 'Fluid Crepe Side-Slit Midi Skirt',
          colorName: 'Champagne Ivory',
          colorHex: '#F7F4EE',
          role: 'Essential Bottom',
          description: 'High-drape silk crepe with a discreet side slit for breathability and movement.',
          stylingTip: 'Pairs with strappy sandals for elevated warm-evening dinners.'
        },
        {
          category: 'bottoms',
          name: 'High-Waisted Silk Wide-Leg Pants',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Essential Bottom',
          description: 'Liquid silk twill that creates dramatic architectural flow in the breeze.',
          stylingTip: 'Let the hem skim just above open-toe footwear.'
        },
        {
          category: 'bottoms',
          name: 'Pleated Linen-Blend Evening Culottes',
          colorName: 'Muted Bronze',
          colorHex: '#8C7355',
          role: 'Essential Bottom',
          description: 'Crisp inverted pleats in a lustrous linen-viscose blend.',
          stylingTip: 'Pair with metallic hardware and sleek kitten heels.'
        }
      ];
      return selectPieceFromPool(eveningHotBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
    }

    // Casual / other hot
    const casualHotBottoms: OutfitPiece[] = [
      {
        category: 'bottoms',
        name: 'Pleated Linen-Cotton Chino Shorts',
        colorName: 'Ecru Stone',
        colorHex: '#E8E2D9',
        role: 'Essential Bottom',
        description: 'Tailored knee-length cut with double front pleats in breathable linen-cotton.',
        stylingTip: 'Balances tailored shirting with warm-weather comfort.'
      },
      {
        category: 'bottoms',
        name: 'Relaxed Linen Drawstring Wide-Leg Trousers',
        colorName: 'Chalk White',
        colorHex: '#F7F4EE',
        role: 'Essential Bottom',
        description: 'Pure French linen cut in an unrestrictive silhouette with elasticated rear waist.',
        stylingTip: 'Let hem break softly over low sandals or minimalist sneakers.'
      },
      {
        category: 'bottoms',
        name: 'Washed Cotton Twill Bermuda Shorts',
        colorName: 'Khaki Tan',
        colorHex: '#C2A684',
        role: 'Essential Bottom',
        description: 'Subtle high-rise tailoring with clean forward welt pockets.',
        stylingTip: 'Pair with tucked tops and minimalist footwear.'
      },
      {
        category: 'bottoms',
        name: 'Lightweight Chambray Drawstring Trousers',
        colorName: 'Sky Blue',
        colorHex: '#89A8BF',
        role: 'Essential Bottom',
        description: 'Ultra-soft washed indigo chambray that stays cool in midday sun.',
        stylingTip: 'Roll hem once at the ankle.'
      }
    ];
    return selectPieceFromPool(casualHotBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
  }

  // Cold weather options (<10°C)
  if (isCold) {
    if (occasion === 'office') {
      const officeColdBottoms: OutfitPiece[] = [
        {
          category: 'bottoms',
          name: 'Heavy Wool Flannel Pleated Trousers',
          colorName: 'Charcoal Heather',
          colorHex: '#4A4E57',
          role: 'Essential Bottom',
          description: 'Brushed heavy wool flannel that insulates against frost and brisk winds.',
          stylingTip: 'Straight leg cut accommodates thermal underlayers without bulk.'
        },
        {
          category: 'bottoms',
          name: 'Relaxed Straight-Leg Heavy Twill Trousers',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Essential Bottom',
          description: 'Substantial cotton-wool twill with a clean unbroken drape that resists chilly gusts.',
          stylingTip: 'Cuff once over chunky boots for clean architectural grounding.'
        },
        {
          category: 'bottoms',
          name: 'Brushed Cavalry Twill Tailored Trousers',
          colorName: 'Deep Espresso',
          colorHex: '#3D2B1F',
          role: 'Essential Bottom',
          description: 'Heavy diagonal twill weave providing wind protection and structured poise.',
          stylingTip: 'Pair with leather boots and cashmere knitwear.'
        },
        {
          category: 'bottoms',
          name: 'Pleated Double-Faced Wool Midi Skirt',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'Warm unlined wool skirt with deep knife pleats that trap insulating body heat.',
          stylingTip: 'Wear over opaque thermal tights and calfskin boots.'
        }
      ];
      return selectPieceFromPool(officeColdBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
    }

    if (occasion === 'party' || occasion === 'date_night') {
      const eveningColdBottoms: OutfitPiece[] = [
        {
          category: 'bottoms',
          name: 'High-Waisted Leather Cigarette Trousers',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Essential Bottom',
          description: 'Supple matte lambskin cut close through the hip with tapered ankle break.',
          stylingTip: 'Blocks freezing winds while creating luminous contrast against knitwear.'
        },
        {
          category: 'bottoms',
          name: 'Tailored Velvet Flared Trousers',
          colorName: 'Midnight Onyx',
          colorHex: '#161617',
          role: 'Essential Bottom',
          description: 'Plush cotton velvet with subtle stretch that holds warmth beautifully.',
          stylingTip: 'Pool slightly over pointed ankle boots for evening drama.'
        },
        {
          category: 'bottoms',
          name: 'Heavy Satin Bias-Cut Maxi Skirt',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Essential Bottom',
          description: 'Substantial 280gsm duchesse satin that provides cold-weather coverage with liquid sheen.',
          stylingTip: 'Pair with knee-high leather boots hidden beneath the hem.'
        }
      ];
      return selectPieceFromPool(eveningColdBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
    }

    // Casual / other cold
    const casualColdBottoms: OutfitPiece[] = [
      {
        category: 'bottoms',
        name: 'Heavyweight 14oz Denim Straight-Leg Jeans',
        colorName: 'Dark Indigo',
        colorHex: '#1D2A44',
        role: 'Essential Bottom',
        description: 'Rigid selvedge denim that blocks cold winter wind completely.',
        stylingTip: 'Cuff neatly above rugged winter footwear.'
      },
      {
        category: 'bottoms',
        name: 'Wide-Wale Corduroy Relaxed Trousers',
        colorName: 'Tobacco Brown',
        colorHex: '#75482F',
        role: 'Essential Bottom',
        description: '8-wale thick corduroy offering soft plush insulation in low temperatures.',
        stylingTip: 'Wear with chunky knit sweaters and commando boots.'
      },
      {
        category: 'bottoms',
        name: 'Brushed Moleskin Tailored Trousers',
        colorName: 'Forest Olive',
        colorHex: '#2D3B2D',
        role: 'Essential Bottom',
        description: 'Sueded cotton moleskin with dense windproof weave.',
        stylingTip: 'Tuck cleanly over winter boot shafts.'
      },
      {
        category: 'bottoms',
        name: 'Heavy Wool-Blend Utility Cargo Trousers',
        colorName: 'Charcoal',
        colorHex: '#3F4349',
        role: 'Essential Bottom',
        description: 'Streamlined flat cargo pockets with tailored tapered ankle.',
        stylingTip: 'Balances chunky winter knitwear.'
      }
    ];
    return selectPieceFromPool(casualColdBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
  }

  // Temperate / Mild weather (10–29°C)
  if (occasion === 'office') {
    const officeBottoms: OutfitPiece[] = [
      {
        category: 'bottoms',
        name: 'Pleated High-Rise Wool Trousers',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        role: 'Essential Bottom',
        description: 'Super-120s virgin wool with sharp center crease and drape.',
        stylingTip: 'Cinch or tuck cleanly to maintain defined proportions.'
      },
      {
        category: 'bottoms',
        name: 'Wide-Leg Minimalist Double-Pleat Trousers',
        colorName: 'Charcoal Heather',
        colorHex: '#4A4E57',
        role: 'Essential Bottom',
        description: 'High-rise structured waistband opening into generous architectural volume.',
        stylingTip: 'Tuck shirt cleanly to accentuate high waist proportion.'
      },
      {
        category: 'bottoms',
        name: 'Clean-Front Straight-Leg Crepe Trousers',
        colorName: 'Ecru Stone',
        colorHex: '#E8E2D9',
        role: 'Essential Bottom',
        description: 'Mid-weight fluid crepe with no belt loops for a pristine unbroken waist.',
        stylingTip: 'Pair with slingbacks or block-heel loafers.'
      },
      {
        category: 'bottoms',
        name: 'High-Waisted Cigarette Trousers with Ankle Vents',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Essential Bottom',
        description: 'Precision-tailored stretch wool blend that highlights footwear.',
        stylingTip: 'Clean ankle break frames pointed footwear perfectly.'
      },
      {
        category: 'bottoms',
        name: 'Fluid Tropical Wool Culottes',
        colorName: 'Taupe Tan',
        colorHex: '#9C8B7A',
        role: 'Essential Bottom',
        description: 'Cropped wide silhouette that moves with graceful authority.',
        stylingTip: 'Pair with fitted knitwear to counterbalance volume.'
      }
    ];
    return selectPieceFromPool(officeBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
  }

  if (occasion === 'party' || occasion === 'date_night') {
    const eveningBottoms: OutfitPiece[] = [
      {
        category: 'bottoms',
        name: 'High-Waisted Leather Cigarette Trousers',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Essential Bottom',
        description: 'Supple matte lambskin cut close through the hip with tapered ankle break.',
        stylingTip: 'Creates luminous contrast against matte knitwear or tailoring.'
      },
      {
        category: 'bottoms',
        name: 'Pleated Satin Midi Skirt',
        colorName: 'Champagne Ivory',
        colorHex: '#F7F4EE',
        role: 'Essential Bottom',
        description: 'Fluid satin that moves organically with each step.',
        stylingTip: 'Pair with delicate footwear for elevated evening movement.'
      },
      {
        category: 'bottoms',
        name: 'Bias-Cut Washed Silk Maxi Skirt',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Essential Bottom',
        description: 'Liquid silhouette cut on the bias that skims curves without cling.',
        stylingTip: 'Let pool slightly over minimal kitten heels.'
      },
      {
        category: 'bottoms',
        name: 'Flared Tailored High-Rise Trousers',
        colorName: 'Ivory Cream',
        colorHex: '#F7F4EE',
        role: 'Essential Bottom',
        description: 'Dramatic architectural flare starting just below the knee.',
        stylingTip: 'Pairs with sharp stilettos to elongate the legs.'
      }
    ];
    return selectPieceFromPool(eveningBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
  }

  if (occasion === 'wedding_guest') {
    const weddingBottoms: OutfitPiece[] = [
      {
        category: 'bottoms',
        name: 'Fluid Crepe Wide-Leg Palazzo Pants',
        colorName: 'Soft Champagne',
        colorHex: '#EADBC8',
        role: 'Essential Bottom',
        description: 'High-drape woven crepe with side zip closure for pristine unbroken silhouette.',
        stylingTip: 'Sweep gracefully across the floor with block heels.'
      },
      {
        category: 'bottoms',
        name: 'Pleated Georgette A-Line Skirt',
        colorName: 'Muted Rose',
        colorHex: '#C89B9B',
        role: 'Essential Bottom',
        description: 'Whisper-light pleated georgette that floats gracefully in celebratory settings.',
        stylingTip: 'Pair with delicate metallic accessories.'
      },
      {
        category: 'bottoms',
        name: 'High-Waisted Satin Bias Skirt',
        colorName: 'Sage Green',
        colorHex: '#9BA899',
        role: 'Essential Bottom',
        description: 'Lustrous muted green satin cut on the bias for fluid ceremonial elegance.',
        stylingTip: 'Anchor with champagne metallic heels.'
      }
    ];
    return selectPieceFromPool(weddingBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
  }

  // Casual
  const casualBottoms: OutfitPiece[] = [
    {
      category: 'bottoms',
      name: 'Tailored Chino Trousers',
      colorName: 'Ecru Stone',
      colorHex: '#E8E2D9',
      role: 'Essential Bottom',
      description: 'Clean front with comfortable cotton twill weave.',
      stylingTip: 'Pair with classic leather footwear.'
    },
    {
      category: 'bottoms',
      name: 'Raw Hem Straight-Leg Vintage Denim',
      colorName: 'Indigo Blue',
      colorHex: '#223843',
      role: 'Essential Bottom',
      description: 'Mid-to-high rise with authentic non-stretch twill texture.',
      stylingTip: 'Wear at ankle break to spotlight footwear.'
    },
    {
      category: 'bottoms',
      name: 'Relaxed Carpenter Cotton Twill Trousers',
      colorName: 'Washed Khaki',
      colorHex: '#B3A38E',
      role: 'Essential Bottom',
      description: 'Subtle utilitarian tool loop and double-knee paneling with refined drape.',
      stylingTip: 'Balance relaxed silhouette with a structured top.'
    },
    {
      category: 'bottoms',
      name: 'Mid-Rise Relaxed Barrel-Leg Denim',
      colorName: 'Washed Black',
      colorHex: '#2E2E30',
      role: 'Essential Bottom',
      description: 'Sculpted curved outer seam that creates modern architectural volume.',
      stylingTip: 'Keep tops neatly tucked to emphasize the barrel silhouette.'
    }
  ];
  return selectPieceFromPool(casualBottoms, wardrobeBottoms, seed, varOffset, excludedWardrobeIds);
}

function getMatchingOuterwear(
  occasion: Occasion,
  style: FashionStyle,
  baseColor: FashionColor,
  variation: 'classic' | 'contemporary' | 'tonal',
  wardrobe: WardrobeItem[],
  weather: WeatherCondition,
  temperature: TemperatureRange,
  excludedWardrobeIds: Set<string>,
  seed: number
): OutfitPiece | null {
  const isHot = temperature === '30_plus';
  const isCold = temperature === 'below_10' || (weather === 'cold' && temperature !== '30_plus' && temperature !== '20_29');
  const isRain = weather === 'rainy';
  const varOffset = variation === 'classic' ? 0 : variation === 'contemporary' ? 1 : 2;

  // Check wardrobe match with seeded rotation pool
  const wardrobeOuter = getMatchingWardrobePieces('outerwear', occasion, weather, temperature, wardrobe, excludedWardrobeIds, variation, baseColor);

  // In hot weather (30°C+), DO NOT add outerwear unless raining!
  if (isHot) {
    if (isRain) {
      const hotRainOuterwear: OutfitPiece[] = [
        {
          category: 'outerwear',
          name: 'Ultra-Lightweight Packable Rain Mac',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Unlined technical storm shell with sealed seams and eyelet ventilation.',
          stylingTip: 'Carry folded when indoors; wear open over shirting during showers.'
        },
        {
          category: 'outerwear',
          name: 'Translucent Technical Hooded Windbreaker',
          colorName: 'Slate Gray',
          colorHex: '#6C757D',
          role: 'Complementary Layer',
          description: 'Ultra-thin water-repellent ripstop with taped seams and underarm eyelet vents.',
          stylingTip: 'Wear loosely zipped over light shirting during rainfall.'
        },
        {
          category: 'outerwear',
          name: 'Water-Repellent Unlined Storm Shell',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Featherweight breathable storm fabric that shields tropical squalls without insulation.',
          stylingTip: 'Keep collar up against gusty rain.'
        }
      ];
      return selectOuterwearFromPool(hotRainOuterwear, wardrobeOuter, seed, varOffset, excludedWardrobeIds);
    }
    return null; // Strictly no outerwear in high heat without rain
  }

  // Cold weather (<10°C)
  if (isCold) {
    const coldOuterwear: OutfitPiece[] = [
      {
        category: 'outerwear',
        name: 'Double-Faced Wool Melton Overcoat',
        colorName: 'Charcoal Heather',
        colorHex: '#4A4E57',
        role: 'Complementary Layer',
        description: 'Heavyweight dense wool melton providing vital exterior warmth and wind blockage.',
        stylingTip: 'Fasten center horn buttons for thermal protection in low temperatures.'
      },
      {
        category: 'outerwear',
        name: 'Architectural Cocoon-Sleeve Wool Coat',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Complementary Layer',
        description: 'Sculpted drop shoulders with concealed snap closure in dense insulating virgin wool.',
        stylingTip: 'Creates a striking minimalist silhouette over knitwear.'
      },
      {
        category: 'outerwear',
        name: 'Belted Heavy Cashmere-Wool Wrap Coat',
        colorName: 'Camel Tan',
        colorHex: '#C19A6B',
        role: 'Complementary Layer',
        description: 'Luxurious thick wrap coat with generous shawl collar that seals in core warmth.',
        stylingTip: 'Knot belt tightly at natural waist for an elegant hourglass winter silhouette.'
      },
      {
        category: 'outerwear',
        name: 'Tailored Double-Breasted Peacoat in 32oz Melton',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        role: 'Complementary Layer',
        description: 'Heavy insulating naval-grade wool with oversized notched collar.',
        stylingTip: 'Flip collar up against biting frost winds.'
      }
    ];
    return selectOuterwearFromPool(coldOuterwear, wardrobeOuter, seed, varOffset, excludedWardrobeIds);
  }

  // Rainy weather (mild/temperate)
  if (isRain) {
    const rainOuterwear: OutfitPiece[] = [
      {
        category: 'outerwear',
        name: 'Double-Breasted Gabardine Trench',
        colorName: 'Camel Tan',
        colorHex: '#C19A6B',
        role: 'Complementary Layer',
        description: 'Tightly woven water-repellent gabardine twill with storm flap and throat latch.',
        stylingTip: 'Tie belt nonchalantly in a knot behind the back to maintain an open silhouette.'
      },
      {
        category: 'outerwear',
        name: 'Minimalist Single-Breasted Technical Storm Mac',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Complementary Layer',
        description: 'Clean water-repellent shell with storm placket and magnetic collar closure.',
        stylingTip: 'Keep collar stood up to shield neck from windblown rain.'
      },
      {
        category: 'outerwear',
        name: 'Bonded Cotton Storm Trench with Storm Flap',
        colorName: 'Khaki Beige',
        colorHex: '#D0C5B4',
        role: 'Complementary Layer',
        description: 'Rubberized seam-taped heritage cotton that repels downpours effortlessly.',
        stylingTip: 'Fasten wrist storm buckles securely.'
      }
    ];
    return selectOuterwearFromPool(rainOuterwear, wardrobeOuter, seed, varOffset, excludedWardrobeIds);
  }

  // Tonal variation
  if (variation === 'tonal') {
    const tonalOuterwear: OutfitPiece[] = [
      {
        category: 'outerwear',
        name: `Double-Faced Wool Coat in Deep ${baseColor.name}`,
        colorName: baseColor.name,
        colorHex: baseColor.monochromaticHexes[2] || '#4A4E57',
        role: 'Complementary Layer',
        description: 'Unlined luxury double-faced cashmere wool with hand-stitched borders.',
        stylingTip: 'Leave open to reveal the layered gradient beneath.'
      },
      {
        category: 'outerwear',
        name: `Belted Fluid Duster Coat in ${baseColor.name}`,
        colorName: baseColor.name,
        colorHex: baseColor.monochromaticHexes[1] || '#D8C4B6',
        role: 'Complementary Layer',
        description: 'Lightweight woven cupro duster that flows with every motion in a matching tone.',
        stylingTip: 'Wear unfastened over tonal tailored pieces.'
      },
      {
        category: 'outerwear',
        name: `Soft-Structured Wool Blazer in ${baseColor.name}`,
        colorName: baseColor.name,
        colorHex: baseColor.hex,
        role: 'Complementary Layer',
        description: 'Unstructured single-breasted blazer in fine tropical wool twill.',
        stylingTip: 'Pockets tucked flat to preserve seamless monochrome lines.'
      }
    ];
    return selectOuterwearFromPool(tonalOuterwear, wardrobeOuter, seed, varOffset, excludedWardrobeIds);
  }

  // Office
  if (occasion === 'office') {
    const officeOuterwear: OutfitPiece[] = [
      {
        category: 'outerwear',
        name: 'Tailored Wool-Twill Blazer',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        role: 'Complementary Layer',
        description: 'Impeccable single-breasted cut with notch lapels in fine tropical wool twill.',
        stylingTip: 'Fasten top button when standing for classic professional poise.'
      },
      {
        category: 'outerwear',
        name: 'Oversized Peak-Lapel Blazer',
        colorName: 'Charcoal Heather',
        colorHex: '#4A4E57',
        role: 'Complementary Layer',
        description: 'Slightly padded shoulders with tailored single-breasted horn closure.',
        stylingTip: 'Push sleeves to mid-forearm for clean structural lines.'
      },
      {
        category: 'outerwear',
        name: 'Double-Breasted Fine Houndstooth Blazer',
        colorName: 'Taupe Brown',
        colorHex: '#7D6853',
        role: 'Complementary Layer',
        description: 'Micro-scale heritage weave with tortoiseshell buttons and sharp peak lapels.',
        stylingTip: 'Wear closed over minimalist solid shirting.'
      },
      {
        category: 'outerwear',
        name: 'Collarless Sculptural Crepe Jacket',
        colorName: 'Ecru Stone',
        colorHex: '#E8E2D9',
        role: 'Complementary Layer',
        description: 'Clean architectural round neck with concealed magnetic closures.',
        stylingTip: 'Pairs with high-rise trousers for modern corporate authority.'
      }
    ];
    return selectOuterwearFromPool(officeOuterwear, wardrobeOuter, seed, varOffset, excludedWardrobeIds);
  }

  // Party / Date Night
  if (occasion === 'party' || occasion === 'date_night') {
    const eveningOuterwear: OutfitPiece[] = [
      {
        category: 'outerwear',
        name: 'Supple Leather Moto Jacket',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Complementary Layer',
        description: 'Washed lambskin with polished silver hardware and asymmetric zip.',
        stylingTip: 'Balances feminine drape with masculine sartorial structure.'
      },
      {
        category: 'outerwear',
        name: 'Structured Tuxedo Blazer',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Complementary Layer',
        description: 'Satin peak lapels that reflect evening lounge lighting.',
        stylingTip: 'Drape over shoulders without putting arms through sleeves.'
      },
      {
        category: 'outerwear',
        name: 'Cropped Velvet Evening Bolero',
        colorName: 'Deep Burgundy',
        colorHex: '#4A1525',
        role: 'Complementary Layer',
        description: 'Plush architectural jacket cut just at the ribcage to emphasize waistline.',
        stylingTip: 'Pairs with high-waisted evening trousers.'
      },
      {
        category: 'outerwear',
        name: 'Fluid Satin Longline Duster',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Complementary Layer',
        description: 'Unlined silk-satin floor duster that catches every draft of evening breeze.',
        stylingTip: 'Wear open over minimalist camisoles.'
      }
    ];
    return selectOuterwearFromPool(eveningOuterwear, wardrobeOuter, seed, varOffset, excludedWardrobeIds);
  }

  // Wedding Guest
  if (occasion === 'wedding_guest') {
    const weddingOuterwear: OutfitPiece[] = [
      {
        category: 'outerwear',
        name: 'Structured Silk-Wool Tailored Blazer',
        colorName: 'Ivory Cream',
        colorHex: '#F7F4EE',
        role: 'Complementary Layer',
        description: 'Lustrous mikado-woven silk-wool with sculpted waist and covered buttons.',
        stylingTip: 'Drape gently across shoulders for outdoor ceremonies.'
      },
      {
        category: 'outerwear',
        name: 'Fluid Crepe Waterfall Wrap Duster',
        colorName: 'Champagne',
        colorHex: '#EADBC8',
        role: 'Complementary Layer',
        description: 'Open front with soft cascading lapels that frame ceremonial attire.',
        stylingTip: 'Keep accessories metallic to catch daylight.'
      },
      {
        category: 'outerwear',
        name: 'Collarless Minimalist Evening Capelet',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        role: 'Complementary Layer',
        description: 'Architectural shoulder wrap crafted in dense silk-wool twill.',
        stylingTip: 'Fasten throat button and leave hands free.'
      }
    ];
    return selectOuterwearFromPool(weddingOuterwear, wardrobeOuter, seed, varOffset, excludedWardrobeIds);
  }

  // Casual
  const casualOuterwear: OutfitPiece[] = [
    {
      category: 'outerwear',
      name: 'Double-Breasted Gabardine Trench',
      colorName: 'Camel Tan',
      colorHex: '#C19A6B',
      role: 'Complementary Layer',
      description: 'Classic weatherproof trench with waist-cinching belt and storm flap.',
      stylingTip: 'Tie belt nonchalantly in a knot behind the back to maintain an open silhouette.'
    },
    {
      category: 'outerwear',
      name: 'Cropped Minimalist Boxy Jacket',
      colorName: 'Obsidian Black',
      colorHex: '#161617',
      role: 'Complementary Layer',
      description: 'Clean zipper front with dropped shoulders and point collar.',
      stylingTip: 'Creates a modern high-waisted proportion.'
    },
    {
      category: 'outerwear',
      name: 'Unlined Washed Cotton Chore Coat',
      colorName: 'Ecru Stone',
      colorHex: '#E8E2D9',
      role: 'Complementary Layer',
      description: 'French workwear silhouette in sturdy 300gsm brushed cotton twill.',
      stylingTip: 'Roll cuffs once and keep top button undone.'
    },
    {
      category: 'outerwear',
      name: 'Relaxed Denim Trucker Jacket',
      colorName: 'Washed Indigo',
      colorHex: '#31495E',
      role: 'Complementary Layer',
      description: 'Authentic 13oz ring-spun denim with clean antique copper shanks.',
      stylingTip: 'Layer over fine knits for textured ease.'
    }
  ];
  return selectOuterwearFromPool(casualOuterwear, wardrobeOuter, seed, varOffset, excludedWardrobeIds);
}

function getMatchingFootwear(
  occasion: Occasion,
  style: FashionStyle,
  baseColor: FashionColor,
  variation: 'classic' | 'contemporary' | 'tonal',
  wardrobe: WardrobeItem[],
  weather: WeatherCondition,
  temperature: TemperatureRange,
  excludedWardrobeIds: Set<string>,
  seed: number
): OutfitPiece {
  // Check wardrobe with seeded rotation pool
  const wardrobeShoes = getMatchingWardrobePieces('footwear', occasion, weather, temperature, wardrobe, excludedWardrobeIds, variation, baseColor);

  const isHot = temperature === '30_plus';
  const isCold = temperature === 'below_10' || (weather === 'cold' && temperature !== '30_plus' && temperature !== '20_29');
  const isRain = weather === 'rainy';
  const varOffset = variation === 'classic' ? 0 : variation === 'contemporary' ? 1 : 2;

  // Rainy footwear
  if (isRain) {
    const rainFootwear: OutfitPiece[] = [
      {
        category: 'footwear',
        name: 'Calfskin Chelsea Boots with Dainite Rubber Soles',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Water-resistant waxed calfskin with studded rubber soles to prevent slipping.',
        stylingTip: 'Tuck trouser hems slightly or wear cleanly over boot shaft.'
      },
      {
        category: 'footwear',
        name: 'Lug-Sole Leather Derby Shoes',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Treated calfskin with chunky grooved rubber sole for traction on wet pavement.',
        stylingTip: 'Pairs with straight-leg trousers for bold architectural ground presence.'
      },
      {
        category: 'footwear',
        name: 'Goodyear-Welted Water-Resistant Commando Loafers',
        colorName: 'Dark Espresso',
        colorHex: '#3D2B1F',
        role: 'Footwear Anchor',
        description: 'Wax-impregnated pull-up leather with deep-lugged Vibram rubber outsoles.',
        stylingTip: 'Pairs with cropped or cuffed trousers on rainy days.'
      },
      {
        category: 'footwear',
        name: 'Sealed-Seam Weatherproof Calfskin Ankle Boots',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Clean minimalist toe with waterproof membrane and storm welt.',
        stylingTip: 'Provides sleek rain resistance with unbroken lines.'
      }
    ];
    return selectPieceFromPool(rainFootwear, wardrobeShoes, seed, varOffset, excludedWardrobeIds);
  }

  // Cold weather (<10°C)
  if (isCold) {
    const coldFootwear: OutfitPiece[] = [
      {
        category: 'footwear',
        name: 'Insulated Calfskin Ankle Boots',
        colorName: 'Espresso Brown',
        colorHex: '#3D2B1F',
        role: 'Footwear Anchor',
        description: 'Lined full-grain leather boots designed for low temperatures.',
        stylingTip: 'Provides warmth and architectural grounding.'
      },
      {
        category: 'footwear',
        name: 'Chunky Lug-Sole Commando Boots',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Thick cleated soles with padded collar and insulating lining for freezing weather.',
        stylingTip: 'Grounds relaxed tailored trousers with functional winter edge.'
      },
      {
        category: 'footwear',
        name: 'Shearling-Lined Full-Grain Leather Boots',
        colorName: 'Chestnut Brown',
        colorHex: '#5B371F',
        role: 'Footwear Anchor',
        description: 'Natural shearling lining offering thermal retention down to sub-zero climates.',
        stylingTip: 'Lace snugly and wear beneath wool trousers.'
      },
      {
        category: 'footwear',
        name: 'Storm-Welted Heavy Pebble-Grain Derby Boots',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Durable scotch grain leather with double-leather and rubber composite sole.',
        stylingTip: 'Pairs with heavy wool trousers and overcoats.'
      }
    ];
    return selectPieceFromPool(coldFootwear, wardrobeShoes, seed, varOffset, excludedWardrobeIds);
  }

  // Hot weather (30°C+)
  if (isHot) {
    if (occasion === 'office' || occasion === 'date_night') {
      const officeHotShoes: OutfitPiece[] = [
        {
          category: 'footwear',
          name: 'Breathable Calfskin Horsebit Loafers',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Footwear Anchor',
          description: 'Supple unlined leather with antiqued brass horsebit hardware.',
          stylingTip: 'Wear sockless or with breathable invisible no-show socks.'
        },
        {
          category: 'footwear',
          name: 'Woven Leather Venetian Loafers',
          colorName: 'Rich Cognac',
          colorHex: '#8C4A2F',
          role: 'Footwear Anchor',
          description: 'Intricate woven calfskin offering passive natural airflow while maintaining professional polish.',
          stylingTip: 'Wear sockless with cropped or cuffed trouser hems.'
        },
        {
          category: 'footwear',
          name: 'Unlined Calfskin Penny Loafers',
          colorName: 'Almond Tan',
          colorHex: '#B59475',
          role: 'Footwear Anchor',
          description: 'Ultra-pliable single-layer leather with natural leather outsoles.',
          stylingTip: 'Keeps feet cool while preserving sharp sartorial lines.'
        },
        {
          category: 'footwear',
          name: 'Perforated Cap-Toe Oxford Shoes',
          colorName: 'Rich Brown',
          colorHex: '#5A3825',
          role: 'Footwear Anchor',
          description: 'Micro-brogue perforations along the quarters that facilitate air circulation.',
          stylingTip: 'Fasten laces snugly with lightweight cotton socks.'
        }
      ];
      return selectPieceFromPool(officeHotShoes, wardrobeShoes, seed, varOffset, excludedWardrobeIds);
    }

    if (occasion === 'party' || occasion === 'wedding_guest') {
      const eveningHotShoes: OutfitPiece[] = [
        {
          category: 'footwear',
          name: 'Strappy Barely-There Heeled Sandals',
          colorName: 'Champagne Metallic',
          colorHex: '#D4AF37',
          role: 'Footwear Anchor',
          description: 'Delicate metallic straps that keep visual weight light in warm evening settings.',
          stylingTip: 'Lets the garment silhouette dominate while keeping feet cool.'
        },
        {
          category: 'footwear',
          name: 'Sculptural Kitten-Heel Leather Mules',
          colorName: 'Metallic Gold',
          colorHex: '#C5A059',
          role: 'Footwear Anchor',
          description: 'Square-toe open back mules with a modern 40mm curved heel.',
          stylingTip: 'Slip on effortlessly with fluid evening skirts or dresses.'
        },
        {
          category: 'footwear',
          name: 'Ankle-Wrap Minimalist Heeled Sandals',
          colorName: 'Warm Bronze',
          colorHex: '#8C6239',
          role: 'Footwear Anchor',
          description: 'Clean leather cord wrapping gently around the ankle.',
          stylingTip: 'Frame cropped trousers or side-slit hems.'
        }
      ];
      return selectPieceFromPool(eveningHotShoes, wardrobeShoes, seed, varOffset, excludedWardrobeIds);
    }

    // Casual hot
    const casualHotShoes: OutfitPiece[] = [
      {
        category: 'footwear',
        name: 'Low-Top Minimalist Calfskin Sneakers',
        colorName: 'Chalk White',
        colorHex: '#F7F4EE',
        role: 'Footwear Anchor',
        description: 'Italian leather with understated gum sole and tonal stitching.',
        stylingTip: 'Adds sporty ease while keeping the look curated.'
      },
      {
        category: 'footwear',
        name: 'Sculptural Minimalist Leather Slide Sandals',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Clean wide leather strap on contoured footbed for effortless warm-weather style.',
        stylingTip: 'Pairs with fluid wide-leg linen trousers.'
      },
      {
        category: 'footwear',
        name: 'Two-Strap Nubuck Cork-Footbed Slides',
        colorName: 'Mocha Brown',
        colorHex: '#4E382A',
        role: 'Footwear Anchor',
        description: 'Breathable natural cork and oiled leather that adapts to warm summer strolls.',
        stylingTip: 'Wear with casual shorts or linen trousers.'
      },
      {
        category: 'footwear',
        name: 'Canvas & Jute Handcrafted Espadrilles',
        colorName: 'Natural Ecru',
        colorHex: '#E8DFC8',
        role: 'Footwear Anchor',
        description: 'Traditional Spanish jute sole stitched with breathable cotton canvas.',
        stylingTip: 'Perfect resort footwear for relaxed sunny afternoons.'
      }
    ];
    return selectPieceFromPool(casualHotShoes, wardrobeShoes, seed, varOffset, excludedWardrobeIds);
  }

  // Temperate / Mild weather (10–29°C)
  if (occasion === 'office') {
    const officeShoes: OutfitPiece[] = [
      {
        category: 'footwear',
        name: 'Pointed Kitten-Heel Slingbacks',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: '50mm architectural kitten heel with refined buckle closure.',
        stylingTip: 'Elongates leg line with a balanced 50mm heel.'
      },
      {
        category: 'footwear',
        name: 'Architectural Block-Heel Loafers',
        colorName: 'Charcoal Heather',
        colorHex: '#4A4E57',
        role: 'Footwear Anchor',
        description: 'Clean square-toe loafer with a 45mm sculpted block heel for modern office presence.',
        stylingTip: 'Anchors wide-leg trousers with decisive geometric proportion.'
      },
      {
        category: 'footwear',
        name: 'Burnished Calfskin Penny Loafers',
        colorName: 'Espresso Brown',
        colorHex: '#3D2B1F',
        role: 'Footwear Anchor',
        description: 'Hand-burnished Italian calfskin with leather soles and stacked heel.',
        stylingTip: 'Wear with finely tailored trousers.'
      },
      {
        category: 'footwear',
        name: 'Cap-Toe Leather Pumps with Sculpted Heel',
        colorName: 'Deep Bordeaux',
        colorHex: '#4A1525',
        role: 'Footwear Anchor',
        description: 'Contrast cap toe with an ergonomic 55mm sculpted block heel.',
        stylingTip: 'Adds subtle rich color accent to monochrome workwear.'
      },
      {
        category: 'footwear',
        name: 'Polished Goodyear-Welted Oxford Shoes',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Closed-lacing formal silhouette crafted in box calf leather.',
        stylingTip: 'Maintain mirror shine on the toe box for impeccable executive posture.'
      }
    ];
    return selectPieceFromPool(officeShoes, wardrobeShoes, seed, varOffset, excludedWardrobeIds);
  }

  if (occasion === 'party' || occasion === 'date_night') {
    const eveningShoes: OutfitPiece[] = [
      {
        category: 'footwear',
        name: 'Strappy Barely-There Heeled Sandals',
        colorName: 'Champagne Metallic',
        colorHex: '#D4AF37',
        role: 'Footwear Anchor',
        description: 'Delicate straps that frame the arch of the foot with elegance.',
        stylingTip: 'Keeps footwear visually light to let the garment silhouette dominate.'
      },
      {
        category: 'footwear',
        name: 'Square-Toe Stiletto Ankle Boots',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Second-skin stretch calfskin with clean architectural square toe.',
        stylingTip: 'Frames hem breaks with contemporary editorial sharpness.'
      },
      {
        category: 'footwear',
        name: 'Asymmetric D\'Orsay Pointed Pumps',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Cutaway side panel that reveals the foot arch with alluring geometry.',
        stylingTip: 'Pairs with high-waisted cigarette pants or midi dresses.'
      },
      {
        category: 'footwear',
        name: 'Sculptural Mirrored Kitten-Heel Mules',
        colorName: 'Silver Chrome',
        colorHex: '#C0C0C0',
        role: 'Footwear Anchor',
        description: 'Reflective metallic patent leather on a low 40mm curved heel.',
        stylingTip: 'Infuses party looks with modern chrome brilliance.'
      }
    ];
    return selectPieceFromPool(eveningShoes, wardrobeShoes, seed, varOffset, excludedWardrobeIds);
  }

  if (occasion === 'wedding_guest') {
    const weddingShoes: OutfitPiece[] = [
      {
        category: 'footwear',
        name: 'Suede Ankle-Strap Block Heels',
        colorName: 'Nude Almond',
        colorHex: '#D8C4B6',
        role: 'Footwear Anchor',
        description: 'Refined 65mm block heel crafted for stable ceremonial footing.',
        stylingTip: 'Neutral tone matches skin tone to extend vertical visual proportion.'
      },
      {
        category: 'footwear',
        name: 'Pointed D\'Orsay Silk Satin Pumps',
        colorName: 'Champagne',
        colorHex: '#EADBC8',
        role: 'Footwear Anchor',
        description: 'Lustrous champagne satin with a delicate padded footbed.',
        stylingTip: 'Complements celebratory floor-length or midi hemlines.'
      },
      {
        category: 'footwear',
        name: 'Delicate Criss-Cross Metallic Stilettos',
        colorName: 'Pale Gold',
        colorHex: '#D4AF37',
        role: 'Footwear Anchor',
        description: 'Fine metallic straps that cradle the foot with understated celebration.',
        stylingTip: 'Echoes gold jewelry in your outfit harmony.'
      }
    ];
    return selectPieceFromPool(weddingShoes, wardrobeShoes, seed, varOffset, excludedWardrobeIds);
  }

  // Casual
  const casualShoes: OutfitPiece[] = [
    {
      category: 'footwear',
      name: 'Calfskin Horsebit Loafers',
      colorName: 'Espresso Brown',
      colorHex: '#3D2B1F',
      role: 'Footwear Anchor',
      description: 'Supple leather with antiqued brass horsebit hardware.',
      stylingTip: 'Wear sockless or with sheer micro-rib socks.'
    },
    {
      category: 'footwear',
      name: 'Low-Top Minimalist Calfskin Sneakers',
      colorName: 'Chalk White',
      colorHex: '#F7F4EE',
      role: 'Footwear Anchor',
      description: 'Italian leather with understated gum sole and tonal stitching.',
      stylingTip: 'Adds sporty ease while keeping the look curated.'
    },
    {
      category: 'footwear',
      name: 'Retro Low-Profile Gum-Sole Trainers',
      colorName: 'Chalk & Sage',
      colorHex: '#E8EAE6',
      role: 'Footwear Anchor',
      description: 'Vintage athletic silhouette in soft suede and nylon panels.',
      stylingTip: 'Grounds relaxed denim with modern street cred.'
    },
    {
      category: 'footwear',
      name: 'Suede Tassel Moccasins',
      colorName: 'Snuff Suede',
      colorHex: '#8C6541',
      role: 'Footwear Anchor',
      description: 'Hand-sewn unlined suede with decorative braided tassel.',
      stylingTip: 'Pairs seamlessly with chinos or rolled trousers.'
    }
  ];
  return selectPieceFromPool(casualShoes, wardrobeShoes, seed, varOffset, excludedWardrobeIds);
}

function getMatchingAccessories(
  occasion: Occasion,
  style: FashionStyle,
  baseColor: FashionColor,
  variation: 'classic' | 'contemporary' | 'tonal',
  metalTone: 'Warm Gold' | 'Cool Silver' | 'Rose Gold' | 'Mixed Metallics',
  weather: WeatherCondition,
  temperature: TemperatureRange,
  seed: number
): OutfitPiece[] {
  const accessories: OutfitPiece[] = [];
  const isRain = weather === 'rainy';
  const isSunny = weather === 'sunny';
  const isCold = temperature === 'below_10' || (weather === 'cold' && temperature !== '30_plus' && temperature !== '20_29');
  const isWindy = weather === 'windy';
  const varOffset = variation === 'classic' ? 0 : variation === 'contemporary' ? 1 : 2;

  // 1. Weather-protection accessories (seeded alternatives)
  if (isRain) {
    const rainGear: OutfitPiece[] = [
      {
        category: 'weather_protection',
        name: 'Compact Windproof Travel Umbrella',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Accent Accessory',
        description: 'Reinforced fiberglass frame that repels downpours without inverting.',
        stylingTip: 'Carried in hand or stowed cleanly in a tote.'
      },
      {
        category: 'weather_protection',
        name: 'Reinforced Carbon-Fiber Storm Umbrella',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        role: 'Accent Accessory',
        description: 'Auto-deploy storm canopy with Teflon water-shedding coating.',
        stylingTip: 'Keep strapped to your everyday carrier during rain.'
      }
    ];
    accessories.push(pickSeededItem(rainGear, seed, varOffset));
  } else if (isSunny) {
    const sunGear: OutfitPiece[] = [
      {
        category: 'accessories',
        name: 'UV400 Classic Acetate Sunglasses',
        colorName: 'Havana Tortoise',
        colorHex: '#3D2B1F',
        role: 'Accent Accessory',
        description: 'Polished acetate frame with 100% UV protection against midday glare.',
        stylingTip: 'Complements metal jewelry and tailored suiting.'
      },
      {
        category: 'accessories',
        name: 'Wire-Rim Round Polarized Sunglasses',
        colorName: 'Polished Gold',
        colorHex: '#D4AF37',
        role: 'Accent Accessory',
        description: 'Ultra-lightweight Japanese titanium wire frame with mineral green lenses.',
        stylingTip: 'Adds understated mid-century intellectual flair.'
      },
      {
        category: 'accessories',
        name: 'Oversized Cat-Eye Acetate Frames',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Accent Accessory',
        description: 'Sculpted thick-cut acetate with dramatic upward browline lift.',
        stylingTip: 'Pairs with sharp tailoring and sleek hair.'
      },
      {
        category: 'accessories',
        name: 'Square Geometric Acetate Sunglasses',
        colorName: 'Champagne Crystal',
        colorHex: '#E8DFC8',
        role: 'Accent Accessory',
        description: 'Translucent warm frame with warm brown gradient sun lenses.',
        stylingTip: 'Complements neutral and warm earth-toned ensembles.'
      }
    ];
    accessories.push(pickSeededItem(sunGear, seed, varOffset));
  } else if (isCold) {
    const coldGear: OutfitPiece[] = [
      {
        category: 'accessories',
        name: 'Oversized Ribbed Cashmere Scarf',
        colorName: 'Oatmeal Heather',
        colorHex: '#D8C4B6',
        role: 'Accent Accessory',
        description: '100% Mongolian cashmere wrap for vital neck and collar insulation.',
        stylingTip: 'Loop once around the collar to seal in thermal warmth.'
      },
      {
        category: 'accessories',
        name: 'Chunky Waffle-Knit Merino Beanie',
        colorName: 'Charcoal Heather',
        colorHex: '#4A4E57',
        role: 'Accent Accessory',
        description: 'Heavy honeycomb knit with double-fold ear brim for zero-degree winds.',
        stylingTip: 'Wear pulled down over ears for maximum warmth.'
      },
      {
        category: 'accessories',
        name: 'Cashmere-Lined Deerskin Leather Gloves',
        colorName: 'Espresso Brown',
        colorHex: '#3D2B1F',
        role: 'Accent Accessory',
        description: 'Windproof supple leather exterior with pure brushed cashmere lining.',
        stylingTip: 'Tuck into coat sleeves for complete cold-weather seal.'
      }
    ];
    accessories.push(pickSeededItem(coldGear, seed, varOffset));
  } else if (isWindy) {
    const windGear: OutfitPiece[] = [
      {
        category: 'accessories',
        name: 'Merino Wool Infinity Wrap',
        colorName: 'Charcoal Heather',
        colorHex: '#4A4E57',
        role: 'Accent Accessory',
        description: 'Fine-gauge merino wrap that prevents drafts without adding bulky silhouette.',
        stylingTip: 'Drape securely over shoulders to buffer brisk breezes.'
      },
      {
        category: 'accessories',
        name: 'Fine Cashmere Triangle Bandana',
        colorName: 'Camel Tan',
        colorHex: '#C19A6B',
        role: 'Accent Accessory',
        description: 'Featherlight triangular knit that knots snugly at the throat.',
        stylingTip: 'Tuck points cleanly under jacket lapels.'
      }
    ];
    accessories.push(pickSeededItem(windGear, seed, varOffset));
  }

  // 2. Bags (seeded alternatives)
  if (occasion === 'office') {
    const officeBags: OutfitPiece[] = [
      {
        category: 'bags',
        name: 'Structured Top-Handle Satchel',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Statement Bag',
        description: 'Clean architectural geometry with concealed magnetic closure and top handle.',
        stylingTip: 'Carried in hand for focused, modern executive presence.'
      },
      {
        category: 'bags',
        name: 'Architectural Leather East-West Tote',
        colorName: 'Rich Cognac',
        colorHex: '#8C4A2F',
        role: 'Statement Bag',
        description: 'Structured calfskin tote that accommodates everyday essentials with polished poise.',
        stylingTip: 'Carry by the top handle rather than shoulder for sharper posture.'
      },
      {
        category: 'bags',
        name: 'Minimalist Flap Saffiano Briefcase',
        colorName: 'Charcoal',
        colorHex: '#3F4349',
        role: 'Statement Bag',
        description: 'Scratch-resistant cross-grain leather with sleek brushed palladium hardware.',
        stylingTip: 'Slide under arm or hold firmly by the structured handle.'
      },
      {
        category: 'bags',
        name: 'Smooth Box-Calf Shoulder Tote',
        colorName: 'Espresso Brown',
        colorHex: '#3D2B1F',
        role: 'Statement Bag',
        description: 'Generous unlined leather tote that folds gently against the body.',
        stylingTip: 'Tuck over shoulder for understated boardroom utility.'
      }
    ];
    accessories.push(pickSeededItem(officeBags, seed, varOffset));
  } else if (occasion === 'party' || occasion === 'date_night' || occasion === 'wedding_guest') {
    const eveningBags: OutfitPiece[] = [
      {
        category: 'bags',
        name: 'Sculptural Metal Handle Pouch',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Statement Bag',
        description: 'Compact evening bag with magnetic snap closure and delicate shoulder chain.',
        stylingTip: 'Tuck chain inside to hold as a chic handheld clutch.'
      },
      {
        category: 'bags',
        name: 'Pleated Satin Evening Minaudière',
        colorName: 'Champagne',
        colorHex: '#EADBC8',
        role: 'Statement Bag',
        description: 'Rigid oval capsule wrapped in micro-pleated silk satin with jeweled push clasp.',
        stylingTip: 'Carry delicately in hand as evening jewelry.'
      },
      {
        category: 'bags',
        name: 'Geometric Acrylic Box Clutch with Metal Clasp',
        colorName: 'Tortoiseshell',
        colorHex: '#4A2E1B',
        role: 'Statement Bag',
        description: 'High-gloss mottled resin clutch that catches candlelight.',
        stylingTip: 'Hold flat against the palm.'
      },
      {
        category: 'bags',
        name: 'Micro Chain-Strap Quilted Leather Bag',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Statement Bag',
        description: 'Diamond-quilted lambskin with polished gourmette shoulder strap.',
        stylingTip: 'Wear crossbody or double the chain for shoulder carry.'
      }
    ];
    accessories.push(pickSeededItem(eveningBags, seed, varOffset));
  } else {
    // Casual
    const casualBags: OutfitPiece[] = [
      {
        category: 'bags',
        name: 'Pebbled Leather Crossbody Bag',
        colorName: 'Camel Tan',
        colorHex: '#C19A6B',
        role: 'Statement Bag',
        description: 'Hands-free casual carrier crafted in supple full-grain leather.',
        stylingTip: 'Adjust strap length so bag rests comfortably above the hip.'
      },
      {
        category: 'bags',
        name: 'Minimalist Slouchy Shoulder Bag',
        colorName: 'Ivory Cream',
        colorHex: '#F7F4EE',
        role: 'Statement Bag',
        description: 'Supple nappa leather with wide strap that moulds ergonomically to the shoulder.',
        stylingTip: 'Tuck snugly under the arm for effortless off-duty ease.'
      },
      {
        category: 'bags',
        name: 'Woven Raffia & Calfskin Bucket Bag',
        colorName: 'Natural & Tan',
        colorHex: '#D8C4B6',
        role: 'Statement Bag',
        description: 'Handwoven natural palm fiber trimmed with saddle-stitched calfskin.',
        stylingTip: 'Adds tactile organic texture to casual styling.'
      },
      {
        category: 'bags',
        name: 'Heavy Canvas & Saddle-Leather Utility Tote',
        colorName: 'Khaki & Espresso',
        colorHex: '#7A6A55',
        role: 'Statement Bag',
        description: 'Water-resistant 18oz duck canvas with bridle leather handles.',
        stylingTip: 'Carry by hand for grounded utilitarian style.'
      }
    ];
    accessories.push(pickSeededItem(casualBags, seed, varOffset));
  }

  // 3. Jewelry pieces matched to metal tone and seeded
  const metalName = metalTone === 'Warm Gold' ? '18K Yellow Gold' : metalTone === 'Cool Silver' ? 'Sterling Silver' : 'Mixed Gold & Silver';
  const metalHex = metalTone === 'Cool Silver' ? '#C0C0C0' : '#D4AF37';

  const jewelryOptions: OutfitPiece[] = [
    {
      category: 'accessories',
      name: `${metalName} Tubular Hoop Earrings`,
      colorName: metalName,
      colorHex: metalHex,
      role: 'Accent Accessory',
      description: 'Subtle sculpted geometry that catches natural daylight.',
      stylingTip: 'Keep jewelry edited: minimal hoops keep the focus on pristine tailoring.'
    },
    {
      category: 'accessories',
      name: `${metalName} Hammered Disc Pendant Necklace`,
      colorName: metalName,
      colorHex: metalHex,
      role: 'Accent Accessory',
      description: 'Hand-hammered organic disc on a delicate 18-inch fine link chain.',
      stylingTip: 'Rests neatly in the hollow of the collarbones.'
    },
    {
      category: 'accessories',
      name: `${metalName} Sculptural Minimalist Bangle Cuff`,
      colorName: metalName,
      colorHex: metalHex,
      role: 'Accent Accessory',
      description: 'Solid contour cuff with softly rounded edges and satin brushed finish.',
      stylingTip: 'Wear single cuff on dominant wrist over clean sleeve hem.'
    },
    {
      category: 'accessories',
      name: `${metalName} Sleek Snake Chain Choker`,
      colorName: metalName,
      colorHex: metalHex,
      role: 'Accent Accessory',
      description: 'Fluid herringbone weave that glides seamlessly against the neck.',
      stylingTip: 'Wear solo with open collars for subtle luminous reflection.'
    }
  ];
  accessories.push(pickSeededItem(jewelryOptions, seed, varOffset));

  return accessories;
}
