import React from 'react';
import { Menu, X } from 'lucide-react';

export type NavTab = 'stylist' | 'weather' | 'calendar' | 'color_lab' | 'wardrobe' | 'favorites';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  favoritesCount: number;
  wardrobeCount: number;
  calendarPlansCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  wardrobeCount,
  calendarPlansCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8E2D9] no-print">
      {/* Strict 3-zone top bar contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6 lg:gap-8">
        {/* Zone 1: Brand wordmark & sophisticated monogram emblem */}
        <button
          onClick={() => handleNavClick('stylist')}
          className="flex items-center gap-2.5 group text-left focus:outline-hidden shrink-0"
          aria-label="StyleSense Home"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xs bg-[#141413] text-[#FAF7F2] flex items-center justify-center p-1.5 shadow-2xs group-hover:bg-[#2B2926] transition-colors shrink-0">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#F5EFE6]"
              aria-hidden="true"
            >
              {/* Outer delicate geometric atelier frame */}
              <rect
                x="2.5"
                y="2.5"
                width="31"
                height="31"
                rx="1"
                stroke="currentColor"
                strokeWidth="1"
                strokeOpacity="0.4"
              />
              {/* Couture intertwined S monogram ribbon curves */}
              <path
                d="M23 10.5C21.8 9.5 20 9 18 9C14.2 9 12 11.2 12 14C12 18.2 24 17.5 24 22C24 25 21.6 27 18 27C15.2 27 13.2 25.8 12.2 24.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Sartorial needle/accent diamond */}
              <path
                d="M18 15.5L19.2 18L18 20.5L16.8 18L18 15.5Z"
                fill="currentColor"
                fillOpacity="0.85"
              />
            </svg>
          </div>
          <span className="text-2xl sm:text-3xl font-serif tracking-tight text-[#141413] group-hover:text-[#524B42] transition-colors whitespace-nowrap">
            StyleSense
          </span>
        </button>

        {/* Zone 2: Concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs xl:text-sm font-medium text-[#4A4742]">
          <button
            onClick={() => handleNavClick('stylist')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 relative ${
              activeTab === 'stylist' ? 'text-[#141413] font-semibold' : 'hover:text-[#141413]'
            }`}
          >
            Stylist Studio
            {activeTab === 'stylist' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#141413]" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('weather')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 relative ${
              activeTab === 'weather' ? 'text-[#141413] font-semibold' : 'hover:text-[#141413]'
            }`}
          >
            Weather Stylist
            {activeTab === 'weather' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#141413]" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('calendar')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 relative ${
              activeTab === 'calendar' ? 'text-[#141413] font-semibold' : 'hover:text-[#141413]'
            }`}
          >
            Outfit Calendar
            {activeTab === 'calendar' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#141413]" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('color_lab')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 relative ${
              activeTab === 'color_lab' ? 'text-[#141413] font-semibold' : 'hover:text-[#141413]'
            }`}
          >
            Color Studio
            {activeTab === 'color_lab' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#141413]" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('wardrobe')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 relative ${
              activeTab === 'wardrobe' ? 'text-[#141413] font-semibold' : 'hover:text-[#141413]'
            }`}
          >
            Wardrobe ({wardrobeCount})
            {activeTab === 'wardrobe' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#141413]" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('favorites')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 relative ${
              activeTab === 'favorites' ? 'text-[#141413] font-semibold' : 'hover:text-[#141413]'
            }`}
          >
            Saved ({favoritesCount})
            {activeTab === 'favorites' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#141413]" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('stylist')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-xs tracking-wider uppercase font-semibold text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs transition-colors whitespace-nowrap shadow-xs"
          >
            Style My Outfit
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#141413] hover:bg-[#F0EAE1] rounded-xs transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E2D9] bg-[#FAF7F2] px-4 pt-3 pb-6 space-y-1.5">
          <button
            onClick={() => handleNavClick('stylist')}
            className={`block w-full text-left py-2.5 px-3 rounded-xs text-sm font-medium ${
              activeTab === 'stylist' ? 'bg-[#EFE9DF] text-[#141413] font-semibold' : 'text-[#4A4742]'
            }`}
          >
            Stylist Studio
          </button>

          <button
            onClick={() => handleNavClick('weather')}
            className={`block w-full text-left py-2.5 px-3 rounded-xs text-sm font-medium ${
              activeTab === 'weather' ? 'bg-[#EFE9DF] text-[#141413] font-semibold' : 'text-[#4A4742]'
            }`}
          >
            Weather Stylist
          </button>

          <button
            onClick={() => handleNavClick('calendar')}
            className={`block w-full text-left py-2.5 px-3 rounded-xs text-sm font-medium ${
              activeTab === 'calendar' ? 'bg-[#EFE9DF] text-[#141413] font-semibold' : 'text-[#4A4742]'
            }`}
          >
            Outfit Calendar
          </button>

          <button
            onClick={() => handleNavClick('color_lab')}
            className={`block w-full text-left py-2.5 px-3 rounded-xs text-sm font-medium ${
              activeTab === 'color_lab' ? 'bg-[#EFE9DF] text-[#141413] font-semibold' : 'text-[#4A4742]'
            }`}
          >
            Color Studio
          </button>

          <button
            onClick={() => handleNavClick('wardrobe')}
            className={`block w-full text-left py-2.5 px-3 rounded-xs text-sm font-medium ${
              activeTab === 'wardrobe' ? 'bg-[#EFE9DF] text-[#141413] font-semibold' : 'text-[#4A4742]'
            }`}
          >
            Wardrobe Capsule ({wardrobeCount})
          </button>

          <button
            onClick={() => handleNavClick('favorites')}
            className={`block w-full text-left py-2.5 px-3 rounded-xs text-sm font-medium ${
              activeTab === 'favorites' ? 'bg-[#EFE9DF] text-[#141413] font-semibold' : 'text-[#4A4742]'
            }`}
          >
            Saved Looks ({favoritesCount})
          </button>

          <div className="pt-2">
            <button
              onClick={() => handleNavClick('stylist')}
              className="w-full py-3 text-center text-xs tracking-wider uppercase font-semibold text-white bg-[#141413] rounded-xs"
            >
              Style My Outfit
            </button>
          </div>
        </div>
      )}
    </header>
  );
};