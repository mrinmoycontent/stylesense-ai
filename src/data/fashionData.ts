import { FashionColor, FashionStyle, GarmentCategory, GarmentPreset, Occasion, WardrobeItem } from '../types';

export const FASHION_COLORS: FashionColor[] = [
  {
    id: 'ivory',
    name: 'Ivory Cream',
    hex: '#F7F4EE',
    family: 'neutral',
    undertone: 'warm',
    complementaryHex: '#1B2430',
    analogousHexes: ['#EADBC8', '#D8C4B6', '#C7B198'],
    monochromaticHexes: ['#FFFFFF', '#F7F4EE', '#EFE9DE', '#D9CEBF', '#BFB09D'],
    bestNeutrals: ['#2B2A27', '#8C8275', '#B8AA99'],
    stylingAdvice: 'Softens high-contrast tailoring. Pair with camel, espresso brown, or jet black for quintessential quiet luxury.'
  },
  {
    id: 'obsidian',
    name: 'Obsidian Black',
    hex: '#161617',
    family: 'neutral',
    undertone: 'neutral',
    complementaryHex: '#F7F4EE',
    analogousHexes: ['#282A36', '#1E232A', '#333036'],
    monochromaticHexes: ['#4A4A4F', '#323236', '#212124', '#161617', '#0A0A0B'],
    bestNeutrals: ['#F7F4EE', '#A8A29E', '#E7E5E4'],
    stylingAdvice: 'The ultimate anchor. Contrast with sharp cream silks or textured camel wool to prevent a flat silhouette.'
  },
  {
    id: 'camel',
    name: 'Camel Tan',
    hex: '#C19A6B',
    family: 'warm',
    undertone: 'warm',
    complementaryHex: '#1D3557',
    analogousHexes: ['#D4A373', '#B07D62', '#8A5A44'],
    monochromaticHexes: ['#EED9C4', '#DDB892', '#C19A6B', '#9C6644', '#7F4F24'],
    bestNeutrals: ['#F7F4EE', '#161617', '#3F3B36'],
    stylingAdvice: 'Pairs organically with crisp white shirting and raw indigo denim. Golden jewelry illuminates its warm undertones.'
  },
  {
    id: 'navy',
    name: 'Midnight Navy',
    hex: '#1B263B',
    family: 'cool',
    undertone: 'cool',
    complementaryHex: '#C19A6B',
    analogousHexes: ['#0D1B2A', '#415A77', '#778DA9'],
    monochromaticHexes: ['#778DA9', '#415A77', '#253B59', '#1B263B', '#0D1B2A'],
    bestNeutrals: ['#F7F4EE', '#C7B198', '#94A3B8'],
    stylingAdvice: 'More forgiving and multidimensional than black. Harmonizes exceptionally with cognac leather and silver or gold hardware.'
  },
  {
    id: 'espresso',
    name: 'Espresso Brown',
    hex: '#3D2B1F',
    family: 'earth',
    undertone: 'warm',
    complementaryHex: '#8ECAE6',
    analogousHexes: ['#5C4033', '#795548', '#8D6E63'],
    monochromaticHexes: ['#A1887F', '#6D4C41', '#4E342E', '#3D2B1F', '#271A13'],
    bestNeutrals: ['#F7F4EE', '#E2D4C3', '#D7CCC8'],
    stylingAdvice: 'The modern alternative to black. Combines exquisitely with sky blue poplin or butter-yellow cashmere.'
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    hex: '#1B4332',
    family: 'jewel',
    undertone: 'cool',
    complementaryHex: '#B05D5D',
    analogousHexes: ['#2D6A4F', '#40916C', '#52B788'],
    monochromaticHexes: ['#74C69D', '#52B788', '#2D6A4F', '#1B4332', '#081C15'],
    bestNeutrals: ['#F7F4EE', '#C19A6B', '#161617'],
    stylingAdvice: 'Rich jewel tone that demands clean neutral framing. Pairs magnificently with brushed gold accents and champagne silks.'
  },
  {
    id: 'sage',
    name: 'Muted Sage',
    hex: '#94A187',
    family: 'earth',
    undertone: 'neutral',
    complementaryHex: '#C9A3A3',
    analogousHexes: ['#A3B18A', '#588157', '#3A5A40'],
    monochromaticHexes: ['#DCE4D6', '#B7C4AB', '#94A187', '#6F7E60', '#4A563D'],
    bestNeutrals: ['#F7F4EE', '#E3DAC9', '#2E2D2B'],
    stylingAdvice: 'An understated botanical neutral. Harmonizes effortlessly with ecru denim, bone linen, and hammered brass.'
  },
  {
    id: 'burgundy',
    name: 'Merlot Burgundy',
    hex: '#581825',
    family: 'jewel',
    undertone: 'warm',
    complementaryHex: '#3D5A40',
    analogousHexes: ['#780016', '#800F2F', '#A4161A'],
    monochromaticHexes: ['#BA181B', '#800F2F', '#581825', '#3E0812', '#220007'],
    bestNeutrals: ['#F7F4EE', '#8F8073', '#161617'],
    stylingAdvice: 'Commands evening occasions with cinematic weight. Looks striking against charcoal wool and warm camel cashmere.'
  },
  {
    id: 'terracotta',
    name: 'Terracotta Rust',
    hex: '#B25D41',
    family: 'warm',
    undertone: 'warm',
    complementaryHex: '#3A6073',
    analogousHexes: ['#C86D51', '#98442A', '#81341E'],
    monochromaticHexes: ['#E39B83', '#CA7A60', '#B25D41', '#883F27', '#5E2614'],
    bestNeutrals: ['#F7F4EE', '#D8C3A5', '#242423'],
    stylingAdvice: 'Brings sun-drenched architectural warmth. Ground with olive, off-white twill, or rich saddle leather.'
  },
  {
    id: 'sky',
    name: 'Powder Sky Blue',
    hex: '#A5C4D4',
    family: 'cool',
    undertone: 'cool',
    complementaryHex: '#E29578',
    analogousHexes: ['#8AA8BF', '#6D8EAA', '#537895'],
    monochromaticHexes: ['#D7E6ED', '#BDD5E2', '#A5C4D4', '#6D8EAA', '#40627F'],
    bestNeutrals: ['#161617', '#3D2B1F', '#F7F4EE'],
    stylingAdvice: 'Brightens skin tones instantly. An ideal counterweight to deep chocolate brown tailoring or charcoal coats.'
  },
  {
    id: 'charcoal',
    name: 'Charcoal Heather',
    hex: '#4A4E57',
    family: 'neutral',
    undertone: 'cool',
    complementaryHex: '#DDA15E',
    analogousHexes: ['#3A3E46', '#2F333B', '#5A5F6B'],
    monochromaticHexes: ['#8B909D', '#6A6F7B', '#4A4E57', '#32363D', '#1D1F24'],
    bestNeutrals: ['#F7F4EE', '#161617', '#C19A6B'],
    stylingAdvice: 'Architectural and precise. Balances softer pastel shades or delivers razor-sharp monochrome when paired with silver.'
  },
  {
    id: 'blush',
    name: 'Dusty Rosewater',
    hex: '#DEC1B9',
    family: 'warm',
    undertone: 'warm',
    complementaryHex: '#7C9082',
    analogousHexes: ['#E8D1CB', '#CCA89E', '#B88F85'],
    monochromaticHexes: ['#F5EAE7', '#E8D1CB', '#DEC1B9', '#B88F85', '#8C675E'],
    bestNeutrals: ['#3D2B1F', '#161617', '#F7F4EE'],
    stylingAdvice: 'Sophisticated without being juvenile. Ground with dark espresso leather, charcoal outerwear, or brushed gold.'
  }
];

