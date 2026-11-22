import { useCallback, useEffect, useRef, useState } from 'react';
import { ActiveView, Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { GalleryView } from './components/GalleryView';
import { ModelSpecView } from './components/ModelSpecView';
import { SpecsPasswordModal } from './components/SpecsPasswordModal';
import {
  ModelId,
  estimateGenerationCredits,
  getModelConfig,
} from './types/models';
import {
  CreditBalanceInfo,
  GeneratedImageEntry,
  GenerationRecord,
  ModelFormState,
  ReferenceImageItem,
} from './types/studio';

const STORAGE_KEY = 'lnxpixel_gallery_v1';

interface UpstreamJobResponse {
  id?: string;
  status?: string;
  images?: Array<{ position?: number; url?: string }>;
  output?: Array<{ url?: string }> | string[];
  url?: string;
  error?: string | { message?: string };
  message?: string;
}

function extractImagesFromJob(job: UpstreamJobResponse): GeneratedImageEntry[] {
  if (Array.isArray(job.images) && job.images.length > 0) {
    return job.images
      .filter((img) => typeof img.url === 'string' && img.url.length > 0)
      .map((img, idx) => ({
        position: typeof img.position === 'number' ? img.position : idx,
        url: img.url as string,
      }));
  }

  if (Array.isArray(job.output) && job.output.length > 0) {
    return job.output
      .map((item, idx) => {
        if (typeof item === 'string') return { position: idx, url: item };
        if (item && typeof item.url === 'string') return { position: idx, url: item.url };
        return null;
      })
      .filter((item): item is GeneratedImageEntry => item !== null);
  }

  if (typeof job.url === 'string' && job.url.length > 0) {
    return [{ position: 0, url: job.url }];
  }

  return [];
}

function createInitialForm(): ModelFormState {
  const defaultModel = getModelConfig('nano-banana-2.1');
  return {
    modelId: defaultModel.id,
    prompt: '',
    aspectRatio: defaultModel.defaultAspectRatio,
    resolution: defaultModel.defaultResolution,
    quality: defaultModel.defaultQuality,
    numImages: 1,
    outputFormat: defaultModel.defaultOutputFormat,
    background: defaultModel.defaultBackground,
    complexity: defaultModel.defaultComplexity,
    googleSearch: false,
    imageSearch: false,
  };
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('studio');
  const [showSpecsAuthModal, setShowSpecsAuthModal] = useState(false);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [credits, setCredits] = useState<CreditBalanceInfo | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);

  const [form, setForm] = useState<ModelFormState>(createInitialForm);
  const [references, setReferences] = useState<ReferenceImageItem[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeRecord, setActiveRecord] = useState<GenerationRecord | null>(null);

  const [gallery, setGallery] = useState<GenerationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);

  const activeModel = getModelConfig(form.modelId);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery.slice(0, 40)));
    } catch {
      // Ignore storage quota errors
    }
  }, [gallery]);

  const fetchCredits = useCallback(async () => {
    setCreditsLoading(true);
    try {
      const res = await fetch('/api/credits');
      const data = (await res.json()) as CreditBalanceInfo;
      setCredits(data);
    } catch {
      setCredits({
        configured: Boolean(apiConfigured),
        available: false,
        error: 'Tidak dapat menghubungi server untuk memuat sisa kredit.',
      });
    } finally {
      setCreditsLoading(false);
    }
  }, [apiConfigured]);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => {
        setApiConfigured(Boolean(data.configured));
      })
      .catch(() => {
        setApiConfigured(null);
      });
    void fetchCredits();
  }, [fetchCredits]);

  useEffect(() => {
    if (!isGenerating) return;
    const start = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds((Date.now() - start) / 1000);
    }, 100);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  const handleSelectModel = (modelId: ModelId) => {
    const nextModel = getModelConfig(modelId);
    setForm((prev) => ({
      ...prev,
      modelId,
      aspectRatio: nextModel.aspectRatios.includes(prev.aspectRatio)
        ? prev.aspectRatio
        : nextModel.defaultAspectRatio,
      resolution: nextModel.resolutions.includes(prev.resolution)
        ? prev.resolution
        : nextModel.defaultResolution,
      quality: nextModel.qualityLevels.includes(prev.quality)
        ? prev.quality
        : nextModel.defaultQuality,
      outputFormat: nextModel.outputFormats.includes(prev.outputFormat)
        ? prev.outputFormat
        : nextModel.defaultOutputFormat,
      background: nextModel.backgrounds.includes(prev.background)
        ? prev.background
        : nextModel.defaultBackground,
      complexity: nextModel.complexities.includes(prev.complexity)
        ? prev.complexity
        : nextModel.defaultComplexity,
      numImages: nextModel.fixedNumImages
        ? nextModel.fixedNumImages
        : Math.min(nextModel.maxNumImages, Math.max(1, prev.numImages)),
    }));
    setErrorMessage(null);
  };

  const handleUpdateForm = <K extends keyof ModelFormState>(
    key: K,
    value: ModelFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setStatusMessage('');
  };

  const handleGenerate = async () => {
    const trimmedPrompt = form.prompt.trim();
    if (!trimmedPrompt || isGenerating) return;

    handleCancelGeneration();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const model = getModelConfig(form.modelId);
    setIsGenerating(true);
    setErrorMessage(null);
    setElapsedSeconds(0);
    setStatusMessage(`Mengirim permintaan ke ${model.name}...`);

    if (window.innerWidth < 1024) {
      previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const startedAt = Date.now();

    try {
      const refUrls = references
        .map((r) => r.remoteUrl || r.previewUrl)
        .filter((u) => u && !u.startsWith('blob:'))
        .slice(0, model.maxReferences);

      const effectiveNumImages = model.fixedNumImages ?? form.numImages;

      const createRes = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: model.id,
          prompt: trimmedPrompt,
          aspect_ratio: form.aspectRatio,
          resolution: form.resolution,
          quality: form.quality,
          num_images: effectiveNumImages,
          output_format: form.outputFormat,
          background: form.background,
          complexity: form.complexity,
          google_search: form.googleSearch,
          image_search: form.imageSearch,
          reference_images: refUrls,
        }),
      });

      const createData = (await createRes.json()) as UpstreamJobResponse;
      if (!createRes.ok) {
        const msg =
          (typeof createData.error === 'string' && createData.error) ||
          (typeof createData.message === 'string' && createData.message) ||
          'Permintaan generasi ditolak oleh server.';
        throw new Error(msg);
      }

      let finalImages = extractImagesFromJob(createData);
      const jobId = createData.id || `job_${Date.now()}`;

      if (finalImages.length === 0) {
        if (!createData.id) {
          throw new Error('Server tidak mengembalikan ID tugas generasi.');
        }

        setStatusMessage(`Merender gambar di ${model.name}...`);

        const maxAttempts = 80;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          if (controller.signal.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }

          await new Promise((resolve) => setTimeout(resolve, 1500));

          const pollRes = await fetch(`/api/images/${encodeURIComponent(jobId)}`, {
            signal: controller.signal,
          });
          const pollData = (await pollRes.json()) as UpstreamJobResponse;

          if (!pollRes.ok) {
            const pollErr =
              (typeof pollData.error === 'string' && pollData.error) ||
              pollData.message ||
              'Gagal memeriksa status tugas.';
            throw new Error(pollErr);
          }

          const status = (pollData.status || '').toLowerCase();
          if (status === 'succeeded' || status === 'completed') {
            finalImages = extractImagesFromJob(pollData);
            break;
          }

          if (status === 'failed' || status === 'canceled' || status === 'error') {
            const failMsg =
              (typeof pollData.error === 'string' && pollData.error) ||
              (pollData.error &&
                typeof pollData.error === 'object' &&
                pollData.error.message) ||
              pollData.message ||
              'Proses render gagal di server.';
            throw new Error(failMsg);
          }

          if (status === 'processing' || status === 'running') {
            setStatusMessage(`Merender detail ${model.name}...`);
          }
        }
      }

      if (finalImages.length === 0) {
        throw new Error('Waktu tunggu render habis sebelum gambar selesai dibuat.');
      }

      const durationSeconds = (Date.now() - startedAt) / 1000;
      const resolutionLabel =
        model.qualityLevels.length > 0
          ? `${form.resolution} · ${form.quality}`
          : form.resolution;

      const creditsUsed = estimateGenerationCredits({
        modelId: model.id,
        resolution: form.resolution,
        quality: form.quality,
        numImages: finalImages.length,
        referenceCount: refUrls.length,
        googleSearch: form.googleSearch,
        imageSearch: form.imageSearch,
      });

      const record: GenerationRecord = {
        id: `rec_${Date.now()}`,
        jobId,
        modelId: model.id,
        modelName: model.name,
        prompt: trimmedPrompt,
        aspectRatio: form.aspectRatio,
        resolutionLabel,
        referenceCount: refUrls.length,
        images: finalImages,
        createdAt: new Date().toISOString(),
        durationSeconds,
        creditsUsed,
      };

      setActiveRecord(record);
      setGallery((prev) => [record, ...prev]);
      void fetchCredits();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat gambar.';
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
      abortControllerRef.current = null;
    }
  };

  const handleResetStudio = () => {
    handleCancelGeneration();
    references.forEach((item) => {
      if (item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setForm(createInitialForm());
    setReferences([]);
    setActiveRecord(null);
    setErrorMessage(null);
    setActiveView('studio');
  };

  const handleAddImageAsReference = async (url: string, label: string) => {
    if (references.length >= activeModel.maxReferences) return;

    const newItem: ReferenceImageItem = {
      id: `ref_chain_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: label,
      previewUrl: url,
      remoteUrl: url,
      sizeBytes: 0,
      uploading: false,
    };

    setReferences((prev) =>
      prev.length < activeModel.maxReferences ? [...prev, newItem] : prev
    );
    setActiveView('studio');
  };

  const handleReuseRecord = (record: GenerationRecord) => {
    handleSelectModel(record.modelId);
    setForm((prev) => ({
      ...prev,
      modelId: record.modelId,
      prompt: record.prompt,
      aspectRatio: record.aspectRatio,
    }));
    setActiveRecord(record);
    setErrorMessage(null);
    setActiveView('studio');
  };

  const activeResolutionLabel =
    activeModel.qualityLevels.length > 0
      ? `${form.resolution} · ${form.quality}`
      : form.resolution;

  return (
    <div className="min-h-screen w-full bg-studio-canvas text-slate-900 flex flex-col">
      <Header
        activeView={activeView}
        onChangeView={(view) => {
          if (view === 'specs') {
            if (activeView !== 'specs') {
              setShowSpecsAuthModal(true);
            }
            return;
          }
          setActiveView(view);
        }}
        onResetStudio={handleResetStudio}
        galleryCount={gallery.length}
      />

      <main className="flex-1 w-full flex flex-col">
        {activeView === 'studio' && (
          <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr] items-stretch">
            <div className="w-full min-w-0 lg:sticky lg:top-14 lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
              <ControlPanel
                form={form}
                onSelectModel={handleSelectModel}
                onUpdateForm={handleUpdateForm}
                references={references}
                onReferencesChange={setReferences}
                isGenerating={isGenerating}
                apiConfigured={apiConfigured}
                onGenerate={() => void handleGenerate()}
              />
            </div>

            <div ref={previewSectionRef} className="w-full min-w-0 flex">
              <PreviewCanvas
                activeRecord={activeRecord}
                activeModelName={activeModel.name}
                activeModelId={activeModel.id}
                isGenerating={isGenerating}
                statusMessage={statusMessage}
                elapsedSeconds={elapsedSeconds}
                errorMessage={errorMessage}
                selectedAspectRatio={form.aspectRatio}
                selectedResolutionLabel={activeResolutionLabel}
                referenceCount={references.length}
                maxReferences={activeModel.maxReferences}
                onCancelGeneration={handleCancelGeneration}
                onRetryGeneration={() => void handleGenerate()}
                onAddImageAsReference={(url, label) =>
                  void handleAddImageAsReference(url, label)
                }
              />
            </div>
          </div>
        )}

        {activeView === 'gallery' && (
          <GalleryView
            records={gallery}
            referenceCount={references.length}
            maxReferences={activeModel.maxReferences}
            onReuseRecord={handleReuseRecord}
            onAddImageAsReference={(url, label) =>
              void handleAddImageAsReference(url, label)
            }
            onDeleteRecord={(id) =>
              setGallery((prev) => prev.filter((item) => item.id !== id))
            }
            onClearAll={() => setGallery([])}
            onGoToStudio={() => setActiveView('studio')}
          />
        )}

        {activeView === 'specs' && (
          <ModelSpecView
            apiConfigured={apiConfigured}
            credits={credits}
            creditsLoading={creditsLoading}
            onRefreshCredits={() => void fetchCredits()}
            onSelectModelInStudio={(modelId) => {
              handleSelectModel(modelId);
              setActiveView('studio');
            }}
          />
        )}
      </main>

      <footer className="w-full border-t border-blue-200/80 bg-white/60 backdrop-blur-sm">
        <div className="w-full px-3 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>LNXPIXEL · Studio Generasi Gambar AI Multi-Model</span>
          <span className="font-mono">7 Model AI · Resolusi hingga 4K</span>
        </div>
      </footer>

      <SpecsPasswordModal
        isOpen={showSpecsAuthModal}
        onClose={() => setShowSpecsAuthModal(false)}
        onSuccess={() => {
          setShowSpecsAuthModal(false);
          setActiveView('specs');
          void fetchCredits();
        }}
      />
    </div>
  );
}
