# Project memory

## Product intent & audience

- Korean moving/relocation app ("Moving Lab") that recommends auspicious moving dates (길일) and cost estimates (예상 견적) using Saju (사주) and directional/feng shui (방위) calculations.
- Users input moving year, family birth dates, and departure/arrival regions to receive a personalized analysis.

## Brand personality & voice

- Trustworthy, clean, and modern — inspired by Toss and Carrot Market (당근마켓) UX patterns.
- Korean-language UI; labels and headings should feel clear and high-contrast on white backgrounds.

## Visual design & UX direction

- **Tech stack**: Next.js + Tailwind CSS.
- **Form hierarchy**: Each major section (STEP 01–04) is a white elevated card (`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6`) with a blue step badge and bold dark-slate title (`text-slate-900 font-bold text-lg`).
- **Input fields**: Labels in `text-slate-800 font-semibold text-sm mb-2 block`; inputs/selects use `border-slate-300 focus:border-blue-600 h-12 rounded-xl text-slate-900` — sharp borders, no faint outlines.
- **Departure/arrival regions**: Side-by-side ticket/card layout — departure (현재 집) in light-blue card, arrival (새 집) in light-green card, with a circular blue arrow (→) and a swap button between them.
- **Primary CTA**: Large trust-conveying button (`h-14 bg-blue-700 text-white font-bold rounded-xl shadow-lg w-full`) with subtle hover lift.
- **Contrast rule**: All text must be clearly legible on white — no washed-out / low-opacity text.
- Subtle hover lift on cards and CTA.

## Decisions, constraints & rationale

- Existing Saju/방위 calculation logic, state management, and region-selection data must be preserved 100% — changes are strictly visual/UX on the Step 1 input form.
- Improvements scoped to `moving-lab.tsx` form section and `globals.css` only; no logic/data refactoring.
- Build verified passing after changes.

## Open questions & assumptions

- Assumes the multi-step flow continues beyond Step 1 (Steps 02–04 referenced); styling so far applied primarily to the Step 1 input form.
- No explicit design system / theme tokens defined yet — colors are inline Tailwind classes; consider centralizing if more steps are styled later.