export const OCCASIONS_DATA: Record<Occasion, {
  name: string;
  tagline: string;
  formalityLevel: string;
  dressCodeAdvice: string;
  keySilhouettes: string[];
  recommendedFabrics: string[];
}> = {
  casual: {
    name: 'Casual Living',
    tagline: 'Effortless daytime ease & curated downtime',
    formalityLevel: 'Relaxed · Everyday',
    dressCodeAdvice: 'Balance unstructured ease with at least one crisp tailored anchor (e.g. clean leather loafers or structured jacket) to maintain chic intentionality.',
    keySilhouettes: ['Relaxed straight-leg denim', 'Boxy poplin shirts', 'Ribbed knitwear', 'Fluid linen trousers'],
    recommendedFabrics: ['Heavyweight cotton', 'Washed denim', 'Fine gauge merino', 'Breathable linen']
  },
  office: {
    name: 'Office & Boardroom',
    tagline: 'Refined professionalism meets quiet authority',
    formalityLevel: 'Tailored · Smart Corporate',
    dressCodeAdvice: 'Focus on immaculate silhouette lines and premium fabric weight. Avoid busy patterns; elevate with architectural accessories and pointed footwear.',
    keySilhouettes: ['Double-breasted blazers', 'Pleated wide-leg trousers', 'Crisp collared shirting', 'Architectural midi skirts'],
    recommendedFabrics: ['Tropical wool', 'Crisp poplin', 'Matte silk twill', 'Structured gabardine']
  },
  party: {
    name: 'Party & Soirée',
    tagline: 'High-contrast glamour & nocturnal silhouettes',
    formalityLevel: 'Elevated · Statement',
    dressCodeAdvice: 'Embrace tactile drama—combine lustrous satin with sheer layering, tailored jackets over slip dresses, or high-shine metallic accents.',
    keySilhouettes: ['Bias-cut slips', 'Sculptural column dresses', 'Cropped tuxedo jackets', 'Tailored cigarette pants'],
    recommendedFabrics: ['Heavy silk satin', 'Lustrous velvet', 'Sheer organza', 'Polished calfskin']
  },
  date_night: {
    name: 'Date Night',
    tagline: 'Sensual sophistication & understated romance',
    formalityLevel: 'Chic · Intimate',
    dressCodeAdvice: 'Play with exposed collarbones, fluid fabric drapes, and rich tactile touchpoints. Keep accessories subtle yet luminous.',
    keySilhouettes: ['Open-collar silk blouses', 'Draped cowl necklines', 'Sleek dark denim with stiletto boots', 'Midi wrap dresses'],
    recommendedFabrics: ['Silk charmeuse', 'Buttery soft cashmere', 'Fine ribbed knit', 'Raw indigo denim']
  },
  wedding_guest: {
    name: 'Wedding Guest',
    tagline: 'Celebratory elegance & respectful refinement',
    formalityLevel: 'Formal · Semi-Formal',
    dressCodeAdvice: 'Honor the celebratory code with dignified hemlines, refined pastel or jewel tones, and sophisticated footwear suited for venue lawns or ballroom floors.',
    keySilhouettes: ['Tiered midi dresses', 'Flowing crepe jumpsuits', 'Pastel tailored suit sets', 'Pleated Grecian gowns'],
    recommendedFabrics: ['Silk chiffon', 'Fluid crepe de Chine', 'Embroidered jacquard', 'Lightweight fine wool']
  }
};

