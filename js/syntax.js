// SYNTAX Score I: lesion, diagram segmen, ikon karakteristik, kartu cetak, rekomendasi PERKI.

// --- SYNTAX SCORE I (Sianos dkk., EuroIntervention 2005; algoritma syntaxscore.org) ---
// Bobot segmen: R = dominan kanan, L = dominan kiri, null = segmen tidak ada
const SYNTAX_SEGMENTS = [
    { id: '1',   nama: 'Proximal RCA',            R: 1,    L: 0 },
    { id: '2',   nama: 'Mid RCA',                 R: 1,    L: 0 },
    { id: '3',   nama: 'Distal RCA',              R: 1,    L: 0 },
    { id: '4',   nama: 'PDA (from RCA)',          R: 1,    L: null },
    { id: '16',  nama: 'Posterolateral branch (RCA)',  R: 0.5,  L: null },
    { id: '16a', nama: 'First posterolateral (RCA)',  R: 0.5,  L: null },
    { id: '16b', nama: 'Second posterolateral (RCA)',  R: 0.5,  L: null },
    { id: '16c', nama: 'Third posterolateral (RCA)',  R: 0.5,  L: null },
    { id: '5',   nama: 'Left main',               R: 5,    L: 6 },
    { id: '6',   nama: 'Proximal LAD',            R: 3.5,  L: 3.5 },
    { id: '7',   nama: 'Mid LAD',                 R: 2.5,  L: 2.5 },
    { id: '8',   nama: 'Apical LAD',              R: 1,    L: 1 },
    { id: '9',   nama: 'First diagonal',          R: 1,    L: 1 },
    { id: '9a',  nama: 'Additional first diagonal',  R: 1,    L: 1 },
    { id: '10',  nama: 'Second diagonal',         R: 0.5,  L: 0.5 },
    { id: '10a', nama: 'Additional second diagonal',  R: 0.5,  L: 0.5 },
    { id: '11',  nama: 'Proximal LCx',            R: 1.5,  L: 2.5 },
    { id: '12',  nama: 'Intermediate/anterolateral', R: 1, L: 1 },
    { id: '12a', nama: 'Obtuse marginal a',       R: 1,    L: 1 },
    { id: '12b', nama: 'Obtuse marginal b',       R: 1,    L: 1 },
    { id: '13',  nama: 'Distal LCx',              R: 0.5,  L: 1.5 },
    { id: '14',  nama: 'Left posterolateral',     R: 0.5,  L: 1 },
    { id: '14a', nama: 'Left posterolateral a',   R: 0.5,  L: 1 },
    { id: '14b', nama: 'Left posterolateral b',   R: 0.5,  L: 1 },
    { id: '15',  nama: 'PDA (from LCx)',          R: null, L: 1 }
];

// Medina: 1,0,0 / 0,1,0 / 1,1,0 → +1; 1,1,1 / 0,0,1 / 1,0,1 / 0,1,1 → +2
const SYNTAX_MEDINA = { '100': 1, '010': 1, '110': 1, '111': 2, '001': 2, '101': 2, '011': 2 };

let syntaxLesions = [];

// Data lama: okSideBranch boolean → pilihan
function syntaxMigrasi(l) {
    if (l.okSideBranch === true) l.okSideBranch = 'both';
    if (l.okSideBranch === false) l.okSideBranch = '';
    delete l.okNonVisual; // isian jumlah lama diganti pilihan segment
    return l;
}

// Lanjutan pembuluh utama ke distal (untuk "first segment beyond the T.O. visualised").
// Opsi = 'none' + segment lesion + segment distal; tiap segment distal sebelum yang pertama terlihat = +1.
function syntaxLanjutan(id, dom) {
    const next = { '1': '2', '2': '3', '3': dom === 'R' ? '4' : null, '5': '6', '6': '7', '7': '8', '11': '13', '13': '14' };
    const rantai = [];
    for (let n = next[id]; n; n = next[n]) rantai.push(n);
    return rantai;
}

// Segment lesion yang paling distal (rantai lanjutannya tidak berisi segment lesion lain)
function syntaxRantaiDistal(l, dom) {
    const segs = syntaxSegValid(l, dom);
    const ujung = segs.find(id => !syntaxLanjutan(id, dom).some(n => segs.includes(n)));
    return ujung ? syntaxLanjutan(ujung, dom).filter(n => SYNTAX_SEGMENTS.find(s => s.id === n)[dom] !== null) : [];
}

function syntaxNonVisual(l, dom) {
    const rantai = syntaxRantaiDistal(l, dom);
    if (l.okFirstVisible === 'none') return rantai.length;
    const k = rantai.indexOf(l.okFirstVisible);
    return k > 0 ? k : 0;
}

