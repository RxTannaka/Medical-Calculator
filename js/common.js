// Inti aplikasi: perpindahan tab, data pasien bersama, penyimpanan sesi, hitung ulang (updateStats), helper, cetak.
// Dimuat PERTAMA; berkas kalkulator dimuat sesudahnya.

let currentMode = 'psi';

function showCalculator(mode) {
    currentMode = mode;
    document.body.className = 'mode-' + mode;

    document.querySelectorAll('.btn-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');

    const allModes = ['psi', 'natrium', 'kalium', 'malnutrisi', 'timiua', 'timistemi', 'grace', 'syntax'];
    allModes.forEach(m => {
        document.getElementById(`calc-${m}-content`).style.display = 'none';
        document.getElementById(`${m}-output-box`).style.display = 'none';
    });
    document.getElementById(`calc-${mode}-content`).style.display = 'block';
    document.getElementById(`${mode}-output-box`).style.display = 'flex';

    document.getElementById('input-psi-group').style.display = (mode === 'psi') ? 'contents' : 'none';
    document.getElementById('input-natrium-group').style.display = (mode === 'natrium') ? 'contents' : 'none';
    document.getElementById('input-kalium-group').style.display = (mode === 'kalium') ? 'contents' : 'none';
    document.getElementById('input-malnutrisi-group').style.display = (mode === 'malnutrisi') ? 'contents' : 'none';
    document.getElementById('input-timiua-group').style.display = (mode === 'timiua') ? 'contents' : 'none';
    document.getElementById('input-timistemi-group').style.display = (mode === 'timistemi') ? 'contents' : 'none';
    document.getElementById('input-grace-group').style.display = (mode === 'grace') ? 'contents' : 'none';
    document.getElementById('input-syntax-group').style.display = (mode === 'syntax') ? 'contents' : 'none';

    updateStats();
}

function formatDateIndo(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// --- CALCULATOR VALUE MEMORY ---
const CALC_CACHE = 'calc_v1';
const CALC_FIELDS = ['nama', 'noMR', 'inputDPJP', 'tglAsesmen', 'tglLahir', 'jk', 'bb',
                     'naSerum', 'naTarget', 'naKecepatan', 'naInfus',
                     'kSerum', 'kTarget', 'aksesVena', 'kecepatanK',
                     'ruang', 'jam', 'tb', 'faktorStres', 'faktorProtein', 'persenLemak',
                     'densitasFormula', 'frekEnteral', 'pctEnteral', 'ibwFormula',
                     'asessmen', 'terapiMedikGizi', 'terapiOral', 'terapiEnteral',
                     'terapiParenteral', 'edukasiGizi', 'monevDetail', 'rujukBalik',
                     'timiTDsistolik', 'timiNadi', 'timiKillip',
                     'graceNadi', 'graceTDsistolik', 'graceKreatinin', 'graceKreatininUnit', 'graceKillip',
                     'syntaxDominansi', 'syntaxDifus', 'syntaxNotes'];

function saveCalcState() {
    const state = {};
    CALC_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) state[id] = el.value; });
    document.querySelectorAll('.psi-check, .timiua-check, .timistemi-check, .grace-check').forEach(cb => { if (cb.id) state[cb.id] = cb.checked; });
    state._monev = Array.from(document.querySelectorAll('.monev-check')).map(cb => cb.checked);
    state._t7checks = Array.from(document.querySelectorAll('.t7-check')).map(cb => cb.checked);
    state._syntaxLesions = syntaxLesions;
    try { sessionStorage.setItem(CALC_CACHE, JSON.stringify(state)); } catch(e) {}
}

function restoreCalcState() {
    try {
        const raw = sessionStorage.getItem(CALC_CACHE);
        if (!raw) return;
        const state = JSON.parse(raw);
        CALC_FIELDS.forEach(id => { const el = document.getElementById(id); if (el && state[id] !== undefined) el.value = state[id]; });
        document.querySelectorAll('.psi-check, .timiua-check, .timistemi-check, .grace-check').forEach(cb => { if (cb.id && state[cb.id] !== undefined) cb.checked = state[cb.id]; });
        if (state._monev) { const boxes = document.querySelectorAll('.monev-check'); state._monev.forEach((v, i) => { if (boxes[i]) boxes[i].checked = v; }); }
        if (state._t7checks) { const boxes = document.querySelectorAll('.t7-check'); state._t7checks.forEach((v, i) => { if (boxes[i]) boxes[i].checked = v; }); }
        document.querySelectorAll('.malnutrisi-textarea').forEach(ta => { if (ta.value) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; } });
        if (Array.isArray(state._syntaxLesions)) { syntaxLesions = state._syntaxLesions.map(l => syntaxMigrasi(Object.assign(newSyntaxLesion(), l))); }
        renderSyntaxLesions();
        updateStats();
    } catch(e) {}
}

