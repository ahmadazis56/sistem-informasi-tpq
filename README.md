# Sistem Informasi Manajemen TPQ Darul Ikhlas (TPQ Ihlas)

Aplikasi web modern dan layanan RESTful API untuk pengelolaan administrasi, pencatatan presensi santri & asatidz, manajemen keuangan SPP (dengan fitur cerdas *sibling payment sharing* & ekspor Excel), serta monitoring progres akademik santri (Iqro, Hafalan Surat Juz 30, dan Sholat).

> **Pengembang:** AHMAD AZIS SUPIADI  
> **NIM:** 2301040025  
> **Program Studi:** S1 Rekayasa Perangkat Lunak  
> **Fakultas:** Fakultas Teknik, Universitas Bumigora (Mataram, 2026)  

---

## 🌟 Fitur Utama Sistem

1. **Autentikasi & Role-Based Access Control (RBAC):**
   - Pemisahan hak akses antara **Pengajar (Guru/Asatidz)** dan **Wali Santri**.
   - Keamanan sesi berbasis HTTP-Only Cookie dan proteksi rute otomatis via Edge Middleware (`proxy.ts`).
2. **Manajemen Master Data Santri & Pengajar:**
   - CRUD data santri terintegrasi filter kelas (Iqra 1-6 dan Al-Qur'an), nomor telepon, alamat, dan data orang tua.
3. **Presensi Kehadiran Harian:**
   - Pencatatan kehadiran harian santri dan guru (Hadir, Izin, Sakit, Alpa) berbasis batch dengan ringkasan kehadiran instan.
4. **Manajemen Keuangan SPP & Sibling Payment Sharing:**
   - Pencatatan setoran SPP/iuran bulanan, pemantauan tunggakan, dan pelunasan kolektif santri bersaudara (*sibling group*).
   - Ekspor rekapitulasi pembayaran bulanan ke berkas **Microsoft Excel (.xlsx)** siap cetak.
5. **Monitoring Progres Akademik Santri:**
   - Digitalisasi kartu prestasi santri: jilid & halaman Iqro, kelulusan surat pendek Juz 30 (munaqasyah), dan evaluasi praktik sholat fardhu / doa harian.
6. **Portal Khusus Wali Santri:**
   - Dashboard monitoring perkembangan santri secara *real-time* khusus untuk putra-putri dari wali santri yang bersangkutan.
7. **Layanan RESTful API Lengkap:**
   - Dilengkapi route handler REST API untuk seluruh modul di `/api/...` yang siap diintegrasikan dan diuji via Postman.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Framework Web:** [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **UI Library:** [React 19](https://react.dev/) & [Tailwind CSS v4](https://tailwindcss.com/)
- **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/)
- **Basis Data Ganda (Dual-Database):**
  - Lokal (Development): SQLite 3 ([better-sqlite3](https://github.com/WiseLibs/better-sqlite3))
  - Produksi (Cloud): PostgreSQL ([@vercel/postgres](https://vercel.com/docs/storage/vercel-postgres))
- **Ikon & Desain:** Lucide React & Google Material Symbols
- **Pengolahan Laporan:** SheetJS (xlsx)

---

## 📁 Berkas Dokumentasi & Pengujian

- 📄 **Laporan Evaluasi Kualitas ISO/IEC 25010 (PDF):** `LAPORAN_EVALUASI_ISO25010_TPQ.pdf`
- 📝 **Laporan Evaluasi Kualitas ISO/IEC 25010 (Word):** `LAPORAN_EVALUASI_ISO25010_TPQ.docx`
- 📑 **Laporan Evaluasi Kualitas ISO/IEC 25010 (Markdown):** `LAPORAN_EVALUASI_ISO25010_TPQ.md`
- 📦 **Koleksi Postman v2.1 Siap Import:** `UAS_TPQ_Web_Service.postman_collection.json` / `postman_collection.json`
- 🌐 **Dokumentasi Postman Publik:** [Postman Documentation](https://documenter.getpostman.com/view/43068591/2sBXxTpQAzis)

---

## 🚀 Cara Menjalankan Proyek Lokal

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/ahmadazis56/sistem-informasi-tpq.git
   cd sistem-informasi-tpq
   ```

2. **Instalasi Dependensi:**
   ```bash
   npm install
   ```

3. **Inisialisasi & Seeding Database:**
   Jalankan server lokal, lalu buka di browser:
   - Inisialisasi tabel: `http://localhost:3000/api/setup`
   - Seeding data awal: `http://localhost:3000/api/seed`

4. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.
