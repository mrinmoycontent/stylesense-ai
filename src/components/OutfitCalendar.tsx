import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Check,
  AlertTriangle,
  Clock,
  Sparkles,
  Heart,
  Layers,
  X,
  Info
} from 'lucide-react';
import { CalendarOutfitPlan, FavoriteLook, Occasion, OutfitPiece, WardrobeItem } from '../types';
import { OCCASIONS_DATA, PRESET_GARMENTS } from '../data/fashionData';
import {
  checkOutfitRepetitionWarning,
  deleteCalendarPlan,
  saveCalendarPlan,
  togglePlanWorn,
  updateCalendarPlan
} from '../services/wardrobeStorage';
import { GarmentVisual } from './GarmentVisual';

interface OutfitCalendarProps {
  plans: CalendarOutfitPlan[];
  favorites: FavoriteLook[];
  wardrobe: WardrobeItem[];
  onPlansUpdated: (plans: CalendarOutfitPlan[]) => void;
  onNavigateToStylist: () => void;
  preselectedDateForModal?: string | null;
  initialPlanData?: Partial<CalendarOutfitPlan> | null;
  onClearInitialPlanData?: () => void;
}

export const OutfitCalendar: React.FC<OutfitCalendarProps> = ({
  plans,
  favorites,
  wardrobe,
  onPlansUpdated,
  onNavigateToStylist,
  preselectedDateForModal,
  initialPlanData,
  onClearInitialPlanData
}) => {
  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDayDate, setSelectedDayDate] = useState<string>(() => {
    return formatDateKey(new Date());
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CalendarOutfitPlan | null>(null);

  // Form Fields
  const [formDate, setFormDate] = useState<string>(formatDateKey(new Date()));
  const [formTitle, setFormTitle] = useState<string>('');
  const [formOccasion, setFormOccasion] = useState<Occasion>('office');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formPieces, setFormPieces] = useState<OutfitPiece[]>([]);
  const [formColorHexes, setFormColorHexes] = useState<string[]>(['#C19A6B', '#1B263B', '#F7F4EE']);
  const [formError, setFormError] = useState<string | null>(null);

  // Check repetition warning live
  const repetitionWarning = formTitle.trim()
    ? checkOutfitRepetitionWarning(formDate, formTitle, editingPlan?.id)
    : { isRepeated: false };

  // Handle external modal trigger (e.g., from Weather Stylist "Add to Calendar")
  React.useEffect(() => {
    if (initialPlanData) {
      setEditingPlan(null);
      setFormDate(initialPlanData.date || formatDateKey(new Date()));
      setFormTitle(initialPlanData.outfitTitle || '');
      setFormOccasion(initialPlanData.occasion || 'casual');
      setFormNotes(initialPlanData.notes || '');
      setFormPieces(initialPlanData.pieces || []);
      setFormColorHexes(initialPlanData.colorHexes || ['#C19A6B', '#141413']);
      setIsModalOpen(true);
      if (onClearInitialPlanData) onClearInitialPlanData();
    }
  }, [initialPlanData]);

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayDate(formatDateKey(today));
  };

  function formatDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Open planning modal for specific date
  const handleOpenPlanModal = (dateStr: string, existing?: CalendarOutfitPlan) => {
    setFormError(null);
    if (existing) {
      setEditingPlan(existing);
      setFormDate(existing.date);
      setFormTitle(existing.outfitTitle);
      setFormOccasion(existing.occasion);
      setFormNotes(existing.notes || '');
      setFormPieces(existing.pieces);
      setFormColorHexes(existing.colorHexes);
    } else {
      setEditingPlan(null);
      setFormDate(dateStr);
      setFormTitle('');
      setFormOccasion('office');
      setFormNotes('');
      setFormPieces([]);
      setFormColorHexes(['#C19A6B', '#1B263B', '#F7F4EE']);
    }
    setIsModalOpen(true);
  };

  const handleSelectFavoriteForForm = (fav: FavoriteLook) => {
    setFormTitle(fav.outfit.title);
    setFormOccasion(fav.outfit.occasion);
    setFormPieces(fav.outfit.pieces);
    setFormColorHexes(fav.outfit.colorHarmony.hexes);
    if (!formNotes && fav.userNotes) {
      setFormNotes(fav.userNotes);
    }
  };

  const handleSelectPresetForForm = (presetIndex: number) => {
    const p = PRESET_GARMENTS[presetIndex % PRESET_GARMENTS.length];
    setFormTitle(p.name);
    setFormOccasion(p.occasions[0] || 'office');
    setFormPieces([
      {
        category: p.category,
        name: p.name,
        colorName: p.colorName,
        colorHex: p.colorHex,
        role: 'Core Piece',
        description: p.description,
        stylingTip: 'Anchors the scheduled look.'
      }
    ]);
    setFormColorHexes([p.colorHex, '#141413', '#FAF7F2']);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError('Please enter an outfit title or choose from saved looks.');
      return;
    }

    if (!formDate) {
      setFormError('Please select a valid date.');
      return;
    }

    if (editingPlan) {
      const updated = updateCalendarPlan(editingPlan.id, {
        date: formDate,
        outfitTitle: formTitle.trim(),
        occasion: formOccasion,
        notes: formNotes.trim() || undefined,
        pieces: formPieces.length > 0 ? formPieces : [
          {
            category: 'tops',
            name: formTitle.trim(),
            colorName: 'Curated Tone',
            colorHex: formColorHexes[0] || '#C19A6B',
            role: 'Core Piece',
            description: 'Scheduled ensemble piece.',
            stylingTip: 'Tailored for day.'
          }
        ],
        colorHexes: formColorHexes
      });
      onPlansUpdated(updated);
    } else {
      const newPlan = saveCalendarPlan({
        date: formDate,
        outfitTitle: formTitle.trim(),
        occasion: formOccasion,
        notes: formNotes.trim() || undefined,
        worn: false,
        pieces: formPieces.length > 0 ? formPieces : [
          {
            category: 'tops',
            name: formTitle.trim(),
            colorName: 'Curated Tone',
            colorHex: formColorHexes[0] || '#C19A6B',
            role: 'Core Piece',
            description: 'Scheduled ensemble piece.',
            stylingTip: 'Tailored for day.'
          }
        ],
        colorHexes: formColorHexes
      });
      // Replace plan for this date or add
      const existing = plans.filter(p => p.date !== formDate);
      onPlansUpdated([newPlan, ...existing]);
    }

    setIsModalOpen(false);
  };

  const handleDeletePlan = (id: string) => {
    const updated = deleteCalendarPlan(id);
    onPlansUpdated(updated);
    setIsModalOpen(false);
  };

  const handleToggleWorn = (id: string) => {
    const { updatedPlans } = togglePlanWorn(id);
    onPlansUpdated(updatedPlans);
  };

  // Find plan for selected date
  const selectedDayPlan = plans.find(p => p.date === selectedDayDate);

  // Upcoming 7 Days List Math
  const upcomingSevenDays: { dateStr: string; dateObj: Date; plan?: CalendarOutfitPlan }[] = [];
  const startDay = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDay);
    d.setDate(d.getDate() + i);
    const dateStr = formatDateKey(d);
    upcomingSevenDays.push({
      dateStr,
      dateObj: d,
      plan: plans.find(p => p.date === dateStr)
    });
  }

  // Generate calendar grid cells
  const calendarCells: { dayNum: number; dateStr: string; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Previous month fill days
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDate - i;
    const prevDate = new Date(year, month - 1, day);
    calendarCells.push({
      dayNum: day,
      dateStr: formatDateKey(prevDate),
      isCurrentMonth: false,
      isToday: formatDateKey(prevDate) === formatDateKey(new Date())
    });
  }

  // Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = formatDateKey(d);
    calendarCells.push({
      dayNum: day,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === formatDateKey(new Date())
    });
  }

  // Trailing next month days (to complete 35 or 42 grid cells)
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells && calendarCells.length < 35 || (calendarCells.length > 35 && calendarCells.length < 42); day++) {
    const nextDate = new Date(year, month + 1, day);
    calendarCells.push({
      dayNum: day,
      dateStr: formatDateKey(nextDate),
      isCurrentMonth: false,
      isToday: formatDateKey(nextDate) === formatDateKey(new Date())
    });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E2D9] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C8275] font-semibold mb-1">
            <span>Sartorial Schedule</span>
            <span aria-hidden="true">·</span>
            <span>Local Storage Rotation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#141413]">
            Outfit Calendar
          </h2>
          <p className="text-sm sm:text-base text-[#5A554E] mt-1 max-w-2xl font-light">
            Plan your looks in advance, prevent over-wearing favorite staples with repetition tracking, and mark worn ensembles.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-white p-1 rounded-xs border border-[#E8DFC8]">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors ${
                viewMode === 'month'
                  ? 'bg-[#141413] text-white'
                  : 'text-[#5A554E] hover:text-[#141413]'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors ${
                viewMode === 'week'
                  ? 'bg-[#141413] text-white'
                  : 'text-[#5A554E] hover:text-[#141413]'
              }`}
            >
              7-Day Agenda
            </button>
          </div>

          <button
            onClick={() => handleOpenPlanModal(selectedDayDate)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Plan Outfit</span>
          </button>
        </div>
      </div>

      {/* Main View Grid: Calendar on Left, Selected Day Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Monthly Calendar or 7-Day Agenda (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {viewMode === 'month' ? (
            <div className="bg-white rounded-xs border border-[#E8DFC8] p-6 sm:p-8 shadow-xs space-y-6">
              {/* Month Header Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl sm:text-2xl font-serif text-[#141413]">
                    {monthNames[month]} {year}
                  </h3>
                  <button
                    onClick={goToToday}
                    className="text-xs px-2.5 py-1 bg-[#FAF8F5] border border-[#E2D8CC] hover:bg-[#F2EDE4] rounded-xs text-[#524E48] font-medium"
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 border border-[#E5DACD] hover:bg-[#FAF8F5] rounded-xs transition-colors text-[#5A554E]"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 border border-[#E5DACD] hover:bg-[#FAF8F5] rounded-xs transition-colors text-[#5A554E]"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 text-center border-b border-[#F0EAE1] pb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8275]">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarCells.map((cell, idx) => {
                  const plan = plans.find(p => p.date === cell.dateStr);
                  const isSelected = selectedDayDate === cell.dateStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDayDate(cell.dateStr)}
                      className={`min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 rounded-xs border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#141413] bg-[#FAF8F5] ring-2 ring-[#141413]/20'
                          : cell.isToday
                          ? 'border-[#C19A6B] bg-[#FBF9F5]'
                          : cell.isCurrentMonth
                          ? 'border-[#EAE2D5] bg-white hover:border-[#C2B4A3]'
                          : 'border-[#F2ECE1] bg-[#FAF8F5]/60 text-[#A8A29E]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-mono font-medium ${
                            cell.isToday
                              ? 'text-[#C19A6B] font-bold'
                              : cell.isCurrentMonth
                              ? 'text-[#141413]'
                              : 'text-[#A8A29E]'
                          }`}
                        >
                          {cell.dayNum}
                        </span>

                        {plan && (
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              plan.worn ? 'bg-[#2E6B4F]' : 'bg-[#C19A6B]'
                            }`}
                            title={plan.worn ? 'Worn' : 'Scheduled'}
                          />
                        )}
                      </div>

                      {/* Outfit preview snippet on cell */}
                      {plan ? (
                        <div className="mt-1 space-y-0.5">
                          <div className="text-[10px] sm:text-[11px] font-medium text-[#141413] truncate leading-tight">
                            {plan.outfitTitle}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] uppercase tracking-wider text-[#8C8275] truncate">
                              {OCCASIONS_DATA[plan.occasion]?.name.split(' ')[0] || plan.occasion}
                            </span>
                            {plan.worn && (
                              <span className="text-[9px] text-[#2E6B4F] font-semibold">✓</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPlanModal(cell.dateStr);
                            }}
                            className="text-[9px] text-[#8C8275] hover:text-[#141413] flex items-center gap-0.5"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-xs text-[#7A7369] pt-4 border-t border-[#F0EAE1]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C19A6B]" />
                    <span>Scheduled Look</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E6B4F]" />
                    <span>Marked as Worn</span>
                  </div>
                </div>
                <span>Click any date to inspect or schedule</span>
              </div>
            </div>
          ) : (
            /* Upcoming 7-Day Agenda View */
            <div className="bg-white rounded-xs border border-[#E8DFC8] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif text-[#141413]">
                  Upcoming 7-Day Agenda
                </h3>
                <p className="text-xs text-[#7A7369] mt-0.5">
                  Chronological schedule starting today
                </p>
              </div>

              <div className="space-y-3">
                {upcomingSevenDays.map((dayItem, idx) => {
                  const isToday = idx === 0;
                  const dayName = dayItem.dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

                  return (
                    <div
                      key={dayItem.dateStr}
                      onClick={() => setSelectedDayDate(dayItem.dateStr)}
                      className={`p-4 rounded-xs border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedDayDate === dayItem.dateStr
                          ? 'border-[#141413] bg-[#FAF8F5] ring-1 ring-[#141413]/10'
                          : 'border-[#EAE2D5] bg-white hover:bg-[#FBF9F5]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 text-left shrink-0">
                          <span className={`text-xs uppercase font-semibold block ${isToday ? 'text-[#C19A6B]' : 'text-[#8C8275]'}`}>
                            {isToday ? 'Today' : dayName.split(' ')[0]}
                          </span>
                          <span className="text-sm font-mono font-medium text-[#141413]">
                            {dayName.split(' ').slice(1).join(' ')}
                          </span>
                        </div>

                        {dayItem.plan ? (
                          <div>
                            <div className="font-semibold text-sm text-[#141413] flex items-center gap-2">
                              <span>{dayItem.plan.outfitTitle}</span>
                              {dayItem.plan.worn && (
                                <span className="text-[10px] text-[#2E6B4F] bg-[#E8F5E9] px-2 py-0.5 rounded-xs font-semibold">
                                  Worn
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#7A7369] flex items-center gap-2 mt-0.5">
                              <span>{OCCASIONS_DATA[dayItem.plan.occasion]?.name}</span>
                              {dayItem.plan.notes && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="italic truncate max-w-xs">{dayItem.plan.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-[#8C8275] italic">
                            No outfit planned for this date
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {dayItem.plan ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWorn(dayItem.plan!.id);
                              }}
                              className={`px-3 py-1.5 text-xs font-medium rounded-xs border transition-colors ${
                                dayItem.plan.worn
                                  ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2E6B4F]'
                                  : 'bg-white border-[#D9CFC4] text-[#5A554E] hover:text-[#141413]'
                              }`}
                            >
                              {dayItem.plan.worn ? '✓ Worn' : 'Mark Worn'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPlanModal(dayItem.dateStr, dayItem.plan);
                              }}
                              className="p-1.5 text-[#7A7369] hover:text-[#141413] border border-[#E5DACD] rounded-xs"
                              title="Edit outfit plan"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPlanModal(dayItem.dateStr);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs"
                          >
                            Plan Look
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Selected Day Inspector & Detail Card (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-xs border border-[#E8DFC8] shadow-xs space-y-6">
          <div className="border-b border-[#F0EAE1] pb-4">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8275] font-semibold block">
              Day Inspector
            </span>
            <h3 className="text-xl font-serif text-[#141413] mt-0.5">
              {new Date(selectedDayDate + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
          </div>

          {selectedDayPlan ? (
            <div className="space-y-6">
              {/* Plan Title & Occasion */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8C8275] uppercase tracking-wider font-semibold">
                    {OCCASIONS_DATA[selectedDayPlan.occasion]?.name}
                  </span>
                  <button
                    onClick={() => handleToggleWorn(selectedDayPlan.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xs transition-colors ${
                      selectedDayPlan.worn
                        ? 'bg-[#E8F5E9] text-[#2E6B4F] border border-[#A5D6A7]'
                        : 'bg-[#FAF8F5] text-[#5A554E] hover:text-[#141413] border border-[#E2D8CC]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{selectedDayPlan.worn ? 'Worn' : 'Mark as Worn'}</span>
                  </button>
                </div>

                <h4 className="text-lg font-serif font-medium text-[#141413]">
                  {selectedDayPlan.outfitTitle}
                </h4>

                {/* Color swatches */}
                <div className="flex items-center gap-1.5 pt-1">
                  {selectedDayPlan.colorHexes.map((hex, hIdx) => (
                    <span
                      key={hIdx}
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* Pieces Breakdown */}
              <div className="space-y-3 pt-3 border-t border-[#F0EAE1]">
                <div className="text-xs uppercase tracking-wider font-semibold text-[#141413]">
                  Scheduled Pieces ({selectedDayPlan.pieces.length})
                </div>

                <div className="space-y-2">
                  {selectedDayPlan.pieces.map((piece, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 bg-[#FAF8F5] rounded-xs border border-[#E8DFC8] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: piece.colorHex }}
                        />
                        <div className="truncate">
                          <span className="font-medium text-[#141413] block truncate">
                            {piece.name}
                          </span>
                          <span className="text-[10px] text-[#7A7369]">
                            {piece.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Notes */}
              {selectedDayPlan.notes && (
                <div className="p-3 bg-[#F5EFE6] border border-[#E2D8CC] rounded-xs text-xs space-y-1">
                  <span className="font-semibold text-[#8C4A2F] uppercase tracking-wider text-[10px]">
                    Occasion Notes
                  </span>
                  <p className="text-[#4A4742] italic">
                    "{selectedDayPlan.notes}"
                  </p>
                </div>
              )}

              {/* Card Actions: Edit, Delete, or Switch */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#F0EAE1]">
                <button
                  onClick={() => handleOpenPlanModal(selectedDayDate, selectedDayPlan)}
                  className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-[#141413] bg-[#FAF8F5] hover:bg-[#EAE2D5] border border-[#D9CFC4] rounded-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Plan</span>
                </button>

                <button
                  onClick={() => handleDeletePlan(selectedDayPlan.id)}
                  className="p-2 text-[#7A7369] hover:text-[#A64B2A] border border-[#D9CFC4] hover:bg-[#FAF8F5] rounded-xs transition-colors"
                  title="Delete outfit plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Empty state for selected date */
            <div className="py-10 text-center space-y-4">
              <CalendarIcon className="w-8 h-8 mx-auto text-[#C2B4A3]" />
              <div>
                <p className="text-sm font-medium text-[#141413]">
                  No Look Scheduled
                </p>
                <p className="text-xs text-[#7A7369] mt-0.5">
                  Plan your ensemble from recommendations or favorites.
                </p>
              </div>

              <button
                onClick={() => handleOpenPlanModal(selectedDayDate)}
                className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs transition-colors shadow-2xs"
              >
                Plan Outfit for This Day
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Plan / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs border border-[#E8DFC8] w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-4">
              <h3 className="text-xl font-serif text-[#141413]">
                {editingPlan ? 'Edit Scheduled Ensemble' : 'Schedule Outfit for Date'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#7A7369] hover:text-[#141413]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-5">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-medium text-[#5A554E] mb-1">
                  Target Date *
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D9CFC4] rounded-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
                />
              </div>

              {/* Quick Pick: From Saved Favorites or Staples */}
              {favorites.length > 0 && (
                <div className="p-3 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xs space-y-2">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[#8C8275] flex items-center gap-1.5">
                    <Heart className="w-3 h-3" />
                    <span>Quick-Select From Saved Favorites ({favorites.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {favorites.map((fav) => (
                      <button
                        key={fav.id}
                        type="button"
                        onClick={() => handleSelectFavoriteForForm(fav)}
                        className="px-2.5 py-1 text-[11px] bg-white border border-[#E2D8CC] hover:bg-[#F2ECE1] rounded-xs text-[#383531] text-left truncate max-w-[240px]"
                      >
                        {fav.outfit.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-[#5A554E] mb-1">
                  Outfit Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Camel Trench & Midnight Wool Trousers"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D9CFC4] rounded-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
                />
              </div>

              {/* Occasion Selection */}
              <div>
                <label className="block text-xs font-medium text-[#5A554E] mb-1">
                  Target Occasion
                </label>
                <select
                  value={formOccasion}
                  onChange={(e) => setFormOccasion(e.target.value as Occasion)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D9CFC4] rounded-xs text-[#141413]"
                >
                  {(Object.keys(OCCASIONS_DATA) as Occasion[]).map(occ => (
                    <option key={occ} value={occ}>
                      {OCCASIONS_DATA[occ].name} ({OCCASIONS_DATA[occ].formalityLevel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-[#5A554E] mb-1">
                  Styling Notes / Agenda Context
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g., Morning board presentation, team luncheon, wear comfortable slingbacks."
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D9CFC4] rounded-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
                />
              </div>

              {/* Live Repetition Warning Callout */}
              {repetitionWarning.isRepeated && (
                <div className="p-3 bg-[#FFF8E7] border border-[#E6C687] rounded-xs text-xs text-[#8A5A00] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#C19A6B]" />
                    <span>Rotation Alert: High Wear Frequency</span>
                  </div>
                  <p className="leading-relaxed">
                    {repetitionWarning.message}
                  </p>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-[#FBF0EA] border border-[#EAC1AF] rounded-xs text-xs text-[#9C381E]">
                  {formError}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F0EAE1]">
                {editingPlan ? (
                  <button
                    type="button"
                    onClick={() => handleDeletePlan(editingPlan.id)}
                    className="text-xs text-[#A64B2A] hover:underline"
                  >
                    Delete Plan
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#5A554E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs shadow-xs"
                  >
                    {editingPlan ? 'Update Plan' : 'Save Plan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
