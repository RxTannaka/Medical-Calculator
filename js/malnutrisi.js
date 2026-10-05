// Tatalaksana Malnutrisi: target nutrisi, enteral, Tabel 7 checklist, BB ideal.

function calculateMalnutrisi() {
    const bb = parseFloat(getValue('bb'));
    const tb = parseFloat(getValue('tb'));
    const faktorKalori = parseFloat(getValue('faktorStres')) || 30;
    const faktorProt = parseFloat(getValue('faktorProtein')) || 1.2;
    const pctLemak = parseFloat(getValue('persenLemak')) || 25;
    const densitas = parseFloat(getValue('densitasFormula')) || 1.0;
    const frek = parseInt(getValue('frekEnteral')) || 4;
    const pctEnteral = parseFloat(getValue('pctEnteral')) || 100;

    // BMI (always uses actual BB)
    let bmiText = '-';
    if (bb && tb) {
        const tbM = tb / 100;
        const bmi = bb / (tbM * tbM);
        bmiText = bmi.toFixed(1);
    }
    setText('hBMI', bmiText);

    // Print page 1 antropometri
    setText('displayBBTB', (bb ? bb + ' kg' : '-') + ' / ' + (tb ? tb + ' cm' : '-'));
    setText('displayBMIPrint', bmiText === '-' ? '-' : bmiText + ' kg/m²');

    // IBW
    const ibw = calculateIBW();
    setText('hIBW', ibw ? ibw + ' kg' : '-');
    const ibwDisp = document.getElementById('ibwDisplay');
    if (ibwDisp) {
        const formula = getValue('ibwFormula') || 'none';
        const tb = parseFloat(getValue('tb'));
        if (ibw) {
            let warn = '';
            if (tb && tb < 152 && (formula === 'hamwi' || formula === 'devine')) {
                warn = ' ⚠ TB <152cm, formula kurang akurat';
            }
            ibwDisp.textContent = `BB Ideal: ${ibw} kg${warn}`;
            ibwDisp.style.color = warn ? '#e65100' : '#1565C0';
        } else {
            ibwDisp.textContent = '';
        }
    }
    const weightForCalc = ibw || bb;
    const formulaNames = { hamwi: 'Hamwi', devine: 'Devine', broca: 'Broca' };
    const fml = getValue('ibwFormula') || 'none';
    setText('displayIBWPrint', ibw ? `${ibw} kg (${formulaNames[fml]})` : '-');
    setText('hFaktorKalori', bb ? faktorKalori : '-');

    if (!bb) {
        ['hTargetKkal','hTargetProtein','hTargetLemak','hTargetKarbo',
         'eVolTotal','eVolPerPemberian','eKecepatan',
         'displayTargetKkal','displayTargetProtein','hIBW'].forEach(id => setText(id, '-'));
        if (ibwDisp) ibwDisp.textContent = '';
        const basisEl = document.getElementById('displayBasisBB');
        if (basisEl) basisEl.textContent = '';
        return;
    }

    // Nutritional targets (use IBW if available)
    const targetKkal = Math.round(weightForCalc * faktorKalori);
    const targetProtein = Math.round(weightForCalc * faktorProt * 10) / 10;
    const targetLemakG = Math.round((targetKkal * (pctLemak / 100)) / 9 * 10) / 10;
    const kkalLemak = targetLemakG * 9;
    const kkalProtein = targetProtein * 4;
    const targetKarboG = Math.round(((targetKkal - kkalLemak - kkalProtein) / 4) * 10) / 10;

    setText('hTargetKkal', targetKkal);
    setText('hTargetProtein', targetProtein);
    setText('hTargetLemak', targetLemakG);
    setText('hTargetKarbo', Math.max(0, targetKarboG));
    setText('displayTargetKkal', targetKkal + ' kkal/hari');
    setText('displayTargetProtein', targetProtein + ' g/hari');

    // Show BB basis
    const basisEl = document.getElementById('displayBasisBB');
    if (basisEl) {
        basisEl.textContent = ibw ? `Basis: IBW ${ibw} kg (${formulaNames[fml]})` : 'Basis: BB Aktual';
    }

    // Auto-populate target summary for terapi field
    const ringkas = `Target: ${targetKkal} kkal/hari, Protein ${targetProtein} g/hari, Lemak ${targetLemakG} g/hari (${pctLemak}%)`;
    const printRingkasEl = document.getElementById('printTargetRingkas');
    if (printRingkasEl) printRingkasEl.textContent = ringkas;

    // Enteral calculation
    const kkalEnteral = targetKkal * (pctEnteral / 100);
    const volTotalML = Math.round(kkalEnteral / densitas);
    setText('eVolTotal', volTotalML);

    if (frek === 0) {
        // Continuous
        const rate = Math.round(volTotalML / 24);
        setText('eVolPerPemberian', '—');
        setText('eKecepatan', rate + ' mL/jam (kontinyu)');
    } else {
        const volPerPemberian = Math.round(volTotalML / frek);
        const rate = Math.round(volTotalML / 24 * 10) / 10;
        setText('eVolPerPemberian', volPerPemberian);
        setText('eKecepatan', rate);
    }

    // Monev checkboxes → print
    const monevChecked = Array.from(document.querySelectorAll('.monev-check:checked')).map(c => c.value);
    const monevDetail = document.getElementById('monevDetail')?.value || '';
    const printMonevEl = document.getElementById('printMonev');
    if (printMonevEl) {
        const monevItems = [...monevChecked, monevDetail].filter(Boolean);
        printMonevEl.textContent = monevItems.join(', ');
    }

    // Diagnosis driven by checklist checkboxes
    updateChecklistKesimpulan();
}

