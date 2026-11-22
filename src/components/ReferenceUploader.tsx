import React, { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2, Trash2, X } from 'lucide-react';
import { ReferenceImageItem } from '../types/studio';
import {
  fileToOptimizedDataUrl,
  formatBytes,
  uploadReferenceToServer,
} from '../utils/imageHelpers';

interface ReferenceUploaderProps {
  references: ReferenceImageItem[];
  onChange: React.Dispatch<React.SetStateAction<ReferenceImageItem[]>>;
  maxReferences: number;
  referenceNote: string;
  disabled?: boolean;
}

export const ReferenceUploader: React.FC<ReferenceUploaderProps> = ({
  references,
  onChange,
  maxReferences,
  referenceNote,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const remainingSlots = Math.max(0, maxReferences - references.length);
  const exceedsModelLimit = references.length > maxReferences;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || disabled) return;
    setUploadNotice(null);

    const incoming = Array.from(fileList).filter((file) =>
      file.type.startsWith('image/')
    );

    if (incoming.length === 0) {
      setUploadNotice('Pilih berkas gambar berformat PNG, JPG, atau WebP.');
      return;
    }

    if (remainingSlots <= 0) {
      setUploadNotice(
        `Model aktif mendukung maksimal ${maxReferences} gambar referensi.`
      );
      return;
    }

    const accepted = incoming.slice(0, remainingSlots);
    if (incoming.length > remainingSlots) {
      setUploadNotice(
        `Hanya ${remainingSlots} gambar pertama yang ditambahkan (batas model ${maxReferences} referensi).`
      );
    }

    for (const file of accepted) {
      const tempId = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const localPreview = URL.createObjectURL(file);

      onChange((prev) => [
        ...prev,
        {
          id: tempId,
          name: file.name,
          previewUrl: localPreview,
          remoteUrl: '',
          sizeBytes: file.size,
          uploading: true,
        },
      ]);

      try {
        const optimizedDataUrl = await fileToOptimizedDataUrl(file);
        const uploadedUrl = await uploadReferenceToServer(
          optimizedDataUrl,
          file.name,
          file.type || 'image/jpeg'
        );

        onChange((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { ...item, remoteUrl: uploadedUrl, uploading: false }
              : item
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal memproses gambar.';
        onChange((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { ...item, uploading: false, error: msg }
              : item
          )
        );
      }
    }
  };

  const handleAddUrl = () => {
    if (disabled || remainingSlots <= 0) return;
    const trimmed = urlDraft.trim();
    if (!trimmed) return;

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        setUploadNotice('Gunakan URL HTTP atau HTTPS yang valid.');
        return;
      }
    } catch {
      setUploadNotice('Format URL gambar tidak valid.');
      return;
    }

    const tempId = `ref_url_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    onChange((prev) => [
      ...prev,
      {
        id: tempId,
        name: trimmed.split('/').pop() || 'Referensi URL',
        previewUrl: trimmed,
        remoteUrl: trimmed,
        sizeBytes: 0,
        uploading: false,
      },
    ]);
    setUrlDraft('');
    setShowUrlInput(false);
    setUploadNotice(null);
  };

  const handleRemove = (id: string) => {
    onChange((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAll = () => {
    references.forEach((item) => {
      if (item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    onChange([]);
    setUploadNotice(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <label className="text-sm font-semibold text-slate-900">
            Gambar Referensi
          </label>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            {Math.min(references.length, maxReferences)} / {maxReferences} aktif
          </p>
        </div>

        <div className="flex items-center gap-2">
          {remainingSlots > 0 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowUrlInput((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>URL</span>
            </button>
          )}
          {references.length > 0 && (
            <button
              type="button"
              disabled={disabled}
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/80 border border-blue-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>
      </div>

      {exceedsModelLimit && (
        <p className="text-xs text-blue-800 bg-blue-50 border border-blue-200 px-3 py-2">
          Model ini memakai maksimal {maxReferences} referensi pertama dari daftar Anda.
        </p>
      )}

      {showUrlInput && remainingSlots > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="https://contoh.com/referensi.jpg"
            className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm bg-white/90 border border-blue-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[42px]"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
          >
            Tambah
          </button>
        </div>
      )}

      {remainingSlots > 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          onClick={() => !disabled && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label={`Unggah hingga ${maxReferences} gambar referensi`}
          className={`group relative border border-dashed transition-all p-3.5 text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/90'
              : 'border-blue-300/80 bg-white/60 hover:bg-blue-50/50 hover:border-blue-400'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple={maxReferences > 1}
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <ImagePlus className="w-4 h-4" aria-hidden="true" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-800">
              Seret gambar ke sini atau klik untuk memilih
            </p>
            <p className="text-[11px] text-slate-500">{referenceNote}</p>
          </div>
        </div>
      )}

      {uploadNotice && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
          {uploadNotice}
        </p>
      )}

      {references.length > 0 && (
        <div className="grid grid-cols-5 gap-1.5">
          {references.map((item, idx) => {
            const isActiveForModel = idx < maxReferences;
            return (
              <div
                key={item.id}
                className={`relative group aspect-square overflow-hidden bg-slate-100 border ${
                  isActiveForModel
                    ? 'border-blue-200/80'
                    : 'border-slate-200 opacity-45'
                }`}
              >
                <img
                  src={item.previewUrl}
                  alt={`Referensi ${idx + 1}: ${item.name}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {item.uploading && (
                  <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  </div>
                )}

                {item.error && (
                  <div
                    title={item.error}
                    className="absolute inset-0 bg-red-950/75 flex items-center justify-center text-[10px] text-white px-1 text-center"
                  >
                    Gagal
                  </div>
                )}

                <span className="absolute bottom-1 left-1 text-[10px] font-mono font-medium text-white bg-slate-900/75 px-1.5 py-0.5">
                  {idx + 1}
                </span>

                {item.sizeBytes > 0 && (
                  <span className="hidden sm:block absolute bottom-1 right-1 text-[9px] font-mono text-white/90 bg-slate-900/60 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatBytes(item.sizeBytes)}
                  </span>
                )}

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemove(item.id)}
                  aria-label={`Hapus referensi ${idx + 1}`}
                  className="absolute top-1 right-1 w-6 h-6 bg-slate-900/75 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
