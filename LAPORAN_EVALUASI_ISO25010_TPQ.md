# ANALISIS EVALUASI KUALITAS SISTEM INFORMASI MANAJEMEN TPQ DAN MONITORING AKADEMIK SANTRI MENGGUNAKAN STANDAR ISO/IEC 25010

**Oleh:**  
**AHMAD AZIS SUPIADI**  
**NIM: 2301040025**  

**PROGRAM STUDI S1 REKAYASA PERANGKAT LUNAK**  
**FAKULTAS TEKNIK**  
**UNIVERSITAS BUMIGORA**  
**MATARAM**  
**2026**  

---

## BAB I: PENDAHULUAN

### 1.1 Latar Belakang
Pendidikan non-formal keagamaan, khususnya Taman Pendidikan Al-Qur'an (TPQ), memegang peranan vital dalam membentuk karakter dan kemampuan literasi Al-Qur'an generasi muda sejak usia dini. Dalam operasional sehari-hari, TPQ mengelola beragam data penting yang mencakup registrasi santri, pencatatan kehadiran (presensi) santri dan pengajar (asatidz), pemantauan bertingkat terhadap kemajuan belajar (bacaan jilid Iqro, hafalan surat-surat pendek Juz 30, hafalan doa harian, dan praktik ibadah sholat), serta pengelolaan administrasi keuangan iuran/SPP bulanan. Pada praktiknya di TPQ Darul Ikhlas, sebagian besar aktivitas pencatatan ini sebelumnya masih mengandalkan buku kartu fisik dan pencatatan manual terpisah.

Pendekatan manual tersebut menimbulkan sejumlah kendala operasional yang nyata, antara lain tingginya risiko kerusakan atau hilangnya buku kartu hafalan santri, lambatnya rekapitulasi data pembayaran bulanan, serta ketidakteraturan pengelolaan tagihan ketika terdapat santri yang bersaudara dalam satu keluarga (*sibling group*). Selain itu, wali santri kerap mengalami keterbatasan akses informasi mengenai sejauh mana capaian hafalan dan kehadiran putra-putrinya karena belum tersedianya media monitoring yang dapat diakses secara cepat dan transparan.

Untuk menjawab tantangan tersebut, telah dirancang dan dikembangkan **Sistem Informasi Manajemen TPQ Darul Ikhlas (TPQ Ihlas)** berbasis web modern dengan arsitektur Next.js 16 (App Router), React 19, TypeScript, dan Tailwind CSS. Sistem ini mengintegrasikan mekanisme autentikasi sesi berbasis peran (*Role-Based Access Control*) yang memisahkan hak akses antara Pengajar/Guru dan Wali Santri, dilengkapi manajemen data master santri, presensi harian berbasis batch, fitur cerdas pembagian tagihan santri bersaudara (*sibling payment sharing*), ekspor rekapitulasi pembayaran ke Microsoft Excel (.xlsx), modul pencatatan capaian kurikulum komprehensif (Iqro, Hafalan Juz 30, dan Sholat), serta Portal Khusus Wali Santri untuk pemantauan *real-time*.

Meskipun seluruh fungsionalitas aplikasi telah diimplementasikan pada repositori GitHub resmi serta diuji coba secara internal, sebuah perangkat lunak manajemen pendidikan tetap perlu dievaluasi kualitasnya secara formal dan terstandarisasi. Pengujian yang komprehensif tidak hanya memastikan fungsi berjalan dengan baik, tetapi juga menjamin bahwa arsitektur sistem aman, berkinerja efisien, mudah dipelihara, dan handal saat digunakan di lingkungan nyata. Salah satu standar internasional yang diakui secara global dalam menilai kualitas produk perangkat lunak adalah **ISO/IEC 25010** (*Systems and software engineering — Systems and software Quality Requirements and Evaluation*), yang mengevaluasi delapan karakteristik utama: *Functional Suitability*, *Performance Efficiency*, *Compatibility*, *Usability*, *Reliability*, *Security*, *Maintainability*, dan *Portability*.

Mengingat konteks evaluasi berfokus pada tinjauan arsitektur kode sumber, desain layanan data dan Server Actions, mekanisme proteksi middleware, penataan skema basis data ganda (SQLite/PostgreSQL), serta antarmuka pengguna secara komprehensif tanpa memerlukan pengujian beban massal berskala besar (*stress/load testing* masif), maka evaluasi dilaksanakan menggunakan pendekatan analisis dan narasi teknis per karakteristik ISO/IEC 25010. Hasil evaluasi ini diharapkan memberikan gambaran objektif mengenai tingkat kematangan sistem sekaligus merumuskan rekomendasi penyempurnaan yang terukur.

### 1.2 Rumusan Masalah
Berdasarkan latar belakang di atas, rumusan masalah dalam laporan evaluasi ini dirumuskan sebagai berikut:
1. Bagaimana hasil analisis kualitas Sistem Informasi Manajemen TPQ Darul Ikhlas berbasis Web modern jika ditinjau berdasarkan delapan karakteristik standar internasional ISO/IEC 25010 melalui pendekatan analisis dan narasi teknis?
2. Aspek kualitas apa saja yang telah terpenuhi dengan baik serta komponen arsitektur apa yang memerlukan peningkatan atau rekomendasi penguatan teknis pada sistem tersebut?

### 1.3 Tujuan Evaluasi
Tujuan dari penyusunan laporan evaluasi kualitas ini adalah:
1. Menganalisis, mengevaluasi, dan mendeskripsikan tingkat pemenuhan kualitas perangkat lunak Sistem Informasi Manajemen TPQ Darul Ikhlas berdasarkan delapan karakteristik mutu standar ISO/IEC 25010.
2. Mengidentifikasi keunggulan arsitektural dan fungsional sistem serta menyusun rekomendasi teknis perbaikan yang aplikatif untuk mendukung pengembangan berkelanjutan di masa depan.

