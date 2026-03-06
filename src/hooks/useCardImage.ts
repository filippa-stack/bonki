import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';

/**
 * Which zip file a card image lives in.
 */
type ZipSource = 'default' | 'jim' | 'jma' | 'jiv' | 'vk' | 'sk' | 'sex';

/**
 * Maps card IDs → zip source + path inside that zip.
 */
const CARD_IMAGE_MAP: Record<string, { zip: ZipSource; folder: string; file: string }> = {
  // ── Jag i Mig (new illustrations) ──
  'jim-trygg':      { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'trygg copy.png' },
  'jim-ensam':      { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'ensamhet.png' },
  'jim-stress':     { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'stress copy.png' },
  'jim-glad':       { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'GLÄDJE copy.png' },
  'jim-ledsen':     { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'ledsamhet copy.png' },
  'jim-arg':        { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'monster copy.png' },
  'jim-radd':       { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'rädsla copy.png' },
  'jim-vild':       { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'vild copy.png' },
  'jim-besviken':   { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'besviken.png' },
  'jim-acklad':     { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'avsmak.png' },
  'jim-avsky':      { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'avsky.png' },
  'jim-skam':       { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'skam2 copy.png' },
  'jim-avundsjuk':  { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'avundsjuka-3 copy.png' },
  'jim-svartsjuk':  { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'svartsjuka copy.png' },
  'jim-utanfor':    { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'utanförskap.png' },
  'jim-stolt':      { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'stolthet copy.png' },
  'jim-bestamd':    { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'bestämd copy.png' },
  'jim-karlek':     { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'kär copy.png' },
  'jim-nyfiken':    { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'nyfiken.png' },
  'jim-forvanad':   { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'förvånad.png' },
  'jim-jag':        { zip: 'jim', folder: 'Känslokort1-illustrationer.png', file: 'jag copy.png' },

  // ── Jag med Andra ──
  'jma-vanskap':    { zip: 'jma', folder: '', file: 'Vänskap.png' },
  'jma-kontakt':    { zip: 'jma', folder: '', file: 'Kontakt.png' },
  'jma-annorlunda': { zip: 'jma', folder: '', file: 'Annorlunda.png' },
  'jma-utanfor':    { zip: 'jma', folder: '', file: 'Utanför.png' },
  'jma-duktig':     { zip: 'jma', folder: '', file: 'Duktig.png' },
  'jma-tavla':      { zip: 'jma', folder: '', file: 'Tävla.png' },
  'jma-utseende':   { zip: 'jma', folder: '', file: 'Utseende.png' },
  'jma-avund':      { zip: 'jma', folder: '', file: 'Avund.png' },
  'jma-konflikt':   { zip: 'jma', folder: '', file: 'Konflikt.png' },
  'jma-misslyckas': { zip: 'jma', folder: '', file: 'Misslyckas.png' },
  'jma-kritik':     { zip: 'jma', folder: '', file: 'Kritik.png' },
  'jma-skam':       { zip: 'jma', folder: '', file: 'Skam.png' },
  'jma-skuld':      { zip: 'jma', folder: '', file: 'Skuld.png' },
  'jma-stopp':      { zip: 'jma', folder: '', file: 'Stopp.png' },
  'jma-integritet': { zip: 'jma', folder: '', file: 'Integritet.png' },
  'jma-modig':      { zip: 'jma', folder: '', file: 'Modig.png' },
  'jma-respekt':    { zip: 'jma', folder: '', file: 'Respekt.png' },
  'jma-sanning':    { zip: 'jma', folder: '', file: 'Sanning.png' },
  'jma-lika-varde': { zip: 'jma', folder: '', file: 'Lika värde.png' },
  'jma-acceptans':  { zip: 'jma', folder: '', file: 'Acceptans.png' },
  'jma-kluringen':  { zip: 'jma', folder: '', file: 'Kluringen.png' },

  // ── Jag i Världen ──
  'jiv-halsa':        { zip: 'jiv', folder: '', file: 'Hälsa.png' },
  'jiv-prestation':   { zip: 'jiv', folder: '', file: 'Prestation.png' },
  'jiv-bekraftelse':  { zip: 'jiv', folder: '', file: 'Bekräftelse.png' },
  'jiv-sjalvkansla':  { zip: 'jiv', folder: '', file: 'Självkänsla.png' },
  'jiv-identitet':    { zip: 'jiv', folder: '', file: 'Identitet.png' },
  'jiv-roller':       { zip: 'jiv', folder: '', file: 'Roller.png' },
  'jiv-frihet':       { zip: 'jiv', folder: '', file: 'Frihet.png' },
  'jiv-karlek':       { zip: 'jiv', folder: '', file: 'Kärlek.png' },
  'jiv-vanskap':      { zip: 'jiv', folder: '', file: 'Vänskap.png' },
  'jiv-kommunikation':{ zip: 'jiv', folder: '', file: 'Kommunikation.png' },
  'jiv-konflikt':     { zip: 'jiv', folder: '', file: 'Konflikt.png' },
  'jiv-medkansla':    { zip: 'jiv', folder: '', file: 'Medkänsla.png' },
  'jiv-mobbning':     { zip: 'jiv', folder: '', file: 'Mobbning.png' },
  'jiv-fordomar':     { zip: 'jiv', folder: '', file: 'Fördomar.png' },
  'jiv-social-media': { zip: 'jiv', folder: '', file: 'Social media.png' },
  'jiv-psykisk-ohalsa':{ zip: 'jiv', folder: '', file: 'Psykisk ohälsa.png' },
  'jiv-sexualitet':   { zip: 'jiv', folder: '', file: 'Sexualitet.png' },
  'jiv-moral-etik':   { zip: 'jiv', folder: '', file: 'Moral & etik.png' },
  'jiv-aktivism':     { zip: 'jiv', folder: '', file: 'Aktivism.png' },
  'jiv-existens':     { zip: 'jiv', folder: '', file: 'Existens.png' },

  // ── Vardagskort ──
  'vk-morgon':         { zip: 'vk', folder: '', file: 'Morgon.png' },
  'vk-rutiner':        { zip: 'vk', folder: '', file: 'Rutiner.png' },
  'vk-skola':          { zip: 'vk', folder: '', file: 'Skola.png' },
  'vk-hur-var-din-dag':{ zip: 'vk', folder: '', file: 'Hur var din dag.png' },
  'vk-kvall':          { zip: 'vk', folder: '', file: 'Kväll.png' },
  'vk-sova':           { zip: 'vk', folder: '', file: 'Sova.png' },
  'vk-helg':           { zip: 'vk', folder: '', file: 'Helg.png' },
  'vk-mat':            { zip: 'vk', folder: '', file: 'Mat.png' },
  'vk-hushall':        { zip: 'vk', folder: '', file: 'Hushåll.png' },
  'vk-syskon':         { zip: 'vk', folder: '', file: 'Syskon.png' },
  'vk-underhallning':  { zip: 'vk', folder: '', file: 'Underhållning.png' },
  'vk-aktiviteter':    { zip: 'vk', folder: '', file: 'Aktiviteter.png' },
  'vk-tonar':          { zip: 'vk', folder: '', file: 'Tonår.png' },
  'vk-arbete':         { zip: 'vk', folder: '', file: 'Arbete.png' },
  'vk-kompisar':       { zip: 'vk', folder: '', file: 'Kompisar.png' },

  // ── Sexualitetskort ──
  'sex-konsidentitet':    { zip: 'sex', folder: '', file: 'könsidentitet.png' },
  'sex-sexuell-laggning': { zip: 'sex', folder: '', file: 'sexuell läggning.png' },
  'sex-onani':            { zip: 'sex', folder: '', file: 'onani.png' },
  'sex-kroppsideal':      { zip: 'sex', folder: '', file: 'kroppsideal.png' },
  'sex-normer':           { zip: 'sex', folder: '', file: 'NORMER.png' },
  'sex-pornografi':       { zip: 'sex', folder: '', file: 'porr.png' },
  'sex-sexuella-tabun':   { zip: 'sex', folder: '', file: 'sexuellatabun.png' },
  'sex-sex-och-karlek':   { zip: 'sex', folder: '', file: 'sexochkärlek.png' },
  'sex-samtycke':         { zip: 'sex', folder: '', file: 'samtycke.png' },
  'sex-sex-och-ansvar':   { zip: 'sex', folder: '', file: 'sex&ansvar.png' },
  'sex-sexuella-misstag': { zip: 'sex', folder: '', file: 'sexuellamisstag.png' },
  'sex-konsekvenser-av-sex':{ zip: 'sex', folder: '', file: 'konsekvenseravsex.png' },
  'sex-sexuella-overgrepp':{ zip: 'sex', folder: '', file: 'sexuellaövergrepp.png' },
  'sex-sex-som-hot':      { zip: 'sex', folder: '', file: 'sexsomhot.png' },

  // ── Syskonkort ──
  'sk-att-fa-ett-syskon':  { zip: 'sk', folder: '', file: 'ETTSYSKON.png' },
  'sk-syskonminnen':       { zip: 'sk', folder: '', file: 'jämföra.png' },
  'sk-syskonkunskap':      { zip: 'sk', folder: '', file: 'syskonkunskap.png' },
  'sk-vanskap':            { zip: 'sk', folder: '', file: 'vänskap.png' },
  'sk-unik':               { zip: 'sk', folder: '', file: 'unik.png' },
  'sk-aldst-mitten-yngst': { zip: 'sk', folder: '', file: 'åldrar.png' },
  'sk-bonussyskon':        { zip: 'sk', folder: '', file: 'bonussyskon.png' },
  'sk-konflikt':           { zip: 'sk', folder: '', file: 'konflikt.png' },
  'sk-dela':               { zip: 'sk', folder: '', file: 'dela.png' },
  'sk-rattvisa':           { zip: 'sk', folder: '', file: 'rättvisa.png' },
  'sk-uppmarksamhet':      { zip: 'sk', folder: '', file: 'uppmärksamhet.png' },
  'sk-sjukdom':            { zip: 'sk', folder: '', file: 'sjuk.png' },
  'sk-forlora-ett-syskon': { zip: 'sk', folder: '', file: 'förlora syskon.png' },
  'sk-framtid':            { zip: 'sk', folder: '', file: 'framtid.png' },
};

