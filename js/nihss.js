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

// Dua penilaian: saat masuk dan saat keluar RS. ID item = prefix + nomor item
// (masuk memakai ID lama 'nihss1a' dst. agar data tersimpan tetap terbaca).
const NIHSS_PENILAIAN = [
    { key: 'masuk', label: 'Masuk RS', pref: 'nihss', tgl: 'nihssTglMasuk' },
    { key: 'keluar', label: 'Keluar RS', pref: 'nihssK', tgl: 'nihssTglKeluar' }
];

// Isian dibuat di sini (berkas dimuat di akhir <body>, sebelum DOMContentLoaded),
// sehingga common.js bisa memasang listener dan memulihkan nilai seperti isian lain.
(function renderNIHSSInputs() {
    const box = document.getElementById('nihss-items');
    if (!box) return;
    const sel = (id, item) => `<select id="${id}">
                <option value="">&mdash; pilih &mdash;</option>
                ${nihssOpsi(item).map(([v, t]) => `<option value="${v}">${v === 'UN' ? '' : v + ' = '}${t.replace(/<[^>]+>/g, '')}</option>`).join('')}
            </select>`;
    box.innerHTML = `
        <div class="nihss-row nihss-head"><span>Parameter yang dinilai</span>
            ${NIHSS_PENILAIAN.map(p => `<span>${p.label}<br><input type="date" id="${p.tgl}" title="Tanggal penilaian ${p.label}"></span>`).join('')}
        </div>` + NIHSS_ITEMS.map(item => `
        <div class="nihss-row"><label>${item.no}. ${item.nama}</label>
            ${NIHSS_PENILAIAN.map(p => sel(p.pref + item.no, item)).join('')}
        </div>`).join('');
})();

// Hitung satu penilaian
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
    const hasil = NIHSS_PENILAIAN.map(p => Object.assign({ p, tgl: formatDateIndo(getValue(p.tgl)) }, nihssHitung(p.pref)));
    const [masuk, keluar] = hasil;
    const tampil = hasil.filter(h => h.terisi > 0);
    const kolom = tampil.length ? tampil : [masuk];

    // Kotak hasil
    hasil.forEach(h => {
        setText(`displayNihss${h.p.key === 'masuk' ? 'Masuk' : 'Keluar'}`, h.terisi ? `${h.total} — ${nihssKategori(h)}` : '-');
    });
    const beda = (masuk.terisi && keluar.terisi) ? keluar.total - masuk.total : null;
    setText('displayNihssPerubahan', beda === null ? '-' : (beda > 0 ? '+' : beda < 0 ? '−' : '') + Math.abs(beda));

    // Tabel rincian (kolom keluar hanya bila sudah diisi)
    let tabel = `<table class="scoring-table"><thead><tr><th style="width:28px" rowspan="2">No</th><th rowspan="2">Parameter yang dinilai</th>
        ${kolom.map(h => `<th colspan="2">${h.p.label}${h.tgl !== '-' ? ` (${h.tgl})` : ''}</th>`).join('')}</tr>
        <tr>${kolom.map(() => `<th>Skala</th><th style="width:40px">Skor</th>`).join('')}</tr></thead><tbody>`;
    NIHSS_ITEMS.forEach((item, k) => {
        tabel += `<tr><td>${item.no}</td><td>${item.nama}</td>${kolom.map(h => `<td>${h.baris[k].temuan}</td><td>${h.baris[k].skor}</td>`).join('')}</tr>`;
    });
    tabel += `<tr><td colspan="2"><strong>TOTAL NIHSS</strong></td>${kolom.map(h => `<td>${nihssKategori(h)}</td><td><strong>${h.total}</strong></td>`).join('')}</tr></tbody></table>`;

    const ingat = hasil.filter(h => h.terisi > 0 && h.terisi < n)
        .map(h => `${h.p.label}: ${n - h.terisi} item belum dinilai; total belum final.`);
    const peringatan = ingat.length
        ? `<div class="screen-only" style="margin-top:8px; padding:8px; background:#fff8e1; border-left:3px solid #f9a825; font-size:12px;">&#9998; ${ingat.join('<br>&#9998; ')}</div>`
        : '';

    const ringkas = `<div style="margin-top:8px; padding:8px; background:#f5f5f5; font-size:12px; line-height:1.5;">
        ${hasil.map(h => `<strong>${h.p.label}:</strong> ${h.terisi ? `NIHSS ${h.total} &mdash; ${nihssKategori(h)}` : 'belum dinilai'}`).join(' &nbsp;|&nbsp; ')}
        ${beda !== null ? `<br><strong>Perubahan (keluar &minus; masuk): ${beda > 0 ? '+' : beda < 0 ? '&minus;' : ''}${Math.abs(beda)}</strong>` : ''}
        <br><span style="font-size:11px; color:#555;">Keterangan: skor &lt;5 defisit neurologis ringan; 5–14 sedang; 15–24 berat; 25–42 sangat berat. UN (tidak dapat dinilai) tidak menambah skor. Sumber: PNPK Tata Laksana Stroke, KMK HK.01.07/MENKES/304/2026.</span></div>`;

    document.getElementById('calc-nihss-content').innerHTML = tabel + peringatan + ringkas;
}
