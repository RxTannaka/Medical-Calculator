// TIMI Score: STEMI dan UA/NSTEMI.

function calculateTIMISTEMI() {
    let total = 0;
    let detailsTable = `<table class="scoring-table"><thead><tr><th>Parameter</th><th style="width:50px">Skor</th></tr></thead><tbody>`;

    const tgl = getValue('tglLahir');
    if (tgl) {
        const dob = new Date(tgl);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
        if (age >= 75) { total += 3; detailsTable += `<tr><td>Usia &ge; 75 tahun (${age})</td><td>3</td></tr>`; }
        else if (age >= 65) { total += 2; detailsTable += `<tr><td>Usia 65&ndash;74 tahun (${age})</td><td>2</td></tr>`; }
    }

    document.querySelectorAll('.timistemi-check').forEach(c => {
        if (c.checked) {
            const score = parseInt(c.dataset.score);
            total += score;
            detailsTable += `<tr><td>${c.parentElement.innerText.split(' (+')[0]}</td><td>${score}</td></tr>`;
        }
    });

    const sbp = parseFloat(getValue('timiTDsistolik'));
    if (!isNaN(sbp) && sbp < 100) { total += 3; detailsTable += `<tr><td>TD sistolik &lt; 100 mmHg (${sbp})</td><td>3</td></tr>`; }

    const hr = parseFloat(getValue('timiNadi'));
    if (!isNaN(hr) && hr > 100) { total += 2; detailsTable += `<tr><td>Nadi &gt; 100 &times;/menit (${hr})</td><td>2</td></tr>`; }

    const killip = getValue('timiKillip');
    if (killip && killip !== 'I') { total += 2; detailsTable += `<tr><td>Killip kelas ${killip}</td><td>2</td></tr>`; }

    const bb = parseFloat(getValue('bb'));
    if (!isNaN(bb) && bb < 67) { total += 1; detailsTable += `<tr><td>Berat badan &lt; 67 kg (${bb})</td><td>1</td></tr>`; }

    detailsTable += `<tr><td><strong>TOTAL</strong></td><td><strong>${total}</strong></td></tr></tbody></table>`;

    const mortMap = {0:"0.8%",1:"1.6%",2:"2.2%",3:"4.4%",4:"7.3%",5:"12.4%",6:"16.1%",7:"23.4%",8:"26.8%"};
    const mort = total > 8 ? "35.9%" : mortMap[total];

    setText('displayTimistemiScore', total);
    setText('displayTimistemiMort', mort);
    document.getElementById('calc-timistemi-content').innerHTML = detailsTable;
}

function calculateTIMIUA() {
    let total = 0;
    let detailsTable = `<table class="scoring-table"><thead><tr><th>Parameter</th><th style="width:50px">Skor</th></tr></thead><tbody>`;

    const tgl = getValue('tglLahir');
    if (tgl) {
        const dob = new Date(tgl);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
        if (age >= 65) { total += 1; detailsTable += `<tr><td>Usia &ge; 65 tahun (${age})</td><td>1</td></tr>`; }
    }

    document.querySelectorAll('.timiua-check').forEach(c => {
        if (c.checked) {
            const score = parseInt(c.dataset.score);
            total += score;
            detailsTable += `<tr><td>${c.parentElement.innerText.split(' (+')[0]}</td><td>${score}</td></tr>`;
        }
    });

    detailsTable += `<tr><td><strong>TOTAL</strong></td><td><strong>${total}</strong></td></tr></tbody></table>`;

    let risk = "4.7%";
    if (total >= 6) risk = "40.9%";
    else if (total === 5) risk = "26.2%";
    else if (total === 4) risk = "19.9%";
    else if (total === 3) risk = "13.2%";
    else if (total === 2) risk = "8.3%";

    let band = "Rendah";
    if (total >= 5) band = "Tinggi";
    else if (total >= 3) band = "Sedang";

    setText('displayTimiuaScore', total);
    setText('displayTimiuaBand', band);
    setText('displayTimiuaRisk', risk);
    document.getElementById('calc-timiua-content').innerHTML = detailsTable;
}
