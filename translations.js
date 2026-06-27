// --- Bilingual Translation System (EN <-> ID) ---
const htmlTranslations = {
    "sec-about": { en: "About Me", id: "Tentang Saya" },
    "about-text": {
        en: `Hi, I'm <span class="highlight">Daffa Restu Fadhillah</span>. A passionate tech enthusiast mainly focused on Front-End Development and UI/UX Design. I love building cool, responsive, and interactive web experiences.`,
        id: `Hai, saya <span class="highlight">Daffa Restu Fadhillah</span>. Seorang antusias teknologi yang berfokus utama pada Pengembangan Front-End dan Desain UI/UX. Saya sangat suka membangun pengalaman web yang keren, responsif, dan interaktif.`
    },
    "avail-work": { en: "Available for work", id: "Tersedia untuk bekerja" },
    "sec-edu": { en: "Education", id: "Pendidikan" },
    "edu-univ-1": { en: "Dian Nuswantoro University", id: "Universitas Dian Nuswantoro" },
    "edu-major-1": { en: "Bachelor of Informatics Engineering (S1 Teknik Informatika)", id: "Sarjana Teknik Informatika (S1)" },
    "edu-desc-1": {
        en: `Studied core computer science principles, software engineering, algorithms, and computer systems. Specialized independently and academically in <span class="edu-highlight">Front-End Development</span> and <span class="edu-highlight">UI/UX Design</span>, focusing on building sleek, responsive, and user-centric web applications.`,
        id: `Mempelajari prinsip dasar ilmu komputer, rekayasa perangkat lunak, algoritma, dan sistem komputer. Berfokus secara mandiri dan akademis dalam <span class="edu-highlight">Pengembangan Front-End</span> dan <span class="edu-highlight">Desain UI/UX</span>, menciptakan aplikasi web yang elegan, responsif, dan berpusat pada pengguna.`
    },
    "sec-exp": { en: "Work Experience", id: "Pengalaman Kerja" },
    "exp-comp-apu": { en: `<i class="ph ph-buildings"></i> Agung Putra University`, id: `<i class="ph ph-buildings"></i> Universitas Agung Putra` },
    "exp-badge-1": { en: "Internship", id: "Magang" },
    "exp-role-1": { en: "IT Help Desk Support", id: "Dukungan IT Help Desk" },
    "exp-desc-1": {
        en: `Provided technical assistance and IT troubleshooting to internal and external staff. Resolved hardware, software, network infrastructure, and operating system issues to ensure seamless daily computer operations.`,
        id: `Memberikan bantuan teknis dan pemecahan masalah IT kepada staf internal dan eksternal. Menyelesaikan masalah perangkat keras, perangkat lunak, infrastruktur jaringan, dan sistem operasi untuk memastikan kelancaran operasional komputer harian.`
    },
    "exp-badge-2": { en: "Contract", id: "Kontrak" },
    "exp-role-2": { en: "Study Program Administration Staff", id: "Staf Administrasi Program Studi" },
    "exp-desc-2": {
        en: `Managed daily academic department administration including archiving and reporting. Coordinated agenda scheduling for faculty management, handled incoming/outgoing correspondence, and maintained database accuracy.`,
        id: `Mengelola administrasi departemen akademik harian termasuk pengarsipan dan pelaporan. Mengoordinasikan penjadwalan agenda fakultas, menangani korespondensi surat masuk/keluar, dan menjaga akurasi basis data.`
    },
    "exp-badge-3": { en: "Contract", id: "Kontrak" },
    "exp-role-3": { en: "LPPM Administration Staff & Cooperation (National)", id: "Staf Administrasi LPPM & Kerja Sama (Nasional)" },
    "exp-desc-3": {
        en: `Assisted daily institutional research administration, managed document archiving and report preparation, provided executive support to research committees, and handled official correspondence for national collaboration initiatives.`,
        id: `Membantu administrasi penelitian institusional harian, mengelola pengarsipan dokumen dan penyusunan laporan, memberikan dukungan eksekutif kepada komite penelitian, serta menangani korespondensi resmi kerja sama nasional.`
    },
    "sec-proj": { en: "Projects", id: "Proyek Unggulan" },
    "pill-1": { en: `<i class="ph ph-corners-out"></i> Open Gallery Grid (6 Images)`, id: `<i class="ph ph-corners-out"></i> Buka Galeri Grid (6 Gambar)` },
    "proj-head-1": { en: "Employee Performance Appraisal System", id: "Sistem Penilaian Kinerja Karyawan" },
    "proj-sum-1": {
        en: "An integrated Human Resource Management System featuring digital document archiving, employee evaluation tracking, and academic administrative automation for Agung Putra University.",
        id: "Sistem Manajemen Sumber Daya Manusia terintegrasi yang menampilkan pengarsipan dokumen digital, pelacakan evaluasi karyawan, dan otomatisasi administrasi akademik untuk Universitas Agung Putra."
    },
    "pill-2": { en: `<i class="ph ph-corners-out"></i> Open Gallery Grid (8 Images)`, id: `<i class="ph ph-corners-out"></i> Buka Galeri Grid (8 Gambar)` },
    "proj-head-2": { en: "Internal Quality Assurance Questionnaire System", id: "Sistem Kuesioner Penjaminan Mutu Internal" },
    "proj-sum-2": {
        en: "An integrated academic survey and evaluation questionnaire platform designed for Agung Putra University's Internal Quality Assurance Board (LPMI), facilitating automated feedback collection, institutional auditing, and quality compliance tracking.",
        id: "Platform survei akademik dan kuesioner evaluasi terintegrasi yang dirancang untuk Lembaga Penjaminan Mutu Internal (LPMI) Universitas Agung Putra, memfasilitasi pengumpulan umpan balik otomatis, audit institusional, dan pelacakan kepatuhan mutu."
    },
    "mod-badge-1": { en: `<i class="ph ph-images"></i> Documentation Gallery`, id: `<i class="ph ph-images"></i> Galeri Dokumentasi` },
    "mod-head-1": { en: "Employee Performance Appraisal System", id: "Sistem Penilaian Kinerja Karyawan" },
    "mod-desc-1": {
        en: "Comprehensive interface preview and feature walkthrough of the Human Resource Management and Employee Performance Appraisal System at Agung Putra University.",
        id: "Pratinjau antarmuka komprehensif dan penjelasan fitur dari Sistem Manajemen Sumber Daya Manusia dan Penilaian Kinerja Karyawan di Universitas Agung Putra."
    },
    "mod-badge-2": { en: `<i class="ph ph-images"></i> Documentation Gallery`, id: `<i class="ph ph-images"></i> Galeri Dokumentasi` },
    "mod-head-2": { en: "Internal Quality Assurance Questionnaire System", id: "Sistem Kuesioner Penjaminan Mutu Internal" },
    "mod-desc-2": {
        en: "Comprehensive interface preview and feature walkthrough of the Internal Quality Assurance Board (LPMI) Questionnaire and Evaluation Survey System at Agung Putra University.",
        id: "Pratinjau antarmuka komprehensif dan penjelasan fitur dari Sistem Survei Kuesioner dan Evaluasi Lembaga Penjaminan Mutu Internal (LPMI) di Universitas Agung Putra."
    },
    "pill-3": { en: `<i class="ph ph-corners-out"></i> Open Gallery Grid (4 Images)`, id: `<i class="ph ph-corners-out"></i> Buka Galeri Grid (4 Gambar)` },
    "proj-head-3": { en: "Dynasty of War — Tactical Turn-Based RPG", id: "Dynasty of War — Game RPG Strategi Turn-Based" },
    "proj-sum-3": {
        en: "A tactical turn-based RPG console game engineered in C++ utilizing Object-Oriented Programming (OOP). Features dynamic combat mechanics, character class specialization, and randomized attribute boosters.",
        id: "Game RPG strategi turn-based berbasis konsol yang dikembangkan menggunakan C++ dan Pemrograman Berorientasi Objek (OOP). Menampilkan mekanik pertarungan dinamis, spesialisasi kelas karakter, dan sistem peningkatan atribut acak."
    },
    "mod-badge-3": { en: `<i class="ph ph-images"></i> Documentation Gallery`, id: `<i class="ph ph-images"></i> Galeri Dokumentasi` },
    "mod-head-3": { en: "Dynasty of War — Tactical Turn-Based RPG", id: "Dynasty of War — Game RPG Strategi Turn-Based" },
    "mod-desc-3": {
        en: "Comprehensive gameplay and design concept walkthrough of Dynasty of War, a terminal-based strategy game built with C++ and object-oriented principles.",
        id: "Penjelasan mendalam tentang konsep desain dan alur permainan Dynasty of War, sebuah game strategi berbasis terminal yang dibangun dengan C++ dan prinsip berorientasi objek."
    }
};

