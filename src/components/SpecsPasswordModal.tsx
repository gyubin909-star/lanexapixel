import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Lock, X } from 'lucide-react';

interface SpecsPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SpecsPasswordModal: React.FC<SpecsPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(null);
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'gyubin99') {
      setError(null);
      setPassword('');
      onSuccess();
    } else {
      setError('Password salah. Silakan coba lagi.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="specs-auth-title"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm glass-panel border border-blue-200 bg-white/95 p-5 sm:p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="specs-auth-title"
                className="text-base font-bold text-slate-900"
              >
                Akses Tab Spesifikasi
              </h2>
              <p className="text-xs text-slate-500">
                Masukkan password untuk melihat sisa kredit dan spesifikasi model.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup popup password"
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label
              htmlFor="specs-password-input"
              className="text-xs font-semibold text-slate-800"
            >
              Password
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="specs-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Masukkan password..."
                autoComplete="off"
                className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-white border border-blue-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-0 top-0 h-full px-3 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-blue-200 transition-colors cursor-pointer min-h-[42px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer min-h-[42px]"
            >
              Buka Spesifikasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
