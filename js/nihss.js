// NIHSS (National Institutes of Health Stroke Scale): 15 item, total 0–42.

// value 'UN' = untestable (amputasi/fusi sendi, intubasi): tidak menambah skor
// Teks item dan skala mengikuti Tabel 3 PNPK Tata Laksana Stroke (KMK HK.01.07/MENKES/304/2026).
// Item 6: penomoran skala di tabel PNPK bergeser satu baris; dipakai urutan baku NIHSS (sama dengan item 5).
const PETUNJUK_LENGAN = 'Angkat lengan 45° bila berbaring atau 90° bila duduk. Bila afasia, beri perintah dengan pantomim atau peragaan.';
const PETUNJUK_TUNGKAI = 'Pasien berbaring terlentang, angkat tungkai 30°.';

const NIHSS_ITEMS = [
    { id: 'nihss1a', no: '1a', nama: 'Tingkat kesadaran', opsi: [
        [0, 'Sadar penuh'], [1, 'Somnolen'], [2, 'Stupor'], [3, 'Koma']] },
    { id: 'nihss1b', no: '1b', nama: 'Menjawab pertanyaan', petunjuk: 'Tanyakan bulan dan usia pasien. Yang dinilai jawaban pertama; pemeriksa tidak boleh membantu secara verbal maupun nonverbal.', opsi: [
        [0, 'Benar semua (2 pertanyaan)'], [1, '1 benar / ETT / disartria'], [2, 'Salah semua / afasia / stupor / koma']] },
    { id: 'nihss1c', no: '1c', nama: 'Mengikuti perintah', petunjuk: 'Berikan 2 perintah sederhana: membuka dan menutup mata, menggenggam tangan dan melepaskannya (atau 2 perintah lain).', opsi: [
        [0, 'Mampu melakukan 2 perintah'], [1, 'Mampu melakukan 1 perintah'], [2, 'Tidak mampu melakukan perintah']] },
    { id: 'nihss2', no: '2', nama: 'Gaze', petunjuk: 'Gerakan mata konjugat horizontal.', opsi: [
        [0, 'Normal'], [1, 'Abnormal pada 1 mata'], [2, 'Deviasi konjugat kuat atau paresis konjugat pada 2 mata']] },
    { id: 'nihss3', no: '3', nama: 'Visual', petunjuk: 'Lapang pandang pada tes konfrontasi.', opsi: [
        [0, 'Tidak ada gangguan'], [1, 'Kuadrianopsia'], [2, 'Hemianopia total'], [3, 'Hemianopia bilateral / buta kortikal']] },
    { id: 'nihss4', no: '4', nama: 'Paresis wajah', petunjuk: 'Anjurkan pasien menyeringai atau mengangkat alis dan menutup mata.', opsi: [
        [0, 'Normal'], [1, 'Paresis wajah ringan (lipatan nasolabial datar, senyum asimetris)'],
        [2, 'Paresis wajah parsial (paresis wajah bawah total atau hampir total)'], [3, 'Paresis wajah total (sesisi atau 2 sisi)']] },
    { id: 'nihss5a', no: '5a', nama: 'Motorik lengan kiri', opsi: 'lengan', petunjuk: PETUNJUK_LENGAN },
    { id: 'nihss5b', no: '5b', nama: 'Motorik lengan kanan', opsi: 'lengan', petunjuk: PETUNJUK_LENGAN },
    { id: 'nihss6a', no: '6a', nama: 'Motorik tungkai kiri', opsi: 'tungkai', petunjuk: PETUNJUK_TUNGKAI },
    { id: 'nihss6b', no: '6b', nama: 'Motorik tungkai kanan', opsi: 'tungkai', petunjuk: PETUNJUK_TUNGKAI },
    { id: 'nihss7', no: '7', nama: 'Ataksia anggota badan', petunjuk: 'Menggunakan tes jari-hidung.', opsi: [
        [0, 'Tidak ada ataksia'], [1, 'Ataksia pada satu ekstremitas'], [2, 'Ataksia pada dua atau lebih ekstremitas'],
        ['UN', 'UN – tidak dapat dinilai (amputasi/fusi sendi)']] },
    { id: 'nihss8', no: '8', nama: 'Sensorik', petunjuk: 'Tes pada tungkai, lengan, badan, dan wajah. Pasien afasia diberi nilai 1; pasien stupor atau koma diberi nilai 2.', opsi: [
        [0, 'Normal'], [1, 'Gangguan sensori ringan hingga sedang (nyeri berkurang, masih merasa bila disentuh)'],
        [2, 'Gangguan sensori berat atau total']] },
    { id: 'nihss9', no: '9', nama: 'Kemampuan berbahasa', petunjuk: 'Minta pasien menjelaskan gambar atau membaca tulisan. Bila buta, letakkan benda di tangan pasien dan minta menjelaskannya.', opsi: [
        [0, 'Normal'], [1, 'Afasia ringan hingga sedang'], [2, 'Afasia berat'], [3, '<em>Mute</em>, afasia global, koma']] },
    { id: 'nihss10', no: '10', nama: 'Disartria', opsi: [
        [0, 'Normal'], [1, 'Disartria ringan'], [2, 'Disartria berat'], ['UN', 'UN – tidak dapat dinilai (intubasi/hambatan fisik)']] },
    { id: 'nihss11', no: '11', nama: '<em>Neglect</em> atau inatensi', opsi: [
        [0, 'Tidak ada <em>neglect</em>'],
        [1, 'Tidak ada atensi pada salah satu modalitas (visual, taktil, auditori, spasial, atau personal)'],
        [2, 'Tidak ada atensi pada lebih dari satu modalitas']] }
];

