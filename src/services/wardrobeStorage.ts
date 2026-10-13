import { INITIAL_WARDROBE_ITEMS } from '../data/fashionData';
import { CalendarOutfitPlan, FavoriteLook, OutfitRecommendation, WardrobeItem } from '../types';

const WARDROBE_KEY = 'stylesense_wardrobe_items_v1';
const FAVORITES_KEY = 'stylesense_favorite_looks_v1';
const CALENDAR_KEY = 'stylesense_outfit_calendar_v1';

export function isSameOutfit(a: OutfitRecommendation, b: OutfitRecommendation): boolean {
  if (a.id === b.id) return true;
  if (a.occasion !== b.occasion) return false;
  if (a.pieces.length !== b.pieces.length) return false;
  return a.pieces.every((p, idx) => p.name === b.pieces[idx]?.name);
}

export function getStoredWardrobe(): WardrobeItem[] {
  try {
    const raw = localStorage.getItem(WARDROBE_KEY);
    if (!raw) {
      localStorage.setItem(WARDROBE_KEY, JSON.stringify(INITIAL_WARDROBE_ITEMS));
      return INITIAL_WARDROBE_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_WARDROBE_ITEMS;
    }

    // Harmonize legacy seeded data where w-1 might have had 'Camel Gabardine Trench'
    let modified = false;
    const sanitized = parsed.map((item: WardrobeItem) => {
      if (item.id === 'w-1' && item.name === 'Camel Gabardine Trench') {
        modified = true;
        return {
          ...item,
          name: 'Double-Breasted Wool Trench',
          notes: item.notes || 'Classic tailored wool trench with belted waist.'
        };
      }
      return item;
    });

    if (modified) {
      localStorage.setItem(WARDROBE_KEY, JSON.stringify(sanitized));
    }

    return sanitized;
  } catch (err) {
    console.error('Error reading wardrobe from localStorage:', err);
    return INITIAL_WARDROBE_ITEMS;
  }
}

export function saveWardrobeItem(item: Omit<WardrobeItem, 'id' | 'createdAt'>): WardrobeItem {
  const current = getStoredWardrobe();
  const newItem: WardrobeItem = {
    ...item,
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newItem, ...current];
  try {
    localStorage.setItem(WARDROBE_KEY, JSON.stringify(updated));
  } catch (err: any) {
    console.error('Failed to save wardrobe item:', err);
    throw new Error(
      err?.name === 'QuotaExceededError' || err?.code === 22
        ? 'Local storage quota exceeded. Please remove some items or use a smaller photo.'
        : 'Failed to save garment to local storage.'
    );
  }
  return newItem;
}

export function updateWardrobeItem(id: string, updates: Partial<Omit<WardrobeItem, 'id' | 'createdAt'>>): WardrobeItem[] {
  const current = getStoredWardrobe();
  const updated = current.map(item => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    return item;
  });
  try {
    localStorage.setItem(WARDROBE_KEY, JSON.stringify(updated));
  } catch (err: any) {
    console.error('Failed to update wardrobe item:', err);
    throw new Error(
      err?.name === 'QuotaExceededError' || err?.code === 22
        ? 'Local storage quota exceeded. Please remove some items or use a smaller photo.'
        : 'Failed to update garment in local storage.'
    );
  }
  return updated;
}

export function deleteWardrobeItem(id: string): WardrobeItem[] {
  const current = getStoredWardrobe();
  const filtered = current.filter(item => item.id !== id);
  try {
    localStorage.setItem(WARDROBE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete wardrobe item:', err);
  }
  return filtered;
}

export function getStoredFavorites(): FavoriteLook[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading favorites from localStorage:', err);
    return [];
  }
}

export function saveFavoriteLook(outfit: OutfitRecommendation, userNotes?: string): FavoriteLook {
  const current = getStoredFavorites();

  // Prevent duplicate saves of the same outfit
  const existing = current.find(f => f.outfit.id === outfit.id || isSameOutfit(f.outfit, outfit));
  if (existing) {
    if (userNotes && userNotes !== existing.userNotes) {
      existing.userNotes = userNotes;
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(current));
      } catch (err) {
        console.error('Failed to update favorite notes:', err);
      }
    }
    return existing;
  }

  const newFav: FavoriteLook = {
    id: `fav-${Date.now()}`,
    savedAt: new Date().toISOString(),
    outfit,
    userNotes: userNotes || ''
  };
  const updated = [newFav, ...current];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save favorite look:', err);
  }
  return newFav;
}

export function removeFavoriteLook(id: string): FavoriteLook[] {
  const current = getStoredFavorites();
  const filtered = current.filter(fav => fav.id !== id);
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to remove favorite look:', err);
  }
  return filtered;
}

