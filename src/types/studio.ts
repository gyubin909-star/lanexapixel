import type {
  AspectRatioValue,
  BackgroundMode,
  ComplexityLevel,
  ModelId,
  OutputFormatMode,
  QualityLevel,
  ResolutionTier,
} from './models';

export interface ReferenceImageItem {
  id: string;
  name: string;
  previewUrl: string;
  remoteUrl: string;
  sizeBytes: number;
  uploading: boolean;
  error?: string;
}

export interface GeneratedImageEntry {
  position: number;
  url: string;
}

export interface GenerationRecord {
  id: string;
  jobId: string;
  modelId: ModelId;
  modelName: string;
  prompt: string;
  aspectRatio: AspectRatioValue;
  resolutionLabel: string;
  referenceCount: number;
  images: GeneratedImageEntry[];
  createdAt: string;
  durationSeconds: number;
  creditsUsed: number;
}

export interface ModelFormState {
  modelId: ModelId;
  prompt: string;
  aspectRatio: AspectRatioValue;
  resolution: ResolutionTier;
  quality: QualityLevel;
  numImages: number;
  outputFormat: OutputFormatMode;
  background: BackgroundMode;
  complexity: ComplexityLevel;
  googleSearch: boolean;
  imageSearch: boolean;
}

export interface CreditBalanceInfo {
  configured: boolean;
  available: boolean;
  total_available?: number;
  monthly_remaining?: number;
  monthly_limit?: number;
  monthly_used?: number;
  extra_credits?: number;
  error?: string;
}
