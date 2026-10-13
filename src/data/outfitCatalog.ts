import {
  FashionStyle,
  GarmentCategory,
  Occasion,
  OutfitPiece,
  OutfitPieceRole,
  TemperatureRange,
  WardrobeItem,
  WeatherCondition
} from '../types';

export interface OutfitArchetype {
  id: string;
  occasion: Occasion;
  silhouetteKey: string;
  silhouetteName: string;
  title: string;
  subtitle: string;
  aesthetic: string;
  style: FashionStyle;
  formalityScore: number;
  buildOutfit: (
    weather: WeatherCondition,
    temperature: TemperatureRange,
    wardrobe: WardrobeItem[]
  ) => {
    pieces: OutfitPiece[];
    stylistRationale: string;
    proStylistRule: string;
    textureTip: string;
    recommendedMetal: 'Warm Gold' | 'Cool Silver' | 'Rose Gold' | 'Mixed Metallics';
    colorHarmony: {
      name: string;
      description: string;
      hexes: string[];
    };
  };
}

// ============================================================================
// ACCURATE WARDROBE MATCHER
// Strict rule: Display actual saved name, category, color and attributes.
// Never invent technical specs, waterproof claims, thread counts, or materials.
// Never force a wardrobe piece into thermally or weather-inappropriate conditions.
// ============================================================================

export function findMatchingWardrobePiece(
  wardrobe: WardrobeItem[],
  category: GarmentCategory,
  occasion: Occasion,
  temp: TemperatureRange,
  weather: WeatherCondition,
  role: OutfitPieceRole,
  defaultTip: string,
  matcher?: (item: WardrobeItem) => boolean
): OutfitPiece | null {
  for (const item of wardrobe) {
    if (item.category !== category) continue;
    if (!item.occasions.includes(occasion)) continue;

    const itemText = `${item.name} ${item.specificType} ${item.notes || ''}`.toLowerCase();

    // 1. Hot weather (30°C+) exclusions: no heavy wool, cashmere, flannel, or dry outerwear
    if (temp === '30_plus') {
      if (
        itemText.includes('wool') ||
        itemText.includes('cashmere') ||
        itemText.includes('melton') ||
        itemText.includes('flannel') ||
        itemText.includes('heavy') ||
        itemText.includes('fleece') ||
        itemText.includes('down')
      ) {
        continue;
      }
      if (category === 'outerwear' && weather !== 'rainy') {
        continue;
      }
    }

    // 2. Cold weather (<10°C) exclusions: no sandals, slides, shorts, or sleeveless summer items
    if (temp === 'below_10' || weather === 'cold') {
      if (
        itemText.includes('sandals') ||
        itemText.includes('slides') ||
        itemText.includes('shorts') ||
        itemText.includes('tank top')
      ) {
        continue;
      }
    }

    // 3. Rainy weather exclusions: no suede footwear
    if (weather === 'rainy') {
      if (category === 'footwear' && itemText.includes('suede')) {
        continue;
      }
    }

    if (matcher && !matcher(item)) {
      continue;
    }

    // MATCH FOUND: strictly use actual saved name and honest description
    const honestDescription =
      item.notes && item.notes.trim()
        ? item.notes.trim()
        : `Personal wardrobe piece: ${item.specificType || item.name}.`;

    return {
      category: item.category,
      name: item.name, // Real saved name, never renamed!
      colorName: item.colorName,
      colorHex: item.colorHex,
      role,
      description: honestDescription,
      stylingTip: defaultTip,
      isWardrobeOwned: true,
      sourceLabel: 'From Your Wardrobe',
      imageUrl: item.imageUrl,
      wardrobeItemId: item.id
    };
  }

  return null;
}

// ============================================================================
// CONTEXTUAL EXPLANATION GENERATOR
// Reflects the actual pieces present, selected weather, and temperature band.
// Never generates generic contradictions or claims unproven fabric properties.
// ============================================================================

export function generateContextualRationale(
  pieces: OutfitPiece[],
  weather: WeatherCondition,
  temp: TemperatureRange,
  occasion: Occasion,
  silhouetteName: string
): string {
  const onePiece = pieces.find((p) => p.category === 'one_piece');
  const top = pieces.find((p) => p.category === 'tops');
  const bottom = pieces.find((p) => p.category === 'bottoms');
  const outer = pieces.find((p) => p.category === 'outerwear');
  const footwear = pieces.find((p) => p.category === 'footwear');
  const acc = pieces.find((p) => p.category === 'accessories' || p.category === 'weather_protection');

  let baseDesc = '';
  if (onePiece) {
    baseDesc = `The ${onePiece.name.toLowerCase()}`;
  } else if (top && bottom) {
    baseDesc = `The ${top.name.toLowerCase()} paired with ${bottom.name.toLowerCase()}`;
  } else if (top) {
    baseDesc = `The ${top.name.toLowerCase()}`;
  } else {
    baseDesc = `This ${silhouetteName.toLowerCase()}`;
  }

  let tempContext = '';
  if (temp === '30_plus') {
    tempContext = `provides breathable airflow for high heat (30°C+)`;
  } else if (temp === '20_29') {
    tempContext = `suits a mild ${occasion} day (20–29°C)`;
  } else if (temp === '10_19') {
    tempContext = `offers balanced layering for cool temperatures (10–19°C)`;
  } else {
    tempContext = `delivers necessary insulation for cold weather (below 10°C)`;
  }

  let weatherContext = '';
  if (weather === 'rainy') {
    if (outer && acc) {
      weatherContext = `, while ${outer.name.toLowerCase()} and ${acc.name.toLowerCase()} keep you dry in rain`;
    } else if (outer) {
      weatherContext = `, complemented by ${outer.name.toLowerCase()} to repel wet weather`;
    } else if (footwear) {
      weatherContext = `, with practical footwear suited for wet pavements`;
    } else {
      weatherContext = `, keeping you prepared for showers`;
    }
  } else if (weather === 'sunny') {
    if (acc) {
      weatherContext = `, paired with ${acc.name.toLowerCase()} for midday sun protection`;
    } else {
      weatherContext = `, optimized for clear sunny skies`;
    }
  } else if (weather === 'windy') {
    if (outer) {
      weatherContext = `, while ${outer.name.toLowerCase()} shields against brisk gusts`;
    } else {
      weatherContext = `, maintaining clean lines in windy conditions`;
    }
  } else if (weather === 'cold') {
    if (outer) {
      weatherContext = `, with ${outer.name.toLowerCase()} providing vital exterior warmth`;
    } else {
      weatherContext = `, locking in core body heat`;
    }
  } else {
    if (outer) {
      weatherContext = `, with ${outer.name.toLowerCase()} on hand if temperatures fluctuate`;
    } else {
      weatherContext = `, suited for steady overcast conditions`;
    }
  }

  return `${baseDesc} ${tempContext}${weatherContext}.`;
}

// ============================================================================
// DIVERSE OUTFIT ARCHETYPES CATALOG
// ============================================================================

