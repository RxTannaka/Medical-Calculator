// Koreksi Natrium.

function calculateNatrium() {
    const bb = parseFloat(getValue('bb'));
    const naSerum = parseFloat(getValue('naSerum'));
    const naTarget = parseFloat(getValue('naTarget'));
    const naInfus = parseFloat(getValue('naInfus'));
    const kecMax = parseFloat(getValue('naKecepatan'));
    const age = parseInt(document.getElementById('displayUmur')?.innerText) || 30;
    const jk = getValue('jk');

    setText('displayNaAwal', naSerum || 0);
    setText('displayNaTarget', naTarget || 0);
    const deltaTotal = naTarget - naSerum;
    setText('displayDeltaTotal', !isNaN(deltaTotal) ? deltaTotal.toFixed(1) : 0);

    const container = document.getElementById('natrium-tables-container');
    if (!bb || isNaN(naSerum) || isNaN(naTarget) || !container) return;

    container.innerHTML = "";
    if (deltaTotal <= 0) { container.innerHTML = "<tr><td colspan='2'>Target tercapai / Nilai serum lebih tinggi.</td></tr>"; return; }

    let tglAsesmen = getValue('tglAsesmen') ? new Date(getValue('tglAsesmen')) : new Date();
    let factor = (age <= 18) ? 0.6 : (jk === 'L' ? (age > 65 ? 0.5 : 0.6) : (age > 65 ? 0.45 : 0.5));
    const tbw = bb * factor;
    const deltaPerLiter = (naInfus - naSerum) / (tbw + 1);

    let sisaDelta = deltaTotal;
    let hari = 1;
    while (sisaDelta > 0.01) {
        let deltaHariIni = Math.min(sisaDelta, kecMax);
        const volmL = (deltaHariIni / deltaPerLiter) * 1000;
        const botol = Math.ceil(volmL / 500);
        const speed = (volmL / 24).toFixed(1);

        let d = new Date(tglAsesmen); d.setDate(tglAsesmen.getDate() + (hari - 1));
        const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
        const dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

        container.innerHTML += `
        <table class="scoring-table">
            <thead><tr><th style="background:${hari === 1 ? '#4CAF50' : '#2196F3'}; color:white;">Rencana Hari ke-${hari} (${dateStr})</th><th>Hasil</th></tr></thead>
            <tbody>
                ${hari === 1 ? `<tr><td>TBW</td><td>${tbw.toFixed(1)} L</td></tr>` : ''}
                <tr><td>Target &Delta; Na+</td><td>${deltaHariIni.toFixed(1)} mEq/L</td></tr>
                <tr class="highlight-natrium"><td>Kebutuhan</td><td>${botol} Botol (Total ${volmL.toFixed(0)} mL)</td></tr>
                <tr class="highlight-natrium"><td>Kecepatan</td><td>${speed} mL/jam</td></tr>
            </tbody>
        </table>`;
        sisaDelta -= deltaHariIni;
        hari++;
        if(hari > 7) break;
    }
}
