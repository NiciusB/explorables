import { m } from './paraglide/messages';
import type { Region } from './tax/regions';

export const REGION_NAMES: Record<Region, () => string> = {
  andalucia: m.region_andalucia,
  aragon: m.region_aragon,
  asturias: m.region_asturias,
  baleares: m.region_baleares,
  canarias: m.region_canarias,
  cantabria: m.region_cantabria,
  'castilla-la-mancha': m.region_castilla_la_mancha,
  'castilla-y-leon': m.region_castilla_y_leon,
  cataluna: m.region_cataluna,
  extremadura: m.region_extremadura,
  galicia: m.region_galicia,
  'la-rioja': m.region_la_rioja,
  madrid: m.region_madrid,
  murcia: m.region_murcia,
  valencia: m.region_valencia,
  alava: m.region_alava,
  bizkaia: m.region_bizkaia,
  gipuzkoa: m.region_gipuzkoa,
  navarra: m.region_navarra,
};
