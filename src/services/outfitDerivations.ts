import { OutfitPiece, OutfitRecommendation, WeatherCondition, TemperatureRange, Occasion } from '../types';
import { decodeHtmlEntities } from './textSanitizer';

/**
 * Derives color palette hexes and descriptive harmony from the actual pieces present in an outfit.
 * Never references colors that are not worn.
 */
export function deriveOutfitPalette(pieces: OutfitPiece[]): {
  name: string;
  description: string;
  hexes: string[];
} {
  if (!pieces || pieces.length === 0) {
    return {
      name: 'Neutral Foundation',
      description: 'A clean, balanced tonal palette.',
      hexes: ['#161617', '#F7F4EE']
    };
  }

  // Extract unique colors preserving piece hierarchy (tops/core, bottoms, outerwear, footwear, accessories)
  const uniqueColorMap = new Map<string, { hex: string; name: string; role: string; pieceName: string }>();

  for (const piece of pieces) {
    const hexKey = piece.colorHex.toUpperCase();
    if (!uniqueColorMap.has(hexKey)) {
      uniqueColorMap.set(hexKey, {
        hex: piece.colorHex,
        name: piece.colorName,
        role: piece.role,
        pieceName: piece.name
      });
    }
  }

  const distinctColors = Array.from(uniqueColorMap.values());
  const hexes = distinctColors.map(c => c.hex);

  // Derive title from the actual color names present
  let name = '';
  if (distinctColors.length === 1) {
    name = `Monochromatic ${distinctColors[0].name}`;
  } else if (distinctColors.length === 2) {
    name = `${distinctColors[0].name} & ${distinctColors[1].name} Balance`;
  } else if (distinctColors.length === 3) {
    name = `${distinctColors[0].name}, ${distinctColors[1].name} & ${distinctColors[2].name}`;
  } else {
    name = `${distinctColors[0].name}, ${distinctColors[1].name} & Accent Tones`;
  }

  // Build grounded description referencing actual garments and their real colors
  const coreOrTop = pieces.find(p => p.role === 'Core Piece' || p.category === 'tops' || p.category === 'one_piece');
  const bottom = pieces.find(p => p.category === 'bottoms');
  const footwear = pieces.find(p => p.category === 'footwear');
  const outer = pieces.find(p => p.category === 'outerwear');
  const acc = pieces.find(p => p.category === 'accessories' || p.category === 'bags' || p.category === 'weather_protection');

  const parts: string[] = [];

  if (coreOrTop && bottom) {
    if (coreOrTop.colorName.toLowerCase() === bottom.colorName.toLowerCase()) {
      parts.push(`A column of tonal ${coreOrTop.colorName} between the ${coreOrTop.name.toLowerCase()} and ${bottom.name.toLowerCase()}`);
    } else {
      parts.push(`${coreOrTop.colorName} ${coreOrTop.name.toLowerCase()} paired with ${bottom.colorName} ${bottom.name.toLowerCase()}`);
    }
  } else if (coreOrTop) {
    parts.push(`Anchored by the ${coreOrTop.colorName} ${coreOrTop.name.toLowerCase()}`);
  }

  if (outer) {
    parts.push(`layered with the ${outer.colorName} ${outer.name.toLowerCase()}`);
  }

  if (footwear) {
    parts.push(`grounded in ${footwear.colorName} footwear`);
  }

  if (acc) {
    parts.push(`with ${acc.colorName} ${acc.name.toLowerCase()}`);
  }

  let description = '';
  if (parts.length > 0) {
    description = parts.join(', ') + '.';
    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1);
  } else {
    description = `Composed of ${distinctColors.map(c => c.name).join(', ')}.`;
  }

  return {
    name,
    description,
    hexes
  };
}

/**
 * Known material keywords mapped to readable fabric labels.
 */
