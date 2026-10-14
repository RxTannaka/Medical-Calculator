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

// Isian dibuat di sini (berkas dimuat di akhir <body>, sebelum DOMContentLoaded),
// sehingga common.js bisa memasang listener dan memulihkan nilai seperti isian lain.
(function renderNIHSSInputs() {
    const box = document.getElementById('nihss-items');
    if (!box) return;
    box.innerHTML = NIHSS_ITEMS.map(item => `
        <div class="form-group nihss-item"><label>${item.no}. ${item.nama}:</label>
            <select id="${item.id}">
                <option value="">&mdash; pilih &mdash;</option>
                ${nihssOpsi(item).map(([v, t]) => `<option value="${v}">${v === 'UN' ? '' : v + ' = '}${t}</option>`).join('')}
            </select>
        </div>`).join('');
})();

function calculateNIHSS() {
    let total = 0, terisi = 0;
    let detailsTable = `<table class="scoring-table"><thead><tr><th style="width:30px">No</th><th>Item</th><th>Finding</th><th style="width:50px">Skor</th></tr></thead><tbody>`;

    NIHSS_ITEMS.forEach(item => {
        const v = getValue(item.id);
        let temuan = '<em>belum dinilai</em>', skor = '-';
        if (v !== undefined && v !== '') {
            terisi++;
            const opsi = nihssOpsi(item).find(([x]) => String(x) === v);
            temuan = opsi ? opsi[1] : v;
            skor = v === 'UN' ? 'UN' : parseInt(v);
            if (v !== 'UN') total += parseInt(v);
        }
        detailsTable += `<tr><td>${item.no}</td><td>${item.nama}</td><td>${temuan}</td><td>${skor}</td></tr>`;
    });
    detailsTable += `<tr><td colspan="3"><strong>TOTAL NIHSS</strong></td><td><strong>${total}</strong></td></tr></tbody></table>`;

    // Kategori keparahan: 0 / 1–4 / 5–15 / 16–20 / 21–42
    let kategori = '-';
    if (terisi > 0) {
        if (total === 0) kategori = 'No stroke symptoms';
        else if (total <= 4) kategori = 'Minor stroke';
        else if (total <= 15) kategori = 'Moderate stroke';
        else if (total <= 20) kategori = 'Moderate to severe stroke';
        else kategori = 'Severe stroke';
    }

    setText('displayNihssScore', total);
    setText('displayNihssKategori', kategori);
    setText('displayNihssTerisi', `${terisi}/${NIHSS_ITEMS.length} item dinilai`);

    const kurang = NIHSS_ITEMS.length - terisi;
    const peringatan = (terisi > 0 && kurang > 0)
        ? `<div class="screen-only" style="margin-top:8px; padding:8px; background:#fff8e1; border-left:3px solid #f9a825; font-size:12px;">&#9998; ${kurang} item belum dinilai; total belum final.</div>`
        : '';
    const ringkas = `<div style="margin-top:8px; padding:8px; background:#f5f5f5; font-size:12px; line-height:1.5;">
        <strong>NIHSS: ${total}</strong> &nbsp;&mdash;&nbsp; <strong>${kategori}</strong>
        <br><span style="font-size:11px; color:#555;">Kategori: 0 no stroke symptoms; 1–4 minor; 5–15 moderate; 16–20 moderate to severe; 21–42 severe. Item UN (<em>untestable</em>) tidak menambah skor.</span></div>`;

    document.getElementById('calc-nihss-content').innerHTML = detailsTable + peringatan + ringkas;
}
