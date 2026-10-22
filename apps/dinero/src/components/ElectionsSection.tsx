import { Disclosure, NumberField } from '@explorables/ui';
import { colors, fonts, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { formatEuros, formatPercent, intlLocale } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import type { Profile } from '../profile';
import { REGION_NAMES } from '../regionNames';
import {
  currentDesign,
  salaryChanges,
  designedIrpf,
  designedMarginal,
  PRESETS,
  type Design,
  type DesignedBracket,
} from '../sandbox/customScale';
import { DRAW_MAX } from '../sandbox/drawScale';
import { commonIrpf } from '../tax/irpf';
import { commonRegionFor } from '../tax/savings';
import { whimsy } from '../theme.stylex';
import { ChangeBars } from './ChangeBars';
import { DrawScale } from './DrawScale';
import { ForalNote } from './ForalNote';
import { SourceNote } from './SourceNote';
import { Stat, StatRow } from './Stat';
import { a11y } from './visuallyHidden';
import { prose } from './prose';

const MAX_BRACKETS = 8;
const MAX_BASE = 1_000_000;

type Preset = 'current' | keyof typeof PRESETS;

/** A bracket on screen, with an id that survives edits so inputs keep their focus. */
interface Row extends DesignedBracket {
  id: number;
}

interface EditableDesign extends Design {
  brackets: readonly Row[];
}

let lastRowId = 0;

function newRow(bracket: DesignedBracket): Row {
  lastRowId += 1;
  return { ...bracket, id: lastRowId };
}

const editable = (design: Design): EditableDesign => ({
  exempt: design.exempt,
  brackets: design.brackets.map(newRow),
});

export interface ElectionsSectionProps {
  profile: Profile;
  locale: Locale;
}

/** Chapter 6: 29-N is coming; meanwhile the reader designs their own IRPF scale. */
export function ElectionsSection({ profile, locale }: ElectionsSectionProps) {
  const drawingHint = useId();
  const region = commonRegionFor(profile.region);
  const today = currentDesign(region, profile.situation);
  const [design, setDesign] = useState(() => editable(PRESETS.flat));
  const euros = (value: number) => formatEuros(value, locale);
  const nowIrpf = commonIrpf(profile.gross, region, profile.situation).irpf;
  const designed = designedIrpf(profile.gross, design, region, profile.situation);
  const changes = salaryChanges(design, region, profile.situation);
  const choose = (preset: Preset) => {
    setDesign(editable(preset === 'current' ? today : PRESETS[preset]));
  };

  return (
    <div {...stylex.props(prose.root)}>
      <aside {...stylex.props(styles.ballot)}>
        <strong {...stylex.props(styles.ballotTitle)}>{m.elections_date()}</strong>
        <span>{m.elections_pending()}</span>
        <SourceNote citations={[{ source: 'rd806_2026', locator: 'art. 2' }]} />
      </aside>
      <p>{m.elections_intro()}</p>
      <ForalNote region={profile.region} />

      <fieldset {...stylex.props(styles.presets)}>
        <legend {...stylex.props(a11y.hidden)}>{m.sandbox_presets()}</legend>
        <button
          type="button"
          onClick={() => {
            choose('current');
          }}
          {...stylex.props(styles.preset)}
        >
          {m.sandbox_preset_current({ region: REGION_NAMES[region]() })}
        </button>
        <button
          type="button"
          onClick={() => {
            choose('flat');
          }}
          {...stylex.props(styles.preset)}
        >
          {m.sandbox_preset_flat()}
        </button>
        <button
          type="button"
          onClick={() => {
            choose('steep');
          }}
          {...stylex.props(styles.preset)}
        >
          {m.sandbox_preset_steep()}
        </button>
      </fieldset>

      <p id={drawingHint} {...stylex.props(prose.caption, styles.note)}>
        {m.sandbox_draw_hint()}
      </p>
      <div {...stylex.props(styles.workspace)}>
        <DrawScale
          design={design}
          onChange={(next) => {
            setDesign(editable(next));
          }}
          locale={locale}
          descriptionId={drawingHint}
        />
        <section {...stylex.props(styles.benefits)}>
          <h3 {...stylex.props(styles.benefitsTitle)}>{m.sandbox_salaries_title()}</h3>
          <p {...stylex.props(prose.caption, styles.note)}>{m.sandbox_salaries_lede()}</p>
          <ChangeBars
            items={changes.map(({ gross, change }) => ({ label: euros(gross), value: change }))}
            format={(value) => signedEuros(value, locale)}
            label={m.sandbox_salaries_label()}
          />
        </section>
      </div>
      <p {...stylex.props(prose.caption, styles.note)}>
        {m.sandbox_draw_note({
          exempt: euros(design.exempt),
          maximum: euros(DRAW_MAX),
        })}
      </p>
      <Disclosure title={m.sandbox_advanced()}>
        <BracketEditor design={design} onChange={setDesign} locale={locale} />
      </Disclosure>

      <StatRow>
        <Stat label={m.sandbox_stat_now()} value={euros(nowIrpf)} />
        <Stat
          label={m.sandbox_stat_designed()}
          value={euros(designed)}
          note={m.sandbox_marginal({
            rate: formatPercent(
              designedMarginal(profile.gross, design, region, profile.situation),
              locale,
            ),
          })}
        />
        <Stat
          label={profile.personal ? m.sandbox_stat_change_yours() : m.sandbox_stat_change_example()}
          value={signedEuros(nowIrpf - designed, locale)}
          note={m.sandbox_per_month({ amount: signedEuros((nowIrpf - designed) / 12, locale) })}
        />
      </StatRow>

      <p {...stylex.props(prose.caption)}>{m.sandbox_caveat()}</p>
    </div>
  );
}

function signedEuros(value: number, locale: Locale): string {
  const rounded = Math.round(value);
  const text = formatEuros(Math.abs(rounded), locale);
  if (rounded === 0) return text;
  return rounded > 0 ? `+${text}` : `−${text}`;
}

interface BracketEditorProps {
  design: EditableDesign;
  onChange: (design: EditableDesign) => void;
  locale: Locale;
}

/** Rows of "from this base, this rate", plus the exempt amount at the bottom. */
function BracketEditor({ design, onChange, locale }: BracketEditorProps) {
  const update = (id: number, changes: Partial<DesignedBracket>) => {
    onChange({
      ...design,
      brackets: design.brackets.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    });
  };
  const last = design.brackets.at(-1);
  return (
    <fieldset {...stylex.props(styles.editor)}>
      <legend {...stylex.props(styles.legend)}>{m.sandbox_editor()}</legend>
      <NumberField
        label={m.sandbox_exempt()}
        value={Math.round(design.exempt)}
        onChange={(exempt) => {
          onChange({ ...design, exempt });
        }}
        min={0}
        max={MAX_BASE}
        step={500}
        format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
        locale={intlLocale(locale)}
        decrementLabel={m.decrease()}
        incrementLabel={m.increase()}
      />
      {design.brackets.map((row, index) => (
        <div key={row.id} {...stylex.props(styles.row)}>
          <NumberField
            label={m.sandbox_from({ number: String(index + 1) })}
            value={Math.round(row.from)}
            onChange={(from) => {
              update(row.id, { from });
            }}
            min={0}
            max={MAX_BASE}
            step={1000}
            format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
            locale={intlLocale(locale)}
            decrementLabel={m.decrease()}
            incrementLabel={m.increase()}
          />
          <NumberField
            label={m.sandbox_rate({ number: String(index + 1) })}
            value={row.rate}
            onChange={(rate) => {
              update(row.id, { rate });
            }}
            min={0}
            max={100}
            step={0.5}
            format={{ maximumFractionDigits: 2 }}
            locale={intlLocale(locale)}
            decrementLabel={m.decrease()}
            incrementLabel={m.increase()}
          />
          <button
            type="button"
            disabled={design.brackets.length === 1}
            onClick={() => {
              onChange({
                ...design,
                brackets: design.brackets.filter((other) => other.id !== row.id),
              });
            }}
            {...stylex.props(styles.remove)}
          >
            {m.sandbox_remove()}
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={design.brackets.length >= MAX_BRACKETS}
        onClick={() => {
          onChange({
            ...design,
            brackets: [
              ...design.brackets,
              newRow({
                from: (last?.from ?? 0) + 20_000,
                rate: Math.min(100, (last?.rate ?? 0) + 5),
              }),
            ],
          });
        }}
        {...stylex.props(styles.add)}
      >
        + {m.sandbox_add()}
      </button>
    </fieldset>
  );
}

const styles = stylex.create({
  workspace: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      '@media (min-width: 1000px)': 'minmax(0, 1.2fr) minmax(0, 1fr)',
    },
    gap: { default: space.md, '@media (min-width: 1000px)': space.lg },
    alignItems: 'start',
    alignSelf: 'center',
    width: { default: '100%', '@media (min-width: 1000px)': 'min(1040px, calc(100vw - 64px))' },
  },
  benefits: { display: 'flex', flexDirection: 'column', gap: space.sm, minWidth: 0 },
  benefitsTitle: { fontSize: 20, fontWeight: 600, margin: 0 },
  note: { margin: 0 },
  ballot: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    padding: space.md,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: whimsy.coinEdge,
    backgroundColor: whimsy.paper,
    transform: 'rotate(-0.6deg)',
  },
  ballotTitle: { fontFamily: whimsy.display, fontSize: 22 },
  presets: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.sm,
    margin: 0,
    padding: 0,
    borderWidth: 0,
  },
  preset: {
    appearance: 'none',
    paddingBlock: space.xs,
    paddingInline: space.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: whimsy.path,
    borderRadius: 999,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    backgroundColor: { default: 'transparent', ':hover': whimsy.paper },
    cursor: 'pointer',
  },
  editor: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    gap: space.md,
    margin: 0,
    padding: space.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 14,
  },
  legend: { paddingInline: space.xs, fontWeight: 600 },
  row: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, minmax(0, 1fr))',
      '@media (min-width: 560px)': 'repeat(2, minmax(0, 1fr)) auto',
    },
    alignItems: 'end',
    gap: space.sm,
  },
  remove: {
    appearance: 'none',
    paddingBlock: space.sm,
    borderWidth: 0,
    fontFamily: fonts.body,
    fontSize: 14,
    color: { default: colors.accent, ':disabled': colors.textMuted },
    backgroundColor: 'transparent',
    textDecoration: 'underline',
    cursor: { default: 'pointer', ':disabled': 'default' },
  },
  add: {
    appearance: 'none',
    alignSelf: 'flex-start',
    paddingBlock: space.xs,
    paddingInline: space.md,
    borderWidth: 0,
    borderRadius: 999,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: 600,
    color: colors.accentText,
    backgroundColor: colors.accent,
    cursor: 'pointer',
    opacity: { default: 1, ':disabled': 0.5 },
  },
});