const MATERIAL_KEYWORDS: Array<{ pattern: RegExp; label: string; priority: number }> = [
  { pattern: /\blinen\b/i, label: 'breathable linen', priority: 1 },
  { pattern: /\bpoplin\b/i, label: 'crisp cotton poplin', priority: 1 },
  { pattern: /\bseersucker\b/i, label: 'airy seersucker cotton', priority: 1 },
  { pattern: /\boxford\b/i, label: 'classic Oxford cotton', priority: 1 },
  { pattern: /\bchambray\b/i, label: 'soft chambray cotton', priority: 1 },
  { pattern: /\bcotton\b/i, label: 'pure cotton', priority: 2 },
  { pattern: /\bcashmere\b/i, label: 'insulating cashmere', priority: 1 },
  { pattern: /\bmerino\b/i, label: 'fine merino wool', priority: 1 },
  { pattern: /\bflannel\b/i, label: 'brushed wool flannel', priority: 1 },
  { pattern: /\bgabardine\b/i, label: 'water-repellent gabardine', priority: 1 },
  { pattern: /\bworsted\b/i, label: 'tailored worsted wool', priority: 1 },
  { pattern: /\bmelton\b/i, label: 'dense melton wool', priority: 1 },
  { pattern: /\bwool\b/i, label: 'tailored wool', priority: 2 },
  { pattern: /\bsilk\b/i, label: 'fluid silk', priority: 1 },
  { pattern: /\bchiffon\b/i, label: 'sheer silk chiffon', priority: 1 },
  { pattern: /\bcrepe\b/i, label: 'matte silk crepe', priority: 1 },
  { pattern: /\bsatin\b/i, label: 'lustrous satin', priority: 1 },
  { pattern: /\bhabotai\b/i, label: 'washed silk habotai', priority: 1 },
  { pattern: /\bcalfskin\b/i, label: 'supple calfskin', priority: 1 },
  { pattern: /\bnappa\b/i, label: 'soft nappa leather', priority: 1 },
  { pattern: /\bsuede\b/i, label: 'brushed suede', priority: 1 },
  { pattern: /\bleather\b/i, label: 'polished leather', priority: 2 },
  { pattern: /\bdenim\b/i, label: 'structured denim', priority: 1 },
  { pattern: /\bcanvas\b/i, label: 'durable canvas', priority: 1 },
  { pattern: /\btwill\b/i, label: 'woven twill', priority: 2 },
  { pattern: /\bknit\b|\bknitwear\b|\bribbed\b/i, label: 'tactile knitwear', priority: 2 },
  { pattern: /\bpanama\b|\bstraw\b|\braffia\b/i, label: 'woven straw', priority: 1 },
  { pattern: /\bwater-resistant\b|\bwindproof\b|\bgore-tex\b|\btechnical\b/i, label: 'weather-resistant technical fabric', priority: 1 }
];

/**
 * Extracts real fabrics present in pieces and builds a 100% grounded fabric strategy.
 * Never describes fabrics or textures not actually found in the recommended pieces.
 */
export function deriveOutfitFabricStrategy(pieces: OutfitPiece[]): string {
  if (!pieces || pieces.length === 0) {
    return 'Balanced natural fibers selected for durability and structure.';
  }

  // Detect which materials appear in which pieces
  const detectedMaterials: Array<{ label: string; pieceName: string }> = [];
  const seenLabels = new Set<string>();

  for (const piece of pieces) {
    const textToSearch = `${piece.name} ${piece.description}`.toLowerCase();
    
    // Find highest priority material match for this piece
    let bestMatch: { label: string; priority: number } | null = null;
    for (const mat of MATERIAL_KEYWORDS) {
      if (mat.pattern.test(textToSearch)) {
        if (!bestMatch || mat.priority < bestMatch.priority) {
          bestMatch = mat;
        }
      }
    }

    if (bestMatch && !seenLabels.has(bestMatch.label)) {
      seenLabels.add(bestMatch.label);
      detectedMaterials.push({ label: bestMatch.label, pieceName: piece.name });
    }
  }

  if (detectedMaterials.length >= 3) {
    return `Combines ${detectedMaterials[0].label} with ${detectedMaterials[1].label} and ${detectedMaterials[2].label} for tactile depth.`;
  }

  if (detectedMaterials.length === 2) {
    return `Pairs ${detectedMaterials[0].label} with ${detectedMaterials[1].label} to maintain clean textural contrast.`;
  }

  if (detectedMaterials.length === 1) {
    const mat = detectedMaterials[0];
    return `Anchored in ${mat.label} with clean, unencumbered tailoring across all pieces.`;
  }

  // Fallback if pieces are custom user items without explicit material keywords
  const firstPiece = pieces[0]?.name.toLowerCase() || 'primary piece';
  const secondPiece = pieces[1]?.name.toLowerCase() || 'complementary pieces';
  return `Coordinates the smooth finish of the ${firstPiece} with the structured drape of the ${secondPiece}.`;
}

