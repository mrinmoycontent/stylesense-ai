import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { OutfitStylist } from './components/OutfitStylist';
import { WeatherStylist } from './components/WeatherStylist';
import { OutfitCalendar } from './components/OutfitCalendar';
import { ColorLab } from './components/ColorLab';
import { WardrobePlanner } from './components/WardrobePlanner';
import { FavoritesLookbook } from './components/FavoritesLookbook';
import { Footer } from './components/Footer';
import {
  FashionColor,
  GarmentPreset,
  WardrobeItem,
  FavoriteLook,
  CalendarOutfitPlan,
  OutfitRecommendation,
  WeatherCondition,
  TemperatureRange,
  Occasion,
  Season
} from './types';
import {
  getStoredFavorites,
  getStoredWardrobe,
  getStoredCalendarPlans
} from './services/wardrobeStorage';
import { FASHION_COLORS } from './data/fashionData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('stylist');
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteLook[]>([]);
  const [calendarPlans, setCalendarPlans] = useState<CalendarOutfitPlan[]>([]);
  const [selectedGarmentForStyling, setSelectedGarmentForStyling] = useState<GarmentPreset | WardrobeItem | null>(null);
  const [selectedColorForStudio, setSelectedColorForStudio] = useState<FashionColor>(FASHION_COLORS[2]);
  const [initialPlanForCalendar, setInitialPlanForCalendar] = useState<Partial<CalendarOutfitPlan> | null>(null);

  // Shared climate & occasion state across the application
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition>(() => {
    try {
      const saved = localStorage.getItem('stylesense_selected_weather');
      if (saved && ['sunny', 'cloudy', 'rainy', 'windy', 'cold'].includes(saved)) {
        return saved as WeatherCondition;
      }
    } catch {}
    return 'sunny';
  });

  const [currentTemperature, setCurrentTemperature] = useState<TemperatureRange>(() => {
    try {
      const saved = localStorage.getItem('stylesense_selected_temp');
      if (saved && ['below_10', '10_19', '20_29', '30_plus'].includes(saved)) {
        return saved as TemperatureRange;
      }
    } catch {}
    return '20_29';
  });

  const [currentOccasion, setCurrentOccasion] = useState<Occasion>(() => {
    try {
      const saved = localStorage.getItem('stylesense_selected_occasion');
      if (saved && ['casual', 'office', 'date_night', 'party', 'wedding_guest'].includes(saved)) {
        return saved as Occasion;
      }
    } catch {}
    return 'office';
  });

  const [currentSeason, setCurrentSeason] = useState<Season>(() => {
    try {
      const saved = localStorage.getItem('stylesense_selected_season');
      if (saved && ['spring', 'summer', 'autumn', 'winter'].includes(saved)) {
        return saved as Season;
      }
    } catch {}
    return 'autumn';
  });

  const handleWeatherChange = (w: WeatherCondition) => {
    setCurrentWeather(w);
    try {
      localStorage.setItem('stylesense_selected_weather', w);
    } catch {}
  };

  const handleTemperatureChange = (t: TemperatureRange) => {
    setCurrentTemperature(t);
    try {
      localStorage.setItem('stylesense_selected_temp', t);
    } catch {}
  };

  const handleOccasionChange = (o: Occasion) => {
    setCurrentOccasion(o);
    try {
      localStorage.setItem('stylesense_selected_occasion', o);
    } catch {}
  };

  const handleSeasonChange = (s: Season) => {
    setCurrentSeason(s);
    try {
      localStorage.setItem('stylesense_selected_season', s);
    } catch {}
  };

  // Initialize data on mount
  useEffect(() => {
    const loadedWardrobe = getStoredWardrobe();
    setWardrobe(loadedWardrobe);
    const loadedFavorites = getStoredFavorites();
    setFavorites(loadedFavorites);
    const loadedPlans = getStoredCalendarPlans();
    setCalendarPlans(loadedPlans);
  }, []);

  const getTodayDateStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayDateStr();
  const todayPlan = calendarPlans.find(p => p.date === todayStr);
  const upcomingPlans = calendarPlans
    .filter(p => p.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const handleStartStylingFromHero = () => {
    setActiveTab('stylist');
    const stylistElement = document.getElementById('stylist-studio-section');
    if (stylistElement) {
      stylistElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPresetFromHero = (preset: GarmentPreset) => {
    setSelectedGarmentForStyling(preset);
    setActiveTab('stylist');
    const stylistElement = document.getElementById('stylist-studio-section');
    if (stylistElement) {
      stylistElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStyleWardrobeItem = (item: WardrobeItem) => {
    setSelectedGarmentForStyling(item);
    setActiveTab('stylist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreColorInStudio = (color: FashionColor) => {
    setSelectedColorForStudio(color);
    setActiveTab('color_lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStyleWithColorFromStudio = (color: FashionColor) => {
    setSelectedGarmentForStyling({
      id: `color-style-${Date.now()}`,
      name: `${color.name} Silhouette`,
      category: 'tops',
      specificType: 'Crisp Poplin Shirt',
      colorName: color.name,
      colorHex: color.hex,
      style: 'minimalist_tailored',
      occasions: ['office', 'casual'],
      description: `Curated starting piece anchored in ${color.name}.`,
      svgIcon: 'shirt'
    });
    setActiveTab('stylist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScheduleOutfitInCalendar = (outfit: OutfitRecommendation) => {
    setInitialPlanForCalendar({
      date: getTodayDateStr(),
      outfitTitle: outfit.title,
      occasion: outfit.occasion,
      style: outfit.style,
      pieces: outfit.pieces,
      colorHexes: outfit.colorHarmony.hexes,
      notes: `${outfit.subtitle} · Rule: ${outfit.proStylistRule}`
    });
    setActiveTab('calendar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFavoriteSaved = () => {
    setFavorites(getStoredFavorites());
  };

  const handlePlansUpdated = (updated: CalendarOutfitPlan[]) => {
    setCalendarPlans(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#141413]">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        wardrobeCount={wardrobe.length}
        calendarPlansCount={calendarPlans.length}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {activeTab === 'stylist' && (
          <div>
            <HeroSection
              onStartStyling={handleStartStylingFromHero}
              onSelectPreset={handleSelectPresetFromHero}
              todayPlan={todayPlan}
              upcomingPlans={upcomingPlans}
              onNavigateToCalendar={() => setActiveTab('calendar')}
              onNavigateToWeather={() => setActiveTab('weather')}
            />
            <div id="stylist-studio-section">
              <OutfitStylist
                initialGarment={selectedGarmentForStyling}
                wardrobe={wardrobe}
                currentWeather={currentWeather}
                currentTemperature={currentTemperature}
                currentOccasion={currentOccasion}
                currentSeason={currentSeason}
                onWeatherChange={handleWeatherChange}
                onTemperatureChange={handleTemperatureChange}
                onOccasionChange={handleOccasionChange}
                onSeasonChange={handleSeasonChange}
                onFavoriteSaved={handleFavoriteSaved}
                onExploreColorInStudio={handleExploreColorInStudio}
                onScheduleInCalendar={handleScheduleOutfitInCalendar}
              />
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <WeatherStylist
            wardrobe={wardrobe}
            currentWeather={currentWeather}
            currentTemperature={currentTemperature}
            currentOccasion={currentOccasion}
            onWeatherChange={handleWeatherChange}
            onTemperatureChange={handleTemperatureChange}
            onOccasionChange={handleOccasionChange}
            initialGarment={selectedGarmentForStyling}
            onNavigateToStylist={() => {
              setActiveTab('stylist');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onFavoriteSaved={handleFavoriteSaved}
            onScheduleOutfitInCalendar={handleScheduleOutfitInCalendar}
          />
        )}

        {activeTab === 'calendar' && (
          <OutfitCalendar
            plans={calendarPlans}
            favorites={favorites}
            wardrobe={wardrobe}
            onPlansUpdated={handlePlansUpdated}
            onNavigateToStylist={() => setActiveTab('stylist')}
            initialPlanData={initialPlanForCalendar}
            onClearInitialPlanData={() => setInitialPlanForCalendar(null)}
          />
        )}

        {activeTab === 'color_lab' && (
          <ColorLab
            currentColor={selectedColorForStudio}
            onStyleWithColor={handleStyleWithColorFromStudio}
          />
        )}

        {activeTab === 'wardrobe' && (
          <WardrobePlanner
            wardrobe={wardrobe}
            onWardrobeUpdated={(updated) => setWardrobe(updated)}
            onStyleItem={handleStyleWardrobeItem}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesLookbook
            favorites={favorites}
            onFavoritesUpdated={(updated) => setFavorites(updated)}
            onNavigateToStylist={() => setActiveTab('stylist')}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <Footer
        onNavigate={setActiveTab}
      />
    </div>
  );
}