// Side branch pada lokasi T.O. (pilihan sama dengan kalkulator syntaxscore.org); semua "Yes" = +1
const SYNTAX_SIDE_BRANCH = [['no', 'No'], ['lt', 'Yes, all side branches &lt;1.5 mm'], ['ge', 'Yes, all side branches &ge;1.5 mm'], ['both', 'Yes, both &lt;1.5 mm and &ge;1.5 mm']];

function newSyntaxLesion() {
    return { segmen: [], oklusi: false, okUmur: false, okStump: false, okBridging: false, okFirstVisible: '', okSideBranch: '',
             trifurkasi: '0', bifurkasi: '', angulasi: false,
             aortoOstial: false, tortuositas: false, panjang: false, kalsifikasi: false, trombus: false };
}

function addSyntaxLesion() {
    if (syntaxLesions.length >= 12) { alert('Maksimal 12 lesion.'); return; }
    syntaxLesions.push(newSyntaxLesion());
    renderSyntaxLesions();
    saveCalcState();
}

function removeSyntaxLesion(i) {
    syntaxLesions.splice(i, 1);
    renderSyntaxLesions();
    saveCalcState();
}

function syntaxDominansi() { return getValue('syntaxDominansi') === 'kiri' ? 'L' : 'R'; }

function fmtSyntax(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1); }

// Diagram pohon koroner skematis (penomoran segmen SYNTAX/AHA). Tampilan anterior sederhana:
// sistem kanan di kiri gambar, sistem kiri di kanan gambar.
const SYNTAX_TREE = {
    '1':   { d: 'M140 34 Q95 40 70 75',   lx: 95,  ly: 46 },
    '2':   { d: 'M70 75 Q45 115 48 155',  lx: 46,  ly: 110 },
    '3':   { d: 'M48 155 Q55 200 95 222', lx: 54,  ly: 202 },
    '4':   { d: 'M95 222 Q120 245 138 262', lx: 108, ly: 252 },
    '16':  { d: 'M95 222 L120 210',       lx: 104, ly: 206 },
    '16a': { d: 'M120 210 L140 190',      lx: 124, ly: 190 },
    '16b': { d: 'M120 210 L150 207',      lx: 154, ly: 207 },
    '16c': { d: 'M120 210 L146 228',      lx: 150, ly: 233 },
    '5':   { d: 'M172 34 L198 55',        lx: 190, ly: 38 },
    '6':   { d: 'M198 55 L238 92',        lx: 224, ly: 66 },
    '7':   { d: 'M238 92 L262 158',       lx: 241, ly: 130 },
    '8':   { d: 'M262 158 Q268 205 252 252', lx: 270, ly: 222 },
    '9':   { d: 'M238 92 L288 112',       lx: 272, ly: 118 },
    '9a':  { d: 'M262 102 L292 86',       lx: 292, ly: 80 },
    '10':  { d: 'M262 158 L298 172',      lx: 288, ly: 181 },
    '10a': { d: 'M280 165 L304 148',      lx: 300, ly: 142 },
    '11':  { d: 'M198 55 L172 102',       lx: 172, ly: 76 },
    '12':  { d: 'M198 55 L218 118',       lx: 218, ly: 126 },
    '12a': { d: 'M172 102 L202 136',      lx: 210, ly: 136 },
    '13':  { d: 'M172 102 L163 160',      lx: 156, ly: 128 },
    '12b': { d: 'M168 131 L202 160',      lx: 210, ly: 160 },
    '14':  { d: 'M163 160 L182 196',      lx: 168, ly: 192 },
    '14a': { d: 'M172 178 L200 188',      lx: 208, ly: 192 },
    '14b': { d: 'M182 196 L202 216',      lx: 206, ly: 222 },
    '15':  { d: 'M163 160 Q152 215 168 252', lx: 148, ly: 232 }
};

// Satu lesion tidak bisa mencakup RCA dan sistem kiri sekaligus (ostium berbeda, tidak bersambung)
const SYNTAX_RCA = ['1', '2', '3', '4', '16', '16a', '16b', '16c'];
const syntaxSistem = id => SYNTAX_RCA.includes(id) ? 'RCA' : 'LEFT';

// Segmen terpilih yang ada pada dominansi aktif
function syntaxSegValid(l, dom) {
    return l.segmen.filter(id => { const s = SYNTAX_SEGMENTS.find(x => x.id === id); return s && s[dom] !== null; });
}

// Sistem yang dikunci untuk lesion ini ('RCA' / 'LEFT'), atau null bila belum ada pilihan / sudah tercampur
function syntaxSistemTerkunci(l, dom) {
    const sistem = new Set(syntaxSegValid(l, dom).map(syntaxSistem));
    if (sistem.size !== 1) return null;
    return sistem.has('RCA') ? 'LEFT' : 'RCA';
}