export function updateFavoriteNotes(id: string, notes: string): FavoriteLook[] {
  const current = getStoredFavorites();
  const updated = current.map(fav => fav.id === id ? { ...fav, userNotes: notes } : fav);
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update favorite notes:', err);
  }
  return updated;
}

export function isOutfitFavorited(outfitId: string, outfit?: OutfitRecommendation): boolean {
  const favs = getStoredFavorites();
  return favs.some(f => f.outfit.id === outfitId || (outfit && isSameOutfit(f.outfit, outfit)));
}

// ----------------------------------------------------
// Outfit Calendar Storage & Helpers
// ----------------------------------------------------

function getInitialCalendarSeed(): CalendarOutfitPlan[] {
  const today = new Date();
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDate(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDate(tomorrow);

  return [
    {
      id: `plan-seed-today`,
      date: todayStr,
      outfitTitle: 'Tailored Office Trench & Wool Trousers',
      occasion: 'office',
      style: 'minimalist_tailored',
      pieces: [
        {
          category: 'outerwear',
          name: 'Double-Breasted Wool Trench',
          colorName: 'Camel Tan',
          colorHex: '#C19A6B',
          role: 'Core Piece',
          description: 'Classic tailored wool trench with belted waist.',
          stylingTip: 'Tie belt nonchalantly behind back.'
        },
        {
          category: 'bottoms',
          name: 'Midnight Pleated Wool Trousers',
          colorName: 'Midnight Navy',
          colorHex: '#1B263B',
          role: 'Essential Bottom',
          description: 'High-waisted double-pleated trousers.',
          stylingTip: 'Center crease creates vertical proportion.'
        },
        {
          category: 'tops',
          name: 'Crisp Poplin White Shirt',
          colorName: 'Ivory Cream',
          colorHex: '#F7F4EE',
          role: 'Essential Top',
          description: 'Structured menswear collar with relaxed cuffs.',
          stylingTip: 'Roll cuffs once.'
        },
        {
          category: 'footwear',
          name: 'Pointed Kitten-Heel Slingbacks',
          colorName: 'Obsidian Black',
          colorHex: '#161617',
          role: 'Footwear Anchor',
          description: '50mm architectural kitten heel.',
          stylingTip: 'Elongates leg line.'
        }
      ],
      colorHexes: ['#C19A6B', '#1B263B', '#F7F4EE', '#161617'],
      notes: 'Executive presentation morning; client luncheon afternoon.',
      worn: false,
      createdAt: new Date().toISOString()
    },
    {
      id: `plan-seed-tomorrow`,
      date: tomorrowStr,
      outfitTitle: 'Parisian Silk Slip & Cashmere Layer',
      occasion: 'date_night',
      style: 'parisian_chic',
      pieces: [
        {
          category: 'one_piece',
          name: 'Emerald Satin Midi Slip Dress',
          colorName: 'Emerald Forest',
          colorHex: '#1B4332',
          role: 'Core Piece',
          description: 'Fluid bias-cut silk satin dress.',
          stylingTip: 'Layer under structured jacket.'
        },
        {
          category: 'outerwear',
          name: 'Oversized Charcoal Blazer',
          colorName: 'Charcoal Heather',
          colorHex: '#4A4E57',
          role: 'Complementary Layer',
          description: 'Architectural boyfriend cut.',
          stylingTip: 'Balances silk drape.'
        },
        {
          category: 'footwear',
          name: 'Strappy Evening Sandals',
          colorName: 'Champagne Metallic',
          colorHex: '#D4AF37',
          role: 'Footwear Anchor',
          description: 'Delicate metallic straps.',
          stylingTip: 'Minimalist visual weight.'
        }
      ],
      colorHexes: ['#1B4332', '#4A4E57', '#D4AF37'],
      notes: 'Candlelit dinner at bistro.',
      worn: false,
      createdAt: new Date().toISOString()
    }
  ];
}

export function getStoredCalendarPlans(): CalendarOutfitPlan[] {
  try {
    const raw = localStorage.getItem(CALENDAR_KEY);
    if (!raw) {
      const initial = getInitialCalendarSeed();
      localStorage.setItem(CALENDAR_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Error reading calendar plans from localStorage:', err);
    return [];
  }
}

export function saveCalendarPlan(planData: Omit<CalendarOutfitPlan, 'id' | 'createdAt'>): CalendarOutfitPlan {
  const current = getStoredCalendarPlans();
  const newPlan: CalendarOutfitPlan = {
    ...planData,
    id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString()
  };
  
  // If a plan already exists for this date, replace it or prepend
  const existingIdx = current.findIndex(p => p.date === planData.date);
  let updated: CalendarOutfitPlan[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = newPlan;
  } else {
    updated = [newPlan, ...current];
  }

  try {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save calendar plan:', err);
  }
  return newPlan;
}

export function updateCalendarPlan(id: string, updates: Partial<CalendarOutfitPlan>): CalendarOutfitPlan[] {
  const current = getStoredCalendarPlans();
  const updated = current.map(p => {
    if (p.id === id) {
      return {
        ...p,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return p;
  });

  try {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update calendar plan:', err);
  }
  return updated;
}

export function deleteCalendarPlan(id: string): CalendarOutfitPlan[] {
  const current = getStoredCalendarPlans();
  const filtered = current.filter(p => p.id !== id);
  try {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete calendar plan:', err);
  }
  return filtered;
}

export function togglePlanWorn(id: string): { updatedPlans: CalendarOutfitPlan[]; plan?: CalendarOutfitPlan } {
  const current = getStoredCalendarPlans();
  let modifiedPlan: CalendarOutfitPlan | undefined;

  const updated = current.map(p => {
    if (p.id === id) {
      const nextWorn = !p.worn;
      modifiedPlan = {
        ...p,
        worn: nextWorn,
        wornAt: nextWorn ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString()
      };
      return modifiedPlan;
    }
    return p;
  });

  try {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to toggle plan worn status:', err);
  }
  return { updatedPlans: updated, plan: modifiedPlan };
}

export interface OutfitRepetitionCheck {
  isRepeated: boolean;
  recentDate?: string;
  daysApart?: number;
  message?: string;
  isWornConflict?: boolean;
}

export function checkOutfitRepetitionWarning(
  targetDateStr: string,
  outfitTitle: string,
  excludePlanId?: string
): OutfitRepetitionCheck {
  const plans = getStoredCalendarPlans();
  const targetDate = new Date(targetDateStr);
  if (isNaN(targetDate.getTime())) return { isRepeated: false };

  const normTarget = outfitTitle.trim().toLowerCase();

  for (const plan of plans) {
    if (excludePlanId && plan.id === excludePlanId) continue;
    const planDate = new Date(plan.date);
    if (isNaN(planDate.getTime())) continue;

    const normTitle = plan.outfitTitle.trim().toLowerCase();
    if (normTitle === normTarget || (normTarget.length > 5 && (normTitle.includes(normTarget) || normTarget.includes(normTitle)))) {
      const diffTime = Math.abs(targetDate.getTime() - planDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        const isPastOrToday = planDate <= targetDate;
        const formattedDate = planDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const warningType = plan.worn ? 'already worn' : 'already scheduled';

        return {
          isRepeated: true,
          recentDate: plan.date,
          daysApart: diffDays,
          isWornConflict: plan.worn,
          message: diffDays === 0
            ? `An ensemble with a matching signature is already scheduled for ${formattedDate}.`
            : `High rotation frequency: this ensemble was ${warningType} on ${formattedDate} (${diffDays} day${diffDays === 1 ? '' : 's'} ${isPastOrToday ? 'prior' : 'away'}). Consider alternating items to preserve wardrobe longevity.`
        };
      }
    }
  }

  return { isRepeated: false };
}

// ----------------------------------------------------
// Wardrobe Analytics
// ----------------------------------------------------

export interface WardrobeAnalytics {
  totalItems: number;
  categoryBreakdown: Record<string, number>;
  occasionCoverage: number;
  versatilityScore: number;
  dominantColor: string;
}

export function calculateWardrobeAnalytics(items: WardrobeItem[]): WardrobeAnalytics {
  const total = items.length;
  if (total === 0) {
    return {
      totalItems: 0,
      categoryBreakdown: {},
      occasionCoverage: 0,
      versatilityScore: 0,
      dominantColor: 'None'
    };
  }

  const categoryBreakdown: Record<string, number> = {};
  const occasionsCovered = new Set<string>();
  const colorCounts: Record<string, number> = {};

  items.forEach(item => {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    item.occasions.forEach(occ => occasionsCovered.add(occ));
    colorCounts[item.colorName] = (colorCounts[item.colorName] || 0) + 1;
  });

  const occasionCoverage = Math.round((occasionsCovered.size / 5) * 100);

  const hasTops = (categoryBreakdown['tops'] || 0) > 0;
  const hasBottoms = (categoryBreakdown['bottoms'] || 0) > 0;
  const hasOuter = (categoryBreakdown['outerwear'] || 0) > 0;
  const hasShoes = (categoryBreakdown['footwear'] || 0) > 0;

  let balanceScore = 0;
  if (hasTops) balanceScore += 20;
  if (hasBottoms) balanceScore += 20;
  if (hasOuter) balanceScore += 15;
  if (hasShoes) balanceScore += 15;

  const versatilityScore = Math.min(100, Math.round(balanceScore * 0.7 + occasionCoverage * 0.3));

  let dominantColor = 'Ivory';
  let maxCount = 0;
  Object.entries(colorCounts).forEach(([col, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = col;
    }
  });

  return {
    totalItems: total,
    categoryBreakdown,
    occasionCoverage,
    versatilityScore,
    dominantColor
  };
}
