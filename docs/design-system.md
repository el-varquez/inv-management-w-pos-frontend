# POS Register — Design System (white / green)

> Transcribed verbatim from the Claude Design project (`claude-design-system.md`, the authoring home). Token values in this file are informative — the normative copy is `design/tokens.json`, enforced against `src/index.css` by `npm run check:design`.

Component library for the POS product's two heads — the Desktop POS Register (1920×1080, WPF target) and the web admin. Hand this file to Claude Code as the single source of truth for visual decisions. White is dominant; green is the secondary/action color; everything else is an accent with a fixed meaning.

## 1 · Color tokens

Neutrals (white-dominant):

```css
--paper:       #ffffff;  /* app background — flat white */
--paper-2:     #e6ede8;  /* rail / recessed areas */
--surface:     #ffffff;  /* cards, modals, topbar */
--surface-2:   #f4f8f5;  /* inputs, numpad keys, stat tiles */
--ink:         #17241d;  /* primary text */
--ink-2:       #4c5c53;  /* secondary text */
--ink-3:       #75867c;  /* captions, column headers, hints */
--line:        #e0e8e2;  /* hairline borders */
--line-strong: #c5d3ca;  /* input borders, dashed rules */
```

Brand + semantic:

```css
--green:       #1e7a4c;  /* PRIMARY — main actions, active nav, selection */
--green-deep:  #16603a;  /* hover / pressed */
--green-soft:  rgba(30,122,76,.10);  /* selected-row tint, active nav bg */
--confirm:     #2e6b4e;  /* success, cash-in, COMPLETE SALE, balances at 0 */
--confirm-soft:rgba(46,107,78,.12);
--red:         #b23a2e;  /* void, refund, short, insufficient */
--red-soft:    rgba(178,58,46,.12);
--gold:        #b0823a;  /* utang / credit, warnings, over */
--gold-soft:   rgba(176,130,58,.14);
```

Shadows / overlay:

```css
--shadow-sm: 0 1px 2px rgba(23,46,35,.06);        /* cards */
--shadow:    0 18px 40px -18px rgba(20,45,33,.3); /* modals, dropdowns */
--overlay:   rgba(18,28,23,.45);                  /* modal scrim */
```

Rules:
- The app background is **flat white** (`--paper` = `--surface` = `#ffffff`) — no tinted paper, no gradients, no grain textures. Cards separate from the background with a 1px `--line` border + `--shadow-sm`, never with a background tint.
- Pale green appears only in `--paper-2` (rail / recessed areas) and `--surface-2` (inputs, keys, stat tiles).
- Green is the ONLY primary-action color. One green CTA per view.
- Red / gold never decorate — they always mean void-refund-short / utang-warn-over.
- Text on green/red/gold buttons is `#ffffff`.

## 2 · Typography

- **Fraunces** (serif) — money, totals, headings, receipt numbers. Weights 600–700.
- **Hanken Grotesk** (sans) — everything else. Weights 400–700.
- Both open-license Google Fonts, bundleable in WPF.

Scale (px): captions/labels 11–12 (uppercase, letter-spacing .1em, `--ink-3`, weight 600) · body 14–15 · row emphasis 16 · modal titles 22 (Fraunces 700) · screen titles 24 · last-item price 36 · sale TOTAL 44 · change on success 58.

Numbers: always `₱` + thousands separator + 2 decimals (`₱1,234.50`). Tabular numerals on the live clock.

## 3 · Shape, spacing, elevation

- Radius: cards/modals **14px**, buttons/inputs **10px**, small keys **8px**, chips/badges **999px**.
- Touch targets: ≥44px; primary payment button 64px tall.
- Card = `--surface` + 1px `--line` + `--shadow-sm`. Modal = same + `--shadow` over `--overlay`.
- Section paddings: screen gutter 16px, card padding 20–26px, table cells 10–13px vertical.
- Dashed `--line-strong` rules for receipt-style separators only.

## 4 · Components

