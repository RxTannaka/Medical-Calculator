# Kalkulator Medis – Murni Teguh Memorial Hospital

Kalkulator klinis berbahasa Indonesia untuk dipakai di samping tempat tidur pasien. Delapan kalkulator dihimpun dalam satu halaman. Data diisi di layar, lalu hasilnya dicetak ke kertas A4 dengan kop rumah sakit sebagai lampiran rekam medis.

## Daftar kalkulator

| Tab | Kegunaan |
|---|---|
| **PSI Score** | *Pneumonia Severity Index*: kelas risiko I–V dan perkiraan mortalitas pneumonia |
| **Koreksi Natrium** | Rencana koreksi hiponatremia per hari, dibatasi kecepatan koreksi maksimal per 24 jam |
| **Koreksi Kalium** | Kebutuhan KCl, jumlah vial, dan kecepatan infus sesuai akses vena |
| **Tatalaksana Malnutrisi** | Diagnosis malnutrisi dari *checklist* Tabel 7, target kalori dan protein (BB aktual atau BB ideal), serta formulir tata laksana gizi (2 halaman cetak) |
| **TIMI UA/NSTEMI** | Skor TIMI dan risiko kejadian 14 hari |
| **TIMI STEMI** | Skor TIMI dan mortalitas 30 hari |
| **GRACE Score** | Stratifikasi risiko kematian di rumah sakit dan 6 bulan menurut PERKI |
| **SYNTAX Score** | SYNTAX Score I (anatomis), dinilai per lesi |

### Catatan SYNTAX Score
- Segmen dipilih dengan mengklik diagram koroner atau mencentang daftar. Bobot segmen mengikuti dominansi kanan atau kiri.
- Satu lesi hanya bisa berada di satu sistem (RCA atau sistem kiri). Peringatan muncul bila satu segmen dipakai di dua lesi atau bila bifurkasi dan trifurkasi dipilih bersamaan.
- Pertanyaan *total occlusion* mengikuti aplikasi resmi syntaxscore.org, termasuk *side branch* dan *first segment beyond the T.O. visualised*.
- Perhitungan sudah dicocokkan dengan kalkulator resmi pada kasus empat lesi (total 36,5).
- Hasil cetak memuat gambar tiap lesi beserta karakteristiknya, skor akhir, dan kolom *Notes*. Rekomendasi PERKI hanya tampil di layar.

## Cara memakai

1. Buka `index.html` di peramban (Chrome, Edge, atau Firefox). Tidak perlu instalasi, server, atau koneksi internet.
2. Isi data pasien: nama, No. MR, tanggal lahir, jenis kelamin, dan tanggal *assessment*. Isian berat badan hanya muncul di kalkulator yang memakainya (Natrium, Kalium, Malnutrisi, TIMI STEMI).
3. Pilih tab kalkulator, lalu isi datanya. Hasil dihitung otomatis setiap kali isian berubah.
4. Isi nama dokter, lalu klik **Print / Save PDF**. Hanya tab yang sedang aktif yang dicetak.
5. Klik **🗑 Pasien Baru** untuk mengosongkan semua isian sebelum pasien berikutnya.

### Penyimpanan data
Isian disimpan di `sessionStorage` peramban, sehingga tetap ada bila halaman dimuat ulang. Data hilang setelah peramban ditutup dan tidak dikirim ke mana pun. Tidak ada data pasien yang tersimpan di server.

## Struktur berkas

```
index.html          Tampilan: tab, data pasien, isian tiap kalkulator
header.jpg          Kop surat rumah sakit
css/style.css       Seluruh gaya, termasuk aturan cetak A4 dan tampilan HP
js/common.js        Inti bersama: pindah tab, data pasien, penyimpanan, hitung ulang, cetak
js/psi.js           PSI Score
js/natrium.js       Koreksi Natrium
js/kalium.js        Koreksi Kalium
js/malnutrisi.js    Tatalaksana Malnutrisi
js/timi.js          TIMI STEMI dan TIMI UA/NSTEMI
js/grace.js         GRACE Score
js/syntax.js        SYNTAX Score
```

`js/common.js` harus dimuat lebih dulu, lalu berkas kalkulator lainnya. Panduan teknis untuk pengembangan ada di `CLAUDE.md`.

## Rujukan utama

- Fine MJ, dkk. *A prediction rule to identify low-risk patients with community-acquired pneumonia.* N Engl J Med. 1997;336:243–50.
- Antman EM, dkk. *The TIMI risk score for unstable angina/non-ST elevation MI.* JAMA. 2000;284:835–42.
- Morrow DA, dkk. *TIMI risk score for ST-elevation myocardial infarction.* Circulation. 2000;102:2031–7.
- Sianos G, dkk. *The SYNTAX Score: an angiographic tool grading the complexity of coronary artery disease.* EuroIntervention. 2005;1:219–27.
- Perhimpunan Dokter Spesialis Kardiovaskular Indonesia (PERKI). *Pedoman Tata Laksana Sindrom Koroner Akut.* Edisi ke-5. Jakarta: PERKI; 2024.

## Penafian

Kalkulator ini adalah alat bantu. Hasilnya tidak menggantikan penilaian klinis dokter penanggung jawab pasien. Keputusan tata laksana tetap mempertimbangkan kondisi pasien secara menyeluruh.
