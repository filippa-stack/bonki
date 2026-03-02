import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';

/**
 * Which zip file a card image lives in.
 * 'default' = /card-images.zip, 'jim' = /jim-illustrations.zip
 */
type ZipSource = 'default' | 'jim';

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

  // ── Jag med Andra (Kanslokort folder) ──
  'jma-vanskap':    { zip: 'default', folder: 'Kanslokort', file: 'VÄNSKAP_front.jpeg' },
  'jma-kontakt':    { zip: 'default', folder: 'Kanslokort', file: 'KONTAKT_front.jpeg' },
  'jma-annorlunda': { zip: 'default', folder: 'Kanslokort', file: 'ANNORLUNDA_front.jpeg' },
  'jma-utanfor':    { zip: 'default', folder: 'Kanslokort', file: 'UTANFÖR_front.jpeg' },
  'jma-duktig':     { zip: 'default', folder: 'Kanslokort', file: 'DUKTIG_front.jpeg' },
  'jma-tavla':      { zip: 'default', folder: 'Kanslokort', file: 'TÄVLA_front.jpeg' },
  'jma-utseende':   { zip: 'default', folder: 'Kanslokort', file: 'UTSEENDE_front.jpeg' },
  'jma-avund':      { zip: 'default', folder: 'Kanslokort', file: 'AVUND_front.jpeg' },
  'jma-konflikt':   { zip: 'default', folder: 'Kanslokort', file: 'KONFLIKT_front.jpeg' },
  'jma-misslyckas': { zip: 'default', folder: 'Kanslokort', file: 'MISSLYCKAS_front.jpeg' },
  'jma-kritik':     { zip: 'default', folder: 'Kanslokort', file: 'KRITIK_front.jpeg' },
  'jma-skam':       { zip: 'default', folder: 'Kanslokort', file: 'SKAM_front.jpeg' },
  'jma-skuld':      { zip: 'default', folder: 'Kanslokort', file: 'SKULD_front.jpeg' },
  'jma-stopp':      { zip: 'default', folder: 'Kanslokort', file: 'STOPP_front.jpeg' },
  'jma-integritet': { zip: 'default', folder: 'Kanslokort', file: 'INTEGRITET_front.jpeg' },
  'jma-modig':      { zip: 'default', folder: 'Kanslokort', file: 'MODIG_front.jpeg' },
  'jma-respekt':    { zip: 'default', folder: 'Kanslokort', file: 'RESPEKT_front.jpeg' },
  'jma-sanning':    { zip: 'default', folder: 'Kanslokort', file: 'SANNING_front.jpeg' },
  'jma-lika-varde': { zip: 'default', folder: 'Kanslokort', file: 'LIKA_VÄRDE_front.jpeg' },
  'jma-acceptans':  { zip: 'default', folder: 'Kanslokort', file: 'ACCEPTANS_front.jpeg' },
  'jma-kluringen':  { zip: 'default', folder: 'Kanslokort', file: 'KLURINGEN_front.jpeg' },

  // ── Jag i Världen ──
  'jiv-halsa':        { zip: 'default', folder: 'Jag_i_Varlden', file: 'HÄLSA_front.jpeg' },
  'jiv-prestation':   { zip: 'default', folder: 'Jag_i_Varlden', file: 'PRESTATION_front.jpeg' },
  'jiv-bekraftelse':  { zip: 'default', folder: 'Jag_i_Varlden', file: 'BEKRÄFTELSE_front.jpeg' },
  'jiv-sjalvkansla':  { zip: 'default', folder: 'Jag_i_Varlden', file: 'SJÄLVKÄNSLA_front.jpeg' },
  'jiv-identitet':    { zip: 'default', folder: 'Jag_i_Varlden', file: 'IDENTITET_front.jpeg' },
  'jiv-roller':       { zip: 'default', folder: 'Jag_i_Varlden', file: 'ROLLER_front.jpeg' },
  'jiv-frihet':       { zip: 'default', folder: 'Jag_i_Varlden', file: 'FRIHET_front.jpeg' },
  'jiv-karlek':       { zip: 'default', folder: 'Jag_i_Varlden', file: 'KÄRLEK_front.jpeg' },
  'jiv-vanskap':      { zip: 'default', folder: 'Jag_i_Varlden', file: 'VÄNSKAP_front.jpeg' },
  'jiv-kommunikation':{ zip: 'default', folder: 'Jag_i_Varlden', file: 'KOMMUNIKATION_front.jpeg' },
  'jiv-konflikt':     { zip: 'default', folder: 'Jag_i_Varlden', file: 'KONFLIKT_front.jpeg' },
  'jiv-medkansla':    { zip: 'default', folder: 'Jag_i_Varlden', file: 'MEDKÄNSLA_front.jpeg' },
  'jiv-mobbning':     { zip: 'default', folder: 'Jag_i_Varlden', file: 'MOBBNING_front.jpeg' },
  'jiv-fordomar':     { zip: 'default', folder: 'Jag_i_Varlden', file: 'FÖRDOMAR_front.jpeg' },
  'jiv-social-media': { zip: 'default', folder: 'Jag_i_Varlden', file: 'SOCIAL_MEDIA_front.jpeg' },
  'jiv-psykisk-ohalsa':{ zip: 'default', folder: 'Jag_i_Varlden', file: 'PSYKISK_OHÄLSA_front.jpeg' },
  'jiv-sexualitet':   { zip: 'default', folder: 'Jag_i_Varlden', file: 'SEXUALITET_front.jpeg' },
  'jiv-moral-etik':   { zip: 'default', folder: 'Jag_i_Varlden', file: 'MORAL_og_ETIK_front.jpeg' },
  'jiv-aktivism':     { zip: 'default', folder: 'Jag_i_Varlden', file: 'AKTIVISM_front.jpeg' },
  'jiv-existens':     { zip: 'default', folder: 'Jag_i_Varlden', file: 'EXISTENS_front.jpeg' },

  // ── Vardagskort ──
  'vk-morgon':         { zip: 'default', folder: 'Vardagskort', file: 'MORGON_front.jpeg' },
  'vk-rutiner':        { zip: 'default', folder: 'Vardagskort', file: 'RUTINER_front.jpeg' },
  'vk-skola':          { zip: 'default', folder: 'Vardagskort', file: 'SKOLA_front.jpeg' },
  'vk-hur-var-din-dag':{ zip: 'default', folder: 'Vardagskort', file: 'HUR_VAR_DIN_DAG_front.jpeg' },
  'vk-kvall':          { zip: 'default', folder: 'Vardagskort', file: 'KVÄLL_front.jpeg' },
  'vk-sova':           { zip: 'default', folder: 'Vardagskort', file: 'SOVA_front.jpeg' },
  'vk-helg':           { zip: 'default', folder: 'Vardagskort', file: 'HELG_front.jpeg' },
  'vk-mat':            { zip: 'default', folder: 'Vardagskort', file: 'MAT_front.jpeg' },
  'vk-hushall':        { zip: 'default', folder: 'Vardagskort', file: 'HUSHÅLL_front.jpeg' },
  'vk-syskon':         { zip: 'default', folder: 'Vardagskort', file: 'SYSKON_front.jpeg' },
  'vk-underhallning':  { zip: 'default', folder: 'Vardagskort', file: 'UNDERHÅLLNING_front.jpeg' },
  'vk-aktiviteter':    { zip: 'default', folder: 'Vardagskort', file: 'AKTIVITETER_front.jpeg' },
  'vk-tonar':          { zip: 'default', folder: 'Vardagskort', file: 'TONÅR_front.jpeg' },
  'vk-arbete':         { zip: 'default', folder: 'Vardagskort', file: 'ARBETE_front.jpeg' },
  'vk-kompisar':       { zip: 'default', folder: 'Vardagskort', file: 'KOMPISAR_front.jpeg' },

  // ── Sexualitetskort ──
  'sex-konsidentitet':    { zip: 'default', folder: 'Sexualitetskort', file: 'KÖNSIDENTITET_front.jpeg' },
  'sex-sexuell-laggning': { zip: 'default', folder: 'Sexualitetskort', file: 'SEXUELL_LÄGGNING_front.jpeg' },
  'sex-onani':            { zip: 'default', folder: 'Sexualitetskort', file: 'ONANI_front.jpeg' },
  'sex-kroppsideal':      { zip: 'default', folder: 'Sexualitetskort', file: 'KROPPSIDEAL_front.jpeg' },
  'sex-normer':           { zip: 'default', folder: 'Sexualitetskort', file: 'NORMER_front.jpeg' },
  'sex-pornografi':       { zip: 'default', folder: 'Sexualitetskort', file: 'PORNOGRAFI_front.jpeg' },
  'sex-sexuella-tabun':   { zip: 'default', folder: 'Sexualitetskort', file: 'SEXUELLA_TABUN_front.jpeg' },
  'sex-sex-och-karlek':   { zip: 'default', folder: 'Sexualitetskort', file: 'SEX_og_KÄRLEK_front.jpeg' },
  'sex-samtycke':         { zip: 'default', folder: 'Sexualitetskort', file: 'SAMTYCKE_front.jpeg' },
  'sex-sex-och-ansvar':   { zip: 'default', folder: 'Sexualitetskort', file: 'SEX_og_ANSVAR_front.jpeg' },
  'sex-sexuella-misstag': { zip: 'default', folder: 'Sexualitetskort', file: 'SEXUELLA_MISSTAG_front.jpeg' },
  'sex-konsekvenser-av-sex':{ zip: 'default', folder: 'Sexualitetskort', file: 'KONSEKVENSER_AV_SEX_front.jpeg' },
  'sex-sexuella-overgrepp':{ zip: 'default', folder: 'Sexualitetskort', file: 'SEXUELLA_ÖVERGREPP_front.jpeg' },
  'sex-sex-som-hot':      { zip: 'default', folder: 'Sexualitetskort', file: 'SEX_SOM_HOT_front.jpeg' },

  // ── Syskonkort ──
  'sk-att-fa-ett-syskon':  { zip: 'default', folder: 'Syskonkort', file: 'ATT_FÅ_ETT_SYSKON_front.jpeg' },
  'sk-syskonminnen':       { zip: 'default', folder: 'Syskonkort', file: 'SYSKONMINNEN_front.jpeg' },
  'sk-syskonkunskap':      { zip: 'default', folder: 'Syskonkort', file: 'SYSKONKUNSKAP_front.jpeg' },
  'sk-vanskap':            { zip: 'default', folder: 'Syskonkort', file: 'VÄNSKAP_front.jpeg' },
  'sk-unik':               { zip: 'default', folder: 'Syskonkort', file: 'UNIK_front.jpeg' },
  'sk-aldst-mitten-yngst': { zip: 'default', folder: 'Syskonkort', file: 'ÄLDST_MITTEN_front.jpeg' },
  'sk-bonussyskon':        { zip: 'default', folder: 'Syskonkort', file: 'BONUSSYSKON_front.jpeg' },
  'sk-konflikt':           { zip: 'default', folder: 'Syskonkort', file: 'KONFLIKT_front.jpeg' },
  'sk-dela':               { zip: 'default', folder: 'Syskonkort', file: 'DELA_front.jpeg' },
  'sk-rattvisa':           { zip: 'default', folder: 'Syskonkort', file: 'RÄTTVISA_front.jpeg' },
  'sk-uppmarksamhet':      { zip: 'default', folder: 'Syskonkort', file: 'UPPMÄRKSAMHET_front.jpeg' },
  'sk-sjukdom':            { zip: 'default', folder: 'Syskonkort', file: 'SJUKDOM_front.jpeg' },
  'sk-forlora-ett-syskon': { zip: 'default', folder: 'Syskonkort', file: 'FÖRLORA_ETT_SYSKON_front.jpeg' },
  'sk-framtid':            { zip: 'default', folder: 'Syskonkort', file: 'FRAMTID_front.jpeg' },
};

// Singleton caches per zip source
const zipCaches: Record<ZipSource, Map<string, string> | null> = { default: null, jim: null };
const zipPromises: Record<ZipSource, Promise<Map<string, string>> | null> = { default: null, jim: null };

const ZIP_URLS: Record<ZipSource, string> = {
  default: '/card-images.zip',
  jim: '/jim-illustrations.zip',
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
    const mapping = CARD_IMAGE_MAP[cardId];
    if (!mapping) return;

    let cancelled = false;

    loadZip(mapping.zip).then((cache) => {
      if (cancelled) return;

      // Try exact path first, then search by filename
      const exactPath = `${mapping.folder}/${mapping.file}`;
      let blobUrl = cache.get(exactPath);

      if (!blobUrl) {
        // Some zips add a root folder — search by suffix
        for (const [key, val] of cache) {
          if (key.endsWith(`/${mapping.folder}/${mapping.file}`) || key.endsWith(`${mapping.file}`)) {
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