const NIHSS_MOTOR = {
    lengan: [[0, 'Mampu mengangkat lengan minimal 10 detik'], [1, 'Lengan terjatuh sebelum 10 detik'],
             [2, 'Tidak mampu mengangkat secara penuh 90° atau 45°'], [3, 'Tidak mampu mengangkat, hanya bergeser'],
             [4, 'Tidak ada gerakan'], ['UN', 'UN – tidak dapat dinilai (amputasi/fusi sendi)']],
    tungkai: [[0, 'Mampu mengangkat tungkai 30° minimal 5 detik'], [1, 'Tungkai jatuh perlahan ke tempat tidur pada akhir detik ke-5'],
              [2, 'Tungkai jatuh sebelum 5 detik tetapi ada usaha melawan gravitasi'], [3, 'Tidak mampu melawan gravitasi'],
              [4, 'Tidak ada gerakan'], ['UN', 'UN – tidak dapat dinilai (amputasi/fusi sendi)']]
};

const nihssOpsi = item => typeof item.opsi === 'string' ? NIHSS_MOTOR[item.opsi] : item.opsi;

// Dua jenis assessment, satu lembar per assessment (tidak dibandingkan).
// Data keduanya tetap disimpan terpisah; dropdown nihssJenis menentukan yang tampil, dihitung, dan dicetak.
// Assessment awal memakai ID lama 'nihss1a' dst. agar data tersimpan tetap terbaca.
const NIHSS_PENILAIAN = {
    awal:  { judul: 'Assessment Awal', pref: 'nihss',  tgl: 'nihssTglMasuk',  tglLabel: 'Tanggal Assessment Awal' },
    akhir: { judul: 'Assessment Akhir (Discharge)', pref: 'nihssK', tgl: 'nihssTglKeluar', tglLabel: 'Tanggal Discharge' }
};

