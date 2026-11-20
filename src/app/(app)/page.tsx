import { getDashboardStats, getRecentPayments } from '@/lib/actions';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function DashboardPage() {
  const session = await getSession();
  const stats = await getDashboardStats();
  const recentPayments = await getRecentPayments(5);

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Welcome Banner - Cyberpunk Dark */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 sm:p-8 text-white shadow-2xl border border-zinc-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {currentDate}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Selamat Datang, {session?.name}! 👋
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Ringkasan aktivitas akademik, absensi santri, dan pengelolaan SPP TPQ Darul Ikhlas secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/bayar"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_card</span>
              Catat SPP Baru
            </Link>
            <Link
              href="/absensi"
              className="px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs shadow-md transition-all duration-200 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              Presensi Santri
            </Link>
          </div>
        </div>
      </div>

      {/* Showcase Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Lunas Card */}
        <div className="group relative rounded-3xl bg-zinc-900/90 p-6 shadow-xl border border-zinc-800 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Total Lunas SPP
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 group-hover:scale-105 transition-transform origin-left">
                {formatRupiah(stats.paidTotal)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800">
            <span>Tercatat bulan ini</span>
            <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {stats.paidCount} Santri
            </span>
          </div>
        </div>

        {/* Belum Bayar Card */}
        <div className="group relative rounded-3xl bg-zinc-900/90 p-6 shadow-xl border border-zinc-800 hover:border-red-500/40 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Belum Dibayar
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 group-hover:scale-105 transition-transform origin-left">
                {formatRupiah(stats.unpaidTotal)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/30 shadow-inner group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800">
            <span>Menunggu pembayaran</span>
            <span className="font-bold text-red-400 bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-500/30">
              {stats.unpaidCount} Santri
            </span>
          </div>
        </div>

        {/* Progres Card */}
        <div className="group relative rounded-3xl bg-zinc-900/90 p-6 shadow-xl border border-zinc-800 hover:border-teal-500/40 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Progres Ketercapaian
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 group-hover:scale-105 transition-transform origin-left">
                {stats.percentage}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/30 shadow-inner group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-2xl">insights</span>
            </div>
          </div>
          <div className="space-y-1.5 pt-3 border-t border-zinc-800">
            <div className="w-full bg-zinc-800 rounded-full h-2.5 p-0.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
              <span>Target Bulanan</span>
              <span className="text-emerald-400">{stats.percentage}% Selesai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <span className="material-symbols-outlined text-xl">bolt</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Aksi Cepat Manajemen
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              Akses Langsung
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/santri"
              className="group relative p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/40 transition-all duration-200 flex flex-col items-center text-center shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 border border-emerald-500/20">
                <span className="material-symbols-outlined text-2xl">person_add</span>
              </div>
              <span className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400">
                Kelola Santri
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                Data & Wajah Santri
              </span>
            </Link>

            <Link
              href="/absensi"
              className="group relative p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-teal-500/40 transition-all duration-200 flex flex-col items-center text-center shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 border border-teal-500/20">
                <span className="material-symbols-outlined text-2xl">fact_check</span>
              </div>
              <span className="text-sm font-bold text-zinc-100 group-hover:text-teal-400">
                Isi Presensi
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                Kehadiran Harian
              </span>
            </Link>

            <Link
              href="/bayar"
              className="group relative p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/40 transition-all duration-200 flex flex-col items-center text-center shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 border border-emerald-500/20">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <span className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400">
                Pembayaran SPP
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                Pencatatan & Kuitansi
              </span>
            </Link>

            <Link
              href="/progres"
              className="group relative p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-indigo-500/40 transition-all duration-200 flex flex-col items-center text-center shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 border border-indigo-500/20">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <span className="text-sm font-bold text-zinc-100 group-hover:text-indigo-400">
                Progres Mengaji
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                Setoran Iqra / Quran
              </span>
            </Link>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                  <span className="material-symbols-outlined text-xl">history</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Transaksi SPP Terakhir
                </h3>
              </div>
              <Link
                href="/bayar"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
              >
                Lihat Semua
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </Link>
            </div>

            {recentPayments.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">
                <span className="material-symbols-outlined text-5xl mb-2 opacity-40">receipt_long</span>
                <p className="text-sm font-medium">Belum ada riwayat transaksi</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentPayments.map((payment: any) => {
                  const initials = payment.student_name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <li
                      key={payment.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/80 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-emerald-500/20">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-zinc-100">
                            {payment.student_name}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-medium">
                            Periode: {payment.month} {payment.year}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-xs sm:text-sm text-white">
                          {formatRupiah(payment.amount)}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          LUNAS
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-center">
            <span className="text-[11px] text-zinc-500 font-medium">
              Data terverifikasi & terintegrasi dengan database sqlite/postgres
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


