import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { NavTab } from './Navbar';

interface FooterProps {
  onNavigate: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#E8E2D9] bg-[#FAF7F2] py-12 text-[#5A554E] no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#E8E2D9]">
          <div>
            <div className="text-2xl font-serif text-[#141413] tracking-tight">
              StyleSense
            </div>
            <p className="text-xs text-[#7A7369] mt-1 max-w-sm font-light">
              Intelligent outfit curation, weather-aware styling, personalized recommendations, and timeless color harmony.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#4A4742]">
            <button
              type="button"
              id="footer-style-recommendation"
              aria-label="Style Recommendation"
              onClick={() => onNavigate('stylist')}
              className="hover:text-[#141413] transition-colors cursor-pointer"
            >
              Style Recommendation
            </button>
            <button
              onClick={() => onNavigate('weather')}
              className="hover:text-[#141413] transition-colors"
            >
              Weather Stylist
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="hover:text-[#141413] transition-colors"
            >
              Outfit Calendar
            </button>
            <button
              onClick={() => onNavigate('color_lab')}
              className="hover:text-[#141413] transition-colors"
            >
              Color Studio
            </button>
            <button
              onClick={() => onNavigate('wardrobe')}
              className="hover:text-[#141413] transition-colors"
            >
              Wardrobe Capsule
            </button>
            <button
              onClick={() => onNavigate('favorites')}
              className="hover:text-[#141413] transition-colors"
            >
              Saved Lookbook
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A7369]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8C8275]" />
            <span>Zero Cloud Dependence · 100% Client-Side Sartorial Rules and LocalStorage</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Crafted for high sartorial standards</span>
            <span aria-hidden="true">·</span>
            <span>StyleSense © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