// Modified Rankin Scale (van Swieten dkk., 1988), dinilai di setiap assessment bersama NIHSS (keperluan klaim).
// Tidak dijumlahkan ke skor NIHSS. PNPK Stroke 2026 memakai mRS (mis. mRS 0–1) tetapi tidak memuat tabelnya.
const MRS_ITEM = { no: 'mRS', nama: 'Modified Rankin Scale (mRS)', petunjuk: 'Nilai status fungsional pasien saat assessment ini.', opsi: [
    [0, 'Tidak ada gejala sama sekali'],
    [1, 'Tidak ada disabilitas bermakna; mampu melakukan semua tugas dan aktivitas sehari-hari meskipun ada gejala'],
    [2, 'Disabilitas ringan; tidak mampu melakukan semua aktivitas sebelumnya, tetapi mampu mengurus diri sendiri tanpa bantuan'],
    [3, 'Disabilitas sedang; memerlukan sedikit bantuan, tetapi mampu berjalan tanpa bantuan'],
    [4, 'Disabilitas sedang-berat; tidak mampu berjalan dan mengurus kebutuhan tubuh sendiri tanpa bantuan'],
    [5, 'Disabilitas berat; terbaring di tempat tidur, inkontinensia, memerlukan perawatan dan perhatian terus-menerus'],
    [6, 'Meninggal']] };
const MRS_ID = { awal: 'mrsAwal', akhir: 'mrsAkhir' };

const nihssJenis = () => getValue('nihssJenis') === 'akhir' ? 'akhir' : 'awal';

// Warna tiap pilihan menurut tingkat keparahan (0 = toska, tengah = biru, maksimum = merah), dari kop surat RS
function nihssWarna(v, maks) {
    const stop = [[80, 192, 176], [0, 112, 176], [192, 32, 32]];
    const t = maks ? v / maks : 0;
    const [a, b, u] = t <= 0.5 ? [stop[0], stop[1], t / 0.5] : [stop[1], stop[2], (t - 0.5) / 0.5];
    return 'rgb(' + a.map((x, i) => Math.round(x + (b[i] - x) * u)).join(',') + ')';
}

// Isian dibuat di sini (berkas dimuat di akhir <body>, sebelum DOMContentLoaded),
// sehingga common.js bisa memasang listener dan memulihkan nilai seperti isian lain.
(function renderNIHSSInputs() {
    const box = document.getElementById('nihss-items');
    if (!box) return;
    // <select> tersembunyi = sumber nilai (disimpan/dipulihkan common.js); yang tampil daftar pilihan yang bisa diketuk
    const sel = (id, item, jenis) => `<div class="nihss-${jenis}">
            <select id="${id}" class="nihss-hidden" tabindex="-1" aria-hidden="true">
                <option value=""></option>
                ${nihssOpsi(item).map(([v]) => `<option value="${v}"></option>`).join('')}
            </select>
            <div class="nihss-opsi" role="radiogroup">
                ${nihssOpsi(item).map(([v, t]) => {
                    const maks = Math.max(...nihssOpsi(item).map(([x]) => x).filter(x => x !== 'UN'));
                    const meter = v === 'UN' ? '' : `<span class="nihss-meter">${Array.from({ length: maks }, (_, k) => `<i${k < v ? ' class="isi"' : ''}></i>`).join('')}</span>`;
                    return `<button type="button" class="nihss-pil${v === 'UN' ? ' nihss-pil-un' : ''}" role="radio" aria-checked="false" data-for="${id}" data-v="${v}"
                        style="--lvl: ${v === 'UN' ? '#90a4ae' : nihssWarna(v, maks)}">
                        <span class="nihss-angka">${v === 'UN' ? 'UN' : v}</span>${meter}<span class="nihss-teks">${t}</span></button>`;
                }).join('')}
            </div></div>`;
    box.innerHTML = `
        <div class="nihss-row nihss-head">
            <label>Jenis Assessment:
                <select id="nihssJenis">
                    <option value="awal">Assessment Awal</option>
                    <option value="akhir">Assessment Akhir (Discharge)</option>
                </select>
            </label>
            ${Object.entries(NIHSS_PENILAIAN).map(([k, p]) => `<label class="nihss-${k}">${p.tglLabel}:<input type="date" id="${p.tgl}"></label>`).join('')}
        </div>` + `<div class="nihss-kartu-grid">` + NIHSS_ITEMS.map(item => `
        <div class="nihss-kartu" data-item="${item.no}">
            <span class="nihss-tab">${item.no}</span>
            <div class="nihss-kartu-judul"><span class="nihss-nama">${item.nama}</span><span class="nihss-kartu-skor"></span></div>
            ${item.petunjuk ? `<div class="nihss-petunjuk">${item.petunjuk}</div>` : ''}
            <div class="nihss-garis" aria-hidden="true"></div>
            ${Object.entries(NIHSS_PENILAIAN).map(([k, p]) => sel(p.pref + item.no, item, k)).join('')}
        </div>`).join('') + `
        <div class="nihss-kartu nihss-kartu-mrs" data-mrs="1">
            <span class="nihss-tab">mRS</span>
            <div class="nihss-kartu-judul"><span class="nihss-nama">${MRS_ITEM.nama}</span><span class="nihss-kartu-skor"></span></div>
            <div class="nihss-petunjuk">${MRS_ITEM.petunjuk} Tidak dijumlahkan ke skor NIHSS.</div>
            <div class="nihss-garis" aria-hidden="true"></div>
            ${Object.keys(NIHSS_PENILAIAN).map(k => sel(MRS_ID[k], MRS_ITEM, k)).join('')}
        </div>` + `</div>`;

    // Tanggal assessment awal bawaan = hari ini (ditimpa data tersimpan bila ada)
    document.getElementById('nihssTglMasuk').value = new Date().toISOString().split('T')[0];

    // Ketuk pilihan = isi <select>; ketuk lagi pilihan yang sama = kosongkan
    box.addEventListener('click', e => {
        const btn = e.target.closest('.nihss-pil');
        if (!btn) return;
        const s = document.getElementById(btn.dataset.for);
        s.value = (s.value === btn.dataset.v) ? '' : btn.dataset.v;
        s.dispatchEvent(new Event('change', { bubbles: true }));
    });
})();

