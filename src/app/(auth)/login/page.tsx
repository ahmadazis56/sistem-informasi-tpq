'use client';

import { useState } from 'react';
import { loginAction } from '@/lib/actions';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    const result = await loginAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      window.location.href = result.role === 'guru' ? '/' : '/wali';
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden font-sans">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-3xl blur-md opacity-70 animate-float-slow"></div>
            <div className="relative w-24 h-24 rounded-2xl bg-slate-900/90 p-3 flex items-center justify-center border border-emerald-500/30 shadow-2xl backdrop-blur-xl">
              <img src="/logo.png" alt="Logo TPQ Darul Ikhlas" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            TPQ Darul Ikhlas
          </h2>
          <p className="mt-2 text-sm font-medium text-emerald-400/90">
            Sistem Manajemen Akademik & Pembayaran Digital
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">fact_check</span>
              Absensi Digital
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">payments</span>
              SPP Smart Tracking
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">analytics</span>
              Progres Belajar
            </span>
          </div>
        </div>

        {/* Login Form Glass Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden backdrop-blur-2xl">
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-300 p-3.5 rounded-2xl text-sm flex items-start gap-2.5 shadow-sm animate-shake">
                <span className="material-symbols-outlined text-[20px] shrink-0 text-red-400">error</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Email / Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-700/80 py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all duration-200"
                  placeholder="email@tpq.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-700/80 py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.99] shadow-lg shadow-emerald-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk Ke Portal
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Footer note inside card */}
          <div className="mt-6 text-center border-t border-white/5 pt-4">
            <p className="text-xs text-slate-400">
              Demo Portal &bull; TPQ Darul Ikhlas Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

