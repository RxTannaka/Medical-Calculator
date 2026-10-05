// GRACE Score (PERKI).

function calculateGRACE() {
    let total = 0;
    let detailsTable = `<table class="scoring-table"><thead><tr><th>Parameter</th><th style="width:50px">Skor</th></tr></thead><tbody>`;

    // Usia (PERKI: <40→0, 40-49→18, 50-59→36, 60-69→55, 70-79→73, ≥80→91)
    const tgl = getValue('tglLahir');
    if (tgl) {
        const dob = new Date(tgl);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
        let s = 0;
        if (age >= 80) s = 91;
        else if (age >= 70) s = 73;
        else if (age >= 60) s = 55;
        else if (age >= 50) s = 36;
        else if (age >= 40) s = 18;
        total += s;
        detailsTable += `<tr><td>Usia ${age} tahun</td><td>${s}</td></tr>`;
    }

    // Laju nadi (<70→0, 70-89→7, 90-109→13, 110-149→23, 150-199→36, ≥200→46)
    const hr = parseFloat(getValue('graceNadi'));
    if (!isNaN(hr)) {
        let s = 0;
        if (hr >= 200) s = 46;
        else if (hr >= 150) s = 36;
        else if (hr >= 110) s = 23;
        else if (hr >= 90) s = 13;
        else if (hr >= 70) s = 7;
        total += s;
        detailsTable += `<tr><td>Laju nadi ${hr} &times;/menit</td><td>${s}</td></tr>`;
    }

    // TD sistolik (<80→63, 80-99→58, 100-119→47, 120-139→37, 140-159→26, 160-199→11, ≥200→0)
    const sbp = parseFloat(getValue('graceTDsistolik'));
    if (!isNaN(sbp)) {
        let s = 0;
        if (sbp < 80) s = 63;
        else if (sbp < 100) s = 58;
        else if (sbp < 120) s = 47;
        else if (sbp < 140) s = 37;
        else if (sbp < 160) s = 26;
        else if (sbp < 200) s = 11;
        else s = 0;
        total += s;
        detailsTable += `<tr><td>TD sistolik ${sbp} mmHg</td><td>${s}</td></tr>`;
    }

    // Kreatinin (µmol/L: 0-34→2, 35-70→5, 71-105→8, 106-140→11, 141-176→14, 177-353→23, ≥354→31)
    const kreaRaw = parseFloat(getValue('graceKreatinin'));
    if (!isNaN(kreaRaw)) {
        const unit = getValue('graceKreatininUnit') || 'mgdl';
        const umol = (unit === 'mgdl') ? kreaRaw * 88.4 : kreaRaw;
        let s = 2;
        if (umol >= 354) s = 31;
        else if (umol >= 177) s = 23;
        else if (umol >= 141) s = 14;
        else if (umol >= 106) s = 11;
        else if (umol >= 71) s = 8;
        else if (umol >= 35) s = 5;
        else s = 2;
        total += s;
        const krLabel = (unit === 'mgdl') ? `${kreaRaw} mg/dL (≈ ${Math.round(umol)} µmol/L)` : `${kreaRaw} µmol/L`;
        detailsTable += `<tr><td>Kreatinin ${krLabel}</td><td>${s}</td></tr>`;
    }

    // Killip (I→0, II→21, III→43, IV→64)
    const killip = getValue('graceKillip');
    const killipScore = { I: 0, II: 21, III: 43, IV: 64 };
    if (killip && killip in killipScore && killipScore[killip] > 0) {
        total += killipScore[killip];
        detailsTable += `<tr><td>Killip kelas ${killip}</td><td>${killipScore[killip]}</td></tr>`;
    }

    // Henti jantung saat tiba di RS (+43), biomarka (+15), deviasi ST (+30)
    document.querySelectorAll('.grace-check').forEach(c => {
        if (c.checked) {
            const score = parseInt(c.dataset.score);
            total += score;
            detailsTable += `<tr><td>${c.parentElement.innerText.split(' (+')[0]}</td><td>${score}</td></tr>`;
        }
    });

    detailsTable += `<tr><td><strong>TOTAL</strong></td><td><strong>${total}</strong></td></tr></tbody></table>`;

    // Stratifikasi risiko kematian (PERKI Tabel 2.2)
    // Di RS: ≤108 rendah (<1%); 109-140 menengah (1-3%); >140 tinggi (>3%)
    let inHosp;
    if (total <= 108) inHosp = "Rendah (<1%)";
    else if (total <= 140) inHosp = "Menengah (1–3%)";
    else inHosp = "Tinggi (>3%)";

    // 6 bulan pascapulang: ≤88 rendah (<3%); 89-118 menengah (3-8%); >118 tinggi (>8%)
    let sixMo;
    if (total <= 88) sixMo = "Rendah (<3%)";
    else if (total <= 118) sixMo = "Menengah (3–8%)";
    else sixMo = "Tinggi (>8%)";

    setText('displayGraceScore', total);
    setText('displayGraceInHosp', inHosp);
    setText('displayGrace6mo', sixMo);

    const summary = `<div style="margin-top:8px; padding:8px; background:#f5f5f5; font-size:12px; line-height:1.5;">
        <strong>Stratifikasi risiko kematian (PERKI):</strong><br>
        Saat perawatan di RS: <strong>${inHosp}</strong><br>
        6 bulan setelah keluar RS: <strong>${sixMo}</strong></div>`;

    let note = '';
    if (total > 140) {
        note = `<div style="margin-top:8px; padding:8px; background:#ffebee; border-left:4px solid #c62828; font-size:12px; line-height:1.5;">
        <strong>Skor &gt;140: kriteria risiko tinggi.</strong> Direkomendasikan angiografi invasif selama rawat inap (rekomendasi kelas I), atau dipertimbangkan dalam waktu 24 jam (kelas IIa). <em>(PERKI, SKA-NEST)</em></div>`;
    }

    document.getElementById('calc-grace-content').innerHTML = detailsTable + summary + note;
}
