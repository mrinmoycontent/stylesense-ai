import { FASHION_COLORS, OCCASIONS_DATA } from '../data/fashionData';
import { OUTFIT_ARCHETYPES } from '../data/outfitCatalog';
import { enrichOutfitWithRealDerivations } from './outfitDerivations';
import { decodeHtmlEntities } from './textSanitizer';
import {
  FashionColor,
  FashionStyle,
  GarmentPreset,
  Occasion,
  OutfitPiece,
  OutfitRecommendation,
  TemperatureRange,
  WardrobeItem,
  WeatherCondition,
  WeatherStylingAdvice
} from '../types';

export interface WeatherStylingRequest {
  weather: WeatherCondition;
  temperature: TemperatureRange;
  occasion: Occasion;
  wardrobe?: WardrobeItem[];
  preferredStyle?: FashionStyle;
  seed?: number;
  activeGarment?: GarmentPreset | WardrobeItem | null;
}

export const WEATHER_ADVICE_CATALOG: Record<
  WeatherCondition,
  Record<TemperatureRange, WeatherStylingAdvice>
> = {
  sunny: {
    '30_plus': {
      weather: 'sunny',
      temperature: '30_plus',
      weatherTitle: 'Tropical High-Sun Heat (30°C+)',
      recommendedFabrics: ['Pure European Linen', 'Airy Poplin Cotton', 'Washed Silk Habotai'],
      avoidedFabrics: ['Thick Wool', 'Cashmere Overcoats', 'Heavy Knits', 'Synthetic Polyester'],
      layeringStrategy: 'Single breathable layer without heavy outer shells; relaxed silhouettes that allow continuous airflow.',
      essentialAccessories: ['UV400 Tortoiseshell Sunglasses', 'Woven Panama Sun Hat', 'Breathable Canvas Tote'],
      weatherRule: 'Extreme Heat Protocol: Strictly exclude overcoats, jackets, and winter knits. Wear light-reflective pale tones and breathable natural fibers.',
      colorPaletteTip: 'Light reflective neutrals: Ivory Cream, Powder Sky Blue, and Soft Ecru.'
    },
    '20_29': {
      weather: 'sunny',
      temperature: '20_29',
      weatherTitle: 'Warm Balmy Sunlight (20–29°C)',
      recommendedFabrics: ['Crisp Cotton Poplin', 'Lightweight Silk Crepe', 'Fine Linen Blends'],
      avoidedFabrics: ['Heavy Melton Wool', 'Thick Sweaters', 'Thermal Layers'],
      layeringStrategy: 'Breathable primary garments; lightweight unlined blazers only when required by occasion dress codes.',
      essentialAccessories: ['UV400 Aviator Sunglasses', 'Woven Leather Belt', 'Leather Crossbody'],
      weatherRule: 'Warm Day Balance: Favor unlined, breathable tailored pieces with sun-shielding eyewear.',
      colorPaletteTip: 'Sun-warmed neutrals: Camel Tan, Terracotta Rust, and Ivory Cream.'
    },
    '10_19': {
      weather: 'sunny',
      temperature: '10_19',
      weatherTitle: 'Crisp Sunny Day (10–19°C)',
      recommendedFabrics: ['Medium Cotton Gabardine', 'Fine Merino Wool', 'Tailored Worsted Wool'],
      avoidedFabrics: ['Heavy Arctic Down', 'Ultra-Sheer Summer Gauze'],
      layeringStrategy: 'Moderate two-to-three tier layering: crisp collared shirt with structured trench coat or wool blazer.',
      essentialAccessories: ['Classic Acetate Sunglasses', 'Silk Neckerchief', 'Calfskin Loafers'],
      weatherRule: 'Sun with Chilly Air: Solar brightness with cool ambient temperature requires a structured coat worn open in direct light.',
      colorPaletteTip: 'Transitional classics: Midnight Navy, Camel Tan, and Ivory.'
    },
    'below_10': {
      weather: 'sunny',
      temperature: 'below_10',
      weatherTitle: 'Freezing Winter Sunshine (<10°C)',
      recommendedFabrics: ['Heavy Double-Faced Wool', '2-Ply Mongolian Cashmere', 'Brushed Flannel'],
      avoidedFabrics: ['Thin Linens', 'Short Sleeves', 'Open Sandals'],
      layeringStrategy: 'Dense three-tier insulation: thermal base, cashmere sweater, and heavy wool overcoat.',
      essentialAccessories: ['Polarized Dark Sunglasses', 'Cashmere Fringe Scarf', 'Lined Leather Gloves'],
      weatherRule: 'Low-Angle Glare & Frost: Pair polarized UV sunglasses with full-length insulating wool coating to block sub-zero air.',
      colorPaletteTip: 'High-contrast winter palette: Obsidian Black, Charcoal Heather, and Ivory Cream.'
    }
  },
  cloudy: {
    '30_plus': {
      weather: 'cloudy',
      temperature: '30_plus',
      weatherTitle: 'Humid Overcast Heat (30°C+)',
      recommendedFabrics: ['Featherweight Linen', 'Seersucker Cotton', 'Airy Poplin'],
      avoidedFabrics: ['Heavy Denim', 'Heavy Coats', 'Wool Sweaters'],
      layeringStrategy: 'Single breathable layer with loose-fitting hems to counter muggy humidity.',
      essentialAccessories: ['Minimalist Leather Slides', 'Canvas Shoulder Bag', 'Breathable Linen Scarf'],
      weatherRule: 'Humid Heat Dissipation: When cloud cover traps humidity, maximize skin ventilation with loose open-weave cottons.',
      colorPaletteTip: 'Soft muted neutrals: Muted Sage, Ivory Cream, and Warm Taupe.'
    },
    '20_29': {
      weather: 'cloudy',
      temperature: '20_29',
      weatherTitle: 'Mild Overcast Day (20–29°C)',
      recommendedFabrics: ['Oxford Cotton', 'Fine Cotton Twill', 'Silk Crepe'],
      avoidedFabrics: ['Heavy Winter Coats', 'Thick Knits'],
      layeringStrategy: 'Single to dual modular layer; light unlined jacket only if required by office dress codes.',
      essentialAccessories: ['Compact Leather Tote', 'Pointed Flats or Loafers', 'Architectural Silver Hoops'],
      weatherRule: 'Temperate Cloud Balance: Diffuse light flatters architectural tailoring; keep fabric weights breathable and light.',
      colorPaletteTip: 'Monochrome and cool undertones: Charcoal Heather, Dusty Rosewater, and Navy.'
    },
    '10_19': {
      weather: 'cloudy',
      temperature: '10_19',
      weatherTitle: 'Chilly Overcast Afternoon (10–19°C)',
      recommendedFabrics: ['Virgin Wool Gabardine', 'Merino Wool Knit', 'Cotton Twill'],
      avoidedFabrics: ['Summer Linen', 'Open Sandals'],
      layeringStrategy: 'Double-breasted trench or tailored wool blazer over fine knitwear and trousers.',
      essentialAccessories: ['Brushed Wool Scarf', 'Calfskin Chelsea Boots', 'Structured Leather Satchel'],
      weatherRule: 'Diffused Chill Defense: Cool overcast days lack solar warming; maintain core warmth with merino knitwear and a tailored jacket.',
      colorPaletteTip: 'Subdued tones: Espresso Brown, Camel Tan, and Midnight Navy.'
    },
    'below_10': {
      weather: 'cloudy',
      temperature: 'below_10',
      weatherTitle: 'Cold Dreary Overcast (<10°C)',
      recommendedFabrics: ['Double-Faced Melton Wool', 'Heavy Mongolian Cashmere', 'Flannel Wool'],
      avoidedFabrics: ['Cotton Canvas Jackets', 'Thin Trousers', 'Open Footwear'],
      layeringStrategy: 'Full-length insulated wool overcoat, chunky turtleneck knit, and wool-flannel trousers.',
      essentialAccessories: ['Cashmere Fringe Scarf', 'Thermal-Lined Boots', 'Leather Tech Gloves'],
      weatherRule: 'Thermal Enclosure: Eliminate cold-air drafts at neck, wrists, and ankles with snug ribbing and high collars.',
      colorPaletteTip: 'Cocooning tones: Merlot Burgundy, Obsidian Black, and Charcoal Heather.'
    }
  },
  rainy: {
    '30_plus': {
      weather: 'rainy',
      temperature: '30_plus',
      weatherTitle: 'Warm Tropical Rain (30°C+)',
      recommendedFabrics: ['Quick-Drying Tech Poplin', 'Ultra-Lightweight Water-Repellent Cotton', 'Linen-Blend'],
      avoidedFabrics: ['Heavy Wool Coats', 'Untreated Suede', 'Pure Silk (water staining)'],
      layeringStrategy: 'Lightweight breathable base with an ultra-light packable rain jacket or compact umbrella; no heavy outerwear.',
      essentialAccessories: ['Compact Windproof Travel Umbrella', 'Water-Resistant Rubber-Soled Loafers', 'Treated Leather Bag'],
      weatherRule: 'Warm-Rain Hydrophobia: Pair lightweight breathable garments with a compact umbrella and water-resistant rubber-soled footwear; strictly avoid heavy winter coats.',
      colorPaletteTip: 'Grounding shades: Midnight Navy, Obsidian Black, and Muted Sage.'
    },
    '20_29': {
      weather: 'rainy',
      temperature: '20_29',
      weatherTitle: 'Mild Rain Showers (20–29°C)',
      recommendedFabrics: ['Water-Repellent Cotton Gabardine', 'Lightweight Mac Twill', 'Crisp Poplin'],
      avoidedFabrics: ['Untreated Suede', 'Heavy Winter Wool', 'Floor-Sweeping Maxi Skirts'],
      layeringStrategy: 'Lightweight water-repellent unlined trench or mac buttoned over breathable shirting; cropped ankle trousers.',
      essentialAccessories: ['Architectural Wooden-Handle Umbrella', 'Water-Resistant Calfskin Loafers with Rubber Sole', 'Waterproof Tote'],
      weatherRule: 'Rain-Ready Breathability: Rely on water-repellent unlined gabardine and rubberized soles; avoid suede and heavy winter coatings.',
      colorPaletteTip: 'Rain-resistant classics: Camel Tan, Midnight Navy, and Ivory.'
    },
    '10_19': {
      weather: 'rainy',
      temperature: '10_19',
      weatherTitle: 'Cold Drizzling Rain (10–19°C)',
      recommendedFabrics: ['Waterproof Wool Gabardine', 'Lined Cotton Trench', 'Merino Knit Base'],
      avoidedFabrics: ['Untreated Suede Footwear', 'White/Cream Floor-Length Trousers'],
      layeringStrategy: 'Storm-flapped belted trench coat over fine merino wool knit and dark tailored trousers.',
      essentialAccessories: ['Waterproof Leather Chelsea Boots', 'Wind-Resistant Umbrella', 'Water-Repellent Crossbody'],
      weatherRule: 'Splash Defense Protocol: Dark-colored trousers and sturdy rubber-soled Chelsea boots prevent damp splatters while trench flaps repel downpours.',
      colorPaletteTip: 'Deep resilient tones: Obsidian Black, Espresso Brown, and Midnight Navy.'
    },
    'below_10': {
      weather: 'rainy',
      temperature: 'below_10',
      weatherTitle: 'Freezing Sleet & Rain (<10°C)',
      recommendedFabrics: ['Weatherproof Heavy Wool', 'Technical Stormproof Shell', 'Cashmere Lining'],
      avoidedFabrics: ['Canvas Sneakers', 'Unlined Cotton Coats', 'Thin Trousers'],
      layeringStrategy: 'Long stormproof insulated wool coat with high stand collar, thick knitwear, and weather-sealed boots.',
      essentialAccessories: ['Treated Leather Waterproof Boots', 'Heavy Fiberglass Umbrella', 'Waterproof Lined Gloves'],
      weatherRule: 'Sub-Zero Moisture Shield: Rain combined with freezing temperatures multiplies windchill; seal outer edges with durable water-repellent finishes.',
      colorPaletteTip: 'Protective storm armor: Obsidian Black, Charcoal Heather, and Merlot Burgundy.'
    }
  },
  windy: {
    '30_plus': {
      weather: 'windy',
      temperature: '30_plus',
      weatherTitle: 'Warm High Winds (30°C+)',
      recommendedFabrics: ['Structured Cotton Drill', 'Crisp Poplin', 'Fitted Ribbed Cotton'],
      avoidedFabrics: ['Cashmere Overcoats', 'Heavy Jackets', 'Wide Billowy Chiffon', 'Loose Lightweight Scarves'],
      layeringStrategy: 'Fitted, breathable garments tucked firmly into high-waisted bottoms; no heavy jackets or winter layers.',
      essentialAccessories: ['Hair Clamp or Sleek Headband', 'Hands-Free Crossbody Bag', 'Secure UV Sunglasses'],
      weatherRule: 'Warm-Wind Stability: Do not recommend heavy coats in hot weather. Keep silhouettes secure and streamlined with breathable cottons.',
      colorPaletteTip: 'Sun-warmed earth: Terracotta Rust, Camel Tan, and Ivory.'
    },
    '20_29': {
      weather: 'windy',
      temperature: '20_29',
      weatherTitle: 'Breezy Gusty Day (20–29°C)',
      recommendedFabrics: ['Structured Cotton Twill', 'Tailored Denim', 'Fine Cotton Poplin'],
      avoidedFabrics: ['Full Circle Skirts', 'Unanchored Capes', 'Heavy Winter Overcoats'],
      layeringStrategy: 'Buttoned lightweight blazer or unlined belted trench with straight-leg trousers.',
      essentialAccessories: ['Structured Crossbody Bag', 'Secure Ankle Boots or Loafers', 'Sleek Sunglasses'],
      weatherRule: 'Cinching Defense: Belt your light outerwear firmly to prevent gusts from billowing through.',
      colorPaletteTip: 'Architectural lines: Charcoal Heather, Midnight Navy, and Ivory.'
    },
    '10_19': {
      weather: 'windy',
      temperature: '10_19',
      weatherTitle: 'Brisk Chilly Gales (10–19°C)',
      recommendedFabrics: ['Tightly Woven Wool', 'Supple Lambskin Leather', 'Heavy Cotton Twill'],
      avoidedFabrics: ['Loose Open-Knit Sweaters', 'Flyaway Scarves'],
      layeringStrategy: 'Leather moto jacket or wind-resistant double-breasted trench over tight-gauge knitwear.',
      essentialAccessories: ['Tucked-in Silk or Wool Scarf', 'Fitted Beanie or Beret', 'Laced Leather Boots'],
      weatherRule: 'Wind-Break Principle: Dense woven shells stop wind penetration better than loose fluffy knits; layer tightly-woven shells on the outside.',
      colorPaletteTip: 'Resolute neutrals: Espresso Brown, Obsidian Black, and Camel Tan.'
    },
    'below_10': {
      weather: 'windy',
      temperature: 'below_10',
      weatherTitle: 'Freezing Blustery Chill (<10°C)',
      recommendedFabrics: ['Windproof Heavy Wool Melton', 'Dense 4-Ply Cashmere', 'Thermal Twill'],
      avoidedFabrics: ['Flyaway Capes', 'Unlined Garments', 'Canvas Shoes'],
      layeringStrategy: 'Long stormproof wool coat with buttoned throat latch, turtleneck knit, and heavy wool trousers.',
      essentialAccessories: ['Cashmere Snug Cowl', 'Windproof Leather Gloves', 'Insulated Lug-Sole Boots'],
      weatherRule: 'Windchill Elimination: Severe wind accelerates body cooling; keep throats, ears, and wrists completely sealed.',
      colorPaletteTip: 'Protective dark tones: Obsidian Black, Midnight Navy, and Charcoal Heather.'
    }
  },
  cold: {
    '30_plus': {
      weather: 'cold',
      temperature: '30_plus',
      weatherTitle: 'Indoor Air-Conditioned Chill (Exterior 30°C+)',
      recommendedFabrics: ['Lightweight Cotton-Silk', 'Breathable Linen-Cotton', 'Airy Poplin'],
      avoidedFabrics: ['Heavy Fur', 'Heavy Melton Overcoats', 'Snow Boots'],
      layeringStrategy: 'Keep a lightweight, breathable cardigan or unlined blazer on hand for aggressive indoor air conditioning.',
      essentialAccessories: ['Foldable Silk-Cashmere Wrap', 'Pointed Loafers', 'Leather Tote'],
      weatherRule: 'Microclimate Transition: In exterior 30°C heat with chilly indoor AC, wear breathable base clothing with an easily removable light wrap.',
      colorPaletteTip: 'Ivory Cream, Camel Tan, and Sky Blue.'
    },
    '20_29': {
      weather: 'cold',
      temperature: '20_29',
      weatherTitle: 'Evening Temperature Drop (20–29°C)',
      recommendedFabrics: ['Medium Cotton Twill', 'Fine Merino Knit', 'Washed Silk'],
      avoidedFabrics: ['Heavy Winter Parkas', 'Sub-Zero Boots'],
      layeringStrategy: 'Light blazer or fine knit cardigan draped over shoulders for twilight breezes.',
      essentialAccessories: ['Light Wool Scarf', 'Leather Loafers', 'Structured Crossbody'],
      weatherRule: 'Evening Transition: A lightweight transitional jacket draped over shoulders maintains evening comfort without overheating.',
      colorPaletteTip: 'Camel Tan, Midnight Navy, and Dusty Rosewater.'
    },
    '10_19': {
      weather: 'cold',
      temperature: '10_19',
      weatherTitle: 'Brisk Autumn / Early Winter (10–19°C)',
      recommendedFabrics: ['100% Virgin Wool', 'Mongolian Cashmere', 'Heavy Flannel'],
      avoidedFabrics: ['Thin Poplin without Underlayer', 'Open Canvas Shoes'],
      layeringStrategy: 'Mid-weight overcoat or trench layered over cashmere crewneck and pleated trousers.',
      essentialAccessories: ['Wool Scarf', 'Calfskin Ankle Boots', 'Leather Gloves'],
      weatherRule: 'Core Temperature Protection: Keep torso insulated with 2-ply natural cashmere while trousers remain crisp and tailored.',
      colorPaletteTip: 'Espresso Brown, Camel Tan, and Merlot Burgundy.'
    },
    'below_10': {
      weather: 'cold',
      temperature: 'below_10',
      weatherTitle: 'Severe Winter Frost (<10°C)',
      recommendedFabrics: ['Double-Faced Heavy Wool Melton', 'Dense 4-Ply Cashmere', 'Thermal Flannel Lining'],
      avoidedFabrics: ['Synthetic Polyester', 'Linen', 'Thin Denim', 'Open Sandals'],
      layeringStrategy: 'Full-length insulated wool overcoat over chunky ribbed turtleneck, wool trousers, and thermal tights.',
      essentialAccessories: ['Oversized Cashmere Scarf', 'Fleece-Lined Leather Gloves', 'Shearling-Lined Boots'],
      weatherRule: 'Natural Thermostat Protocol: Natural wool and cashmere regulate body temperature dynamically without causing overheating indoors.',
      colorPaletteTip: 'Obsidian Black, Charcoal Heather, and Merlot Burgundy.'
    }
  }
};

