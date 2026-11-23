import React from 'react';
import { Globe, Image, Loader2, SlidersHorizontal, Wand2 } from 'lucide-react';
import {
  AI_MODELS,
  ALL_ASPECT_RATIOS,
  AspectRatioValue,
  BackgroundMode,
  ComplexityLevel,
  ModelId,
  OutputFormatMode,
  QUALITY_LABELS,
  QualityLevel,
  ResolutionTier,
  estimateGenerationCredits,
  getModelConfig,
} from '../types/models';
import { ModelFormState, ReferenceImageItem } from '../types/studio';
import { ReferenceUploader } from './ReferenceUploader';

interface ControlPanelProps {
  form: ModelFormState;
  onSelectModel: (modelId: ModelId) => void;
  onUpdateForm: <K extends keyof ModelFormState>(key: K, value: ModelFormState[K]) => void;
  references: ReferenceImageItem[];
  onReferencesChange: React.Dispatch<React.SetStateAction<ReferenceImageItem[]>>;
  isGenerating: boolean;
  apiConfigured: boolean | null;
  fullWidth?: boolean;
  onGenerate: () => void;
}

const PROMPT_INSPIRATIONS = [
  {
    label: 'Arsitektur Kaca',
    text: 'Minimalist modern pavilion made of white architectural concrete and blue-tinted frosted glass overlooking a tranquil lake at sunrise, crisp reflections, editorial architectural photography',
  },
  {
    label: 'Produk Kemasan',
    text: 'Studio commercial photo of a sleek matte ceramic skincare bottle on pale blue terrazzo stone, soft morning shadow lines, crystalline water droplets, 85mm macro lens',
  },
  {
    label: 'Tipografi Poster',
    text: 'Clean minimalist Swiss graphic poster with bold white sans-serif headline "AZURE STUDIO" on deep cobalt blue frosted glass background, sharp lighting',
  },
];

const BACKGROUND_LABELS: Record<BackgroundMode, string> = {
  auto: 'Otomatis',
  opaque: 'Opak',
  transparent: 'Transparan',
};

