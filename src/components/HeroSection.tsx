import React from 'react';
import {
  ArrowRight,
  Calendar,
  CloudSun,
  Palette,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { GarmentVisual } from './GarmentVisual';
import { PRESET_GARMENTS, OCCASIONS_DATA } from '../data/fashionData';
import { CalendarOutfitPlan, GarmentPreset } from '../types';

interface HeroSectionProps {
  onStartStyling: () => void;
  onSelectPreset: (preset: GarmentPreset) => void;
  todayPlan?: CalendarOutfitPlan;
  upcomingPlans?: CalendarOutfitPlan[];
  onNavigateToCalendar: () => void;
  onNavigateToWeather: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartStyling,
  onSelectPreset,
  todayPlan,
  upcomingPlans = [],
  onNavigateToCalendar,
  onNavigateToWeather
}) => {
  return (
    <section className="relative overflow-hidden border-b border-[#E8E2D9] pt-12 pb-16 lg:py-20 bg-[#FAF7F2] no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Typographic Editorial Showcase */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#8C8275]">
              <span>Haute Sartorial Intelligence</span>
              <span aria-hidden="true">·</span>
              <span>Outfit Calendar and Weather Stylist</span>
              <span aria-hidden="true">·</span>
              <span>Local Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-[#141413] leading-[1.08] text-balance">
              The Architecture of Personal Style, Curated in Seconds.
            </h1>

            <p className="text-base sm:text-lg text-[#524E48] leading-relaxed max-w-2xl font-light">
              Transform any garment in your wardrobe into cohesive, occasion-perfect ensembles. StyleSense applies timeless proportion theory, color harmony principles, climate rules, and rotation scheduling—entirely within your browser.
            </p>

            {/* Primary Action Button & Quick Highlights */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                id="hero-style-recommendation"
                data-testid="hero-style-recommendation"
                aria-label="Style Recommendation"
                title="Style Recommendation"
                onClick={onStartStyling}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-xs tracking-wider uppercase font-semibold text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs transition-all shadow-md group cursor-pointer"
              >
                <span>Style Recommendation</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onNavigateToWeather}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-xs tracking-wider uppercase font-semibold text-[#141413] bg-white border border-[#D9CFC4] hover:bg-[#F2ECE1] rounded-xs transition-colors shadow-xs"
              >
                <CloudSun className="w-4 h-4 text-[#8C8275]" />
                <span>Weather Stylist</span>
              </button>
            </div>

            {/* Curated quick-start staples */}
            <div className="pt-6 border-t border-[#E8E2D9]">
              <p className="text-xs uppercase tracking-wider text-[#8C8275] font-medium mb-3">
                Or immediately test with iconic wardrobe staples:
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_GARMENTS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs text-[#383531] bg-white hover:bg-[#F2ECE1] border border-[#E2D8CC] rounded-xs transition-colors text-left"
                  >
                    <span
                      className="w-2 h-2 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: preset.colorHex }}
                    />
                    <span className="font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Composition / Today's Schedule Card */}
          <div className="lg:col-span-5">
            {todayPlan ? (
              /* If an outfit is scheduled for today, showcase it with pride! */
              <div className="relative bg-[#F4EFE7] p-6 sm:p-8 rounded-xs border border-[#E5DACD] shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#C19A6B] font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Today's Scheduled Ensemble
                    </span>
                    <h3 className="text-lg font-serif font-medium text-[#141413] mt-0.5">
                      {todayPlan.outfitTitle}
                    </h3>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-xs font-semibold ${
                    todayPlan.worn
                      ? 'bg-[#E8F5E9] text-[#2E6B4F]'
                      : 'bg-[#FAF8F5] text-[#8C8275] border border-[#E5DACD]'
                  }`}>
                    {todayPlan.worn ? '✓ Worn' : 'Scheduled'}
                  </span>
                </div>

                {/* Pieces Preview */}
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-[#7A7369]">
                    Planned Pieces ({todayPlan.pieces.length}) · {OCCASIONS_DATA[todayPlan.occasion]?.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {todayPlan.pieces.slice(0, 2).map((piece, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-white/80 rounded-xs border border-[#E5DACD] flex items-center gap-2"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: piece.colorHex }}
                        />
                        <span className="text-xs text-[#141413] truncate font-medium">
                          {piece.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {todayPlan.notes && (
                  <p className="text-xs text-[#5A554E] italic border-t border-[#E8E0D5] pt-3">
                    "{todayPlan.notes}"
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={onNavigateToCalendar}
                    className="text-xs font-semibold uppercase tracking-wider text-[#141413] hover:underline flex items-center gap-1"
                  >
                    <span>Open Outfit Calendar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    {todayPlan.colorHexes.map((hex, idx) => (
                      <span
                        key={idx}
                        className="w-3 h-3 rounded-full border border-black/10"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Daily Wardrobe & Studio Status Card */
              <div className="relative bg-[#F4EFE7] p-6 sm:p-8 rounded-xs border border-[#E5DACD] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#8C8275] font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C19A6B]" />
                      Wardrobe Schedule
                    </span>
                    <h3 className="text-lg font-serif font-medium text-[#141413] mt-0.5">
                      No Look Scheduled Today
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-xs font-semibold bg-[#FAF8F5] text-[#8C8275] border border-[#E5DACD]">
                    Ready to Style
                  </span>
                </div>

                <p className="text-xs text-[#5A554E] leading-relaxed">
                  Anchor your personal core pieces in the Virtual Atelier below. StyleSense calibrates 3 complete ensembles around your uploaded photo, local weather, and occasion requirements.
                </p>

                <div className="bg-white/80 p-3.5 rounded-xs border border-[#E5DACD] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#141413]">Personal Atelier Status:</span>
                    <span className="text-[#8C8275]">Active & Ready</span>
                  </div>
                  <div className="text-[11px] text-[#7A7369]">
                    Upload an item or pick a classic staple in the studio below to generate climate-calibrated recommendations.
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E0D5] flex items-center justify-between">
                  <button
                    onClick={onStartStyling}
                    className="text-xs font-semibold uppercase tracking-wider text-[#141413] hover:underline flex items-center gap-1"
                  >
                    <span>Curate Look Below</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={onNavigateToCalendar}
                    className="text-xs text-[#8C8275] hover:text-[#141413] flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Open Calendar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Schedule Horizon Bar */}
        {upcomingPlans.length > 0 && (
          <div className="pt-6 border-t border-[#E8E2D9]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8275] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Upcoming Scheduled Ensembles</span>
              </span>
              <button
                onClick={onNavigateToCalendar}
                className="text-xs text-[#141413] hover:underline font-medium"
              >
                View Full Calendar →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {upcomingPlans.slice(0, 3).map((plan) => {
                const planDate = new Date(plan.date + 'T00:00:00');
                const dayLabel = planDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

                return (
                  <div
                    key={plan.id}
                    onClick={onNavigateToCalendar}
                    className="p-4 bg-white rounded-xs border border-[#E8DFC8] hover:border-[#141413] transition-colors cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-semibold text-[#C19A6B] block">
                        {dayLabel}
                      </span>
                      <h4 className="text-xs font-semibold text-[#141413] truncate">
                        {plan.outfitTitle}
                      </h4>
                      <span className="text-[10px] text-[#7A7369]">
                        {OCCASIONS_DATA[plan.occasion]?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {plan.colorHexes.slice(0, 2).map((hex, i) => (
                        <span
                          key={i}
                          className="w-2.5 h-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
