import React, { useState } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  ThermometerSnowflake,
  ThermometerSun,
  Sparkles,
  Heart,
  Calendar,
  Check,
  ArrowRight,
  ShieldAlert,
  Layers,
  Palette,
  Info,
  RefreshCw
} from 'lucide-react';
import {
  GarmentPreset,
  Occasion,
  OutfitRecommendation,
  TemperatureRange,
  WardrobeItem,
  WeatherCondition
} from '../types';
import { OCCASIONS_DATA } from '../data/fashionData';
import {
  generateWeatherOutfitRecommendations,
  getTemperatureLabel,
  getWeatherLabel,
  WEATHER_ADVICE_CATALOG
} from '../services/weatherStylingEngine';
import { isOutfitFavorited, saveFavoriteLook } from '../services/wardrobeStorage';
import { decodeHtmlEntities } from '../services/textSanitizer';
import { GarmentVisual } from './GarmentVisual';

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

interface WeatherStylistProps {
  wardrobe: WardrobeItem[];
  currentWeather?: WeatherCondition;
  currentTemperature?: TemperatureRange;
  currentOccasion?: Occasion;
  onWeatherChange?: (w: WeatherCondition) => void;
  onTemperatureChange?: (t: TemperatureRange) => void;
  onOccasionChange?: (o: Occasion) => void;
  initialGarment?: GarmentPreset | WardrobeItem | null;
  onNavigateToStylist?: () => void;
  onFavoriteSaved: () => void;
  onScheduleOutfitInCalendar: (recommendation: OutfitRecommendation) => void;
}