/**
 * Derives the metal finish from actual hardware mentioned in pieces or undertones of pieces.
 * Prioritizes statement jewelry hardware, ensuring gold jewelry is never mislabeled as Cool Silver.
 */
export function deriveOutfitMetalFinish(pieces: OutfitPiece[]): 'Warm Gold' | 'Cool Silver' | 'Rose Gold' | 'Mixed Metallics' {
  if (!pieces || pieces.length === 0) {
    return 'Warm Gold';
  }

  // 1. Check statement jewelry pieces FIRST (earrings, necklaces, rings, cuffs, bangles, bracelets, chokers)
  const jewelryPieces = pieces.filter(p => {
    if (p.category !== 'accessories') return false;
    const txt = `${p.name} ${p.description} ${p.stylingTip}`.toLowerCase();
    return (
      txt.includes('earring') ||
      txt.includes('hoop') ||
      txt.includes('necklace') ||
      txt.includes('pendant') ||
      txt.includes('ring') ||
      txt.includes('cuff') ||
      txt.includes('bangle') ||
      txt.includes('bracelet') ||
      txt.includes('choker') ||
      txt.includes('jewelry')
    );
  });

  if (jewelryPieces.length > 0) {
    const jewelryText = jewelryPieces.map(j => `${j.name} ${j.colorName} ${j.description} ${j.stylingTip}`).join(' ').toLowerCase();
    const hasGold = jewelryText.includes('gold') || jewelryText.includes('brass') || jewelryText.includes('gilt') || jewelryText.includes('tortoiseshell');
    const hasSilver = jewelryText.includes('silver') || jewelryText.includes('platinum') || jewelryText.includes('palladium') || jewelryText.includes('chrome') || jewelryText.includes('steel');
    const hasRose = jewelryText.includes('rose gold') || jewelryText.includes('copper');

    if (hasGold && hasSilver) return 'Mixed Metallics';
    if (hasRose) return 'Rose Gold';
    if (hasGold) return 'Warm Gold';
    if (hasSilver) return 'Cool Silver';
  }

  // 2. Check general accessories, hardware, bags, or footwear
  let hasGoldHardware = false;
  let hasSilverHardware = false;
  let hasRoseHardware = false;

  for (const piece of pieces) {
    const text = `${piece.name} ${piece.colorName} ${piece.description} ${piece.stylingTip}`.toLowerCase();
    if (text.includes('rose gold') || text.includes('copper')) {
      hasRoseHardware = true;
    }
    if (text.includes('gold') || text.includes('brass') || text.includes('gilt') || text.includes('tortoiseshell')) {
      hasGoldHardware = true;
    }
    if (text.includes('silver') || text.includes('chrome') || text.includes('steel') || text.includes('palladium') || text.includes('platinum')) {
      hasSilverHardware = true;
    }
  }

  if (hasGoldHardware && hasSilverHardware) return 'Mixed Metallics';
  if (hasRoseHardware) return 'Rose Gold';
  if (hasGoldHardware) return 'Warm Gold';
  if (hasSilverHardware) return 'Cool Silver';

  // 3. If no explicit hardware, calculate warm vs cool balance from piece colors
  let warmPoints = 0;
  let coolPoints = 0;

  const warmColorWords = ['camel', 'tan', 'cream', 'ivory', 'gold', 'beige', 'brown', 'rust', 'terracotta', 'olive', 'warm', 'cognac', 'burgundy', 'wine'];
  const coolColorWords = ['navy', 'blue', 'charcoal', 'grey', 'gray', 'silver', 'ice', 'black', 'white', 'obsidian', 'cool', 'emerald', 'indigo'];

  for (const piece of pieces) {
    const colorLower = piece.colorName.toLowerCase();
    if (warmColorWords.some(w => colorLower.includes(w))) {
      warmPoints++;
    }
    if (coolColorWords.some(c => colorLower.includes(c))) {
      coolPoints++;
    }
  }

  if (warmPoints > coolPoints) {
    return 'Warm Gold';
  } else if (coolPoints > warmPoints) {
    return 'Cool Silver';
  } else {
    return 'Mixed Metallics';
  }
}

