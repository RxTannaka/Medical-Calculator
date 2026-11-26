// APACHE II (Knaus dkk., Crit Care Med 1985): Acute Physiology Score + poin usia + poin penyakit kronis, total 0–71.
// Nilai fisiologis = nilai terburuk dalam 24 jam pertama di ICU. Usia otomatis dari Tgl Lahir.

// Ambang poin: daftar [batas bawah, poin] dari nilai tertinggi ke terendah; nilai di bawah batas terakhir memakai `sisa`
function apacheBand(v, ambang, sisa) {
    for (const [batas, poin] of ambang) if (v >= batas) return poin;
    return sisa;
}

const APACHE_PARAM = [
    { id: 'apSuhu', nama: 'Suhu rektal (°C)', poin: v => apacheBand(v, [[41, 4], [39, 3], [38.5, 1], [36, 0], [34, 1], [32, 2], [30, 3]], 4) },
    { id: 'apMAP', nama: 'Mean arterial pressure (mmHg)', poin: v => apacheBand(v, [[160, 4], [130, 3], [110, 2], [70, 0], [50, 2]], 4) },
    { id: 'apNadi', nama: 'Laju nadi (×/menit)', poin: v => apacheBand(v, [[180, 4], [140, 3], [110, 2], [70, 0], [55, 2], [40, 3]], 4) },
    { id: 'apNapas', nama: 'Laju napas (×/menit)', poin: v => apacheBand(v, [[50, 4], [35, 3], [25, 1], [12, 0], [10, 1], [6, 2]], 4) },
    { id: 'apOksigenasi', nama: 'Oksigenasi' },      // dihitung khusus (A-a gradient atau PaO2)
    { id: 'apAsamBasa', nama: 'pH arteri' },         // dihitung khusus (pH, atau HCO3 bila tanpa AGD)
    { id: 'apNa', nama: 'Natrium serum (mEq/L)', poin: v => apacheBand(v, [[180, 4], [160, 3], [155, 2], [150, 1], [130, 0], [120, 2], [111, 3]], 4) },
    { id: 'apK', nama: 'Kalium serum (mEq/L)', poin: v => apacheBand(v, [[7, 4], [6, 3], [5.5, 1], [3.5, 0], [3, 1], [2.5, 2]], 4) },
    { id: 'apKreat', nama: 'Kreatinin serum' },      // dihitung khusus (satuan, ×2 bila gagal ginjal akut)
    { id: 'apHct', nama: 'Hematokrit (%)', poin: v => apacheBand(v, [[60, 4], [50, 2], [46, 1], [30, 0], [20, 2]], 4) },
    { id: 'apLeuko', nama: 'Leukosit (×10³/mm³)', poin: v => apacheBand(v, [[40, 4], [20, 2], [15, 1], [3, 0], [1, 2]], 4) },
    { id: 'apGCS', nama: 'Glasgow Coma Scale' }      // 15 − GCS
];

// Perkiraan mortalitas rumah sakit menurut rentang skor (Knaus 1985): [batas atas, non-operatif, pasca-bedah]
const APACHE_MORTALITAS = [[4, '4%', '1%'], [9, '8%', '3%'], [14, '15%', '7%'], [19, '25%', '12%'],
                           [24, '40%', '30%'], [29, '55%', '35%'], [34, '73%', '73%'], [Infinity, '85%', '88%']];

const apNum = id => { const v = parseFloat(getValue(id)); return isNaN(v) ? null : v; };

