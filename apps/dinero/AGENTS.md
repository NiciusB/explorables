# Dinero

An explorable about money and inequality in Spain. Spanish is the base locale (`es`); English (`en`) is a full translation.

## Status

Section 1 (your salary) is built for 2026 and the 15 common-regime communities. Navarra and the Basque territories (Álava, Bizkaia, Gipuzkoa) come next, then the remaining sections.

## Code map

- `src/tax/`: pure tax functions and data. `rules2026.ts` holds every figure with its citation; `irpf.ts` is the common-regime calculation; `marginal.ts` turns any calculation into steps of constant marginal rates by sampling it, so phase-outs show up as real steps.
- `src/components/`: the section UI. Charts use the dataviz palette tokens from `@explorables/ui` (`chart.*`).
- `src/sources.ts`: the source registry shown at the bottom of the page.

## Planned sections

1. **Your salary.** The reader enters their pay in whichever form they know it:
   - gross per year (bruto anual),
   - net per month in 12 payments, or
   - net per month in 14 payments (pagas extra).

   Net inputs are converted back to gross. The page shows the whole journey from gross to net (Social Security, IRPF slices, net) and a staircase of what each euro pays. Personal circumstances (age, children, disability) sit in an "advanced" section.

2. **Historical taxation.** How IRPF scales have changed over time, comparing 2026 with hand-picked historical years.
3. **Current inequality.** Income and wealth distribution today.
4. **Historical inequality.** How the distribution has evolved.
5. **Salary vs. capital gains taxation.** Work income (escala general) vs. savings income (escala del ahorro).

## Tax model decisions

- IRPF is the state scale plus the scale of an autonomous community the reader picks (Madrid, Catalunya, etc.), not a doubled state scale. All communities are covered, including the foral systems.
- Include employee Social Security contributions, since they sit between gross and net.
- Model the final yearly tax for an employee filing individually with no other income. Include the state work reduction (art. 20), the minimum-wage deduction (DA 61.ª), and regional personal and family minimums. Regional deductions and the maternity deduction are out of scope and listed as assumptions on the page.
- Every scale is transcribed with its published cumulative quota, and tests check the two agree.
- Keep tax logic as pure, well-tested functions in this app until a second explorable needs it.
- Cite the source (BOE, AEAT, community law) and the tax year for every scale.