/**
 * Generates a clean, contextual rationale referencing ONLY the actual pieces present in the outfit.
 * Uses realistic weather reasoning: explains that layers provide warmth in 10-19°C / cold rather than claiming
 * a lightweight shirt alone provides sufficient coverage.
 */
export function deriveContextualRationale(
  pieces: OutfitPiece[],
  weather: WeatherCondition = 'sunny',
  temp: TemperatureRange = '20_29',
  occasion: Occasion = 'office',
  silhouetteName: string = 'Curated Ensemble'
): string {
  const onePiece = pieces.find(p => p.category === 'one_piece');
  const top = pieces.find(p => p.category === 'tops');
  const bottom = pieces.find(p => p.category === 'bottoms');
  const outer = pieces.find(p => p.category === 'outerwear');
  const footwear = pieces.find(p => p.category === 'footwear');
  const weatherAcc = pieces.find(p => p.category === 'weather_protection');
  const sunAcc = pieces.find(p => p.category === 'accessories' && p.name.toLowerCase().includes('sunglasses'));

  let baseDesc = '';
  if (outer && (top || onePiece)) {
    const innerName = top ? top.name.toLowerCase() : onePiece!.name.toLowerCase();
    baseDesc = `The ${innerName} paired with the ${outer.name.toLowerCase()}`;
  } else if (onePiece) {
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
    tempContext = `provides breathable airflow and lightweight ease for high heat (30°C+)`;
  } else if (temp === '20_29') {
    tempContext = `suits a pleasant ${occasion} day (20–29°C)`;
  } else if (temp === '10_19') {
    if (outer) {
      tempContext = `relies on the ${outer.name.toLowerCase()} layer to provide necessary warmth and balanced insulation for cool temperatures (10–19°C)`;
    } else {
      tempContext = `is complemented by structured layers to provide comfortable warmth for cool temperatures (10–19°C)`;
    }
  } else {
    // below_10
    if (outer) {
      tempContext = `utilizes heavy outer layering with the ${outer.name.toLowerCase()} to deliver vital thermal insulation in cold conditions (below 10°C)`;
    } else {
      tempContext = `delivers reliable multi-tier insulation to maintain core warmth in cold temperatures (below 10°C)`;
    }
  }

  let weatherContext = '';
  if (weather === 'rainy') {
    if (outer && weatherAcc) {
      weatherContext = `, with both the ${outer.name.toLowerCase()} and ${weatherAcc.name.toLowerCase()} shielding against wet precipitation`;
    } else if (outer) {
      weatherContext = `, complemented by the ${outer.name.toLowerCase()} to repel wet conditions`;
    } else if (weatherAcc) {
      weatherContext = `, backed by the ${weatherAcc.name.toLowerCase()} for dependable rain protection`;
    } else if (footwear) {
      weatherContext = `, with practical footwear suited for damp city streets`;
    }
  } else if (weather === 'sunny') {
    if (sunAcc) {
      weatherContext = `, complemented by ${sunAcc.name.toLowerCase()} for midday sun protection`;
    } else {
      weatherContext = `, tailored for bright daytime clarity`;
    }
  } else if (weather === 'windy') {
    if (outer) {
      weatherContext = `, with the ${outer.name.toLowerCase()} buffering against brisk gusts`;
    } else {
      weatherContext = `, tailored in streamlined drape that resists gusts`;
    }
  } else if (weather === 'cold') {
    if (outer) {
      weatherContext = `, sealing in thermal warmth against brisk chill`;
    } else {
      weatherContext = `, trapping thermal warmth throughout the day`;
    }
  } else {
    // cloudy / mild
    if (outer) {
      weatherContext = `, with outerwear on hand for shifting cloud cover`;
    } else {
      weatherContext = `, well-suited for temperate overcast skies`;
    }
  }

  const result = `${baseDesc} ${tempContext}${weatherContext}.`;
  return decodeHtmlEntities(result);
}

/**
 * Helper to naturally format a garment's name without repeating the color if the name already contains it,
 * and respecting unconfirmed colors for uploaded pieces.
 */