function calculateAPACHE() {
    const baris = [];      // [parameter, nilai, poin]
    const kurang = [];
    let aps = 0;
    const tambah = (nama, nilai, poin) => { baris.push([nama, nilai, poin]); aps += poin; };

    // MAP dari TD sistolik/diastolik
    const sbp = apNum('apTDs'), dbp = apNum('apTDd');
    const map = (sbp !== null && dbp !== null) ? Math.round((sbp + 2 * dbp) / 3) : null;
    setText('displayApMAP', map === null ? '-' : map + ' mmHg');

    APACHE_PARAM.forEach(p => {
        if (p.id === 'apMAP') {
            if (map === null) { kurang.push('TD sistolik/diastolik'); return; }
            return tambah(p.nama, `${map} (TD ${sbp}/${dbp})`, p.poin(map));
        }
        if (p.id === 'apOksigenasi') {
            const fio2 = apNum('apFiO2'), pao2 = apNum('apPaO2'), paco2 = apNum('apPaCO2');
            if (fio2 === null || pao2 === null) { kurang.push('FiO₂ dan PaO₂'); setText('displayApAa', '-'); return; }
            if (fio2 >= 50) {
                if (paco2 === null) { kurang.push('PaCO₂ (untuk A-a gradient, FiO₂ ≥ 50%)'); setText('displayApAa', '-'); return; }
                // A-a gradient = FiO2 × (760 − 47) − PaCO2/0,8 − PaO2
                const aa = Math.round(fio2 / 100 * 713 - paco2 / 0.8 - pao2);
                setText('displayApAa', 'A-a gradient ' + aa + ' mmHg');
                return tambah('Oksigenasi: A-a gradient (FiO₂ ≥ 50%)', `${aa} mmHg (FiO₂ ${fio2}%)`, apacheBand(aa, [[500, 4], [350, 3], [200, 2]], 0));
            }
            setText('displayApAa', 'Dipakai PaO₂ (FiO₂ < 50%)');
            return tambah('Oksigenasi: PaO₂ (FiO₂ < 50%)', `${pao2} mmHg (FiO₂ ${fio2}%)`, pao2 > 70 ? 0 : apacheBand(pao2, [[61, 1], [55, 3]], 4));
        }
        if (p.id === 'apAsamBasa') {
            const ph = apNum('apPH'), hco3 = apNum('apHCO3');
            if (ph !== null) return tambah('pH arteri', ph, apacheBand(ph, [[7.7, 4], [7.6, 3], [7.5, 1], [7.33, 0], [7.25, 2], [7.15, 3]], 4));
            if (hco3 !== null) return tambah('HCO₃ serum (tanpa AGD)', hco3 + ' mEq/L', apacheBand(hco3, [[52, 4], [41, 3], [32, 1], [22, 0], [18, 2], [15, 3]], 4));
            kurang.push('pH arteri (atau HCO₃)'); return;
        }
        if (p.id === 'apKreat') {
            const raw = apNum('apKreat');
            if (raw === null) { kurang.push('Kreatinin'); return; }
            const mg = getValue('apKreatUnit') === 'umol' ? raw / 88.4 : raw;
            const ggA = getValue('apGGA') === 'ya';
            const dasar = apacheBand(mg, [[3.5, 4], [2, 3], [1.5, 2], [0.6, 0]], 2);
            const label = getValue('apKreatUnit') === 'umol' ? `${raw} µmol/L (≈ ${mg.toFixed(2)} mg/dL)` : `${raw} mg/dL`;
            return tambah('Kreatinin serum' + (ggA ? ' (gagal ginjal akut: poin ×2)' : ''), label, ggA ? dasar * 2 : dasar);
        }
        if (p.id === 'apGCS') {
            const gcs = apNum('apGCS');
            if (gcs === null) { kurang.push('GCS'); return; }
            const g = Math.min(15, Math.max(3, Math.round(gcs)));
            return tambah('Glasgow Coma Scale (15 − GCS)', g, 15 - g);
        }
        const v = apNum(p.id);
        if (v === null) { kurang.push(p.nama.replace(/ \(.*\)$/, '')); return; }
        tambah(p.nama, v, p.poin(v));
    });

    // Poin usia
    let poinUsia = 0, teksUsia = '-';
    const tgl = getValue('tglLahir');
    if (tgl) {
        const dob = new Date(tgl), today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
        poinUsia = apacheBand(age, [[75, 6], [65, 5], [55, 3], [45, 2]], 0);
        teksUsia = age + ' tahun';
    } else kurang.push('Tgl Lahir (poin usia)');

    // Poin penyakit kronis
    const kronis = getValue('apKronis') === 'ya';
    const operasi = getValue('apOperasi') || 'nonop';
    const poinKronis = kronis ? (operasi === 'elektif' ? 2 : 5) : 0;
    const labelOperasi = { nonop: 'Non-operatif', darurat: 'Pasca-bedah darurat', elektif: 'Pasca-bedah elektif' }[operasi];

    const total = aps + poinUsia + poinKronis;
    const pascaBedah = operasi !== 'nonop';
    const baris_m = APACHE_MORTALITAS.find(([atas]) => total <= atas);
    // Belum ada parameter fisiologis: jangan tampilkan perkiraan dari poin usia saja
    const mort = !baris.length ? '-' : (pascaBedah ? baris_m[2] : baris_m[1]);

    setText('displayApacheScore', total);
    setText('displayApacheMort', mort === '-' ? '-' : `${mort} (${pascaBedah ? 'pasca-bedah' : 'non-operatif'})`);
    setText('displayApacheIsi', `${12 - kurang.filter(k => !k.startsWith('Tgl')).length}/12 parameter fisiologis`);

    let tabel = `<table class="scoring-table"><thead><tr><th>Parameter (nilai terburuk 24 jam pertama)</th><th>Nilai</th><th style="width:45px">Poin</th></tr></thead><tbody>`;
    baris.forEach(([n, v, p]) => { tabel += `<tr><td>${n}</td><td>${v}</td><td>${p}</td></tr>`; });
    tabel += `<tr><td colspan="2"><strong>Acute Physiology Score (APS)</strong></td><td><strong>${aps}</strong></td></tr>
        <tr><td>Poin usia</td><td>${teksUsia}</td><td>${poinUsia}</td></tr>
        <tr><td>Poin penyakit kronis</td><td>${kronis ? 'Insufisiensi organ berat / imunokompromais' : 'Tidak ada'}; ${labelOperasi}</td><td>${poinKronis}</td></tr>
        <tr><td colspan="2"><strong>TOTAL APACHE II</strong></td><td><strong>${total}</strong></td></tr></tbody></table>`;

    const ingat = kurang.length
        ? `<div class="screen-only" style="margin-top:8px; padding:8px; background:#fff8e1; border-left:3px solid #f9a825; font-size:12px;">&#9998; Belum diisi (dihitung 0 poin): ${kurang.join(', ')}.</div>`
        : '';
    const ringkas = `<div style="margin-top:8px; padding:8px; background:#f5f5f5; font-size:12px; line-height:1.5;">
        <strong>APACHE II: ${total} &nbsp;|&nbsp; Perkiraan mortalitas rumah sakit: ${mort} (${pascaBedah ? 'pasca-bedah' : 'non-operatif'})</strong>
        <span class="screen-only" style="display:block; font-size:11px; color:#555;">Perkiraan mortalitas dari rentang skor (Knaus dkk., Crit Care Med 1985), tanpa bobot kategori diagnosis.
        Penyakit kronis: sirosis dengan hipertensi portal/riwayat perdarahan varises/ensefalopati, gagal jantung NYHA IV, penyakit paru kronis berat (hipoksia/hiperkapnia kronis, polisitemia sekunder, hipertensi pulmonal berat, ketergantungan ventilator), dialisis kronis, atau imunokompromais.</span></div>`;

    document.getElementById('calc-apache-content').innerHTML = tabel + ingat + ringkas;
}
