import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Download,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { AI_MODELS, ModelId } from '../types/models';
import { GenerationRecord } from '../types/studio';
import { triggerImageDownload } from '../utils/imageHelpers';

interface GalleryViewProps {
  records: GenerationRecord[];
  referenceCount: number;
  maxReferences: number;
  onReuseRecord: (record: GenerationRecord) => void;
  onAddImageAsReference: (url: string, label: string) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onGoToStudio: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  records,
  referenceCount,
  maxReferences,
  onReuseRecord,
  onAddImageAsReference,
  onDeleteRecord,
  onClearAll,
  onGoToStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState<'all' | ModelId>('all');

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((item) => {
      if (modelFilter !== 'all' && item.modelId !== modelFilter) return false;
      if (q && !item.prompt.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [records, searchQuery, modelFilter]);

  const canAddRef = referenceCount < maxReferences;

  return (
    <div className="w-full glass-panel border-b border-blue-200/80 p-4 sm:p-6 lg:p-8 space-y-5 min-h-[calc(100vh-7rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Galeri Sesi Anda
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Riwayat gambar yang dihasilkan tersimpan lokal di browser Anda (tautan unduhan aktif selama 24 jam).
          </p>
        </div>

        {records.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px] self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Bersihkan Galeri</span>
          </button>
        )}
      </div>

      {records.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan kata kunci prompt..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white/90 border border-blue-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            />
          </div>

          <select
            aria-label="Filter berdasarkan model AI"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value as 'all' | ModelId)}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium bg-white/90 border border-blue-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          >
            <option value="all">Semua Model</option>
            {AI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {records.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-blue-200 bg-white/50">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
            <ImageIcon className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            Belum ada gambar di galeri
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-sm px-4">
            Setiap gambar yang berhasil dibuat akan otomatis tercatat di sini untuk diunduh atau dijadikan referensi ulang.
          </p>
          <button
            type="button"
            onClick={onGoToStudio}
            className="mt-5 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer min-h-[44px]"
          >
            Mulai Buat Gambar
          </button>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">
          Tidak ada gambar yang cocok dengan filter pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecords.map((record) => {
            const primaryImg = record.images[0];
            if (!primaryImg) return null;

            return (
              <div
                key={record.id}
                className="overflow-hidden bg-white/85 border border-blue-100 flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={primaryImg.url}
                    alt={record.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {record.images.length > 1 && (
                    <span className="absolute top-2.5 left-2.5 text-[11px] font-mono text-white bg-slate-900/75 px-2 py-0.5">
                      {record.images.length} variasi
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(record.id)}
                    aria-label="Hapus dari galeri"
                    className="absolute top-2.5 right-2.5 w-9 h-9 bg-slate-900/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <span>{record.modelName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{record.resolutionLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{record.aspectRatio}</span>
                    </div>
                    <p className="text-sm text-slate-800 mt-1.5 line-clamp-2 leading-snug">
                      {record.prompt}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onReuseRecord(record)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer min-h-[40px]"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Muat ke Studio</span>
                    </button>

                    <button
                      type="button"
                      disabled={!canAddRef}
                      onClick={() =>
                        onAddImageAsReference(
                          primaryImg.url,
                          `Galeri-${record.jobId.slice(-5)}.png`
                        )
                      }
                      title="Jadikan gambar referensi"
                      className="py-2 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-blue-200 transition-colors cursor-pointer disabled:opacity-50 min-h-[40px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        triggerImageDownload(
                          primaryImg.url,
                          `lnxpixel-${record.modelId}-${record.aspectRatio.replace(':', 'x')}.png`
                        )
                      }
                      aria-label="Unduh gambar"
                      className="py-2 px-3 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer min-h-[40px]"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
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
