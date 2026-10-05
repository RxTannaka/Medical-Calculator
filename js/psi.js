// PSI Score (Pneumonia Severity Index).

function calculatePSI() {
    let total = 0;
    let detailsTable = `<table class="scoring-table"><thead><tr><th>Parameter</th><th style="width:50px">Skor</th></tr></thead><tbody>`;

    const tgl = getValue('tglLahir');
    if(tgl) {
        const dob = new Date(tgl);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
        const jk = getValue('jk');
        let ageScore = (jk === 'P') ? Math.max(0, age - 10) : age;
        total += ageScore;
        detailsTable += `<tr><td>Usia (${age}) + Gender (${jk})</td><td>${ageScore}</td></tr>`;
    }

    document.querySelectorAll('.psi-check').forEach(c => {
        if(c.checked) {
            const score = parseInt(c.dataset.score);
            total += score;
            detailsTable += `<tr><td>${c.parentElement.innerText.split(' (+')[0]}</td><td>${score}</td></tr>`;
        }
    });

    detailsTable += `<tr><td><strong>TOTAL</strong></td><td><strong>${total}</strong></td></tr></tbody></table>`;
    setText('totalScore', total);

    let kelas = "I", mort = "0.1%";
    if(total > 130) { kelas = "V"; mort = "29.2%"; }
    else if(total >= 91) { kelas = "IV"; mort = "8.2%"; }
    else if(total >= 71) { kelas = "III"; mort = "2.8%"; }
    else if(total > 0) { kelas = "II"; mort = "0.6%"; }

    setText('kelasRisiko', kelas);
    setText('mortalityRate', mort);
    document.getElementById('calc-psi-content').innerHTML = detailsTable;
}