function syntaxPeringatan(i, l, dom) {
    const warn = [];
    const valid = syntaxSegValid(l, dom);
    if (new Set(valid.map(syntaxSistem)).size > 1) {
        warn.push('Lesion ini berisi <em>segment</em> RCA dan <em>left coronary system</em> sekaligus. Satu <em>lesion</em> hanya bisa berada di satu sistem; hapus centang yang salah.');
    }
    if (l.bifurkasi && (parseInt(l.trifurkasi) || 0) > 0) {
        warn.push('<em>Bifurcation</em> dan <em>trifurcation</em> dipilih sekaligus pada <em>lesion</em> ini. Satu <em>lesion</em> biasanya dinilai sebagai salah satunya saja; keduanya ikut dijumlahkan.');
    }
    valid.forEach(id => {
        const lain = syntaxLesions.map((x, j) => (j !== i && syntaxSegValid(x, dom).includes(id)) ? j + 1 : null).filter(Boolean);
        if (lain.length) warn.push(`<em>Segment</em> ${id} juga dipakai di <em>Lesion</em> ${lain.join(', ')}; bobotnya terhitung lebih dari sekali.`);
    });
    const ingat = [];
    if (l.oklusi && l.okSideBranch === '') ingat.push('<em>Side branch</em> pada <em>total occlusion</em> belum dijawab.');
    const adaDistal = syntaxRantaiDistal(l, dom).length > 0; // lesi di cabang: pertanyaan tidak ada (0 poin)
    if (l.oklusi && adaDistal && l.okFirstVisible === '') ingat.push('<em>First segment beyond the T.O. visualised by contrast</em> belum dijawab.');
    if (l.oklusi && adaDistal && l.okFirstVisible && l.okFirstVisible !== 'none' && !syntaxSegValid(l, dom).concat(syntaxRantaiDistal(l, dom)).includes(l.okFirstVisible)) {
        ingat.push(`Pilihan <em>first segment visualised</em> (${l.okFirstVisible}) tidak lagi sesuai dengan <em>segment</em> lesion; pilih ulang.`);
    }
    return (warn.length ? `<div class="syntax-warn">&#9888; ${warn.join('<br>&#9888; ')}</div>` : '')
        + (ingat.length ? `<div class="syntax-ingat">&#9998; ${ingat.join('<br>&#9998; ')}</div>` : '');
}

function syntaxTreeSvg(i, l, dom, cetak = false) {
    const kunci = cetak ? null : syntaxSistemTerkunci(l, dom);
    const paths = SYNTAX_SEGMENTS.filter(s => s[dom] !== null).map(s => {
        const t = SYNTAX_TREE[s.id];
        const sel = l.segmen.includes(s.id);
        const locked = kunci === syntaxSistem(s.id);
        const color = sel ? '#c62828' : locked ? '#eceff1' : (cetak || s[dom] === 0 ? '#cfd8dc' : '#90a4ae');
        return `<g ${locked || cetak ? 'style="cursor:default"' : `data-seg="${s.id}"`} data-lesion="${i}"><title>${s.id} ${s.nama} (×${s[dom]})${locked ? ' (terkunci)' : ''}</title>
            <path d="${t.d}" stroke="transparent" stroke-width="14" fill="none"/>
            <path class="seg-line" d="${t.d}" stroke="${color}" stroke-width="${sel ? 6 : 4}" fill="none" stroke-linecap="round"/>
            <text x="${t.lx}" y="${t.ly}" font-size="9" font-weight="bold" text-anchor="middle" dominant-baseline="middle"
                fill="${sel ? '#b71c1c' : locked ? '#cfd8dc' : '#37474f'}" stroke="#fafafa" stroke-width="3" paint-order="stroke">${s.id}</text></g>`;
    }).join('');
    return `<svg class="syntax-tree" viewBox="0 0 320 270" role="img" aria-label="Coronary segment diagram">
        <rect x="136" y="4" width="40" height="32" rx="14" fill="#eceff1" stroke="#b0bec5"/>
        <text x="156" y="21" font-size="9" text-anchor="middle" dominant-baseline="middle" fill="#607d8b">Ao</text>
        <text x="8" y="14" font-size="9" fill="#607d8b">Right (RCA)</text>
        <text x="312" y="14" font-size="9" fill="#607d8b" text-anchor="end">Left (LM)</text>
        ${paths}
        ${cetak ? '' : `<text x="8" y="264" font-size="8" fill="#90a4ae">Klik <tspan font-style="italic">segment</tspan> untuk memilih</text>`}
    </svg>`;
}

