# BNCC-Feedback-Website (On how to save and open files)
RnD Rolling Quest

How to: menjalankan proyek ini menggunakan localhost, struktur file penting, cara menyimpan/membuka file, and troubleshooting. 

## What we need:
- Node.js 
- npm 
- Git (kalau mau clone repo)

## Menyiapkan proyek 
1. Clone repo:
   - git clone https://github.com/SoniaRY-15/BNCC-Feedback-Website.git
   - cd BNCC-Feedback-Website

2. Install dependencies:
   - npm install

3. Masukan semua dalam 1 folder. Make sure folder "public" juga ada di dalam folder utama itu. (Folder public berisikan script.js, style.css, dan index.html)

## Menjalankan aplikasi lokal
- First step in integrated terminal:
  - npm run dev
  - atau
  - npm start

- Buka di browser:
  - http://localhost:4000
  - Jika server berjalan di port lain, lihat output terminal yang biasanya menampilkan port.

## Menyimpan / Mengedit file
- File HTML/CSS/JS yang akan di-serve statically taruh di folder `public`.
  - Contoh: edit `public/index.html`, `public/css/style.css`, `public/js/main.js`.
- File backend (misal express) biasanya di folder root atau `src/`.
  - Contoh: `server.js`, `route.js`, `store.js` or `src/routes.js`, `src/server.js`.
- Setelah menyimpan file:
  - Jika memakai watcher (in this case, I'm using nodemon), perubahan akan reload otomatis.
  - Jika tidak, restart server: Ctrl+C -> npm start

## Struktur Folder (rekomendasi)
- / (root)
  - package.json
  - server.js
  - route.js
  - store.js
  - /public
    - index.html
    - style.css
    - script.js
  - README.md
  - notes.txt

## Variabel Lingkungan (.env)
Jika proyek menggunakan environment variables, buat file `.env` di root:
- Contoh `.env`:
  - PORT=4000
  - NODE_ENV=development
  - DATABASE_URL=...
- Pastikan `.env` tidak ter-commit jika berisi secret (tambahkan .env ke .gitignore).

## Debugging & Troubleshooting
- Tidak bisa mengakses http://localhost:4000:
  - Pastikan server berjalan (periksa terminal).
  - Periksa port (mungkin port berbeda).
  - Periksa apakah `public/index.html` ada.
- Error "module not found":
  - Jalankan `npm install`.
- Perubahan tidak muncul:
  - Pastikan development server mendukung hot reload.
  - Kalau tidak, restart server.
- Port sudah dipakai:
  - Matikan proses yang pakai port atau ubah PORT.

---
Jika kamu mau aku tambahkan instruksi spesifik berdasarkan file nyata dalam repo (mis. nama server file, script npm, atau API endpoints), beri tahu dan aku bisa menulis README yang disesuaikan.