/**
 * Standalone image overrides — used when an image is missing from its zip.
 */
const STANDALONE_IMAGES: Record<string, string> = {
  'vk-kvall': '/card-images/vk-kvall.png',
  'vk-sova': '/card-images/vk-sova.png',
  'jiv-identitet': '/card-images/jiv-identitet.png',
  'jiv-roller': '/card-images/jiv-roller.png',
  'jiv-mobbning': '/card-images/jiv-mobbning.png',
  'jiv-fordomar': '/card-images/jiv-fordomar.png',
  'jiv-social-media': '/card-images/jiv-social-media.png',
  'jiv-moral-etik': '/card-images/jiv-moral-etik.png',
  'jiv-sexualitet': '/card-images/jiv-sexualitet.png',
};

const ZIP_URLS: Record<ZipSource, string> = {
  default: '/card-images.zip',
  jim: '/jim-illustrations.zip',
  jma: '/jma-card-images.zip',
  jiv: '/jiv-card-images.zip',
  vk: '/vk-card-images.zip',
  sk: '/sk-card-images.zip',
  sex: '/sex-card-images.zip',
};

// ── Lazy ZIP loading: parse header once, extract individual files on demand ──

/** Parsed JSZip instances, cached per source */
const zipInstances: Record<ZipSource, JSZip | null> = { default: null, jim: null, jma: null, jiv: null, vk: null, sk: null, sex: null };
const zipLoadPromises: Record<ZipSource, Promise<JSZip> | null> = { default: null, jim: null, jma: null, jiv: null, vk: null, sk: null, sex: null };

