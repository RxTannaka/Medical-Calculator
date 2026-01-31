// 1. KONTROL MENU TAB
let currentMode = 'psi';

function showCalculator(mode) {
    currentMode = mode;
    document.body.className = 'mode-' + mode;
    
    const sections = ['psi', 'natrium', 'kalium'];
    sections.forEach(m => {
        const content = document.getElementById(`calc-${m}-content`);
        const output = document.getElementById(`${m}-output-box`);
        const btn = document.getElementById(`btn-${m}`);
        
        if (content) content.style.display = (m === mode) ? 'block' : 'none';
        if (output) output.style.display = (m === mode) ? 'block' : 'none';
        if (btn) btn.classList.toggle('active', m === mode);
    });

    updateStats();
}

// 2. PEMICU OTOMATIS (EVENT LISTENERS)
document.addEventListener('DOMContentLoaded', () => {
    // Daftar ID yang harus dipantau perubahannya
    const inputIds = [
        'nama', 'noMR', 'inputDPJP', 'tglAsesmen', 'tglLahir', 'jk', 'bb',
        'naSerum', 'naTarget', 'naKecepatan', 'naInfus', 
        'kSerum', 'kTarget', 'aksesVena'
    ];

    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const eventType = (el.tagName === 'SELECT' || el.type === 'date') ? 'change' : 'input';
            el.addEventListener(eventType, updateStats);
        }
    });

    // Pemicu untuk Checkbox PSI
    document.querySelectorAll('.psi-check').forEach(box => {
        box.addEventListener('change', updateStats);
    });
});

// 3. FUNGSI UTAMA UPDATE
function updateStats() {
    // Info Pasien Dasar
    setText('displayNama', getValue('nama') || '-');
    setText('displayNoMR', getValue('noMR') || '-');
    setText('displayDPJP', getValue('inputDPJP') || '');
    setText('displayTglAsesmen', getValue('tglAsesmen') || '-');
    
    // Hitung Umur
    const tgl = getValue('tglLahir');
    if (tgl) {
        const dob = new Date(tgl);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
        setText('displayTglLahir', tgl);
        setText('displayUmur', age + " Tahun");
        
        const jk = getValue('jk');
        const scoreUsia = (jk === 'P') ? Math.max(0, age - 10) : age;
        setText('scoreUsia', scoreUsia);
    }

    // Jalankan Kalkulator dengan Pengaman
    try { calculatePSI(); } catch(e) {}
    try { calculateNatrium(); } catch(e) {}
    try { calculateKalium(); } catch(e) {}
}

// 4. KALKULATOR PSI
function calculatePSI() {
    let total = parseInt(document.getElementById('scoreUsia')?.textContent) || 0;
    document.querySelectorAll('.psi-check').forEach(c => { 
        if(c.checked) total += parseInt(c.dataset.score); 
    });
    setText('totalScore', total);
    
    let kelas = "I", mort = "0.1%";
    if(total > 130) { kelas = "V"; mort = "29.2%"; }
    else if(total >= 91) { kelas = "IV"; mort = "8.2%"; }
    else if(total >= 71) { kelas = "III"; mort = "2.8%"; }
    else if(total > 0) { kelas = "II"; mort = "0.6%"; }
    
    setText('kelasRisiko', kelas);
    setText('mortalityRate', mort);
}