const COMPLEXITY_LABELS: Record<ComplexityLevel, string> = {
  low: 'Rendah (Cepat)',
  medium: 'Sedang',
  high: 'Tinggi (Detail)',
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  form,
  onSelectModel,
  onUpdateForm,
  references,
  onReferencesChange,
  isGenerating,
  apiConfigured,
  fullWidth = false,
  onGenerate,
}) => {
  const model = getModelConfig(form.modelId);
  const activeRefsCount = Math.min(references.length, model.maxReferences);
  const isUploadingAny = references.some((r) => r.uploading);

  const effectiveNumImages = model.fixedNumImages ?? form.numImages;
  const estimatedCredits = estimateGenerationCredits({
    modelId: model.id,
    resolution: form.resolution,
    quality: form.quality,
    numImages: effectiveNumImages,
    referenceCount: activeRefsCount,
    googleSearch: form.googleSearch,
    imageSearch: form.imageSearch,
  });

  const canGenerate =
    form.prompt.trim().length > 0 && !isGenerating && !isUploadingAny;

  const isGrokEditLockedRatio =
    model.id === 'grok-imagine-image-2' && activeRefsCount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canGenerate) {
      onGenerate();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`glass-panel border-b border-blue-200/80 p-4 sm:p-6 space-y-5 w-full ${
        fullWidth ? 'lg:p-8 flex-1' : 'lg:border-b-0 lg:border-r'
      }`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 truncate">
              Kontrol Generasi
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {model.name} · {model.provider}
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-blue-700 font-medium whitespace-nowrap shrink-0">
          ~{estimatedCredits} kredit
        </span>
      </div>

      {apiConfigured === false && (
        <div
          role="alert"
          className="bg-amber-50/90 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-900 leading-relaxed"
        >
          <span className="font-semibold">Konfigurasi diperlukan:</span> Tambahkan
          kunci API pada panel Secrets / file{' '}
          <code className="font-mono bg-amber-100 px-1 py-0.5">.env</code>{' '}
          server agar permintaan generasi gambar dapat diproses.
        </div>
      )}

      {/* Main Controls Body */}
      <div
        className={
          fullWidth
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start'
            : 'space-y-5'
        }
      >
      <div className="space-y-5 min-w-0">
      {/* 1. Pemilihan Model AI */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-semibold text-slate-900">
            Model AI Gambar
          </label>
          <span className="text-xs font-mono text-slate-500">
            {AI_MODELS.length} model
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {AI_MODELS.map((item, idx) => {
            const active = item.id === model.id;
            const spanFull = idx === 0 && AI_MODELS.length % 2 === 1;
            return (
              <button
                key={item.id}
                type="button"
                disabled={isGenerating}
                onClick={() => onSelectModel(item.id)}
                aria-pressed={active}
                className={`flex flex-col items-start p-2.5 border text-left transition-all cursor-pointer min-h-[54px] min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  spanFull ? 'col-span-2' : ''
                } ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white/75 border-blue-100 text-slate-800 hover:border-blue-300 hover:bg-blue-50/60'
                }`}
              >
                <span className="text-xs font-semibold leading-tight truncate w-full">
                  {item.name}
                </span>
                <span
                  className={`text-[11px] mt-0.5 leading-tight truncate w-full ${
                    active ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {item.provider}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/60 border border-blue-100 px-3 py-2">
          {model.description}
        </p>
      </div>

      {/* 2. Prompt Deskripsi */}
      <div className="border-t border-blue-100/80 pt-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="prompt-input"
            className="text-sm font-semibold text-slate-900"
          >
            Prompt Deskripsi
          </label>
          <span className="text-xs font-mono text-slate-400">
            {form.prompt.length} karakter
          </span>
        </div>

        <textarea
          id="prompt-input"
          rows={4}
          value={form.prompt}
          disabled={isGenerating}
          onChange={(e) => onUpdateForm('prompt', e.target.value)}
          placeholder={
            model.id === 'kling-image-4.0'
              ? 'Jelaskan gambar yang ingin dibuat. Untuk multi-referensi, sebut urutan gambar dengan @image_1, @image_2...'
              : 'Jelaskan subjek, pencahayaan, gaya fotografi, material, atau instruksi pengeditan...'
          }
          className="w-full px-3.5 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 bg-white/85 border border-blue-200/90 resize-y min-h-[104px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Inspirasi:</span>
          {PROMPT_INSPIRATIONS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={isGenerating}
              onClick={() => onUpdateForm('prompt', preset.text)}
              className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 min-h-[32px]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Gambar Referensi sesuai limit model */}
      <div className="border-t border-blue-100/80 pt-4">
        <ReferenceUploader
          references={references}
          onChange={onReferencesChange}
          maxReferences={model.maxReferences}
          referenceNote={model.referenceNote}
          disabled={isGenerating}
        />
      </div>
      </div>

      <div
        className={
          fullWidth
            ? 'space-y-5 min-w-0 border-t lg:border-t-0 lg:border-l border-blue-100/80 pt-4 lg:pt-0 lg:pl-8'
            : 'space-y-5 min-w-0'
        }
      >
      {/* 4. Aspek Rasio spesifik model */}
      <div className={fullWidth ? 'space-y-3' : 'border-t border-blue-100/80 pt-4 space-y-3'}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <label className="text-sm font-semibold text-slate-900">
              Aspek Rasio
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              {isGrokEditLockedRatio
                ? 'Mode edit Grok mengikuti rasio gambar input'
                : `Terpilih: ${ALL_ASPECT_RATIOS[form.aspectRatio]?.label || form.aspectRatio}`}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {model.aspectRatios.length} opsi
          </span>
        </div>

        <div
          className={`grid gap-1.5 ${
            fullWidth ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-3 sm:grid-cols-4'
          } ${isGrokEditLockedRatio ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {model.aspectRatios.map((ratioKey: AspectRatioValue) => {
            const meta = ALL_ASPECT_RATIOS[ratioKey];
            const isSelected = form.aspectRatio === ratioKey;
            const maxBox = 16;
            const scale = maxBox / Math.max(meta.widthUnits, meta.heightUnits);
            const boxW = Math.max(4, Math.round(meta.widthUnits * scale));
            const boxH = Math.max(4, Math.round(meta.heightUnits * scale));
            const shortLabel =
              ratioKey === 'auto'
                ? 'Auto'
                : ratioKey === 'match_input_image'
                ? 'Sesuai Ref'
                : ratioKey;

            return (
              <button
                key={ratioKey}
                type="button"
                disabled={isGenerating || isGrokEditLockedRatio}
                onClick={() => onUpdateForm('aspectRatio', ratioKey)}
                aria-pressed={isSelected}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 border text-center transition-all cursor-pointer min-h-[52px] min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white/75 border-blue-100 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <div className="h-4 flex items-center justify-center">
                  <span
                    aria-hidden="true"
                    style={{ width: `${boxW}px`, height: `${boxH}px` }}
                    className={`block border ${
                      isSelected
                        ? 'border-white bg-white/25'
                        : 'border-blue-400 bg-blue-100/70'
                    }`}
                  />
                </div>
                <span className="text-[11px] font-mono font-medium leading-none truncate max-w-full">
                  {shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Resolusi & Kualitas sesuai model */}
      {(model.resolutions.length > 0 || model.qualityLevels.length > 0) && (
        <div className="border-t border-blue-100/80 pt-4 space-y-4">
          {model.resolutions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-semibold text-slate-900">
                  Resolusi Output
                </label>
                <span className="text-xs text-slate-500 font-mono">
                  {model.resolutions.join(' / ')}
                </span>
              </div>

              <div
                className={`grid gap-1.5 ${
                  model.resolutions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}
              >
                {model.resolutions.map((tier: ResolutionTier) => {
                  const active = form.resolution === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => onUpdateForm('resolution', tier)}
                      aria-pressed={active}
                      className={`py-2.5 px-3 border text-center transition-all cursor-pointer min-h-[46px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/75 border-blue-100 text-slate-800 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <span className="text-sm font-bold font-mono">{tier}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {model.qualityLevels.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-semibold text-slate-900">
                  Tingkat Kualitas
                </label>
                <span className="text-xs text-slate-500">
                  {QUALITY_LABELS[form.quality]?.hint}
                </span>
              </div>

              <div
                className={`grid gap-1.5 ${
                  model.qualityLevels.length === 2
                    ? 'grid-cols-2'
                    : model.qualityLevels.length === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-5'
                }`}
              >
                {model.qualityLevels.map((q: QualityLevel) => {
                  const active = form.quality === q;
                  return (
                    <button
                      key={q}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => onUpdateForm('quality', q)}
                      aria-pressed={active}
                      className={`py-2 px-1.5 border text-center transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/75 border-blue-100 text-slate-800 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {QUALITY_LABELS[q].title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Kontrol Khusus Model */}
      {(model.supportsSearchGrounding ||
        model.complexities.length > 0 ||
        model.backgrounds.length > 0 ||
        model.outputFormats.length > 0) && (
        <div className="border-t border-blue-100/80 pt-4 space-y-4">

          {model.complexities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-semibold text-slate-900">
                  Kompleksitas Perencanaan
                </label>
                <span className="text-xs text-slate-500">Tanpa biaya tambahan</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {model.complexities.map((c) => {
                  const active = form.complexity === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => onUpdateForm('complexity', c)}
                      className={`py-2 px-2 border text-xs font-medium transition-all cursor-pointer min-h-[42px] ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/75 border-blue-100 text-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {COMPLEXITY_LABELS[c]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {model.backgrounds.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Latar Belakang
              </label>
              <div
                className={`grid gap-1.5 ${
                  model.backgrounds.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}
              >
                {model.backgrounds.map((bg) => {
                  const active = form.background === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        onUpdateForm('background', bg);
                        if (bg === 'transparent' && model.id === 'seedream-5.5') {
                          onUpdateForm('outputFormat', 'png');
                        }
                      }}
                      className={`py-2 px-2 border text-xs font-medium transition-all cursor-pointer min-h-[42px] ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/75 border-blue-100 text-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {BACKGROUND_LABELS[bg]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {model.outputFormats.length > 0 && (
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-slate-900">
                Format File
              </label>
              <div className="inline-flex items-center p-1 bg-blue-50/90 border border-blue-100">
                {model.outputFormats.map((fmt: OutputFormatMode) => {
                  const lockedToPng =
                    model.id === 'seedream-5.5' &&
                    form.background === 'transparent' &&
                    fmt !== 'png';
                  return (
                    <button
                      key={fmt}
                      type="button"
                      disabled={isGenerating || lockedToPng}
                      onClick={() => onUpdateForm('outputFormat', fmt)}
                      className={`px-2.5 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-40 ${
                        form.outputFormat === fmt
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {fmt === 'auto' ? 'Auto' : fmt.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {model.supportsSearchGrounding && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Konteks Pencarian Langsung
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => onUpdateForm('googleSearch', !form.googleSearch)}
                  aria-pressed={form.googleSearch}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 border text-left transition-all cursor-pointer min-h-[44px] ${
                    form.googleSearch
                      ? 'bg-blue-50 border-blue-400 text-blue-900'
                      : 'bg-white/75 border-blue-100 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Web Search</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    +10 kr
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => onUpdateForm('imageSearch', !form.imageSearch)}
                  aria-pressed={form.imageSearch}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 border text-left transition-all cursor-pointer min-h-[44px] ${
                    form.imageSearch
                      ? 'bg-blue-50 border-blue-400 text-blue-900'
                      : 'bg-white/75 border-blue-100 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <Image className="w-3.5 h-3.5 text-blue-600" />
                    <span>Image Search</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    +20 kr
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary Generate Button */}
      <div className="border-t border-blue-100/80 pt-4 space-y-2">
        <button
          type="submit"
          disabled={!canGenerate}
          className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Sedang Memproses Gambar...</span>
            </>
          ) : isUploadingAny ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Mengunggah Referensi...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" aria-hidden="true" />
              <span className="truncate">Buat Gambar · {model.name}</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>
            {activeRefsCount > 0
              ? `${activeRefsCount} referensi aktif`
              : 'Mode teks ke gambar'}
          </span>
          <span>Estimasi {estimatedCredits} kredit</span>
        </div>
      </div>
      </div>
      </div>
    </form>
  );
};