/** Per-file blob URL cache */
const fileCache = new Map<string, string>();

/** Normalize Unicode + lowercase for matching */
const norm = (s: string) => s.normalize('NFC').toLowerCase();

async function getZipInstance(source: ZipSource): Promise<JSZip> {
  if (zipInstances[source]) return zipInstances[source]!;
  if (zipLoadPromises[source]) return zipLoadPromises[source]!;

  zipLoadPromises[source] = (async () => {
    try {
      const res = await fetch(ZIP_URLS[source]);
      if (!res.ok) throw new Error(`ZIP fetch failed: ${res.status}`);
      const buf = await res.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);
      zipInstances[source] = zip;
      return zip;
    } catch (err) {
      // Clear promise so retry is possible
      zipLoadPromises[source] = null;
      throw err;
    }
  })();

  return zipLoadPromises[source]!;
}

/** Extract a single file from a ZIP — returns blob URL or null */
async function extractSingleFile(source: ZipSource, folder: string, fileName: string): Promise<string | null> {
  const cacheKey = `${source}/${folder}/${fileName}`;
  if (fileCache.has(cacheKey)) return fileCache.get(cacheKey)!;

  try {
    const zip = await getZipInstance(source);

    // Try exact path first
    const exactPath = folder ? `${folder}/${fileName}` : fileName;
    let entry = zip.file(exactPath);

    // Fallback: Unicode-normalized + case-insensitive search
    if (!entry) {
      const normFile = norm(fileName);
      const normFolder = norm(folder);
      zip.forEach((path, zipEntry) => {
        if (entry || zipEntry.dir) return;
        const normPath = norm(path);
        if (
          normPath.endsWith(`/${normFolder}/${normFile}`) ||
          normPath.endsWith(`/${normFile}`) ||
          normPath === normFile
        ) {
          entry = zipEntry;
        }
      });
    }

    if (!entry) return null;

    const blob = await entry.async('blob');
    const url = URL.createObjectURL(blob);
    fileCache.set(cacheKey, url);
    return url;
  } catch (err) {
    console.warn(`[useCardImage] Failed to extract ${fileName} from ${source}:`, err);
    return null;
  }
}