// Ikon skematis karakteristik lesi (60×36). Pembuluh = garis tebal, stenosis = penyempitan.
const V = (x1, x2, w = 10, c = '#e57373') => `<line x1="${x1}" y1="18" x2="${x2}" y2="18" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const PINCH = (cx, cy = 18) => `<ellipse cx="${cx}" cy="${cy - 5.5}" rx="6" ry="3.5" fill="#fafafa"/><ellipse cx="${cx}" cy="${cy + 5.5}" rx="6" ry="3.5" fill="#fafafa"/>`;
const OKL = `${V(5, 26)}<line x1="34" y1="18" x2="55" y2="18" stroke="#e57373" stroke-width="10" stroke-dasharray="2 4" opacity="0.35"/>`;
const SYNTAX_ICONS = {
    stenosis: `${V(5, 55)}${PINCH(30)}`,
    oklusi: OKL + `<line x1="30" y1="8" x2="30" y2="28" stroke="#37474f" stroke-width="1.5"/>`,
    trifurkasi: `<g stroke="#e57373" stroke-width="7" stroke-linecap="round" fill="none"><path d="M5 18 L26 18"/><path d="M26 18 L55 5"/><path d="M26 18 L55 18"/><path d="M26 18 L55 31"/></g>${PINCH(16)}`,
    angulasi: `<g stroke="#e57373" stroke-width="7" stroke-linecap="round" fill="none"><path d="M5 24 L26 24 L55 24"/><path d="M26 24 L52 8"/></g><path d="M40 24 A14 14 0 0 0 38 16" stroke="#37474f" fill="none"/><text x="44" y="34" font-size="7" fill="#37474f">&lt;70°</text>`,
    aortoOstial: `<rect x="0" y="0" width="12" height="36" fill="#eceff1" stroke="#b0bec5"/>${V(12, 55)}${PINCH(17)}`,
    tortuositas: `<path d="M5 18 C12 2, 20 34, 28 18 S44 2, 55 18" stroke="#e57373" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    panjang: `${V(5, 14)}${V(14, 46, 4)}${V(46, 55)}<path d="M14 32 L46 32 M14 29 L14 35 M46 29 L46 35" stroke="#37474f"/><text x="30" y="30" font-size="6.5" text-anchor="middle" fill="#37474f">&gt;20 mm</text>`,
    kalsifikasi: `${V(5, 55)}${PINCH(30)}<g stroke="#455a64" stroke-width="2.5" stroke-dasharray="3 2"><line x1="18" y1="11" x2="42" y2="11"/><line x1="18" y1="25" x2="42" y2="25"/></g>`,
    trombus: `${V(5, 55)}<path d="M24 15 q4 -4 8 -1 q5 -1 6 3 q-2 4 -7 3 q-5 2 -7 -2 z" fill="#fafafa" stroke="#795548" stroke-width="1"/>`,
    okUmur: OKL + `<circle cx="44" cy="12" r="8" fill="#fff" stroke="#37474f"/><path d="M44 7 L44 12 L48 14" stroke="#37474f" fill="none"/>`,
    okStump: `<line x1="5" y1="18" x2="30" y2="18" stroke="#e57373" stroke-width="10"/><line x1="30" y1="12" x2="30" y2="24" stroke="#37474f" stroke-width="1.5"/><text x="42" y="21" font-size="7" fill="#37474f" text-anchor="middle">blunt</text>`,
    okBridging: OKL + `<path d="M22 12 C27 2, 33 2, 38 12 M22 24 C27 34, 33 34, 38 24" stroke="#ef5350" stroke-width="1.2" fill="none"/>`,
    okSideBranch: OKL + `<path d="M26 18 L44 4" stroke="#e57373" stroke-width="5" stroke-linecap="round"/>`,
    okNonVisual: `${V(5, 22)}<line x1="22" y1="12" x2="22" y2="24" stroke="#37474f" stroke-width="1.5"/><line x1="28" y1="18" x2="55" y2="18" stroke="#90a4ae" stroke-width="8" stroke-dasharray="3 3"/><text x="41" y="10" font-size="9" text-anchor="middle" fill="#37474f">?</text>`
};

// Medina: digit 1 = proksimal pembuluh utama, 2 = distal pembuluh utama, 3 = cabang samping
function medinaIcon(code) {
    const [a, b, c] = (code || '000').split('');
    return `<g stroke="#e57373" stroke-linecap="round" fill="none"><path d="M5 24 L55 24" stroke-width="8"/><path d="M30 24 L52 6" stroke-width="6"/></g>
        ${a === '1' ? PINCH(16, 24) : ''}${b === '1' ? PINCH(44, 24) : ''}
        ${c === '1' ? '<ellipse cx="41" cy="15" rx="5" ry="2.5" fill="#fafafa" transform="rotate(-40 41 15)"/>' : ''}
        <text x="16" y="35" font-size="6" text-anchor="middle" fill="#37474f">prox</text><text x="44" y="35" font-size="6" text-anchor="middle" fill="#37474f">dist</text><text x="55" y="9" font-size="6" text-anchor="end" fill="#37474f">SB</text>`;
}

const syntaxIcon = (body, title) => `<svg class="syntax-icon" viewBox="0 0 60 36" aria-hidden="true"><title>${title || ''}</title>${body}</svg>`;