function autofillEnteral() {
    const bb = parseFloat(getValue('bb'));
    if (!bb) { alert('Masukkan Berat Badan terlebih dahulu.'); return; }

    const ibw = calculateIBW();
    const weightForCalc = ibw || bb;
    const faktorKalori = parseFloat(getValue('faktorStres')) || 30;
    const faktorProt = parseFloat(getValue('faktorProtein')) || 1.2;
    const pctLemak = parseFloat(getValue('persenLemak')) || 25;
    const densitas = parseFloat(getValue('densitasFormula')) || 1.0;
    const frek = parseInt(getValue('frekEnteral')) || 4;
    const pctEnteral = parseFloat(getValue('pctEnteral')) || 100;

    const targetKkal = Math.round(weightForCalc * faktorKalori);
    const targetProtein = Math.round(weightForCalc * faktorProt * 10) / 10;
    const targetLemakG = Math.round((targetKkal * (pctLemak / 100)) / 9 * 10) / 10;
    const kkalEnteral = targetKkal * (pctEnteral / 100);
    const volTotal = Math.round(kkalEnteral / densitas);

    const densitasLabel = densitas === 1.0 ? 'Standard (1.0 kkal/mL)' : `High-Cal (${densitas} kkal/mL)`;
    let frekLabel, volPerPemberian, rateLabel;

    if (frek === 0) {
        frekLabel = 'kontinyu 24 jam';
        volPerPemberian = null;
        const rate = Math.round(volTotal / 24);
        rateLabel = `${rate} mL/jam`;
    } else {
        frekLabel = `${frek}× sehari`;
        volPerPemberian = Math.round(volTotal / frek);
        const rate = Math.round(volTotal / 24 * 10) / 10;
        rateLabel = `${rate} mL/jam`;
    }

    const pctLabel = pctEnteral < 100 ? ` (${pctEnteral}% dari target)` : '';
    let teks = `Nutrisi enteral${pctLabel}: target ${Math.round(kkalEnteral)} kkal/hari, ${targetProtein} g protein.\n`;
    teks += `Formula: ${densitasLabel}, volume total ${volTotal} mL/hari.\n`;
    if (volPerPemberian) {
        teks += `Pemberian: ${frekLabel} × ${volPerPemberian} mL/pemberian via NGT/sonde.\n`;
    } else {
        teks += `Pemberian: ${frekLabel} (${rateLabel}).\n`;
    }

    const ta = document.getElementById('terapiEnteral');
    if (ta) {
        ta.value = teks.trim();
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
    }

    // Also fill summary in terapi medik gizi if empty
    const taMedik = document.getElementById('terapiMedikGizi');
    if (taMedik && !taMedik.value) {
        taMedik.value = `Target: ${targetKkal} kkal/hari, Protein ${targetProtein} g/hari, Lemak ${targetLemakG} g/hari (${pctLemak}%).`;
        taMedik.style.height = 'auto';
        taMedik.style.height = taMedik.scrollHeight + 'px';
    }
}