// Sorot pilihan sesuai nilai <select> (dipanggil tiap hitung ulang, termasuk setelah pulih/hapus data)
function nihssSorot() {
    document.querySelectorAll('#nihss-items .nihss-pil').forEach(btn => {
        const aktif = getValue(btn.dataset.for) === btn.dataset.v;
        btn.classList.toggle('aktif', aktif);
        btn.setAttribute('aria-checked', aktif ? 'true' : 'false');
    });
    // Kartu yang sudah dijawab (pada assessment aktif): aksen biru + skor di judul
    const pref = NIHSS_PENILAIAN[nihssJenis()].pref;
    document.querySelectorAll('#nihss-items .nihss-kartu').forEach(kartu => {
        const v = kartu.dataset.mrs ? getValue(MRS_ID[nihssJenis()]) : getValue(pref + kartu.dataset.item);
        const ada = v !== undefined && v !== '';
        kartu.classList.toggle('terisi', ada);
        kartu.querySelector('.nihss-kartu-skor').textContent = ada ? (v === 'UN' ? 'UN' : 'Skor ' + v) : '';
    });
}

// Hitung satu assessment
function nihssHitung(pref) {
    let total = 0, terisi = 0;
    const baris = NIHSS_ITEMS.map(item => {
        const v = getValue(pref + item.no);
        if (v === undefined || v === '') return { temuan: '<em>belum dinilai</em>', skor: '-' };
        terisi++;
        const opsi = nihssOpsi(item).find(([x]) => String(x) === v);
        if (v !== 'UN') total += parseInt(v);
        return { temuan: opsi ? opsi[1] : v, skor: v === 'UN' ? 'UN' : parseInt(v) };
    });
    return { total, terisi, baris };
}

// Kategori PNPK Stroke 2026: <5 ringan, 5–14 sedang, 15–24 berat, 25–42 sangat berat
function nihssKategori(h) {
    if (!h.terisi) return '-';
    if (h.total < 5) return 'Defisit neurologis ringan';
    if (h.total <= 14) return 'Defisit neurologis sedang';
    if (h.total <= 24) return 'Defisit neurologis berat';
    return 'Defisit neurologis sangat berat';
}

