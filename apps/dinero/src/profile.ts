import type { Region } from './tax/regions';
import type { Situation } from './tax/situation';

/**
 * Who the later chapters talk about: the reader, once they've told us their salary, or
 * the example salary they start with. Every chapter works either way.
 */
export interface Profile {
  /** Whether the reader has entered their own pay rather than keeping the example. */
  personal: boolean;
  /** Gross yearly salary, in 2026 euros. */
  gross: number;
  /** Net yearly pay after Social Security and IRPF. */
  net: number;
  region: Region;
  situation: Situation;
  /** Common-regime taxable base ("base liquidable general"), the same in every community. */
  taxableBase: number;
  /** IRPF rate on the salary's last euros, as a fraction. */
  marginalRate: number;
}