// ============================================================================
// STRICT WEATHER VALIDATOR
// Weather suitability must be a hard constraint!
// ============================================================================

export function validateOutfitWeatherRules(
  pieces: OutfitPiece[],
  weather: WeatherCondition,
  temperature: TemperatureRange
): { valid: boolean; reason?: string } {
  const isHot = temperature === '30_plus';
  const isWarm = temperature === '20_29';
  const isCold = temperature === 'below_10' || (weather === 'cold' && temperature !== '30_plus' && temperature !== '20_29');
  const isRain = weather === 'rainy';
  const isWind = weather === 'windy';

  for (const piece of pieces) {
    const text = `${piece.name} ${piece.description} ${piece.stylingTip}`.toLowerCase();

    // 1. HOT WEATHER (30°C+) STRICT EXCLUSIONS
    if (isHot) {
      if (
        text.includes('cashmere overcoat') ||
        text.includes('wool overcoat') ||
        text.includes('melton') ||
        text.includes('heavy jacket') ||
        text.includes('winter coat') ||
        text.includes('double-faced wool') ||
        text.includes('sweater') ||
        text.includes('turtleneck') ||
        text.includes('thick wool') ||
        text.includes('shearling') ||
        text.includes('gloves') ||
        text.includes('beanie') ||
        text.includes('thermal') ||
        text.includes('insulated boots') ||
        text.includes('knee-high boots')
      ) {
        return {
          valid: false,
          reason: `Piece "${piece.name}" is incompatible with 30°C+ hot weather. Heavy layers, sweaters, and winterwear are strictly prohibited.`
        };
      }

      // In hot weather, if outerwear is present, it MUST ONLY be lightweight rain protection if raining!
      if (piece.category === 'outerwear' && !isRain) {
        return {
          valid: false,
          reason: `Outerwear is not permitted in 30°C+ non-rainy conditions.`
        };
      }
    }

    // 2. WARM WEATHER (20–29°C) STRICT EXCLUSIONS
    if (isWarm) {
      if (
        text.includes('cashmere overcoat') ||
        text.includes('heavy wool overcoat') ||
        text.includes('melton') ||
        text.includes('heavy knit') ||
        text.includes('shearling') ||
        text.includes('winter coat') ||
        text.includes('thermal tights')
      ) {
        return {
          valid: false,
          reason: `Piece "${piece.name}" is too heavy for 20–29°C warm weather.`
        };
      }
    }

    // 3. COLD WEATHER (<10°C) STRICT REQUIREMENTS
    if (isCold) {
      if (
        text.includes('sandals') ||
        text.includes('slides') ||
        text.includes('short sleeves') ||
        text.includes('tank top') ||
        text.includes('sundress') ||
        text.includes('shorts')
      ) {
        return {
          valid: false,
          reason: `Piece "${piece.name}" provides insufficient insulation for freezing conditions (<10°C).`
        };
      }
    }

    // 4. RAINY WEATHER FOOTWEAR & FABRIC EXCLUSIONS
    if (isRain) {
      if (piece.category === 'footwear' && text.includes('suede')) {
        return {
          valid: false,
          reason: `Suede footwear "${piece.name}" is strictly prohibited in rainy weather due to water damage.`
        };
      }
    }
  }

  // Cold weather must have closed footwear and an outer/insulating layer
  if (isCold) {
    const hasOuterOrKnit = pieces.some(
      p =>
        p.category === 'outerwear' ||
        p.name.toLowerCase().includes('sweater') ||
        p.name.toLowerCase().includes('knit') ||
        p.name.toLowerCase().includes('turtleneck') ||
        p.name.toLowerCase().includes('coat')
    );
    if (!hasOuterOrKnit) {
      return {
        valid: false,
        reason: 'Cold weather requires an insulating sweater, knitwear, or coat.'
      };
    }
  }

  return { valid: true };
}

