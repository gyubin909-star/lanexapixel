import React from 'react';
import { Coins, RefreshCw } from 'lucide-react';
import { AI_MODELS } from '../types/models';
import { CreditBalanceInfo } from '../types/studio';

interface ModelSpecViewProps {
  apiConfigured: boolean | null;
  credits: CreditBalanceInfo | null;
  creditsLoading: boolean;
  onRefreshCredits: () => void;
  onSelectModelInStudio: (modelId: (typeof AI_MODELS)[number]['id']) => void;
}

export const ModelSpecView: React.FC<ModelSpecViewProps> = ({
  apiConfigured,
  credits,
  creditsLoading,
  onRefreshCredits,
  onSelectModelInStudio,
}) => {
  const totalAvailable = credits?.total_available ?? 0;
  const monthlyRemaining = credits?.monthly_remaining ?? 0;
  const monthlyLimit = credits?.monthly_limit ?? 0;
  const monthlyUsed = credits?.monthly_used ?? 0;
  const extraCredits = credits?.extra_credits ?? 0;
  const monthlyPercent =
    monthlyLimit > 0 ? Math.min(100, Math.round((monthlyRemaining / monthlyLimit) * 100)) : 0;

  return (
    <div className="w-full divide-y divide-blue-200/80">
      {/* Live Account Credits Panel */}
      <div className="glass-panel p-4 sm:p-6 lg:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Informasi Sisa Kredit & Spesifikasi
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Saldo kredit akun aktif serta rincian kontrol dari seluruh 7 model AI gambar.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={creditsLoading}
            onClick={onRefreshCredits}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 min-h-[42px] self-start sm:self-auto"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${creditsLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{creditsLoading ? 'Memuat...' : 'Segarkan Kredit'}</span>
          </button>
        </div>

        {/* Credits Display */}
        {credits?.available ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-surface-subtle p-4 sm:p-5 space-y-1">
              <span className="text-xs font-medium text-slate-500">
                Total Sisa Kredit Tersedia
              </span>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-blue-700">
                {totalAvailable.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-slate-500">
                Gabungan kredit bulanan + kredit tambahan
              </p>
            </div>

            <div className="glass-surface-subtle p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Sisa Kredit Bulanan</span>
                <span className="font-mono text-slate-700">
                  {monthlyRemaining.toLocaleString('id-ID')} /{' '}
                  {monthlyLimit.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="w-full h-2 bg-blue-100 overflow-hidden">
                <div
                  style={{ width: `${monthlyPercent}%` }}
                  className="h-full bg-blue-600 transition-all duration-300"
                />
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Terpakai bulan ini: {monthlyUsed.toLocaleString('id-ID')} kredit
              </p>
            </div>

            <div className="glass-surface-subtle p-4 sm:p-5 space-y-1">
              <span className="text-xs font-medium text-slate-500">
                Kredit Tambahan (Non-Reset)
              </span>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                {extraCredits.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-slate-500">
                Kredit paket tambahan yang tidak hangus bulanan
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50/70 border border-blue-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                {apiConfigured === false
                  ? 'Kunci API belum dikonfigurasi'
                  : creditsLoading
                  ? 'Memeriksa sisa kredit akun...'
                  : 'Saldo kredit belum dapat dimuat'}
              </p>
              <p className="text-xs text-slate-600">
                {credits?.error ||
                  'Pastikan kunci API yang aktif telah disetel di pengaturan Secrets / .env server.'}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600 whitespace-nowrap">
              {apiConfigured ? 'API Terpasang' : 'Menunggu Kunci API'}
            </span>
          </div>
        )}
      </div>

      {/* All 7 Models Specification Table */}
      <div className="glass-panel p-4 sm:p-6 lg:p-8 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Matriks Kontrol & Spesifikasi 7 Model AI
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Setiap model memiliki kontrol resolusi, tingkat kualitas, aspek rasio, dan batas gambar referensi tersendiri.
          </p>
        </div>

        <div className="overflow-x-auto border border-blue-100 bg-white/85">
          <table className="w-full text-left text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-blue-100 text-xs font-semibold text-slate-500 bg-blue-50/60">
                <th className="py-3 px-4">Model AI</th>
                <th className="py-3 px-4">Resolusi / Kualitas</th>
                <th className="py-3 px-4">Aspek Rasio</th>
                <th className="py-3 px-4">Maks. Ref</th>
                <th className="py-3 px-4 text-right">Biaya Kredit</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {AI_MODELS.map((m) => (
                <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{m.name}</div>
                    <div className="text-xs text-slate-500">
                      {m.provider} · {m.tagline}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700 font-mono">
                    {m.resolutions.join(', ')}
                    {m.qualityLevels.length > 0
                      ? ` (${m.qualityLevels.join('/')})`
                      : ''}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 font-mono">
                    {m.aspectRatios.length} rasio
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700 font-mono">
                    {m.maxReferences}{' '}
                    {m.referenceField === 'image' ? '(tunggal)' : 'gbr'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs font-mono text-slate-800 whitespace-nowrap">
                    {m.baseCreditsLabel}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectModelInStudio(m.id)}
                      className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors whitespace-nowrap cursor-pointer min-h-[38px]"
                    >
                      Pakai
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