// ─── MODAL SKRINING GIZI ──────────────────────────────────────────────
const TABEL7_DATA = {
    akut: {
        label: 'Penyakit Akut / Cedera',
        sedang: [
            ['Asupan Energi', '<75% kebutuhan selama >7 hari'],
            ['Penurunan BB', '1–2%/1 minggu; 5%/1 bulan; 7.5%/3 bulan'],
            ['Kehilangan Lemak', 'Ringan (mild)'],
            ['Kehilangan Otot', 'Ringan (mild)'],
            ['Akumulasi Cairan', 'Edema ringan (mild)'],
            ['Status Fungsional', 'Kekuatan genggaman menurun (ringan)'],
        ],
        berat: [
            ['Asupan Energi', '≤50% kebutuhan selama ≥5 hari'],
            ['Penurunan BB', '>2%/1 minggu; >5%/1 bulan; >7.5%/3 bulan'],
            ['Kehilangan Lemak', 'Sedang / Berat'],
            ['Kehilangan Otot', 'Sedang / Berat'],
            ['Akumulasi Cairan', 'Edema Sedang / Berat'],
            ['Status Fungsional', 'Kekuatan genggaman menurun (berat)'],
        ]
    },
    kronik: {
        label: 'Penyakit Kronik',
        sedang: [
            ['Asupan Energi', '<75% kebutuhan selama ≥1 bulan'],
            ['Penurunan BB', '5%/1 bulan<br>7.5%/3 bulan<br>10%/6 bulan<br>20%/1 tahun'],
            ['Kehilangan Lemak', 'Ringan (mild)'],
            ['Kehilangan Otot', 'Ringan (mild)'],
            ['Akumulasi Cairan', 'Edema ringan'],
            ['Status Fungsional', 'Kekuatan genggaman menurun (ringan)'],
        ],
        berat: [
            ['Asupan Energi', '≤75% kebutuhan selama ≥1 bulan'],
            ['Penurunan BB', '>5%/1 bulan<br>>7.5%/3 bulan<br>>10%/6 bulan<br>>20%/1 tahun'],
            ['Kehilangan Lemak', 'Sedang / Berat'],
            ['Kehilangan Otot', 'Berat (severe)'],
            ['Akumulasi Cairan', 'Edema berat'],
            ['Status Fungsional', 'Kekuatan genggaman menurun (berat)'],
        ]
    },
    sosial: {
        label: 'Sosial / Lingkungan',
        sedang: [
            ['Asupan Energi', '<75% kebutuhan selama ≥3 bulan'],
            ['Penurunan BB', '5%/1 bulan<br>7.5%/3 bulan<br>10%/6 bulan<br>20%/1 tahun'],
            ['Kehilangan Lemak', 'Ringan (mild)'],
            ['Kehilangan Otot', 'Ringan (mild)'],
            ['Akumulasi Cairan', 'Edema ringan'],
            ['Status Fungsional', 'Kekuatan genggaman menurun (ringan)'],
        ],
        berat: [
            ['Asupan Energi', '≤50% kebutuhan selama >7 hari'],
            ['Penurunan BB', '>5%/1 bulan<br>>7.5%/3 bulan<br>>10%/6 bulan<br>>20%/1 tahun'],
            ['Kehilangan Lemak', 'Berat (severe)'],
            ['Kehilangan Otot', 'Berat (severe)'],
            ['Akumulasi Cairan', 'Edema berat / anasarka'],
            ['Status Fungsional', 'Kekuatan genggaman menurun (berat)'],
        ]
    }
};

