// Koreksi Kalium.

function calculateKalium() {
    const bb = parseFloat(getValue('bb'));
    const kSerum = parseFloat(getValue('kSerum'));
    const kTarget = parseFloat(getValue('kTarget')) || 3.5;
    const kConst = Math.min(0.4, Math.max(0.3, parseFloat(getValue('kConstant')) || 0.3));
    const akses = getValue('aksesVena');
    const rateEq = parseFloat(getValue('kecepatanK')) || 5;

    setText('displayKaliumSerum', kSerum || 0);
    setText('displayKTarget', kTarget);
    const deltaK = kTarget - kSerum;
    setText('displayDeltaK', !isNaN(deltaK) && deltaK > 0 ? deltaK.toFixed(1) : "0");

    const kebutuhan = kConst * bb * (kTarget - kSerum);
    setText('displayKebutuhanK', !isNaN(kebutuhan) && kebutuhan > 0 ? kebutuhan.toFixed(1) : "0");

    const container = document.getElementById('kalium-instructions');
    if (!bb || isNaN(kSerum) || !container) return;

    if (kSerum >= kTarget) {
        container.innerHTML = `<tr><td colspan="2" style="text-align:center; color:green; font-weight:bold;">Kadar Kalium Normal / Target Tercapai.</td></tr>`;
        return;
    }

    const VIAL_MEQ = 25; // sediaan KCl 25 mEq/vial
    const nVials = Math.ceil(kebutuhan / VIAL_MEQ);
    const durasi = Math.round(kebutuhan / rateEq * 10) / 10;

    let rows = `
        <tr><td>Kalium Serum</td><td>${kSerum.toFixed(1)} mEq/L</td></tr>
        <tr><td>Target Koreksi</td><td>${kTarget.toFixed(1)} mEq/L</td></tr>
        <tr><td>Konstanta</td><td>${kConst.toFixed(2)} <small style="color:#888">(range 0.3–0.4)</small></td></tr>
        <tr><td>Total Kebutuhan KCl</td><td><strong>${kebutuhan.toFixed(1)} mEq</strong> <small style="color:#888">(${kConst} × ${bb} × ${deltaK.toFixed(1)})</small></td></tr>
        <tr class="highlight-natrium"><td>Jumlah Vial KCl 25 mEq</td><td><strong>${nVials} vial</strong> (= ${nVials * VIAL_MEQ} mEq tersedia)</td></tr>
        <tr><td>Kecepatan Dipilih</td><td><strong>${rateEq} mEq/jam</strong></td></tr>
        <tr class="highlight-natrium"><td>Estimasi Durasi Total</td><td><strong>~${durasi} jam</strong></td></tr>
    `;

    // Safety warnings
    const jamPerBagCalc = VIAL_MEQ / rateEq; // durasi 1 botol/vial habis (jam)
    const warnings = [];
    if (akses === 'perifer' && kSerum < 3.0) {
        warnings.push('⚠️ K &lt;3.0 mEq/L — Pertimbangkan akses vena sentral');
    }
    if (akses === 'perifer' && jamPerBagCalc < 4) {
        warnings.push(`⚠️ Kecepatan terlalu tinggi untuk perifer — 1 botol habis dalam ~${Math.round(jamPerBagCalc * 10) / 10} jam (batas aman: 4–6 jam/botol). Kurangi kecepatan atau gunakan vena sentral.`);
    }
    if (rateEq > 20) {
        warnings.push('⚠️ Life-threatening: Monitoring ECG kontinu wajib. Pantau K setiap 1 jam. Tidak ada infus lain di kateter yang sama.');
    }
    if (warnings.length) {
        rows += warnings.map(w =>
            `<tr><td colspan="2" style="background:#fff3e0; color:#e65100; font-weight:bold; padding:7px 10px;">${w}</td></tr>`
        ).join('');
    }

    if (akses === 'sentral') {
        // Central: 1 vial KCl 25 mEq in 100 mL NS = 250 mEq/L, via syringe pump
        const concSentral = 250; // mEq/L
        const mlPerH = Math.round(rateEq * 1000 / concSentral * 10) / 10; // rateEq × 4
        const jamPerVial = Math.round(VIAL_MEQ / rateEq * 10) / 10;
        rows += `
            <tr style="background:#e3f2fd;"><td colspan="2" style="font-weight:bold; text-align:center;">VENA SENTRAL — Syringe Pump</td></tr>
            <tr><td>Persiapan per Syringe</td><td><strong>1 vial KCl 25 mEq</strong> dalam 100 mL NaCl 0.9%<br><small style="color:#666">(konsentrasi 250 mEq/L)</small></td></tr>
            <tr class="highlight-natrium"><td>Kecepatan Pompa</td><td><strong>${mlPerH} mL/jam</strong> (= ${rateEq} mEq/jam)</td></tr>
            <tr><td>Durasi per Syringe</td><td>~${jamPerVial} jam → isi ulang total <strong>${nVials}×</strong></td></tr>
            <tr><td>Rute</td><td>Vena sentral (diutamakan vena femoralis)</td></tr>
            ${rateEq > 20
                ? `<tr style="background:#ffebee;"><td colspan="2" style="color:#b71c1c; font-weight:bold;">Hentikan bila K ≥3.5 mEq/L atau timbul aritmia baru. Tidak boleh ada infus lain di kateter yang sama.</td></tr>`
                : `<tr><td>Monitoring</td><td>Pantau K setiap 2–4 jam</td></tr>`}
        `;
    } else {
        // Peripheral: 1 vial KCl 25 mEq in 500 mL NS = 50 mEq/L (< 60 mEq/L limit)
        // Protocol: 20-40 mEq/L given over 4-6h → practical rate 5-10 mEq/jam
        const concPerif = 50; // mEq/L (25 mEq / 500 mL)
        const mlPerH = Math.round(rateEq * 1000 / concPerif * 10) / 10; // rateEq × 20
        const jamPerBag = Math.round(VIAL_MEQ / rateEq * 10) / 10;
        rows += `
            <tr style="background:#e8f5e9;"><td colspan="2" style="font-weight:bold; text-align:center;">VENA PERIFER (Vena Perifer Besar)</td></tr>
            <tr><td>Persiapan per Botol</td><td><strong>1 vial KCl 25 mEq</strong> dalam <strong>500 mL NaCl 0.9%</strong><br><small style="color:#666">(konsentrasi 50 mEq/L — di bawah batas aman 60 mEq/L)</small></td></tr>
            <tr class="highlight-natrium"><td>Kecepatan Infus</td><td><strong>${mlPerH} mL/jam</strong> (= ${rateEq} mEq/jam)</td></tr>
            <tr><td>Durasi per Botol</td><td>~${jamPerBag} jam → ganti botol (total <strong>${nVials} botol</strong>)</td></tr>
            <tr><td>Monitoring</td><td>Pantau K setiap 4–6 jam. Gunakan NaCl, bukan Dextrose.</td></tr>
            <tr style="background:#fff8e1;"><td>Peringatan</td><td>Jangan melebihi <strong>60 mEq/L</strong> pada perifer (risiko nyeri &amp; sklerosis vena)</td></tr>
        `;
    }
    container.innerHTML = rows;
}

function changeKacepatanK(dir) {
    const sel = document.getElementById('kecepatanK');
    if (!sel) return;
    const newIdx = sel.selectedIndex + dir;
    if (newIdx >= 0 && newIdx < sel.options.length) {
        sel.selectedIndex = newIdx;
        updateStats();
    }
}
