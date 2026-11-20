'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomNavBar = ({ role = 'guru' }: { role?: string }) => {
  const pathname = usePathname();

  const guruNavItems = [
    { label: 'Dashboard', icon: 'dashboard', href: '/' },
    { label: 'Santri', icon: 'group', href: '/santri' },
    { label: 'Absensi', icon: 'fact_check', href: '/absensi' },
    { label: 'Progres', icon: 'trending_up', href: '/progres' },
    { label: 'Bayar', icon: 'payments', href: '/bayar' },
  ];

  const waliNavItems = [
    { label: 'Beranda', icon: 'home', href: '/wali' },
    { label: 'Laporan', icon: 'description', href: '/wali/laporan' },
    { label: 'Presensi', icon: 'calendar_month', href: '/wali/presensi' },
    { label: 'Profil', icon: 'person', href: '/wali/profil' },
  ];

  const navItems = role === 'guru' ? guruNavItems : waliNavItems;

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-lg z-50 bg-zinc-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-1.5 transition-all duration-300">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' &&
              pathname.startsWith(item.href) &&
              item.href !== '/wali');
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 active:scale-95 transition-all duration-200 group"
            >
              <div
                className={`relative flex items-center justify-center w-12 h-7 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'text-zinc-400 group-hover:text-emerald-400'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                >
                  {item.icon}
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold tracking-tight transition-colors duration-200 ${
                  isActive
                    ? 'text-emerald-400 font-bold'
                    : 'text-zinc-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;