function clearCalcState() {
    if (!confirm('Hapus semua data dan mulai pasien baru?')) return;
    sessionStorage.removeItem(CALC_CACHE);
    CALC_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.querySelectorAll('.malnutrisi-textarea').forEach(ta => { ta.style.height = 'auto'; });
    document.querySelectorAll('.psi-check, .monev-check, .t7-check, .timiua-check, .timistemi-check, .grace-check').forEach(cb => cb.checked = false);
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tglAsesmen').value = today;
    document.getElementById('syntaxDominansi').value = 'kanan';
    syntaxLesions = [];
    renderSyntaxLesions();
    updateStats();
}

document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['nama', 'noMR', 'inputDPJP', 'tglAsesmen', 'tglLahir', 'jk', 'bb',
                    'naSerum', 'naTarget', 'naKecepatan', 'naInfus',
                    'kSerum', 'kTarget', 'aksesVena', 'kecepatanK',
                    'ruang', 'jam', 'tb', 'faktorStres', 'faktorProtein', 'persenLemak',
                    'densitasFormula', 'frekEnteral', 'pctEnteral', 'ibwFormula',
                    'timiTDsistolik', 'timiNadi', 'timiKillip',
                    'graceNadi', 'graceTDsistolik', 'graceKreatinin', 'graceKreatininUnit', 'graceKillip',
                    'syntaxDominansi', 'syntaxDifus', 'syntaxNotes'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const evt = (el.tagName === 'SELECT' || el.type === 'date' || el.type === 'time') ? 'change' : 'input';
            el.addEventListener(evt, updateStats);
            el.addEventListener(evt, saveCalcState);
        }
    });
    document.querySelectorAll('.malnutrisi-textarea').forEach(ta => {
        ta.addEventListener('input', saveCalcState);
    });
    document.querySelectorAll('.psi-check').forEach(box => { box.addEventListener('change', updateStats); box.addEventListener('change', saveCalcState); });
    document.querySelectorAll('.timiua-check, .timistemi-check, .grace-check').forEach(box => { box.addEventListener('change', updateStats); box.addEventListener('change', saveCalcState); });
    document.querySelectorAll('.monev-check').forEach(box => { box.addEventListener('change', updateStats); box.addEventListener('change', saveCalcState); });

    // SYNTAX: lesi dinamis, pakai event delegation
    const syntaxList = document.getElementById('syntax-lesion-list');
    syntaxList.addEventListener('input', onSyntaxLesionInput);
    syntaxList.addEventListener('change', onSyntaxLesionInput);
    syntaxList.addEventListener('click', onSyntaxTreeClick);
    document.getElementById('syntaxDominansi').addEventListener('change', renderSyntaxLesions);
    renderSyntaxLesions();

    renderTabel7Checklist();
    document.querySelectorAll('.t7-check').forEach(box => { box.addEventListener('change', updateChecklistKesimpulan); box.addEventListener('change', saveCalcState); });

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tglAsesmen').value = today;
    document.getElementById('displayTanggalPrint').textContent = formatDateIndo(today);

    // Auto-expand textareas
    document.querySelectorAll('.malnutrisi-textarea').forEach(ta => {
        ta.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });

    restoreCalcState(); // restores previous patient values (overwrites defaults if session exists)
    showCalculator('psi');
});

function updateStats() {
    setText('displayNama', getValue('nama') || '-');
    setText('displayNoMR', getValue('noMR') || '-');
    setText('displayDPJP', getValue('inputDPJP') || '');
    setText('displayTglAsesmen', formatDateIndo(getValue('tglAsesmen')));
    setText('displayTglLahir', formatDateIndo(getValue('tglLahir')));
    setText('displayTanggalPrint', formatDateIndo(getValue('tglAsesmen')));
    setText('displayRuang', getValue('ruang') || '-');
    setText('displayJam', getValue('jam') || '-');

    // Page 2 mini header
    setText('displayNamaP2', getValue('nama') || '-');
    setText('displayNoMRP2', getValue('noMR') || '-');
    setText('displayRuangP2', getValue('ruang') || '-');
    setText('displayTglP2', formatDateIndo(getValue('tglAsesmen')));

    const tgl = getValue('tglLahir');
    if (tgl) {
        const dob = new Date(tgl);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
        setText('displayUmur', age + " Tahun");
    }

    try { calculatePSI(); } catch(e) {}
    try { calculateNatrium(); } catch(e) {}
    try { calculateKalium(); } catch(e) {}
    try { calculateMalnutrisi(); } catch(e) {}
    try { calculateTIMIUA(); } catch(e) {}
    try { calculateTIMISTEMI(); } catch(e) {}
    try { calculateGRACE(); } catch(e) {}
    try { calculateSYNTAX(); } catch(e) {}
}

function getValue(id) { return document.getElementById(id)?.value; }
function setText(id, txt) { const el = document.getElementById(id); if (el) el.innerText = txt; }
function printAndDownload() { window.print(); }
