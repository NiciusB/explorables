# Dinero

An explorable about money and inequality in Spain. Spanish is the base locale (`es`); English (`en`) is a full translation.

## Status

All six chapters are built in Spanish and English. Salary input is optional: the 1,350 € net/month example (12 payments, Madrid) is used until the reader edits their salary, region or situation. `useSalary` shares that profile across chapters; resetting restores the example. Chapter 6 currently offers a tax-scale sandbox; sourced party comparisons are still pending and must not be inferred from illustrative presets.

## Code map

- `src/tax/`: pure tax functions and data, every figure with its citation. `rules2026.ts` and `irpf.ts` are the common regime; `foral2026.ts` and `foral.ts` the Basque territories and Navarra; `regions.ts` dispatches by region (`salaryBreakdown`). `marginal.ts` turns any calculation into steps of constant marginal rates by sampling it, so phase-outs show up as real steps.
- `src/history/`: published IRPF scales for 1979, 1992, 1999, 2007 and 2012, with a regional 2026 comparison. `src/prices.ts` converts pesetas and annual CPI into 2026 euros (2026 uses January–September).
- `src/inequality/`: salary deciles (EPA 2006–2024), household income thresholds and regional Gini (ECV), wealth groups (EFF 2024), and top income shares (WID). `position.ts` contains percentile interpolation, consumption units and inflation adjustments.
- `src/sandbox/`: editable scales, illustrative presets and effects on wage deciles. The current-scale preset encodes each half's personal allowance in zero-rate brackets to reproduce today's IRPF in every common-regime region.
- `src/chapters.ts`, `App.tsx`: reading order, chapter map, sticky coin navigation and composition. `useSalary.ts` and `profile.ts` own shared salary state; chapter-specific controls stay local.
- `src/components/`: section UI and reusable charts using `chart.*` from `@explorables/ui`. `theme.stylex.ts` supplies coin, paper and wealth colors and the self-hosted Fraunces heading font. `useTween` animates charts while respecting reduced motion.
- `src/sources.ts`: the source registry shown at the bottom of the page.

## Chapters

1. **Your salary.** The reader enters their pay in whichever form they know it:
   - gross per year (bruto anual),
   - net per month in 12 payments, or
   - net per month in 14 payments (pagas extra).

   Net inputs are converted back to gross. The page shows the whole journey from gross to net (Social Security, IRPF slices, net) and a staircase of what each euro pays. Personal circumstances (age, children, disability) sit in an "advanced" section.

2. **Historical taxation.** How IRPF scales have changed over time, comparing 2026 with hand-picked historical years.
3. **Current inequality.** Income and wealth distribution today.
4. **Historical inequality.** How the distribution has evolved.
5. **Salary vs. capital gains taxation.** Work income (escala general) vs. savings income (escala del ahorro).
6. **Design your IRPF.** Draw a marginal-rate curve with a finger or mouse (keyboard-accessible points), approximated with eight brackets; edit the exemption and exact brackets in an advanced section. Try illustrative presets and see changes in net income for the salary in use and each wage decile. Add party proposals with primary sources when available.

## Comparison decisions

- Historical taxation compares tariffs on a fixed, inflation-adjusted taxable base, not reconstructed take-home pay. Historical deductions and minimums are out of scope; 1979 includes the 40% average-rate cap and 2012 uses the reference regional scale. Tests check published cumulative quotas.
- Salary percentiles interpolate within published deciles and cap at 90 above the top-decile threshold. Household consumption units assume the entered children are under 14, as stated on the page.
- Capital-income and sandbox chapters use common-regime rules. Basque/Navarra profiles explicitly substitute Castilla-La Mancha, whose scale and minimums match the state's. The salary chapter uses the reader's actual foral system.
- Capital comparisons include employee Social Security; employer contributions and corporate tax are described but not calculated. The next-1,000 € comparison keeps the existing salary and accounts for unused personal allowances.
- Sandbox designs replace both tariffs together, keeping work reductions and the minimum-wage deduction. They do not estimate revenue or model any party unless explicitly sourced.
- Integration tests cover optional salary, cross-chapter updates and reset, year selection, household controls, capital overrides and bracket editing. Playback controls have timer tests; pure tax and distribution functions have unit tests.

## Tax model decisions

- IRPF is the state scale plus the scale of an autonomous community the reader picks (Madrid, Catalunya, etc.), not a doubled state scale. All communities are covered, including the foral systems.
- Include employee Social Security contributions, since they sit between gross and net.
- Model the final yearly tax for an employee filing individually with no other income. Include the state work reduction (art. 20), the minimum-wage deduction (DA 61.ª), and regional personal and family minimums. Regional deductions and the maternity deduction are out of scope and listed as assumptions on the page.
- Every scale is transcribed with its published cumulative quota, and tests check the two agree.
- Foral systems work differently and are modelled as such: Basque territories reduce work income with a bonificación and the quota with a flat minoración plus family/age/disability deductions (children under 6); Navarra turns its personal and family minimums into quota deductions, plus a work deduction. Álava's 68.20 € supplement for children aged 6 to 15 is not modelled.
- Net pay must rise with gross in every region (tested), since net-to-gross conversion uses bisection.
- Keep tax logic as pure, well-tested functions in this app until a second explorable needs it.
- Cite the source (BOE, AEAT, community law) and the tax year for every scale.
