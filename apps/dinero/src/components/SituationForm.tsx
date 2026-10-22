import { NumberField, SegmentedControl } from '@explorables/ui';
import { space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { m } from '../paraglide/messages';
import type { AgeGroup, Disability, Situation } from '../tax/situation';

const MAX_CHILDREN = 10;

export interface SituationFormProps {
  situation: Situation;
  onChange: (situation: Situation) => void;
}

/** The personal circumstances that change the personal and family minimum. */
export function SituationForm({ situation, onChange }: SituationFormProps) {
  const update = (changes: Partial<Situation>) => {
    onChange({ ...situation, ...changes });
  };
  const ages = [
    { value: 'under65', label: m.age_under65() },
    { value: '65to74', label: m.age_65to74() },
    { value: '75plus', label: m.age_75plus() },
  ] as const satisfies readonly { value: AgeGroup; label: string }[];
  const disabilities = [
    { value: 'none', label: m.disability_none() },
    { value: 'moderate', label: m.disability_moderate() },
    { value: 'severe', label: m.disability_severe() },
  ] as const satisfies readonly { value: Disability; label: string }[];
  const yesNo = [
    { value: 'yes', label: m.yes() },
    { value: 'no', label: m.no() },
  ] as const;

  return (
    <div {...stylex.props(styles.form)}>
      <Field label={m.age_label()}>
        <SegmentedControl
          label={m.age_label()}
          options={ages}
          value={situation.age}
          onChange={(age) => {
            update({ age });
          }}
        />
      </Field>
      <div {...stylex.props(styles.pair)}>
        <NumberField
          label={m.children_label()}
          value={situation.children}
          onChange={(children) => {
            update({ children, childrenUnder3: Math.min(situation.childrenUnder3, children) });
          }}
          min={0}
          max={MAX_CHILDREN}
          decrementLabel={m.decrease()}
          incrementLabel={m.increase()}
        />
        <NumberField
          label={m.children_under3_label()}
          value={situation.childrenUnder3}
          onChange={(childrenUnder3) => {
            update({ childrenUnder3 });
          }}
          min={0}
          max={situation.children}
          decrementLabel={m.decrease()}
          incrementLabel={m.increase()}
        />
      </div>
      {situation.children > 0 ? (
        <Field label={m.children_shared_label()}>
          <SegmentedControl
            label={m.children_shared_label()}
            options={yesNo}
            value={situation.childrenShared ? 'yes' : 'no'}
            onChange={(answer) => {
              update({ childrenShared: answer === 'yes' });
            }}
          />
        </Field>
      ) : null}
      <Field label={m.disability_label()}>
        <SegmentedControl
          label={m.disability_label()}
          options={disabilities}
          value={situation.disability}
          onChange={(disability) => {
            update({ disability });
          }}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div {...stylex.props(styles.field)}>
      <span aria-hidden {...stylex.props(styles.fieldLabel)}>
        {label}
      </span>
      {children}
    </div>
  );
}

const styles = stylex.create({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
  },
  pair: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: space.md,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: space.xs,
  },
  fieldLabel: {
    fontSize: 14,
  },
});
