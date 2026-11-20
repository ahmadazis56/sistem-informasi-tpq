import { getSession } from '@/lib/auth';
import { getWaliDashboard } from '@/lib/actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Riwayat Presensi - Darul Ikhlas',
};

const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function getDayName(dateStr: string) {
  const date = new Date(dateStr);
  return indonesianDays[date.getDay()];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export default async function WaliPresensiPage() {
  const session = await getSession();
  if (!session || session.role !== 'wali_santri') redirect('/login');

  const data = await getWaliDashboard(session.id);
  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary">Belum ada data untuk ditampilkan.</p>
      </div>
    );
  }

  const { student, attendanceSummary, recentAttendance } = data;

  // Process attendance summary
  const getAttendanceCount = (status: string) => {
    const record = attendanceSummary.find((r: any) => r.status === status);
    return record ? parseInt(record.count) : 0;
  };

  const hadirCount = getAttendanceCount('Hadir');
  const izinCount = getAttendanceCount('Izin');
  const sakitCount = getAttendanceCount('Sakit');
  const alpaCount = getAttendanceCount('Alpa');
  const totalDays = hadirCount + izinCount + sakitCount + alpaCount;
  const attendanceRate = totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 0;

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      {/* Breadcrumbs */}
      <nav className="text-xs text-zinc-400 flex gap-1 items-center px-1 font-medium">
        <Link href="/wali" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[12px] text-zinc-600">chevron_right</span>
        <span className="text-white font-bold">Riwayat Presensi</span>
      </nav>

      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Kehadiran Santri</h2>
        <p className="text-zinc-400 text-sm font-medium">Riwayat kehadiran kelas untuk <strong className="text-emerald-400">{student.name}</strong>.</p>
      </div>

      {/* Summary Box */}
      <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800">
          <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">analytics</span>
            Persentase Kehadiran
          </h3>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
            {attendanceRate}% Hadir
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="bg-emerald-950/80 rounded-2xl p-3 text-center border border-emerald-500/30">
            <p className="text-2xl font-black text-emerald-400">{hadirCount}</p>
            <p className="text-[10px] uppercase font-bold text-emerald-300 mt-1">Hadir</p>
          </div>
          <div className="bg-teal-950/80 rounded-2xl p-3 text-center border border-teal-500/30">
            <p className="text-2xl font-black text-teal-400">{izinCount}</p>
            <p className="text-[10px] uppercase font-bold text-teal-300 mt-1">Izin</p>
          </div>
          <div className="bg-amber-950/80 rounded-2xl p-3 text-center border border-amber-500/30">
            <p className="text-2xl font-black text-amber-400">{sakitCount}</p>
            <p className="text-[10px] uppercase font-bold text-amber-300 mt-1">Sakit</p>
          </div>
          <div className="bg-red-950/80 rounded-2xl p-3 text-center border border-red-500/30">
            <p className="text-2xl font-black text-red-400">{alpaCount}</p>
            <p className="text-[10px] uppercase font-bold text-red-300 mt-1">Alpa</p>
          </div>
        </div>
        <p className="text-[10px] text-zinc-500 text-center mt-2 font-medium">Data dihitung dari 30 hari terakhir pembelajaran aktif.</p>
      </div>

      {/* Attendance History List */}
      <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-emerald-400 text-[22px]">format_list_bulleted</span>
          Jurnal Absensi Harian
        </h3>

        {recentAttendance.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-8 font-medium">Belum ada data kehadiran santri.</p>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {recentAttendance.map((att: any) => (
              <div key={att.id} className="flex justify-between items-center py-3.5">
                <div>
                  <h4 className="font-bold text-white text-xs">
                    {getDayName(att.date)}, {formatDate(att.date)}
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-medium">Jam Pembelajaran TPQ</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                  att.status === 'Hadir' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' :
                  att.status === 'Izin' ? 'bg-teal-950/80 text-teal-400 border-teal-500/30' :
                  att.status === 'Sakit' ? 'bg-amber-950/80 text-amber-400 border-amber-500/30' :
                  'bg-red-950/80 text-red-400 border-red-500/30'
                }`}>
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

