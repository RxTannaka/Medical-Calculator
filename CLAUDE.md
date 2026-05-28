# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Indonesian-language clinical calculator for Murni Teguh Memorial Hospital. It bundles four bedside calculators in one printable page and is meant to be filled in on screen, then printed to A4 as the patient record.

## Running and building

There is no build, no package manager, no dependencies, and no test suite. It is a single static page — open `index.html` in a browser to run it. `header.jpg` is the hospital letterhead.

`script.js` and `style.css` are empty 1-byte placeholders; **all** code lives inline in `index.html` (CSS in `<style>` at the top, JS in `<script>` at the bottom, ~line 584 onward). Edit `index.html` directly — do not move code into the empty files unless explicitly asked.

## Architecture

The whole app is driven by one piece of global state: `currentMode` and the matching `document.body.className = 'mode-' + mode`. Almost all show/hide behaviour (on screen and in print) is pure CSS keyed off `body.mode-psi | mode-natrium | mode-kalium | mode-malnutrisi`.

**Four modes**, switched by the tab buttons via `showCalculator(mode)`:
1. **PSI Score** (Pneumonia Severity Index) — `calculatePSI()`
2. **Koreksi Natrium** (sodium correction) — `calculateNatrium()`
3. **Koreksi Kalium** (potassium correction) — `calculateKalium()`
4. **Tatalaksana Malnutrisi** (malnutrition management) — `calculateMalnutrisi()`

**Shared structure.** A single patient-info form (Nama, No. MR, Tgl Lahir, Jenis Kelamin, Tgl Assessment, BB) is shared across all modes. Each mode then adds its own input group (`#input-<mode>-group`), toggled with `display: contents | none`. Each mode has an output box (`#<mode>-output-box`) and a content section (`#calc-<mode>-content`).

**Central recompute.** `updateStats()` is the hub: it is wired to `input`/`change` on every field in `DOMContentLoaded`, refreshes the patient header, then calls all four calculate functions inside `try/catch`. Calculators are intentionally cheap and idempotent — they all run on every keystroke regardless of active mode. Don't add a "which mode is active?" guard inside them; the CSS handles visibility.

**State persistence.** Inputs persist to `sessionStorage` under key `calc_v1` (`saveCalcState` / `restoreCalcState` / `clearCalcState`; the 🗑 "Pasien Baru" button clears). It survives reload within the session, not across browser restarts.
- **Gotcha:** a persisted field ID must appear in BOTH `CALC_FIELDS` (line ~620, used by save/restore) AND the `inputs` array inside `DOMContentLoaded` (line ~663, used to attach listeners). Adding a field to only one is the most likely bug when extending the form.
- Checkboxes persist by class: `.psi-check`, `.monev-check`, `.t7-check`. Malnutrisi `<textarea>`s persist by value and auto-grow on input.

**Print is the real output.** `printAndDownload()` is just `window.print()`. The `@media print` block (line ~113) is load-bearing: it hides `.screen-only` UI, forces A4, and shows only the active mode's content/output. Malnutrisi prints **two pages** — Tabel 7 checklist (page 1) then the form tatalaksana (page 2), via `page-break-*` rules. Test any layout change by checking the browser print preview in each mode, not just the screen.

## Clinical logic (domain specifics that aren't obvious from the code)

- **PSI:** base score = age, with women scored `age − 10`. Comorbidity/exam checkboxes carry their points in `data-score`. Total maps to risk class I–V and a mortality %.
- **Natrium:** total body water factor varies by age and sex (`factor` in `calculateNatrium`). The plan is iterative per day, capped at the max daily ΔNa the user sets, for up to 7 days; volumes are expressed in 500 mL bottles.
- **Kalium:** KCl requirement = `konstanta (0.3–0.4) × BB × (target − serum)`, dispensed as 25 mEq vials (`VIAL_MEQ`); infusion rate from the `kecepatanK` select.
- **Malnutrisi:** nutritional targets use **Ideal Body Weight** (`calculateIBW` — Hamwi / Devine / Broca) when a formula is selected, otherwise actual BB. The diagnosis (MALNUTRISI SEDANG / BERAT) is derived in `updateChecklistKesimpulan` from the Tabel 7 checklist (`.t7-check`, data sourced from the `TABEL7_DATA` constant, line ~1085): ≥2 checks → sedang; ≥2 of those being "berat" → berat. The result propagates to the output box, the skrining row, and the kesimpulan.

## Conventions

- UI text, labels, and comments are in **Indonesian**. Match that when adding UI.
- Input element IDs are camelCase (`naSerum`, `kTarget`, `frekEnteral`); read-only display spans are prefixed `display*`; helper-calculator results use `h*` (targets) and `e*` (enteral); print-only spans use `display*` / `print*`.
- Helpers: `getValue(id)`, `setText(id, txt)` — null-safe accessors used throughout. Prefer them over raw `getElementById` for consistency.