// ============================================================================
// CURATED RECOMMENDATION GENERATION
// Following strict priority:
// 1. Weather & Temperature
// 2. Occasion
// 3. Garment compatibility & color coordination
// 4. Accessories
// ============================================================================

export function generateWeatherOutfitRecommendations(request: WeatherStylingRequest): OutfitRecommendation[] {
  const { weather, temperature, occasion, wardrobe = [], seed = 0 } = request;
  const advice = WEATHER_ADVICE_CATALOG[weather][temperature];

  const matchingArchetypes = OUTFIT_ARCHETYPES.filter(a => a.occasion === occasion);

  interface ValidatedCandidate {
    archetype: (typeof OUTFIT_ARCHETYPES)[0];
    rec: OutfitRecommendation;
  }

  const validCandidates: ValidatedCandidate[] = [];

  for (let i = 0; i < matchingArchetypes.length; i++) {
    const arch = matchingArchetypes[i];
    const built = arch.buildOutfit(weather, temperature, wardrobe);

    // If user has an active or uploaded garment, incorporate it into the outfit
    let candidatePieces = [...built.pieces];
    if (request.activeGarment) {
      const g = request.activeGarment;
      const isUploaded = Boolean(g.imageUrl && !('createdAt' in g));
      const isOwned = 'createdAt' in g;
      const activePiece: OutfitPiece = {
        category: g.category,
        name: decodeHtmlEntities(g.name),
        colorName: decodeHtmlEntities(g.colorName),
        colorHex: g.colorHex,
        role: 'Core Piece',
        imageUrl: g.imageUrl,
        sourceLabel: isUploaded ? 'Uploaded Piece' : isOwned ? 'From Your Wardrobe' : 'Curated Catalog',
        isWardrobeOwned: isOwned,
        description: isUploaded
          ? `Your uploaded ${decodeHtmlEntities(g.name)} (${decodeHtmlEntities(g.colorName)}) serves as the foundational anchor.`
          : `From your wardrobe: ${decodeHtmlEntities(g.name)}.`,
        stylingTip: g.specificType ? `Calibrated around your ${g.specificType}.` : 'Grounds the weather-adapted ensemble.'
      };

      const matchIdx = candidatePieces.findIndex(p => p.category === g.category);
      if (matchIdx !== -1) {
        candidatePieces[matchIdx] = activePiece;
      } else if (candidatePieces.length > 0) {
        candidatePieces[0] = activePiece;
      }
    }

    const validation = validateOutfitWeatherRules(candidatePieces, weather, temperature);

    if (validation.valid) {
      const wardrobeMatches = candidatePieces.filter(p => p.isWardrobeOwned).length;
      const catalogMatches = candidatePieces.length - wardrobeMatches;

      const rec: OutfitRecommendation = {
        id: `weather-${arch.id}-${weather}-${temperature}-${seed}-${i}`,
        title: arch.title,
        subtitle: arch.subtitle,
        aesthetic: arch.aesthetic,
        occasion,
        style: arch.style,
        corePieceName: candidatePieces[0]?.name || 'Tailored Staple',
        corePieceCategory: candidatePieces[0]?.category || 'tops',
        corePieceColor: candidatePieces[0]?.colorName || 'Neutral',
        pieces: candidatePieces,
        colorHarmony: built.colorHarmony,
        recommendedMetal: built.recommendedMetal,
        stylistRationale: built.stylistRationale,
        proStylistRule: built.proStylistRule,
        textureTip: built.textureTip,
        formalityScore: arch.formalityScore,
        silhouetteName: arch.silhouetteName,
        wardrobeMatchCount: wardrobeMatches,
        catalogMatchCount: catalogMatches,
        weatherCompatibility: {
          condition: weather,
          temperature,
          badge: `${getWeatherLabel(weather)} · ${arch.silhouetteName}`
        }
      };

      validCandidates.push({ archetype: arch, rec });
    }
  }

  const selectedLooks: OutfitRecommendation[] = [];
  const selectedSilhouetteKeys = new Set<string>();

  if (validCandidates.length > 0) {
    // Deterministic seeded rotation across candidate archetypes
    const startOffset = Math.abs(seed) % validCandidates.length;

    // Pick distinct silhouette keys starting from startOffset to ensure genuine diversity
    for (let step = 0; step < validCandidates.length; step++) {
      const idx = (startOffset + step) % validCandidates.length;
      const candidate = validCandidates[idx];
      const key = candidate.archetype.silhouetteKey;

      if (!selectedSilhouetteKeys.has(key)) {
        selectedSilhouetteKeys.add(key);
        selectedLooks.push(candidate.rec);
        if (selectedLooks.length >= 4) break; // Offer up to 4 distinct options
      }
    }
  }

  // Fallbacks if fewer than 3 options were found
  if (selectedLooks.length < 3) {
    const look1 = buildPrimaryWeatherLook(request, advice, wardrobe);
    if (look1 && validateOutfitWeatherRules(look1.pieces, weather, temperature).valid) {
      if (!selectedLooks.some(l => l.title === look1.title)) {
        selectedLooks.push(look1);
      }
    }

    if (selectedLooks.length < 3) {
      const look2 = buildAlternativeWeatherLook(request, advice, wardrobe);
      if (look2 && validateOutfitWeatherRules(look2.pieces, weather, temperature).valid) {
        if (!selectedLooks.some(l => l.title === look2.title)) {
          selectedLooks.push(look2);
        }
      }
    }

    if (selectedLooks.length < 3) {
      const look3 = buildTonalWeatherLook(request, advice, wardrobe);
      if (look3 && validateOutfitWeatherRules(look3.pieces, weather, temperature).valid) {
        if (!selectedLooks.some(l => l.title === look3.title)) {
          selectedLooks.push(look3);
        }
      }
    }
  }

  // Normalize piece categories and enrich every recommendation with real derivations
  return selectedLooks.map(look => {
    const normalizedPieces = look.pieces.map(piece => {
      if (piece.name.toLowerCase().includes('umbrella')) {
        return {
          ...piece,
          category: 'weather_protection' as const,
          role: 'Weather protection' as const
        };
      }
      return piece;
    });

    return enrichOutfitWithRealDerivations(
      { ...look, pieces: normalizedPieces },
      weather,
      temperature
    );
  });
}