// 5. KALKULATOR NATRIUM
function calculateNatrium() {
    const bb = parseFloat(getValue('bb'));
    const naSerum = parseFloat(getValue('naSerum'));
    const naTarget = parseFloat(getValue('naTarget'));
    const naInfus = parseFloat(getValue('naInfus'));
    const kecMax = parseFloat(getValue('naKecepatan'));
    const jk = getValue('jk');
    const age = parseInt(document.getElementById('displayUmur')?.textContent) || 30;

    setText('displayNaAwal', isNaN(naSerum) ? "0" : naSerum);
    setText('displayNaTarget', isNaN(naTarget) ? "0" : naTarget);
    
    const container = document.getElementById('natrium-tables-container');
    if (!bb || isNaN(naSerum) || isNaN(naTarget) || isNaN(naInfus) || !container) return;

    const deltaTotal = naTarget - naSerum;
    setText('displayDeltaTotal', deltaTotal.toFixed(1));

    if (deltaTotal <= 0) {
        container.innerHTML = "<tr><td colspan='2' style='text-align:center; color:green;'>Target sudah tercapai.</td></tr>";
        return;
    }

    let factor = (age <= 18) ? 0.6 : (jk === 'L' ? (age > 65 ? 0.5 : 0.6) : (age > 65 ? 0.45 : 0.5));
    const tbw = bb * factor;
    const deltaPerLiter = (naInfus - naSerum) / (tbw + 1);

    const volHariIni = (Math.min(deltaTotal, kecMax) / deltaPerLiter) * 1000;
    const botol = Math.ceil(volHariIni / 500);
    const speed = (volHariIni / 24).toFixed(1);

    container.innerHTML = `
        <table class="scoring-table">
            <thead><tr><th>Rencana Hari ke-1</th><th>Hasil</th></tr></thead>
            <tbody>
                <tr><td>TBW</td><td>${tbw.toFixed(1)} L</td></tr>
                <tr class="highlight-natrium"><td>Kebutuhan</td><td>${botol} Botol (500mL)</td></tr>
                <tr class="highlight-natrium"><td>Kecepatan</td><td>${speed} mL/jam</td></tr>
            </tbody>
        </table>`;
}

// 6. KALKULATOR KALIUM (DUA OPSI SENTRAL)
function calculateKalium() {
    const bb = parseFloat(getValue('bb'));
    const kSerum = parseFloat(getValue('kSerum'));
    const kTarget = parseFloat(getValue('kTarget')) || 3.0;
    const akses = getValue('aksesVena');
    const container = document.getElementById('kalium-instructions');

    if (!bb || isNaN(kSerum) || !container) return;

    const kebutuhan = 0.3 * bb * (kTarget - kSerum);
    setText('displayKebutuhanK', kebutuhan > 0 ? kebutuhan.toFixed(1) : "0");
    setText('displayKaliumSerum', kSerum.toFixed(2));
    
    if (kSerum >= kTarget) {
        container.innerHTML = `<tr><td colspan="2" style="text-align:center; color:green;">Kadar Normal.</td></tr>`;
        return;
    }

    const jumlahBotol = Math.ceil(kebutuhan / 25);
    const obatVol = jumlahBotol * 25;

    if (akses === 'sentral') {
        const p1 = jumlahBotol * 100; const t1 = p1 + obatVol; const s1 = (t1 / 24).toFixed(1);
        const p2 = jumlahBotol * 500; const t2 = p2 + obatVol; const s2 = (t2 / 24).toFixed(1);

        container.innerHTML = `
            <tr style="background:#e3f2fd; font-weight:bold;"><td colspan="2" style="text-align:center;">OPSI VENA SENTRAL</td></tr>
            <tr><td><strong>Opsi A (Pekat)</strong></td><td>Pelarut: ${p1} mL NaCl<br>Total: ${t1} mL<br>Kecepatan: <strong>${s1} mL/jam</strong></td></tr>
            <tr><td><strong>Opsi B (Encer)</strong></td><td>Pelarut: ${p2} mL NaCl<br>Total: ${t2} mL<br>Kecepatan: <strong>${s2} mL/jam</strong></td></tr>
        `;
    } else {
        const pP = jumlahBotol * 500; const tP = pP + obatVol; const sP = (tP / 24).toFixed(1);
        container.innerHTML = `
            <tr><td>Akses</td><td>Vena Perifer Besar</td></tr>
            <tr><td>Pelarut</td><td>${pP} mL NaCl 0.9%</td></tr>
            <tr class="highlight-natrium"><td>Kecepatan</td><td><strong>${sP} mL/jam</strong></td></tr>
        `;
    }
}

// Helper Functions
function getValue(id) { return document.getElementById(id)?.value; }
function setText(id, txt) { 
    const el = document.getElementById(id);
    if (el) el.textContent = txt; 
}

function printAndDownload() {
    window.print();
}