export const OUTFIT_ARCHETYPES: OutfitArchetype[] = [
  // --------------------------------------------------------------------------
  // 1. OFFICE WEAR ARCHETYPES
  // --------------------------------------------------------------------------

  // Office 1: Shirt + Tailored Trousers + Loafers
  {
    id: 'office_shirt_trousers_loafers',
    occasion: 'office',
    silhouetteKey: 'shirt_trousers_loafers',
    silhouetteName: 'Shirt + Tailored Trousers + Loafers',
    title: 'The Executive Tailored Standard',
    subtitle: 'Crisp Shirting & Savile-Cut Trousers',
    aesthetic: 'SAVILE ROW CLASSIC · SHARP MINIMALISM',
    style: 'minimalist_tailored',
    formalityScore: 8,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCool = temp === '10_19';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // 1. Top: Check wardrobe first
      const ownedTop = findMatchingWardrobePiece(
        wardrobe,
        'tops',
        'office',
        temp,
        weather,
        'Core Piece',
        'Tuck cleanly into trousers with a coordinating leather belt.',
        (item) => item.specificType.toLowerCase().includes('shirt') || item.name.toLowerCase().includes('shirt')
      );

      if (ownedTop) {
        pieces.push(ownedTop);
      } else if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Short-Sleeve Cotton Poplin Shirt',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Core Piece',
          description: 'Lightweight cotton poplin shirt with structured collar and tailored short sleeves.',
          stylingTip: 'Tuck cleanly into trousers for polished boardroom elegance without heat retention.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Cotton Shirt layered with Fine Merino Crewneck',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Core Piece',
          description: 'Long-sleeve dress shirt layered with an insulating merino knit for warmth.',
          stylingTip: 'Expose the collar points cleanly above the knit neckline.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Classic Cotton Poplin Button-Down Shirt',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Core Piece',
          description: 'Structured dress shirt in breathable woven cotton with mother-of-pearl buttons.',
          stylingTip: 'Press cuffs crisply for sharp office presentation.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 2. Bottom: Check wardrobe first
      const ownedBottom = findMatchingWardrobePiece(
        wardrobe,
        'bottoms',
        'office',
        temp,
        weather,
        'Essential Bottom',
        'Pair with leather loafers for an unbroken vertical line.',
        (item) => item.specificType.toLowerCase().includes('trouser') || item.name.toLowerCase().includes('trouser')
      );

      if (ownedBottom) {
        pieces.push(ownedBottom);
      } else if (isHot) {
        pieces.push({
          category: 'bottoms',
          name: 'Tropical Lightweight Wool Trousers',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'Lightweight breathable high-twist wool trousers woven for warm climates.',
          stylingTip: 'High-waisted fit maintains sharp drape in warm temperatures.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'bottoms',
          name: 'Wool Flannel Pleated Trousers',
          colorName: 'Charcoal Heather',
          colorHex: '#4A4E57',
          role: 'Essential Bottom',
          description: 'Heavyweight brushed wool flannel trousers providing warmth against winter drafts.',
          stylingTip: 'Deep pleats and substantial weight block chilly air.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'bottoms',
          name: isRain ? 'Cropped Ankle-Length Wool Trousers' : 'Tailored Pleated Straight-Leg Trousers',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: isRain
            ? 'Hemmed cleanly above the shoe collar to avoid damp sidewalk splashes.'
            : 'Classic center-crease trousers providing clean tailored structure.',
          stylingTip: 'Complements leather footwear.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 3. Outerwear (only when needed by weather/temperature)
      if (isCold) {
        const ownedCoat = findMatchingWardrobePiece(
          wardrobe,
          'outerwear',
          'office',
          temp,
          weather,
          'Complementary Layer',
          'Button securely during cold outdoor transit.',
          (item) => item.name.toLowerCase().includes('trench') || item.name.toLowerCase().includes('coat')
        );
        if (ownedCoat) {
          pieces.push(ownedCoat);
        } else {
          pieces.push({
            category: 'outerwear',
            name: 'Tailored Wool Overcoat',
            colorName: 'Obsidian Black',
            colorHex: '#161617',
            role: 'Complementary Layer',
            description: 'Insulated double-faced wool overcoat with peak lapels.',
            stylingTip: 'Button securely when outdoors in freezing conditions.',
            isWardrobeOwned: false,
            sourceLabel: 'Curated Catalog'
          });
        }
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: isHot ? 'Packable Lightweight Rain Mac' : 'Water-Repellent Gabardine Trench Coat',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Water-shedding outer layer with sealed seams.',
          stylingTip: 'Protects tailored shirting from wet commutes.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCool) {
        const ownedBlazer = findMatchingWardrobePiece(
          wardrobe,
          'outerwear',
          'office',
          temp,
          weather,
          'Complementary Layer',
          'Wear unbuttoned indoors.',
          (item) => item.specificType.toLowerCase().includes('blazer') || item.name.toLowerCase().includes('blazer')
        );
        if (ownedBlazer) {
          pieces.push(ownedBlazer);
        } else {
          pieces.push({
            category: 'outerwear',
            name: 'Tailored Single-Breasted Blazer',
            colorName: 'Camel Tan',
            colorHex: '#C19A6B',
            role: 'Complementary Layer',
            description: 'Midweight tailored jacket providing comfortable transition warmth.',
            stylingTip: 'Adds classic polish to shirting.',
            isWardrobeOwned: false,
            sourceLabel: 'Curated Catalog'
          });
        }
      }

      // 4. Footwear
      const ownedLoafers = findMatchingWardrobePiece(
        wardrobe,
        'footwear',
        'office',
        temp,
        weather,
        'Footwear Anchor',
        'Polished leather finish coordinates with your belt.',
        (item) => item.specificType.toLowerCase().includes('loafer') || item.name.toLowerCase().includes('loafer')
      );

      if (ownedLoafers && !isRain) {
        pieces.push(ownedLoafers);
      } else if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Leather Loafers with Rubber Soles',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Calfskin loafers with water-resistant rubber sole for wet street grip.',
          stylingTip: 'Treated leather prevents moisture staining.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Calfskin Chelsea Boots',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Closed leather boots protecting ankles from winter drafts.',
          stylingTip: 'Sleek toe shape fits cleanly under tailored trouser hems.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Calfskin Horsebit Loafers',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Supple full-grain leather loafers with antiqued brass hardware.',
          stylingTip: 'Provides effortless classic office polish.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 5. Functional Accessory (only 1 functional accessory)
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Windproof Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Sturdy compact umbrella protecting your ensemble in transit.',
          stylingTip: 'Stows easily in your work bag.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (weather === 'sunny' && !isCold) {
        pieces.push({
          category: 'accessories',
          name: 'UV400 Classic Tortoiseshell Sunglasses',
          colorName: 'Havana Tortoise',
          colorHex: '#3D2B1F',
          role: 'Accent Accessory',
          description: 'Acetate frame offering 100% UV protection against commute glare.',
          stylingTip: 'Complements tailored suiting tones.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'office',
        'Shirt + Tailored Trousers + Loafers'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Savile Ratio: Ensure trouser hems achieve a subtle quarter-break over the loafer vamp to maintain pristine vertical lines.',
        textureTip: 'Pair smooth cotton shirting with matte wool twill to create intentional visual depth.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Executive Navy & Ivory Contrast',
          description: 'High-contrast professional foundation with warm leather anchors.',
          hexes: ['#F7F4EE', '#1B263B', '#161617', '#C19A6B']
        }
      };
    }
  },

  // Office 2: Knit Polo + Chinos + Leather Shoes
  {
    id: 'office_knit_polo_chinos_derbies',
    occasion: 'office',
    silhouetteKey: 'knit_polo_chinos_derbies',
    silhouetteName: 'Knit Polo + Chinos + Leather Shoes',
    title: 'The Smart Business Knit',
    subtitle: 'Fine-Gauge Knitwear & Tailored Chino Construction',
    aesthetic: 'CONTEMPORARY SMART CASUAL · MEDITERRANEAN REFINEMENT',
    style: 'modern_casual',
    formalityScore: 7,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCool = temp === '10_19';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // 1. Top: Knit Polo
      if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Breathable Cotton-Linen Knit Polo',
          colorName: 'Soft Ecru',
          colorHex: '#E8E2D9',
          role: 'Core Piece',
          description: 'Open-gauge knit polo featuring rib-knit collar and mother-of-pearl buttons.',
          stylingTip: 'Leave two buttons undone for cooling airflow around the collar.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Long-Sleeve Merino Wool Knit Polo',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Core Piece',
          description: 'Fine-gauge merino wool polo that retains body warmth under outer layers.',
          stylingTip: 'Layer under structured outerwear for thermal retention.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Fine Cotton Ribbed Knit Polo',
          colorName: 'Muted Sage',
          colorHex: '#94A187',
          role: 'Core Piece',
          description: 'Breathable fine-gauge knit offering refined casual elegance with smart collar structure.',
          stylingTip: 'Tuck into chinos for a balanced waistline.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 2. Bottom: Chinos
      if (isHot) {
        pieces.push({
          category: 'bottoms',
          name: 'Lightweight Cotton-Linen Chinos',
          colorName: 'Sand Beige',
          colorHex: '#D4C9BC',
          role: 'Essential Bottom',
          description: 'Breathable lightweight twill chinos tailored with clean flat front.',
          stylingTip: 'Ankle break allows airflow around shoes.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'bottoms',
          name: 'Heavy Cotton Twill Chinos',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'Substantial cotton twill providing resistance against winter breezes.',
          stylingTip: 'Pairs with warm socks inside leather dress derbies.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'bottoms',
          name: 'Tailored Flat-Front Cotton Chinos',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'Mid-rise chinos with clean waistband and slanted welt pockets.',
          stylingTip: 'Crisp crease maintenance keeps the look appropriate for the workplace.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 3. Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Tailored Wool Overcoat',
          colorName: 'Deep Charcoal',
          colorHex: '#32363D',
          role: 'Complementary Layer',
          description: 'Insulating wool coat designed to stop winter chills.',
          stylingTip: 'Wear buttoned with raised collar.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Car Coat',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Unlined water-repellent coat shedding precipitation.',
          stylingTip: 'Button securely when stepping outdoors.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCool) {
        pieces.push({
          category: 'outerwear',
          name: 'Lightweight Wool-Blend Shirt Jacket',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Transitional layer providing wind protection without suit rigidity.',
          stylingTip: 'Wear unbuttoned indoors.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 4. Footwear: Leather Shoes
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Calfskin Derby Shoes with Rubber Soles',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Treated leather derby shoes with non-slip rubber grip.',
          stylingTip: 'Treated leather resists puddle splatters.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Burnished Leather Chukka Boots',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Footwear Anchor',
          description: 'Ankle-height dress chukkas in supple leather keeping ankles warm.',
          stylingTip: 'Fits neatly under tailored chino cuffs.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Burnished Calfskin Derby Shoes',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Footwear Anchor',
          description: 'Classic open-lacing leather shoes with leather sole and stacked heel.',
          stylingTip: 'Provides a polished alternative to formal oxfords.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 5. Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Windproof Travel Umbrella',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Accent Accessory',
          description: 'Canopy protecting your knitwear in transit.',
          stylingTip: 'Keeps hands dry between appointments.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'office',
        'Knit Polo + Chinos + Leather Shoes'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Knitwear Elevation Rule: A collared knit polo automatically reads more formal than a tee and more relaxed than a woven shirt, making it a dependable modern office staple.',
        textureTip: 'Contrast the ribbed knit texture of the polo against smooth compact cotton chino twill.',
        recommendedMetal: 'Cool Silver',
        colorHarmony: {
          name: 'Earthy Sage & Navy Balance',
          description: 'Understated botanical and navy tones grounded by rich leather.',
          hexes: ['#94A187', '#1B263B', '#D4C9BC', '#3D2B1F']
        }
      };
    }
  },

  // Office 3: Blouse + Midi Skirt + Flats
  {
    id: 'office_blouse_midi_skirt_flats',
    occasion: 'office',
    silhouetteKey: 'blouse_midi_skirt_flats',
    silhouetteName: 'Blouse + Midi Skirt + Flats',
    title: 'The Fluid Sartorial Feminine',
    subtitle: 'Silk-Touch Blouse & Pleated Midi Skirt Architecture',
    aesthetic: 'CONTEMPORARY ELEGANTE · ARCHITECTURAL DRAPE',
    style: 'parisian_chic',
    formalityScore: 8,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCool = temp === '10_19';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';
      const isWind = weather === 'windy';

      const pieces: OutfitPiece[] = [];

      // 1. Top: Blouse
      if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Sleeveless Cotton-Poplin Blouse',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Core Piece',
          description: 'Lightweight woven cotton blouse with subtle gathered neckline that allows airflow.',
          stylingTip: 'Tuck cleanly into the skirt waistband.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Tailored Blouse layered with Cashmere Cardigan',
          colorName: 'Dusty Rosewater',
          colorHex: '#C9A9A6',
          role: 'Core Piece',
          description: 'Long-sleeve blouse buttoned under an insulating fine-gauge cashmere knit.',
          stylingTip: 'Expose the collar neatly above the cardigan.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Fluid Tie-Neck Crepe Blouse',
          colorName: 'Dusty Rosewater',
          colorHex: '#C9A9A6',
          role: 'Core Piece',
          description: 'Softly draping crepe blouse with optional collar tie and clean cuffs.',
          stylingTip: 'Wear tie loose for effortless elegance.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 2. Bottom: Midi Skirt
      if (isHot) {
        pieces.push({
          category: 'bottoms',
          name: 'A-Line Linen-Blend Midi Skirt',
          colorName: 'Soft Ecru',
          colorHex: '#E8E2D9',
          role: 'Essential Bottom',
          description: 'Unlined breathable A-line midi skirt with tortoiseshell buttons.',
          stylingTip: 'A-line silhouette allows natural ventilation while walking.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'bottoms',
          name: 'Wool-Blend Pleated Midi Skirt with Thermal Tights',
          colorName: 'Charcoal Heather',
          colorHex: '#4A4E57',
          role: 'Essential Bottom',
          description: 'Wool-blend pleated skirt paired with 100-denier thermal tights for wind protection.',
          stylingTip: 'Thermal tights provide complete draft defense beneath the pleats.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isWind) {
        pieces.push({
          category: 'bottoms',
          name: 'Structured Straight Midi Skirt with Slit',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'Tightly woven compact twill straight skirt that resists flapping in wind gusts.',
          stylingTip: 'Anchored silhouette prevents blowing around in city wind.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'bottoms',
          name: 'Pleated Midi Skirt',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'Midi skirt with permanent pleats and comfortable waistband.',
          stylingTip: 'Sits comfortably at the natural waist.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 3. Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Tailored Wool Overcoat',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Full-length coat keeping core and legs protected.',
          stylingTip: 'Belt securely outdoors.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Trench Coat',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Trench coat engineered to shield clothes from rain.',
          stylingTip: 'Button securely when walking in drizzle.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCool) {
        pieces.push({
          category: 'outerwear',
          name: 'Cropped Tailored Blazer',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Structured blazer hitting at the skirt waistband to flatter proportion.',
          stylingTip: 'Defines the waistline cleanly.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 4. Footwear: Flats
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Leather Pointed Flats with Rubber Soles',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Treated calfskin flats with non-slip rubber grip.',
          stylingTip: 'Never wear suede or untreated satin in wet weather.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Pointed Calfskin Ankle Boots',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Closed ankle boot that seals under the midi skirt hem with tights.',
          stylingTip: 'Provides complete cold-weather closure.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Pointed-Toe Leather Ballerina Flats',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Supple leather flats with pointed toe and cushioned insole.',
          stylingTip: 'Elongates legs without heel fatigue.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 5. Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Travel Umbrella',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Accent Accessory',
          description: 'Wind-resistant umbrella protecting your blouse and hair from rain.',
          stylingTip: 'Stows easily.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'office',
        'Blouse + Midi Skirt + Flats'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Hemline-To-Shoe Formula: Pair midi skirts hitting mid-calf with pointed-toe flats to visually extend the leg line without requiring high heels.',
        textureTip: 'Juxtapose the drape of the blouse against the crisp pleats of the midi skirt.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Soft Rosewater & Midnight Navy Palette',
          description: 'Subtle feminine rosewater tones balanced by deep professional navy.',
          hexes: ['#C9A9A6', '#1B263B', '#F7F4EE', '#161617']
        }
      };
    }
  },

  // Office 4: Lightweight Dress + Blazer + Appropriate Footwear (NO separate bottom!)
  {
    id: 'office_dress_blazer_pumps',
    occasion: 'office',
    silhouetteKey: 'dress_blazer_pumps',
    silhouetteName: 'Lightweight Dress + Blazer + Appropriate Footwear',
    title: 'The Executive Dress & Suiting Ensemble',
    subtitle: 'Tailored One-Piece Sheath & Structured Suiting Shield',
    aesthetic: 'EXECUTIVE POWER TAILORING · SCULPTURAL SILHOUETTE',
    style: 'classic_elegance',
    formalityScore: 9,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCool = temp === '10_19';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // 1. One-Piece Dress: check wardrobe
      const ownedDress = findMatchingWardrobePiece(
        wardrobe,
        'one_piece',
        'office',
        temp,
        weather,
        'Core Piece',
        'Layer under a tailored blazer for office authority.',
        (item) => item.specificType.toLowerCase().includes('dress') || item.name.toLowerCase().includes('dress')
      );

      if (ownedDress && !isCold) {
        pieces.push(ownedDress);
      } else if (isHot) {
        pieces.push({
          category: 'one_piece',
          name: 'Sleeveless Linen-Cotton Sheath Dress',
          colorName: 'Sand Beige',
          colorHex: '#D4C9BC',
          role: 'Core Piece',
          description: 'Breathable natural-fiber sheath dress with boat neckline and tailored waist darts.',
          stylingTip: 'Keeps you comfortable during hot commutes and transitions smoothly to indoor AC.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'one_piece',
          name: 'Long-Sleeve Merino Wool Midi Dress',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Core Piece',
          description: 'Insulating fine-knit merino wool dress with comfortable ribbed collar.',
          stylingTip: 'Traps body warmth while maintaining a contoured professional line.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'one_piece',
          name: 'Tailored Crepe Shift Dress',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Core Piece',
          description: 'Three-season lightweight shift dress with clean jewel neckline and knee-length hem.',
          stylingTip: 'Provides a clean one-piece foundation under a blazer.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // NOTICE: Absolute adherence to Section 4: Dresses must NOT receive a separate bottom!

      // 2. Blazer / Layer: check wardrobe
      const ownedBlazer = findMatchingWardrobePiece(
        wardrobe,
        'outerwear',
        'office',
        temp,
        weather,
        'Complementary Layer',
        'Drape over shoulders.',
        (item) => item.specificType.toLowerCase().includes('blazer') || item.name.toLowerCase().includes('blazer')
      );

      if (ownedBlazer && !isHot) {
        pieces.push(ownedBlazer);
      } else if (isHot) {
        // In 30°C+ hot weather, lightweight unlined blazer is optional for office AC
        pieces.push({
          category: 'outerwear',
          name: 'Unlined Lightweight Cotton-Linen Blazer',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Complementary Layer',
          description: 'Light unlined blazer kept on hand for air-conditioned office interiors.',
          stylingTip: 'Carry folded over arm during hot outdoor transit.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Tailored Double-Breasted Wool Blazer',
          colorName: 'Charcoal Heather',
          colorHex: '#4A4E57',
          role: 'Complementary Layer',
          description: 'Structured wool blazer adding warmth and authority over the knit dress.',
          stylingTip: 'Adds boardroom polish.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'outerwear',
          name: 'Tailored Single-Breasted Blazer',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Complementary Layer',
          description: 'Crisp single-breasted blazer with peak lapels.',
          stylingTip: 'Contrast lighter blazer against a darker dress for visual balance.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 3. Footwear
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Calfskin Loafers with Rubber Soles',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Treated leather footwear designed to repel water on wet sidewalks.',
          stylingTip: 'Comfortable alternative to heels on rainy commutes.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Calfskin Knee-High Boots with Block Heel',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Insulating leather boots reaching up toward the dress hem.',
          stylingTip: 'Protects calves against winter wind.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Leather Block-Heel Pumps (50mm)',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Calfskin pumps with supportive block heel for steady walking.',
          stylingTip: 'Provides all-day standing comfort.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 4. Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Windproof Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Canopy shielding your dress from drizzle.',
          stylingTip: 'Stows cleanly in your bag.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'office',
        'Lightweight Dress + Blazer + Appropriate Footwear'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Proportion Anchor: A tailored blazer hitting mid-hip over a clean shift dress balances the torso and accentuates vertical stature.',
        textureTip: 'Pair the matte surface of the dress with crisp tailored blazer lapels.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Ivory, Navy & Charcoal Executive Suiting',
          description: 'Deep nautical and neutral tones commanding professional respect.',
          hexes: ['#1B263B', '#F7F4EE', '#4A4E57', '#161617']
        }
      };
    }
  },

  // Office 5: Fine-Knit Top + Wide-Leg Trousers + Slingbacks
  {
    id: 'office_fine_knit_wide_trousers_slingbacks',
    occasion: 'office',
    silhouetteKey: 'fine_knit_wide_trousers_slingbacks',
    silhouetteName: 'Fine-Knit Top + Wide-Leg Trousers + Slingbacks',
    title: 'The Contemporary Architectural Fluidity',
    subtitle: 'Fine-Gauge Knit & Floor-Skimming Wide-Leg Trousers',
    aesthetic: 'EDITORIAL PROPORTIONS · ARCHITECTURAL SLINGBACKS',
    style: 'avant_garde',
    formalityScore: 8,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCool = temp === '10_19';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // 1. Top: Fine-Knit
      if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Sleeveless Cotton-Silk Ribbed Knit Top',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Core Piece',
          description: 'Fine-gauge knit that breathes freely with a sleek crew neckline.',
          stylingTip: 'Tuck tightly into high-rise waistband to anchor the trousers.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Ribbed Cashmere Turtleneck Knit',
          colorName: 'Charcoal Heather',
          colorHex: '#4A4E57',
          role: 'Core Piece',
          description: 'Dense 2-ply cashmere knit providing warmth against winter chill.',
          stylingTip: 'Tuck into trousers to maintain waist definition.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Fine-Gauge Merino Crewneck Knit Top',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Core Piece',
          description: 'Fine wool knit offering soft hand-feel and sleek drape.',
          stylingTip: 'Roll sleeves slightly up forearms.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 2. Bottom: Wide-Leg Trousers
      const ownedWide = findMatchingWardrobePiece(
        wardrobe,
        'bottoms',
        'office',
        temp,
        weather,
        'Essential Bottom',
        'Sits at the true waist.',
        (item) => item.specificType.toLowerCase().includes('wide') || item.name.toLowerCase().includes('wide')
      );

      if (ownedWide && !isCold && !isRain) {
        pieces.push(ownedWide);
      } else if (isHot) {
        pieces.push({
          category: 'bottoms',
          name: 'Pleated Linen-Cotton Wide-Leg Trousers',
          colorName: 'Soft Ecru',
          colorHex: '#E8E2D9',
          role: 'Essential Bottom',
          description: 'Breathable linen blend trousers that allow air circulation with each stride.',
          stylingTip: 'Pair with pointed slingbacks.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'bottoms',
          name: 'Wool Wide-Leg Pleated Trousers',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'Substantial wool trousers blocking cold street gusts.',
          stylingTip: 'Dramatic drape balances the chunky sweater.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'bottoms',
          name: isRain ? 'Cropped Ankle Wide-Leg Trousers' : 'Double-Pleated Wide-Leg Trousers',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: isRain
            ? 'Cropped hemline avoiding damp pavement splatters.'
            : 'Full-length trousers with deep front pleats and fluid movement.',
          stylingTip: 'Creates a clean vertical line.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 3. Outerwear (only when needed)
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Tailored Wool Wrap Coat',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Full-length coat providing warmth for winter commutes.',
          stylingTip: 'Tie belt firmly around waist.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Gabardine Trench',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Rain-shedding outer layer protecting your trousers.',
          stylingTip: 'Wear buttoned in downpours.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCool) {
        pieces.push({
          category: 'outerwear',
          name: 'Minimalist Collarless Jacket',
          colorName: 'Deep Charcoal',
          colorHex: '#32363D',
          role: 'Complementary Layer',
          description: 'Clean tailored layer complementing wide-leg proportion.',
          stylingTip: 'Wear open.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 4. Footwear: Slingbacks
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Rubber-Soled Leather Loafers',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Closed leather shoe preventing rain splashes on feet.',
          stylingTip: 'Replaces slingbacks on rainy commutes.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Pointed Calfskin Ankle Boots',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Pointed leather boot peeking out from under the wide-leg hem.',
          stylingTip: 'Warm closed footwear for winter.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Pointed Calfskin Slingback Kitten Heels (40mm)',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Leather slingbacks with pointed toe and sculpted low heel.',
          stylingTip: 'Pointed toe emerges cleanly from wide trousers.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 5. Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Travel Umbrella',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Accent Accessory',
          description: 'Canopy protecting your outfit from rain.',
          stylingTip: 'Stows easily.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'office',
        'Fine-Knit Top + Wide-Leg Trousers + Slingbacks'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Tight-Loose Proportion Principle: When trousers are voluminous, keep the knit top fitted or tucked to maintain waist definition.',
        textureTip: 'Juxtapose the fine ribbed knit against the flat weave of tailored trousers.',
        recommendedMetal: 'Mixed Metallics',
        colorHarmony: {
          name: 'Camel, Navy & Obsidian Contrast',
          description: 'Warm earth camel paired with navy and grounded black.',
          hexes: ['#C19A6B', '#1B263B', '#161617', '#E8E2D9']
        }
      };
    }
  },

  // Office 6: Short-Sleeve Shirt + Lightweight Trousers + Minimalist Sneakers
  {
    id: 'office_short_sleeve_trouser_sneakers',
    occasion: 'office',
    silhouetteKey: 'short_sleeve_trouser_sneakers',
    silhouetteName: 'Short-Sleeve Shirt + Lightweight Trousers + Minimalist Sneakers',
    title: 'The Contemporary Minimalist Sartorial',
    subtitle: 'Camp-Collar Shirting, Ankle Trousers & Clean Leather Sneakers',
    aesthetic: 'CLEAN ARCHITECTURAL CASUAL · AIRY MODERNITY',
    style: 'modern_casual',
    formalityScore: 7,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCool = temp === '10_19';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // 1. Top
      if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Camp-Collar Linen Short-Sleeve Shirt',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Core Piece',
          description: 'Lightweight linen shirt with relaxed open collar for maximum heat dissipation.',
          stylingTip: 'Leave untucked or half-tucked for airy summer office comfort.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Cotton Shirt layered with Cashmere Crewneck',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Core Piece',
          description: 'Layered combination keeping the torso warm in winter weather.',
          stylingTip: 'Clean minimalist look adapted for frost.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Short-Sleeve Cotton Poplin Shirt',
          colorName: 'Powder Sky Blue',
          colorHex: '#A5C4D4',
          role: 'Core Piece',
          description: 'Clean poplin shirt with neat collar and structured short sleeves.',
          stylingTip: 'Button up to the collar for architectural simplicity.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 2. Bottom: Lightweight Trousers
      if (isHot) {
        pieces.push({
          category: 'bottoms',
          name: 'Lightweight Tropical Cotton Ankle Trousers',
          colorName: 'Sand Beige',
          colorHex: '#D4C9BC',
          role: 'Essential Bottom',
          description: 'Lightweight cotton trousers cropped neatly at the ankle.',
          stylingTip: 'Clean crop frames minimalist sneakers cleanly.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'bottoms',
          name: 'Wool Flannel Straight Trousers',
          colorName: 'Charcoal Heather',
          colorHex: '#4A4E57',
          role: 'Essential Bottom',
          description: 'Substantial wool trousers providing insulation in cold temperatures.',
          stylingTip: 'Pairs cleanly with leather footwear.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'bottoms',
          name: 'Tapered Ankle-Length Wool-Blend Trousers',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'Tailored trousers with no-break hemline designed for low-profile sneakers.',
          stylingTip: 'Maintains sharp tailoring while embracing modern workplace comfort.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 3. Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Insulated Wool Overcoat',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Full-length coat providing complete cold weather protection.',
          stylingTip: 'Button securely.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Minimalist Rain Mac',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Clean rain layer stopping wet drafts.',
          stylingTip: 'Matches modern sneaker ease.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCool) {
        pieces.push({
          category: 'outerwear',
          name: 'Unlined Wool Overshirt Jacket',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Clean utilitarian layer stopping cool drafts.',
          stylingTip: 'Wear open over shirting.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 4. Footwear: Minimalist Sneakers
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Calfskin Loafers with Rubber Tread',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Treated leather shoe replacing white sneakers to avoid rain stains.',
          stylingTip: 'Keeps feet dry on rainy days.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Leather Ankle Boots with Rubber Sole',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Sealed leather boots keeping ankles warm in freezing weather.',
          stylingTip: 'Maintains minimalist lines while providing insulation.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Minimalist White Leather Low-Top Sneakers',
          colorName: 'Chalk White',
          colorHex: '#F7F4EE',
          role: 'Footwear Anchor',
          description: 'Clean calfskin low-top sneakers with rubber cupsole.',
          stylingTip: 'Keep clean for sharp intentionality in the office.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 5. Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Wind-Resistant Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Compact travel umbrella.',
          stylingTip: 'Protects sneakers and shirting.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (weather === 'sunny' && !isCold) {
        pieces.push({
          category: 'accessories',
          name: 'UV400 Sleek Acetate Sunglasses',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Minimalist sun protection against midday commute glare.',
          stylingTip: 'Complements the minimalist styling.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'office',
        'Short-Sleeve Shirt + Lightweight Trousers + Minimalist Sneakers'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Immaculate Sneaker Rule: When wearing sneakers to the office, ensure the leather is scuff-free and trousers have zero break to maintain sharp intentionality.',
        textureTip: 'Pair smooth matte calfskin sneakers with crisp poplin and textured worsted wool.',
        recommendedMetal: 'Cool Silver',
        colorHarmony: {
          name: 'Sky Blue, Sand & Chalk White Palette',
          description: 'Airy Nordic office palette with luminous chalk white grounding.',
          hexes: ['#A5C4D4', '#D4C9BC', '#1B263B', '#F7F4EE']
        }
      };
    }
  },

  // --------------------------------------------------------------------------
  // 2. CASUAL WEAR ARCHETYPES
  // --------------------------------------------------------------------------

  // Casual 1: Breton Stripe Cotton Tee + Straight Denim + Clean Low-Tops
  {
    id: 'casual_breton_denim_sneakers',
    occasion: 'casual',
    silhouetteKey: 'breton_denim_sneakers',
    silhouetteName: 'Breton Stripe Tee + Straight Denim + Clean Low-Tops',
    title: 'The Parisian Denim Staple',
    subtitle: 'Classic Nautical Stripe & Vintage-Wash Denim',
    aesthetic: 'PARISIAN OFF-DUTY · EFFORTLESS TIMELESSNESS',
    style: 'parisian_chic',
    formalityScore: 4,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCool = temp === '10_19';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // Top: Breton Tee
      if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Short-Sleeve Cotton Breton Stripe Tee',
          colorName: 'Navy & Ivory',
          colorHex: '#1B263B',
          role: 'Core Piece',
          description: 'Lightweight combed cotton knit with breathable boat neckline.',
          stylingTip: 'Loose tuck into denim waistband.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Breton Stripe Knit layered under Wool Cardigan',
          colorName: 'Navy & Ivory',
          colorHex: '#1B263B',
          role: 'Core Piece',
          description: 'Cotton stripe top layered under insulating knitwear for winter cold.',
          stylingTip: 'Provides double layer warmth.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Long-Sleeve Breton Sailor Top',
          colorName: 'Navy & Ivory',
          colorHex: '#1B263B',
          role: 'Core Piece',
          description: 'Midweight combed jersey cotton with classic stripe pattern.',
          stylingTip: 'Push sleeves to mid-forearm.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Bottom: Denim
      if (isHot) {
        pieces.push({
          category: 'bottoms',
          name: 'Lightweight Washed Cotton Straight Denim',
          colorName: 'Faded Indigo',
          colorHex: '#253B59',
          role: 'Essential Bottom',
          description: '10oz breathable light-wash denim with relaxed straight leg.',
          stylingTip: 'Roll cuffs once over ankle.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'bottoms',
          name: 'Heavy Cotton Denim Trousers',
          colorName: 'Deep Obsidian',
          colorHex: '#161617',
          role: 'Essential Bottom',
          description: 'Dense heavyweight cotton denim that blocks icy winds.',
          stylingTip: 'Sturdy wind-resistant weave.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'bottoms',
          name: 'Vintage-Wash Straight-Leg Denim',
          colorName: 'Faded Indigo',
          colorHex: '#253B59',
          role: 'Essential Bottom',
          description: '100% cotton denim with comfortable mid-rise.',
          stylingTip: 'Clean hem break at top of shoes.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Heavy Wool Coat',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Heavyweight coat keeping body warm in cold air.',
          stylingTip: 'Drapes casually over denim.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Hooded Rain Parka',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Water-shedding shell protecting against precipitation.',
          stylingTip: 'Zip front when walking in rain.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCool) {
        pieces.push({
          category: 'outerwear',
          name: 'Cotton Gabardine Trench Coat',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Transitional outer layer shielding from wind.',
          stylingTip: 'Wear open.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Footwear
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Water-Resistant Chelsea Boots with Rubber Tread',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Footwear Anchor',
          description: 'Rubber-soled leather boots that keep feet dry in rain puddles.',
          stylingTip: 'Prevents wet socks in puddles.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Lug-Sole Leather Chelsea Boots',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Insulating boots with thick tread for cold pavements.',
          stylingTip: 'Tucks easily under straight denim.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Clean White Leather Low-Top Sneakers',
          colorName: 'Chalk White',
          colorHex: '#F7F4EE',
          role: 'Footwear Anchor',
          description: 'Supple leather cupsole trainers.',
          stylingTip: 'Understated off-duty casual staple.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Keeps rain off cotton shirting.',
          stylingTip: 'Stows in bag.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'casual',
        'Breton Stripe Tee + Straight Denim + Clean Low-Tops'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Horizontal-Vertical Balance: Pair horizontal Breton stripes with straight, un-cuffed vertical denim lines to maintain proportional height.',
        textureTip: 'Contrast the dry slub of washed denim with smooth combed cotton jersey.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Nautical Navy, Indigo & Chalk White',
          description: 'Seaside-inspired casual clarity with warm leather touches.',
          hexes: ['#1B263B', '#253B59', '#F7F4EE', '#C19A6B']
        }
      };
    }
  },

  // Casual 2: Relaxed Linen Button-Down + Linen Trousers + Espadrilles
  {
    id: 'casual_linen_shirt_drawstring_espadrilles',
    occasion: 'casual',
    silhouetteKey: 'linen_shirt_drawstring_espadrilles',
    silhouetteName: 'Relaxed Linen Button-Down + Linen Trousers + Espadrilles',
    title: 'The Sun-Washed Riviera Casual',
    subtitle: 'Airy Washed Linen & Handcrafted Espadrille Ease',
    aesthetic: 'RESORT CASUAL · ORGANIC TEXTILES',
    style: 'bohemian_relaxed',
    formalityScore: 4,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCool = temp === '10_19';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // Top
      if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Wool Fisherman Sweater over Cotton Shirt',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Core Piece',
          description: 'Dense insulating knitwear keeping body warm in cold weather.',
          stylingTip: 'Locks in body warmth.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Open-Collar Washed Linen Shirt',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Core Piece',
          description: 'Naturally breathable linen shirt with soft collar and relaxed cuffs.',
          stylingTip: 'Leave 2 buttons undone and roll sleeves twice.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Bottom
      if (isHot) {
        pieces.push({
          category: 'bottoms',
          name: 'Linen-Cotton Drawstring Shorts',
          colorName: 'Sand Beige',
          colorHex: '#D4C9BC',
          role: 'Essential Bottom',
          description: 'Mid-thigh tailored shorts in breathable linen-cotton with drawstring waist.',
          stylingTip: 'Allows maximum ventilation in 30°C+ conditions.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'bottoms',
          name: 'Corduroy Casual Trousers',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Essential Bottom',
          description: 'Dense corduroy trousers blocking cold breezes.',
          stylingTip: 'Warm and rugged for winter.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'bottoms',
          name: 'Relaxed Linen Drawstring Trousers',
          colorName: 'Sand Beige',
          colorHex: '#D4C9BC',
          role: 'Essential Bottom',
          description: 'Breathable pure linen trousers with internal drawstring and side pockets.',
          stylingTip: 'Roll hem once over shoes.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Heavy Wool Parka',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Thick outer insulation.',
          stylingTip: 'Keeps winter chill out.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Lightweight Packable Rain Shell',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Water-shedding shell preventing moisture penetration.',
          stylingTip: 'Slip on when showers begin.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCool) {
        pieces.push({
          category: 'outerwear',
          name: 'Cotton-Twill Overshirt',
          colorName: 'Muted Sage',
          colorHex: '#94A187',
          role: 'Complementary Layer',
          description: 'Light barrier preventing breeze penetration.',
          stylingTip: 'Drape casually over shoulders.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Footwear
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Rubber-Soled Leather Loafers',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Footwear Anchor',
          description: 'Rubber tread protects against wet sidewalks (jute espadrilles cannot be worn in rain).',
          stylingTip: 'Never wear jute or rope footwear in rain.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Leather Chelsea Boots with Lug Sole',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Footwear Anchor',
          description: 'Sealed winter footwear.',
          stylingTip: 'Replaces espadrilles in freezing cold.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Jute-Sole Canvas Espadrilles',
          colorName: 'Sand Ivory',
          colorHex: '#E8E2D9',
          role: 'Footwear Anchor',
          description: 'Natural woven jute sole with breathable canvas upper.',
          stylingTip: 'Breathable walking shoe for warm days.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Functional Accessory
      if (weather === 'sunny' && !isCold) {
        pieces.push({
          category: 'accessories',
          name: 'Woven Panama Sun Hat',
          colorName: 'Natural Straw',
          colorHex: '#C19A6B',
          role: 'Accent Accessory',
          description: 'Woven straw hat shielding face and scalp from UV rays.',
          stylingTip: 'Essential sun defense.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Travel Umbrella',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Accent Accessory',
          description: 'Canopy keeping rain off linen shirting.',
          stylingTip: 'Stows easily.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'casual',
        'Relaxed Linen Button-Down + Linen Trousers + Espadrilles'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Natural Slub Acceptance: High-grade linen is meant to soften and crease gently; its organic texture is the hallmark of warm-weather leisure.',
        textureTip: 'Combine coarse jute rope texture with softly rumpled washed linen.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Sun-Bleached Ecru, Sand & Raffia',
          description: 'Organic sun-drenched neutral spectrum.',
          hexes: ['#F7F4EE', '#D4C9BC', '#C19A6B', '#94A187']
        }
      };
    }
  },

  // Casual 3: Ribbed Knit Cardigan + Wide Trousers + Retro Trainers
  {
    id: 'casual_cardigan_wide_trousers_trainers',
    occasion: 'casual',
    silhouetteKey: 'cardigan_wide_trousers_trainers',
    silhouetteName: 'Oversized Cardigan + Fluid Wide-Leg Trousers + Leather Trainers',
    title: 'The Relaxed Knit & Fluidity Lounge',
    subtitle: 'Tactile Ribbed Cardigan & Wide-Leg Movement',
    aesthetic: 'COCOONING CASUAL · ARCHITECTURAL KNITWEAR',
    style: 'modern_casual',
    formalityScore: 5,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCool = temp === '10_19';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // 1. Top
      if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Open-Knit Cotton Sleeveless Tank',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Core Piece',
          description: 'Airy summer knit alternative that avoids overheating while preserving texture.',
          stylingTip: 'Tuck into high-waist fluid trousers.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Ribbed Wool Cardigan layered over Turtleneck',
          colorName: 'Charcoal Heather',
          colorHex: '#4A4E57',
          role: 'Core Piece',
          description: 'Heavy gauge knitwear with button closure providing thermal warmth.',
          stylingTip: 'Button up over a thermal base layer.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Cotton-Merino Cardigan over White Tee',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Core Piece',
          description: 'Slouchy V-neck cardigan worn over a plain crewneck tee.',
          stylingTip: 'Leave bottom two buttons open for easy movement.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 2. Bottom
      if (isHot) {
        pieces.push({
          category: 'bottoms',
          name: 'Fluid Cotton-Linen Wide-Leg Pants',
          colorName: 'Sand Beige',
          colorHex: '#D4C9BC',
          role: 'Essential Bottom',
          description: 'Breathable wide pants with elasticated back waist.',
          stylingTip: 'Moves breezily in heat.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'bottoms',
          name: 'Wool Flannel Wide-Leg Trousers',
          colorName: 'Charcoal Heather',
          colorHex: '#4A4E57',
          role: 'Essential Bottom',
          description: 'Warm brushed wool flannel trousers with comfortable volume.',
          stylingTip: 'Blocks wind while preserving relaxed silhouette.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'bottoms',
          name: 'Fluid Cotton-Twill Wide Trousers',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'Casual trousers with front pleats and fluid draped hem.',
          stylingTip: 'Breaks cleanly over retro sneakers.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 3. Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Wool Overcoat',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Full-length coat for severe winter chills.',
          stylingTip: 'Button securely.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Gabardine Trench',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Coat balancing soft knitwear with weather resistance.',
          stylingTip: 'Wear open indoors.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 4. Footwear
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Leather Chelsea Boots',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Treated leather boots that keep feet dry in rain puddles.',
          stylingTip: 'Protects ankles and trousers from splash.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Lug-Sole Leather Boots',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Insulated boots with deep tread for winter pavements.',
          stylingTip: 'Non-slip traction on cold pavement.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Retro Leather Low-Top Trainers',
          colorName: 'Chalk White',
          colorHex: '#F7F4EE',
          role: 'Footwear Anchor',
          description: 'Streamlined leather trainers with gum rubber sole and padded collar.',
          stylingTip: 'Anchors the fluid hemline.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 5. Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Travel Umbrella',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Accent Accessory',
          description: 'Shields knitwear from rain damage.',
          stylingTip: 'Quick deployment.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'casual',
        'Oversized Cardigan + Fluid Wide-Leg Trousers + Leather Trainers'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Weight Grounding Rule: Wide fluid hemlines look best when grounded by a substantial, flat-soled leather sneaker that allows trousers to break cleanly.',
        textureTip: 'Contrast chunky ribbing against fluid, smooth-woven twill.',
        recommendedMetal: 'Mixed Metallics',
        colorHarmony: {
          name: 'Camel Tan, Navy & Sand Harmony',
          description: 'Warm cocooning earth palette.',
          hexes: ['#C19A6B', '#1B263B', '#D4C9BC', '#F7F4EE']
        }
      };
    }
  },

  // Casual 4: Utility Overshirt + Chinos + Leather Desert Boots
  {
    id: 'casual_overshirt_chinos_boots',
    occasion: 'casual',
    silhouetteKey: 'overshirt_chinos_boots',
    silhouetteName: 'Utility Overshirt + Chinos + Leather Desert Boots',
    title: 'The Utilitarian Modern Workwear',
    subtitle: 'Heavy Cotton Twill Overshirt & Structured Fatigue Chinos',
    aesthetic: 'CONTEMPORARY UTILITARIAN · WORKWEAR LUXE',
    style: 'modern_casual',
    formalityScore: 5,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCool = temp === '10_19';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // 1. Top
      if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Washed Linen Utility Short-Sleeve Shirt',
          colorName: 'Muted Sage',
          colorHex: '#94A187',
          role: 'Core Piece',
          description: 'Breathable linen short-sleeve shirt with twin flap chest pockets.',
          stylingTip: 'Wear open over a light cotton base.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Wool-Blend CPO Overshirt over Thermal Knit',
          colorName: 'Muted Sage',
          colorHex: '#94A187',
          role: 'Core Piece',
          description: 'Dense wool workshirt layered over a thermal waffle knit long-sleeve.',
          stylingTip: 'Double thermal insulation for winter.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Cotton Twill Utility Overshirt over Cotton Tee',
          colorName: 'Muted Sage',
          colorHex: '#94A187',
          role: 'Core Piece',
          description: 'Durable washed twill overshirt with horn buttons.',
          stylingTip: 'Wear open over a clean white cotton base.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 2. Bottom
      if (isHot) {
        pieces.push({
          category: 'bottoms',
          name: 'Lightweight Cotton Chinos',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Essential Bottom',
          description: 'Lightweight breathable cotton with clean straight cut.',
          stylingTip: 'Roll hem once.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'bottoms',
          name: 'Heavy Cotton Cavalry Twill Chinos',
          colorName: 'Deep Obsidian',
          colorHex: '#161617',
          role: 'Essential Bottom',
          description: 'Wind-blocking dense cotton weave.',
          stylingTip: 'Tucks over desert boots.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'bottoms',
          name: 'Straight-Leg Cotton Fatigue Chinos',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Essential Bottom',
          description: 'Cotton twill trousers with patch pockets and relaxed knee room.',
          stylingTip: 'Pair with leather belt.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 3. Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Insulated Wool Car Coat',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Heavy outer shell stopping winter windchill.',
          stylingTip: 'Keeps workwear protected outdoors.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Waterproof Hooded Utility Rain Jacket',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Weather-sealed shell designed to shed rain showers.',
          stylingTip: 'Zip to collar in showers.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 4. Footwear
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Smooth Calfskin Desert Boots with Rubber Soles',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Footwear Anchor',
          description: 'Treated smooth leather boots (never untreated suede in rain).',
          stylingTip: 'Rubber sole repels sidewalk moisture.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Leather Lug-Sole Boots',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Footwear Anchor',
          description: 'Heavy tread boots keeping feet warm.',
          stylingTip: 'Laced snugly.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Calfskin Leather Desert Chukka Boots',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Footwear Anchor',
          description: 'Classic chukka boots in supple full-grain leather.',
          stylingTip: 'Pairs naturally with fatigue chinos.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 5. Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Protective travel umbrella.',
          stylingTip: 'Keeps hands dry.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'casual',
        'Utility Overshirt + Chinos + Leather Desert Boots'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Unbuttoned Overshirt Rule: Wearing a structured overshirt open over a pale base layer creates a clean vertical centerline.',
        textureTip: 'Pair dense cotton twill with smooth leather boots and ribbed jersey.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Muted Sage, Camel & Espresso',
          description: 'Grounded utilitarian earth tones.',
          hexes: ['#94A187', '#C19A6B', '#3D2B1F', '#F7F4EE']
        }
      };
    }
  },

  // --------------------------------------------------------------------------
  // 3. PARTY WEAR ARCHETYPES
  // --------------------------------------------------------------------------

  // Party 1: Silk Satin Slip Midi Dress + Strappy Heels (One-piece: NO bottom!)
  {
    id: 'party_silk_slip_strappy_heels',
    occasion: 'party',
    silhouetteKey: 'silk_slip_strappy_heels',
    silhouetteName: 'Silk Satin Slip Midi Dress + Strappy Heels',
    title: 'The Liquid Silk Cocktail Minimalist',
    subtitle: 'Lustrous Bias-Cut Satin & High-Impact Glamour',
    aesthetic: '90s EDITORIAL GLAMOUR · SENSUAL FLUIDITY',
    style: 'parisian_chic',
    formalityScore: 8,
    buildOutfit: (weather, temp, wardrobe) => {
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // 1. One-Piece Dress: check wardrobe
      const ownedDress = findMatchingWardrobePiece(
        wardrobe,
        'one_piece',
        'party',
        temp,
        weather,
        'Core Piece',
        'Drapes sensually along body contours.',
        (item) => item.specificType.toLowerCase().includes('slip') || item.name.toLowerCase().includes('slip')
      );

      if (ownedDress && !isCold) {
        pieces.push(ownedDress);
      } else {
        pieces.push({
          category: 'one_piece',
          name: 'Bias-Cut Satin Slip Midi Dress',
          colorName: 'Emerald Forest',
          colorHex: '#1B4332',
          role: 'Core Piece',
          description: 'Fluid satin dress cut on the bias with delicate straps.',
          stylingTip: 'Catches evening light with liquid movement.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // NOTICE: Absolute adherence to Section 4: Dresses must NOT receive a separate bottom!

      // 2. Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Tailored Wool Evening Coat',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Insulated evening overcoat shielding the slip dress during transit.',
          stylingTip: 'Check at the coat room upon arrival.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Evening Trench',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Water-repellent trench protecting the dress from rain splatters.',
          stylingTip: 'Button securely on arrival.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (temp === '10_19') {
        const ownedBlazer = findMatchingWardrobePiece(
          wardrobe,
          'outerwear',
          'party',
          temp,
          weather,
          'Complementary Layer',
          'Drape over shoulders.',
          (item) => item.specificType.toLowerCase().includes('blazer') || item.name.toLowerCase().includes('blazer')
        );
        if (ownedBlazer) {
          pieces.push(ownedBlazer);
        } else {
          pieces.push({
            category: 'outerwear',
            name: 'Oversized Tailored Wool Blazer',
            colorName: 'Charcoal Heather',
            colorHex: '#4A4E57',
            role: 'Complementary Layer',
            description: 'Structured masculine blazer draped over feminine silk slip.',
            stylingTip: 'Drape over shoulders indoors.',
            isWardrobeOwned: false,
            sourceLabel: 'Curated Catalog'
          });
        }
      }

      // 3. Footwear
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Patent Leather Pointed Pumps',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Patent finish repelling wet sidewalk moisture with non-slip sole.',
          stylingTip: 'Replaces open strappy sandals in rain.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Pointed Calfskin Ankle Boots',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Sleek ankle boots keeping feet insulated under the midi hem.',
          stylingTip: 'Warm evening footwear.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Metallic Strappy Heeled Sandals (70mm)',
          colorName: 'Gilded Gold',
          colorHex: '#C19A6B',
          role: 'Footwear Anchor',
          description: 'Minimalist leather ankle-wrap straps with polished stiletto heel.',
          stylingTip: 'Elongates legs effortlessly.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 4. Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Shields evening hair and dress from rain.',
          stylingTip: 'Essential arrival protection.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'party',
        'Silk Satin Slip Midi Dress + Strappy Heels'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The High-Contrast Evening Duality: Contrast a feminine slip dress with tailored outerwear to project effortless confidence.',
        textureTip: 'Pair the lustrous reflection of satin against matte outerwear.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Emerald Jewel & Gilded Gold Radiance',
          description: 'Opulent evening palette shimmering under nightlife lights.',
          hexes: ['#1B4332', '#C19A6B', '#161617', '#F7F4EE']
        }
      };
    }
  },

  // Party 2: Tailored Tuxedo Blazer + Cigarette Trousers + Stiletto Pumps
  {
    id: 'party_tuxedo_blazer_cigarette_trousers',
    occasion: 'party',
    silhouetteKey: 'tuxedo_blazer_cigarette_trousers',
    silhouetteName: 'Tailored Tuxedo Blazer + Cigarette Trousers + Stiletto Pumps',
    title: 'The Le Smoking Tuxedo Power Ensemble',
    subtitle: 'Satin-Lapel Tuxedo Suiting & Sharp Stiletto Footwear',
    aesthetic: 'YSL LE SMOKING · RAZOR-SHARP POWER',
    style: 'minimalist_tailored',
    formalityScore: 9,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // Top / Jacket
      if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Tailored Tuxedo Waistcoat Vest',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Core Piece',
          description: 'Sleeveless tailored tuxedo vest worn as a standalone top in warm party conditions.',
          stylingTip: 'Sharp V-neckline flatters collarbones without heat buildup.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'outerwear',
          name: 'Tailored Tuxedo Blazer with Satin Lapels',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Core Piece',
          description: 'Single-breasted wool tuxedo jacket with silk satin lapels and covered buttons.',
          stylingTip: 'Wear buttoned over a delicate camisole.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
        pieces.push({
          category: 'tops',
          name: 'Silk Georgette Camisole Shell',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Essential Top',
          description: 'Delicate silk shell peeking under the tuxedo lapels.',
          stylingTip: 'Tucks cleanly into trousers.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Bottom: Cigarette Trousers
      pieces.push({
        category: 'bottoms',
        name: 'Wool Cigarette Trousers with Satin Stripe',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Essential Bottom',
        description: 'Tapered ankle-length tuxedo trousers with vertical grosgrain stripe.',
        stylingTip: 'Elongates legs directly down to shoe points.',
        isWardrobeOwned: false,
        sourceLabel: 'Curated Catalog'
      });

      // Extra layer in cold
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Wool Overcoat',
          colorName: 'Deep Charcoal',
          colorHex: '#32363D',
          role: 'Complementary Layer',
          description: 'Insulating outer overcoat for cold party arrivals.',
          stylingTip: 'Full thermal barrier.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Footwear: Stiletto Pumps
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Patent Leather Pumps with Rubber Soles',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Patent finish repelling water with non-slip sole.',
          stylingTip: 'Boardroom-to-party rain defense.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Pointed Calfskin Pumps (75mm)',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Sculpted leather pumps with pointed toe silhouette.',
          stylingTip: 'Completes the power evening aesthetic.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Canopy protecting your suiting in rain.',
          stylingTip: 'Keeps suiting dry.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'party',
        'Tailored Tuxedo Blazer + Cigarette Trousers + Stiletto Pumps'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Monochrome Texture Rule: When wearing head-to-toe black in evening settings, rely on satin lapels against matte wool to create visual dimension.',
        textureTip: 'Pair liquid silk satin lapels against dense matte worsted wool twill.',
        recommendedMetal: 'Cool Silver',
        colorHarmony: {
          name: 'Obsidian Black & Silk Satin Monochromatic',
          description: 'Commanding black-tie monochrome with metallic hardware.',
          hexes: ['#161617', '#32363D', '#F7F4EE', '#C19A6B']
        }
      };
    }
  },

  // --------------------------------------------------------------------------
  // 4. DATE NIGHT WEAR ARCHETYPES
  // --------------------------------------------------------------------------

  // Date Night 1: Silk Camisole + High-Rise Trousers + Strappy Heels
  {
    id: 'date_silk_camisole_trousers_heels',
    occasion: 'date_night',
    silhouetteKey: 'silk_camisole_trousers_heels',
    silhouetteName: 'Silk Camisole + High-Rise Trousers + Strappy Heels',
    title: 'The Intimate Seduction Minimalist',
    subtitle: 'Cowl-Neck Silk Drape & Sculpted High-Rise Trousers',
    aesthetic: 'ROMANTIC MINIMALISM · SUBTLE INTIMACY',
    style: 'parisian_chic',
    formalityScore: 7,
    buildOutfit: (weather, temp, wardrobe) => {
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // Top: Silk Camisole
      if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Silk Camisole layered under Cashmere Knit',
          colorName: 'Dusty Rosewater',
          colorHex: '#C9A9A6',
          role: 'Core Piece',
          description: 'Delicate silk base protected by plush cashmere knitwear.',
          stylingTip: 'Expose one shoulder to display delicate silk strap.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Cowl-Neck Washed Silk Camisole',
          colorName: 'Dusty Rosewater',
          colorHex: '#C9A9A6',
          role: 'Core Piece',
          description: 'Washed silk camisole with fluid cowl neckline.',
          stylingTip: 'Tuck cleanly into the trouser waistband.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Bottom: High-Rise Trousers
      pieces.push({
        category: 'bottoms',
        name: 'High-Rise Tailored Wide-Leg Trousers',
        colorName: 'Obsidian Black',
        colorHex: '#161617',
        role: 'Essential Bottom',
        description: 'Fluid drape with sharp center crease that balances the delicate camisole top.',
        stylingTip: 'Accentuate high waist with slender leather belt.',
        isWardrobeOwned: false,
        sourceLabel: 'Curated Catalog'
      });

      // Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Tailored Wool Wrap Overcoat',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Complementary Layer',
          description: 'Warm coat for outdoor walking.',
          stylingTip: 'Belt securely.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Trench Coat',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Trench coat shielding silk from water spots.',
          stylingTip: 'Wear buttoned outdoors.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (temp === '10_19' || weather === 'windy') {
        pieces.push({
          category: 'outerwear',
          name: 'Leather Jacket',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Supple leather jacket contrasting delicate silk camisole.',
          stylingTip: 'Drape over shoulders indoors.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Footwear
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Leather Pointed Pumps with Rubber Soles',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Protected closed toe repelling evening rain.',
          stylingTip: 'Safe grip on wet walkways.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'footwear',
          name: 'Pointed Calfskin Ankle Boots',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Insulated sleek evening boots.',
          stylingTip: 'Tucks under wide trouser hems.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Leather Strappy Heeled Sandals (65mm)',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Fine ankle straps and sculpted heel offering flattering lift.',
          stylingTip: 'Complements the romantic mood.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Travel Umbrella',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Accent Accessory',
          description: 'Canopy protecting your hair and silk.',
          stylingTip: 'Keeps date night outfit dry.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'date_night',
        'Silk Camisole + High-Rise Trousers + Strappy Heels'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Skin-To-Tailoring Balance: When showing skin at the neckline, pair with floor-length trousers to maintain sophisticated balance.',
        textureTip: 'Pair fluid, light-catching silk against structured matte wool.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Dusty Rosewater & Obsidian Romance',
          description: 'Intimate rosewater blush grounded by deep obsidian black.',
          hexes: ['#C9A9A6', '#161617', '#F7F4EE', '#C19A6B']
        }
      };
    }
  },

  // Date Night 2: Fine Merino Knit Polo + Tailored Chinos + Loafers
  {
    id: 'date_merino_polo_chinos_loafers',
    occasion: 'date_night',
    silhouetteKey: 'merino_polo_chinos_loafers',
    silhouetteName: 'Fine Merino Knit Polo + Slim Chinos + Penny Loafers',
    title: 'The Refined Smart Rendezvous',
    subtitle: 'Tactile Fine-Gauge Knitwear & Tapered Tailoring',
    aesthetic: 'SARTORIAL RENDEZVOUS · QUIET LUXURY',
    style: 'classic_elegance',
    formalityScore: 7,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // Top: Knit Polo
      if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Cotton-Linen Knit Polo',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Core Piece',
          description: 'Breathable knit polo that remains dry and sharp in warm weather.',
          stylingTip: 'Leave open at the collar.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'tops',
          name: 'Long-Sleeve Merino Knit Polo',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Core Piece',
          description: 'Insulating knit polo with ribbed collar.',
          stylingTip: 'Traps body warmth with luxurious softness.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'tops',
          name: 'Fine Merino Knit Polo',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Core Piece',
          description: 'Fine wool polo with ribbed hem and clean collar.',
          stylingTip: 'Sits smooth over skin.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Bottom: Slim Chinos
      pieces.push({
        category: 'bottoms',
        name: 'Tailored Flat-Front Cotton Chinos',
        colorName: 'Camel Tan',
        colorHex: '#C19A6B',
        role: 'Essential Bottom',
        description: 'Tapered slim-straight chinos with clean waistband.',
        stylingTip: 'Hemmed neatly just above loafers.',
        isWardrobeOwned: false,
        sourceLabel: 'Curated Catalog'
      });

      // Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Tailored Wool Overcoat',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Full-length insulating coat.',
          stylingTip: 'Protects against winter night air.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Car Coat',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Complementary Layer',
          description: 'Outer layer repelling rain.',
          stylingTip: 'Protects knit polo.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (temp === '10_19') {
        pieces.push({
          category: 'outerwear',
          name: 'Lightweight Bomber Jacket',
          colorName: 'Deep Charcoal',
          colorHex: '#32363D',
          role: 'Complementary Layer',
          description: 'Clean outer layer adding masculine structure.',
          stylingTip: 'Zip halfway.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Footwear: Loafers
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Calfskin Loafers with Rubber Soles',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Rubber sole repelling wet streets.',
          stylingTip: 'Treated leather.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Burnished Calfskin Penny Loafers',
          colorName: 'Espresso Brown',
          colorHex: '#3D2B1F',
          role: 'Footwear Anchor',
          description: 'Leather loafers with leather sole and stacked heel.',
          stylingTip: 'Wear sockless or with fine dress socks.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Compact Travel Umbrella',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Accent Accessory',
          description: 'Shields shirting in drizzle.',
          stylingTip: 'Stows easily.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'date_night',
        'Fine Merino Knit Polo + Slim Chinos + Penny Loafers'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Tactile Intimacy Rule: On dates, wear soft natural fibers like merino or fine cotton that are comfortable and polished.',
        textureTip: 'Pair the fine ribbing of the merino polo with smooth compact twill chinos.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Navy, Camel & Espresso Sophistication',
          description: 'Classic warm masculine harmony.',
          hexes: ['#1B263B', '#C19A6B', '#3D2B1F', '#F7F4EE']
        }
      };
    }
  },

  // --------------------------------------------------------------------------
  // 5. WEDDING GUEST WEAR ARCHETYPES
  // --------------------------------------------------------------------------

  // Wedding 1: Silk Chiffon Midi Dress + Block Heels (One-piece: NO bottom!)
  {
    id: 'wedding_silk_chiffon_dress_block_heels',
    occasion: 'wedding_guest',
    silhouetteKey: 'silk_chiffon_dress_block_heels',
    silhouetteName: 'Silk Chiffon Midi Dress + Block Heels',
    title: 'The Botanical Silk Chiffon Elegance',
    subtitle: 'Flowing Tiered Chiffon & Lawn-Friendly Block Heels',
    aesthetic: 'ROMANTIC BOTANICAL · PASTORAL CEREMONY',
    style: 'classic_elegance',
    formalityScore: 8,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // 1. One-Piece Dress
      if (isHot) {
        pieces.push({
          category: 'one_piece',
          name: 'Sleeveless Tiered Chiffon Midi Dress',
          colorName: 'Dusty Rosewater',
          colorHex: '#C9A9A6',
          role: 'Core Piece',
          description: 'Featherlight chiffon dress with breathable lining and soft tiered skirt.',
          stylingTip: 'Floats effortlessly in garden breezes.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isCold) {
        pieces.push({
          category: 'one_piece',
          name: 'Long-Sleeve Velvet Midi Dress',
          colorName: 'Merlot Burgundy',
          colorHex: '#581825',
          role: 'Core Piece',
          description: 'Insulating velvet dress with jewel neckline and subtle waist drape.',
          stylingTip: 'Provides wedding guest formality with thermal warmth.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'one_piece',
          name: 'Floral Crepe Wrap Midi Dress',
          colorName: 'Dusty Rosewater',
          colorHex: '#C9A9A6',
          role: 'Core Piece',
          description: 'Lustrous crepe dress with delicate botanical print and waist sash.',
          stylingTip: 'Ties securely at the natural waist.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // NOTICE: Absolute adherence to Section 4: Dresses must NOT receive a separate bottom!

      // 2. Outerwear
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Tailored Wool Evening Coat',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Complementary Layer',
          description: 'Heavy formal coat keeping guests warm during arrivals.',
          stylingTip: 'Drapes over shoulders.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (isRain) {
        pieces.push({
          category: 'outerwear',
          name: 'Water-Repellent Formal Trench',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Complementary Layer',
          description: 'Formal outer layer protecting dress in rain.',
          stylingTip: 'Wear buttoned during arrival.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else if (temp === '10_19') {
        pieces.push({
          category: 'outerwear',
          name: 'Fine Wool Wrap Shawl',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Complementary Layer',
          description: 'Soft wrap providing temperature modulation during evening reception.',
          stylingTip: 'Drapes across shoulders.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 3. Footwear: Block Heels (Lawn Friendly)
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Calfskin Block-Heel Pumps',
          colorName: 'Warm Taupe',
          colorHex: '#A3998E',
          role: 'Footwear Anchor',
          description: 'Protected leather shoes that prevent water staining with steady block heel.',
          stylingTip: 'Block heel prevents sinking into damp turf.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Leather Ankle-Strap Block Heels (60mm)',
          colorName: 'Sand Ivory',
          colorHex: '#E8E2D9',
          role: 'Footwear Anchor',
          description: 'Block heel engineered specifically not to sink into garden grass during ceremonies.',
          stylingTip: 'Provides hours of dancing and walking stability.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 4. Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Clear Bubble Formal Umbrella',
          colorName: 'Clear Ivory',
          colorHex: '#F7F4EE',
          role: 'Accent Accessory',
          description: 'Dome canopy shielding formal hair without obscuring outfit photos.',
          stylingTip: 'Perfect for wedding arrivals.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'wedding_guest',
        'Silk Chiffon Midi Dress + Block Heels'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Garden Wedding Lawn Protocol: Never wear needle stilettos on grassy venue grounds; wide block heels provide equal height while preventing sinking into lawn grass.',
        textureTip: 'Pair airy transparent fabric with smooth leather footwear.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Rosewater Blush & Sand Ivory Garden Palette',
          description: 'Romantic pastel celebration harmony honoring the couple without stealing the show.',
          hexes: ['#C9A9A6', '#E8E2D9', '#F7F4EE', '#C19A6B']
        }
      };
    }
  },

  // Wedding 2: Tailored Pastel/Jewel Suit + Silk Camisole + Pointed Pumps
  {
    id: 'wedding_tailored_suit_camisole_pumps',
    occasion: 'wedding_guest',
    silhouetteKey: 'tailored_suit_camisole_pumps',
    silhouetteName: 'Tailored Pastel Suit + Silk Camisole + Pointed Pumps',
    title: 'The Modern Sartorial Guest Suiting',
    subtitle: 'Sharp Double-Breasted Tailoring & Silk Accentuation',
    aesthetic: 'CONTEMPORARY CEREMONIAL SUITING · STATEMENT TAILORING',
    style: 'minimalist_tailored',
    formalityScore: 9,
    buildOutfit: (weather, temp, wardrobe) => {
      const isHot = temp === '30_plus';
      const isCold = temp === 'below_10' || (weather === 'cold' && temp !== '30_plus' && temp !== '20_29');
      const isRain = weather === 'rainy';

      const pieces: OutfitPiece[] = [];

      // 1. Top: Suiting Jacket + Camisole
      if (isHot) {
        pieces.push({
          category: 'tops',
          name: 'Tailored Linen-Blend Double-Breasted Vest',
          colorName: 'Muted Sage',
          colorHex: '#94A187',
          role: 'Core Piece',
          description: 'Sleeveless tailored suiting vest for high-heat outdoor ceremonies.',
          stylingTip: 'Wear with high-waist trousers.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'outerwear',
          name: 'Double-Breasted Wool-Silk Blend Blazer',
          colorName: 'Muted Sage',
          colorHex: '#94A187',
          role: 'Core Piece',
          description: 'Tailored peak-lapel blazer in soft sage with mother-of-pearl buttons.',
          stylingTip: 'Leave unbuttoned over silk camisole.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
        pieces.push({
          category: 'tops',
          name: 'Silk V-Neck Camisole',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Essential Top',
          description: 'Lustrous silk inner layer reflecting ceremony light.',
          stylingTip: 'Tucks cleanly into trousers.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 2. Bottom: Matching Suiting Trousers
      pieces.push({
        category: 'bottoms',
        name: 'Matching Pleated Wide-Leg Suiting Trousers',
        colorName: 'Muted Sage',
        colorHex: '#94A187',
        role: 'Essential Bottom',
        description: 'Fluid tailored trousers matching the blazer with sharp center crease.',
        stylingTip: 'Creates an unbroken ceremonial vertical line.',
        isWardrobeOwned: false,
        sourceLabel: 'Curated Catalog'
      });

      // Extra coat in cold
      if (isCold) {
        pieces.push({
          category: 'outerwear',
          name: 'Wool Overcoat',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Complementary Layer',
          description: 'Protective formal coat for cold weather.',
          stylingTip: 'Check upon arrival.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 3. Footwear: Pointed Pumps
      if (isRain) {
        pieces.push({
          category: 'footwear',
          name: 'Calfskin Pointed Pumps with Rubber Grip',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: 'Protected leather footwear repelling water on church steps.',
          stylingTip: 'Non-slip traction on wet surfaces.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      } else {
        pieces.push({
          category: 'footwear',
          name: 'Pointed Satin Pumps with Low Heel (50mm)',
          colorName: 'Sand Ivory',
          colorHex: '#E8E2D9',
          role: 'Footwear Anchor',
          description: 'Lustrous pointed footwear matching ceremony elegance.',
          stylingTip: 'Toe point peeks out cleanly from wide trousers.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      // 4. Functional Accessory
      if (isRain) {
        pieces.push({
          category: 'weather_protection',
          name: 'Clear Bubble Formal Umbrella',
          colorName: 'Clear Ivory',
          colorHex: '#F7F4EE',
          role: 'Accent Accessory',
          description: 'Photogenic dome canopy for rainy wedding entrances.',
          stylingTip: 'Shields formal hair.',
          isWardrobeOwned: false,
          sourceLabel: 'Curated Catalog'
        });
      }

      const rationale = generateContextualRationale(
        pieces,
        weather,
        temp,
        'wedding_guest',
        'Tailored Pastel Suit + Silk Camisole + Pointed Pumps'
      );

      return {
        pieces,
        stylistRationale: rationale,
        proStylistRule:
          'The Non-Traditional Guest Protocol: A tailored suit in soft sage delivers high-tier formal respect while distinguishing your aesthetic with editorial elegance.',
        textureTip: 'Pair the crisp weave of wool-silk suiting with fluid silk.',
        recommendedMetal: 'Warm Gold',
        colorHarmony: {
          name: 'Muted Sage & Ivory Ceremonial Suiting',
          description: 'Refreshing botanical tailoring softened by ivory silk.',
          hexes: ['#94A187', '#F7F4EE', '#E8E2D9', '#C19A6B']
        }
      };
    }
  }
];
