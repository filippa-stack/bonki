import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';

/**
 * Which zip file a card image lives in.
 * 'default' = /card-images.zip, 'jim' = /jim-illustrations.zip
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

  // ── Jag med Andra (new illustrations zip) ──
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

  // ── Jag i Världen (new illustrations zip) ──
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

  // ── Vardagskort (new illustrations zip) ──
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

  // ── Sexualitetskort (new illustrations zip) ──
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

  // ── Syskonkort (new illustrations zip) ──
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
 * Maps card ID → public URL path.
 */
const STANDALONE_IMAGES: Record<string, string> = {
  'vk-kvall': '/card-images/vk-kvall.png',
  'vk-sova': '/card-images/vk-sova.png',
};
// Singleton caches per zip source
const zipCaches: Record<ZipSource, Map<string, string> | null> = { default: null, jim: null, jma: null, jiv: null, vk: null, sk: null, sex: null };
const zipPromises: Record<ZipSource, Promise<Map<string, string>> | null> = { default: null, jim: null, jma: null, jiv: null, vk: null, sk: null, sex: null };

const ZIP_URLS: Record<ZipSource, string> = {
  default: '/card-images.zip',
  jim: '/jim-illustrations.zip',
  jma: '/jma-card-images.zip',
  jiv: '/jiv-card-images.zip',
  vk: '/vk-card-images.zip',
  sk: '/sk-card-images.zip',
  sex: '/sex-card-images.zip',
};

async function loadZip(source: ZipSource): Promise<Map<string, string>> {
  if (zipCaches[source]) return zipCaches[source]!;
  if (zipPromises[source]) return zipPromises[source]!;

  zipPromises[source] = (async () => {
    const res = await fetch(ZIP_URLS[source]);
    const buf = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const map = new Map<string, string>();

    const entries: { path: string; entry: JSZip.JSZipObject }[] = [];
    zip.forEach((path, entry) => {
      if (!entry.dir) entries.push({ path, entry });
    });

    await Promise.all(
      entries.map(async ({ path, entry }) => {
        const blob = await entry.async('blob');
        const url = URL.createObjectURL(blob);
        map.set(path, url);
      })
    );

    zipCaches[source] = map;
    return map;
  })();

  return zipPromises[source]!;
}

/**
 * Returns a blob URL for the card's illustration, or null while loading / if not found.
 */
export function useCardImage(cardId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
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

    let cancelled = false;

    loadZip(mapping.zip).then((cache) => {
      if (cancelled) return;

      // Normalize Unicode (decomposed ↔ composed) + case-insensitive matching
      const norm = (s: string) => s.normalize('NFC').toLowerCase();
      const exactPath = mapping.folder
        ? `${mapping.folder}/${mapping.file}`
        : mapping.file;
      let blobUrl = cache.get(exactPath);

      if (!blobUrl) {
        const normFile = norm(mapping.file);
        const normFolder = norm(mapping.folder);
        for (const [key, val] of cache) {
          const normKey = norm(key);
          if (
            normKey.endsWith(`/${normFolder}/${normFile}`) ||
            normKey.endsWith(`/${normFile}`) ||
            normKey === normFile
          ) {
            blobUrl = val;
            break;
          }
        }
      }

      if (blobUrl && cardIdRef.current === cardId) {
        setUrl(blobUrl);
      }
    });

    return () => { cancelled = true; };
  }, [cardId]);

  return url;
}

/** Check if a card has an image mapped */
export function hasCardImage(cardId: string): boolean {
  return cardId in CARD_IMAGE_MAP;
}
