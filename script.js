// --- Navigation Logic ---
function showCalculator(mode) {
    document.body.className = 'mode-' + mode;
    const isPsi = mode === 'psi';
    document.getElementById('calc-psi-content').style.display = isPsi ? 'block' : 'none';
    document.getElementById('calc-natrium-content').style.display = isPsi ? 'none' : 'block';
    document.querySelector('.psi-only-result').style.display = isPsi ? 'block' : 'none';
    document.querySelector('.natrium-only-result').style.display = isPsi ? 'none' : 'block';
    document.getElementById('btn-psi').classList.toggle('active', isPsi);
    document.getElementById('btn-natrium').classList.toggle('active', !isPsi);
}

// --- Data Synchronization ---
document.getElementById('nama').addEventListener('input', e => document.getElementById('displayNama').textContent = e.target.value || '-');
document.getElementById('noMR').addEventListener('input', e => document.getElementById('displayNoMR').textContent = e.target.value || '-');
document.getElementById('inputDPJP').addEventListener('input', e => document.getElementById('displayDPJP').textContent = e.target.value || '');
document.getElementById('tglAsesmen').addEventListener('change', e => document.getElementById('displayTglAsesmen').textContent = e.target.value || '-');

document.getElementById('tglLahir').addEventListener('change', updatePatientStats);
document.getElementById('jk').addEventListener('change', updatePatientStats);
document.getElementById('bb').addEventListener('input', calculateNatrium);
document.getElementById('naSerum').addEventListener('input', calculateNatrium);
document.getElementById('naInfus').addEventListener('change', calculateNatrium);

function updatePatientStats() {
    const dobValue = document.getElementById('tglLahir').value;
    if (!dobValue) return;
    
    const dob = new Date(dobValue);
    const age = new Date().getFullYear() - dob.getFullYear();
    document.getElementById('displayTglLahir').textContent = dobValue;
    document.getElementById('displayUmur').textContent = age + " Tahun";
    
    // PSI Age Scoring
    const jk = document.getElementById('jk').value;
    let ageScore = (jk === 'P') ? Math.max(0, age - 10) : age;
    document.getElementById('scoreUsia').textContent = ageScore;
    
    calculatePSI();
    calculateNatrium();
}

// --- PSI Logic ---
document.querySelectorAll('.psi-check').forEach(check => {
    check.addEventListener('change', () => {
        const targetId = 'score' + check.dataset.id.charAt(0).toUpperCase() + check.dataset.id.slice(1);
        document.getElementById(targetId).textContent = check.checked ? check.dataset.score : 0;
        calculatePSI();
    });
});

function calculatePSI() {
    let total = parseInt(document.getElementById('scoreUsia').textContent) || 0;
    document.querySelectorAll('.psi-check').forEach(c => { if(c.checked) total += parseInt(c.dataset.score); });
    
    document.getElementById('totalScore').textContent = total;
    let kelas = "I", mort = "0.1%";
    if(total > 130) { kelas = "V"; mort = "27.0%"; }
    else if(total > 90) { kelas = "IV"; mort = "8.2%"; }
    else if(total > 70) { kelas = "III"; mort = "0.9%"; }
    else if(total > 0) { kelas = "II"; mort = "0.6%"; }
    
    document.getElementById('kelasRisiko').textContent = kelas;
    document.getElementById('mortalityRate').textContent = mort;
}

// --- Natrium Logic (Adrogué-Madias) ---
function calculateNatrium() {
    const bb = parseFloat(document.getElementById('bb').value);
    const naSerum = parseFloat(document.getElementById('naSerum').value);
    const naInfus = parseFloat(document.getElementById('naInfus').value);
    const jk = document.getElementById('jk').value;
    const ageStr = document.getElementById('displayUmur').textContent;
    const age = parseInt(ageStr) || 30;

    if(!bb || !naSerum || !jk) return;

    let factor = (jk === 'L') ? 0.6 : 0.5;
    if(age > 65) factor -= 0.1;
    
    const tbw = bb * factor;
    const delta = (naInfus - naSerum) / (tbw + 1);

    document.getElementById('displayTBW').textContent = tbw.toFixed(1);
    document.getElementById('displayDelta').textContent = delta.toFixed(2);
}