export const WeatherStylist: React.FC<WeatherStylistProps> = ({
  wardrobe,
  currentWeather = 'sunny',
  currentTemperature = '20_29',
  currentOccasion = 'office',
  onWeatherChange,
  onTemperatureChange,
  onOccasionChange,
  initialGarment,
  onNavigateToStylist,
  onFavoriteSaved,
  onScheduleOutfitInCalendar
}) => {
  // Manual Weather Selector State
  const [selectedWeather, setSelectedWeather] = useState<WeatherCondition>(currentWeather);
  const [selectedTemp, setSelectedTemp] = useState<TemperatureRange>(currentTemperature);
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>(currentOccasion);
  const [variationSeed, setVariationSeed] = useState(0);

  // Sync from props if updated externally
  React.useEffect(() => {
    if (currentWeather && currentWeather !== selectedWeather) {
      setSelectedWeather(currentWeather);
      handleRegenerate(currentWeather, selectedTemp, selectedOccasion);
    }
  }, [currentWeather]);

  React.useEffect(() => {
    if (currentTemperature && currentTemperature !== selectedTemp) {
      setSelectedTemp(currentTemperature);
      handleRegenerate(selectedWeather, currentTemperature, selectedOccasion);
    }
  }, [currentTemperature]);

  React.useEffect(() => {
    if (initialGarment) {
      handleRegenerate(selectedWeather, selectedTemp, selectedOccasion, variationSeed);
    }
  }, [initialGarment]);

  React.useEffect(() => {
    if (currentOccasion && currentOccasion !== selectedOccasion) {
      setSelectedOccasion(currentOccasion);
      handleRegenerate(selectedWeather, selectedTemp, currentOccasion);
    }
  }, [currentOccasion]);

  // Generated recommendations
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>(() => {
    return generateWeatherOutfitRecommendations({
      weather: currentWeather,
      temperature: currentTemperature,
      occasion: currentOccasion,
      wardrobe,
      seed: 0,
      activeGarment: initialGarment
    });
  });

  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Active Weather Advice Catalog entry
  const weatherAdvice = WEATHER_ADVICE_CATALOG[selectedWeather][selectedTemp];

  // Re-generate recommendations when weather / temp / occasion changes
  const handleRegenerate = (w: WeatherCondition, t: TemperatureRange, o: Occasion, newSeed: number = variationSeed) => {
    setSelectedWeather(w);
    setSelectedTemp(t);
    setSelectedOccasion(o);
    if (onWeatherChange) onWeatherChange(w);
    if (onTemperatureChange) onTemperatureChange(t);
    if (onOccasionChange) onOccasionChange(o);

    const recs = generateWeatherOutfitRecommendations({
      weather: w,
      temperature: t,
      occasion: o,
      wardrobe,
      seed: newSeed,
      activeGarment: initialGarment
    });
    setRecommendations(recs);
    setActiveLookIndex(0);
  };

  const handleCycleVariations = () => {
    const nextSeed = variationSeed + 1;
    setVariationSeed(nextSeed);
    handleRegenerate(selectedWeather, selectedTemp, selectedOccasion, nextSeed);
  };

  const handleSaveFavorite = (look: OutfitRecommendation) => {
    saveFavoriteLook(look);
    setSavedSuccessId(look.id);
    onFavoriteSaved();
    setTimeout(() => setSavedSuccessId(null), 3000);
  };

  const weatherIcons: Record<WeatherCondition, React.ReactNode> = {
    sunny: <Sun className="w-5 h-5" />,
    cloudy: <Cloud className="w-5 h-5" />,
    rainy: <CloudRain className="w-5 h-5" />,
    windy: <Wind className="w-5 h-5" />,
    cold: <ThermometerSnowflake className="w-5 h-5" />
  };

  const activeLook = recommendations[activeLookIndex] || recommendations[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C8275] font-semibold mb-1">
          <span>Climate Intelligence</span>
          <span aria-hidden="true">·</span>
          <span>Adaptive Sartorial Matrix</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-[#141413]">
          Weather Stylist
        </h2>
        <p className="text-sm sm:text-base text-[#5A554E] mt-1 max-w-2xl font-light">
          Calibrate your ensemble to ambient temperature, precipitation, and wind conditions. StyleSense selects breathable textiles, rainproof barriers, and modular layers.
        </p>
      </div>

      {initialGarment && onNavigateToStylist && (
        <div className="bg-[#F5EFE6] border border-[#E2D8CC] p-4 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xs overflow-hidden shrink-0 bg-[#E8DFC8]">
              {initialGarment.imageUrl ? (
                <img
                  src={initialGarment.imageUrl}
                  alt={initialGarment.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <GarmentVisual
                  category={initialGarment.category}
                  name={initialGarment.name}
                  colorHex={initialGarment.colorHex}
                  compact
                />
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#8C4A2F]">
                Active Garment in Virtual Atelier
              </div>
              <div className="text-sm font-semibold text-[#141413]">
                {initialGarment.name} ({initialGarment.colorName})
              </div>
            </div>
          </div>
          <button
            onClick={onNavigateToStylist}
            className="px-4 py-2 text-xs font-semibold bg-[#141413] hover:bg-[#2B2926] text-white rounded-xs transition-colors shrink-0"
          >
            Style This Piece in Virtual Atelier
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Manual Weather Selector (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xs border border-[#E8DFC8] shadow-xs space-y-7">
          {/* Step 1: Weather Condition Selector */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413]">
              1. Weather Condition
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['sunny', 'cloudy', 'rainy', 'windy', 'cold'] as WeatherCondition[]).map((w) => {
                const isSelected = selectedWeather === w;
                return (
                  <button
                    key={w}
                    onClick={() => handleRegenerate(w, selectedTemp, selectedOccasion)}
                    className={`p-3 rounded-xs border flex flex-col items-center justify-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'border-[#141413] bg-[#141413] text-white'
                        : 'border-[#D9CFC4] bg-[#FAF8F5] text-[#5A554E] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    {weatherIcons[w]}
                    <span className="text-[11px] font-medium capitalize">{w}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Temperature Range Selector */}
          <div className="space-y-3 pt-3 border-t border-[#F0EAE1]">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413]">
              2. Temperature Bracket
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['below_10', '10_19', '20_29', '30_plus'] as TemperatureRange[]).map((t) => {
                const isSelected = selectedTemp === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleRegenerate(selectedWeather, t, selectedOccasion)}
                    className={`p-2.5 rounded-xs border text-left transition-colors ${
                      isSelected
                        ? 'border-[#141413] bg-[#141413] text-white'
                        : 'border-[#D9CFC4] bg-[#FAF8F5] text-[#5A554E] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    <span className="text-xs font-semibold block">
                      {getTemperatureLabel(t)}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-[#D4C9BC]' : 'text-[#8C8275]'
                      }`}
                    >
                      {t === '30_plus'
                        ? 'High Heat'
                        : t === '20_29'
                        ? 'Pleasant & Mild'
                        : t === '10_19'
                        ? 'Cool & Crisp'
                        : 'Freezing / Frost'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Occasion Selector */}
          <div className="space-y-3 pt-3 border-t border-[#F0EAE1]">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413]">
              3. Occasion
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(OCCASIONS_DATA) as Occasion[]).map((occ) => {
                const isSelected = selectedOccasion === occ;
                return (
                  <button
                    key={occ}
                    onClick={() => handleRegenerate(selectedWeather, selectedTemp, occ)}
                    className={`p-2 rounded-xs border text-left transition-colors ${
                      isSelected
                        ? 'border-[#141413] bg-[#141413] text-white'
                        : 'border-[#D9CFC4] bg-[#FAF8F5] text-[#5A554E] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    <span className="text-xs font-medium block truncate">
                      {OCCASIONS_DATA[occ].name.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[9px] block truncate ${
                        isSelected ? 'text-[#D4C9BC]' : 'text-[#8C8275]'
                      }`}
                    >
                      {OCCASIONS_DATA[occ].formalityLevel.split('·')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Climate Blueprint Card */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E5DACD] rounded-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-[#141413] text-[11px]">
                {decodeHtmlEntities(weatherAdvice.weatherTitle)}
              </span>
              <span className="text-[#8C8275] font-mono text-[11px]">
                {getWeatherLabel(selectedWeather)} · {getTemperatureLabel(selectedTemp)}
              </span>
            </div>

            <p className="text-[#5A554E] leading-relaxed">
              {decodeHtmlEntities(weatherAdvice.weatherRule)}
            </p>

            <div className="space-y-1.5 pt-2 border-t border-[#E8DFC8]">
              <div className="flex items-start gap-1.5">
                <span className="font-medium text-[#141413] shrink-0">Fabrics:</span>
                <span className="text-[#5A554E]">{weatherAdvice.recommendedFabrics.map(decodeHtmlEntities).join(', ')}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-medium text-[#141413] shrink-0">Key Accessories:</span>
                <span className="text-[#5A554E]">{weatherAdvice.essentialAccessories.map(decodeHtmlEntities).join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {recommendations.length === 0 ? (
            <div className="bg-white rounded-xs border border-[#E8DFC8] p-12 text-center space-y-4 shadow-xs">
              <ShieldAlert className="w-10 h-10 mx-auto text-[#C19A6B]" />
              <h3 className="text-xl font-serif text-[#141413]">
                No Weather-Safe Combination Available
              </h3>
              <p className="text-xs text-[#5A554E] max-w-md mx-auto leading-relaxed">
                The local styling rules strict safety constraints filtered out outfits that would be thermally uncomfortable or weather-incompatible. Please adjust your weather, temperature bracket, or occasion to explore matching pieces.
              </p>
              <button
                onClick={() => handleRegenerate('sunny', '20_29', 'office')}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs shadow-xs"
              >
                Reset to Balanced Selection
              </button>
            </div>
          ) : (
            <>
              {/* Look Variation Tabs & Rotation Control */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E2D9] pb-3 gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {recommendations.map((rec, index) => {
                    const isActive = activeLookIndex === index;
                    const label = rec.silhouetteName
                      ? rec.silhouetteName.split('+')[0].trim()
                      : rec.title.split(' ')[1] || rec.title;
                    return (
                      <button
                        key={rec.id}
                        onClick={() => setActiveLookIndex(index)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xs transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-[#141413] text-white shadow-xs'
                            : 'bg-white text-[#5A554E] hover:text-[#141413] border border-[#E5DACD]'
                        }`}
                        title={rec.silhouetteName || rec.title}
                      >
                        <span className="font-mono text-[10px] opacity-75">0{index + 1}</span>
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCycleVariations}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#141413] bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#D5CABE] rounded-xs transition-colors shadow-2xs"
                    title="Deterministically rotate local catalog for alternative silhouettes"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#6E675F]" />
                    <span>Explore Variations</span>
                  </button>
                  <div className="text-xs text-[#8C8275] hidden lg:block">
                    {getWeatherLabel(selectedWeather)} · {OCCASIONS_DATA[selectedOccasion].name}
                  </div>
                </div>
              </div>

              {/* Active Look Card */}
              {activeLook && (
                <div className="bg-white rounded-xs border border-[#E5DACD] p-6 sm:p-8 shadow-xs space-y-7">
                  {/* Header & Quick Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#F0EAE1]">
                    <div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C8275] font-semibold">
                        <span>{decodeHtmlEntities(activeLook.subtitle)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{activeLook.weatherCompatibility?.badge ? decodeHtmlEntities(activeLook.weatherCompatibility.badge) : ''}</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-[#141413] mt-1">
                        {decodeHtmlEntities(activeLook.title)}
                      </h3>
                      <p className="text-xs text-[#7A7369] mt-0.5">{decodeHtmlEntities(activeLook.aesthetic)}</p>

                      {/* Wardrobe vs Curated Catalog & Silhouette Badge */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#EFECE6] text-[#4A453E] font-medium border border-[#DDD5CA] text-[11px]">
                          ✦ {activeLook.wardrobeMatchCount || 0} Owned in Wardrobe
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#FAF8F5] text-[#7A7369] font-medium border border-[#E8DFC8] text-[11px]">
                          {activeLook.catalogMatchCount || activeLook.pieces.length} Curated Catalog Staples
                        </span>
                        {activeLook.silhouetteName && (
                          <span className="px-2 py-0.5 rounded-xs bg-[#F5EFE6] text-[#635543] font-medium border border-[#E2D8CC] text-[11px]">
                            Silhouette: {decodeHtmlEntities(activeLook.silhouetteName)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSaveFavorite(activeLook)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xs border transition-colors ${
                          savedSuccessId === activeLook.id || isOutfitFavorited(activeLook.id)
                            ? 'bg-[#F2ECE1] border-[#141413] text-[#141413]'
                            : 'bg-white border-[#D9CFC4] text-[#141413] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            savedSuccessId === activeLook.id || isOutfitFavorited(activeLook.id)
                              ? 'fill-[#141413]'
                              : ''
                          }`}
                        />
                        <span>
                          {savedSuccessId === activeLook.id || isOutfitFavorited(activeLook.id)
                            ? 'Saved'
                            : 'Save Favorite'}
                        </span>
                      </button>

                      <button
                        onClick={() => onScheduleOutfitInCalendar(activeLook)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xs bg-[#141413] hover:bg-[#2B2926] text-white transition-colors shadow-2xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule in Calendar</span>
                      </button>
                    </div>
                  </div>

                  {/* Rationale Callout: Why This Suits The Weather */}
                  <div className="p-4 bg-[#F5EFE6] border border-[#E2D8CC] rounded-xs space-y-1.5 text-xs">
                    <span className="font-semibold text-[#8C4A2F] uppercase tracking-wider text-[10px] block">
                      Climate Suitability Rationale
                    </span>
                    <p className="text-[#4A4742] leading-relaxed">
                      {decodeHtmlEntities(activeLook.stylistRationale)}
                    </p>
                  </div>

                  {/* Outfit Pieces Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-[#141413]">
                        Recommended Pieces ({activeLook.pieces.length})
                      </h4>
                      <span className="text-xs text-[#7A7369]">Weather-Calibrated Layers</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeLook.pieces.map((piece, pIdx) => {
                        const isCore = piece.role === 'Core Piece';
                        return (
                          <div
                            key={pIdx}
                            className={`p-4 rounded-xs border transition-all ${
                              isCore
                                ? 'bg-[#F9F6F0] border-[#D4C9BC] ring-1 ring-[#D4C9BC]'
                                : 'bg-[#FAF8F5] border-[#E8DFC8]'
                            }`}
                          >
                            <div className="flex gap-3.5 items-start">
                              <div className="w-14 h-14 shrink-0 rounded-xs overflow-hidden">
                                {piece.imageUrl ? (
                                  <img
                                    src={piece.imageUrl}
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

                              <div className="flex-1 min-w-0">
                                {/* Separate readable category and source labels */}
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
                                    {piece.isWardrobeOwned ? (
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

                                <div className="font-semibold text-xs text-[#141413] truncate">
                                  {piece.name}
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                                  <span
                                    className="w-2 h-2 rounded-full border border-black/15 shrink-0"
                                    style={{ backgroundColor: piece.colorHex }}
                                  />
                                  <span className="text-[#7A7369]">{piece.colorName}</span>
                                </div>

                                <p className="text-[11px] text-[#5A554E] mt-1 line-clamp-2">
                                  {piece.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

              {/* Color Harmony & Suggested Accessories Strip */}
              <div className="bg-[#FAF8F5] p-5 rounded-xs border border-[#E5DACD] space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold">
                      Weather-Appropriate Color Palette
                    </span>
                    <h5 className="font-semibold text-[#141413]">
                      {activeLook.colorHarmony.name}
                    </h5>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {activeLook.colorHarmony.hexes.map((hex, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[#5A554E]">
                  {activeLook.colorHarmony.description}
                </p>

                <div className="pt-2 border-t border-[#E8DFC8] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="font-medium text-[#141413]">Fabric Strategy: </span>
                    <span className="text-[#5A554E]">{activeLook.textureTip}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#141413]">Metal Finish: </span>
                    <span className="text-[#5A554E]">{activeLook.recommendedMetal}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>
</div>
  );
};
