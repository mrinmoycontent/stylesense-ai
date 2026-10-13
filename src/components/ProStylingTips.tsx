import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Compass,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Palette,
  Footprints,
  Info,
  Maximize2,
  Minimize2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Season, Occasion } from '../types';
import {
  getProStylingTip,
  SEASONS_INFO,
  ProStylingTip
} from '../data/proStylingTips';
import { OCCASIONS_DATA } from '../data/fashionData';

interface ProStylingTipsProps {
  currentSeason: Season;
  currentOccasion: Occasion;
  onSeasonChange: (season: Season) => void;
  onOccasionChange: (occasion: Occasion) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const SEASONS_LIST: { id: Season; label: string; icon: string }[] = [
  { id: 'spring', label: 'Spring', icon: '🌸' },
  { id: 'summer', label: 'Summer', icon: '☀️' },
  { id: 'autumn', label: 'Autumn', icon: '🍂' },
  { id: 'winter', label: 'Winter', icon: '❄️' }
];

export const OCCASIONS_LIST: { id: Occasion; label: string }[] = [
  { id: 'casual', label: 'Casual' },
  { id: 'office', label: 'Office' },
  { id: 'party', label: 'Party' },
  { id: 'date_night', label: 'Date Night' },
  { id: 'wedding_guest', label: 'Wedding' }
];

/**
 * Editorial Pro-Styling Tips Sidebar Component
 * Dynamically displays sartorial guidance, layering blueprints, fabric rules,
 * color harmonies, and footwear advice based on the selected Season and Occasion.
 */
export const ProStylingTipsSidebar: React.FC<ProStylingTipsProps> = ({
  currentSeason,
  currentOccasion,
  onSeasonChange,
  onOccasionChange,
  className = '',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeSubTab, setActiveSubTab] = useState<'blueprint' | 'fabrics' | 'palette' | 'checklist'>('blueprint');

  const tip: ProStylingTip = getProStylingTip(currentSeason, currentOccasion);
  const seasonInfo = SEASONS_INFO[currentSeason];
  const occasionData = OCCASIONS_DATA[currentOccasion];

  return (
    <aside
      aria-label="Pro-Styling Tips Sidebar"
      className={`bg-white border border-[#E8DFC8] rounded-xs shadow-xs transition-all overflow-hidden ${className}`}
    >
      {/* Editorial Header */}
      <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E8DFC8]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xs bg-[#141413] text-[#FAF8F5] flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-[#C19A6B]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8C8275] font-semibold">
                <span>Atelier Insights</span>
                <span aria-hidden="true">·</span>
                <span>Pro-Styling Rules</span>
              </div>
              <h3 className="text-base font-serif font-medium text-[#141413]">
                Pro-Styling Tips
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-[#5A554E] hover:text-[#141413] hover:bg-[#EFE9DF] rounded-xs transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse Tips' : 'Expand Tips'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic Context Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5A554E] mt-3 pt-2.5 border-t border-[#E8DFC8]/60 flex-wrap">
          <span className="font-medium text-[#141413]">
            {seasonInfo.name} Season
          </span>
          <span aria-hidden="true" className="text-[#8C8275]">·</span>
          <span>{occasionData.name}</span>
          <span aria-hidden="true" className="text-[#8C8275]">·</span>
          <span className="text-[11px] text-[#8C8275] italic truncate">
            {occasionData.formalityLevel}
          </span>
        </div>
      </div>

      {/* Collapsible Content Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Quick Season & Occasion Switchers */}
          <div className="space-y-3 pb-3 border-b border-[#F0EAE1]">
            {/* Season Selector Tabs */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#8C8275] mb-1.5">
                Calibrate Season
              </label>
              <div className="grid grid-cols-4 gap-1">
                {SEASONS_LIST.map((s) => {
                  const isSelected = currentSeason === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onSeasonChange(s.id)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-xs border transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'border-[#141413] bg-[#141413] text-white font-semibold shadow-2xs'
                          : 'border-[#D9CFC4] bg-[#FAF8F5] text-[#4A4742] hover:bg-[#F2EDE4]'
                      }`}
                    >
                      <span className="text-xs" aria-hidden="true">{s.icon}</span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Occasion Selector Tabs */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#8C8275] mb-1.5">
                Target Occasion
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                {OCCASIONS_LIST.map((o) => {
                  const isSelected = currentOccasion === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => onOccasionChange(o.id)}
                      className={`py-1.5 px-1.5 text-[11px] font-medium rounded-xs border transition-all text-center truncate cursor-pointer ${
                        isSelected
                          ? 'border-[#141413] bg-[#141413] text-white font-semibold shadow-2xs'
                          : 'border-[#D9CFC4] bg-[#FAF8F5] text-[#4A4742] hover:bg-[#F2EDE4]'
                      }`}
                      title={o.label}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Core Golden Rule Hero Box */}
          <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DACD] rounded-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#9C4E2D] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#9C4E2D]" />
              <span>Sartorial Principle</span>
            </div>
            <h4 className="text-sm font-semibold text-[#141413] leading-snug">
              {tip.headline}
            </h4>
            <p className="text-xs text-[#3D3A34] leading-relaxed">
              {tip.goldenRule}
            </p>
          </div>

          {/* Internal Tab Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-[#F2EDE4] rounded-xs text-[11px] font-medium text-[#5A554E]">
            <button
              type="button"
              onClick={() => setActiveSubTab('blueprint')}
              className={`flex-1 py-1 rounded-xs transition-colors text-center cursor-pointer ${
                activeSubTab === 'blueprint' ? 'bg-white text-[#141413] font-semibold shadow-2xs' : 'hover:text-[#141413]'
              }`}
            >
              Blueprint
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('fabrics')}
              className={`flex-1 py-1 rounded-xs transition-colors text-center cursor-pointer ${
                activeSubTab === 'fabrics' ? 'bg-white text-[#141413] font-semibold shadow-2xs' : 'hover:text-[#141413]'
              }`}
            >
              Fabrics
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('palette')}
              className={`flex-1 py-1 rounded-xs transition-colors text-center cursor-pointer ${
                activeSubTab === 'palette' ? 'bg-white text-[#141413] font-semibold shadow-2xs' : 'hover:text-[#141413]'
              }`}
            >
              Palette
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('checklist')}
              className={`flex-1 py-1 rounded-xs transition-colors text-center cursor-pointer ${
                activeSubTab === 'checklist' ? 'bg-white text-[#141413] font-semibold shadow-2xs' : 'hover:text-[#141413]'
              }`}
            >
              Checklist
            </button>
          </div>

          {/* Sub-Tab 1: Layering & Silhouette Blueprint */}
          {activeSubTab === 'blueprint' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold block mb-1">
                  Stylist Mindset
                </span>
                <p className="text-[#4A4742] leading-relaxed">
                  {tip.mindset}
                </p>
              </div>

              <div className="pt-2 border-t border-[#F0EAE1]">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold mb-1">
                  <Layers className="w-3 h-3 text-[#141413]" />
                  <span>Layering & Silhouette Architecture</span>
                </div>
                <p className="text-[#3D3A34] bg-[#FAF8F5] p-2.5 rounded-xs border border-[#E8DFC8]/70">
                  {tip.layeringStrategy}
                </p>
              </div>

              <div className="pt-2 border-t border-[#F0EAE1]">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold mb-1">
                  <Footprints className="w-3 h-3 text-[#141413]" />
                  <span>Footwear Calibration</span>
                </div>
                <p className="text-[#4A4742]">
                  {tip.footwearGuidance}
                </p>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Fabrics & Weaves */}
          {activeSubTab === 'fabrics' && (
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#2E6B4F] font-bold mb-1.5">
                  <Check className="w-3 h-3" />
                  <span>Recommended Weaves & Materials</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tip.fabrics.recommended.map((fabric, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-xs bg-[#F2F7F2] text-[#285728] border border-[#D2E3D2] text-[11px]"
                    >
                      {fabric}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0EAE1]">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#9C381E] font-bold mb-1.5">
                  <X className="w-3 h-3" />
                  <span>Fabrics to Avoid</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tip.fabrics.avoid.map((fabric, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-xs bg-[#FBF0EA] text-[#9C381E] border border-[#EAC1AF] text-[11px]"
                    >
                      {fabric}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Seasonal Palette & Finishing Accents */}
          {activeSubTab === 'palette' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold mb-1">
                  <Palette className="w-3 h-3 text-[#141413]" />
                  <span>Harmonious Color Story</span>
                </div>
                <div className="p-2.5 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#141413]">
                    <span>Primary Anchor:</span>
                    <span className="font-normal text-[#4A4742]">{tip.colorPalette.primary}</span>
                  </div>
                  <div className="text-[11px] text-[#5A554E] flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-[#141413]">Accents:</span>
                    {tip.colorPalette.accents.join(' · ')}
                  </div>
                  <p className="text-[11px] text-[#7A7369] italic pt-1 border-t border-[#E8DFC8]/60">
                    {tip.colorPalette.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0EAE1]">
                <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold block mb-1.5">
                  Finishing Accents
                </span>
                <ul className="space-y-1.5 text-[#4A4742]">
                  {tip.finishingTouches.map((touch, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#C19A6B] font-bold">›</span>
                      <span>{touch}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: Quick Pro Checklist */}
          {activeSubTab === 'checklist' && (
            <div className="space-y-2.5 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold block mb-1">
                Before-You-Leave Checklist
              </span>
              <div className="space-y-2">
                {tip.quickChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xs flex items-start gap-2 text-[#3D3A34]"
                  >
                    <Check className="w-3.5 h-3.5 text-[#2E6B4F] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom editorial footnote */}
          <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-[11px] text-[#8C8275]">
            <span>Calibrated for {seasonInfo.name} · {occasionData.name}</span>
            <span className="font-mono text-[10px]">StyleSense Engine</span>
          </div>
        </div>
      )}
    </aside>
  );
};

interface ProStylingTipsHoverCardProps {
  currentSeason: Season;
  currentOccasion: Occasion;
  onSeasonChange: (season: Season) => void;
  onOccasionChange: (occasion: Occasion) => void;
  onOpenFullSidebar?: () => void;
}

/**
 * Editorial Hover-Card Trigger & Popover
 * Opens a luxurious, responsive card on hover (or click for touch devices)
 * displaying dynamic fashion advice based on the active Season and Occasion.
 */
export const ProStylingTipsHoverCard: React.FC<ProStylingTipsHoverCardProps> = ({
  currentSeason,
  currentOccasion,
  onSeasonChange,
  onOccasionChange,
  onOpenFullSidebar
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const tip = getProStylingTip(currentSeason, currentOccasion);
  const seasonInfo = SEASONS_INFO[currentSeason];
  const occasionData = OCCASIONS_DATA[currentOccasion];

  // Mouse hover handlers with delay to avoid accidental flickers
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id="pro-styling-tips-hover-button"
        data-testid="pro-styling-tips-hover-button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 text-xs font-medium rounded-xs border transition-all flex items-center gap-1.5 cursor-pointer ${
          isOpen
            ? 'bg-[#141413] text-white border-[#141413] shadow-xs'
            : 'bg-[#FAF8F5] text-[#141413] border-[#D9CFC4] hover:bg-[#F2EDE4]'
        }`}
        title="View Pro-Styling Tips for current Season & Occasion"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#C19A6B]" />
        <span className="font-semibold">Pro-Styling Tips</span>
        <span className="text-[11px] text-[#7A7369] hidden sm:inline">
          ({seasonInfo.name} · {occasionData.name})
        </span>
      </button>

      {/* Floating Hover Card Modal/Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Pro-Styling Fashion Advice"
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] bg-white border border-[#D9CFC4] rounded-xs shadow-xl z-50 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-[#F0EAE1] pb-3">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8C8275] font-semibold">
                <span>Atelier Advice</span>
                <span aria-hidden="true">·</span>
                <span>{seasonInfo.name}</span>
                <span aria-hidden="true">·</span>
                <span>{occasionData.name}</span>
              </div>
              <h4 className="text-base font-serif font-semibold text-[#141413] mt-0.5">
                {tip.headline}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#8C8275] hover:text-[#141413] rounded-xs transition-colors cursor-pointer"
              title="Close card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Season Switcher inside Hover-Card */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <span className="text-[10px] uppercase font-semibold text-[#8C8275]">Season:</span>
            <div className="flex items-center gap-1">
              {SEASONS_LIST.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSeasonChange(s.id)}
                  className={`px-2 py-0.5 rounded-xs border text-[10px] font-medium transition-colors cursor-pointer ${
                    currentSeason === s.id
                      ? 'bg-[#141413] text-white border-[#141413]'
                      : 'bg-[#FAF8F5] text-[#5A554E] border-[#E8DFC8] hover:bg-[#F2EDE4]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Golden Rule Highlight */}
          <div className="p-3 bg-[#FAF7F2] border border-[#E5DACD] rounded-xs space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-[#9C4E2D] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Core Rule</span>
            </div>
            <p className="text-xs text-[#2E2C29] leading-relaxed">
              {tip.goldenRule}
            </p>
          </div>

          {/* Layering & Footwear Digest */}
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold block mb-0.5">
                Layering Strategy:
              </span>
              <p className="text-[#4A4742] bg-[#FAF8F5] p-2 rounded-xs border border-[#E8DFC8]">
                {tip.layeringStrategy}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 bg-[#F2F7F2] border border-[#D2E3D2] rounded-xs">
                <span className="text-[9px] uppercase tracking-wider text-[#285728] font-bold block mb-1">
                  Key Fabrics
                </span>
                <p className="text-[11px] text-[#285728] leading-tight">
                  {tip.fabrics.recommended.slice(0, 2).join(', ')}
                </p>
              </div>

              <div className="p-2 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xs">
                <span className="text-[9px] uppercase tracking-wider text-[#8C8275] font-bold block mb-1">
                  Footwear
                </span>
                <p className="text-[11px] text-[#4A4742] leading-tight truncate" title={tip.footwearGuidance}>
                  {tip.footwearGuidance}
                </p>
              </div>
            </div>
          </div>

          {/* Color & Accent summary */}
          <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-xs text-[#5A554E]">
            <span className="text-[11px]">
              Palette: <strong className="text-[#141413]">{tip.colorPalette.primary}</strong>
            </span>
            {onOpenFullSidebar && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullSidebar();
                }}
                className="text-[11px] text-[#9C4E2D] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>View Full Atelier Sidebar</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