// ----------------------------------------------------------------------------
// BUILDER 1: Primary Weather Look
// ----------------------------------------------------------------------------

function buildPrimaryWeatherLook(
  req: WeatherStylingRequest,
  advice: WeatherStylingAdvice,
  wardrobe: WardrobeItem[]
): OutfitRecommendation {
  const isHot = req.temperature === '30_plus';
  const isWarm = req.temperature === '20_29';
  const isCool = req.temperature === '10_19';
  const isCold = req.temperature === 'below_10' || (req.weather === 'cold' && req.temperature !== '30_plus' && req.temperature !== '20_29');
  const isRain = req.weather === 'rainy';
  const isWind = req.weather === 'windy';

  const pieces: OutfitPiece[] = [];

  // 1. TOP & BOTTOM / DRESS based on Weather + Occasion
  if (req.occasion === 'office') {
    if (isHot) {
      // Sunny/Cloudy/Windy 30°C+ Office
      pieces.push({
        category: 'tops',
        name: 'Crisp Short-Sleeve Egyptian Cotton Poplin Shirt',
        colorName: 'Ivory Cream',
        colorHex: '#F7F4EE',
        role: 'Core Piece',
        description: 'Lightweight high-thread-count poplin with structured collar and tailored short sleeves.',
        stylingTip: 'Tuck cleanly into trousers for polished boardroom elegance without heat retention.'
      });
      pieces.push({
        category: 'bottoms',
        name: 'Tailored Lightweight Tropical Wool Trousers',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        role: 'Essential Bottom',
        description: 'Ultra-lightweight high-twist wool woven specifically for breathability in warm climates.',
        stylingTip: 'High-waisted fit maintains sharp drape even in summer temperatures.'
      });
      pieces.push({
        category: 'footwear',
        name: isRain
          ? 'Calfskin Loafers with Water-Resistant Rubber Soles'
          : 'Breathable Calfskin Horsebit Loafers',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Supple full-grain leather with breathable lining and antiqued hardware.',
        stylingTip: 'Wear sockless or with breathable invisible no-show socks.'
      });
      if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Ultra-Lightweight Water-Repellent Rain Mac',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Unlined technical storm-shedding shell with sealed seams and underarm eyelet vents.',
          stylingTip: 'Pack away into your tote once inside.'
        });
        pieces.push({
          category: 'accessories',
          name: 'Compact Windproof Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Reinforced fiberglass frame that repels downpours without flipping in gusts.',
          stylingTip: 'Compact design fits effortlessly into your work briefcase.'
        });
      } else {
        pieces.push({
          category: 'accessories',
          name: 'UV400 Classic Tortoiseshell Sunglasses',
          colorName: 'Havana Tortoise',
          colorHex: '#3D2B1F',
          role: 'Accent Accessory',
          description: 'Polished acetate frame with 100% UV protection for midday commute glare.',
          stylingTip: 'Complements gold jewelry and tailored suiting.'
        });
      }
    } else if (isWarm) {
      // 20–29°C Office
      pieces.push({
        category: 'tops',
        name: 'Long-Sleeve Egyptian Cotton Poplin Shirt',
        colorName: 'Ivory Cream',
        colorHex: '#F7F4EE',
        role: 'Core Piece',
        description: 'Breathable structured collar shirt in pure natural cotton.',
        stylingTip: 'Button collar and pair with subtle chain.'
      });
      pieces.push({
        category: 'bottoms',
        name: isRain
          ? 'Cropped Ankle-Length Tailored Wool Trousers'
          : 'Tailored Pleated Straight-Leg Trousers',
        colorName: 'Charcoal Heather',
        colorHex: '#4A4E57',
        role: 'Essential Bottom',
        description: 'Refined center-crease trousers with curtain waistband.',
        stylingTip: isRain ? 'Cropped above the ankle break to prevent wet pavement splashes.' : 'Elongates line over footwear.'
      });
      if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Lightweight Gabardine Trench',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Unlined water-repellent cotton gabardine engineered to shed precipitation without overheating.',
          stylingTip: 'Button front storm latch when walking in showers.'
        });
        pieces.push({
          category: 'accessories',
          name: 'Architectural Wooden-Handle Umbrella',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Accent Accessory',
          description: 'Waterproof double-canopy construction with carved wooden grip.',
          stylingTip: 'Adds classic Savile Row dignity in rain.'
        });
      } else {
        pieces.push({
          category: 'outerwear',
          name: 'Unlined Lightweight Tailored Cotton Blazer',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Breathable single-breasted blazer without heavy shoulder padding or cupro lining.',
          stylingTip: 'Push sleeves to mid-forearm for relaxed office presence.'
        });
        pieces.push({
          category: 'accessories',
          name: 'Structured Architectural Leather East-West Tote',
          colorName: 'Rich Cognac',
          colorHex: '#8C4A2F',
          role: 'Statement Bag',
          description: 'Calfskin carryall with room for laptop and documents.',
          stylingTip: 'Carried gracefully by top handle.'
        });
      }
      pieces.push({
        category: 'footwear',
        name: isRain
          ? 'Water-Resistant Calfskin Loafers with Rubber Sole'
          : 'Pointed Kitten-Heel Slingbacks',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Comfortable polished leather footwear appropriate for boardroom floors.',
        stylingTip: 'Non-slip grip keeps stride steady.'
      });
    } else if (isCool) {
      // 10–19°C Office
      pieces.push({
        category: 'tops',
        name: 'Crisp Poplin Button-Down layered with Fine Merino Knit',
        colorName: 'Ivory Cream',
        colorHex: '#F7F4EE',
        role: 'Essential Top',
        description: 'Layered breathable cotton shirting under lightweight 100% merino crewneck.',
        stylingTip: 'Expose collar and cuffs cleanly past sweater hem.'
      });
      pieces.push({
        category: 'bottoms',
        name: 'Tailored Pleated Virgin Wool Trousers',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        role: 'Essential Bottom',
        description: 'Super-120s worsted wool with permanent center crease.',
        stylingTip: 'Pairs with leather belt matching footwear.'
      });
      pieces.push({
        category: 'outerwear',
        name: isRain
          ? 'Double-Breasted Weatherproof Gabardine Trench'
          : 'Tailored Double-Breasted Wool Blazer',
        colorName: isRain ? 'Camel Tan' : 'Charcoal Heather',
        colorHex: isRain ? '#C19A6B' : '#4A4E57',
        role: 'Core Piece',
        description: 'Structured tailoring providing moderate warmth and wind resistance.',
        stylingTip: 'Keeps silhouette sharp against chilly morning breezes.'
      });
      pieces.push({
        category: 'footwear',
        name: isRain
          ? 'Treated Leather Chelsea Boots with Storm Sole'
          : 'Calfskin Horsebit Loafers',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Polished calfskin with durable sole.',
        stylingTip: 'Polished finish completes formal attire.'
      });
      pieces.push({
        category: 'accessories',
        name: isRain ? 'Windproof Travel Umbrella' : 'Silk Neckerchief & Leather Portfolio',
        colorName: 'Merlot Burgundy',
        colorHex: '#581825',
        role: 'Accent Accessory',
        description: 'Refined practical asset suited for professional commute.',
        stylingTip: 'Tucks neatly into coat pocket or carryall.'
      });
    } else {
      // Below 10°C / Cold Office
      pieces.push({
        category: 'tops',
        name: 'Chunky Ribbed Cashmere Turtleneck over Cotton Poplin Shirt',
        colorName: 'Oatmeal Cashmere',
        colorHex: '#F7F4EE',
        role: 'Essential Top',
        description: 'Ultra-soft 2-ply Mongolian cashmere providing core thermal insulation.',
        stylingTip: 'Fold high neck neatly for a sculpted collar line.'
      });
      pieces.push({
        category: 'bottoms',
        name: 'Pleated Heavy Flannel Wool Trousers',
        colorName: 'Charcoal Heather',
        colorHex: '#4A4E57',
        role: 'Essential Bottom',
        description: 'Brushed heavy virgin wool flannel that insulates legs against sub-zero drafts.',
        stylingTip: 'Substantial fabric weight maintains immaculate vertical crease.'
      });
      pieces.push({
        category: 'outerwear',
        name: 'Heavy Double-Faced Wool Melton Overcoat',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Core Piece',
        description: 'Dense 850gsm melton wool with padded shoulders and deep hand-warmer pockets.',
        stylingTip: 'Button all front closures when outdoors.'
      });
      pieces.push({
        category: 'footwear',
        name: 'Insulated Calfskin Chelsea Boots with Dainite Rubber Sole',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Weather-sealed Goodyear welt construction with shearling-cushioned insole.',
        stylingTip: 'Protects ankles from ice and slush.'
      });
      pieces.push({
        category: 'accessories',
        name: 'Heavy Cashmere Fringe Scarf & Fleece-Lined Leather Gloves',
        colorName: 'Merlot Burgundy',
        colorHex: '#581825',
        role: 'Accent Accessory',
        description: 'Supple lambskin gloves with conductive tech fingertips and dense wool scarf.',
        stylingTip: 'Wrap scarf in double Parisian knot.'
      });
    }
  } else if (req.occasion === 'casual') {
    if (isHot) {
      // Sunny/Cloudy/Windy 30°C+ Casual
      pieces.push({
        category: 'tops',
        name: 'Lightweight Supima Cotton Crewneck Tee',
        colorName: 'Pure White',
        colorHex: '#F7F4EE',
        role: 'Core Piece',
        description: 'Featherweight organic long-staple cotton offering continuous breathability.',
        stylingTip: isWind ? 'Tuck firmly into waistband to prevent billowing in gusts.' : 'Wear loose and relaxed.'
      });
      pieces.push({
        category: 'bottoms',
        name: 'Breathable Pure Linen Drawstring Pants',
        colorName: 'Camel Tan',
        colorHex: '#C19A6B',
        role: 'Essential Bottom',
        description: 'Relaxed airy linen trousers that stand off the skin to encourage airflow.',
        stylingTip: 'Roll cuffs once over lightweight footwear.'
      });
      pieces.push({
        category: 'footwear',
        name: isRain
          ? 'Water-Resistant Rubber-Soled Low Canvas Sneakers'
          : 'Minimalist Leather Slides',
        colorName: 'Warm Cognac',
        colorHex: '#8C4A2F',
        role: 'Footwear Anchor',
        description: 'Comfortable, lightweight open footwear crafted for heat dissipation.',
        stylingTip: 'Provides effortless summer ease.'
      });
      pieces.push({
        category: 'accessories',
        name: isWind
          ? 'Secure UV400 Sunglasses & Crossbody Pouch'
          : isRain
          ? 'Compact Travel Umbrella'
          : 'Woven Panama Sun Hat & UV400 Sunglasses',
        colorName: 'Sand Beige',
        colorHex: '#D4C9BC',
        role: 'Accent Accessory',
        description: 'Protective accessory shielding eyes and face from intense ultraviolet radiation.',
        stylingTip: 'Keeps hands free and sun glare minimized.'
      });
      if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Ultra-Lightweight Packable Windproof Rain Jacket',
          colorName: 'Muted Sage',
          colorHex: '#94A187',
          role: 'Complementary Layer',
          description: 'Breathable, unlined featherweight ripstop jacket with water-shedding DWR finish.',
          stylingTip: 'Weighs only a few ounces and folds into its own pocket.'
        });
      }
    } else if (isWarm) {
      // 20–29°C Casual
      pieces.push({
        category: 'tops',
        name: 'Relaxed French Breton Stripe Cotton Top',
        colorName: 'Navy & Ivory',
        colorHex: '#1B263B',
        role: 'Core Piece',
        description: 'Midweight breathable combed cotton knit with boat neckline.',
        stylingTip: 'Push sleeves to elbows for Parisian ease.'
      });
      pieces.push({
        category: 'bottoms',
        name: 'Classic Straight-Leg Vintage Denim',
        colorName: 'Faded Indigo',
        colorHex: '#253B59',
        role: 'Essential Bottom',
        description: '100% non-stretch cotton denim with natural wash.',
        stylingTip: 'Ankle break spotlights clean sneakers.'
      });
      pieces.push({
        category: 'footwear',
        name: isRain
          ? 'Water-Resistant Leather Low-Top Sneakers'
          : 'Minimalist White Leather Sneakers',
        colorName: 'Chalk White',
        colorHex: '#F7F4EE',
        role: 'Footwear Anchor',
        description: 'Supple calfskin with supportive cupsole.',
        stylingTip: 'Keep leather treated with water-repellent spray.'
      });
      if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Lightweight Unlined Hooded Rain Parka',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Breathable water-shedding hooded shell.',
          stylingTip: 'Zip front to chin when stepping into rain.'
        });
        pieces.push({
          category: 'accessories',
          name: 'Compact Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Sturdy wind-resistant travel canopy.',
          stylingTip: 'Stows easily in tote.'
        });
      } else {
        pieces.push({
          category: 'accessories',
          name: 'Pebbled Leather Saddle Crossbody Bag',
          colorName: 'Warm Tan',
          colorHex: '#C19A6B',
          role: 'Statement Bag',
          description: 'Hands-free curved leather pouch with brass hardware.',
          stylingTip: 'Wear across chest.'
        });
      }
    } else if (isCool) {
      // 10–19°C Casual
      pieces.push({
        category: 'tops',
        name: 'Oatmeal Cashmere Crewneck Sweater over White Tee',
        colorName: 'Ivory Cream',
        colorHex: '#F7F4EE',
        role: 'Essential Top',
        description: 'Soft 2-ply cashmere knit providing comfortable warmth without weight.',
        stylingTip: 'Expose white T-shirt collar line for relaxed contrast.'
      });
      pieces.push({
        category: 'bottoms',
        name: 'Tailored Cotton Chino Trousers',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        role: 'Essential Bottom',
        description: 'Durable heavyweight cotton twill with relaxed straight cut.',
        stylingTip: 'Clean silhouette pairs with ankle boots.'
      });
      pieces.push({
        category: 'outerwear',
        name: isRain
          ? 'Double-Breasted Weatherproof Trench Coat'
          : 'Classic Wool-Blend Shirt Jacket',
        colorName: isRain ? 'Camel Tan' : 'Charcoal Heather',
        colorHex: isRain ? '#C19A6B' : '#4A4E57',
        role: 'Core Piece',
        description: 'Durable outer layer built to stop chilly breezes.',
        stylingTip: 'Wear open over knitwear.'
      });
      pieces.push({
        category: 'footwear',
        name: isRain
          ? 'Waterproof Leather Chelsea Boots'
          : 'Supple Calfskin Loafers or Ankle Boots',
        colorName: 'Espresso Brown',
        colorHex: '#3D2B1F',
        role: 'Footwear Anchor',
        description: 'Rubber-soled closed footwear engineered for cool streets.',
        stylingTip: 'Keeps feet completely dry and warm.'
      });
      pieces.push({
        category: 'accessories',
        name: isRain ? 'Wind-Resistant Umbrella' : 'Woven Cashmere Blend Scarf',
        colorName: 'Camel Tan',
        colorHex: '#C19A6B',
        role: 'Accent Accessory',
        description: 'Warm tactile companion for outdoor strolls.',
        stylingTip: 'Drapes effortlessly over shoulders.'
      });
    } else {
      // Below 10°C / Cold Casual
      pieces.push({
        category: 'tops',
        name: 'Chunky Ribbed Fisherman Sweater',
        colorName: 'Ivory Cream',
        colorHex: '#F7F4EE',
        role: 'Essential Top',
        description: 'Dense 100% pure wool waffle knit with thick ribbed cuffs.',
        stylingTip: 'Tucks easily into warm outerwear.'
      });
      pieces.push({
        category: 'bottoms',
        name: 'Heavyweight Lined Cotton Denim Trousers',
        colorName: 'Deep Obsidian',
        colorHex: '#161617',
        role: 'Essential Bottom',
        description: '14oz rigid denim offering dense wind resistance.',
        stylingTip: 'Tuck into boots to block cold breezes.'
      });
      pieces.push({
        category: 'outerwear',
        name: 'Insulated Wool-Melton Car Coat',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        role: 'Core Piece',
        description: 'Thick virgin wool shell with quilted thermal interior lining.',
        stylingTip: 'Button collar latch against wind.'
      });
      pieces.push({
        category: 'footwear',
        name: 'Lug-Sole Insulated Leather Boots',
        colorName: 'Espresso Brown',
        colorHex: '#3D2B1F',
        role: 'Footwear Anchor',
        description: 'Goodyear-welted oil-tanned leather with commando rubber tread.',
        stylingTip: 'Provides traction over frost and icy sidewalks.'
      });
      pieces.push({
        category: 'accessories',
        name: 'Ribbed Cashmere Beanie & Wool Scarf',
        colorName: 'Charcoal Heather',
        colorHex: '#4A4E57',
        role: 'Accent Accessory',
        description: 'Insulating headwear and scarf trapping body heat.',
        stylingTip: 'Essential for freezing temperatures.'
      });
    }
  } else {
    // Party, Date Night, Wedding Guest
    if (isHot) {
      pieces.push({
        category: 'one_piece',
        name: req.occasion === 'wedding_guest'
          ? 'Tiered Silk Chiffon Midi Dress'
          : 'Bias-Cut Washed Silk Slip Midi Dress',
        colorName: req.occasion === 'wedding_guest' ? 'Soft Sage' : 'Emerald Forest',
        colorHex: req.occasion === 'wedding_guest' ? '#94A187' : '#1B4332',
        role: 'Core Piece',
        description: 'Featherweight pure silk cut on the bias that floats away from the body in high heat.',
        stylingTip: 'Zero heavy lining; keeps wearer radiant without perspiration.'
      });
      pieces.push({
        category: 'footwear',
        name: isRain
          ? 'Water-Resistant Closed-Toe Leather Slingbacks'
          : 'Strappy Barely-There Heeled Sandals',
        colorName: 'Champagne Metallic',
        colorHex: '#D4AF37',
        role: 'Footwear Anchor',
        description: 'Delicate open straps that allow continuous foot cooling.',
        stylingTip: '60mm kitten heel maintains dancing comfort.'
      });
      pieces.push({
        category: 'accessories',
        name: isRain
          ? 'Compact Umbrella & Satin Evening Pouch'
          : 'Sculptural Brass Earrings & Silk Habotai Fan',
        colorName: '18K Yellow Gold',
        colorHex: '#D4AF37',
        role: 'Accent Accessory',
        description: 'Luminous light-catching hardware suited for celebratory gatherings.',
        stylingTip: 'Keeps accessories airy and formal.'
      });
      if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Ultra-Lightweight Packable Duster Mac',
          colorName: 'Sand Ivory',
          colorHex: '#F7F4EE',
          role: 'Complementary Layer',
          description: 'Featherweight breathable technical layer protecting evening silk from drizzle.',
          stylingTip: 'Remove upon entering venue foyer.'
        });
      }
    } else if (isWarm) {
      pieces.push({
        category: 'one_piece',
        name: req.occasion === 'wedding_guest'
          ? 'Fluid Crepe de Chine Midi Gown'
          : 'Tailored Crepe Jumpsuit',
        colorName: 'Merlot Burgundy',
        colorHex: '#581825',
        role: 'Core Piece',
        description: 'High-drape woven crepe with breathable silk touch.',
        stylingTip: 'Flattering movement in evening light.'
      });
      pieces.push({
        category: 'footwear',
        name: isRain
          ? 'Water-Resistant Pointed Leather Slingbacks'
          : 'Pointed Kitten-Heel Mules',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Architectural heel with formal closed toe.',
        stylingTip: 'Elongates leg silhouette.'
      });
      if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Silk-Gabardine Trench Coat',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Satin-finish weather-repellent trench protecting evening fabrics.',
          stylingTip: 'Drape loosely over shoulders.'
        });
      }
      pieces.push({
        category: 'accessories',
        name: 'Satin Evening Minaudière & Gold Drop Earrings',
        colorName: 'Polished Gold',
        colorHex: '#D4AF37',
        role: 'Accent Accessory',
        description: 'Compact evening clutch with magnetic clasp.',
        stylingTip: 'Holds essentials.'
      });
    } else if (isCool) {
      pieces.push({
        category: 'one_piece',
        name: 'Long-Sleeve Crepe Column Midi Dress',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Core Piece',
        description: 'Substantial woven crepe providing arm coverage against cool ambient temperatures.',
        stylingTip: 'Sculpted neckline frames statement necklace.'
      });
      pieces.push({
        category: 'outerwear',
        name: isRain
          ? 'Weatherproof Belted Evening Trench'
          : 'Structured Tuxedo Wool Blazer with Satin Lapels',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Complementary Layer',
        description: 'Sharp tailoring providing windbreak and formal polish.',
        stylingTip: 'Balances dress drape with masculine structure.'
      });
      pieces.push({
        category: 'footwear',
        name: 'Pointed Stiletto Leather Ankle Boots',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Closed leather boots protecting feet from brisk evening breezes.',
        stylingTip: 'Tucks neatly under dress hemline.'
      });
      pieces.push({
        category: 'accessories',
        name: 'Sculptural Metal Handle Evening Pouch',
        colorName: 'Warm Gold',
        colorHex: '#D4AF37',
        role: 'Statement Bag',
        description: 'Polished metallic handle with satin body.',
        stylingTip: 'Handheld in lounge settings.'
      });
    } else {
      // Below 10°C / Cold Evening
      pieces.push({
        category: 'one_piece',
        name: 'Heavy Silk-Velvet Column Gown',
        colorName: 'Merlot Burgundy',
        colorHex: '#581825',
        role: 'Core Piece',
        description: 'Lustrous silk velvet with natural insulating density for winter gala events.',
        stylingTip: 'Deep jewel tone shines in indoor chandeliers.'
      });
      pieces.push({
        category: 'outerwear',
        name: 'Full-Length Heavy Double-Faced Wool & Cashmere Overcoat',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Complementary Layer',
        description: 'Long tailored coat that envelops the gown and prevents thermal loss from curb to ballroom.',
        stylingTip: 'Coat reaches mid-calf to prevent cold draft exposure.'
      });
      pieces.push({
        category: 'footwear',
        name: 'Sleek Pointed Knee-High Leather Stiletto Boots',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Full-length insulated calfskin leather boots.',
        stylingTip: 'Keeps entire lower leg warm under evening gown.'
      });
      pieces.push({
        category: 'accessories',
        name: 'Heavy Cashmere Evening Wrap & Lined Leather Opera Gloves',
        colorName: '18K Yellow Gold',
        colorHex: '#D4AF37',
        role: 'Accent Accessory',
        description: 'Plush cashmere stole to drape over bare shoulders once outer coat is checked.',
        stylingTip: 'Provides warmth inside grand ballrooms.'
      });
    }
  }

  const primaryHex = pieces[0]?.colorHex || '#141413';
  const secondaryHex = pieces[1]?.colorHex || '#C19A6B';

  return {
    id: `weather-look-1-${Date.now()}`,
    title: `The ${advice.weatherTitle.split(' ')[0]} Specialist`,
    subtitle: `${advice.weatherTitle} · ${OCCASIONS_DATA[req.occasion].name}`,
    aesthetic: `${req.weather.toUpperCase()} CLIMATE HARMONY`,
    occasion: req.occasion,
    style: 'minimalist_tailored',
    corePieceName: pieces[0].name,
    corePieceCategory: pieces[0].category,
    corePieceColor: pieces[0].colorName,
    pieces,
    colorHarmony: {
      name: `${advice.weatherTitle} Palette`,
      description: advice.colorPaletteTip,
      hexes: [primaryHex, secondaryHex, '#FAF7F2', '#141413']
    },
    recommendedMetal: isHot ? 'Warm Gold' : isCold ? 'Cool Silver' : 'Warm Gold',
    stylistRationale: `Strictly calibrated for ${req.weather} weather at ${getTemperatureLabel(req.temperature)}. ${advice.weatherRule}`,
    proStylistRule: advice.weatherRule,
    textureTip: `Prioritizes ${advice.recommendedFabrics.join(', ')} while strictly excluding ${advice.avoidedFabrics[0]}.`,
    formalityScore: req.occasion === 'wedding_guest' ? 9 : req.occasion === 'office' ? 8 : 6,
    weatherCompatibility: {
      condition: req.weather,
      temperature: req.temperature,
      badge: `${getWeatherLabel(req.weather)} · ${getTemperatureLabel(req.temperature)}`
    }
  };
}