/**
 * Returns a blob URL for the card's illustration, or null while loading / if not found.
 */
export function useCardImage(cardId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(() => {
    if (!cardId) return null;
    // Check standalone overrides synchronously
    const standalone = STANDALONE_IMAGES[cardId];
    if (standalone) return standalone;
    // Check file cache synchronously
    const mapping = CARD_IMAGE_MAP[cardId];
    if (mapping) {
      const cacheKey = `${mapping.zip}/${mapping.folder}/${mapping.file}`;
      if (fileCache.has(cacheKey)) return fileCache.get(cacheKey)!;
    }
    return null;
  });
  const cardIdRef = useRef(cardId);
  cardIdRef.current = cardId;

  useEffect(() => {
    if (!cardId) return;

    // Check standalone overrides first
    const standalone = STANDALONE_IMAGES[cardId];
    if (standalone) {
      setUrl(standalone);
      return;
    }

    const mapping = CARD_IMAGE_MAP[cardId];
    if (!mapping) return;

    // Check cache synchronously
    const cacheKey = `${mapping.zip}/${mapping.folder}/${mapping.file}`;
    if (fileCache.has(cacheKey)) {
      setUrl(fileCache.get(cacheKey)!);
      return;
    }

    let cancelled = false;

    extractSingleFile(mapping.zip, mapping.folder, mapping.file).then((blobUrl) => {
      if (cancelled || cardIdRef.current !== cardId) return;
      if (blobUrl) setUrl(blobUrl);
    });

    return () => { cancelled = true; };
  }, [cardId]);

  return url;
}

/** Check if a card has an image mapped */
export function hasCardImage(cardId: string): boolean {
  return cardId in CARD_IMAGE_MAP;
}

/**
 * Preload a ZIP archive header (no file extraction).
 * Call when navigating to a product home to warm the cache.
 */
export function preloadZip(source: ZipSource): void {
  getZipInstance(source).catch(() => {});
}

/** Map product IDs to their ZIP source for preloading */
export const PRODUCT_ZIP_MAP: Record<string, ZipSource> = {
  jag_i_mig: 'jim',
  jag_med_andra: 'jma',
  jag_i_varlden: 'jiv',
  vardagskort: 'vk',
  syskonkort: 'sk',
  sexualitetskort: 'sex',
};
