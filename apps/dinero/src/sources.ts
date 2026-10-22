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
  bizkaiaPresupuestos2026: {
    title:
      'Norma Foral 7/2025, de 29 de diciembre, de Presupuestos Generales del Territorio Histórico de Bizkaia para el año 2026',
    publisher: 'Boletín Oficial de Bizkaia',
    url: 'https://www.bizkaia.eus/lehendakaritza/Bao_bob/2025/12/30/I-1446_cas.pdf',
    accessed: '2026-10-22',
  },
  bizkaiaBonificacion: {
    title: 'Bonificación por rendimientos del trabajo (Norma Foral 13/2013 del IRPF, art. 23)',
    publisher: 'Diputación Foral de Bizkaia',
    url: 'https://dfb.microsoftcrmportals.com/es-ES/Articulo/?Code=KA-01876',
    accessed: '2026-10-22',
  },
  gipuzkoaPresupuestos2026: {
    title:
      'Norma Foral 6/2025, de 19 de diciembre, por la que se aprueban los Presupuestos Generales del Territorio Histórico de Gipuzkoa para el año 2026',
    publisher: 'Boletín Oficial de Gipuzkoa',
    url: 'https://egoitza.gipuzkoa.eus/gao-bog/castell/bog/2025/12/31/c2508886.pdf',
    accessed: '2026-10-22',
  },
  gipuzkoaIrpf: {
    title:
      'Norma Foral 3/2014, de 17 de enero, del Impuesto sobre la Renta de las Personas Físicas del Territorio Histórico de Gipuzkoa (texto consolidado)',
    publisher: 'Noticias Jurídicas',
    url: 'https://noticias.juridicas.com/base_datos/CCAA/521360-norma-foral-3-2014-de-17-de-enero-del-impuesto-sobre-la-renta-de-las-personas.html',
    accessed: '2026-10-22',
  },
  alavaMedidas2026: {
    title: 'Norma Foral 21/2025, de 19 de diciembre, de medidas tributarias para el año 2026',
    publisher: 'Boletín Oficial del Territorio Histórico de Álava',
    url: 'https://www.araba.eus/botha/Boletines/2025/147/2025_147_03861_C.pdf',
    accessed: '2026-10-22',
  },
  alavaIrpf: {
    title:
      'Norma Foral 33/2013, de 27 de noviembre, del Impuesto sobre la Renta de las Personas Físicas de Álava (texto consolidado)',
    publisher: 'Noticias Jurídicas',
    url: 'https://noticias.juridicas.com/base_datos/CCAA/517914-norma-foral-33-2013-de-27-nov-alava-impuesto-sobre-la-renta-de-las-personas.html',
    accessed: '2026-10-22',
  },
  navarraLeyForal22_2023: {
    title:
      'Ley Foral 22/2023, de 26 de diciembre, de modificación de diversos impuestos y otras medidas tributarias (Navarra)',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-1694',
    accessed: '2026-10-22',
  },
  navarraLeyForal17_2025: {
    title:
      'Ley Foral 17/2025, de 22 de diciembre, de modificación de diversos impuestos y otras medidas tributarias (Navarra)',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-3910',
    accessed: '2026-10-22',
  },
  navarraManual2022: {
    title: 'Manual teórico de la Renta 2022',
    publisher: 'Hacienda Foral de Navarra',
    url: 'https://ww3.navarra.es/Renta22/DescargaProgramaRenta/NR/rdonlyres/MANUAL_TEORICO_RENTA_2022.pdf',
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