function renderSyntaxLesions() {
    const list = document.getElementById('syntax-lesion-list');
    if (!list) return;
    const dom = syntaxDominansi();
    const segs = SYNTAX_SEGMENTS.filter(s => s[dom] !== null);
    const cb = (i, field, label, checked) =>
        `<label class="syntax-opt">${SYNTAX_ICONS[field] ? syntaxIcon(SYNTAX_ICONS[field]) : ''}<span><input type="checkbox" data-lesion="${i}" data-field="${field}" ${checked ? 'checked' : ''}> ${label}</span></label>`;

    list.innerHTML = syntaxLesions.map((l, i) => `
        <div class="syntax-lesion">
            <div class="syntax-lesion-head">
                <span>Lesion ${i + 1} &mdash; skor <span class="syntax-lesion-score" id="syntaxLesiSkor${i}">0</span></span>
                <button type="button" class="btn-syntax btn-syntax-del" onclick="removeSyntaxLesion(${i})">Hapus</button>
            </div>
            <div class="syntax-sub">Segments involved (weight by dominance):</div>
            ${(k => k ? `<div class="syntax-lock-note">Hanya <em>${k === 'LEFT' ? 'RCA segments' : 'left coronary system segments'}</em> yang bisa dipilih untuk <em>lesion</em> ini. Hapus semua centang untuk membuka kunci.</div>` : '')(syntaxSistemTerkunci(l, dom))}
            <div class="syntax-seg-wrap">
                ${syntaxTreeSvg(i, l, dom)}
                <div class="syntax-seg-grid">
                    ${segs.map(s => { const locked = syntaxSistemTerkunci(l, dom) === syntaxSistem(s.id);
                        return `<label${locked ? ' class="locked"' : ''}><input type="checkbox" data-lesion="${i}" data-field="segmen" value="${s.id}" ${l.segmen.includes(s.id) ? 'checked' : ''} ${locked ? 'disabled' : ''}> <strong>${s.id}</strong> ${s.nama} (&times;${s[dom]})</label>`; }).join('')}
                </div>
            </div>
            ${syntaxPeringatan(i, l, dom)}
            <div class="syntax-sub">Lesion characteristics:</div>
            <div class="syntax-opt-grid">
                ${cb(i, 'oklusi', 'Total occlusion (&times;5 instead of &times;2)', l.oklusi)}
                <label class="syntax-opt">${syntaxIcon(SYNTAX_ICONS.trifurkasi)}<span>Trifurcation:<br>
                    <select data-lesion="${i}" data-field="trifurkasi">
                        ${[['0', 'None'], ['1', '1 diseased segment (+3)'], ['2', '2 diseased segments (+4)'], ['3', '3 diseased segments (+5)'], ['4', '4 diseased segments (+6)']]
                            .map(([v, t]) => `<option value="${v}" ${l.trifurkasi === v ? 'selected' : ''}>${t}</option>`).join('')}
                    </select></span>
                </label>
                <label class="syntax-opt">${syntaxIcon(medinaIcon(l.bifurkasi))}<span>Bifurcation (Medina):<br>
                    <select data-lesion="${i}" data-field="bifurkasi">
                        <option value="">None</option>
                        ${Object.keys(SYNTAX_MEDINA).map(k => `<option value="${k}" ${l.bifurkasi === k ? 'selected' : ''}>${k.split('').join(',')} (+${SYNTAX_MEDINA[k]})</option>`).join('')}
                    </select></span>
                </label>
                ${l.bifurkasi ? cb(i, 'angulasi', 'Bifurcation angulation &lt;70&deg; (+1)', l.angulasi) : ''}
                ${cb(i, 'aortoOstial', 'Aorto-ostial stenosis (+1)', l.aortoOstial)}
                ${cb(i, 'tortuositas', 'Severe tortuosity (+2)', l.tortuositas)}
                ${cb(i, 'panjang', 'Length &gt;20 mm (+1)', l.panjang)}
                ${cb(i, 'kalsifikasi', 'Heavy calcification (+2)', l.kalsifikasi)}
                ${cb(i, 'trombus', 'Thrombus (+1)', l.trombus)}
            </div>
            ${l.oklusi ? `
            <div class="syntax-co-box">
                <div class="syntax-sub" style="margin-top:0;">Total occlusion details:</div>
                <div class="syntax-opt-grid">
                    ${cb(i, 'okUmur', 'Age &gt;3 months / unknown (+1)', l.okUmur)}
                    ${cb(i, 'okStump', 'Blunt stump (+1)', l.okStump)}
                    ${cb(i, 'okBridging', 'Bridging collaterals (+1)', l.okBridging)}
                    <label class="syntax-opt">${syntaxIcon(SYNTAX_ICONS.okSideBranch)}<span>Side branch at the T.O. (+1 bila <em>yes</em>):<br>
                        <select data-lesion="${i}" data-field="okSideBranch">
                            <option value="" ${l.okSideBranch === '' ? 'selected' : ''}>&mdash; pilih &mdash;</option>
                            ${SYNTAX_SIDE_BRANCH.map(([v, t]) => `<option value="${v}" ${l.okSideBranch === v ? 'selected' : ''}>${t}</option>`).join('')}
                        </select></span>
                    </label>
                    ${syntaxRantaiDistal(l, dom).length ? `<label class="syntax-opt">${syntaxIcon(SYNTAX_ICONS.okNonVisual)}<span>First segment beyond the T.O. visualised by antegrade or retrograde contrast:<br>
                        <select data-lesion="${i}" data-field="okFirstVisible">
                            <option value="" ${l.okFirstVisible === '' ? 'selected' : ''}>&mdash; pilih &mdash;</option>
                            <option value="none" ${l.okFirstVisible === 'none' ? 'selected' : ''}>none</option>
                            ${[...syntaxSegValid(l, dom), ...syntaxRantaiDistal(l, dom)].map(id => `<option value="${id}" ${l.okFirstVisible === id ? 'selected' : ''}>Segment ${id}</option>`).join('')}
                        </select></span></label>` : ''}
                </div>
            </div>` : ''}
        </div>`).join('') || '<div style="font-size:12px; color:#888;">Belum ada <em>lesion</em>. Klik &ldquo;+ Tambah Lesion&rdquo;.</div>';
    updateStats();
}

