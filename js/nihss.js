// NIHSS (National Institutes of Health Stroke Scale): 15 item, total 0–42.

// value 'UN' = untestable (amputasi/fusi sendi, intubasi): tidak menambah skor
// Teks item dan skala mengikuti Tabel 3 PNPK Tata Laksana Stroke (KMK HK.01.07/MENKES/304/2026).
// Item 6: penomoran skala di tabel PNPK bergeser satu baris; dipakai urutan baku NIHSS (sama dengan item 5).
const NIHSS_ITEMS = [
    { id: 'nihss1a', no: '1a', nama: 'Tingkat kesadaran', opsi: [
        [0, 'Sadar penuh'], [1, 'Somnolen'], [2, 'Stupor'], [3, 'Koma']] },
    { id: 'nihss1b', no: '1b', nama: 'Menjawab pertanyaan (bulan dan usia pasien)', opsi: [
        [0, 'Benar semua (2 pertanyaan)'], [1, '1 benar / ETT / disartria'], [2, 'Salah semua / afasia / stupor / koma']] },
    { id: 'nihss1c', no: '1c', nama: 'Mengikuti perintah (membuka-menutup mata, menggenggam-melepas tangan)', opsi: [
        [0, 'Mampu melakukan 2 perintah'], [1, 'Mampu melakukan 1 perintah'], [2, 'Tidak mampu melakukan perintah']] },
    { id: 'nihss2', no: '2', nama: 'Gaze: gerakan mata konjugat horizontal', opsi: [
        [0, 'Normal'], [1, 'Abnormal pada 1 mata'], [2, 'Deviasi konjugat kuat atau paresis konjugat pada 2 mata']] },
    { id: 'nihss3', no: '3', nama: 'Visual: lapang pandang pada tes konfrontasi', opsi: [
        [0, 'Tidak ada gangguan'], [1, 'Kuadrianopsia'], [2, 'Hemianopia total'], [3, 'Hemianopia bilateral / buta kortikal']] },
    { id: 'nihss4', no: '4', nama: 'Paresis wajah', opsi: [
        [0, 'Normal'], [1, 'Paresis wajah ringan (lipatan nasolabial datar, senyum asimetris)'],
        [2, 'Paresis wajah parsial (paresis wajah bawah total atau hampir total)'], [3, 'Paresis wajah total (sesisi atau 2 sisi)']] },
    { id: 'nihss5a', no: '5a', nama: 'Motorik lengan kiri', opsi: 'lengan' },
    { id: 'nihss5b', no: '5b', nama: 'Motorik lengan kanan', opsi: 'lengan' },
    { id: 'nihss6a', no: '6a', nama: 'Motorik tungkai kiri', opsi: 'tungkai' },
    { id: 'nihss6b', no: '6b', nama: 'Motorik tungkai kanan', opsi: 'tungkai' },
    { id: 'nihss7', no: '7', nama: 'Ataksia anggota badan (tes jari-hidung)', opsi: [
        [0, 'Tidak ada ataksia'], [1, 'Ataksia pada satu ekstremitas'], [2, 'Ataksia pada dua atau lebih ekstremitas'],
        ['UN', 'UN – tidak dapat dinilai (amputasi/fusi sendi)']] },
    { id: 'nihss8', no: '8', nama: 'Sensorik', opsi: [
        [0, 'Normal'], [1, 'Gangguan sensori ringan hingga sedang (nyeri berkurang, masih merasa bila disentuh)'],
        [2, 'Gangguan sensori berat atau total']] },
    { id: 'nihss9', no: '9', nama: 'Kemampuan berbahasa', opsi: [
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

const nihssJenis = () => getValue('nihssJenis') === 'akhir' ? 'akhir' : 'awal';

// Isian dibuat di sini (berkas dimuat di akhir <body>, sebelum DOMContentLoaded),
// sehingga common.js bisa memasang listener dan memulihkan nilai seperti isian lain.
(function renderNIHSSInputs() {
    const box = document.getElementById('nihss-items');
    if (!box) return;
    const sel = (id, item, jenis) => `<select id="${id}" class="nihss-${jenis}">
                <option value="">&mdash; pilih &mdash;</option>
                ${nihssOpsi(item).map(([v, t]) => `<option value="${v}">${v === 'UN' ? '' : v + ' = '}${t.replace(/<[^>]+>/g, '')}</option>`).join('')}
            </select>`;
    box.innerHTML = `
        <div class="nihss-row nihss-head">
            <label>Jenis Assessment:
                <select id="nihssJenis">
                    <option value="awal">Assessment Awal</option>
                    <option value="akhir">Assessment Akhir (Discharge)</option>
                </select>
            </label>
            ${Object.entries(NIHSS_PENILAIAN).map(([k, p]) => `<label class="nihss-${k}">${p.tglLabel}:<input type="date" id="${p.tgl}"></label>`).join('')}
        </div>` + NIHSS_ITEMS.map(item => `
        <div class="nihss-row"><label>${item.no}. ${item.nama}</label>
            ${Object.entries(NIHSS_PENILAIAN).map(([k, p]) => sel(p.pref + item.no, item, k)).join('')}
        </div>`).join('');
})();

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

    const h = nihssHitung(p.pref);
    const tgl = formatDateIndo(getValue(p.tgl));
    const kategori = nihssKategori(h);

    setText('displayNihssJudul', p.judul);
    setText('displayNihssScore', h.total);
    setText('displayNihssKategori', kategori);
    setText('displayNihssTgl', `${p.tglLabel}: ${tgl}`);

    let tabel = `<div class="nihss-judul">NIHSS &ndash; ${p.judul} &nbsp;|&nbsp; ${p.tglLabel}: ${tgl}</div>
        <table class="scoring-table"><thead><tr><th style="width:28px">No</th><th>Parameter yang dinilai</th><th>Skala</th><th style="width:40px">Skor</th></tr></thead><tbody>`;
    NIHSS_ITEMS.forEach((item, k) => {
        tabel += `<tr><td>${item.no}</td><td>${item.nama}</td><td>${h.baris[k].temuan}</td><td>${h.baris[k].skor}</td></tr>`;
    });
    tabel += `<tr><td colspan="3"><strong>TOTAL NIHSS</strong></td><td><strong>${h.total}</strong></td></tr></tbody></table>`;

    const peringatan = (h.terisi > 0 && h.terisi < n)
        ? `<div class="screen-only" style="margin-top:8px; padding:8px; background:#fff8e1; border-left:3px solid #f9a825; font-size:12px;">&#9998; ${n - h.terisi} item belum dinilai; total belum final.</div>`
        : '';

    const ringkas = `<div style="margin-top:8px; padding:8px; background:#f5f5f5; font-size:12px; line-height:1.5;">
        <strong>NIHSS ${p.judul}: ${h.total} &mdash; ${kategori}</strong>
        <br><span style="font-size:11px; color:#555;">Keterangan: skor &lt;5 defisit neurologis ringan; 5–14 sedang; 15–24 berat; 25–42 sangat berat. UN (tidak dapat dinilai) tidak menambah skor. Sumber: PNPK Tata Laksana Stroke, KMK HK.01.07/MENKES/304/2026.</span></div>`;

    document.getElementById('calc-nihss-content').innerHTML = tabel + peringatan + ringkas;
}