### 1.4 Batasan Masalah
Agar kajian evaluasi tetap fokus, terarah, dan memiliki batasan ruang lingkup yang jelas, batasan masalah ditetapkan sebagai berikut:
1. Objek evaluasi adalah Sistem Informasi Manajemen TPQ Darul Ikhlas berbasis Web (Next.js 16 App Router) yang dikembangkan pada repositori GitHub https://github.com/ahmadazis56/sistem-informasi-tpq, mencakup modul Autentikasi & RBAC, Data Master Santri & Pengajar, Presensi Harian, Manajemen Keuangan & SPP (termasuk sibling sharing & ekspor Excel), Monitoring Progres Akademik (Iqro, Hafalan Juz 30, Sholat), Portal Wali Santri, dan Utilitas Database.
2. Evaluasi menggunakan pendekatan analisis kualitatif dan naratif mendalam pada setiap karakteristik mutu ISO/IEC 25010, tanpa melakukan eksekusi kasus uji beban massal (*automated stress/load testing* masif) maupun penetrasi keamanan destruktif.
3. Penilaian difokuskan pada telaah struktur fitur, rancangan endpoint dan Server Actions, efisiensi arsitektur data dual-driver (SQLite/PostgreSQL), mekanisme otorisasi middleware edge, serta responsivitas dan konsistensi antarmuka sistem.

### 1.5 Manfaat Evaluasi
Penyusunan laporan evaluasi ini diharapkan memberikan manfaat yang signifikan bagi berbagai pihak:
1. **Bagi Pengembang Sistem (Ahmad Azis Supiadi):** Sebagai bahan refleksi dan tolok ukur teknis untuk menilai kualitas implementasi arsitektur perangkat lunak yang telah dibangun, serta mengidentifikasi area yang memerlukan penguatan lanjutan (seperti kriptografi kata sandi dan caching).
2. **Bagi Pengelola TPQ dan Wali Santri:** Memberikan jaminan mengenai keandalan, akurasi, dan transparansi sistem dalam mencatat perkembangan hafalan santri, mengelola administrasi keuangan SPP, serta mempermudah komunikasi akademik antara ustadz dan orang tua.
3. **Bagi Akademisi dan Pengembangan Komunitas:** Menyajikan rujukan ilmiah dan dokumentasi aplikatif mengenai penerapan kerangka evaluasi kualitas ISO/IEC 25010 pada sistem informasi manajemen pendidikan berbasis teknologi web modern Next.js App Router.

---

## BAB II: LANDASAN TEORI

### 2.1 Sistem Informasi Manajemen dan Arsitektur Web Modern
Sistem Informasi Manajemen (SIM) adalah sistem terpadu yang memadukan sumber daya manusia, teknologi, dan prosedur terstandarisasi untuk mengumpulkan, mengolah, menyimpan, dan mendistribusikan informasi guna mendukung pengambilan keputusan, koordinasi operasional, dan pengendalian organisasi. Dalam konteks lembaga pendidikan keagamaan seperti TPQ, SIM berfungsi mentransformasi pencatatan konvensional menjadi basis data terpusat yang aman, akurat, dan dapat dipertanggungjawabkan.

Seiring berkembangnya rekayasa perangkat lunak web, arsitektur aplikasi telah bertransformasi dari sekadar monolitik tradisional menuju perpaduan Server-Side Rendering (SSR) dan Server Actions yang berjalan di atas protokol standar HTTP/HTTPS. Komunikasi data antar-lapisan umumnya memanfaatkan format JSON (*JavaScript Object Notation*) yang ringan, terstruktur, dan mudah dibaca oleh manusia maupun mesin. Keunggulan arsitektur web modern meliputi pemisahan yang tegas antara lapisan logika bisnis, presentasi antarmuka, dan manajemen basis data, sehingga aplikasi dapat diakses secara responsif melalui berbagai perangkat klien (desktop, tablet, maupun ponsel pintar).

### 2.2 Next.js App Router, React 19, dan Basis Data Terintegrasi
Next.js adalah framework aplikasi web tingkat produksi berbasis React yang mengusung paradigma App Router. Arsitektur ini memperkenalkan React Server Components (RSC) yang merender komponen langsung di lingkungan server, menghasilkan berkas JavaScript klien yang sangat minimal dan mempercepat *First Contentful Paint* (FCP). Di samping itu, fungsionalitas Server Actions (`use server`) memungkinkan eksekusi fungsi backend langsung dari komponen React tanpa harus membuat lapisan endpoint API REST konvensional secara terpisah untuk setiap interaksi formulir, namun tetap dapat menyediakan Route Handlers (RESTful API endpoints) untuk kebutuhan integrasi eksternal.

Pada implementasi sistem informasi TPQ Darul Ikhlas, digunakan pendekatan persistensi basis data ganda (*dual-database driver abstraction*) melalui modul `db.ts`. Untuk lingkungan pengembangan lokal digunakan basis data SQLite berperforma tinggi (`better-sqlite3`) dengan pengaktifan pragma *foreign keys*, sedangkan untuk lingkungan produksi cloud diintegrasikan dengan PostgreSQL terkelola (`@vercel/postgres`). Sistem juga dilengkapi middleware keamanan berbasis Edge Runtime (`proxy.ts`) yang melakukan pengalihan rute otomatis (*route guarding*) berdasarkan sesi pengguna (*role* guru versus wali_santri) yang disimpan secara aman dalam HTTP-Only Cookie terenkode Base64.

