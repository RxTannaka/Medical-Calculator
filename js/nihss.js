// NIHSS (National Institutes of Health Stroke Scale): 15 item, total 0–42.

// value 'UN' = untestable (amputasi/fusi sendi, intubasi): tidak menambah skor
const NIHSS_ITEMS = [
    { id: 'nihss1a', no: '1a', nama: 'Level of consciousness', opsi: [
        [0, 'Alert, keenly responsive'],
        [1, 'Not alert, arousable by minor stimulation'],
        [2, 'Not alert, requires repeated or painful stimulation'],
        [3, 'Reflex responses only or totally unresponsive']] },
    { id: 'nihss1b', no: '1b', nama: 'LOC questions (month, age)', opsi: [
        [0, 'Answers both correctly'], [1, 'Answers one correctly'], [2, 'Answers neither correctly']] },
    { id: 'nihss1c', no: '1c', nama: 'LOC commands (open/close eyes, grip/release hand)', opsi: [
        [0, 'Performs both tasks correctly'], [1, 'Performs one task correctly'], [2, 'Performs neither task correctly']] },
    { id: 'nihss2', no: '2', nama: 'Best gaze', opsi: [
        [0, 'Normal'], [1, 'Partial gaze palsy'], [2, 'Forced deviation or total gaze paresis']] },
    { id: 'nihss3', no: '3', nama: 'Visual fields', opsi: [
        [0, 'No visual loss'], [1, 'Partial hemianopia'], [2, 'Complete hemianopia'], [3, 'Bilateral hemianopia (incl. cortical blindness)']] },
    { id: 'nihss4', no: '4', nama: 'Facial palsy', opsi: [
        [0, 'Normal symmetrical movements'], [1, 'Minor paralysis'], [2, 'Partial paralysis (lower face)'], [3, 'Complete paralysis (upper and lower face)']] },
    { id: 'nihss5a', no: '5a', nama: 'Motor arm – left', opsi: 'lengan' },
    { id: 'nihss5b', no: '5b', nama: 'Motor arm – right', opsi: 'lengan' },
    { id: 'nihss6a', no: '6a', nama: 'Motor leg – left', opsi: 'tungkai' },
    { id: 'nihss6b', no: '6b', nama: 'Motor leg – right', opsi: 'tungkai' },
    { id: 'nihss7', no: '7', nama: 'Limb ataxia', opsi: [
        [0, 'Absent'], [1, 'Present in one limb'], [2, 'Present in two limbs'], ['UN', 'UN – amputation or joint fusion']] },
    { id: 'nihss8', no: '8', nama: 'Sensory', opsi: [
        [0, 'Normal, no sensory loss'], [1, 'Mild-to-moderate sensory loss'], [2, 'Severe to total sensory loss']] },
    { id: 'nihss9', no: '9', nama: 'Best language', opsi: [
        [0, 'No aphasia'], [1, 'Mild-to-moderate aphasia'], [2, 'Severe aphasia'], [3, 'Mute, global aphasia']] },
    { id: 'nihss10', no: '10', nama: 'Dysarthria', opsi: [
        [0, 'Normal'], [1, 'Mild-to-moderate dysarthria'], [2, 'Severe dysarthria'], ['UN', 'UN – intubated or other physical barrier']] },
    { id: 'nihss11', no: '11', nama: 'Extinction and inattention (neglect)', opsi: [
        [0, 'No abnormality'], [1, 'Inattention or extinction in one sensory modality'], [2, 'Profound hemi-inattention or extinction to more than one modality']] }
];

const NIHSS_MOTOR = {
    lengan: [[0, 'No drift for 10 seconds'], [1, 'Drift before 10 seconds'], [2, 'Some effort against gravity'],
             [3, 'No effort against gravity, limb falls'], [4, 'No movement'], ['UN', 'UN – amputation or joint fusion']],
    tungkai: [[0, 'No drift for 5 seconds'], [1, 'Drift before 5 seconds'], [2, 'Some effort against gravity'],
              [3, 'No effort against gravity, limb falls'], [4, 'No movement'], ['UN', 'UN – amputation or joint fusion']]
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
                ${nihssOpsi(item).map(([v, t]) => `<option value="${v}">${v === 'UN' ? '' : v + ' = '}${t}</option>`).join('')}
            </select>`;
    box.innerHTML = `
        <div class="nihss-row nihss-head"><span>Item</span>
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

// Kategori keparahan: 0 / 1–4 / 5–15 / 16–20 / 21–42
function nihssKategori(h) {
    if (!h.terisi) return '-';
    if (h.total === 0) return 'No stroke symptoms';
    if (h.total <= 4) return 'Minor stroke';
    if (h.total <= 15) return 'Moderate stroke';
    if (h.total <= 20) return 'Moderate to severe stroke';
    return 'Severe stroke';
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
    let tabel = `<table class="scoring-table"><thead><tr><th style="width:28px" rowspan="2">No</th><th rowspan="2">Item</th>
        ${kolom.map(h => `<th colspan="2">${h.p.label}${h.tgl !== '-' ? ` (${h.tgl})` : ''}</th>`).join('')}</tr>
        <tr>${kolom.map(() => `<th>Finding</th><th style="width:40px">Skor</th>`).join('')}</tr></thead><tbody>`;
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
        <br><span style="font-size:11px; color:#555;">Kategori: 0 no stroke symptoms; 1–4 minor; 5–15 moderate; 16–20 moderate to severe; 21–42 severe. Item UN (<em>untestable</em>) tidak menambah skor.</span></div>`;

    document.getElementById('calc-nihss-content').innerHTML = tabel + peringatan + ringkas;
}
