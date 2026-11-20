import React from 'react';
import { logoutAction } from '@/lib/actions';

const TopAppBar = ({ userName = 'Pengguna' }: { userName?: string }) => {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800 shadow-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-9 h-9 rounded-full bg-zinc-950 p-1 flex items-center justify-center border border-zinc-700">
              <img src="/logo.png" alt="Logo TPQ" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-gradient-emerald">
                Darul Ikhlas
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                System Active
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wide">
              Management Portal
            </span>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
              {initials || 'U'}
            </div>
            <span className="text-xs font-semibold text-zinc-200">
              {userName}
            </span>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="group relative w-9 h-9 rounded-full bg-red-950/50 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200 flex items-center justify-center active:scale-90 border border-red-800/60"
              title="Keluar"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5">
                logout
              </span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;



