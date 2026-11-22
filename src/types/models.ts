export type ModelId =
  | 'nano-banana-2.1'
  | 'seedream-5.5'
  | 'kling-image-4.0'
  | 'grok-imagine-image-2'
  | 'gpt-image-2'
  | 'gpt-image-2.6-sunburst'
  | 'gpt-image-2.6-flare';

export type AspectRatioValue =
  | 'auto'
  | 'match_input_image'
  | '1:1'
  | '16:9'
  | '9:16'
  | '4:3'
  | '3:4'
  | '3:2'
  | '2:3'
  | '5:4'
  | '4:5'
  | '21:9'
  | '9:21'
  | '2:1'
  | '1:2'
  | '4:1'
  | '1:4'
  | '8:1'
  | '1:8';

export type ResolutionTier = '1K' | '2K' | '4K';
export type QualityLevel = 'low' | 'medium' | 'high' | 'xhigh' | 'max';
export type BackgroundMode = 'auto' | 'opaque' | 'transparent';
export type OutputFormatMode = 'auto' | 'png' | 'jpeg' | 'webp';
export type ComplexityLevel = 'low' | 'medium' | 'high';

export interface AspectRatioMeta {
  value: AspectRatioValue;
  label: string;
  widthUnits: number;
  heightUnits: number;
}

export const ALL_ASPECT_RATIOS: Record<AspectRatioValue, AspectRatioMeta> = {
  auto: { value: 'auto', label: 'Otomatis', widthUnits: 1, heightUnits: 1 },
  match_input_image: {
    value: 'match_input_image',
    label: 'Ikuti Referensi',
    widthUnits: 1,
    heightUnits: 1,
  },
  '1:1': { value: '1:1', label: 'Persegi', widthUnits: 1, heightUnits: 1 },
  '16:9': { value: '16:9', label: 'Layar Lebar', widthUnits: 16, heightUnits: 9 },
  '9:16': { value: '9:16', label: 'Story Vertikal', widthUnits: 9, heightUnits: 16 },
  '4:3': { value: '4:3', label: 'Klasik', widthUnits: 4, heightUnits: 3 },
  '3:4': { value: '3:4', label: 'Potret', widthUnits: 3, heightUnits: 4 },
  '3:2': { value: '3:2', label: 'Kamera 35mm', widthUnits: 3, heightUnits: 2 },
  '2:3': { value: '2:3', label: 'Poster', widthUnits: 2, heightUnits: 3 },
  '5:4': { value: '5:4', label: 'Cetakan Studio', widthUnits: 5, heightUnits: 4 },
  '4:5': { value: '4:5', label: 'Feed Sosial', widthUnits: 4, heightUnits: 5 },
  '21:9': { value: '21:9', label: 'Sinematik', widthUnits: 21, heightUnits: 9 },
  '9:21': { value: '9:21', label: 'Vertikal Panjang', widthUnits: 9, heightUnits: 21 },
  '2:1': { value: '2:1', label: 'Banner 2:1', widthUnits: 2, heightUnits: 1 },
  '1:2': { value: '1:2', label: 'Vertikal 1:2', widthUnits: 1, heightUnits: 2 },
  '4:1': { value: '4:1', label: 'Banner Lebar', widthUnits: 4, heightUnits: 1 },
  '1:4': { value: '1:4', label: 'Banner Tinggi', widthUnits: 1, heightUnits: 4 },
  '8:1': { value: '8:1', label: 'Panorama 8:1', widthUnits: 8, heightUnits: 1 },
  '1:8': { value: '1:8', label: 'Vertikal 1:8', widthUnits: 1, heightUnits: 8 },
};