**Buttons**
- Primary: green bg, white text, weight 700, letter-spacing .06–.12em, UPPERCASE for money actions (CASH, COLLECT, OPEN SHIFT).
- Destructive: `--red` bg (CLOSE SHIFT, REFUND SALE).
- Utang: `--gold` bg or gold outline + `--gold-soft` fill.
- Secondary: transparent bg, 1px `--line-strong` border, `--ink-2` text.
- Disabled: opacity .5, cursor default.

**Chips / badges** — pill, 12px, weight 700: shift OPEN (`--confirm-soft`/`--confirm`), CLOSED (`--red-soft`/`--red`), Completed / Refunded / Utang badges same pattern.

**Inputs** — 1px `--line-strong` border, `--surface-2` or white bg, radius 10px, no outline; the money-entry pattern is a big Fraunces value with an invisible right-aligned input. Every modal auto-focuses its field (`autoFocus` + select-on-focus), Enter commits, Esc cancels.

**Switch (toggle)** — 60×32px pill track, 26px white knob inset 3px, travelling left 3px → 31px on a .15s ease, knob carries `--shadow-sm`. Off track `--line-strong`; **on track `--green`** — a switch is an active-state control, so it takes the primary color and never `--gold` (gold stays reserved for utang-warn-over, even when the setting itself is about utang). Disabled: opacity .55, cursor not-allowed. Always paired with a 16px/700 name plus one line of 13px `--ink-3` help text, sitting in a `--surface-2` row (radius 10px, 18px padding). Carries `role="switch"` + `aria-checked`, labelled by the name — state is never conveyed by color alone.

**Numpad** — 3-col grid, 56px keys, `--surface-2` bg, 1px `--line-strong`, digit 20px/600. Layout 1-9, C, 0, ⌫.

**Dropdown** — caption label above a 52px trigger (white bg, radius 10px, 1.5px border: `--line-strong` closed, `--green` open; value left, caret right, caret flips when open). Menu floats 6px below: white card, 1px `--line` border, radius 10px, `--shadow`; options 13px/16px padding separated by hairlines; selected option = `--green-soft` bg + `--green-deep` text, weight 700. Hover: `--surface-2`.

**Tables** — header row: 11px uppercase `--ink-3`; body rows separated by 1px hairlines; money columns right-aligned Fraunces. Selected row: `--green-soft` bg + 3px inset green left bar.

**Modals** — centered, radius 14px, title in Fraunces 22/700, "Amount due" strip in `--surface-2`, actions row: ghost Cancel + primary flex-1.

**Receipt / X-Z reads** — white card, dashed section rules, uppercase 11px section heads, bold rows with 1.5px `--ink` top border for totals.

**Toast** — bottom-center pill, `--ink` bg, white text, ~2.8s.

**Rail nav** — 84px left rail on `--paper-2`; active item `--green-soft` bg + `--green-deep` text; icon 20px over 9px uppercase label.

**Charts (web admin dashboard)** — data colors are validator-checked (dataviz `validate_palette.js`), never eyeballed: sales line `--green #1e7a4c` vs utang `--gold #b0823a` (all checks pass, deutan ΔE 8.1). Deep green `#16603a` fails the chroma floor as a data color — UI-only. Status trios (green/gold/red) always ship direct labels + counts + segment gaps; never color alone.

## 5 · Interaction rules

- Keyboard-first: F1 search · F5 pay · F2 edit qty · F6 void line · ↑/↓ select line · Enter commits, Esc cancels, everywhere.
- Every destructive or money-mutating action (refunds, ledger voids, payment edits, settings changes by cashiers) requires the admin-override modal (password, logged).
- Success modal: Enter-to-dismiss; focus returns to scan field after every completed flow.
- Out-of-stock stays visible at 45% opacity, non-addable.

## 6 · Voice

English UI with Filipino domain words kept as-is: *utang*, *suki*. Matter-of-fact microcopy ("No starting cash, no transactions"). No emoji outside the nav icons.
