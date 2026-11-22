import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import { AspectRatioValue, getModelConfig } from '../types/models';
import { GenerationRecord } from '../types/studio';
import { triggerImageDownload } from '../utils/imageHelpers';

interface PreviewCanvasProps {
  activeRecord: GenerationRecord | null;
  activeModelName: string;
  activeModelId: string;
  isGenerating: boolean;
  statusMessage: string;
  elapsedSeconds: number;
  errorMessage: string | null;
  selectedAspectRatio: AspectRatioValue;
  selectedResolutionLabel: string;
  referenceCount: number;
  maxReferences: number;
  onCancelGeneration: () => void;
  onRetryGeneration: () => void;
  onAddImageAsReference: (url: string, label: string) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  activeRecord,
  activeModelName,
  activeModelId,
  isGenerating,
  statusMessage,
  elapsedSeconds,
  errorMessage,
  selectedAspectRatio,
  selectedResolutionLabel,
  referenceCount,
  maxReferences,
  onCancelGeneration,
  onRetryGeneration,
  onAddImageAsReference,
}) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const currentImages = activeRecord?.images || [];
  const safeVariantIndex =
    selectedVariantIndex < currentImages.length ? selectedVariantIndex : 0;
  const activeImage = currentImages[safeVariantIndex];

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Clipboard blocked in restricted iframe
    }
  };

  const canAddMoreRefs = referenceCount < maxReferences;
  const modelMeta = getModelConfig(activeModelId as Parameters<typeof getModelConfig>[0]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="glass-panel flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Generating State */}
        {isGenerating && (
          <div className="py-16 sm:py-24 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-blue-50 border border-blue-200 flex items-center justify-center mb-5">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              {statusMessage || `Memproses Gambar di ${activeModelName}`}
            </h3>

            <p className="text-sm text-slate-600 mt-1.5 max-w-md">
              Permintaan sedang dirender menggunakan{' '}
              <span className="font-semibold text-slate-800">{activeModelName}</span>{' '}
              dengan konfigurasi{' '}
              <span className="font-mono font-medium text-slate-800">
                {selectedResolutionLabel}
              </span>{' '}
              dan rasio{' '}
              <span className="font-mono font-medium text-slate-800">
                {selectedAspectRatio}
              </span>
              .
            </p>

            <div className="mt-5 flex items-center gap-3 text-xs font-mono text-slate-500">
              <span>Waktu berjalan: {elapsedSeconds.toFixed(1)} dtk</span>
              <span aria-hidden="true">·</span>
              <span>Model: {activeModelId}</span>
            </div>

            <button
              type="button"
              onClick={onCancelGeneration}
              className="mt-6 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-blue-200 transition-colors cursor-pointer min-h-[42px]"
            >
              Batalkan Polling
            </button>
          </div>
        )}

        {/* Error State */}
        {!isGenerating && errorMessage && (
          <div
            role="alert"
            className="bg-red-50/90 border border-red-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-950">
                  Generasi Gambar Gagal
                </h3>
                <p className="text-sm text-red-800 mt-1 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRetryGeneration}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {/* Result State */}
        {!isGenerating && !errorMessage && activeRecord && activeImage && (
          <div className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Hasil Generasi
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                  <span>{activeRecord.modelName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeRecord.resolutionLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeRecord.aspectRatio}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeRecord.durationSeconds.toFixed(1)} dtk</span>
                  {activeRecord.referenceCount > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{activeRecord.referenceCount} referensi</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!canAddMoreRefs}
                  onClick={() =>
                    onAddImageAsReference(
                      activeImage.url,
                      `Hasil-${activeRecord.jobId.slice(-6)}.png`
                    )
                  }
                  title={
                    canAddMoreRefs
                      ? 'Tambahkan hasil ini ke slot gambar referensi'
                      : `Slot referensi model sudah penuh (${maxReferences}/${maxReferences})`
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 min-h-[42px]"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Jadikan Referensi</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopyUrl(activeImage.url)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-blue-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Salin URL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    triggerImageDownload(
                      activeImage.url,
                      `lnxpixel-${activeRecord.modelId}-${activeRecord.aspectRatio.replace(':', 'x')}.png`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Unduh</span>
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden bg-slate-100/80 border border-blue-100 flex items-center justify-center max-h-[680px]">
              {brokenImages[activeImage.url] ? (
                <div className="w-full py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <ImageIcon className="w-8 h-8 text-blue-400" />
                  <p className="text-sm font-medium text-slate-700">
                    Gambar tidak dapat dimuat langsung
                  </p>
                  <a
                    href={activeImage.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                  >
                    <span>Buka tautan hasil</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <>
                  <img
                    src={activeImage.url}
                    alt={activeRecord.prompt}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setBrokenImages((prev) => ({
                        ...prev,
                        [activeImage.url]: true,
                      }))
                    }
                    className="w-full max-h-[680px] object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(activeImage.url)}
                    aria-label="Perbesar pratinjau gambar"
                    className="absolute bottom-3 right-3 w-11 h-11 bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {currentImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {currentImages.map((img, index) => (
                  <button
                    key={`${img.url}_${index}`}
                    type="button"
                    onClick={() => setSelectedVariantIndex(index)}
                    className={`relative w-20 h-20 overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      safeVariantIndex === index
                        ? 'border-blue-600'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Variasi ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-blue-100/80 pt-3">
              <span className="font-semibold text-slate-800">Prompt: </span>
              {activeRecord.prompt}
            </p>
          </div>
        )}

        {/* Clean Empty Canvas (no sample images) */}
        {!isGenerating && !errorMessage && !activeRecord && (
          <div className="w-full py-12 sm:py-20 px-4 sm:px-8 flex flex-col items-center justify-center text-center border border-dashed border-blue-200/90 bg-white/55">
            <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-5">
              <ImageIcon className="w-5 h-5" aria-hidden="true" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 text-balance">
              Kanvas Generasi LNXPIXEL
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-lg leading-relaxed">
              Tulis prompt deskripsi, lampirkan gambar referensi jika diperlukan, lalu tekan{' '}
              <span className="font-semibold text-slate-800">Buat Gambar</span> pada panel kontrol untuk merender hasil di sini.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-xl text-left">
              <div className="bg-white/80 border border-blue-100 p-3">
                <span className="text-[11px] font-medium text-slate-500">Model Aktif</span>
                <p className="text-xs font-semibold text-slate-900 mt-0.5 truncate">
                  {activeModelName}
                </p>
              </div>
              <div className="bg-white/80 border border-blue-100 p-3">
                <span className="text-[11px] font-medium text-slate-500">Rasio & Kualitas</span>
                <p className="text-xs font-mono font-semibold text-blue-700 mt-0.5 truncate">
                  {selectedAspectRatio} · {selectedResolutionLabel}
                </p>
              </div>
              <div className="bg-white/80 border border-blue-100 p-3">
                <span className="text-[11px] font-medium text-slate-500">Batas Referensi</span>
                <p className="text-xs font-mono font-semibold text-slate-900 mt-0.5 truncate">
                  {referenceCount} / {modelMeta.maxReferences} terpasang
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {lightboxUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau gambar layar penuh"
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            aria-label="Tutup pratinjau"
            className="absolute top-4 right-4 w-11 h-11 bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Pratinjau penuh"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
};