export interface ModelConfig {
  id: ModelId;
  name: string;
  provider: string;
  tagline: string;
  description: string;
  aspectRatios: AspectRatioValue[];
  defaultAspectRatio: AspectRatioValue;
  resolutionField: 'size' | 'resolution' | 'none';
  resolutions: ResolutionTier[];
  defaultResolution: ResolutionTier;
  qualityLevels: QualityLevel[];
  defaultQuality: QualityLevel;
  maxReferences: number;
  referenceField: 'reference_images' | 'image';
  referenceCostPerItem: number;
  referenceNote: string;
  maxNumImages: number;
  fixedNumImages?: number;
  outputFormats: OutputFormatMode[];
  defaultOutputFormat: OutputFormatMode;
  backgrounds: BackgroundMode[];
  defaultBackground: BackgroundMode;
  complexities: ComplexityLevel[];
  defaultComplexity: ComplexityLevel;
  supportsSearchGrounding?: boolean;
  baseCreditsLabel: string;
}

export const AI_MODELS: ModelConfig[] = [
  {
    id: 'nano-banana-2.1',
    name: 'Nano Banana 2.1',
    provider: 'Google',
    tagline: 'Cepat, teks tajam & 14 aspek rasio',
    description:
      'Generasi cepat dan pengeditan presisi dengan dukungan hingga 5 referensi gratis, 14 aspek rasio, resolusi 1K–4K, serta opsional pencarian web & gambar.',
    aspectRatios: [
      'auto',
      '1:1',
      '16:9',
      '9:16',
      '4:3',
      '3:4',
      '3:2',
      '2:3',
      '5:4',
      '4:5',
      '21:9',
      '4:1',
      '1:4',
      '8:1',
      '1:8',
    ],
    defaultAspectRatio: '16:9',
    resolutionField: 'size',
    resolutions: ['1K', '2K', '4K'],
    defaultResolution: '2K',
    qualityLevels: [],
    defaultQuality: 'medium',
    maxReferences: 5,
    referenceField: 'reference_images',
    referenceCostPerItem: 0,
    referenceNote: 'Maks. 5 referensi (gratis) untuk pengeditan & komposisi.',
    maxNumImages: 4,
    outputFormats: ['auto', 'png', 'jpeg'],
    defaultOutputFormat: 'auto',
    backgrounds: [],
    defaultBackground: 'opaque',
    complexities: [],
    defaultComplexity: 'high',
    supportsSearchGrounding: true,
    baseCreditsLabel: '45–150 kredit / gambar',
  },
  {
    id: 'seedream-5.5',
    name: 'Seedream 5.5',
    provider: 'ByteDance',
    tagline: 'Tekstur natural & latar transparan',
    description:
      'Pencahayaan, material, dan kulit lebih natural dengan teks kecil tajam, pengeditan terarah, serta dukungan latar transparan PNG.',
    aspectRatios: [
      '1:1',
      '4:3',
      '3:4',
      '16:9',
      '9:16',
      '2:3',
      '3:2',
      '21:9',
      '9:21',
      'match_input_image',
    ],
    defaultAspectRatio: '1:1',
    resolutionField: 'size',
    resolutions: ['1K', '2K'],
    defaultResolution: '2K',
    qualityLevels: [],
    defaultQuality: 'medium',
    maxReferences: 5,
    referenceField: 'reference_images',
    referenceCostPerItem: 10,
    referenceNote: 'Maks. 5 referensi (+10 kredit per referensi / gambar).',
    maxNumImages: 4,
    outputFormats: ['png', 'jpeg'],
    defaultOutputFormat: 'png',
    backgrounds: ['opaque', 'transparent'],
    defaultBackground: 'opaque',
    complexities: [],
    defaultComplexity: 'high',
    baseCreditsLabel: '26–46 kredit / gambar',
  },
  {
    id: 'kling-image-4.0',
    name: 'Kling Image 4.0',
    provider: 'Kling',
    tagline: 'Fotorealistik 2K–4K & tag @image_1',
    description:
      'Gambar fotorealistik beresolusi tinggi 2K & 4K dengan ejaan teks akurat dan penggabungan multi-referensi menggunakan referensi @image_1, @image_2.',
    aspectRatios: ['auto', '1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    defaultAspectRatio: '16:9',
    resolutionField: 'size',
    resolutions: ['2K', '4K'],
    defaultResolution: '2K',
    qualityLevels: [],
    defaultQuality: 'medium',
    maxReferences: 5,
    referenceField: 'reference_images',
    referenceCostPerItem: 4,
    referenceNote: 'Maks. 5 referensi (+4 kredit per referensi). Sebut @image_1 di prompt.',
    maxNumImages: 4,
    outputFormats: [],
    defaultOutputFormat: 'png',
    backgrounds: [],
    defaultBackground: 'opaque',
    complexities: [],
    defaultComplexity: 'high',
    baseCreditsLabel: '75–115 kredit / gambar',
  },
  {
    id: 'grok-imagine-image-2',
    name: 'Grok Imagine 2.0',
    provider: 'xAI',
    tagline: 'Kepatuhan prompt literal & edit tunggal',
    description:
      'Mengikuti instruksi multi-bagian secara literal. Mendukung 1 gambar input untuk pengeditan langsung dengan pilihan kualitas Low atau Medium.',
    aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '2:1', '1:2', 'auto'],
    defaultAspectRatio: '1:1',
    resolutionField: 'size',
    resolutions: ['1K', '2K'],
    defaultResolution: '1K',
    qualityLevels: ['low', 'medium'],
    defaultQuality: 'low',
    maxReferences: 1,
    referenceField: 'image',
    referenceCostPerItem: 0,
    referenceNote: 'Maks. 1 gambar input edit (rasio otomatis mengikuti gambar input).',
    maxNumImages: 1,
    fixedNumImages: 1,
    outputFormats: [],
    defaultOutputFormat: 'png',
    backgrounds: [],
    defaultBackground: 'opaque',
    complexities: [],
    defaultComplexity: 'medium',
    baseCreditsLabel: '50–100 kredit / gambar',
  },
  {
    id: 'gpt-image-2',
    name: 'GPT Image 2',
    provider: 'OpenAI',
    tagline: 'Rendering teks presisi & 3 tingkat kualitas',
    description:
      'Generasi & pengeditan hingga 1K/2K/4K dengan rendering teks tajam dan tiga tingkat kualitas (Low, Medium, High) di 13 aspek rasio.',
    aspectRatios: [
      '1:1',
      '4:3',
      '3:4',
      '5:4',
      '4:5',
      '16:9',
      '9:16',
      '3:2',
      '2:3',
      '21:9',
      '9:21',
      '2:1',
      '1:2',
    ],
    defaultAspectRatio: '1:1',
    resolutionField: 'resolution',
    resolutions: ['1K', '2K', '4K'],
    defaultResolution: '1K',
    qualityLevels: ['low', 'medium', 'high'],
    defaultQuality: 'medium',
    maxReferences: 5,
    referenceField: 'reference_images',
    referenceCostPerItem: 0,
    referenceNote: 'Maks. 5 referensi (gratis) untuk pengeditan & komposisi.',
    maxNumImages: 4,
    outputFormats: ['png', 'jpeg'],
    defaultOutputFormat: 'png',
    backgrounds: [],
    defaultBackground: 'opaque',
    complexities: [],
    defaultComplexity: 'medium',
    baseCreditsLabel: '30–750 kredit / gambar',
  },
  {
    id: 'gpt-image-2.6-sunburst',
    name: 'GPT Image 2.6 Sunburst',
    provider: 'OpenAI',
    tagline: 'Detail tinggi, tata letak kompleks & latar transparan',
    description:
      'Varian GPT Image 2.6 untuk teks padat, tata letak kompleks, dan edit ketat. Mendukung kontrol Complexity, 5 tingkat kualitas, latar transparan, hingga 4K.',
    aspectRatios: ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', 'auto'],
    defaultAspectRatio: '1:1',
    resolutionField: 'resolution',
    resolutions: ['1K', '2K', '4K'],
    defaultResolution: '1K',
    qualityLevels: ['low', 'medium', 'high', 'xhigh', 'max'],
    defaultQuality: 'medium',
    maxReferences: 5,
    referenceField: 'reference_images',
    referenceCostPerItem: 0,
    referenceNote: 'Maks. 5 referensi (gratis, harga tetap sama di semua ukuran).',
    maxNumImages: 4,
    outputFormats: ['png', 'jpeg', 'webp'],
    defaultOutputFormat: 'png',
    backgrounds: ['auto', 'opaque', 'transparent'],
    defaultBackground: 'auto',
    complexities: ['low', 'medium', 'high'],
    defaultComplexity: 'high',
    baseCreditsLabel: '70–675 kredit / gambar',
  },
  {
    id: 'gpt-image-2.6-flare',
    name: 'GPT Image 2.6 Flare',
    provider: 'OpenAI',
    tagline: 'Cepat untuk iterasi harian & teks tajam',
    description:
      'Varian cepat GPT Image 2.6 untuk produksi harian dan edit kilat. Mendukung kontrol Complexity, 5 tingkat kualitas, latar transparan, dan format WebP/PNG/JPEG.',
    aspectRatios: ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', 'auto'],
    defaultAspectRatio: '1:1',
    resolutionField: 'resolution',
    resolutions: ['1K', '2K', '4K'],
    defaultResolution: '1K',
    qualityLevels: ['low', 'medium', 'high', 'xhigh', 'max'],
    defaultQuality: 'medium',
    maxReferences: 5,
    referenceField: 'reference_images',
    referenceCostPerItem: 0,
    referenceNote: 'Maks. 5 referensi (gratis, harga tetap sama di semua ukuran).',
    maxNumImages: 4,
    outputFormats: ['png', 'jpeg', 'webp'],
    defaultOutputFormat: 'png',
    backgrounds: ['auto', 'opaque', 'transparent'],
    defaultBackground: 'auto',
    complexities: ['low', 'medium', 'high'],
    defaultComplexity: 'high',
    baseCreditsLabel: '70–675 kredit / gambar',
  },
];

