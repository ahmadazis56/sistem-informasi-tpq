'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LaporanClientProps {
  studentName: string;
  iqroHistory: any[];
  sholatHistory: any[];
  hafalanHistory: any[];
}

const surahsJuz30 = [
  "An-Naba'", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar",
  "Al-Mutaffifin", "Al-Insyiqaq", "Al-Buruj", "At-Tariq", "Al-A'la",
  "Al-Ghasyiyah", "Al-Fajr", "Al-Balad", "Asy-Syams", "Al-Lail",
  "Ad-Duha", "Asy-Syarh", "At-Tin", "Al-'Alaq", "Al-Qadr",
  "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takasur",
  "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un",
  "Al-Kausar", "Al-Kafirun", "An-Nasr", "Al-Lahab", "Al-Ikhlas",
  "Al-Falaq", "An-Nas"
];

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default function LaporanClient({ studentName, iqroHistory, sholatHistory, hafalanHistory }: LaporanClientProps) {
  const [activeTab, setActiveTab] = useState<'hafalan' | 'iqro' | 'sholat'>('hafalan');
  const [expandedSurah, setExpandedSurah] = useState<string | null>(null);

  // Calculate statistics for Juz 30
  const memorizedSurahs = hafalanHistory.filter(
    (h: any) => h.status === 'SEMPURNA' || h.status === 'LANCAR'
  );
  const totalMemorized = memorizedSurahs.length;
  const percentage = Math.round((totalMemorized / surahsJuz30.length) * 100);

  // Group sholat progress by category
  const sholatGrouped = sholatHistory.reduce((acc: any, curr: any) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      {/* Breadcrumbs */}
      <nav className="text-xs text-zinc-400 flex gap-1 items-center px-1 font-medium">
        <Link href="/wali" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[12px] text-zinc-600">chevron_right</span>
        <span className="text-white font-bold">Laporan Progres</span>
      </nav>

      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Rapor Progres Santri</h2>
        <p className="text-zinc-400 text-sm font-medium">Laporan pencapaian belajar untuk <strong className="text-emerald-400">{studentName}</strong>.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-950 rounded-2xl shadow-xl p-1.5 border border-zinc-800">
        <button
          onClick={() => setActiveTab('hafalan')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
            activeTab === 'hafalan' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">menu_book</span>
          Juz 30
        </button>
        <button
          onClick={() => setActiveTab('iqro')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
            activeTab === 'iqro' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">auto_stories</span>
          Mengaji
        </button>
        <button
          onClick={() => setActiveTab('sholat')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
            activeTab === 'sholat' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">man_4</span>
          Sholat
        </button>
      </div>

      {/* Hafalan Juz 30 Tab */}
      {activeTab === 'hafalan' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-gradient-to-br from-emerald-950/80 via-zinc-900 to-black border border-emerald-500/30 rounded-3xl p-5 shadow-xl">
            <h3 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 mb-2 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Pencapaian Hafalan Juz 30
            </h3>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-black text-white">{totalMemorized} <span className="text-sm font-semibold text-zinc-400">dari {surahsJuz30.length} surah</span></span>
              <span className="text-sm font-bold text-emerald-400">{percentage}% Selesai</span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-2.5 border border-zinc-800">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>

          {/* Surah List */}
          <div className="bg-zinc-900/90 rounded-3xl p-4 shadow-xl border border-zinc-800">
            <div className="flex justify-between items-center mb-4 px-1">
              <h4 className="text-sm font-bold text-white">Checklist Hafalan Surah</h4>
              <span className="text-[10px] text-zinc-400 italic">Klik surah untuk detail</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {surahsJuz30.map((surah) => {
                const record = hafalanHistory.find(
                  (h: any) => h.surah_name.toLowerCase() === surah.toLowerCase()
                );
                const status = record?.status || 'BELUM';
                const isExpanded = expandedSurah === surah;

                // Determine badge colors based on status
                const getStatusStyles = () => {
                  switch (status) {
                    case 'SEMPURNA':
                      return 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60';
                    case 'LANCAR':
                      return 'bg-teal-950/80 border-teal-500/30 text-teal-400 hover:bg-teal-900/60';
                    case 'BELUM LANCAR':
                      return 'bg-amber-950/80 border-amber-500/30 text-amber-400 hover:bg-amber-900/60';
                    default:
                      return 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-900';
                  }
                };

                return (
                  <div key={surah} className="col-span-2">
                    <button
                      onClick={() => setExpandedSurah(isExpanded ? null : surah)}
                      type="button"
                      className={`w-full flex justify-between items-center px-4 py-3 rounded-2xl border text-xs text-left transition-colors cursor-pointer ${getStatusStyles()}`}
                    >
                      <span className="font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">
                          {status === 'SEMPURNA' ? 'check_circle' : 
                           status === 'LANCAR' ? 'stars' : 
                           status === 'BELUM LANCAR' ? 'pending' : 'circle'}
                        </span>
                        {surah}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {status === 'BELUM' ? 'Belum Hafal' : status}
                      </span>
                    </button>
                    
                    {/* Expandable details panel */}
                    {isExpanded && (
                      <div className="mt-1 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2 mx-1">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Status Belajar:</span>
                          <strong className="font-semibold text-white">{status === 'BELUM' ? 'Belum Hafal' : status}</strong>
                        </div>
                        {record?.created_at && (
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Diupdate Pada:</span>
                            <strong className="font-semibold text-white">{formatDate(record.created_at)}</strong>
                          </div>
                        )}
                        <div>
                          <span className="text-zinc-400">Catatan Pengajar:</span>
                          <p className="mt-1 italic text-zinc-300 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                            {record?.notes ? `"${record.notes}"` : 'Tidak ada catatan khusus.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Iqro / Quran Tab */}
      {activeTab === 'iqro' && (
        <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-emerald-400 text-[22px]">history</span>
            Riwayat Pembelajaran Mengaji
          </h3>

          {iqroHistory.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8 font-medium">Belum ada riwayat perkembangan mengaji.</p>
          ) : (
            <div className="relative border-l-2 border-emerald-500/30 pl-4 ml-2 space-y-6">
              {iqroHistory.map((item: any, idx: number) => (
                <div key={item.id || idx} className="relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-[23px] top-1.5 w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-zinc-900"></span>
                  
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-zinc-400 font-medium">{formatDate(item.created_at)}</span>
                      <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        {item.level}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{item.page_surah}</h4>
                    {item.notes && (
                      <p className="text-xs text-zinc-400 italic mt-1.5 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sholat Tab */}
      {activeTab === 'sholat' && (
        <div className="space-y-4">
          {sholatHistory.length === 0 ? (
            <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800 text-center py-8">
              <p className="text-zinc-500 text-sm font-medium">Belum ada riwayat penilaian sholat.</p>
            </div>
          ) : (
            Object.entries(sholatGrouped).map(([category, items]: [string, any]) => (
              <div key={category} className="bg-zinc-900/90 rounded-3xl p-5 shadow-xl border border-zinc-800">
                <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5 pb-2 border-b border-zinc-800">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">bookmark</span>
                  {category}
                </h4>

                <div className="space-y-3">
                  {items.map((item: any) => (
                    <div key={item.id} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white">{item.item_name}</span>
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                          item.status === 'SEMPURNA' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' :
                          item.status === 'LANCAR' ? 'bg-teal-950/80 text-teal-400 border-teal-500/30' :
                          'bg-amber-950/80 text-amber-400 border-amber-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-zinc-400 italic bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

        </div>
      )}
    </div>
  );
}
