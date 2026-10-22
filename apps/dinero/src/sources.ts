/** A document the explorable's data comes from. Titles stay in the source's own language. */
export interface Source {
  title: string;
  publisher: string;
  url: string;
  /** ISO date when the document was last checked. */
  accessed: string;
}

export const sources = {
  lirpf: {
    title:
      'Ley 35/2006, de 28 de noviembre, del Impuesto sobre la Renta de las Personas Físicas (texto consolidado)',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
    accessed: '2026-10-22',
  },
  tributacionAutonomica2026: {
    title:
      'Tributación Autonómica. Medidas 2026. Capítulo IV (actualizado a 23 de septiembre de 2026)',
    publisher: 'Ministerio de Hacienda',
    url: 'https://www.hacienda.gob.es/sgfal/financiacionterritorial/autonomica/capitulo-iv-tributacion-autonomica-2026.pdf',
    accessed: '2026-10-22',
  },
  cotizacion2026: {
    title:
      'Orden PJC/297/2026, de 30 de marzo, por la que se desarrollan las normas legales de cotización a la Seguridad Social para el ejercicio 2026',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296',
    accessed: '2026-10-22',
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof sources;

/** Where in a source a specific figure comes from. */
export interface Citation {
  source: SourceId;
  /** Article, table, or page within the source, as written in the source. */
  locator: string;
}