// Klik segmen pada diagram = centang/hapus centang segmen tersebut
function onSyntaxTreeClick(e) {
    const g = e.target.closest('[data-seg]');
    if (!g) return;
    const l = syntaxLesions[parseInt(g.dataset.lesion)];
    if (!l) return;
    const id = g.dataset.seg;
    l.segmen = l.segmen.includes(id) ? l.segmen.filter(s => s !== id) : [...l.segmen, id];
    renderSyntaxLesions();
    saveCalcState();
}

function onSyntaxLesionInput(e) {
    const el = e.target;
    const i = parseInt(el.dataset.lesion);
    const field = el.dataset.field;
    if (isNaN(i) || !field || !syntaxLesions[i]) return;
    // Angka diproses saat 'input', checkbox/select saat 'change' (hindari proses ganda)
    if (el.type === 'number' && e.type === 'change') { renderSyntaxLesions(); return; }
    if (el.type === 'number' ? e.type !== 'input' : e.type !== 'change') return;
    const l = syntaxLesions[i];
    if (field === 'segmen') {
        l.segmen = l.segmen.filter(s => s !== el.value);
        if (el.checked) l.segmen.push(el.value);
    } else if (el.type === 'checkbox') {
        l[field] = el.checked;
    } else if (el.type === 'number') {
        l[field] = el.value === '' ? '' : Math.max(0, parseInt(el.value) || 0);
    } else {
        l[field] = el.value;
    }
    if (['oklusi', 'bifurkasi', 'trifurkasi', 'segmen', 'okSideBranch', 'okFirstVisible'].includes(field)) renderSyntaxLesions();
    else updateStats();
    saveCalcState();
}

function scoreSyntaxLesion(l, dom) {
    const rincian = [];
    const segs = SYNTAX_SEGMENTS.filter(s => l.segmen.includes(s.id) && s[dom] !== null);
    const bobot = segs.reduce((a, s) => a + s[dom], 0);
    const faktor = l.oklusi ? 5 : 2;
    let skor = bobot * faktor;
    const dasar = `${l.oklusi ? 'Total occlusion' : 'Stenosis 50–99%'}: ${fmtSyntax(bobot)} &times; ${faktor}`;
    rincian.push(`${dasar} = ${fmtSyntax(skor)}`);
    // items: untuk kartu cetak (ikon + teks + poin)
    const items = [{ ikon: SYNTAX_ICONS[l.oklusi ? 'oklusi' : 'stenosis'], teks: dasar, poin: fmtSyntax(skor) }];

    const add = (cond, poin, teks, ikon) => { if (cond) { skor += poin; rincian.push(`${teks} +${poin}`); items.push({ ikon, teks, poin: '+' + poin }); } };
    if (l.oklusi) {
        add(l.okUmur, 1, 'Age &gt;3 months/unknown', SYNTAX_ICONS.okUmur);
        add(l.okStump, 1, 'Blunt stump', SYNTAX_ICONS.okStump);
        add(l.okBridging, 1, 'Bridging collaterals', SYNTAX_ICONS.okBridging);
        const nonVis = syntaxNonVisual(l, dom);
        add(nonVis > 0, nonVis, `First segment beyond the T.O. visualised: ${l.okFirstVisible === 'none' ? 'none' : 'segment ' + l.okFirstVisible}`, SYNTAX_ICONS.okNonVisual);
        const sb = SYNTAX_SIDE_BRANCH.find(([v]) => v === l.okSideBranch && v !== 'no');
        add(!!sb, 1, sb ? `Side branch: ${sb[1]}` : '', SYNTAX_ICONS.okSideBranch);
    }
    const tri = parseInt(l.trifurkasi) || 0;
    add(tri > 0, tri + 2, `Trifurcation, ${tri} diseased segment(s)`, SYNTAX_ICONS.trifurkasi);
    if (l.bifurkasi && SYNTAX_MEDINA[l.bifurkasi]) {
        add(true, SYNTAX_MEDINA[l.bifurkasi], `Bifurcation Medina ${l.bifurkasi.split('').join(',')}`, medinaIcon(l.bifurkasi));
        add(l.angulasi, 1, 'Angulation &lt;70&deg;', SYNTAX_ICONS.angulasi);
    }
    add(l.aortoOstial, 1, 'Aorto-ostial', SYNTAX_ICONS.aortoOstial);
    add(l.tortuositas, 2, 'Severe tortuosity', SYNTAX_ICONS.tortuositas);
    add(l.panjang, 1, 'Length &gt;20 mm', SYNTAX_ICONS.panjang);
    add(l.kalsifikasi, 2, 'Heavy calcification', SYNTAX_ICONS.kalsifikasi);
    add(l.trombus, 1, 'Thrombus', SYNTAX_ICONS.trombus);

    const segLabel = segs.map(s => `${s.id} (${s.nama})`).join(', ') || '<em>belum dipilih</em>';
    return { skor, rincian, segLabel, items };
}