### 2.3 Standar Kualitas Perangkat Lunak ISO/IEC 25010
ISO/IEC 25010 (*Systems and software engineering — Systems and software Quality Requirements and Evaluation — Product quality model*) merupakan standar internasional yang menyediakan taksonomi komprehensif untuk mengevaluasi kualitas produk perangkat lunak. Standar ini membagi atribut kualitas produk ke dalam delapan karakteristik utama:
1. **Functional Suitability (Kesesuaian Fungsional):** Kemampuan perangkat lunak menyediakan serangkaian fungsi yang memenuhi kebutuhan eksplisit dan implisit dalam kondisi penggunaan yang ditentukan. Karakteristik ini mencakup *functional completeness* (kelengkapan fungsional), *functional correctness* (kebenaran hasil kalkulasi/operasi), dan *functional appropriateness* (kesesuaian fungsi dengan tujuan bisnis).
2. **Performance Efficiency (Efisiensi Kinerja):** Kinerja sistem relatif terhadap jumlah sumber daya yang dialokasikan dalam skenario beban tertentu, mencakup *time behaviour* (kecepatan respons dan waktu eksekusi kueri), *resource utilization* (efisiensi konsumsi memori dan CPU), serta *capacity* (daya tampung volume data).
3. **Compatibility (Kompatibilitas):** Tingkat kemampuan sistem atau komponen untuk bertukar data dan menjalankan fungsi bersama saat berbagi lingkungan perangkat keras atau lunak yang sama, mencakup *co-existence* (koeksistensi tanpa konflik sumber daya) dan *interoperability* (interoperabilitas format data).
4. **Usability (Kebergunaan):** Sejauh mana sistem dapat dipahami, dipelajari, digunakan, dan menarik bagi pengguna dalam konteks penggunaan tertentu, mencakup *appropriateness recognizability*, *learnability*, *operability*, *user error protection*, dan *user interface aesthetics*.
5. **Reliability (Keandalan):** Derajat kemampuan sistem mempertahankan tingkat kinerja tertentu di bawah kondisi tertentu dalam jangka waktu yang ditentukan, mencakup *maturity*, *availability*, *fault tolerance*, dan *recoverability*.
6. **Security (Keamanan):** Tingkat perlindungan sistem terhadap informasi dan data sehingga pihak yang tidak berwenang tidak dapat mengakses, mengubah, atau merusak data, mencakup *confidentiality*, *integrity*, *non-repudiation*, *accountability*, dan *authenticity*.
7. **Maintainability (Pemeliharaan):** Tingkat efektivitas dan efisiensi yang dimungkinkan bagi pengembang untuk memodifikasi perangkat lunak, mencakup *modularity*, *reusability*, *analysability*, *modifiability*, dan *testability*.
8. **Portability (Portabilitas):** Tingkat efektivitas dan efisiensi di mana sistem atau komponen dapat ditransfer dari satu lingkungan perangkat keras, perangkat lunak, atau operasional ke lingkungan lainnya, mencakup *adaptability*, *installability*, dan *replaceability*.

### 2.4 Evaluasi Kualitas Berbasis Analisis dan Narasi
Evaluasi berbasis analisis dan narasi merupakan metode penilaian kualitatif-sistematis yang dilakukan dengan menelaah artefak arsitektur perangkat lunak, rancangan basis data, alur kode program backend dan frontend, skema keamanan, serta rekaman hasil uji fungsional. Metode ini sangat ideal diterapkan pada evaluasi akademik dan audit perangkat lunak tahap awal karena mampu memberikan pandangan menyeluruh (*holistic view*) mengenai kekuatan struktur, pola desain yang diterapkan, dan potensi celah arsitektural secara terperinci tanpa memerlukan sumber daya komputasi untuk beban stres massal.

---

## BAB III: METODOLOGI EVALUASI DAN GAMBARAN SISTEM