const exactMatchDict = {
    "Home": "Beranda",
    "About Me": "Tentang Saya",
    "Education": "Pendidikan",
    "Work Experience": "Pengalaman Kerja",
    "Projects": "Proyek",
    "Download CV": "Unduh CV",
    "GitHub": "GitHub",
    "Switch Theme": "Ganti Tema",
    "Translate to Indonesia": "Terjemahkan ke Indonesia",
    "Translate to English": "Terjemahkan ke Inggris",
    "Zoom": "Perbesar",


    // SDM APU Captions
    "PIN-Based Login Portal — Secure appraisal gateway where every division head (evaluator) and HRD officer accesses the system using a distinct, unique PIN code.":
    "Portal Login Berbasis PIN — Gerbang penilaian aman di mana setiap kepala divisi (penilai) dan petugas HRD mengakses sistem menggunakan kode PIN unik.",
    "Employee Appraisal & Selection Interface — Evaluators select an employee by name; once selected, the employee's detailed profile appears, allowing the division head to conduct structured appraisals.":
    "Antarmuka Pemilihan & Penilaian Karyawan — Penilai memilih karyawan berdasarkan nama; setelah dipilih, profil terperinci karyawan muncul, memungkinkan kepala divisi melakukan penilaian terstruktur.",
    "Performance Appraisal History & Statistics — Leaders and HRD staff review the complete evaluation history of appraised employees, featuring analytical statistics and performance averages to guide strategic decisions.":
    "Riwayat & Statistik Penilaian Kinerja — Pimpinan dan staf HRD meninjau riwayat evaluasi lengkap karyawan yang dinilai, menampilkan statistik analitis dan rata-rata kinerja untuk memandu keputusan strategis.",
    "Individual Employee Performance Analytics — Detailed statistical modal showcasing personalized performance trends and appraisal scores derived from historical evaluations of the selected employee.":
    "Analitik Kinerja Karyawan Individu — Modal statistik terperinci yang menampilkan tren kinerja personal dan skor penilaian yang diperoleh dari evaluasi historis karyawan yang dipilih.",
    "Employee Data Management Console — HRD staff manage employee directory profiles: adding, deleting, activating, or deactivating accounts, and updating details like name, job title, and join date for appraisal eligibility.":
    "Konsol Manajemen Data Karyawan — Staf HRD mengelola profil direktori karyawan: menambah, menghapus, mengaktifkan, atau menonaktifkan akun, serta memperbarui detail seperti nama, jabatan, dan tanggal bergabung.",
    "User Roles & Access Management — HRD staff configure system access, mapping division leaders (evaluators) to specific subordinate groups and generating unique access PIN codes for appraisal authorizations.":
    "Peran Pengguna & Manajemen Akses — Staf HRD mengonfigurasi akses sistem, memetakan pimpinan divisi ke kelompok bawahan tertentu dan menghasilkan kode PIN akses unik.",

    // LPMI APU Captions
    "LPMI Auditor & Admin Portal — Secure authentication gateway for Internal Quality Assurance Board (LPMI) officers and academic auditors to manage survey instruments and analyze institutional satisfaction scores.":
    "Portal Admin & Auditor LPMI — Gerbang autentikasi aman bagi petugas Lembaga Penjaminan Mutu Internal (LPMI) dan auditor akademik untuk mengelola instrumen survei dan menganalisis skor kepuasan.",
    "Respondent & Faculty Login Gateway — Accessible survey portal where university students, lecturers, alumni, and stakeholders log in to complete evaluation questionnaires.":
    "Gerbang Login Responden & Fakultas — Portal survei yang mudah diakses di mana mahasiswa, dosen, alumni, dan pemangku kepentingan login untuk mengisi kuesioner evaluasi.",
    "Quality Survey Analytics Dashboard — Real-time visual overview displaying active questionnaire campaigns, overall response rates, and institutional satisfaction indices across faculties.":
    "Dashboard Analitik Survei Mutu — Ringkasan visual real-time yang menampilkan kampanye kuesioner aktif, tingkat partisipasi keseluruhan, dan indeks kepuasan institusi di seluruh fakultas.",
    "Dynamic Questionnaire & Survey Form — Interactive digital survey interface featuring structured Likert-scale criteria, multi-choice evaluation items, and qualitative feedback fields.":
    "Formulir Survei & Kuesioner Dinamis — Antarmuka survei digital interaktif yang menampilkan kriteria skala Likert terstruktur, item evaluasi pilihan ganda, dan kolom umpan balik kualitatif.",
    "Survey Response & Feedback Archive — Centralized database repository recording historical questionnaire responses, respondent demographics, and department-specific evaluation records.":
    "Arsip Umpan Balik & Respons Survei — Penyimpanan basis data terpusat yang merekam respons kuesioner historis, demografi responden, dan catatan evaluasi spesifik departemen.",
    "Statistical Satisfaction Charts — Comprehensive visual analytics mapping teaching effectiveness, curriculum satisfaction trends, and comparative faculty evaluation benchmarks.":
    "Grafik Kepuasan Statistik — Analitik visual komprehensif yang memetakan efektivitas pengajaran, tren kepuasan kurikulum, dan perbandingan evaluasi antar fakultas.",
    "Quality Assurance Report Generator — Automated compiling tool producing formal LPMI evaluation summaries and accreditation compliance documents directly from survey datasets.":
    "Generator Laporan Penjaminan Mutu — Alat penyusunan otomatis yang menghasilkan ringkasan evaluasi resmi LPMI dan dokumen kepatuhan akreditasi langsung dari kumpulan data survei.",
    "Questionnaire Campaign Management — Administrative panel allowing LPMI staff to create new survey periods, customize question banks, and set target respondent criteria.":
    "Manajemen Kampanye Kuesioner — Panel administratif yang memungkinkan staf LPMI membuat periode survei baru, menyesuaikan bank soal, dan menentukan kriteria target responden.",

    // Dynasty of War Captions
    "Title Banner & Concept Artwork — Cinematic fantasy illustration embodying the dark tactical atmosphere of Dynasty of War, featuring the game's core warrior classes.":
    "Spanduk Judul & Ilustrasi Konsep — Ilustrasi fantasi sinematik yang mewakili atmosfer taktis bernuansa gelap dari Dynasty of War, menampilkan kelas prajurit utama game.",
    "Character Class Selection Screen — Concept UI showcasing the 4 distinct playable classes: Ogre, Knight, Mage, and Swordsman, each engineered with unique base HP, Attack, and Defense stats.":
    "Layar Pemilihan Kelas Karakter — UI Konsep yang menampilkan 4 kelas yang dapat dimainkan: Ogre, Knight, Mage, dan Swordsman, masing-masing dirancang dengan statistik HP, Serangan, dan Pertahanan unik.",
    "Turn-Based Combat Command HUD — Action menu interface where players execute strategic moves against enemy AI, choosing between Attack, Attack Up (+1 to +3), Defense Up, or Heal.":
    "HUD Komando Pertarungan Turn-Based — Antarmuka menu aksi di mana pemain mengeksekusi langkah strategis melawan AI musuh, memilih antara Serang, Peningkatan Serangan (+1 hingga +3), Peningkatan Pertahanan, atau Sembuhkan.",
    "C++ Terminal & Core Engine Execution — View of the backend C++ source code structure and real-time command-line battle execution console utilizing Object-Oriented architecture.":
    "Terminal C++ & Eksekusi Mesin Utama — Tampilan struktur kode sumber C++ dan konsol eksekusi pertarungan baris perintah secara real-time yang menggunakan arsitektur Berorientasi Objek."
};

