'use client';

import { useState, useRef } from 'react';
import { updateWaliProfile, uploadAvatarAction, selectStudentAction } from '@/lib/actions';
import Link from 'next/link';

interface ProfilClientProps {
  parent: any;
  students: any[];
  activeStudentId: number;
}

export default function ProfilClient({ parent, students, activeStudentId }: ProfilClientProps) {
  const [avatar, setAvatar] = useState(parent?.avatar_url || '/logo.png');
  const [name, setName] = useState(parent?.name || '');
  const [phone, setPhone] = useState(parent?.phone || '');
  
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Show/Hide password states
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pwFormRef = useRef<HTMLFormElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Direct upload
    setLoadingAvatar(true);
    setProfileMsg(null);
    const formData = new FormData();
    formData.append('avatar', file);

    const result = await uploadAvatarAction(formData, parent.id);
    if (result.error) {
      setProfileMsg({ type: 'error', text: result.error });
    } else {
      setAvatar(result.avatarUrl);
      setProfileMsg({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
    }
    setLoadingAvatar(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateWaliProfile(formData, parent.id);

    if (result?.error) {
      setProfileMsg({ type: 'error', text: result.error });
    } else {
      setProfileMsg({ type: 'success', text: 'Profil berhasil disimpan!' });
    }
    setLoadingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingPassword(true);
    setPasswordMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateWaliProfile(formData, parent.id);

    if (result?.error) {
      setPasswordMsg({ type: 'error', text: result.error });
    } else {
      setPasswordMsg({ type: 'success', text: 'Password berhasil diubah!' });
      pwFormRef.current?.reset();
    }
    setLoadingPassword(false);
  };

  const handleSelectStudent = async (studentId: number) => {
    await selectStudentAction(studentId);
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      {/* Breadcrumbs */}
      <nav className="text-xs text-zinc-400 flex gap-1 items-center px-1 font-medium">
        <Link href="/wali" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[12px] text-zinc-600">chevron_right</span>
        <span className="text-white font-bold">Profil Saya</span>
      </nav>

      {/* Profile Card Header */}
      <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800 text-center relative flex flex-col items-center">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full border-4 border-zinc-800 overflow-hidden shadow-xl relative bg-zinc-950 flex items-center justify-center">
            {loadingAvatar ? (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-emerald-400">
                <span className="animate-spin material-symbols-outlined">sync</span>
              </div>
            ) : null}
            <img src={avatar} alt="Profile Photo" className="w-full h-full object-cover" />
          </div>
          {/* Edit overlay */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            type="button" 
            className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center shadow-lg hover:from-emerald-400 hover:to-teal-400 transition-colors cursor-pointer border-2 border-zinc-900"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
        </div>

        <h3 className="text-xl font-extrabold text-white mt-4">{name || parent?.name}</h3>
        <p className="text-xs text-zinc-400 mb-4 font-medium">{parent?.email}</p>

        {/* File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        <button 
          onClick={() => fileInputRef.current?.click()}
          type="button"
          disabled={loadingAvatar}
          className="flex items-center justify-center gap-2 px-6 py-2.5 border border-dashed border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-950/80 text-emerald-400 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
          {loadingAvatar ? 'Mengunggah...' : 'Upload Foto Baru'}
        </button>
        <span className="text-[10px] text-zinc-500 mt-2 font-medium">JPG, GIF atau PNG. Max size of 2MB</span>
      </div>

      {profileMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold border ${profileMsg.type === 'success' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'}`}>
          <span className="material-symbols-outlined text-[18px]">{profileMsg.type === 'success' ? 'check_circle' : 'error'}</span>
          {profileMsg.text}
        </div>
      )}

      {/* Data Santri (Anak) Card */}
      <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-emerald-400 text-[22px] font-bold">group</span>
          Data Santri (Anak)
        </h3>

        <div className="space-y-3">
          {students.map((student) => {
            const isSelected = student.id === activeStudentId;
            return (
              <div 
                key={student.id} 
                className={`flex justify-between items-center p-3.5 rounded-2xl border transition-colors ${
                  isSelected ? 'bg-zinc-950 border-emerald-500/50' : 'bg-zinc-950/60 border-zinc-800/80'
                }`}
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{student.name}</h4>
                  <div className="flex gap-2 text-[11px] text-zinc-400 mt-1">
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">school</span>
                      Kelas {student.class}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">badge</span>
                      NIS: {23000 + student.id}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl shadow-md">
                    Terpilih
                  </span>
                ) : (
                  <button
                    onClick={() => handleSelectStudent(student.id)}
                    type="button"
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer transition-colors border border-zinc-700"
                  >
                    Pilih
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Informasi Pribadi Card */}
      <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-emerald-400 text-[22px]">person</span>
          Informasi Pribadi
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Nama Lengkap</label>
            <input 
              type="text" 
              name="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required 
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Nomor Telepon (WhatsApp)</label>
            <input 
              type="text" 
              name="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              required 
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Email</label>
              <span className="text-[10px] bg-zinc-950 text-zinc-500 font-bold px-2 py-0.5 rounded-full border border-zinc-800 uppercase">Readonly</span>
            </div>
            <input 
              type="email" 
              value={parent?.email} 
              readOnly 
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800/60 text-zinc-500 rounded-2xl outline-none text-sm cursor-not-allowed"
            />
            <p className="text-[10px] text-zinc-500 mt-1 font-medium">Email digunakan untuk login dan tidak dapat diubah.</p>
          </div>

          <button
            type="submit"
            disabled={loadingProfile}
            className="flex items-center justify-center gap-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-2xl text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            {loadingProfile ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>

      {passwordMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold border ${passwordMsg.type === 'success' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'}`}>
          <span className="material-symbols-outlined text-[18px]">{passwordMsg.type === 'success' ? 'check_circle' : 'error'}</span>
          {passwordMsg.text}
        </div>
      )}

      {/* Keamanan Akun Card */}
      <div className="bg-zinc-900/90 rounded-3xl p-6 shadow-xl border border-zinc-800">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-emerald-400 text-[22px]">lock</span>
          Keamanan Akun
        </h3>

        <form ref={pwFormRef} onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Password Saat Ini</label>
            <div className="relative">
              <input 
                type={showCurrentPw ? 'text' : 'password'} 
                name="current_password" 
                placeholder="••••••••"
                required 
                className="w-full px-4 py-3 pr-10 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
              <button 
                type="button" 
                onClick={() => setShowCurrentPw(!showCurrentPw)} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showCurrentPw ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Password Baru</label>
            <div className="relative">
              <input 
                type={showNewPw ? 'text' : 'password'} 
                name="new_password" 
                placeholder="Minimal 8 karakter"
                required 
                className="w-full px-4 py-3 pr-10 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
              <button 
                type="button" 
                onClick={() => setShowNewPw(!showNewPw)} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showNewPw ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Konfirmasi Password Baru</label>
            <div className="relative">
              <input 
                type={showConfirmPw ? 'text' : 'password'} 
                name="confirm_password" 
                placeholder="Ulangi password baru"
                required 
                className="w-full px-4 py-3 pr-10 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPw(!showConfirmPw)} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPw ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingPassword}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-bold py-3 rounded-2xl text-xs shadow-md transition-colors cursor-pointer"
          >
            {loadingPassword ? 'Memproses...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
