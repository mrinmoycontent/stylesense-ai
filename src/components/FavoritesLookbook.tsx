import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import {
  Heart,
  Trash2,
  Copy,
  Check,
  Printer,
  Edit3,
  Save,
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
  ArrowLeft,
  X,
  Palette,
  Eye
} from 'lucide-react';
import { FavoriteLook } from '../types';
import { OCCASIONS_DATA } from '../data/fashionData';
import {
  removeFavoriteLook,
  updateFavoriteNotes
} from '../services/wardrobeStorage';
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

interface FavoritesLookbookProps {
  favorites: FavoriteLook[];
  onFavoritesUpdated: (newFavs: FavoriteLook[]) => void;
  onNavigateToStylist: () => void;
}

export const FavoritesLookbook: React.FC<FavoritesLookbookProps> = ({
  favorites,
  onFavoritesUpdated,
  onNavigateToStylist
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notesBuffer, setNotesBuffer] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPrintView, setIsPrintView] = useState<boolean>(false);
  const [printLayout, setPrintLayout] = useState<'dossier' | 'compact'>('dossier');
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  // Handle ESC key to exit print view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPrintView) {
        setIsPrintView(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPrintView]);

  const handleStartEditing = (fav: FavoriteLook) => {
    setEditingId(fav.id);
    setNotesBuffer(fav.userNotes || '');
  };

  const handleSaveNotes = (id: string) => {
    const updated = updateFavoriteNotes(id, notesBuffer);
    onFavoritesUpdated(updated);
    setEditingId(null);
  };

  const handleDeleteLook = (id: string) => {
    const updated = removeFavoriteLook(id);
    onFavoritesUpdated(updated);
  };

  const handleCopyRecipe = (look: FavoriteLook) => {
    const outfit = look.outfit;
    const text = `StyleSense Saved Look: ${outfit.title} (${outfit.subtitle})
Occasion: ${OCCASIONS_DATA[outfit.occasion]?.name || outfit.occasion}
Aesthetic: ${outfit.aesthetic}
Core Piece: ${outfit.corePieceName} (${outfit.corePieceColor})
Ensemble Pieces:
${outfit.pieces.map((p) => `• [${p.role}] ${p.name} (${p.colorName}) - ${p.stylingTip}`).join('\n')}
Metal: ${outfit.recommendedMetal}
Stylist Rule: ${outfit.proStylistRule}
Personal Notes: ${look.userNotes || 'None'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(look.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleTriggerPrint = () => {
    // Helpful message if empty instead of opening a blank print document
    if (!favorites || favorites.length === 0) {
      setPrintFeedback('Your lookbook has no saved outfits to print. Please generate and save an outfit recommendation first.');
      setTimeout(() => setPrintFeedback(null), 4500);
      return;
    }

    const wasInStandardView = !isPrintView;

    // If printing from Standard View, configure automatic cleanup once print dialog completes or is dismissed
    if (wasInStandardView) {
      let isRestored = false;
      const restoreNormalView = () => {
        if (!isRestored) {
          isRestored = true;
          setIsPrintView(false);
          window.removeEventListener('afterprint', restoreNormalView);
          window.removeEventListener('focus', handleFocusRestore);
        }
      };

      const handleFocusRestore = () => {
        // Fallback restoration in browsers where afterprint might not trigger
        setTimeout(restoreNormalView, 500);
      };

      window.addEventListener('afterprint', restoreNormalView, { once: true });
      window.addEventListener('focus', handleFocusRestore, { once: true });

      // Synchronously flush state to ensure dedicated print-friendly view is rendered in the DOM
      try {
        flushSync(() => {
          setIsPrintView(true);
        });
      } catch (flushErr) {
        console.warn('flushSync failed, falling back to direct print:', flushErr);
      }
    }

    // Direct synchronous call to window.print() inside the user's click gesture context
    try {
      window.print();
    } catch (err) {
      console.error('Print dialog invocation failed:', err);
      setPrintFeedback('Unable to open print dialog. Please press Ctrl+P / Cmd+P to print or save as PDF.');
      setTimeout(() => setPrintFeedback(null), 5000);
      if (wasInStandardView) {
        setIsPrintView(false);
      }
    }
  };

  // --------------------------------------------------------------------------
  // PRINT-FRIENDLY VIEW MODE
  // Strips away navigation, heavy backgrounds, and shadows for clean PDF export
  // --------------------------------------------------------------------------
  if (isPrintView) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto text-black print-modal-container">
        {/* On-screen Print Utility Bar (hidden in PDF output via no-print) */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 no-print shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="exit-print-view-button"
              onClick={() => {
                setIsPrintView(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:text-black border border-neutral-300 hover:bg-neutral-50 rounded-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Standard Lookbook</span>
            </button>

            <span className="text-xs text-neutral-300 hidden sm:inline" aria-hidden="true">|</span>

            <span className="text-xs text-neutral-600 hidden sm:inline">
              Print-Friendly View Mode · <strong className="text-black font-semibold">{favorites.length}</strong> {favorites.length === 1 ? 'Ensemble' : 'Ensembles'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Layout Mode Selector */}
            <div className="inline-flex items-center p-0.5 bg-neutral-100 rounded-xs text-xs font-medium border border-neutral-200">
              <button
                type="button"
                onClick={() => setPrintLayout('dossier')}
                className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                  printLayout === 'dossier'
                    ? 'bg-white text-black font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Editorial Dossier
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout('compact')}
                className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                  printLayout === 'compact'
                    ? 'bg-white text-black font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Compact Table
              </button>
            </div>

            {/* Print Action Button */}
            <button
              type="button"
              id="print-pdf-button"
              data-testid="print-pdf-button"
              onClick={handleTriggerPrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-xs transition-colors shadow-xs cursor-pointer"
              title="Open browser print dialog to print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT / PDF</span>
            </button>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => {
                setIsPrintView(false);
              }}
              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-xs transition-colors cursor-pointer"
              title="Close print view (Esc)"
              aria-label="Close print view"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimalist PDF-Ready Document Content */}
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10 space-y-10">
          {/* Document Masthead */}
          <header className="border-b-2 border-black pb-6 space-y-2.5 print-break-inside-avoid">
            <div className="flex items-center justify-between text-[11px] tracking-widest uppercase font-mono text-neutral-500">
              <span>StyleSense Atelier Dossier</span>
              <span>Personal Style Formula</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h1 className="text-3xl sm:text-4xl font-serif text-black tracking-tight">
                Curated Lookbook Summary
              </h1>
              <div className="text-xs text-neutral-600 font-mono">
                {new Date().toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600 pt-1">
              <span>
                Archived Looks: <strong className="text-black font-semibold">{favorites.length}</strong>
              </span>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <span>Clean Minimalist PDF Summary</span>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <span>Private Client Reference Sheet</span>
            </div>
          </header>

          {/* Empty State in Print View */}
          {favorites.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-300 rounded-xs text-neutral-500 text-sm">
              No saved ensembles in this lookbook yet.
            </div>
          ) : printLayout === 'dossier' ? (
            /* ------------------------------------------------------------- */
            /* LAYOUT 1: EDITORIAL DOSSIER (Rich, Pristine Outfit Sheets)    */
            /* ------------------------------------------------------------- */
            <div className="space-y-12">
              {favorites.map((fav, index) => {
                const outfit = fav.outfit;
                return (
                  <article
                    key={fav.id}
                    className="print-break-inside-avoid border-b border-neutral-300 pb-10 space-y-6"
                  >
                    {/* Look Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-neutral-200">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-neutral-500 font-medium">
                          <span className="font-bold text-black">LOOK {String(index + 1).padStart(2, '0')}</span>
                          <span aria-hidden="true">·</span>
                          <span>{OCCASIONS_DATA[outfit.occasion]?.name || outfit.occasion}</span>
                          <span aria-hidden="true">·</span>
                          <span>{outfit.aesthetic}</span>
                        </div>

                        <h2 className="text-2xl font-serif font-semibold text-black mt-1">
                          {outfit.title}
                        </h2>

                        <p className="text-xs text-neutral-600 mt-0.5">
                          {outfit.subtitle}
                          {outfit.silhouetteName && ` · Silhouette: ${outfit.silhouetteName}`}
                        </p>
                      </div>

                      <div className="text-[11px] text-neutral-500 font-mono shrink-0 sm:text-right">
                        <span>
                          Saved {new Date(fav.savedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Ensemble Components Grid */}
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 font-semibold">
                        Ensemble Composition ({outfit.pieces.length} Pieces)
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {outfit.pieces.map((piece, pIdx) => (
                          <div
                            key={pIdx}
                            className="border border-neutral-300 p-2.5 rounded-xs flex flex-col justify-between space-y-2 bg-white"
                          >
                            <div className="space-y-1.5">
                              {/* Visual Thumbnail */}
                              <div className="w-full aspect-square rounded-xs overflow-hidden bg-neutral-100 border border-neutral-200">
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

                              <div className="text-[9px] uppercase tracking-wider font-mono text-neutral-500 truncate">
                                {formatCategoryBadge(piece.category)}
                              </div>

                              <div className="font-semibold text-xs text-black line-clamp-2 leading-tight">
                                {piece.name}
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-600">
                              <span className="truncate">{piece.colorName}</span>
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: piece.colorHex }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Color Harmony & Metal Finish */}
                    <div className="border border-neutral-300 p-3.5 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-black">Color Story:</span>
                        <div className="flex items-center gap-1.5">
                          {outfit.colorHarmony.hexes.map((hex, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-1">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                              <span className="font-mono text-[10px] text-neutral-500 hidden sm:inline">
                                {hex}
                              </span>
                            </div>
                          ))}
                        </div>
                        <span className="text-neutral-500 text-[11px] truncate hidden md:inline">
                          ({outfit.colorHarmony.name})
                        </span>
                      </div>

                      <div className="text-xs">
                        <span className="font-semibold text-black">Metal Tone: </span>
                        <span className="text-neutral-700">{outfit.recommendedMetal}</span>
                      </div>
                    </div>

                    {/* Stylist Rule & Personal Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Stylist Guideline */}
                      <div className="p-3.5 border border-neutral-300 rounded-xs space-y-1 bg-white">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-black block">
                          Stylist Guideline
                        </span>
                        <p className="text-neutral-800 leading-relaxed text-xs">
                          {outfit.proStylistRule}
                        </p>
                      </div>

                      {/* Personal Notes */}
                      <div className="p-3.5 border border-neutral-300 rounded-xs space-y-1 bg-white">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-black block">
                          Personal Notes
                        </span>
                        <p className="text-neutral-700 italic text-xs leading-relaxed">
                          {fav.userNotes ? `“${fav.userNotes}”` : 'No personal styling notes recorded.'}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* ------------------------------------------------------------- */
            /* LAYOUT 2: COMPACT TABLE (High-density 1-pager summary)         */
            /* ------------------------------------------------------------- */
            <div className="border border-neutral-300 rounded-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-black bg-neutral-100 font-mono text-[10px] uppercase text-black">
                    <th className="p-3 font-bold w-12">No.</th>
                    <th className="p-3 font-bold">Ensemble / Title</th>
                    <th className="p-3 font-bold">Occasion & Style</th>
                    <th className="p-3 font-bold">Pieces Breakdown</th>
                    <th className="p-3 font-bold">Stylist Principle</th>
                    <th className="p-3 font-bold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {favorites.map((fav, idx) => {
                    const outfit = fav.outfit;
                    return (
                      <tr key={fav.id} className="print-break-inside-avoid align-top hover:bg-neutral-50">
                        <td className="p-3 font-mono font-bold text-neutral-600">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="p-3">
                          <div className="font-serif font-bold text-sm text-black">
                            {outfit.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {outfit.subtitle}
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            {outfit.colorHarmony.hexes.map((hex, i) => (
                              <span
                                key={i}
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                            <span className="text-[10px] text-neutral-500 font-mono ml-1">
                              {outfit.recommendedMetal}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-neutral-700">
                          <div>{OCCASIONS_DATA[outfit.occasion]?.name || outfit.occasion}</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">{outfit.aesthetic}</div>
                        </td>
                        <td className="p-3 text-[11px] text-neutral-800 space-y-1">
                          {outfit.pieces.map((p, pI) => (
                            <div key={pI} className="leading-tight">
                              <span className="font-semibold text-black">{p.name}</span>{' '}
                              <span className="text-neutral-500">({p.colorName})</span>
                            </div>
                          ))}
                        </td>
                        <td className="p-3 text-[11px] text-neutral-700 leading-normal max-w-xs">
                          {outfit.proStylistRule}
                        </td>
                        <td className="p-3 text-[11px] text-neutral-600 italic">
                          {fav.userNotes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Dossier Footer */}
          <footer className="pt-8 border-t border-neutral-300 text-center text-[11px] text-neutral-400 font-mono print-break-inside-avoid">
            StyleSense Intelligent Sartorial Atelier · End of Curated Lookbook Dossier
          </footer>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STANDARD VIEW MODE (Rich UI with card interactions, note editing, etc.)
  // --------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E2D9] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C8275] font-semibold mb-1">
            <span>Archived Ensembles</span>
            <span aria-hidden="true">·</span>
            <span>Local Storage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#141413]">
            Curated Lookbook
          </h2>
          <p className="text-sm sm:text-base text-[#5A554E] mt-1 max-w-2xl font-light">
            Your personal archive of saved outfit formulas. Saved locally in your browser with private notes and printable styling sheets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print flex-wrap">
          {/* Dedicated Print-Friendly View Mode Button */}
          <button
            type="button"
            id="open-print-view-mode-button"
            data-testid="open-print-view-mode-button"
            onClick={() => {
              if (favorites.length === 0) {
                setPrintFeedback('Your lookbook has no saved outfits to preview. Please generate and save an outfit recommendation first.');
                setTimeout(() => setPrintFeedback(null), 4500);
                return;
              }
              setIsPrintView(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#141413] bg-white border border-[#D9CFC4] hover:bg-[#FAF8F5] rounded-xs transition-colors shadow-2xs cursor-pointer"
            title="Open clean, minimalist PDF-ready view (strips navigation and backgrounds)"
          >
            <FileText className="w-4 h-4 text-[#A64B2A]" />
            <span>Print-Friendly View</span>
          </button>

          {/* Quick Print Button */}
          <button
            type="button"
            id="quick-print-lookbook-button"
            data-testid="quick-print-lookbook-button"
            onClick={handleTriggerPrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs transition-colors shadow-2xs cursor-pointer"
            title="Open browser print dialog to print or save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / PDF</span>
          </button>
        </div>
      </div>

      {/* Print Feedback Notification */}
      {printFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 bg-[#FFF8E7] border border-[#E8DFC8] rounded-xs text-xs text-[#856404] flex items-center justify-between no-print animate-in fade-in duration-200"
        >
          <span>{printFeedback}</span>
          <button
            type="button"
            onClick={() => setPrintFeedback(null)}
            className="underline text-[11px] font-medium cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="bg-white rounded-xs border border-[#E8DFC8] p-12 text-center space-y-5">
          <Heart className="w-10 h-10 mx-auto text-[#C2B4A3]" />
          <h3 className="text-2xl font-serif text-[#141413]">
            Your Lookbook is Currently Empty
          </h3>
          <p className="text-xs sm:text-sm text-[#5A554E] max-w-md mx-auto font-light">
            When you generate outfit recommendations in the Stylist Studio, click "Save Look" to collect your favorite ensembles here.
          </p>
          <button
            type="button"
            id="lookbook-style-recommendation"
            aria-label="Style Recommendation"
            onClick={onNavigateToStylist}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-xs tracking-wider uppercase font-semibold text-white bg-[#141413] hover:bg-[#2B2926] rounded-xs transition-colors shadow-xs cursor-pointer no-print"
          >
            <span>Style Recommendation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {favorites.map((fav) => {
            const outfit = fav.outfit;
            const isEditing = editingId === fav.id;

            return (
              <div
                key={fav.id}
                className="bg-white rounded-xs border border-[#E8DFC8] p-6 sm:p-8 shadow-xs space-y-6 print-break-inside-avoid print-card"
              >
                {/* Look Header & Top Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#F0EAE1]">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C8275] font-semibold">
                      <span>{OCCASIONS_DATA[outfit.occasion]?.name || 'Occasion'}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Saved {new Date(fav.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-2xl font-serif text-[#141413] mt-1">
                      {outfit.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-xs text-[#7A7369]">{outfit.subtitle} · {outfit.aesthetic}</p>
                      {outfit.silhouetteName && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-[#FAF8F5] text-[#141413] border border-[#E5DACD] text-[10px] font-medium tracking-wide">
                          {outfit.silhouetteName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 no-print shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyRecipe(fav)}
                      className="p-2 text-[#7A7369] hover:text-[#141413] hover:bg-[#FAF8F5] rounded-xs border border-[#E5DACD] transition-colors cursor-pointer"
                      title="Copy outfit recipe"
                    >
                      {copiedId === fav.id ? (
                        <Check className="w-4 h-4 text-[#2E6B4F]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteLook(fav.id)}
                      className="p-2 text-[#7A7369] hover:text-[#A64B2A] hover:bg-[#FAF8F5] rounded-xs border border-[#E5DACD] transition-colors cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Outfit Pieces Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {outfit.pieces.map((piece, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-[#FAF8F5] p-3 rounded-xs border border-[#E8DFC8] flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-2">
                        <div className="w-full aspect-square rounded-xs overflow-hidden bg-[#F2EDE4]">
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

                        <div className="flex flex-wrap items-center justify-between gap-1 text-[9px] uppercase tracking-wider font-semibold text-[#8C8275]">
                          <span className="truncate">{formatCategoryBadge(piece.category)}</span>
                          {piece.isWardrobeOwned ? (
                            <span className="text-[8px] bg-[#E8E2D9] text-[#3D3A34] px-1 py-0.5 rounded-xs font-semibold shrink-0">
                              In Wardrobe
                            </span>
                          ) : (
                            <span className="text-[8px] bg-[#FAF8F5] text-[#8C8275] border border-[#E8DFC8] px-1 py-0.5 rounded-xs font-semibold shrink-0">
                              Curated
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-xs text-[#141413] line-clamp-2">
                          {piece.name}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#7A7369] pt-2 border-t border-[#E8DFC8]/60">
                        <span className="truncate">{piece.colorName}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: piece.colorHex }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Color Palette & Metal Tone Strip */}
                <div className="bg-[#FAF8F5] p-4 rounded-xs border border-[#E8DFC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#141413]">Color Palette:</span>
                    <div className="flex items-center gap-1.5">
                      {outfit.colorHarmony.hexes.map((hex, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                    <span className="text-[#7A7369] text-[11px] truncate hidden sm:inline">
                      {outfit.colorHarmony.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#141413]">Metal:</span>
                    <span className="text-[#5A554E]">{outfit.recommendedMetal}</span>
                  </div>
                </div>

                {/* Stylist Rule & Personal Notes Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-[#F5EFE6] rounded-xs border border-[#E2D8CC] text-xs space-y-1.5">
                    <span className="font-semibold uppercase tracking-wider text-[#8C4A2F] text-[10px] block">
                      Stylist Guideline
                    </span>
                    <p className="text-[#4A4742] leading-relaxed">
                      {outfit.proStylistRule}
                    </p>
                  </div>

                  {/* Personal Notes */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xs border border-[#E5DACD] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold uppercase tracking-wider text-[#141413] text-[10px]">
                        Personal Wardrobe Notes
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleStartEditing(fav)}
                          className="text-[11px] text-[#8C8275] hover:text-[#141413] flex items-center gap-1 cursor-pointer no-print"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={notesBuffer}
                          onChange={(e) => setNotesBuffer(e.target.value)}
                          placeholder="e.g., Best worn with my mother's heirloom necklace; dry clean trousers after."
                          className="w-full p-2 text-xs bg-white border border-[#D9CFC4] rounded-xs text-[#141413] focus:outline-hidden"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-[11px] text-[#5A554E] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(fav.id)}
                            className="px-3 py-1 text-[11px] font-semibold text-white bg-[#141413] rounded-xs cursor-pointer"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[#5A554E] italic">
                        {fav.userNotes ? `“${fav.userNotes}”` : 'No personal notes added yet.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
