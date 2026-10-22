import * as stylex from '@stylexjs/stylex';

import { m } from '../paraglide/messages';
import { REGION_NAMES } from '../regionNames';
import type { Region } from '../tax/regions';
import { commonRegionFor } from '../tax/savings';
import { prose } from './prose';

/** Says when a chapter computes with a common-regime community instead of the reader's. */
export function ForalNote({ region }: { region: Region }) {
  const used = commonRegionFor(region);
  if (used === region) return null;
  return <p {...stylex.props(prose.caption)}>{m.foral_note({ region: REGION_NAMES[used]() })}</p>;
}