export const FASHION_STYLES: Record<FashionStyle, {
  name: string;
  description: string;
  hallmarks: string[];
}> = {
  minimalist_tailored: {
    name: 'Minimalist Tailored',
    description: 'Clean geometry, neutral palette, architectural cuts, zero extraneous decoration.',
    hallmarks: ['Pristine seamlines', 'Monochromatic layering', 'Structural shoulders', 'Quiet luxury neutrals']
  },
  parisian_chic: {
    name: 'Parisian Chic',
    description: 'Carefully studied nonchalance, timeless classics, Breton stripes, effortless tailoring.',
    hallmarks: ['Ballet flats or pointed boots', 'Trench coats', 'Straight-leg denim', 'Messy-chic styling']
  },
  modern_casual: {
    name: 'Modern Casual',
    description: 'High-low contrast mixing elevated tailoring with athletic or utilitarian elements.',
    hallmarks: ['Tailored blazers over clean tees', 'Luxury sneakers with trousers', 'Crossbody pouches', 'Tactile denim']
  },
  classic_elegance: {
    name: 'Classic Elegance',
    description: 'Timeless sartorial traditions, premium natural fibers, balanced proportions, heritage charm.',
    hallmarks: ['Cashmere crewnecks', 'Horsebit loafers', 'Structured leather totes', 'Silk scarves']
  },
  avant_garde: {
    name: 'Avant-Garde & Edgy',
    description: 'Deconstructed forms, asymmetrical drapes, leather contrasts, bold sculptural silhouettes.',
    hallmarks: ['Asymmetric hems', 'Hardware details', 'Monochrome black with texture play', 'Chunky lug soles']
  },
  bohemian_relaxed: {
    name: 'Relaxed Bohemian',
    description: 'Soft organic drapes, earthy textures, warm artisan elements, relaxed flowing movement.',
    hallmarks: ['Billowing sleeves', 'Linen weaves', 'Earthy terracotta & sage tones', 'Woven leather accessories']
  }
};

