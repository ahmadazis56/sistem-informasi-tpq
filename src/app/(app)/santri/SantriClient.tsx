'use client';

import { useState } from 'react';
import { addStudent, updateStudent, deleteStudent, getStudents } from '@/lib/actions';
import * as XLSX from 'xlsx';

export default function SantriClient({ initialStudents, classes }: { initialStudents: any[], classes: string[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('Semua');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleExportExcel = () => {
    const exportData = students.map(student => ({
      'Nama Santri': student.name,
      'Kelas': student.class,
      'Nama Orang Tua / Wali': student.parent_name,
      'No. Telepon / HP': student.phone || '-',
      'Alamat': student.address || '-',
      'Tanggal Terdaftar': student.created_at ? new Date(student.created_at).toLocaleDateString('id-ID') : '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Santri');
    XLSX.writeFile(workbook, `Data_Santri_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = await getStudents(search, classFilter);
    setStudents(result);
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedStudent(null);
    setIsModalOpen(true);
    setMessage(null);
  };

  const openEditModal = (student: any) => {
    setModalMode('edit');
    setSelectedStudent(student);
    setIsModalOpen(true);
    setMessage(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);
    let result: any;

    if (modalMode === 'add') {
      result = await addStudent(formData);
    } else {
      formData.append('id', selectedStudent.id);
      result = await updateStudent(formData);
    }

    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ 
        type: 'success', 
        text: modalMode === 'add' 
          ? `Santri berhasil ditambahkan. Akun Wali: ${result?.email}` 
          : 'Data santri berhasil diubah.' 
      });
      setTimeout(() => {
        closeModal();
        handleSearch();
      }, 2000);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus santri ${name}? Data absen dan SPP juga akan terhapus.`)) {
      const result = await deleteStudent(id);
      if (result.error) {
        alert(result.error);
      } else {
        handleSearch();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Manajemen Santri</h2>
          <p className="text-zinc-400 text-sm font-medium">Total {students.length} santri terdaftar</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportExcel}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-emerald-400 px-4 py-2.5 rounded-2xl flex items-center gap-2 font-semibold text-xs shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Excel
          </button>
          <button 
            onClick={openAddModal}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Tambah Santri
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-900/90 rounded-3xl p-4 shadow-xl border border-zinc-800">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Cari nama santri..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 text-white placeholder-zinc-500 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <select 
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
            }}
            className="px-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
          >
            <option value="Semua" className="bg-zinc-950 text-white">Semua Kelas</option>
            {classes.map(c => (
              <option key={c} value={c} className="bg-zinc-950 text-white">{c}</option>
            ))}
          </select>
          <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-2xl font-bold text-xs transition-colors border border-zinc-700 shadow-md">
            Filter
          </button>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-zinc-900/90 rounded-3xl shadow-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 text-zinc-300 text-xs uppercase tracking-wider border-b border-zinc-800">
                <th className="px-6 py-4 font-bold">Santri</th>
                <th className="px-6 py-4 font-bold">Kelas</th>
                <th className="px-6 py-4 font-bold">Kontak Wali</th>
                <th className="px-6 py-4 font-bold">Alamat</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-sm font-medium">
                    Tidak ada data santri ditemukan.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-emerald-500/20">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-white text-sm">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-bold text-zinc-200">{student.parent_name}</p>
                      <p className="text-zinc-400 text-xs font-mono">{student.phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 max-w-[200px] truncate" title={student.address}>
                      {student.address || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(student)} className="text-blue-400 hover:bg-blue-950/60 p-2 rounded-xl transition-colors mr-1 border border-transparent hover:border-blue-800/40">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(student.id, student.name)} className="text-red-400 hover:bg-red-950/60 p-2 rounded-xl transition-colors border border-transparent hover:border-red-800/40">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-bold text-white">
                  {modalMode === 'add' ? 'Tambah Santri' : 'Edit Santri'}
                </h3>
                <button onClick={closeModal} className="text-zinc-400 hover:bg-zinc-800 p-1.5 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {message && (
                <div className={`p-3.5 rounded-2xl text-xs font-semibold mb-4 border ${message.type === 'error' ? 'bg-red-950/60 border-red-800 text-red-300' : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'}`}>
                  {message.text}
                </div>
              )}

              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Nama Lengkap</label>
                  <input type="text" name="name" defaultValue={selectedStudent?.name} required className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Kelas</label>
                  <input type="text" name="class" defaultValue={selectedStudent?.class} required className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Nama Wali Santri</label>
                  <input type="text" name="parent_name" defaultValue={selectedStudent?.parent_name} placeholder="Contoh: Bpk. Budi" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Nomor WA Wali</label>
                  <input type="text" name="phone" defaultValue={selectedStudent?.phone} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Alamat</label>
                  <textarea name="address" defaultValue={selectedStudent?.address} rows={2} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"></textarea>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 bg-zinc-900 text-zinc-300 border border-zinc-800 py-3 rounded-2xl font-bold text-xs hover:bg-zinc-800 transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-2xl font-bold text-xs hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition-all shadow-md shadow-emerald-500/20">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