// ─── TABEL 7 CHECKLIST ──────────────────────────────────────────────
function renderTabel7Checklist() {
    const container = document.getElementById('tabel7-checklist-body');
    if (!container) return;
    const criteria = ['Analisis Asupan (Intake)', 'Penurunan Berat Badan', 'Fat Loss', 'Muscle Wasting', 'Akumulasi Cairan (edema)', 'Status Fungsional'];
    const etios = ['akut', 'kronik', 'sosial'];
    let html = '';
    criteria.forEach((crit, i) => {
        html += '<tr>';
        html += `<td class="col-kriteria">${crit}</td>`;
        etios.forEach(etio => {
            const data = TABEL7_DATA[etio];
            ['sedang', 'berat'].forEach(sev => {
                const cellData = data[sev][i];
                const cls = sev === 'sedang' ? 't7c-sedang' : 't7c-berat';
                html += `<td class="t7c-cell ${cls}"><label><input type="checkbox" class="t7-check" data-row="${i}" data-etio="${etio}" data-sev="${sev}"> ${cellData[1]}</label></td>`;
            });
        });
        html += '</tr>';
    });
    container.innerHTML = html;
}

function updateChecklistKesimpulan() {
    const checks = document.querySelectorAll('.t7-check:checked');
    let sedangCount = 0, beratCount = 0;
    checks.forEach(cb => {
        if (cb.dataset.sev === 'sedang') sedangCount++;
        if (cb.dataset.sev === 'berat') beratCount++;
    });
    const total = sedangCount + beratCount;
    let diagnosis = '—';
    let color = '#999';
    if (total >= 2 && beratCount >= 2) {
        diagnosis = 'MALNUTRISI BERAT';
        color = '#b71c1c';
    } else if (total >= 2) {
        diagnosis = 'MALNUTRISI SEDANG';
        color = '#e65100';
    }

    // Update checklist kesimpulan
    const el = document.getElementById('checklist-kesimpulan-text');
    if (el) { el.textContent = diagnosis; el.style.color = color; }

    // Propagate to form tatalaksana row 1 (skrining gizi)
    setText('printSkrining', diagnosis);
    // Propagate to output box & kesimpulan
    setText('displayDiagnosis', diagnosis === '—' ? '-' : diagnosis);
    const displayKes = document.getElementById('displayKesimpulan');
    if (displayKes) { displayKes.textContent = diagnosis; displayKes.style.color = color; }
}

// ─── IDEAL BODY WEIGHT ──────────────────────────────────────────────
function calculateIBW() {
    const tb = parseFloat(getValue('tb'));
    const jk = getValue('jk');
    const formula = getValue('ibwFormula') || 'none';
    if (!tb || formula === 'none') return null;
    const tbInch = tb / 2.54;
    let ibw;
    switch (formula) {
        case 'hamwi':
            ibw = jk === 'L' ? 48 + 2.7 * (tbInch - 60) : 45.5 + 2.2 * (tbInch - 60);
            break;
        case 'devine':
            ibw = jk === 'L' ? 50 + 2.3 * (tbInch - 60) : 45.5 + 2.3 * (tbInch - 60);
            break;
        case 'broca':
            ibw = jk === 'L' ? (tb - 100) * 0.9 : (tb - 100) * 0.85;
            break;
        default: return null;
    }
    return Math.max(Math.round(ibw * 10) / 10, 30);
}
// ─────────────────────────────────────────────────────────────────────