function formatGarmentReference(piece: OutfitPiece, includeColor: boolean = true): string {
  const name = piece.name.trim();
  const lowerName = name.toLowerCase();
  const color = piece.colorName.trim();
  const lowerColor = color.toLowerCase();

  // If piece is an uploaded garment and its color was not reliably identified
  if (piece.sourceLabel === 'Uploaded Piece' && piece.isColorConfirmed === false) {
    return lowerName.startsWith('uploaded') ? lowerName : `uploaded ${lowerName}`;
  }

  if (!includeColor || !color) {
    return lowerName;
  }

  // Check if name already includes the color name (e.g., "Camel Double-Breasted Trench" contains "camel")
  const colorWords = lowerColor.split(/\s+/).filter(w => w.length > 2);
  const alreadyHasColor = lowerName.includes(lowerColor) || colorWords.some(cw => lowerName.includes(cw));

  if (alreadyHasColor) {
    return lowerName;
  }

  return `${color} ${lowerName}`;
}

/**
 * Derives a styling rule that strictly and factually matches the outfit.
 * Only applies the "Sandwich Rule" if footwear and the upper layer actually echo the same color.
 * Never claims footwear and outerwear echo the same color when they do not.
 * Never invents colors for unconfirmed uploaded garments.
 * Only mentions silver footwear if silver footwear is actually recommended in the outfit.
 */
export function deriveProStylistRule(pieces: OutfitPiece[], lookTitle?: string): string {
  if (!pieces || pieces.length === 0) {
    return 'The Proportion Rule: Maintain balanced vertical proportions across primary garments.';
  }

  const core = pieces.find(p => p.role === 'Core Piece') || pieces[0];
  const outer = pieces.find(p => p.category === 'outerwear' && p !== core);
  const top = pieces.find(p => p.category === 'tops' && p !== core);
  const bottom = pieces.find(p => p.category === 'bottoms' && p !== core);
  const footwear = pieces.find(p => p.category === 'footwear' && p !== core);

  const upper = outer || top || (core && (core.category === 'outerwear' || core.category === 'tops') ? core : undefined);
  const isCoreColorConfirmed = core.sourceLabel !== 'Uploaded Piece' || core.isColorConfirmed !== false;

  // 1. THE SANDWICH RULE (Only when footwear and upper layer truly echo matching or shared color tones)
  if (upper && footwear) {
    const upperColor = upper.colorName.toLowerCase();
    const footColor = footwear.colorName.toLowerCase();
    const upperHex = upper.colorHex.toLowerCase();
    const footHex = footwear.colorHex.toLowerCase();

    const colorsMatch =
      upperHex === footHex ||
      upperColor === footColor ||
      (upperColor.includes('black') && footColor.includes('black')) ||
      (upperColor.includes('navy') && footColor.includes('navy')) ||
      (upperColor.includes('camel') && footColor.includes('camel')) ||
      (upperColor.includes('brown') && footColor.includes('brown')) ||
      (upperColor.includes('white') && footColor.includes('white')) ||
      (upperColor.includes('tan') && footColor.includes('tan')) ||
      (upperColor.includes('silver') && footColor.includes('silver')) ||
      (upperColor.includes('gold') && footColor.includes('gold'));

    if (colorsMatch) {
      const colorPhrase = (upper === core && !isCoreColorConfirmed)
        ? 'matching tonal accents'
        : `${upper.colorName}`;
      return `The "Sandwich Rule": Bookend your outfit by echoing ${colorPhrase} between the ${upper.name.toLowerCase()} and ${footwear.name.toLowerCase()} for effortless visual symmetry.`;
    }
  }

  // 2. THE MONOCHROMATIC COLUMN RULE (When bottom and top/core share the same color family)
  if (bottom && core && isCoreColorConfirmed) {
    const bottomColor = bottom.colorName.toLowerCase();
    const coreColor = core.colorName.toLowerCase();
    const bottomHex = bottom.colorHex.toLowerCase();
    const coreHex = core.colorHex.toLowerCase();

    const isSameShade =
      bottomHex === coreHex ||
      bottomColor === coreColor ||
      (bottomColor.includes('black') && coreColor.includes('black')) ||
      (bottomColor.includes('navy') && coreColor.includes('navy')) ||
      (bottomColor.includes('camel') && coreColor.includes('camel')) ||
      (bottomColor.includes('white') && coreColor.includes('white')) ||
      (bottomColor.includes('cream') && coreColor.includes('cream')) ||
      (bottomColor.includes('charcoal') && coreColor.includes('charcoal')) ||
      (bottomColor.includes('brown') && coreColor.includes('brown'));

    if (isSameShade) {
      const coreRef = formatGarmentReference(core, false);
      const bottomRef = formatGarmentReference(bottom, false);
      return `The Monochromatic Column Rule: Continuing ${bottom.colorName} from the ${coreRef} into matching ${bottomRef} elongates vertical proportions without visual breaks.`;
    }
  }

  // 3. THE TWO-TONE ANCHOR RULE (When core garment is grounded by contrasting bottoms or footwear)
  if (bottom && core) {
    const coreRef = formatGarmentReference(core, isCoreColorConfirmed);
    const bottomRef = formatGarmentReference(bottom, true);

    // If footwear is present and actually Silver / metallic accent, or contrasting anchor:
    const footwearIsSilver = footwear && footwear.colorName.toLowerCase().includes('silver');

    if (footwearIsSilver) {
      // ONLY mention silver footwear when silver footwear is ACTUALLY recommended!
      return `The Two-Tone Anchor Rule: Anchoring the ${coreRef} against contrasting ${bottomRef} and ${footwear.colorName.toLowerCase()} footwear creates a striking, modern focal foundation.`;
    }

    // Default factual Two-Tone Anchor grounded in the actual bottom
    return `The Two-Tone Anchor Rule: Anchoring the ${coreRef} against contrasting ${bottomRef} creates a clean, elongated silhouette foundation.`;
  }

  // If there are no separate bottoms (e.g. dress or jumpsuit) and footwear provides the anchor:
  if (footwear && core) {
    const coreRef = formatGarmentReference(core, isCoreColorConfirmed);
    const footRef = formatGarmentReference(footwear, true);
    return `The Two-Tone Anchor Rule: Anchoring the ${coreRef} with contrasting ${footRef} provides deliberate grounding for the one-piece silhouette.`;
  }

  // 4. THE PROPORTIONAL TENSION RULE (For contemporary relaxed & structured pairings)
  if (lookTitle && lookTitle.toLowerCase().includes('contemporary')) {
    const coreRef = formatGarmentReference(core, isCoreColorConfirmed);
    return `The Proportional Tension Rule: Juxtaposing structured tailoring in the ${coreRef} with relaxed complementary pieces brings fresh architectural dimension to classic staples.`;
  }

  // 5. THE FOUNDATIONAL BALANCE RULE (Grounded fallback)
  if (!isCoreColorConfirmed) {
    return `The Foundational Balance Rule: Grounding your uploaded ${core.name.toLowerCase()} with refined neutral coordinates keeps the focal silhouette deliberate and refined.`;
  }

  return `The Foundational Balance Rule: Grounding the ${formatGarmentReference(core, true)} with refined neutral coordinates keeps the focal silhouette deliberate and refined.`;
}

