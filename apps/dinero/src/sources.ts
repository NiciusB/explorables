/** A document the explorable's data comes from. Titles stay in the source's own language. */
export interface Source {
  title: string;
  publisher: string;
  url: string;
  /** ISO date when the document was last checked. */
  accessed: string;
}

export const sources = {
  rentalExpenses: {
    title: 'Cálculo del rendimiento del alquiler: gastos deducibles',
    publisher: 'Agencia Tributaria',
    url: 'https://sede.agenciatributaria.gob.es/Sede/vivienda-otros-inmuebles/tributacion-arrendador-viviendas-otros-inmuebles/calculo-rendimiento-alquiler-inmueble/gastos-deducibles.html',
    accessed: '2026-10-23',
  },
  rentalReduction: {
    title:
      'Principales novedades tributarias introducidas por la Ley 12/2023, de 24 de mayo, por el derecho a la vivienda',
    publisher: 'Agencia Tributaria',
    url: 'https://sede.agenciatributaria.gob.es/Sede/irpf/novedades-impuesto/novedades-normativa-2023/principales-novedades-ley-12-2023-mayo.html',
    accessed: '2026-10-23',
  },
  rentalDepreciation: {
    title: 'Manual práctico de Renta 2025: cantidades destinadas a la amortización',
    publisher: 'Agencia Tributaria',
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c04-rendimientos-capital-inmobiliario/gastos-deducibles/cantidades-destinadas-amortizacion.html',
    accessed: '2026-10-23',
  },
  smi2026: {
    title:
      'Real Decreto 126/2026, de 18 de febrero, por el que se fija el salario mínimo interprofesional para 2026',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-3815',
    accessed: '2026-10-23',
  },
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
  lirpf1978: {
    title: 'Ley 44/1978, de 8 de septiembre, del Impuesto sobre la Renta de las Personas Físicas',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/boe/dias/1978/09/11/pdfs/A21191-21199.pdf',
    accessed: '2026-10-22',
  },
  rdl5_1992: {
    title: 'Real Decreto-ley 5/1992, de 21 de julio, de Medidas Presupuestarias Urgentes',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/boe/dias/1992/07/23/pdfs/A25506-25508.pdf',
    accessed: '2026-10-22',
  },
  lirpf1998: {
    title:
      'Ley 40/1998, de 9 de diciembre, del Impuesto sobre la Renta de las Personas Físicas y otras Normas Tributarias',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-1998-28472',
    accessed: '2026-10-22',
  },
  lirpf2006Original: {
    title:
      'Ley 35/2006, de 28 de noviembre, del Impuesto sobre la Renta de las Personas Físicas (texto original)',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2006-20764',
    accessed: '2026-10-22',
  },
  financiacion2009: {
    title:
      'Ley 22/2009, de 18 de diciembre, por la que se regula el sistema de financiación de las Comunidades Autónomas de régimen común',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2009-20375',
    accessed: '2026-10-22',
  },
  presupuestos2011: {
    title: 'Ley 39/2010, de 22 de diciembre, de Presupuestos Generales del Estado para el año 2011',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2010-19703',
    accessed: '2026-10-22',
  },
  rdl20_2011: {
    title:
      'Real Decreto-ley 20/2011, de 30 de diciembre, de medidas urgentes en materia presupuestaria, tributaria y financiera para la corrección del déficit público',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2011-20638',
    accessed: '2026-10-22',
  },
  ipc: {
    title: 'Índice de Precios de Consumo. Índice general nacional y tasas de variación desde 1961',
    publisher: 'Instituto Nacional de Estadística',
    url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=24077',
    accessed: '2026-10-22',
  },
  epaDeciles: {
    title:
      'Encuesta de Población Activa. Decil de salarios del empleo principal: salarios medios y límite inferior de cada decil',
    publisher: 'Instituto Nacional de Estadística',
    url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=66252',
    accessed: '2026-10-22',
  },
  ecvDeciles: {
    title:
      'Encuesta de Condiciones de Vida. Límites inferiores de cada decil de renta por unidad de consumo',
    publisher: 'Instituto Nacional de Estadística',
    url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=9957',
    accessed: '2026-10-22',
  },
  ecvGini: {
    title:
      'Encuesta de Condiciones de Vida. Desigualdad en la distribución de ingresos (S80/S20 y coeficiente de Gini) por comunidades autónomas',
    publisher: 'Instituto Nacional de Estadística',
    url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=76846',
    accessed: '2026-10-22',
  },
  eff2024: {
    title:
      'Encuesta Financiera de las Familias (EFF) 2024: métodos, resultados y cambios desde 2022 (Documento Ocasional n.º 2610)',
    publisher: 'Banco de España',
    url: 'https://www.bde.es/f/webbe/SES/Secciones/Publicaciones/PublicacionesSeriadas/DocumentosOcasionales/26/Fich/do2610.pdf',
    accessed: '2026-10-22',
  },
  widTopShares: {
    title:
      'World Inequality Database: participación en la renta antes de impuestos del 10 % y el 1 % con más renta, España (vía Our World in Data)',
    publisher: 'World Inequality Lab / Our World in Data',
    url: 'https://ourworldindata.org/grapher/income-share-top-10-before-tax-wid',
    accessed: '2026-10-22',
  },
  rd806_2026: {
    title:
      'Real Decreto 806/2026, de 5 de octubre, de disolución del Congreso de los Diputados y del Senado y de convocatoria de elecciones',
    publisher: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742',
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
