// File Konfigurasi Keamanan & Environment (.env eksternal) untuk Web-Porto
// File ini memisahkan konfigurasi atau parameter sensitif agar tidak ditulis langsung di file utama (index.html / script.js).
// Jika di masa depan Anda menambahkan integrasi API (seperti EmailJS, Google Analytics, atau Webhook), simpan kredensial di sini.

window.__PORTFOLIO_ENV = {
    // Informasi Lingkungan & Aplikasi
    APP_NAME: "Web-Porto Daffa ATS",
    APP_VERSION: "6.0",
    ENVIRONMENT: "production",

    // Kredensial API Eksternal (Siap digunakan untuk integrasi form kontak / analitik)
    CONTACT_API_ENDPOINT: "",
    EMAILJS_SERVICE_ID: "",
    EMAILJS_TEMPLATE_ID: "",
    EMAILJS_PUBLIC_KEY: "",

    // Pengaturan Keamanan Client-Side Opsional
    SECURITY: {
        DISABLE_CONSOLE_LOGS: false, // Set true untuk menyembunyikan log sensitif di production
        SHOW_INSPECT_WARNING: true   // Menampilkan peringatan keamanan saat seseorang membuka Inspect Element (Console)
    }
};

// Logika Peringatan Keamanan saat Inspect Element dibuka
if (window.__PORTFOLIO_ENV && window.__PORTFOLIO_ENV.SECURITY.SHOW_INSPECT_WARNING) {
    setTimeout(() => {
        console.log("%cSTOP!", "color: red; font-size: 40px; font-weight: bold; -webkit-text-stroke: 1px black;");
        console.log("%cFitur konsol browser ini ditujukan untuk pengembang. Jangan menyalin atau menjalankan kode apa pun di sini demi keamanan data Anda.", "font-size: 14px; color: #555;");
    }, 1000);
}