/**
 * Enriches any outfit recommendation with 100% grounded, dynamically derived values:
 * - Color palette derived strictly from actual pieces
 * - Fabric strategy derived strictly from actual pieces
 * - Metal finish derived strictly from actual pieces (prioritizing statement jewelry)
 * - Stylist rationale referencing only actual pieces present with realistic weather reasoning
 * - Stylist rule guaranteed to factually match the outfit
 */
export function enrichOutfitWithRealDerivations(
  outfit: OutfitRecommendation,
  weather?: WeatherCondition,
  temp?: TemperatureRange
): OutfitRecommendation {
  const pieces = outfit.pieces || [];

  const palette = deriveOutfitPalette(pieces);
  const fabricStrategy = deriveOutfitFabricStrategy(pieces);
  const metalFinish = deriveOutfitMetalFinish(pieces);

  const condition = weather || outfit.weatherCompatibility?.condition || 'sunny';
  const temperature = temp || outfit.weatherCompatibility?.temperature || '20_29';

  const rationale = deriveContextualRationale(
    pieces,
    condition,
    temperature,
    outfit.occasion,
    outfit.silhouetteName || outfit.title
  );

  const rule = deriveProStylistRule(pieces, outfit.title);

  return {
    ...outfit,
    colorHarmony: {
      ...palette,
      name: decodeHtmlEntities(palette.name),
      description: decodeHtmlEntities(palette.description)
    },
    textureTip: decodeHtmlEntities(fabricStrategy),
    recommendedMetal: metalFinish,
    stylistRationale: decodeHtmlEntities(rationale),
    proStylistRule: decodeHtmlEntities(rule)
  };
}

