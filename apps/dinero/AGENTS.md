# Dinero

An explorable about money and inequality in Spain. Spanish is the base locale (`es`); English (`en`) is a full translation.

## Status

Hello world only: scaffolding, tokens, and a language switcher. The sections below are the plan.

## Planned sections

1. **Your salary.** The reader enters their pay in whichever form they know it:
   - gross per year (bruto anual),
   - net per month in 12 payments, or
   - net per month in 14 payments (pagas extra).

   Net inputs are converted back to gross. Then IRPF is shown as stacked parts, one per bracket and its rate, so the reader sees which slice of their income is taxed at which percentage.

2. **Historical taxation.** How IRPF scales have changed over time.
3. **Current inequality.** Income and wealth distribution today.
4. **Historical inequality.** How the distribution has evolved.
5. **Salary vs. capital gains taxation.** Work income (escala general) vs. savings income (escala del ahorro).

## Tax model decisions

- IRPF is the state scale plus the scale of an autonomous community the reader picks (Madrid, Catalunya, etc.), not a doubled state scale.
- Include employee Social Security contributions, since they sit between gross and net.
- Keep tax logic as pure, well-tested functions in this app until a second explorable needs it.
- Cite the source (BOE, AEAT, community law) and the tax year for every scale.
