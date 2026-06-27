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
          <h2 className="text-2xl font-bold text-slate-900">
            {activeTab === 'santri' ? 'Kehadiran Santri' : 'Kehadiran Ustaz'}
          </h2>
          <p className="text-secondary text-sm">
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
            className="px-4 py-2 border border-gray-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
          {activeTab === 'santri' && (
            <select
              value={classFilter}
              onChange={(e) => handleClassFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('santri')}
          className={`px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'santri'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-base">group</span>
          Absensi Santri
        </button>
        <button
          onClick={() => setActiveTab('ustadz')}
          className={`px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'ustadz'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-base">shield_person</span>
          Absensi Ustaz
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          {message.text}
        </div>
      )}

      {/* Attendance List Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 overflow-hidden">
        <div className="p-4 bg-surface-container-low border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">
            {activeTab === 'santri'
              ? `Daftar Santri (${attendance.length})`
              : `Daftar Ustaz (${teacherAttendance.length})`}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export Excel
            </button>
            <button 
              onClick={activeTab === 'santri' ? handleSave : handleSaveTeacher}
              disabled={loading}
              className="bg-primary hover:bg-primary-container text-white px-6 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              {loading ? 'Menyimpan...' : 'Simpan Absensi'}
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {activeTab === 'santri' ? (
            attendance.length === 0 ? (
              <div className="p-8 text-center text-secondary">
                Tidak ada santri di kelas ini.
              </div>
            ) : (
              attendance.map(student => (
                <div key={student.student_id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-secondary bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">{student.class}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {['Hadir', 'Izin', 'Sakit', 'Alpa'].map(status => {
                      const isActive = student.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.student_id, status)}
                          className={`flex-1 md:flex-none px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                            isActive 
                              ? statusColors[status] 
                              : 'bg-white border-gray-200 text-slate-900 text-gray-600 hover:bg-gray-50'
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
              <div className="p-8 text-center text-secondary">
                Tidak ada ustaz terdaftar.
              </div>
            ) : (
              teacherAttendance.map(teacher => (
                <div key={teacher.teacher_id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {teacher.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{teacher.name}</p>
                      <p className="text-xs text-secondary bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">Ustaz/Guru</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {['Hadir', 'Izin', 'Sakit', 'Alpa'].map(status => {
                      const isActive = teacher.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleTeacherStatusChange(teacher.teacher_id, status)}
                          className={`flex-1 md:flex-none px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                            isActive 
                              ? statusColors[status] 
                              : 'bg-white border-gray-200 text-slate-900 text-gray-600 hover:bg-gray-50'
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