// ----------------------------------------------------------------------------
// BUILDER 2: Alternative Silhouette (Strictly respectful of weather rules)
// ----------------------------------------------------------------------------

function buildAlternativeWeatherLook(
  req: WeatherStylingRequest,
  advice: WeatherStylingAdvice,
  wardrobe: WardrobeItem[]
): OutfitRecommendation {
  const isHot = req.temperature === '30_plus';
  const isCold = req.temperature === 'below_10' || (req.weather === 'cold' && req.temperature !== '30_plus' && req.temperature !== '20_29');
  const isRain = req.weather === 'rainy';

  const pieces: OutfitPiece[] = [];

  if (isHot) {
    // 30°C+ Hot Alternative (Never heavy layers!)
    if (req.occasion === 'office') {
      pieces.push({
        category: 'one_piece',
        name: 'Tailored Sleeveless Belted Linen-Cotton Shirt Dress',
        colorName: 'Sand Ivory',
        colorHex: '#F7F4EE',
        role: 'Core Piece',
        description: 'Crisp structured collared shirt dress with removable waist belt in breathable natural cotton-linen.',
        stylingTip: 'Cinch belt cleanly to maintain architectural corporate silhouette.'
      });
      pieces.push({
        category: 'footwear',
        name: isRain
          ? 'Water-Resistant Rubber-Soled Loafers'
          : 'Pointed Slingback Flats with Breathable Insole',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Footwear Anchor',
        description: 'Polished office flat that prevents overheating during the workday.',
        stylingTip: 'Pairs with minimalist watch.'
      });
      pieces.push({
        category: 'accessories',
        name: 'UV400 Polarized Sunglasses & Structured Leather Tote',
        colorName: 'Rich Cognac',
        colorHex: '#8C4A2F',
        role: 'Statement Bag',
        description: 'Structured calfskin tote that accommodates laptop without bulk.',
        stylingTip: 'Carried in hand.'
      });
      if (isRain) {
        pieces.push({
          category: 'accessories',
          name: 'Compact Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Wind-resistant compact canopy.',
          stylingTip: 'Stores neatly in tote.'
        });
      }
    } else {
      // Casual / Other 30°C+
      pieces.push({
        category: 'tops',
        name: 'Relaxed Camp-Collar Linen Shirt',
        colorName: 'Powder Sky Blue',
        colorHex: '#A5C4D4',
        role: 'Core Piece',
        description: 'Open-collar washed linen shirt that allows cross-ventilation across the chest.',
        stylingTip: 'Wear unbuttoned at top with sleeves rolled once.'
      });
      pieces.push({
        category: 'bottoms',
        name: 'Tailored Cotton Chino Shorts with Slanted Pockets',
        colorName: 'Ivory Cream',
        colorHex: '#F7F4EE',
        role: 'Essential Bottom',
        description: 'Clean mid-thigh tailored cut with non-cling cotton twill.',
        stylingTip: 'Keep hem crisp.'
      });
      pieces.push({
        category: 'footwear',
        name: 'Breathable Canvas Low-Top Sneakers',
        colorName: 'Chalk White',
        colorHex: '#F7F4EE',
        role: 'Footwear Anchor',
        description: 'Lightweight canvas upper that lets air circulate freely.',
        stylingTip: 'Comfortable all-day walking shoe.'
      });
      pieces.push({
        category: 'accessories',
        name: 'Woven Raffia Tote & Acetate Sunglasses',
        colorName: 'Natural Raffia',
        colorHex: '#C19A6B',
        role: 'Statement Bag',
        description: 'Natural organic fiber basket bag with leather straps.',
        stylingTip: 'Perfect summer carryall.'
      });
    }
  } else if (isCold) {
    // Below 10°C Cold Alternative
    pieces.push({
      category: 'tops',
      name: 'Layered Cashmere Crewneck over Cotton Turtleneck',
      colorName: 'Charcoal Heather',
      colorHex: '#4A4E57',
      role: 'Essential Top',
      description: 'Dual-layer insulating knitwear trapping body warmth.',
      stylingTip: 'Provides double thermal barriers.'
    });
    pieces.push({
      category: 'bottoms',
      name: 'Heavy Lined Straight Wool Trousers',
      colorName: 'Midnight Navy',
      colorHex: '#1B263B',
      role: 'Essential Bottom',
      description: 'Wind-blocking virgin wool with cupro knee lining.',
      stylingTip: 'Blocks biting frost.'
    });
    pieces.push({
      category: 'outerwear',
      name: 'Insulated Double-Breasted Wool Overcoat',
      colorName: 'Obsidian Black',
      colorHex: '#161617',
      role: 'Core Piece',
      description: 'Heavyweight coat with tailored waist and deep lapels.',
      stylingTip: 'Turn collar up in wind gusts.'
    });
    pieces.push({
      category: 'footwear',
      name: 'Calfskin Chelsea Boots with Commando Sole',
      colorName: 'Obsidian Black',
      colorHex: '#161617',
      role: 'Footwear Anchor',
      description: 'Deep tread prevents slipping on frozen pavement.',
      stylingTip: 'Weatherproofed leather.'
    });
    pieces.push({
      category: 'accessories',
      name: 'Dense Mongolian Cashmere Scarf',
      colorName: 'Merlot Burgundy',
      colorHex: '#581825',
      role: 'Accent Accessory',
      description: 'Heavyweight fringe scarf providing throat insulation.',
      stylingTip: 'Knotted firmly.'
    });
  } else {
    // 10–29°C Transitional Alternative
    pieces.push({
      category: 'tops',
      name: 'Silk-Cotton Ribbed Knit Polo',
      colorName: 'Muted Sage',
      colorHex: '#94A187',
      role: 'Core Piece',
      description: 'Breathable fine-gauge knit offering refined casual elegance.',
      stylingTip: 'Leave three buttons open.'
    });
    pieces.push({
      category: 'bottoms',
      name: 'Tailored Wide-Leg Cotton-Twill Trousers',
      colorName: 'Camel Tan',
      colorHex: '#C19A6B',
      role: 'Essential Bottom',
      description: 'Double-pleated fluid trousers that move with each stride.',
      stylingTip: 'High-waisted fit.'
    });
    if (isRain || req.temperature === '10_19') {
      pieces.push({
        category: 'outerwear',
        name: isRain
          ? 'Unlined Water-Repellent Cotton Trench'
          : 'Tailored Single-Breasted Blazer',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        role: 'Complementary Layer',
        description: 'Lightweight structure providing wind protection.',
        stylingTip: 'Drape cleanly.'
      });
    }
    pieces.push({
      category: 'footwear',
      name: isRain
        ? 'Rubber-Soled Leather Loafers'
        : 'Pointed Calfskin Slingbacks',
      colorName: 'Obsidian Black',
      colorHex: '#161617',
      role: 'Footwear Anchor',
      description: 'Supple leather with clean silhouette lines.',
      stylingTip: 'Matches bag hardware.'
    });
    pieces.push({
      category: 'accessories',
      name: isRain
        ? 'Compact Rain Umbrella'
        : 'Structured Leather Crossbody Bag',
      colorName: 'Espresso Brown',
      colorHex: '#3D2B1F',
      role: 'Statement Bag',
      description: 'Functional accessory keeping essentials secure.',
      stylingTip: 'Carried comfortably.'
    });
  }

  return {
    id: `weather-look-2-${Date.now() + 1}`,
    title: 'The Contemporary Silhouette',
    subtitle: `Modern Cut · ${advice.weatherTitle}`,
    aesthetic: 'ADAPTIVE MODERN CONTRAST',
    occasion: req.occasion,
    style: 'modern_casual',
    corePieceName: pieces[0].name,
    corePieceCategory: pieces[0].category,
    corePieceColor: pieces[0].colorName,
    pieces,
    colorHarmony: {
      name: 'Modern Climate Balance',
      description: 'Clean contrast between breathable anchors and functional accents.',
      hexes: pieces.map(p => p.colorHex).slice(0, 4)
    },
    recommendedMetal: 'Mixed Metallics',
    stylistRationale: `Alternative modern cut engineered to respect the exact same temperature limits and weather defense rules without repeating garment types.`,
    proStylistRule: advice.weatherRule,
    textureTip: `Carefully balances textile weights so no piece feels excessive or under-insulated.`,
    formalityScore: req.occasion === 'wedding_guest' ? 8 : req.occasion === 'office' ? 7 : 6,
    weatherCompatibility: {
      condition: req.weather,
      temperature: req.temperature,
      badge: `${getWeatherLabel(req.weather)} · Alternative`
    }
  };
}