export const GARMENT_CATEGORIES: {
  id: GarmentCategory;
  name: string;
  types: string[];
}[] = [
  {
    id: 'tops',
    name: 'Tops & Knitwear',
    types: ['Crisp Poplin Shirt', 'Cashmere Knit Sweater', 'Silk Camisole', 'Fine Ribbed Turtleneck', 'French Breton Top', 'Boxy Heavy Cotton Tee']
  },
  {
    id: 'bottoms',
    name: 'Trousers & Skirts',
    types: ['Tailored Pleated Trousers', 'Classic Straight Jeans', 'Pleated Silk Midi Skirt', 'Wide-Leg Linen Pants', 'High-Rise Cigarette Pants', 'A-Line Wool Skirt']
  },
  {
    id: 'one_piece',
    name: 'Dresses & Jumpsuits',
    types: ['Silk Slip Midi Dress', 'Belted Shirt Dress', 'Tailored Crepe Jumpsuit', 'Wrap Cocktail Dress', 'Knit Column Midi Dress']
  },
  {
    id: 'outerwear',
    name: 'Jackets & Coats',
    types: ['Double-Breasted Wool Trench', 'Oversized Tailored Blazer', 'Single-Breasted Overcoat', 'Cropped Bouclé Jacket', 'Supple Leather Moto Jacket']
  },
  {
    id: 'footwear',
    name: 'Shoes & Footwear',
    types: ['Calfskin Horsebit Loafers', 'Pointed Kitten-Heel Slingbacks', 'Minimalist Leather Sneakers', 'Sleek Ankle Boots', 'Strappy Evening Sandals']
  },
  {
    id: 'accessories',
    name: 'Bags & Accessories',
    types: ['Architectural Leather Tote', 'Structured Crossbody Bag', 'Satin Evening Clutch', 'Woven Leather Belt', 'Cashmere Fringe Scarf']
  }
];

export const PRESET_GARMENTS: GarmentPreset[] = [
  {
    id: 'preset-trench',
    name: 'Camel Double-Breasted Trench',
    category: 'outerwear',
    specificType: 'Double-Breasted Wool Trench',
    colorName: 'Camel Tan',
    colorHex: '#C19A6B',
    style: 'classic_elegance',
    occasions: ['casual', 'office', 'date_night'],
    description: 'Iconic water-repellent camel gabardine trench with storm flaps, belted waist, and horn buttons.',
    svgIcon: 'coat'
  },
  {
    id: 'preset-white-shirt',
    name: 'Crisp Poplin White Shirt',
    category: 'tops',
    specificType: 'Crisp Poplin Shirt',
    colorName: 'Ivory Cream',
    colorHex: '#F7F4EE',
    style: 'minimalist_tailored',
    occasions: ['casual', 'office', 'date_night'],
    description: 'Oversized menswear-inspired Egyptian cotton shirt with structured collar and mother-of-pearl buttons.',
    svgIcon: 'shirt'
  },
  {
    id: 'preset-emerald-slip',
    name: 'Emerald Satin Midi Slip Dress',
    category: 'one_piece',
    specificType: 'Silk Slip Midi Dress',
    colorName: 'Emerald Forest',
    colorHex: '#1B4332',
    style: 'parisian_chic',
    occasions: ['party', 'date_night', 'wedding_guest'],
    description: 'Fluid bias-cut silk satin dress with delicate spaghetti straps and subtle side slit.',
    svgIcon: 'dress'
  },
  {
    id: 'preset-pleated-trousers',
    name: 'Midnight Pleated Wool Trousers',
    category: 'bottoms',
    specificType: 'Tailored Pleated Trousers',
    colorName: 'Midnight Navy',
    colorHex: '#1B263B',
    style: 'minimalist_tailored',
    occasions: ['office', 'casual', 'date_night'],
    description: 'High-waisted double-pleated trousers with draped wide leg and internal curtain waistband.',
    svgIcon: 'trousers'
  },
  {
    id: 'preset-cashmere-knit',
    name: 'Oatmeal Cashmere Crewneck',
    category: 'tops',
    specificType: 'Cashmere Knit Sweater',
    colorName: 'Ivory Cream',
    colorHex: '#F7F4EE',
    style: 'classic_elegance',
    occasions: ['casual', 'office', 'date_night'],
    description: 'Ultra-soft 2-ply Mongolian cashmere sweater with ribbed cuffs and relaxed dropped shoulder.',
    svgIcon: 'knit'
  },
  {
    id: 'preset-blazer',
    name: 'Structured Charcoal Blazer',
    category: 'outerwear',
    specificType: 'Oversized Tailored Blazer',
    colorName: 'Charcoal Heather',
    colorHex: '#4A4E57',
    style: 'minimalist_tailored',
    occasions: ['office', 'party', 'date_night'],
    description: 'Architectural boyfriend cut with padded shoulders, peak lapels, and smooth cupro lining.',
    svgIcon: 'blazer'
  }
];