function calculateNIHSS() {
    const n = NIHSS_ITEMS.length;
    const jenis = nihssJenis();
    const p = NIHSS_PENILAIAN[jenis];
    const box = document.getElementById('nihss-items');
    if (box) box.dataset.jenis = jenis; // CSS menyembunyikan isian assessment yang tidak aktif
    nihssSorot();

    const h = nihssHitung(p.pref);
    const tgl = formatDateIndo(getValue(p.tgl));
    const kategori = nihssKategori(h);
    const mrsV = getValue(MRS_ID[jenis]);
    const mrsOpsi = MRS_ITEM.opsi.find(([x]) => String(x) === mrsV);
    const mrsTeks = mrsOpsi ? `${mrsOpsi[0]} &mdash; ${mrsOpsi[1]}` : '<em>belum dinilai</em>';

    setText('displayNihssJudul', p.judul);
    setText('displayNihssScore', h.total);
    setText('displayNihssKategori', kategori);
    setText('displayNihssTgl', `${p.tglLabel}: ${tgl}`);
    setText('displayMrs', mrsOpsi ? `mRS ${mrsOpsi[0]}` : 'mRS -');
    // Baris tanggal di data pasien (tampil hanya di mode NIHSS, lewat CSS)
    setText('displayNihssTglLabel', jenis === 'akhir' ? 'Tgl Discharge' : 'Tgl Assessment Awal');
    setText('displayNihssTglHeader', tgl);
    // Tanggal tanda tangan ikut tanggal assessment NIHSS (bila kosong, pakai Tgl Assessment umum)
    setText('displayTanggalNihss', tgl !== '-' ? tgl : formatDateIndo(getValue('tglAsesmen')));

    let tabel = `<div class="nihss-judul">NIHSS &amp; mRS &ndash; ${p.judul} &nbsp;|&nbsp; ${p.tglLabel}: ${tgl}</div>
        <table class="scoring-table"><thead><tr><th style="width:28px">No</th><th>Parameter yang dinilai</th><th>Skala</th><th style="width:40px">Skor</th></tr></thead><tbody>`;
    NIHSS_ITEMS.forEach((item, k) => {
        tabel += `<tr><td>${item.no}</td><td>${item.nama}</td><td>${h.baris[k].temuan}</td><td>${h.baris[k].skor}</td></tr>`;
    });
    tabel += `<tr><td colspan="3"><strong>TOTAL NIHSS</strong></td><td><strong>${h.total}</strong></td></tr></tbody></table>
        <table class="scoring-table"><tbody><tr><td style="width:170px"><strong>Modified Rankin Scale (mRS)</strong></td><td>${mrsTeks}</td><td style="width:40px"><strong>${mrsOpsi ? mrsOpsi[0] : '-'}</strong></td></tr></tbody></table>`;

    const ingat = [];
    if (h.terisi > 0 && h.terisi < n) ingat.push(`${n - h.terisi} item NIHSS belum dinilai; total belum final.`);
    if ((h.terisi > 0 || mrsV) && !mrsOpsi) ingat.push('mRS belum dinilai (diperlukan untuk klaim).');
    if (mrsV && !h.terisi) ingat.push('NIHSS belum dinilai (diperlukan untuk klaim).');
    const peringatan = ingat.length
        ? `<div class="screen-only" style="margin-top:8px; padding:8px; background:#fff8e1; border-left:3px solid #f9a825; font-size:12px;">&#9998; ${ingat.join('<br>&#9998; ')}</div>`
        : '';

    const ringkas = `<div style="margin-top:8px; padding:8px; background:#f5f5f5; font-size:12px; line-height:1.5;">
        <strong>NIHSS ${p.judul}: ${h.total} &mdash; ${kategori} &nbsp;|&nbsp; mRS: ${mrsOpsi ? mrsOpsi[0] : '-'}</strong>
        <br><span style="font-size:11px; color:#555;">Keterangan: skor &lt;5 defisit neurologis ringan; 5–14 sedang; 15–24 berat; 25–42 sangat berat. UN (tidak dapat dinilai) tidak menambah skor. mRS tidak dijumlahkan ke NIHSS. Sumber: PNPK Tata Laksana Stroke, KMK HK.01.07/MENKES/304/2026; mRS: van Swieten dkk., Stroke 1988.</span></div>`;

    document.getElementById('calc-nihss-content').innerHTML = tabel + peringatan + ringkas;
}