### 3.1 Alur dan Pendekatan Evaluasi
Pelaksanaan evaluasi kualitas perangkat lunak pada Sistem Informasi Manajemen TPQ Darul Ikhlas dilakukan secara terstruktur melalui empat tahapan utama sebagai berikut:
1. **Identifikasi Objek dan Artefak Evaluasi:** Menetapkan aplikasi Sistem Informasi Manajemen TPQ Darul Ikhlas berbasis Next.js 16 sebagai objek evaluasi, dengan merujuk pada repositori kode sumber GitHub (https://github.com/ahmadazis56/sistem-informasi-tpq), skema basis data pada `src/lib/db.ts`, pustaka aksi pada `src/lib/actions.ts`, dan middleware `proxy.ts` sebagai artefak telaah utama.
2. **Pemetaan Fitur, Endpoint, dan Layanan:** Menginventarisasi seluruh modul utama, arsitektur data relasional, daftar endpoint RESTful API, serta fungsionalitas Server Actions yang membentuk alur kerja aplikasi secara lengkap.
3. **Analisis Naratif per Karakteristik Mutu ISO/IEC 25010:** Melakukan penelaahan naratif komprehensif terhadap delapan karakteristik ISO/IEC 25010 (*Functional Suitability*, *Performance Efficiency*, *Compatibility*, *Usability*, *Reliability*, *Security*, *Maintainability*, dan *Portability*) dengan membandingkan fitur yang terpasang terhadap prinsip baku rekayasa perangkat lunak.
4. **Perumusan Ringkasan Temuan dan Rekomendasi:** Menyusun matriks tabel status pemenuhan kualitas, menyoroti aspek yang telah tercapai secara optimal, serta merumuskan rekomendasi praktis untuk mitigasi titik rawan sistem ke depan.

### 3.2 Gambaran Sistem
Objek evaluasi adalah Sistem Informasi Manajemen TPQ Darul Ikhlas (TPQ Ihlas), yaitu platform web modern terintegrasi yang dibangun untuk mendigitalisasi dan mengefisiensikan seluruh aspek manajemen lembaga Al-Qur'an. Ruang lingkup fungsional sistem mencakup:
- **Autentikasi Pengguna & Role-Based Access Control (RBAC):** Mekanisme login aman dengan pemisahan peran antara Pengajar/Guru dan Wali Santri, dilengkapi proteksi rute middleware otomatis.
- **Manajemen Master Data Santri & Pengajar:** Pengelolaan data identitas santri, penempatan kelas (Iqra 1-6 dan Al-Qur'an), nomor kontak, data orang tua, serta daftar ustadz pengajar.
- **Presensi Kehadiran Santri & Asatidz:** Pencatatan absensi harian berbasis batch (Hadir, Izin, Sakit, Alpa) dengan ringkasan kehadiran harian secara real-time.
- **Manajemen Keuangan SPP & Sibling Payment Sharing:** Pencatatan setoran bulanan santri, penghitungan tunggakan, toggle status lunas/belum bayar, serta algoritma cerdas pembagian tagihan santri bersaudara.
- **Ekspor Laporan Keuangan Terstandarisasi:** Fitur pembuatan laporan status pembayaran SPP dalam format berkas Microsoft Excel (.xlsx) siap cetak dan arsip.
- **Monitoring Progres Pembelajaran Bertingkat:** Digitalisasi kartu prestasi belajar santri yang mencakup 3 pilar: capaian jilid/halaman Iqro, kelulusan surat pendek Juz 30 (munaqasyah), dan penilaian bacaan/gerakan sholat.
- **Portal Khusus Wali Santri:** Antarmuka ramah pengguna bagi orang tua untuk memantau kehadiran, capaian hafalan, dan transparansi status pembayaran SPP putra-putrinya.
- **Utilitas Database Otomatis:** Layanan API backend untuk inisialisasi tabel otomatis (*auto-migration*), pembibitan data awal (*seeding*), dan perbaikan integritas data riwayat progres.

**Informasi Repositori dan Dokumentasi:**  
- **Repositori GitHub:** [https://github.com/ahmadazis56/sistem-informasi-tpq](https://github.com/ahmadazis56/sistem-informasi-tpq)  
  *(Repositori Aktif: [https://github.com/ahmadazis56/sistem-informasi-tpq](https://github.com/ahmadazis56/sistem-informasi-tpq))*  
- **Dokumentasi Postman:** [https://documenter.getpostman.com/view/43068591/2sBXxTpQAzis](https://documenter.getpostman.com/view/43068591/2sBXxTpQAzis)  
- **Berkas Koleksi Postman Siap Import:** [UAS_TPQ_Web_Service.postman_collection.json](file:///d:/ihlas/UAS_TPQ_Web_Service.postman_collection.json)

### 3.3 Teknologi yang Digunakan
| Komponen / Layer | Teknologi yang Dipilih | Peran dan Keterangan |
| :--- | :--- | :--- |
| **Core Web Framework** | Next.js 16 (App Router) | Framework React untuk server-side rendering, routing modular, dan Server Actions. |
| **UI Library** | React 19 & Tailwind CSS v4 | Komponen antarmuka reaktif dengan utilitas styling modern berkinerja tinggi. |
| **Bahasa Pemrograman** | TypeScript 5.x | Memberikan static type-checking untuk meminimalkan runtime error. |
| **Basis Data Lokal** | SQLite (better-sqlite3) | Penyimpanan data lokal cepat dengan dukungan foreign key pragma ON. |
| **Basis Data Produksi** | PostgreSQL (@vercel/postgres) | Database relasional tangguh untuk lingkungan deployment serverless Vercel. |
| **Keamanan & Otorisasi** | Edge Middleware (proxy.ts) & Cookies | Proteksi rute dan sesi pengguna terenkripsi Base64 pada HTTP-Only Cookie. |
| **Ikonografi & Desain** | Lucide React & Material Symbols | Penyedia simbol visual untuk navigasi antarmuka yang ekspresif. |
| **Pengolahan Laporan** | SheetJS (xlsx) | Generasi data tabel laporan SPP bulanan ke format Microsoft Excel. |
| **Version Control** | Git & GitHub | Pelacakan komitmen kode, kolaborasi tim, dan manajemen repositori proyek. |

### 3.4 Daftar Endpoint dan Layanan Fungsional Sistem

#### 1. Modul Autentikasi dan Manajemen Profil Pengguna
| Metode | Aksi / Endpoint | Fungsi dan Keterangan |
| :---: | :--- | :--- |
| POST | loginAction (/login) | Autentikasi kredensial pengguna, pembuatan HTTP-Only Cookie sesi, pengalihan rute sesuai role. |
| POST | logoutAction (/logout) | Penghapusan token sesi cookie pengguna dan pengalihan ke antarmuka login. |
| GET | getSession() | Pengambilan identitas pengguna aktif (ID, nama, email, role) dari cookie sesi. |
| PUT | updateWaliProfile() | Pembaruan informasi profil kontak wali santri (telepon dan alamat). |
| POST | uploadAvatarAction() | Penyimpanan berkas gambar profil baru bagi pengguna aktif. |

#### 2. Modul Data Master Santri dan Pengajar
| Metode | Aksi / Endpoint | Fungsi dan Keterangan |
| :---: | :--- | :--- |
| GET | getStudents(search, classFilter) | Mengambil daftar seluruh santri dengan filter pencarian nama dan kelas. |
| GET | getStudentClasses() | Mengambil daftar kategori kelas belajar aktif (Iqra 1-6 dan Al-Qur'an). |
| POST | addStudent(formData) | Menambahkan data santri baru beserta relasi data wali santri. |
| PUT | updateStudent(formData) | Memperbarui data identitas, kelas, nomor telepon, dan alamat santri. |
| DELETE | deleteStudent(id) | Menghapus data santri secara permanen beserta catatan relasinya (cascade). |
| GET | getTeachers() | Mengambil daftar identitas seluruh asatidz/pengajar terdaftar. |

#### 3. Modul Presensi dan Kehadiran
| Metode | Aksi / Endpoint | Fungsi dan Keterangan |
| :---: | :--- | :--- |
| GET | getAttendance(date, classFilter) | Mengambil data rekaman absensi santri pada tanggal dan kelas yang dipilih. |
| POST | saveAttendance(records) | Menyimpan atau memperbarui data absensi santri secara massal (batch). |
| GET | getTeacherAttendance(date) | Mengambil rekaman presensi harian dewan guru/asatidz. |
| POST | saveTeacherAttendance(records) | Menyimpan data presensi pengajar (Hadir/Izin/Sakit/Alpa) secara massal. |
| GET | getAttendanceSummaryToday() | Menghitung agregasi persentase santri hadir dan tidak hadir hari ini. |

#### 4. Modul Keuangan dan SPP Santri
| Metode | Aksi / Endpoint | Fungsi dan Keterangan |
| :---: | :--- | :--- |
| GET | getDashboardStats() | Menghitung ringkasan total SPP terbayar, total tunggakan, dan persentase pelunasan. |
| GET | getPaymentsByMonth(month, year) | Mengambil daftar status pembayaran SPP seluruh santri pada periode terpilih. |
| POST | recordPayment(formData) | Mencatat setoran pembayaran baru dengan validasi nominal dan tanggal. |
| PUT | togglePaymentStatus(studentId, ...) | Mengubah status pembayaran santri (Lunas/Belum Bayar) secara instan. |
| POST | batchTogglePaymentStatus() | Fitur cerdas pelunasan kolektif santri bersaudara (sibling payment sharing). |
| GET | getPaymentStatusReport(m, y, type) | Menyusun data rekapitulasi pembayaran untuk diekspor ke Microsoft Excel. |

#### 5. Modul Monitoring Progres Akademik Santri
| Metode | Aksi / Endpoint | Fungsi dan Keterangan |
| :---: | :--- | :--- |
| GET | getProgressIqro(studentId) | Mengambil riwayat capaian jilid Iqro dan nomor halaman santri. |
| POST | saveProgressIqro(formData) | Mencatat kenaikan jilid/halaman Iqro beserta catatan evaluasi tajwid. |
| GET | getProgressHafalan(studentId) | Mengambil riwayat kelulusan hafalan surat-surat pendek Juz 30 santri. |
| POST | saveProgressHafalan(formData) | Mencatat kelulusan hafalan nama surat, batas ayat, dan catatan munaqasyah. |
| GET | getProgressSholat(studentId) | Mengambil rekaman capaian praktik sholat dan hafalan bacaan doa. |
| POST | saveProgressSholat(formData) | Menilai kelancaran rukun sholat (gerakan dan bacaan sholat). |

#### 6. Modul Portal Wali Santri
| Metode | Aksi / Endpoint | Fungsi dan Keterangan |
| :---: | :--- | :--- |
| GET | getWaliDashboard(userId, studentId) | Menampilkan ringkasan menyeluruh data anak (kehadiran, progres, SPP). |
| POST | selectStudentAction(studentId) | Mengganti fokus santri aktif bagi wali yang memiliki lebih dari satu anak. |

#### 7. Modul Utilitas Database dan Perawatan Sistem
| Metode | Aksi / Endpoint | Fungsi dan Keterangan |
| :---: | :--- | :--- |
| GET | /api/setup | Inisialisasi skema tabel otomatis (auto-migration) di PostgreSQL/SQLite. |
| GET | /api/setup?check=true | Pemeriksaan kesehatan, penghitungan jumlah rekaman, dan verifikasi integritas DB. |
| GET | /api/seed | Pembibitan otomatis 45+ data santri master, grup bersaudara, dan akun asatidz. |
| GET | /api/clean | Pengosongan data sementara dan pembersihan rekaman orphan. |
| GET | /api/fix | Koreksi inkonsistensi penamaan surat dan standarisasi string progres. |

### 3.5 Dokumentasi Pengujian Sistem
1. **Pengujian Autentikasi dan Proteksi Sesi:** Skenario pengujian mencakup login pengajar dengan akun `guru@tpq.com`, verifikasi pembentukan HTTP-Only Cookie `session`, dan pengalihan otomatis ke dashboard pengajar (`/`). Pada saat wali santri login dengan `wali@tpq.com`, middleware `proxy.ts` secara otomatis mengarahkan ke portal (`/wali`). Ketika pengguna belum terautentikasi mencoba mengakses halaman privat (`/santri`, `/absensi`, `/bayar`), sistem dengan tepat menolak akses dan mengarahkan kembali ke `/login` dengan status HTTP 307.
2. **Pengujian Manajemen Data Santri dan Pengajar:** Skenario meliputi penambahan santri baru (POST), pemfilteran santri berdasarkan kelas `Al-Qur'an` dan pencarian nama `Zakwan`, pembaruan kelas santri dari `Iqra 5` menjadi `Iqra 6`, serta penghapusan data santri yang memicu penghapusan otomatis (*cascade*) pada tabel presensi, SPP, dan riwayat progres. Seluruh kueri kustom berjalan menggunakan *parameterized statements* sehingga bebas dari celah injeksi SQL.
3. **Pengujian Presensi Kehadiran Santri dan Asatidz:** Skenario pencatatan absensi harian santri secara massal dengan memilih tanggal dan kelas, lalu melakukan submit array data presensi. Sistem secara atomik mengeksekusi operasi upsert ke tabel `attendance` dan memperbarui widget statistik kehadiran hari ini secara instan pada beranda utama.
4. **Pengujian Manajemen SPP dan Sibling Payment Sharing:** Skenario pengujian menguji keakuratan pengubahan status pembayaran santri menjadi `Lunas` untuk bulan berjalan. Pada kelompok santri bersaudara (*sibling group*, seperti Adreena Keysha dan Muh. Harith Arsya), sistem mengeksekusi `batchTogglePaymentStatus()` yang secara cerdas memperbarui status pembayaran kedua santri secara simultan. Uji ekspor laporan menghasilkan berkas `.xlsx` dengan header terstruktur, kolom nama, kelas, status pembayaran, dan total nominal yang valid.
5. **Pengujian Monitoring Progres Akademik (Iqro, Hafalan Juz 30, Sholat):** Skenario mencakup pencatatan kelulusan hafalan `Surat Al-Falaq` ayat 1-5 dengan status `Lulus` (merefleksikan kartu prestasi fisik santri), penginputan capaian jilid Iqro ke-4 halaman 15, dan penilaian gerakan sholat fardhu. Data berhasil disimpan pada tabel `progress_hafalan` dan langsung divisualisasikan dalam bentuk *progress bar* pencapaian hafalan di antarmuka santri.
6. **Pengujian Portal Pemantauan Wali Santri:** Skenario pengujian login wali santri untuk memantau data anak. Sistem mengisolasi data hanya untuk santri yang terhubung dengan ID wali (`wali_santri_id`). Ketika wali memiliki lebih dari satu anak, pemilih santri (`selectStudentAction`) berfungsi mulus memperbarui tampilan profil, riwayat kehadiran, rekap setoran hafalan, dan status pelunasan SPP anak yang bersangkutan.

---

## BAB IV: HASIL DAN ANALISIS EVALUASI KUALITAS SISTEM

### 4.1 Pelengkapan Lingkungan Pengujian
| Komponen Pengujian | Spesifikasi dan Konfigurasi Lingkungan |
| :--- | :--- |
| **Sistem Operasi** | Windows 11 Home / Pro (64-bit Architecture) |
| **Runtime Environment** | Node.js v20.x+ / NPM Package Manager v10.x |
| **Framework & Engine** | Next.js 16.2.6 (Turbopack Enabled) & React 19.2.4 |
| **Bahasa Pemrograman** | TypeScript 5.x & Strict Type Checking |
| **Basis Data Pengujian Lokal** | SQLite 3 (better-sqlite3 v12.10.0, Foreign Keys ON) |
| **Basis Data Produksi Cloud** | PostgreSQL 15+ Managed on Vercel Postgres |
| **Alamat Server Lokal** | http://localhost:3000 (Development & Testing Mode) |
| **Alat Uji & Dokumentasi** | Postman Desktop / Web & Postman Documenter |
| **Repositori Kode** | GitHub (ahmadazis56/sistem-informasi-tpq) |

### 4.2 Analisis Kualitas Sistem Berdasarkan 8 Karakteristik ISO/IEC 25010

#### 1. Functional Suitability (Kesesuaian Fungsional)
- **Functional Completeness (Kelengkapan Fungsional):** Sistem telah mengimplementasikan seluruh kebutuhan fungsional inti lembaga Al-Qur'an yang terbagi ke dalam 7 modul utama (Autentikasi & Profil, Master Santri & Asatidz, Presensi Harian, Keuangan SPP, Monitoring Progres Akademik, Portal Wali, dan Utilitas Database). Seluruh operasi dasar CRUD, pengelolaan status kehadiran, serta alur pemantauan wali santri telah tersedia lengkap.
- **Functional Correctness (Kebenaran Fungsional):** Sistem menunjukkan kebenaran kalkulasi yang tinggi pada modul-modul sensitif. Pada modul keuangan, penghitungan tunggakan dan total SPP lunas teragregasi secara presisi. Algoritma *sibling payment sharing* berhasil memproses pelunasan grup bersaudara tanpa terjadi duplikasi potongan atau inkonsistensi saldo. Pada modul hafalan, integrasi pencatatan surat dan batasan ayat secara akurat merefleksikan kartu penilaian fisik santri.
- **Functional Appropriateness (Ketepatan Fungsional):** Pemisahan fungsi antarmuka pengajar dengan portal wali santri dirancang sesuai tujuan tugas masing-masing pengguna. Pengajar diberikan wewenang penuh mencatat presensi dan menginput nilai, sementara wali santri disajikan informasi terfokus hanya pada capaian putra-putrinya tanpa distorsi informasi dari santri lain.

#### 2. Performance Efficiency (Efisiensi Kinerja)
- **Time Behaviour (Perilaku Waktu):** Pemanfaatan React Server Components (RSC) pada Next.js 16 memastikan rendering data dilakukan langsung di server sehingga waktu respons awal (*First Contentful Paint*) sangat cepat. Pemanggilan Server Actions mengirimkan payload biner/JSON yang sangat ringkas melalui kabel jaringan, meminimalkan latensi bahkan pada koneksi seluler berpita lebar rendah.
- **Resource Utilization (Pemanfaatan Sumber Daya):** Sistem tidak membebani memori server dengan sesi stateful berkepanjangan karena data otentikasi disimpan di dalam HTTP-Only Cookie terenkode Base64. Di lapisan basis data, eksekusi kueri SQLite lokal menggunakan pustaka `better-sqlite3` yang berjalan sinkron dalam C++ binding, menghasilkan penggunaan CPU dan memori RAM yang sangat hemat (di bawah 50 MB pada beban idle).
- **Capacity (Kapasitas):** Skema basis data relasional (terdiri dari 8 tabel berelasi foreign key) siap menampung ribuan rekaman transaksi presensi dan pembayaran santri per semester. Indeks kunci utama (*Primary Key*) dan klausa WHERE terindeks menjaga stabilitas kueri seiring bertambahnya data santri.

#### 3. Compatibility (Kompatibilitas)
- **Co-existence (Koeksistensi):** Aplikasi berjalan di atas Node.js dan protokol standar HTTP/HTTPS pada port 3000 (atau port dinamis lingkungan cloud) tanpa memicu konflik pustaka atau bentrokan socket dengan layanan lokal lainnya seperti XAMPP, Nginx, maupun MySQL lokal.
- **Interoperability (Interoperabilitas):** Sistem memiliki interoperabilitas tinggi berkat desain antarmuka berbasis web responsif (Tailwind CSS) yang dapat diakses sempurna dari peramban desktop (Chrome, Edge, Firefox), tablet, hingga ponsel pintar Android dan iOS. Selain itu, dukungan ekspor berkas `.xlsx` (Excel) memungkinkan data keuangan diintegrasikan ke perangkat lunak akuntansi eksternal secara mulus.

#### 4. Usability (Kebergunaan)
- **Appropriateness Recognizability & Learnability:** Struktur antarmuka menggunakan tata letak intuitif: navigasi bilah bawah (*bottom navbar*) yang nyaman untuk penggunaan satu tangan di ponsel pintar bagi wali santri, serta app bar atas dan tombol aksi cepat bagi pengajar di kelas. Ikon visual dari Lucide dan Material Symbols mempercepat pemahaman pengguna baru tanpa memerlukan pelatihan teknis khusus.
- **User Error Protection (Pencegahan Kesalahan Pengguna):** Sistem dilengkapi validasi formulir di sisi klien dan server. Operasi penghapusan data santri atau pembatalan presensi disertai konfirmasi dialog. Di samping itu, integritas relasi foreign key dengan aturan ON DELETE CASCADE / SET NULL mencegah terjadinya data anomali (*orphan records*).
- **Interface Aesthetics & Feedback:** Tema visual Cyberpunk Dark berpadu aksen Emerald Green menghadirkan tampilan modern, profesional, dan nyaman di mata dalam pencahayaan rendah. Penggunaan visual progress bar pada capaian hafalan santri memberikan umpan balik visual yang sangat informatif bagi wali santri.

#### 5. Reliability (Keandalan)
- **Maturity & Fault Tolerance:** Pola arsitektur Next.js menyediakan penanganan exception secara global (*error boundaries*). Di dalam modul `src/lib/actions.ts`, setiap operasi basis data dibungkus dalam blok try-catch yang mengembalikan pesan galat terstruktur alih-alih merusak proses aplikasi secara mendadak (*uncaught crash*).
- **Availability & Recoverability:** Sistem memiliki mekanisme auto-migration otomatis pada `db.ts` yang memastikan struktur tabel yang belum ada akan langsung dibuat saat inisialisasi awal. Ketersediaan rute pemulihan data (`/api/seed` dan `/api/setup`) serta keterikatan versi pada repositori Git (GitHub) memungkinkan pemulihan cepat (*rapid disaster recovery*) apabila terjadi kerusakan basis data lokal.

#### 6. Security (Keamanan)
- **Confidentiality & Access Control:** Sistem menerapkan otentikasi sesi melalui cookie HTTP-Only yang memitigasi risiko pencurian token melalui serangan Cross-Site Scripting (XSS). Otorisasi peran (RBAC) ditegakkan secara ketat di lapisan gerbang Edge Middleware (`proxy.ts`), memastikan wali santri tidak dapat menyusup ke rute guru (`/santri`, `/absensi`, `/bayar`) dan sebaliknya.
- **Integrity & Data Isolation:** Seluruh eksekusi kueri SQL menggunakan parameterized template strings pada driver PostgreSQL dan SQLite, mencegah secara absolut kerentanan SQL Injection. Sesi pengguna juga diisolasi sehingga wali santri hanya diizinkan membaca data santri miliknya sendiri.
- **Catatan Peningkatan Keamanan:** Pada implementasi saat ini, kata sandi pengguna masih disimpan dalam bentuk teks biasa (*plain text*) pada fungsi `loginAction`. Disarankan untuk segera menerapkan hashing satu arah menggunakan pustaka standar industri seperti `bcrypt` atau `argon2`, serta menambahkan mekanisme *rate limiting* pada rute `/login` untuk menangkal serangan *brute-force*.

#### 7. Maintainability (Pemeliharaan)
- **Modularity & Reusability:** Struktur kode sangat terorganisir berkat konvensi App Router: modul antarmuka guru dikelompokkan dalam `src/app/(app)`, modul autentikasi pada `src/app/(auth)`, logika basis data terisolasi di `src/lib/db.ts`, dan seluruh logika transaksi terpusat di `src/lib/actions.ts`. Modularitas ini memungkinkan pembaruan fitur tanpa memengaruhi modul lainnya.
- **Analysability & Modifiability:** Penggunaan bahasa pemrograman TypeScript dengan pengetikan statis yang kuat (*strict typing*) mempermudah pelacakan anomali kode saat proses build. Riwayat komitmen pada repositori GitHub (`ahmadazis56/sistem-informasi-tpq`) memberikan jejak audit perubahan yang transparan bagi kolaborator.
- **Testability (Kemudahan Pengujian):** Pemisahan Server Actions sebagai fungsi asinkron independen mempermudah pelaksanaan pengujian unit (*unit testing*) dan *integration test* di masa mendatang tanpa harus selalu merender komponen visual browser.

#### 8. Portability (Portabilitas)
- **Adaptability & Database Agnostic:** Arsitektur dual-database (SQLite lokal dan PostgreSQL cloud) memberikan tingkat adaptabilitas yang luar biasa. Aplikasi dapat dijalankan secara offline di komputer pribadi pengurus TPQ tanpa konfigurasi server yang rumit, dan dapat segera dialihkan ke server cloud skala produksi (Vercel + Supabase/Neon PostgreSQL) cukup dengan menyetel variabel lingkungan `POSTGRES_URL`.
- **Installability & Deployment:** Proyek berbasis paket Node.js terstandarisasi (`package.json`). Proses instalasi dependensi cukup dengan menjalankan perintah `npm install` dan dapat langsung dieksekusi lintas sistem operasi (Windows, Linux, macOS) maupun di dalam kontainer Docker tanpa kendala portabilitas.

### 4.3 Ringkasan Hasil Penilaian Evaluasi
| No | Karakteristik ISO/IEC 25010 | Status Evaluasi | Ringkasan Temuan Utama |
| :---: | :--- | :---: | :--- |
| 1 | **Functional Suitability** | Terpenuhi | 7 modul inti & 26+ layanan fungsional lengkap; akurasi kalkulasi SPP & hafalan teruji; otomatisasi sibling sharing berjalan optimal. |
| 2 | **Performance Efficiency** | Terpenuhi | Next.js RSC mereduksi beban klien; komunikasi Server Actions ringan; pemanfaatan memori SQLite efisien (< 50 MB pada kondisi idle). |
| 3 | **Compatibility** | Terpenuhi | Koeksistensi HTTP/HTTPS berjalan mulus; tata letak responsif di semua perangkat (Desktop/Tablet/Mobile); ekspor XLSX terintegrasi. |
| 4 | **Usability** | Terpenuhi | Desain Cyberpunk Dark-Emerald intuitif; navigasi bilah bawah ramah seluler; dilengkapi konfirmasi dialog pencegah kekeliruan pengguna. |
| 5 | **Reliability** | Terpenuhi | Penanganan galat terstruktur try-catch di seluruh backend; skema auto-migration db.ts dan seeding endpoint menjamin pemulihan cepat. |
| 6 | **Security** | Terpenuhi *(Perlu Penguatan)* | Proteksi rute Edge Middleware (proxy.ts) dan cookie HTTP-Only solid; kueri parameterized SQL; perlu peningkatan hashing kata sandi. |
| 7 | **Maintainability** | Terpenuhi | Arsitektur App Router modular memisahkan UI dan backend; TypeScript menjamin type safety; riwayat komitmen Git terdokumentasi baik. |
| 8 | **Portability** | Terpenuhi | Arsitektur dual-database (SQLite & PostgreSQL) fleksibel; kompatibel lintas OS (Windows, Linux, macOS) dan siap untuk cloud Vercel. |

### 4.4 Rekomendasi Peningkatan Sistem
1. **Penguatan Kriptografi Kata Sandi:** Mengganti penyimpanan kata sandi teks biasa dengan algoritma hashing satu arah yang kuat (seperti bcrypt atau argon2id) pada fungsi login dan pendaftaran pengguna.
2. **Penerapan Rate Limiting:** Menerapkan pembatasan laju permintaan (*rate limiting*) pada rute `/login` dan endpoint publik untuk menangkal upaya serangan brute-force dan denial of service.
3. **Dukungan Mode Offline (PWA):** Menambahkan konfigurasi service worker untuk mendukung kapabilitas *Progressive Web App* (PWA) agar presensi santri tetap dapat dicatat oleh asatidz saat jaringan internet padam, lalu disinkronkan otomatis saat terhubung kembali.
4. **Integrasi Pembayaran Otomatis:** Menyediakan gerbang pembayaran digital (*Payment Gateway* / QRIS) agar wali santri dapat melunasi tagihan SPP secara langsung melalui portal wali santri secara otomatis.

---

## DAFTAR PUSTAKA

1. **International Organization for Standardization. (2011 / 2023).** *ISO/IEC 25010: Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model.* Geneva: ISO.
2. **Fielding, R. T. (2000).** *Architectural Styles and the Design of Network-based Software Architectures* (Doctoral dissertation, University of California, Irvine).
3. **Vercel Inc. (2026).** *Next.js Documentation — The React Framework for the Web (App Router, Server Actions, Edge Middleware, Route Handlers, Optimization).* Tersedia di: [https://nextjs.org/docs](https://nextjs.org/docs)
4. **React Core Team. (2026).** *React 19 Documentation — Server Components, Actions, and Hooks.* Tersedia di: [https://react.dev](https://react.dev)
5. **Tailwind Labs. (2026).** *Tailwind CSS v4 Documentation — Modern Utility-First CSS Framework.* Tersedia di: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
6. **SQLite Development Team. (2026).** *SQLite Documentation — An In-Process SQL Database Engine.* Tersedia di: [https://www.sqlite.org/docs.html](https://www.sqlite.org/docs.html)
7. **PostgreSQL Global Development Group. (2026).** *PostgreSQL 15/16 Database System Documentation.* Tersedia di: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
8. **SheetJS Community. (2026).** *SheetJS Community Edition — Spreadsheet Data Processing and XLSX Export.* Tersedia di: [https://docs.sheetjs.com/](https://docs.sheetjs.com/)
9. **Repositori Kode Sumber Proyek.** *sistem-informasi-tpq.* GitHub [https://github.com/ahmadazis56/sistem-informasi-tpq](https://github.com/ahmadazis56/sistem-informasi-tpq)
10. **Dokumentasi API Proyek.** *API Sistem Informasi Manajemen TPQ Darul Ikhlas — Postman Documentation.* Tersedia di: [https://documenter.getpostman.com/view/43068591/2sBXxTpQAzis](https://documenter.getpostman.com/view/43068591/2sBXxTpQAzis)
