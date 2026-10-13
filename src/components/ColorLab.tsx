import React, { useState } from 'react';
import { Palette, Check, Sparkles, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { FASHION_COLORS } from '../data/fashionData';
import { FashionColor } from '../types';

interface ColorLabProps {
  currentColor?: FashionColor;
  onStyleWithColor: (color: FashionColor) => void;
}

export const ColorLab: React.FC<ColorLabProps> = ({
  currentColor,
  onStyleWithColor
}) => {
  const [selectedColor, setSelectedColor] = useState<FashionColor>(
    currentColor || FASHION_COLORS[0]
  );

  React.useEffect(() => {
    if (currentColor) {
      setSelectedColor(currentColor);
    }
  }, [currentColor]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C8275] font-semibold mb-1">
          <span>Chromatic Atelier</span>
          <span aria-hidden="true">·</span>
          <span>Sartorial Color Theory</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-[#141413]">
          Color Harmony Studio
        </h2>
        <p className="text-sm sm:text-base text-[#5A554E] mt-1 max-w-2xl font-light">
          Master complementary pairings, tonal layering, and the classic 60-30-10 distribution rule to create balanced, cohesive outfits.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Palette Selector & Active Swatch Focus (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xs border border-[#E8DFC8] shadow-xs space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#141413] mb-3">
              Select Anchor Color
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {FASHION_COLORS.map((col) => {
                const isSelected = selectedColor.id === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => setSelectedColor(col)}
                    className={`relative aspect-square rounded-xs p-1 flex items-center justify-center transition-transform ${
                      isSelected ? 'ring-2 ring-[#141413] scale-105' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={`${col.name} (${col.family})`}
                  >
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 ${
                          col.hex === '#F7F4EE' || col.hex === '#DEC1B9' || col.hex === '#A5C4D4'
                            ? 'text-[#141413]'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Color Focus Card */}
          <div className="p-6 bg-[#FAF8F5] rounded-xs border border-[#E5DACD] space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xs border border-black/15 shadow-inner shrink-0"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#8C8275] font-semibold">
                  {selectedColor.family} · {selectedColor.undertone} undertone
                </span>
                <h3 className="text-xl font-serif text-[#141413] font-medium">
                  {selectedColor.name}
                </h3>
                <span className="text-xs font-mono text-[#7A7369]">
                  {selectedColor.hex}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#524E48] leading-relaxed italic border-t border-[#E8E0D5] pt-3">
              "{selectedColor.stylingAdvice}"
            </p>

            <button
              onClick={() => onStyleWithColor(selectedColor)}
              className="w-full py-3 text-xs tracking-wider uppercase font-semibold text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Style Outfits With This Color</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Undertone & Jewelry Metal Advice */}
          <div className="p-4 bg-[#F5EFE6] rounded-xs border border-[#E2D8CC] text-xs space-y-2">
            <div className="font-semibold text-[#141413] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8C8275]" />
              <span>Metal Finish Harmony</span>
            </div>
            <p className="text-[#5A554E]">
              {selectedColor.undertone === 'warm'
                ? 'Warm undertones radiate best against polished 18K Yellow Gold and warm cognac leathers.'
                : selectedColor.undertone === 'cool'
                ? 'Cool undertones are elevated by Sterling Silver, White Gold, and gunmetal finishes.'
                : 'Neutral undertones enjoy the freedom to wear mixed metals and two-tone jewelry.'}
            </p>
          </div>
        </div>

        {/* Right Column: Harmony Explorations & The 60-30-10 Rule (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Complementary Contrast Section */}
          <div className="bg-white p-6 sm:p-8 rounded-xs border border-[#E8DFC8] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#8C8275] font-semibold">
                  Dynamic Harmony
                </span>
                <h4 className="text-lg font-serif text-[#141413]">
                  Complementary Contrast
                </h4>
              </div>
              <span className="text-xs text-[#7A7369]">Direct Color Wheel Opposite</span>
            </div>

            <p className="text-xs text-[#5A554E]">
              Opposite colors create instant focal points. When paired, each makes the other appear richer and more vibrant. Use one as the dominant foundation (e.g. trench or trousers) and the other as a deliberate accent.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#FAF8F5] rounded-xs border border-[#E5DACD] flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xs border border-black/15 shadow-2xs shrink-0"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <div>
                  <div className="text-xs font-semibold text-[#141413]">
                    {selectedColor.name}
                  </div>
                  <div className="text-[11px] text-[#8C8275]">Core Anchor (60%)</div>
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-xs border border-[#E5DACD] flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xs border border-black/15 shadow-2xs shrink-0"
                  style={{ backgroundColor: selectedColor.complementaryHex }}
                />
                <div>
                  <div className="text-xs font-semibold text-[#141413]">
                    Complementary Pair
                  </div>
                  <div className="text-[11px] text-[#8C8275] font-mono">
                    {selectedColor.complementaryHex}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analogous Harmony Section */}
          <div className="bg-white p-6 sm:p-8 rounded-xs border border-[#E8DFC8] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#8C8275] font-semibold">
                  Serene Harmony
                </span>
                <h4 className="text-lg font-serif text-[#141413]">
                  Analogous Tones (Adjacent Neighbors)
                </h4>
              </div>
              <span className="text-xs text-[#7A7369]">Subtle Transitions</span>
            </div>

            <p className="text-xs text-[#5A554E]">
              Analogous colors sit next to each other on the color wheel. They create serene, natural palettes found in high-end editorial styling, conveying effortless confidence.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-[#FAF8F5] rounded-xs border border-[#E5DACD] text-center space-y-1.5">
                <span
                  className="w-8 h-8 mx-auto rounded-xs border border-black/15 block"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <span className="text-[11px] font-semibold text-[#141413] block truncate">
                  Anchor
                </span>
              </div>

              {selectedColor.analogousHexes.map((hex, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#FAF8F5] rounded-xs border border-[#E5DACD] text-center space-y-1.5"
                >
                  <span
                    className="w-8 h-8 mx-auto rounded-xs border border-black/15 block"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[11px] text-[#7A7369] font-mono block">
                    {hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monochromatic Tonal Gradient */}
          <div className="bg-white p-6 sm:p-8 rounded-xs border border-[#E8DFC8] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#8C8275] font-semibold">
                  Quiet Luxury
                </span>
                <h4 className="text-lg font-serif text-[#141413]">
                  Monochromatic Gradient Spectrum
                </h4>
              </div>
              <span className="text-xs text-[#7A7369]">Tone-on-Tone</span>
            </div>

            <p className="text-xs text-[#5A554E]">
              Varying values of the same hue elongate your vertical silhouette. Pair lightweight sheer knits with heavy twill in adjacent shades for rich texture without color clash.
            </p>

            <div className="flex rounded-xs overflow-hidden border border-[#E5DACD] h-12 shadow-inner">
              {selectedColor.monochromaticHexes.map((hex, i) => (
                <div
                  key={i}
                  className="flex-1 flex items-center justify-center text-[10px] font-mono transition-transform hover:scale-105"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>

          {/* The 60-30-10 Rule Simulator */}
          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-xs border border-[#E5DACD] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8C8275]" />
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#141413]">
                  The 60-30-10 Rule in Fashion
                </h4>
              </div>
              <span className="text-xs text-[#8C8275] font-mono">Sartorial Formula</span>
            </div>

            <p className="text-xs text-[#524E48]">
              The golden ratio of color styling: <strong>60%</strong> covers your dominant silhouette (suit, overcoat, or dress), <strong>30%</strong> provides structural balance (trousers, blouse, or footwear), and <strong>10%</strong> commands intentional accent pop (jewelry, leather bag, or silk scarf).
            </p>

            {/* Visual ratio strip */}
            <div className="space-y-2">
              <div className="flex h-10 rounded-xs overflow-hidden border border-black/15 shadow-xs">
                <div
                  className="flex items-center justify-center text-xs font-semibold"
                  style={{
                    width: '60%',
                    backgroundColor: selectedColor.hex,
                    color: selectedColor.hex === '#F7F4EE' || selectedColor.hex === '#DEC1B9' ? '#141413' : '#FFF'
                  }}
                >
                  60% Dominant
                </div>
                <div
                  className="flex items-center justify-center text-xs font-semibold"
                  style={{
                    width: '30%',
                    backgroundColor: selectedColor.bestNeutrals[0] || '#161617',
                    color: '#FFF'
                  }}
                >
                  30% Secondary
                </div>
                <div
                  className="flex items-center justify-center text-xs font-semibold"
                  style={{
                    width: '10%',
                    backgroundColor: selectedColor.complementaryHex,
                    color: '#FFF'
                  }}
                >
                  10%
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-[#7A7369]">
                <span>Main: {selectedColor.name}</span>
                <span>Neutral: Structural Frame</span>
                <span>Accent: Intentional Focal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
