import React from 'react';
import { RotateCcw } from 'lucide-react';

export type ActiveView = 'studio' | 'gallery' | 'specs';

interface HeaderProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  onResetStudio: () => void;
  galleryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onChangeView,
  onResetStudio,
  galleryCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-header">
      <div className="w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onChangeView('studio')}
          className="text-base sm:text-xl font-bold tracking-tight text-slate-900 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 px-1"
        >
          LNXPIXEL
        </button>

        {/* Zone 2: Single-line Nav Links */}
        <nav
          aria-label="Navigasi utama"
          className="flex items-center gap-3 sm:gap-7 text-xs sm:text-sm font-medium min-w-0"
        >
          <button
            type="button"
            onClick={() => onChangeView('studio')}
            className={`py-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeView === 'studio'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-blue-200'
            }`}
          >
            Studio
          </button>

          <button
            type="button"
            onClick={() => onChangeView('gallery')}
            className={`py-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeView === 'gallery'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-blue-200'
            }`}
          >
            Galeri{galleryCount > 0 ? ` (${galleryCount})` : ''}
          </button>

          <button
            type="button"
            onClick={() => onChangeView('specs')}
            className={`py-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeView === 'specs'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-blue-200'
            }`}
          >
            Spesifikasi
          </button>
        </nav>

        {/* Zone 3: Icon-only Reset action without frame or text */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onResetStudio}
            aria-label="Reset Kanvas"
            title="Reset Kanvas"
            className="inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-blue-700 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};