export const INITIAL_WARDROBE_ITEMS: WardrobeItem[] = [
  {
    id: 'w-1',
    name: 'Double-Breasted Wool Trench',
    category: 'outerwear',
    specificType: 'Double-Breasted Wool Trench',
    colorName: 'Camel Tan',
    colorHex: '#C19A6B',
    style: 'classic_elegance',
    occasions: ['casual', 'office', 'date_night'],
    season: ['autumn', 'spring', 'winter'],
    notes: 'Classic tailored wool trench with belted waist.',
    createdAt: '2026-03-01T10:00:00Z',
    svgIcon: 'coat'
  },
  {
    id: 'w-2',
    name: 'Italian Cotton White Shirt',
    category: 'tops',
    specificType: 'Crisp Poplin Shirt',
    colorName: 'Ivory Cream',
    colorHex: '#F7F4EE',
    style: 'minimalist_tailored',
    occasions: ['casual', 'office', 'date_night'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    notes: 'Clean poplin shirt suitable for layering or standalone wear.',
    createdAt: '2026-03-05T12:00:00Z',
    svgIcon: 'shirt'
  },
  {
    id: 'w-3',
    name: 'Wide-Leg Navy Trousers',
    category: 'bottoms',
    specificType: 'Tailored Pleated Trousers',
    colorName: 'Midnight Navy',
    colorHex: '#1B263B',
    style: 'minimalist_tailored',
    occasions: ['office', 'party', 'date_night'],
    season: ['spring', 'autumn', 'winter'],
    notes: 'High-waisted trousers with permanent center pleat.',
    createdAt: '2026-03-10T14:30:00Z',
    svgIcon: 'trousers'
  },
  {
    id: 'w-4',
    name: 'Emerald Silk Midi Slip',
    category: 'one_piece',
    specificType: 'Silk Slip Midi Dress',
    colorName: 'Emerald Forest',
    colorHex: '#1B4332',
    style: 'parisian_chic',
    occasions: ['party', 'date_night', 'wedding_guest'],
    season: ['spring', 'summer', 'autumn'],
    notes: 'Bias-cut midi slip dress with lustrous finish.',
    createdAt: '2026-03-15T09:15:00Z',
    svgIcon: 'dress'
  },
  {
    id: 'w-5',
    name: 'Calfskin Horsebit Loafers',
    category: 'footwear',
    specificType: 'Calfskin Horsebit Loafers',
    colorName: 'Obsidian Black',
    colorHex: '#161617',
    style: 'classic_elegance',
    occasions: ['casual', 'office'],
    season: ['spring', 'autumn', 'winter'],
    notes: 'Polished leather loafers with antique brass hardware.',
    createdAt: '2026-03-18T16:20:00Z',
    svgIcon: 'shoes'
  },
  {
    id: 'w-6',
    name: 'Oversized Charcoal Blazer',
    category: 'outerwear',
    specificType: 'Oversized Tailored Blazer',
    colorName: 'Charcoal Heather',
    colorHex: '#4A4E57',
    style: 'minimalist_tailored',
    occasions: ['office', 'casual', 'party', 'date_night'],
    season: ['autumn', 'winter', 'spring'],
    notes: 'Structured wool-blend blazer with clean padded shoulders.',
    createdAt: '2026-03-22T11:00:00Z',
    svgIcon: 'blazer'
  }
];
