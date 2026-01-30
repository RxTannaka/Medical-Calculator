function showCalculator(mode) {
    document.body.className = 'mode-' + mode;
    const isPsi = (mode === 'psi');
    document.getElementById('calc-psi-content').style.display = isPsi ? 'block' : 'none';
    document.getElementById('calc-natrium-content').style.display = !isPsi ? 'block' : 'none';
    document.querySelector('.psi-only-result').style.display = isPsi ? 'block' : 'none';
    document.querySelector('.natrium-only-result').style.display = !isPsi ? 'block' : 'none';
    document.getElementById('btn-psi').classList.toggle('active', isPsi);
    document.getElementById('btn-natrium').classList.toggle('active', !isPsi);
}

document.getElementById('nama').addEventListener('input', e => document.getElementById('displayNama').textContent = e.target.value || '-');
document.getElementById('noMR').addEventListener('input', e => document.getElementById('displayNoMR').textContent = e.target.value || '-');
document.getElementById('inputDPJP').addEventListener('input', e => document.getElementById('displayDPJP').textContent = e.target.value || '');
document.getElementById('tglAsesmen').addEventListener('change', e => document.getElementById('displayTglAsesmen').textContent = e.target.value || '-');

document.getElementById('tglLahir').addEventListener('change', updateStats);
document.getElementById('jk').addEventListener('change', updateStats);
['bb', 'naSerum', 'naInfus', 'targetNa'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateNatrium);
});

function updateStats() {
    const tgl = document.getElementById('tglLahir').value;
    if(!tgl) return;
    const age = new Date().getFullYear() - new Date(tgl).getFullYear();
    document.getElementById('displayTglLahir').textContent = tgl;
    document.getElementById('displayUmur').textContent = age + " Tahun";
    const jk = document.getElementById('jk').value;
    document.getElementById('scoreUsia').textContent = (jk === 'P') ? Math.max(0, age - 10) : age;
    calculatePSI();
    calculateNatrium();
}

document.querySelectorAll('.psi-check').forEach(box => {
    box.addEventListener('change', () => {
        const id = box.dataset.id;
        const scoreId = 'score' + id.charAt(0).toUpperCase() + id.slice(1);
        const el = document.getElementById(scoreId);
        if(el) el.textContent = box.checked ? box.dataset.score : 0;
        calculatePSI();
    });
});

function calculatePSI() {
    let total = parseInt(document.getElementById('scoreUsia').textContent) || 0;
    document.querySelectorAll('.psi-check').forEach(c => { if(c.checked) total += parseInt(c.dataset.score); });
    document.getElementById('totalScore').textContent = total;
    let kelas = "I", mort = "0.1%";
    if(total > 130) { kelas = "V"; mort = "29.2%"; }
    else if(total >= 91) { kelas = "IV"; mort = "8.2%"; }
    else if(total >= 71) { kelas = "III"; mort = "2.8%"; }
    else if(total > 0) { kelas = "II"; mort = "0.6%"; }
    document.getElementById('kelasRisiko').textContent = kelas;
    document.getElementById('mortalityRate').textContent = mort;
}

function calculateNatrium() {
    const bb = parseFloat(document.getElementById('bb').value);
    const naSerum = parseFloat(document.getElementById('naSerum').value);
    const naInfus = parseFloat(document.getElementById('naInfus').value);
    const target = parseFloat(document.getElementById('targetNa').value) || 8;
    const jk = document.getElementById('jk').value;
    const age = parseInt(document.getElementById('displayUmur').textContent) || 30;

    if(!bb || !naSerum || !jk) return;

    let factor = (jk === 'L') ? 0.6 : 0.5;
    if(age > 65) factor -= 0.1;
    
    const tbw = bb * factor;
    const deltaPerLiter = (naInfus - naSerum) / (tbw + 1);
    const totalVolumeLtr = target / deltaPerLiter;
    const totalVolumeMl = totalVolumeLtr * 1000;
    const flaskCount = totalVolumeMl / 500;
    const speed = totalVolumeMl / 24;

    document.getElementById('txtTBW').textContent = tbw.toFixed(1);
    document.getElementById('txtDelta').textContent = deltaPerLiter.toFixed(2);
    document.getElementById('txtTotalVol').textContent = Math.round(totalVolumeMl);
    document.getElementById('txtFlask').textContent = flaskCount.toFixed(2);
    document.getElementById('txtKecepatan').textContent = speed.toFixed(1) + " mL/jam";
    
    document.getElementById('displayDelta').textContent = deltaPerLiter.toFixed(2);
    document.getElementById('displayFlask').textContent = flaskCount.toFixed(1);
}
