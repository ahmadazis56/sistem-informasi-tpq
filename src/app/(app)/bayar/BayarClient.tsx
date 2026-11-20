'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { recordPayment, getPaymentStatusReport, togglePaymentStatus, batchTogglePaymentStatus } from '@/lib/actions';
import SearchableSelect from '@/components/SearchableSelect';
import * as XLSX from 'xlsx';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function BayarClient({ students, recentPayments }: { students: any[], recentPayments: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const currentMonth = months[new Date().getMonth()];

  const [filterType, setFilterType] = useState('SPP');
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [formMonth, setFormMonth] = useState(currentMonth);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<'semua' | 'lunas' | 'belum'>('semua');

  // Checkbox selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // Filter and search logic
  const filteredData = reportData.filter(row => {
    const matchesSearch = row.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === 'semua' || 
      (statusFilter === 'lunas' && row.status.startsWith('Lunas')) ||
      (statusFilter === 'belum' && row.status === 'Belum Bayar');
    return matchesSearch && matchesStatus;
  });

  const fetchReport = async (type: string, month: string, year: number) => {
    setLoadingReport(true);
    try {
      const data = await getPaymentStatusReport(month, year, type);
      setReportData(data);
    } catch (error) {
      console.error('Gagal mengambil laporan:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchReport(filterType, filterMonth, filterYear);
    // Reset selection on filter change
    setSelectedStudentIds([]);
  }, [filterType, filterMonth, filterYear]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);
    const submittedMonth = formData.get('month') as string;
    const result = await recordPayment(formData);
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Pembayaran SPP berhasil dicatat.' });
      // Automatically sync table filter month with the submitted month to prevent confusion
      if (submittedMonth && months.includes(submittedMonth)) {
        setFilterMonth(submittedMonth);
        await fetchReport(filterType, submittedMonth, filterYear);
      } else {
        await fetchReport(filterType, filterMonth, filterYear);
      }
      router.refresh();
    }
    setLoading(false);
  };

  const handleToggleStatus = async (studentId: number, targetStatus: 'Lunas' | 'Belum Bayar') => {
    if (targetStatus === 'Belum Bayar') {
      const confirmCancel = window.confirm('Apakah Anda yakin ingin membatalkan status LUNAS untuk santri ini?');
      if (!confirmCancel) return;
    }
    
    setActionLoading(prev => ({ ...prev, [studentId]: true }));
    setMessage(null);
    
    const amount = 50000;
    
    const result = await togglePaymentStatus(
      studentId,
      filterMonth,
      filterYear,
      filterType,
      targetStatus,
      amount
    );
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ 
        type: 'success', 
        text: `Status pembayaran berhasil diubah menjadi ${targetStatus === 'Lunas' ? 'Lunas' : 'Belum Bayar'}.` 
      });
      await fetchReport(filterType, filterMonth, filterYear);
      router.refresh();
    }
    setActionLoading(prev => ({ ...prev, [studentId]: false }));
  };

  // Batch toggle status (Centang-centang lalu simpan)
  const handleBatchToggleStatus = async (targetStatus: 'Lunas' | 'Belum Bayar') => {
    if (selectedStudentIds.length === 0) return;

    if (targetStatus === 'Belum Bayar') {
      const confirmCancel = window.confirm(`Apakah Anda yakin ingin membatalkan status LUNAS untuk ${selectedStudentIds.length} santri terpilih?`);
      if (!confirmCancel) return;
    }

    setBatchLoading(true);
    setMessage(null);

    const result = await batchTogglePaymentStatus(
      selectedStudentIds,
      filterMonth,
      filterYear,
      filterType,
      targetStatus
    );

    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({
        type: 'success',
        text: `Berhasil mengubah status ${result.count || selectedStudentIds.length} santri menjadi ${targetStatus === 'Lunas' ? 'Lunas' : 'Belum Bayar'} untuk periode ${filterType === 'SPP' ? filterMonth + ' ' + filterYear : filterYear}.`
      });
      setSelectedStudentIds([]);
      await fetchReport(filterType, filterMonth, filterYear);
      router.refresh();
    }
    setBatchLoading(false);
  };

  const toggleSelectAll = () => {
    if (filteredData.length === 0) return;
    const allFilteredIds = filteredData.map(r => r.studentId);
    const areAllSelected = allFilteredIds.every(id => selectedStudentIds.includes(id));

    if (areAllSelected) {
      // Unselect all filtered
      setSelectedStudentIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const toggleSelectStudent = (studentId: number) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const selectUnpaidOnly = () => {
    const unpaidIds = filteredData.filter(r => r.status === 'Belum Bayar').map(r => r.studentId);
    if (unpaidIds.length === 0) {
      setMessage({ type: 'error', text: 'Tidak ada santri yang Belum Bayar pada tampilan saat ini.' });
      return;
    }
    setSelectedStudentIds(unpaidIds);
  };

  const handleExportExcel = () => {
    const period = filterType === 'SPP' ? `${filterMonth} ${filterYear}` : filterYear;
    const title = `LAPORAN STATUS PEMBAYARAN - TPQ DARUL IKHLAS`;
    const subtitle = `Tipe: ${filterType === 'SPP' ? 'SPP Bulanan' : 'Daftar Ulang Tahunan'} (${period})`;
    const exportTime = `Tanggal Unduh: ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date())}`;
    
    const aoaData = [
      [title],
      [subtitle],
      [exportTime],
      [],
      ['No', 'Nama Santri', 'Kelas', 'Status', 'Nominal', 'Tanggal Pembayaran']
    ];

    filteredData.forEach((row, index) => {
      const formattedDate = row.paymentDate 
        ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(row.paymentDate)) 
        : '-';
      
      aoaData.push([
        index + 1,
        row.studentName,
        row.studentClass,
        row.status,
        row.status.startsWith('Lunas') ? row.amount : 0,
        formattedDate
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(aoaData);

    const colWidths = [5, 25, 12, 15, 15, 20];
    aoaData.forEach((row) => {
      row.forEach((cellVal, colIdx) => {
        if (cellVal !== undefined && cellVal !== null) {
          const valStr = cellVal.toString();
          if (valStr.length > colWidths[colIdx]) {
            colWidths[colIdx] = valStr.length;
          }
        }
      });
    });

    worksheet['!cols'] = colWidths.map(w => ({ wch: w + 3 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Pembayaran');

    const fileName = `Laporan_Pembayaran_${filterType}_${period.toString().replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Pembayaran SPP</h2>
        <p className="text-zinc-400 text-sm font-medium">Catat pembayaran SPP bulanan santri secara perorangan atau kolektif (centang massal).</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form Section */}
        <div className="flex-grow lg:w-2/3">
          <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-base">
              <span className="material-symbols-outlined text-emerald-400">add_card</span>
              Form Pencatatan SPP (Perorangan)
            </h3>

            {message && (
              <div className={`p-4 rounded-2xl flex items-center gap-2 mb-6 text-xs font-semibold border ${message.type === 'success' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'}`}>
                <span className="material-symbols-outlined text-[20px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                {message.text}
              </div>
            )}

            <form action={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Pilih Santri</label>
                <SearchableSelect 
                  options={students} 
                  name="student_id" 
                  required 
                  placeholder="-- Pilih/Cari Santri --"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Tipe Pembayaran</label>
                <select name="payment_type" required className="w-full px-4 py-3 border border-zinc-800 text-white rounded-2xl outline-none bg-zinc-950/90 text-sm cursor-pointer">
                  <option value="SPP" className="bg-zinc-950 text-white">SPP Bulanan</option>
                  <option value="Daftar Ulang" className="bg-zinc-950 text-white">Daftar Ulang Tahunan</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Bulan</label>
                  <select 
                    name="month" 
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    required 
                    className="w-full px-4 py-3 border border-zinc-800 text-white rounded-2xl outline-none bg-zinc-950/90 text-sm cursor-pointer"
                  >
                    {months.map(m => <option key={m} value={m} className="bg-zinc-950 text-white">{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Tahun</label>
                  <select name="year" defaultValue={currentYear} required className="w-full px-4 py-3 border border-zinc-800 text-white rounded-2xl outline-none bg-zinc-950/90 text-sm cursor-pointer">
                    {years.map(y => <option key={y} value={y} className="bg-zinc-950 text-white">{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Nominal (Rp)</label>
                <input type="number" name="amount" defaultValue={50000} required className="w-full px-4 py-3 border border-zinc-800 text-white rounded-2xl outline-none bg-zinc-950/90 text-sm font-bold" />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {loading ? 'Menyimpan...' : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Simpan Pembayaran
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info & History Section */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 rounded-3xl text-white shadow-xl border border-zinc-800 relative overflow-hidden">
            <span className="material-symbols-outlined absolute right-[-20px] bottom-[-20px] text-[120px] opacity-10 text-emerald-400">payments</span>
            <h3 className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-1">Iuran SPP Bulanan</h3>
            <p className="text-3xl font-extrabold text-white mb-2">Rp 50.000</p>
            <p className="text-xs text-emerald-400 font-semibold">Per bulan / santri</p>
            <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-400 font-medium">
              Daftar Ulang: Rp 50.000 (1x setahun)
            </div>
          </div>

          <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-emerald-400">history</span>
              Riwayat Terbaru
            </h3>
            
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">Belum ada pembayaran.</p>
              ) : (
                recentPayments.map(payment => (
                  <div key={payment.id} className="flex justify-between items-center border-b border-zinc-800/80 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-sm text-white">{payment.student_name}</p>
                      <p className="text-xs text-zinc-400">{payment.month} {payment.year} • <span className="font-semibold text-emerald-400">{payment.payment_type || 'SPP'}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-white">{formatRupiah(payment.amount)}</p>
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">LUNAS</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Laporan Status Pembayaran */}
      <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
              <span className="material-symbols-outlined text-emerald-400">analytics</span>
              Laporan Status Pembayaran
            </h3>
            <p className="text-zinc-400 text-xs font-medium">Pantau siapa saja yang sudah lunas atau belum. Gunakan centang untuk menyimpan pembayaran sekaligus banyak.</p>
          </div>
          
          {/* Stats summary */}
          <div className="flex gap-3">
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Lunas: {reportData.filter(r => r.status.startsWith('Lunas')).length}
            </span>
            <span className="bg-red-950/80 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              Belum: {reportData.filter(r => r.status === 'Belum Bayar').length}
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 rounded-2xl border border-zinc-800 text-white bg-zinc-950/90 outline-none text-xs font-semibold cursor-pointer"
            >
              <option value="SPP" className="bg-zinc-950 text-white">SPP Bulanan</option>
              <option value="Daftar Ulang" className="bg-zinc-950 text-white">Daftar Ulang Tahunan</option>
            </select>

            {filterType === 'SPP' && (
              <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-4 py-2.5 rounded-2xl border border-emerald-500/50 text-emerald-300 font-bold bg-zinc-950 outline-none text-xs cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                {months.map(m => <option key={m} value={m} className="bg-zinc-950 text-white">{m}</option>)}
              </select>
            )}

            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="px-4 py-2.5 rounded-2xl border border-zinc-800 text-white bg-zinc-950/90 outline-none text-xs font-semibold cursor-pointer"
            >
              {years.map(y => <option key={y} value={y} className="bg-zinc-950 text-white">{y}</option>)}
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-2xl border border-zinc-800 text-white bg-zinc-950/90 outline-none text-xs font-semibold cursor-pointer"
            >
              <option value="semua" className="bg-zinc-950 text-white">Semua Status</option>
              <option value="lunas" className="bg-zinc-950 text-white">Lunas (Sudah Bayar)</option>
              <option value="belum" className="bg-zinc-950 text-white">Belum Bayar</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Quick select unpaid button */}
            <button
              onClick={selectUnpaidOnly}
              className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 px-3 py-2.5 rounded-2xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Pilih otomatis semua santri yang Belum Bayar"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">checklist</span>
              Pilih Belum Bayar ({filteredData.filter(r => r.status === 'Belum Bayar').length})
            </button>

            {/* Search box */}
            <div className="relative w-full sm:w-56">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Cari nama santri..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-zinc-800 bg-zinc-950/90 text-white text-xs placeholder-zinc-500 outline-none"
              />
            </div>

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-emerald-400 px-4 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              Ekspor Excel
            </button>
          </div>
        </div>

        {/* Batch Action Bar (Shown when 1+ checkboxes are selected) */}
        {selectedStudentIds.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/40 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500 text-black font-extrabold px-3 py-1 rounded-xl text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_box</span>
                {selectedStudentIds.length} Santri Terpilih
              </span>
              <span className="text-xs text-zinc-300 font-medium">
                Periode: <strong className="text-emerald-400 font-bold">{filterType === 'SPP' ? `${filterMonth} ${filterYear}` : filterYear}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleBatchToggleStatus('Lunas')}
                disabled={batchLoading}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {batchLoading ? (
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">payments</span>
                )}
                Simpan Bayar Lunas ({selectedStudentIds.length})
              </button>

              <button
                onClick={() => handleBatchToggleStatus('Belum Bayar')}
                disabled={batchLoading}
                className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                title="Batal Bayar Santri Terpilih"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                Batal
              </button>

              <button
                onClick={() => setSelectedStudentIds([])}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                title="Batal Pilih"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/80">
          {loadingReport ? (
            <div className="text-center py-10 text-zinc-400 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-emerald-400">sync</span>
              <p className="text-xs">Memuat laporan...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-950/90 text-zinc-300 text-xs uppercase tracking-wider border-b border-zinc-800">
                    <th className="px-4 py-3.5 w-10 text-center">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900 cursor-pointer"
                        checked={filteredData.length > 0 && filteredData.every(r => selectedStudentIds.includes(r.studentId))}
                        onChange={toggleSelectAll}
                        title="Pilih / Batal Pilih Semua"
                      />
                    </th>
                    <th className="px-4 py-3.5 font-bold">No</th>
                    <th className="px-6 py-3.5 font-bold">Nama Santri</th>
                    <th className="px-6 py-3.5 font-bold">Kelas</th>
                    <th className="px-6 py-3.5 font-bold">Status</th>
                    <th className="px-6 py-3.5 font-bold">Nominal</th>
                    <th className="px-6 py-3.5 font-bold">Tanggal Pembayaran</th>
                    <th className="px-6 py-3.5 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-zinc-500 text-xs font-medium">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, idx) => {
                      const isSelected = selectedStudentIds.includes(row.studentId);
                      return (
                        <tr 
                          key={row.studentId} 
                          className={`transition-colors ${isSelected ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'hover:bg-zinc-800/40'}`}
                        >
                          <td className="px-4 py-3.5 text-center">
                            <input 
                              type="checkbox"
                              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900 cursor-pointer"
                              checked={isSelected}
                              onChange={() => toggleSelectStudent(row.studentId)}
                            />
                          </td>
                          <td className="px-4 py-3.5 text-zinc-400">{idx + 1}</td>
                          <td className="px-6 py-3.5 font-bold text-white">{row.studentName}</td>
                          <td className="px-6 py-3.5">
                            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              {row.studentClass}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              row.status.startsWith('Lunas') 
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' 
                                : 'bg-red-950/80 text-red-400 border-red-500/30'
                            }`}>
                              {row.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-white">
                            {row.amount > 0 ? formatRupiah(row.amount) : '-'}
                          </td>
                          <td className="px-6 py-3.5 text-zinc-400 text-xs">
                            {row.paymentDate 
                              ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(row.paymentDate)) 
                              : '-'}
                            {row.paymentMonth && row.paymentMonth !== filterMonth && filterType === 'SPP' && ` (di Bulan: ${row.paymentMonth})`}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            {row.status.startsWith('Lunas') ? (
                              <button
                                onClick={() => handleToggleStatus(row.studentId, 'Belum Bayar')}
                                disabled={actionLoading[row.studentId]}
                                className="bg-red-950/60 hover:bg-red-900/60 text-red-400 px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-red-800/60 disabled:opacity-50 cursor-pointer"
                              >
                                {actionLoading[row.studentId] ? (
                                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                ) : (
                                  <span className="material-symbols-outlined text-sm">cancel</span>
                                )}
                                Batal
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(row.studentId, 'Lunas')}
                                disabled={actionLoading[row.studentId]}
                                className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-emerald-800/60 disabled:opacity-50 cursor-pointer"
                              >
                                {actionLoading[row.studentId] ? (
                                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                ) : (
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
                                )}
                                Bayar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