// ----------------------------------------------------------------------------
// BUILDER 3: Tonal Monochrome Look (Strictly weather-compliant)
// ----------------------------------------------------------------------------

function buildTonalWeatherLook(
  req: WeatherStylingRequest,
  advice: WeatherStylingAdvice,
  wardrobe: WardrobeItem[]
): OutfitRecommendation {
  const isHot = req.temperature === '30_plus';
  const isCold = req.temperature === 'below_10' || (req.weather === 'cold' && req.temperature !== '30_plus' && req.temperature !== '20_29');
  const isRain = req.weather === 'rainy';

  const pieces: OutfitPiece[] = [];

  if (isHot) {
    // 30°C+ Tonal Look: Light Ivory / Bone monochromatic (Heat Reflective)
    pieces.push({
      category: 'tops',
      name: 'Lightweight Belgian Linen Short-Sleeve Shirt',
      colorName: 'Ivory Cream',
      colorHex: '#F7F4EE',
      role: 'Core Piece',
      description: 'Naturally slubbed pure linen with relaxed open collar that reflects maximum solar radiation.',
      stylingTip: 'Leave untucked for maximum cooling airflow.'
    });
    pieces.push({
      category: 'bottoms',
      name: 'Airy Linen-Cotton Tonal Trousers',
      colorName: 'Soft Ecru',
      colorHex: '#E8E2D9',
      role: 'Essential Bottom',
      description: 'Tone-on-tone ivory lightweight trousers with internal drawstring waist.',
      stylingTip: 'Monochromatic pairing elongates height.'
    });
    pieces.push({
      category: 'footwear',
      name: isRain
        ? 'Water-Resistant Rubber-Tread Loafers'
        : 'Minimalist Ecru Leather Sandals',
      colorName: 'Sand Ivory',
      colorHex: '#F7F4EE',
      role: 'Footwear Anchor',
      description: 'Breathable footwear that complements the sun-drenched ivory palette.',
      stylingTip: 'Keeps footwear weight visually light.'
    });
    pieces.push({
      category: 'accessories',
      name: isRain
        ? 'Lightweight Travel Umbrella'
        : 'UV400 Light-Tint Sunglasses & Woven Straw Hat',
      colorName: 'Natural Straw',
      colorHex: '#C19A6B',
      role: 'Accent Accessory',
      description: 'Sun-protective accessory completing the tonal resort aesthetic.',
      stylingTip: 'Shields scalp and face from solar rays.'
    });
  } else if (isCold) {
    // Below 10°C Tonal Look: Deep Charcoal & Obsidian Monochrome
    pieces.push({
      category: 'tops',
      name: 'Heavy 4-Ply Cashmere Ribbed Turtleneck',
      colorName: 'Charcoal Heather',
      colorHex: '#4A4E57',
      role: 'Essential Top',
      description: 'Dense insulating knitwear locking in core thermal warmth.',
      stylingTip: 'Tuck cleanly into heavy wool trousers.'
    });
    pieces.push({
      category: 'bottoms',
      name: 'Pleated Charcoal Flannel Wool Trousers',
      colorName: 'Charcoal Heather',
      colorHex: '#4A4E57',
      role: 'Essential Bottom',
      description: 'Heavy brushed flannel that creates seamless tonal continuity with the knit.',
      stylingTip: 'Sharp center crease.'
    });
    pieces.push({
      category: 'outerwear',
      name: 'Tailored Heavyweight Charcoal Wool Overcoat',
      colorName: 'Deep Charcoal',
      colorHex: '#32363D',
      role: 'Core Piece',
      description: 'Substantial melton wool shell with peak lapels and deep insulation.',
      stylingTip: 'Button securely when outdoors.'
    });
    pieces.push({
      category: 'footwear',
      name: 'Black Calfskin Lug-Sole Chelsea Boots',
      colorName: 'Obsidian Black',
      colorHex: '#161617',
      role: 'Footwear Anchor',
      description: 'Weatherproofed leather boots with heavy storm welt.',
      stylingTip: 'Completes monochrome dark silhouette.'
    });
    pieces.push({
      category: 'accessories',
      name: 'Charcoal Cashmere Scarf & Fleece Gloves',
      colorName: 'Charcoal Heather',
      colorHex: '#4A4E57',
      role: 'Accent Accessory',
      description: 'Tonal thermal accessories preventing heat escape.',
      stylingTip: 'Wraps neatly at neck.'
    });
  } else {
    // 10–29°C Tonal Look: Navy & Indigo Tonal Spectrum
    pieces.push({
      category: 'tops',
      name: 'Fine Cotton-Silk Knit Crewneck',
      colorName: 'Midnight Navy',
      colorHex: '#1B263B',
      role: 'Core Piece',
      description: 'Lustrous fine-gauge knit offering temperature-regulating comfort.',
      stylingTip: 'Sits smoothly over skin.'
    });
    pieces.push({
      category: 'bottoms',
      name: 'Tailored Navy Pleated Chino Trousers',
      colorName: 'Midnight Navy',
      colorHex: '#1B263B',
      role: 'Essential Bottom',
      description: 'Crisp high-waisted trousers matching the knit in tone.',
      stylingTip: 'Sharp straight leg.'
    });
    if (isRain || req.temperature === '10_19') {
      pieces.push({
        category: 'outerwear',
        name: isRain
          ? 'Water-Repellent Navy Trench Coat'
          : 'Navy Wool-Blend Tailored Blazer',
        colorName: 'Deep Navy',
        colorHex: '#0D1B2A',
        role: 'Complementary Layer',
        description: 'Tonal outer layer that withstands gusts and drizzle.',
        stylingTip: 'Maintains unbroken vertical line.'
      });
    }
    pieces.push({
      category: 'footwear',
      name: isRain
        ? 'Water-Resistant Rubber-Soled Navy Loafers'
        : 'Pointed Navy Calfskin Slingbacks or Loafers',
      colorName: 'Midnight Navy',
      colorHex: '#1B263B',
      role: 'Footwear Anchor',
      description: 'Tonal leather footwear grounding the look.',
      stylingTip: 'Matches overall palette.'
    });
    pieces.push({
      category: 'accessories',
      name: isRain ? 'Navy Travel Umbrella' : 'Navy Leather Shoulder Bag',
      colorName: 'Midnight Navy',
      colorHex: '#1B263B',
      role: 'Statement Bag',
      description: 'Refined leather accessory complementing the monochromatic scheme.',
      stylingTip: 'Carried on shoulder.'
    });
  }

  return {
    id: `weather-look-3-${Date.now() + 2}`,
    title: 'The Tonal Climate Ensemble',
    subtitle: `Monochrome Depth · ${advice.weatherTitle}`,
    aesthetic: 'MONOCHROMATIC THERMAL REFINEMENT',
    occasion: req.occasion,
    style: 'classic_elegance',
    corePieceName: pieces[0].name,
    corePieceCategory: pieces[0].category,
    corePieceColor: pieces[0].colorName,
    pieces,
    colorHarmony: {
      name: 'Tonal Climate Spectrum',
      description: 'Layered monochromatic shades engineered to handle the exact weather conditions.',
      hexes: pieces.map(p => p.colorHex).slice(0, 4)
    },
    recommendedMetal: isHot ? 'Warm Gold' : 'Cool Silver',
    stylistRationale: `Monochromatic dressing provides visual elongation while strictly utilizing weather-appropriate fiber weights for ${getWeatherLabel(req.weather)} at ${getTemperatureLabel(req.temperature)}.`,
    proStylistRule: advice.weatherRule,
    textureTip: `Relies on subtle weave differences (open linen or brushed wool) to create depth without violating temperature safety.`,
    formalityScore: req.occasion === 'wedding_guest' ? 9 : req.occasion === 'office' ? 8 : 7,
    weatherCompatibility: {
      condition: req.weather,
      temperature: req.temperature,
      badge: `${getWeatherLabel(req.weather)} · Tonal`
    }
  };
}

export function getWeatherLabel(weather: WeatherCondition): string {
  switch (weather) {
    case 'sunny': return 'Sunny';
    case 'cloudy': return 'Cloudy';
    case 'rainy': return 'Rainy';
    case 'windy': return 'Windy';
    case 'cold': return 'Cold / Freezing';
  }
}

export function getTemperatureLabel(temp: TemperatureRange): string {
  switch (temp) {
    case 'below_10': return decodeHtmlEntities('Below 10°C');
    case '10_19': return decodeHtmlEntities('10–19°C');
    case '20_29': return decodeHtmlEntities('20–29°C');
    case '30_plus': return decodeHtmlEntities('30°C & Above');
  }
}
