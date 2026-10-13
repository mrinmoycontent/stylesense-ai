export type GarmentCategory =
  | 'tops'
  | 'bottoms'
  | 'one_piece'
  | 'outerwear'
  | 'footwear'
  | 'accessories'
  | 'bags'
  | 'weather_protection';

export type OutfitPieceRole =
  | 'Top'
  | 'Bottom'
  | 'One-piece outfit'
  | 'Outerwear'
  | 'Footwear'
  | 'Accessory'
  | 'Bag'
  | 'Weather protection'
  | 'Core Piece'
  | 'Complementary Layer'
  | 'Essential Bottom'
  | 'Essential Top'
  | 'Footwear Anchor'
  | 'Accent Accessory'
  | 'Statement Bag';

export type Occasion = 'casual' | 'office' | 'party' | 'date_night' | 'wedding_guest';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type FashionStyle =
  | 'minimalist_tailored'
  | 'parisian_chic'
  | 'modern_casual'
  | 'classic_elegance'
  | 'avant_garde'
  | 'bohemian_relaxed';

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'cold';

export type TemperatureRange = 'below_10' | '10_19' | '20_29' | '30_plus';

export interface FashionColor {
  id: string;
  name: string;
  hex: string;
  family: 'neutral' | 'warm' | 'cool' | 'earth' | 'jewel';
  undertone: 'warm' | 'cool' | 'neutral';
  complementaryHex: string;
  analogousHexes: string[];
  monochromaticHexes: string[];
  bestNeutrals: string[];
  stylingAdvice: string;
}

export interface GarmentPreset {
  id: string;
  name: string;
  category: GarmentCategory;
  specificType: string;
  colorName: string;
  colorHex: string;
  style: FashionStyle;
  occasions: Occasion[];
  description: string;
  svgIcon: string;
  imageUrl?: string;
}

export interface OutfitPiece {
  category: GarmentCategory;
  name: string;
  colorName: string;
  colorHex: string;
  description: string;
  role: OutfitPieceRole;
  stylingTip: string;
  isWardrobeOwned?: boolean;
  sourceLabel?: 'From Your Wardrobe' | 'Curated Catalog' | 'Uploaded Piece';
  imageUrl?: string;
  wardrobeItemId?: string;
  isColorConfirmed?: boolean;
}

export interface OutfitRecommendation {
  id: string;
  title: string;
  subtitle: string;
  aesthetic: string;
  occasion: Occasion;
  style: FashionStyle;
  corePieceName: string;
  corePieceCategory: GarmentCategory;
  corePieceColor: string;
  pieces: OutfitPiece[];
  colorHarmony: {
    name: string;
    description: string;
    hexes: string[];
  };
  recommendedMetal: 'Warm Gold' | 'Cool Silver' | 'Rose Gold' | 'Mixed Metallics';
  stylistRationale: string;
  proStylistRule: string;
  textureTip: string;
  formalityScore: number; // 1-10
  silhouetteName?: string;
  wardrobeMatchCount?: number;
  catalogMatchCount?: number;
  weatherCompatibility?: {
    condition: WeatherCondition;
    temperature: TemperatureRange;
    badge: string;
  };
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: GarmentCategory;
  specificType: string;
  colorName: string;
  colorHex: string;
  style: FashionStyle;
  occasions: Occasion[];
  season: ('spring' | 'summer' | 'autumn' | 'winter')[];
  imageUrl?: string;
  svgIcon?: string;
  notes?: string;
  createdAt: string;
}

export interface FavoriteLook {
  id: string;
  savedAt: string;
  outfit: OutfitRecommendation;
  userNotes?: string;
}

export interface CalendarOutfitPlan {
  id: string;
  date: string; // YYYY-MM-DD
  outfitTitle: string;
  occasion: Occasion;
  style?: FashionStyle;
  pieces: OutfitPiece[];
  colorHexes: string[];
  notes?: string;
  worn: boolean;
  wornAt?: string;
  sourceOutfitId?: string;
  weatherCondition?: WeatherCondition;
  temperatureRange?: TemperatureRange;
  createdAt: string;
  updatedAt?: string;
}

export interface WeatherStylingAdvice {
  weather: WeatherCondition;
  temperature: TemperatureRange;
  weatherTitle: string;
  recommendedFabrics: string[];
  avoidedFabrics: string[];
  layeringStrategy: string;
  essentialAccessories: string[];
  weatherRule: string;
  colorPaletteTip: string;
}