let currentAppLang = localStorage.getItem('porto_lang') || 'en';

function applyPortfolioLanguage(lang) {
    currentAppLang = lang;
    localStorage.setItem('porto_lang', lang);

    // Document Title
    document.title = lang === 'id' 
        ? "Daffa Restu Fadhillah — Pengembang Front-End & Desainer UI/UX" 
        : "Daffa Restu Fadhillah — Front-End Developer & UI/UX Designer";

    // 1. Blocks with data-tr
    document.querySelectorAll('[data-tr]').forEach(el => {
        const key = el.getAttribute('data-tr');
        if (htmlTranslations[key] && htmlTranslations[key][lang]) {
            el.innerHTML = htmlTranslations[key][lang];
        }
    });

    // 2. Zoom pills

    document.querySelectorAll('.cell-zoom-pill').forEach(el => {
        el.innerHTML = lang === 'id' ? `<i class="ph ph-magnifying-glass-plus"></i> Perbesar` : `<i class="ph ph-magnifying-glass-plus"></i> Zoom`;
    });

    // 4. Data captions & tooltips
    document.querySelectorAll('[data-caption]').forEach(el => {
        const cap = el.getAttribute('data-en-cap') || el.getAttribute('data-caption');
        if (!el.hasAttribute('data-en-cap')) el.setAttribute('data-en-cap', cap);
        if (lang === 'id' && exactMatchDict[cap]) {
            el.setAttribute('data-caption', exactMatchDict[cap]);
        } else if (lang === 'en') {
            el.setAttribute('data-caption', cap);
        }
    });

    document.querySelectorAll('.dock-item[data-tooltip]').forEach(el => {
        const tip = el.getAttribute('data-en-tip') || el.getAttribute('data-tooltip');
        if (!el.hasAttribute('data-en-tip')) el.setAttribute('data-en-tip', tip);
        if (lang === 'id' && exactMatchDict[tip]) {
            el.setAttribute('data-tooltip', exactMatchDict[tip]);
        } else if (lang === 'en') {
            el.setAttribute('data-tooltip', tip);
        }
    });

    // 5. Update Translate Button
    const trBtn = document.getElementById('lang-toggle');
    if (trBtn) {
        const parentLi = trBtn.closest('.dock-item');
        if (lang === 'id') {
            trBtn.classList.add('active-lang');
            if (parentLi) parentLi.setAttribute('data-tooltip', 'Translate to English');
        } else {
            trBtn.classList.remove('active-lang');
            if (parentLi) parentLi.setAttribute('data-tooltip', 'Translate to Indonesia');
        }
    }

    // 6. Update Lightbox description if currently active
    const lightboxDesc = document.getElementById('lightbox-desc');
    if (lightboxDesc && lightboxDesc.textContent) {
        const lightboxModal = document.getElementById('lightbox-modal');
        if (lightboxModal && lightboxModal.classList.contains('active')) {
            // Find active gallery cell
            const activeModal = document.querySelector('.gallery-modal.active');
            if (activeModal) {
                const cells = activeModal.querySelectorAll('.gallery-cell');
                const counter = document.getElementById('lightbox-counter');
                if (counter && counter.textContent) {
                    const idx = parseInt(counter.textContent.split('/')[0].trim()) - 1;
                    if (cells[idx]) {
                        lightboxDesc.textContent = cells[idx].getAttribute('data-caption');
                    }
                }
            }
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const trBtn = document.getElementById('lang-toggle');
    if (trBtn) {
        trBtn.addEventListener('click', () => {
            const nextLang = currentAppLang === 'en' ? 'id' : 'en';
            applyPortfolioLanguage(nextLang);
        });
    }

    // Apply saved language on load
    if (currentAppLang === 'id') {
        applyPortfolioLanguage('id');
    }
});
