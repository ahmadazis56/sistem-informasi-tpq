'use client';

import { useState } from 'react';
import { getAttendance, saveAttendance, getTeacherAttendance, saveTeacherAttendance } from '@/lib/actions';
import * as XLSX from 'xlsx';

export default function AbsensiClient({
  initialAttendance,
  initialTeacherAttendance,
  classes,
  initialDate
}: {
  initialAttendance: any[];
  initialTeacherAttendance: any[];
  classes: string[];
  initialDate: string;
}) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [teacherAttendance, setTeacherAttendance] = useState(initialTeacherAttendance);
  const [activeTab, setActiveTab] = useState<'santri' | 'ustadz'>('santri');
  const [date, setDate] = useState(initialDate);
  const [classFilter, setClassFilter] = useState('Semua Kelas');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportExcel = () => {
    if (activeTab === 'santri') {
      const exportData = attendance.map(student => ({
        'Tanggal': date,
        'Nama Santri': student.name,
        'Kelas': student.class,
        'Status Kehadiran': student.status || 'Belum Diisi'
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi Santri');
      XLSX.writeFile(workbook, `Absensi_Santri_${classFilter.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.xlsx`);
    } else {
      const exportData = teacherAttendance.map(teacher => ({
        'Tanggal': date,
        'Nama Ustaz/Guru': teacher.name,
        'Peran': 'Ustaz/Guru',
        'Status Kehadiran': teacher.status || 'Belum Diisi'
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi Ustaz');
      XLSX.writeFile(workbook, `Absensi_Ustaz_${date}.xlsx`);
    }
  };

  // Status mapping to colors
  const statusColors: Record<string, string> = {
    'Hadir': 'bg-primary text-white border-primary',
    'Izin': 'bg-secondary text-white border-secondary',
    'Sakit': 'bg-amber-600 text-white border-amber-600',
    'Alpa': 'bg-error text-white border-error',
  };

  const handleDateChange = async (newDate: string) => {
    setDate(newDate);
    setLoading(true);
    const studentResult = await getAttendance(newDate, classFilter);
    const teacherResult = await getTeacherAttendance(newDate);
    setAttendance(studentResult);
    setTeacherAttendance(teacherResult);
    setLoading(false);
    setMessage(null);
  };

  const handleClassFilterChange = async (newClass: string) => {
    setClassFilter(newClass);
    setLoading(true);
    const result = await getAttendance(date, newClass);
    setAttendance(result);
    setLoading(false);
    setMessage(null);
  };

  const handleStatusChange = (studentId: number, newStatus: string) => {
    setAttendance(prev => prev.map(student => {
      if (student.student_id === studentId) {
        return { ...student, status: newStatus };
      }
      return student;
    }));
  };

  const handleTeacherStatusChange = (teacherId: number, newStatus: string) => {
    setTeacherAttendance(prev => prev.map(teacher => {
      if (teacher.teacher_id === teacherId) {
        return { ...teacher, status: newStatus };
      }
      return teacher;
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    const records = attendance
      .filter(a => a.status) // Only save those with a status
      .map(a => ({
        studentId: a.student_id,
        date: date,
        status: a.status
      }));

    if (records.length === 0) {
      setMessage({ type: 'error', text: 'Tidak ada absensi yang diisi.' });
      setLoading(false);
      return;
    }

    const result = await saveAttendance(records);
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Absensi berhasil disimpan.' });
      setTimeout(() => setMessage(null), 3000);
    }
    setLoading(false);
  };

  const handleSaveTeacher = async () => {
    setLoading(true);
    setMessage(null);
    
    const records = teacherAttendance
      .filter(a => a.status) // Only save those with a status
      .map(a => ({
        teacherId: a.teacher_id,
        date: date,
        status: a.status
      }));

    if (records.length === 0) {
      setMessage({ type: 'error', text: 'Tidak ada absensi ustaz yang diisi.' });
      setLoading(false);
      return;
    }

    const result = await saveTeacherAttendance(records);
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Absensi ustaz berhasil disimpan.' });
      setTimeout(() => setMessage(null), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {activeTab === 'santri' ? 'Kehadiran Santri' : 'Kehadiran Ustaz'}
          </h2>
          <p className="text-zinc-400 text-sm font-medium">
            {activeTab === 'santri'
              ? 'Catat absensi santri per kelas.'
              : 'Catat absensi ustaz dan ustadzah TPQ.'}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <input 
            type="date" 
            value={date} 
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-4 py-2.5 bg-zinc-950/90 border border-zinc-800 text-white rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          {activeTab === 'santri' && (
            <select
              value={classFilter}
              onChange={(e) => handleClassFilterChange(e.target.value)}
              className="px-4 py-2.5 bg-zinc-950/90 border border-zinc-800 text-white rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="Semua Kelas" className="bg-zinc-950 text-white">Semua Kelas</option>
              {classes.map(c => <option key={c} value={c} className="bg-zinc-950 text-white">{c}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1.5 bg-zinc-950 rounded-2xl border border-zinc-800">
        <button
          onClick={() => setActiveTab('santri')}
          className={`px-6 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'santri'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">group</span>
          Absensi Santri
        </button>
        <button
          onClick={() => setActiveTab('ustadz')}
          className={`px-6 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'ustadz'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">shield_person</span>
          Absensi Ustaz
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold border ${message.type === 'success' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'}`}>
          <span className="material-symbols-outlined text-[20px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          {message.text}
        </div>
      )}

      {/* Attendance List Card */}
      <div className="bg-zinc-900/90 rounded-3xl shadow-xl border border-zinc-800 overflow-hidden">
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm">
            {activeTab === 'santri'
              ? `Daftar Santri (${attendance.length})`
              : `Daftar Ustaz (${teacherAttendance.length})`}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={handleExportExcel}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-emerald-400 px-4 py-2 rounded-2xl flex items-center gap-2 font-semibold text-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Excel
            </button>
            <button 
              onClick={activeTab === 'santri' ? handleSave : handleSaveTeacher}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2 rounded-2xl flex items-center gap-2 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {loading ? 'Menyimpan...' : 'Simpan Absensi'}
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-zinc-800/60">
          {activeTab === 'santri' ? (
            attendance.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm font-medium">
                Tidak ada santri di kelas ini.
              </div>
            ) : (
              attendance.map(student => (
                <div key={student.student_id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-zinc-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-emerald-500/20">
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{student.name}</p>
                      <p className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-block mt-1 font-semibold">{student.class}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {['Hadir', 'Izin', 'Sakit', 'Alpa'].map(status => {
                      const isActive = student.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.student_id, status)}
                          className={`flex-1 md:flex-none px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                            isActive 
                              ? statusColors[status] 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          {status}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )
          ) : (
            teacherAttendance.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm font-medium">
                Tidak ada ustaz terdaftar.
              </div>
            ) : (
              teacherAttendance.map(teacher => (
                <div key={teacher.teacher_id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-zinc-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-emerald-500/20">
                      {teacher.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{teacher.name}</p>
                      <p className="text-xs text-teal-400 bg-teal-950/80 border border-teal-500/30 px-2.5 py-0.5 rounded-full inline-block mt-1 font-semibold">Ustaz/Guru</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {['Hadir', 'Izin', 'Sakit', 'Alpa'].map(status => {
                      const isActive = teacher.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleTeacherStatusChange(teacher.teacher_id, status)}
                          className={`flex-1 md:flex-none px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                            isActive 
                              ? statusColors[status] 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          {status}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