function calculateSYNTAX() {
    const dom = syntaxDominansi();
    let total = 0;
    let kartu = '';
    let detailsTable = `<table class="scoring-table screen-only"><thead><tr><th style="width:50px">Lesion</th><th>Segment</th><th>Rincian</th><th style="width:50px">Skor</th></tr></thead><tbody>`;
    detailsTable += `<tr><td colspan="4">Dominance: <strong>${dom === 'L' ? 'left' : 'right'}</strong></td></tr>`;

    syntaxLesions.forEach((l, i) => {
        const r = scoreSyntaxLesion(l, dom);
        total += r.skor;
        setText(`syntaxLesiSkor${i}`, fmtSyntax(r.skor));
        detailsTable += `<tr><td>${i + 1}</td><td>${r.segLabel}</td><td>${r.rincian.join('<br>')}</td><td>${fmtSyntax(r.skor)}</td></tr>`;
        kartu += `<div class="syntax-print-card">
            <div class="syntax-print-head"><span>Lesion ${i + 1}</span><span>Skor ${fmtSyntax(r.skor)}</span></div>
            <div class="syntax-print-segs"><strong>Segment:</strong> ${r.segLabel}</div>
            <div class="syntax-print-body">${syntaxTreeSvg(i, l, dom, true)}
                <div class="syntax-print-items">${r.items.map(it => `<div class="syntax-print-item">${syntaxIcon(it.ikon)}<span>${it.teks}</span><span class="pt">${it.poin}</span></div>`).join('')}</div>
            </div></div>`;
    });

    const difus = Math.max(0, parseInt(getValue('syntaxDifus')) || 0);
    if (difus > 0) {
        total += difus;
        detailsTable += `<tr><td colspan="3">Diffuse disease / small vessels (${difus} segment &times; 1)</td><td>${difus}</td></tr>`;
    }
    detailsTable += `<tr><td colspan="3"><strong>TOTAL SYNTAX SCORE</strong></td><td><strong>${fmtSyntax(total)}</strong></td></tr></tbody></table>`;

    // Tertile SYNTAX: ≤22 low, 23–32 intermediate, ≥33 high
    let tertil = '-';
    if (syntaxLesions.length) {
        if (total <= 22) tertil = 'Low (0–22)';
        else if (total <= 32) tertil = 'Intermediate (23–32)';
        else tertil = 'High (≥33)';
    }

    setText('displaySyntaxScore', fmtSyntax(total));
    setText('displaySyntaxTertil', tertil);
    setText('displaySyntaxLesi', syntaxLesions.length);

    // Notes: teks bebas pengguna, di-escape sebelum masuk innerHTML
    const catatan = (getValue('syntaxNotes') || '').trim()
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cetak = `<div class="syntax-print">
        <div class="syntax-print-grid${syntaxLesions.length > 4 ? ' padat' : ''}">${kartu || '<div style="font-size:11px;">Belum ada <em>lesion</em>.</div>'}</div>
        <div class="syntax-print-total">
            Dominance: <strong>${dom === 'L' ? 'left' : 'right'}</strong>${difus > 0 ? ` &nbsp;|&nbsp; Diffuse disease / small vessels: ${difus} segment (+${difus})` : ''}<br>
            <strong style="font-size:13px;">TOTAL SYNTAX SCORE: ${fmtSyntax(total)}</strong> &nbsp;&mdash;&nbsp; <strong>Tertile: ${tertil}</strong>
        </div>${catatan ? `<div class="syntax-print-notes"><strong>Notes</strong>\n${catatan}</div>` : ''}</div>`;

    const summary = `<div class="screen-only" style="margin-top:8px; padding:8px; background:#f5f5f5; font-size:12px; line-height:1.5;">
        <strong>SYNTAX Score tertile: ${tertil}</strong></div>`;

    // PERKI, Pedoman Tata Laksana SKA Edisi ke-5 (2024). Pedoman ini tidak memuat rekomendasi
    // berdasarkan tertil SYNTAX; yang dicantumkan Tabel Rekomendasi 17 (lesi multivesel) dan prinsip pemilihan revaskularisasi.
    const sub = t => `<tr><td colspan="3" style="background:#fff3e0; font-weight:bold;">${t}</td></tr>`;
    const row = (t, k, l) => `<tr><td>${t}</td><td style="text-align:center">${k}</td><td style="text-align:center">${l}</td></tr>`;
    const rek = `<div class="screen-only"><table class="scoring-table"><thead>
        <tr><th>Rekomendasi tata laksana pasien dengan lesi multivesel</th><th style="width:45px">Kelas</th><th style="width:45px">Level</th></tr></thead><tbody>
        ${row('Direkomendasikan untuk menerapkan strategi revaskularisasi (IKP pada IRA, IKP multivesel atau BPAK) berdasarkan status klinis pasien dan penyakit penyertanya serta kompleksitas dari penyakit sesuai dengan prinsip tata laksana revaskularisasi miokard', 'I', 'B')}
        ${sub('Lesi multivesel pada pasien SKA dengan syok kardiogenik')}
        ${row('Direkomendasikan tindakan IKP pada IRA selama prosedur', 'I', 'B')}
        ${row('Sebaiknya dipertimbangkan IKP secara bertahap pada non-IRA', 'IIa', 'C')}
        ${sub('Lesi multivesel pada pasien IMA-EST dengan hemodinamik stabil yang menjadi IKPP')}
        ${row('Direkomendasikan revaskularisasi lengkap, baik selama prosedur atau dalam 45 hari setelah pasien pulang dari rawatan', 'I', 'A')}
        ${row('Direkomendasikan tindakan IKP pada non-IRA berdasarkan tingkat keparahan lesi koroner', 'I', 'B')}
        ${row('Penilaian fungsional epikardial secara invasif pada segmen non-kulprit dari IRA tidak direkomendasikan selama prosedur', 'III', 'C')}
        ${sub('Lesi multivesel pada pasien SKA-NEST yang menjalani IKP')}
        ${row('Dipertimbangkan revaskularisasi komplet selama prosedur, pada pasien dengan SKA-NEST dan penyakit mikrovaskular', 'IIa', 'C')}
        ${row('Bisa dipertimbangkan evaluasi invasif fungsional dari tingkat keparahan non-IRA selama indeks prosedur', 'IIb', 'B')}
        </tbody></table>
        <table class="scoring-table"><thead>
        <tr><th>Pertimbangan pemilihan revaskularisasi</th><th style="width:60px">Bagian</th></tr></thead><tbody>
        <tr><td>Pemilihan modalitas revaskularisasi mempertimbangkan kompleksitas anatomi koroner, komorbiditas (misalnya diabetes), dan risiko tiap pilihan revaskularisasi. IMA-EST: BPAK hanya dipertimbangkan jika IKP tidak bisa dilakukan dan miokardium yang terancam berukuran besar.</td><td>5.2.1</td></tr>
        <tr><td>Pada anatomi koroner yang kompleks dengan kondisi stabil, dianjurkan <em>Heart Team meeting</em> untuk memutuskan langkah selanjutnya.</td><td>5.1.4</td></tr>
        <tr><td>BPAK darurat dipertimbangkan pada anatomi koroner yang tidak sesuai untuk IKP disertai kerusakan miokard luas atau syok kardiogenik; pada komplikasi mekanik dianjurkan BPAK disertai bedah koreksi anatomis.</td><td>3.2.1</td></tr>
        </tbody></table>
        <div style="margin-top:6px; font-size:10px; color:#555; line-height:1.4;">
            <strong>Referensi:</strong> Perhimpunan Dokter Spesialis Kardiovaskular Indonesia (PERKI).
            Pedoman Tata Laksana Sindrom Koroner Akut. Edisi ke-5. Jakarta: PERKI; 2024. Tabel Rekomendasi 17; Bagian 3.2.1, 5.1.4, dan 5.2.1.</div></div>`;

    document.getElementById('calc-syntax-content').innerHTML = cetak + detailsTable + summary + rek;
}
