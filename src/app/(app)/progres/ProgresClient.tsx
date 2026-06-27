'use client';

import { useState } from 'react';
import { saveProgressIqro, saveProgressSholat, saveProgressHafalan } from '@/lib/actions';
import SearchableSelect from '@/components/SearchableSelect';
import * as XLSX from 'xlsx';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

const surahList = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Ta Ha", "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara'", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Ya Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jasiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Az-Zariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hasyr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Tagabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddassir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Insyiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Gasyiyah", "Al-Fajr", "Al-Balad", "Asy-Syams", "Al-Lail", "Ad-Duha", "Asy-Syarh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takasur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun", "An-Nasr", "Al-Lahab", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

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

const sholatMaterials = [
  'Wudhu',
  'Lafaz Sebelum Azan',
  'Azan',
  'Doa Setelah Azan',
  'Iqomah',
  'Niat',
  'Iftitah',
  'Fatihah',
  'Ayat',
  'Ruku',
  'I\'tidal',
  'Sujud',
  'Duduk diantara dua sujud',
  'Tahiyat',
  'Salam',
  'Zikir',
  'Doa'
];

export default function ProgresClient({ students, iqroProgress, sholatProgress, hafalanProgress }: { students: any[], iqroProgress: any[], sholatProgress: any[], hafalanProgress: any[] }) {
  const [activeTab, setActiveTab] = useState<'iqro' | 'hafalan' | 'sholat' | 'laporan'>('iqro');
  const [selectedLevel, setSelectedLevel] = useState("Iqra' 1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Student report states
  const [reportStudentId, setReportStudentId] = useState<string | number>('');
  const [reportSubTab, setReportSubTab] = useState<'iqro' | 'hafalan' | 'sholat'>('iqro');
  const [expandedSurah, setExpandedSurah] = useState<string | null>(null);

  const selectedStudent = students.find(s => String(s.id) === String(reportStudentId));
  const studentIqro = iqroProgress.filter(p => String(p.student_id) === String(reportStudentId));
  const studentHafalan = hafalanProgress.filter(p => String(p.student_id) === String(reportStudentId));
  const studentSholat = sholatProgress.filter(p => String(p.student_id) === String(reportStudentId));

  const memorizedSurahs = studentHafalan.filter(
    (h: any) => h.status === 'SEMPURNA' || h.status === 'LANCAR'
  );
  const totalMemorized = memorizedSurahs.length;
  const percentage = surahsJuz30.length > 0 ? Math.round((totalMemorized / surahsJuz30.length) * 100) : 0;

  const handleExportExcelAll = () => {
    const exportData = students.map(student => {
      const studentIqroList = iqroProgress.filter(p => String(p.student_id) === String(student.id));
      const latestIqro = studentIqroList[0];

      const studentHafalanList = hafalanProgress.filter(p => String(p.student_id) === String(student.id));
      const memorized = studentHafalanList.filter(
        (h: any) => h.status === 'SEMPURNA' || h.status === 'LANCAR'
      );

      const studentSholatList = sholatProgress.filter(p => String(p.student_id) === String(student.id));
      const sholatCompleted = studentSholatList.filter((s: any) => s.status === 'SEMPURNA' || s.status === 'LANCAR');

      return {
        'Nama Santri': student.name,
        'Kelas': student.class || '-',
        'Orang Tua/Wali': student.parent_name || '-',
        'Jilid/Tingkat Mengaji': latestIqro ? latestIqro.level : 'Belum Ada',
        'Halaman/Surah Mengaji': latestIqro ? latestIqro.page_surah : '-',
        'Jumlah Hafalan Juz 30 (Surah)': memorized.length,
        'Hafalan Surah List': memorized.map(m => m.surah_name).join(', ') || '-',
        'Materi Sholat Lulus': sholatCompleted.length,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Progres Santri');
    XLSX.writeFile(workbook, `Laporan_Progres_Santri_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportExcelStudent = () => {
    if (!selectedStudent) return;

    const iqroData = studentIqro.map(p => ({
      'Tanggal': p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-',
      'Level': p.level,
      'Halaman/Surah': p.page_surah,
      'Catatan': p.notes || '-'
    }));

    const hafalanData = studentHafalan.map(h => ({
      'Tanggal': h.created_at ? new Date(h.created_at).toLocaleDateString('id-ID') : '-',
      'Nama Surah': h.surah_name,
      'Status': h.status,
      'Catatan': h.notes || '-'
    }));

    const sholatData = studentSholat.map(s => ({
      'Tanggal': s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : '-',
      'Materi': s.item_name,
      'Status': s.status,
      'Catatan': s.notes || '-'
    }));

    const workbook = XLSX.utils.book_new();

    const iqroWS = XLSX.utils.json_to_sheet(iqroData.length ? iqroData : [{'Info': 'Belum ada data'}]);
    XLSX.utils.book_append_sheet(workbook, iqroWS, 'Iqro & Quran');

    const hafalanWS = XLSX.utils.json_to_sheet(hafalanData.length ? hafalanData : [{'Info': 'Belum ada data'}]);
    XLSX.utils.book_append_sheet(workbook, hafalanWS, 'Hafalan Juz 30');

    const sholatWS = XLSX.utils.json_to_sheet(sholatData.length ? sholatData : [{'Info': 'Belum ada data'}]);
    XLSX.utils.book_append_sheet(workbook, sholatWS, 'Penilaian Sholat');

    XLSX.writeFile(workbook, `Progres_${selectedStudent.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  // Group students by class
  const studentsByClass = students.reduce((acc: Record<string, any[]>, student: any) => {
    const className = student.class || 'Tanpa Kelas';
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(student);
    return acc;
  }, {});

  // Sholat Categories
  const sholatCategories = [
    {
      name: 'Azan & Persiapan',
      items: ['Doa Sebelum Azan', 'Azan', 'Iqomah']
    },
    {
      name: 'Gerakan & Bacaan',
      items: ['Takbiratul Ihram', 'Al-Fatihah & Ayat', 'Rukuk & I\'tidal', 'Sujud & Duduk', 'Tasyahud & Salam']
    },
    {
      name: 'Zikir & Doa',
      items: ['Zikir', 'Doa Setelah Sholat']
    }
  ];

  const handleIqroSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);
    const result = await saveProgressIqro(formData);
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Progres Iqro/Quran berhasil disimpan.' });
      setTimeout(() => window.location.reload(), 1500);
    }
    setLoading(false);
  };

  const handleHafalanSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);
    const result = await saveProgressHafalan(formData);
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Progres hafalan Juz 30 berhasil disimpan.' });
      setTimeout(() => window.location.reload(), 1500);
    }
    setLoading(false);
  };

  const handleSholatSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);
    const result = await saveProgressSholat(formData);
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Penilaian Sholat berhasil disimpan.' });
      setTimeout(() => window.location.reload(), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Progres Belajar</h2>
        <p className="text-secondary text-sm">Catat perkembangan mengaji, hafalan Juz 30, dan penilaian ibadah sholat santri.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap bg-white rounded-xl shadow-sm p-1 border border-emerald-50 gap-1 sm:gap-0">
        <button
          onClick={() => setActiveTab('iqro')}
          className={`flex-1 min-w-[120px] py-3 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'iqro' ? 'bg-primary text-white shadow' : 'text-secondary hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">auto_stories</span>
          Iqro & Quran
        </button>
        <button
          onClick={() => setActiveTab('hafalan')}
          className={`flex-1 min-w-[120px] py-3 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'hafalan' ? 'bg-primary text-white shadow' : 'text-secondary hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">menu_book</span>
          Hafalan Juz 30
        </button>
        <button
          onClick={() => setActiveTab('sholat')}
          className={`flex-1 min-w-[120px] py-3 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'sholat' ? 'bg-primary text-white shadow' : 'text-secondary hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">man_4</span>
          Penilaian Sholat
        </button>
        <button
          onClick={() => setActiveTab('laporan')}
          className={`flex-1 min-w-[120px] py-3 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'laporan' ? 'bg-primary text-white shadow' : 'text-secondary hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          Laporan & Riwayat
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          {message.text}
        </div>
      )}

      {/* Iqro / Quran Tab */}
      {activeTab === 'iqro' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_document</span>
              Input Progres Mengaji
            </h3>
            
            <form action={handleIqroSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Santri</label>
                <SearchableSelect 
                  options={students} 
                  name="student_id" 
                  required 
                  placeholder="-- Pilih/Cari Santri --"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jilid / Tingkat</label>
                  <select name="level" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} required className="w-full px-4 py-2 border border-gray-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="Iqra' 1">Iqra' 1</option>
                    <option value="Iqra' 2">Iqra' 2</option>
                    <option value="Iqra' 3">Iqra' 3</option>
                    <option value="Iqra' 4">Iqra' 4</option>
                    <option value="Iqra' 5">Iqra' 5</option>
                    <option value="Iqra' 6">Iqra' 6</option>
                    <option value="Al-Quran">Al-Quran</option>
                    <option value="Tajwid">Tajwid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Halaman / Surah</label>
                  <select name="page_surah" required className="w-full px-4 py-2 border border-gray-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="">-- Pilih Halaman/Surah --</option>
                    {selectedLevel.includes("Iqra") ? (
                      Array.from({length: 45}, (_, i) => (
                        <option key={`hal-${i+1}`} value={`Halaman ${i+1}`}>Halaman {i+1}</option>
                      ))
                    ) : (
                      surahList.map((surah, idx) => (
                        <option key={surah} value={`Surah ${idx+1}: ${surah}`}>Surah {idx+1}: {surah}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {!selectedLevel.includes("Iqra") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ayat</label>
                  <input
                    type="text"
                    name="ayat"
                    placeholder="Contoh: 1-5, 10, atau Full"
                    className="w-full px-4 py-2 border border-gray-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea name="notes" rows={3} placeholder="Evaluasi kelancaran, tajwid, dll..." className="w-full px-4 py-2 border border-gray-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary outline-none"></textarea>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-medium transition-colors mt-2">
                {loading ? 'Menyimpan...' : 'Simpan Progres'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Riwayat Progres Terakhir
            </h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {iqroProgress.length === 0 ? (
                <p className="text-secondary text-sm text-center py-4">Belum ada riwayat progres.</p>
              ) : (
                iqroProgress.slice(0, 10).map((prog, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-xl bg-surface-container-low/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{prog.student_name}</p>
                        <p className="text-xs text-secondary">{formatDate(prog.created_at)}</p>
                      </div>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold border border-primary/20">
                        {prog.level}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm mb-1">{prog.page_surah}</p>
                    {prog.notes && <p className="text-xs text-secondary italic">"{prog.notes}"</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hafalan Juz 30 Tab */}
      {activeTab === 'hafalan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_document</span>
              Input Progres Hafalan Juz 30
            </h3>
            
            <form action={handleHafalanSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Santri</label>
                <SearchableSelect 
                  options={students} 
                  name="student_id" 
                  required 
                  placeholder="-- Pilih/Cari Santri --"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Surah (Juz 30)</label>
                <select name="surah_name" required className="w-full px-4 py-2 border border-gray-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white">
                  <option value="">-- Pilih Surah --</option>
                  {surahsJuz30.map(surah => (
                    <option key={surah} value={surah}>{surah}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Nilai Kelancaran</label>
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="status" value="BELUM LANCAR" className="peer sr-only" required />
                    <div className="text-center py-3 rounded-xl border border-gray-200 text-slate-900 text-sm font-medium peer-checked:bg-red-50 peer-checked:text-error peer-checked:border-error transition-all">
                      Belum Lancar
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="status" value="LANCAR" className="peer sr-only" required />
                    <div className="text-center py-3 rounded-xl border border-gray-200 text-slate-900 text-sm font-medium peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-checked:border-blue-700 transition-all">
                      Lancar
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="status" value="SEMPURNA" className="peer sr-only" required />
                    <div className="text-center py-3 rounded-xl border border-gray-200 text-slate-900 text-sm font-medium peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary shadow-sm transition-all">
                      Sempurna
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea name="notes" rows={3} placeholder="Makhraj, tajwid, atau saran perbaikan..." className="w-full px-4 py-2 border border-gray-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary outline-none"></textarea>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-medium transition-colors mt-2">
                {loading ? 'Menyimpan...' : 'Simpan Progres'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Riwayat Hafalan Terakhir
            </h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {hafalanProgress.length === 0 ? (
                <p className="text-secondary text-sm text-center py-4">Belum ada riwayat progres hafalan.</p>
              ) : (
                hafalanProgress.slice(0, 10).map((prog, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-xl bg-surface-container-low/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{prog.student_name}</p>
                        <p className="text-xs text-secondary">{formatDate(prog.created_at)}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prog.status === 'SEMPURNA' ? 'bg-emerald-100 text-primary border border-emerald-200' :
                        prog.status === 'LANCAR' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {prog.status}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm mb-1">Q.S. {prog.surah_name}</p>
                    {prog.notes && <p className="text-xs text-secondary italic">"{prog.notes}"</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sholat Tab */}
      {activeTab === 'sholat' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">task_alt</span>
              Form Penilaian Sholat & Doa
            </h3>

            <form action={handleSholatSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Santri</label>
                <SearchableSelect 
                  options={students} 
                  name="student_id" 
                  required 
                  placeholder="-- Pilih/Cari Santri --"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materi Uji</label>
                <select name="item_name" required className="w-full px-4 py-3 border border-gray-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white">
                  <option value="">-- Pilih Materi --</option>
                  {sholatMaterials.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Nilai Kelancaran</label>
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="status" value="BELUM LANCAR" className="peer sr-only" required />
                    <div className="text-center py-3 rounded-xl border border-gray-200 text-slate-900 text-sm font-medium peer-checked:bg-red-50 peer-checked:text-error peer-checked:border-error transition-all">
                      Belum Lancar
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="status" value="LANCAR" className="peer sr-only" required />
                    <div className="text-center py-3 rounded-xl border border-gray-200 text-slate-900 text-sm font-medium peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-checked:border-blue-700 transition-all">
                      Lancar
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="status" value="SEMPURNA" className="peer sr-only" required />
                    <div className="text-center py-3 rounded-xl border border-gray-200 text-slate-900 text-sm font-medium peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary shadow-sm transition-all">
                      Sempurna
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea name="notes" rows={2} placeholder="Saran perbaikan untuk santri..." className="w-full px-4 py-3 border border-gray-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary outline-none"></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-medium transition-colors shadow-sm">
                  {loading ? 'Menyimpan...' : 'Simpan Nilai'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Riwayat Penilaian Terakhir
            </h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {sholatProgress.length === 0 ? (
                <p className="text-secondary text-sm text-center py-4">Belum ada riwayat penilaian sholat.</p>
              ) : (
                sholatProgress.slice(0, 10).map((prog, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-xl bg-surface-container-low/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{prog.student_name}</p>
                        <p className="text-xs text-secondary">{formatDate(prog.created_at)}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prog.status === 'SEMPURNA' ? 'bg-emerald-100 text-primary border border-emerald-200' :
                        prog.status === 'LANCAR' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {prog.status}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm mb-1">{prog.item_name} ({prog.category})</p>
                    {prog.notes && <p className="text-xs text-secondary italic">"{prog.notes}"</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Laporan & Riwayat Tab */}
      {activeTab === 'laporan' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50 space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">search</span>
              Pilih Santri
            </h3>
            <p className="text-secondary text-xs mb-4">Cari nama santri untuk melihat laporan perkembangan lengkap dan detail riwayat belajarnya.</p>
            <SearchableSelect 
              options={students} 
              name="report_student_id" 
              placeholder="-- Cari Nama Santri --"
              defaultValue={reportStudentId}
              onSelect={(val) => setReportStudentId(val)}
            />
          </div>

          {!selectedStudent ? (
            <div className="space-y-6">
              {/* Directory Title */}
              <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">groups</span>
                    Daftar Santri per Kelas
                  </h4>
                  <p className="text-xs text-secondary mt-1">Klik tombol <strong>Detail</strong> pada nama santri untuk melihat rapor perkembangan belajarnya secara langsung.</p>
                </div>
                <button
                  onClick={handleExportExcelAll}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-sm transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export Excel Semua Progres
                </button>
              </div>

              {/* Grid of Classes */}
              <div className="space-y-6">
                {Object.keys(studentsByClass).sort().map((className) => {
                  const classStudents = studentsByClass[className];
                  return (
                    <div key={className} className="border border-emerald-100/60 rounded-2xl bg-slate-50/30 overflow-hidden">
                      <div className="bg-emerald-50/30 px-5 py-3.5 border-b border-emerald-100/60 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">school</span>
                          Kelas {className}
                        </span>
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                          {classStudents.length} Santri
                        </span>
                      </div>
                      
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {classStudents.sort((a, b) => a.name.localeCompare(b.name)).map((student) => (
                          <div key={student.id} className="p-4 border border-gray-150 rounded-xl bg-white flex justify-between items-center hover:shadow-sm transition-all duration-200">
                            <div className="pr-2">
                              <p className="font-bold text-slate-800 text-sm leading-snug">{student.name}</p>
                              {student.parent_name && (
                                <p className="text-[10px] text-secondary mt-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">person</span>
                                  {student.parent_name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => setReportStudentId(student.id)}
                              className="flex items-center gap-1 text-[11px] text-primary hover:text-white border border-primary/20 hover:bg-primary font-bold px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer shrink-0"
                            >
                              <span className="material-symbols-outlined text-[13px]">visibility</span>
                              Detail
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back button and Export button */}
              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={() => setReportStudentId('')}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-primary transition-colors border border-gray-200 hover:border-primary/20 px-3 py-2 rounded-xl bg-slate-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  Kembali ke Daftar Santri
                </button>
                <button
                  onClick={handleExportExcelStudent}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-sm transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export Excel Rapor
                </button>
              </div>

              {/* Student Profile Card */}
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h4>
                  <p className="text-sm text-secondary font-medium">Kelas: {selectedStudent.class || '-'}</p>
                  {selectedStudent.parent_name && (
                    <p className="text-xs text-secondary mt-1">Orang Tua/Wali: {selectedStudent.parent_name} ({selectedStudent.phone || '-'})</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20">
                    Iqro: {studentIqro[0]?.level || 'Belum ada data'}
                  </span>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-200">
                    Hafalan: {totalMemorized} Surah
                  </span>
                </div>
              </div>

              {/* Sub-Tabs */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setReportSubTab('iqro')}
                  className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                    reportSubTab === 'iqro' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-gray-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                  Iqro & Quran
                </button>
                <button
                  onClick={() => setReportSubTab('hafalan')}
                  className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                    reportSubTab === 'hafalan' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-gray-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  Hafalan Juz 30
                </button>
                <button
                  onClick={() => setReportSubTab('sholat')}
                  className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                    reportSubTab === 'sholat' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-gray-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">man_4</span>
                  Penilaian Sholat
                </button>
              </div>

              {/* Sub-Tab Content: Iqro */}
              {reportSubTab === 'iqro' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                    Riwayat Pembelajaran Mengaji
                  </h4>
                  {studentIqro.length === 0 ? (
                    <p className="text-secondary text-sm text-center py-6">Belum ada riwayat perkembangan mengaji.</p>
                  ) : (
                    <div className="relative border-l-2 border-primary/20 pl-4 ml-2 space-y-6">
                      {studentIqro.map((prog, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-emerald-50"></div>
                          <div className="bg-surface-container-low/45 p-4 border border-gray-100 rounded-xl">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-slate-800 text-sm">{prog.level}</span>
                              <span className="text-[10px] text-secondary font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                {formatDate(prog.created_at)}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 mb-1">{prog.page_surah}</p>
                            {prog.notes && (
                              <p className="text-xs text-secondary italic border-l-2 border-gray-200 pl-2 mt-2">
                                "{prog.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab Content: Hafalan */}
              {reportSubTab === 'hafalan' && (
                <div className="space-y-6">
                  {/* Completion stats banner */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary-container/20 border border-primary/20 rounded-2xl p-5">
                    <h4 className="font-bold text-primary-container-low text-xs flex items-center gap-1.5 mb-2">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Pencapaian Hafalan Juz 30
                    </h4>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-2xl font-black text-primary">{totalMemorized} <span className="text-xs font-semibold text-slate-500">dari 37 surah</span></span>
                      <span className="text-xs font-bold text-primary">{percentage}% Selesai</span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-800">Checklist Hafalan Surah</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {surahsJuz30.map((surah) => {
                        const record = studentHafalan.find(
                          (h: any) => h.surah_name.toLowerCase() === surah.toLowerCase()
                        );
                        const status = record?.status || 'BELUM';
                        const isExpanded = expandedSurah === surah;

                        const getStatusStyles = () => {
                          switch (status) {
                            case 'SEMPURNA':
                              return 'bg-emerald-50 border-emerald-100 text-primary hover:bg-emerald-100/50';
                            case 'LANCAR':
                              return 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100/50';
                            case 'BELUM LANCAR':
                              return 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100/50';
                            default:
                              return 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100/50';
                          }
                        };

                        return (
                          <div key={surah} className="w-full">
                            <button
                              onClick={() => setExpandedSurah(isExpanded ? null : surah)}
                              type="button"
                              className={`w-full flex justify-between items-center px-4 py-2.5 rounded-xl border text-xs text-left transition-colors cursor-pointer ${getStatusStyles()}`}
                            >
                              <span className="font-bold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px]">
                                  {status === 'SEMPURNA' ? 'check_circle' : 
                                   status === 'LANCAR' ? 'stars' : 
                                   status === 'BELUM LANCAR' ? 'pending' : 'circle'}
                                </span>
                                {surah}
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-wider">
                                {status === 'BELUM' ? 'Belum Hafal' : status}
                              </span>
                            </button>
                            
                            {isExpanded && (
                              <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-650 space-y-1.5 animate-fadeIn">
                                <div className="flex justify-between">
                                  <span>Status Belajar:</span>
                                  <strong className="font-semibold text-slate-800">{status === 'BELUM' ? 'Belum Hafal' : status}</strong>
                                </div>
                                {record?.created_at && (
                                  <div className="flex justify-between">
                                    <span>Tanggal Penilaian:</span>
                                    <strong className="font-semibold text-slate-800">{formatDate(record.created_at)}</strong>
                                  </div>
                                )}
                                <div>
                                  <span>Catatan Pengajar:</span>
                                  <p className="mt-1 italic text-slate-500 bg-white p-2 rounded border border-slate-100">
                                    {record?.notes ? `"${record.notes}"` : 'Tidak ada catatan.'}
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

              {/* Sub-Tab Content: Sholat */}
              {reportSubTab === 'sholat' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                    Checklist Penilaian Ibadah & Sholat
                  </h4>
                  
                  {studentSholat.length === 0 ? (
                    <p className="text-secondary text-sm text-center py-6">Belum ada riwayat penilaian sholat.</p>
                  ) : (
                    <div className="space-y-6">
                      {sholatCategories.map((cat) => {
                        return (
                          <div key={cat.name} className="space-y-2">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.name}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {sholatMaterials.filter(item => {
                                const prepItems = ['Wudhu', 'Lafaz Sebelum Azan', 'Azan', 'Doa Setelah Azan', 'Doa Sebelum Azan', 'Iqomah'];
                                const movementItems = ['Niat', 'Iftitah', 'Fatihah', 'Ayat', 'Ruku', 'I\'tidal', 'Sujud', 'Duduk diantara dua sujud', 'Tahiyat', 'Salam', 'Takbiratul Ihram', 'Al-Fatihah & Ayat', 'Rukuk & I\'tidal', 'Sujud & Duduk', 'Tasyahud & Salam'];
                                const zikirItems = ['Zikir', 'Doa', 'Doa Setelah Sholat'];
                                
                                if (cat.name === 'Azan & Persiapan') return prepItems.includes(item);
                                if (cat.name === 'Gerakan & Bacaan') return movementItems.includes(item);
                                if (cat.name === 'Zikir & Doa') return zikirItems.includes(item);
                                return false;
                              }).map((material) => {
                                const record = studentSholat.find(
                                  (s: any) => s.item_name.toLowerCase() === material.toLowerCase()
                                );
                                const status = record?.status || 'BELUM';
                                
                                const getBadgeStyles = () => {
                                  switch (status) {
                                    case 'SEMPURNA':
                                      return 'bg-emerald-100 text-primary border border-emerald-200';
                                    case 'LANCAR':
                                      return 'bg-blue-100 text-blue-700 border border-blue-200';
                                    case 'BELUM LANCAR':
                                      return 'bg-amber-100 text-amber-700 border border-amber-200';
                                    default:
                                      return 'bg-slate-100 text-slate-400 border border-slate-200';
                                  }
                                };

                                return (
                                  <div key={material} className="p-4 border border-gray-100 rounded-xl bg-slate-50/50 flex flex-col justify-between gap-2">
                                    <div className="flex justify-between items-start">
                                      <span className="font-semibold text-slate-800 text-sm">{material}</span>
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getBadgeStyles()}`}>
                                        {status === 'BELUM' ? 'Belum Diuji' : status}
                                      </span>
                                    </div>
                                    {record ? (
                                      <div className="text-xs space-y-1">
                                        {record.notes && (
                                          <p className="text-slate-500 italic">"{record.notes}"</p>
                                        )}
                                        <p className="text-[10px] text-secondary">Diuji: {formatDate(record.created_at)}</p>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic">Belum ada evaluasi.</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