export function getModelConfig(modelId: ModelId): ModelConfig {
  return AI_MODELS.find((m) => m.id === modelId) || AI_MODELS[0];
}

export interface CreditEstimateInput {
  modelId: ModelId;
  resolution: ResolutionTier;
  quality: QualityLevel;
  numImages: number;
  referenceCount: number;
  googleSearch: boolean;
  imageSearch: boolean;
}

export function estimateGenerationCredits(input: CreditEstimateInput): number {
  const count = Math.max(1, input.numImages);
  const refs = Math.max(0, input.referenceCount);

  switch (input.modelId) {
    case 'nano-banana-2.1': {
      const base = input.resolution === '4K' ? 150 : input.resolution === '2K' ? 70 : 45;
      const searchExtra = input.imageSearch ? 20 : input.googleSearch ? 10 : 0;
      return (base + searchExtra) * count;
    }
    case 'seedream-5.5': {
      const base = input.resolution === '2K' ? 46 : 26;
      return (base + refs * 10) * count;
    }
    case 'kling-image-4.0': {
      const base = input.resolution === '4K' ? 115 : 75;
      return (base + refs * 4) * count;
    }
    case 'grok-imagine-image-2': {
      if (input.quality === 'medium') {
        return input.resolution === '2K' ? 100 : 80;
      }
      return input.resolution === '2K' ? 80 : 50;
    }
    case 'gpt-image-2': {
      const table: Record<ResolutionTier, Record<'low' | 'medium' | 'high', number>> = {
        '1K': { low: 30, medium: 60, high: 250 },
        '2K': { low: 60, medium: 120, high: 500 },
        '4K': { low: 90, medium: 180, high: 750 },
      };
      const q = input.quality === 'low' || input.quality === 'high' ? input.quality : 'medium';
      return table[input.resolution][q] * count;
    }
    case 'gpt-image-2.6-sunburst':
    case 'gpt-image-2.6-flare': {
      const prices: Record<QualityLevel, number> = {
        low: 70,
        medium: 120,
        high: 175,
        xhigh: 340,
        max: 675,
      };
      return (prices[input.quality] ?? 120) * count;
    }
  }
}

export const QUALITY_LABELS: Record<QualityLevel, { title: string; hint: string }> = {
  low: { title: 'Low', hint: 'Cepat & hemat' },
  medium: { title: 'Medium', hint: 'Seimbang' },
  high: { title: 'High', hint: 'Detail tinggi' },
  xhigh: { title: 'XHigh', hint: 'Sangat presisi' },
  max: { title: 'Max', hint: 'Maksimum' },
};
