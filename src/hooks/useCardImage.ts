import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';

/**
 * Maps card IDs → filenames inside the zip.
 * Folder structure: ProductFolder/FILENAME_front.jpeg
 */
const CARD_IMAGE_MAP: Record<string, { folder: string; file: string }> = {
  // ── Jag i Mig ──
  'jim-trygg':      { folder: 'Jag_i_Mig', file: 'TRYGG_front.jpeg' },
  'jim-ensam':      { folder: 'Jag_i_Mig', file: 'ENSAM_front.jpeg' },
  'jim-stress':     { folder: 'Jag_i_Mig', file: 'STRESS_front.jpeg' },
  'jim-glad':       { folder: 'Jag_i_Mig', file: 'GLAD_front.jpeg' },
  'jim-ledsen':     { folder: 'Jag_i_Mig', file: 'LEDSEN_front.jpeg' },
  'jim-arg':        { folder: 'Jag_i_Mig', file: 'ARG_front.jpeg' },
  'jim-radd':       { folder: 'Jag_i_Mig', file: 'RÄDD_front.jpeg' },
  'jim-vild':       { folder: 'Jag_i_Mig', file: 'VILD_front.jpeg' },
  'jim-besviken':   { folder: 'Jag_i_Mig', file: 'BESVIKEN_front.jpeg' },
  'jim-acklad':     { folder: 'Jag_i_Mig', file: 'ÄCKLAD_front.jpeg' },
  'jim-avsky':      { folder: 'Jag_i_Mig', file: 'AVSKY_front.jpeg' },
  'jim-skam':       { folder: 'Jag_i_Mig', file: 'SKAM_front.jpeg' },
  'jim-avundsjuk':  { folder: 'Jag_i_Mig', file: 'AVUNDSJUK_front.jpeg' },
  'jim-svartsjuk':  { folder: 'Jag_i_Mig', file: 'SVARTSJUK_front.jpeg' },
  'jim-utanfor':    { folder: 'Jag_i_Mig', file: 'UTANFÖR_front.jpeg' },
  'jim-stolt':      { folder: 'Jag_i_Mig', file: 'STOLT_front.jpeg' },
  'jim-bestamd':    { folder: 'Jag_i_Mig', file: 'BESTÄMD_front.jpeg' },
  'jim-karlek':     { folder: 'Jag_i_Mig', file: 'KÄRLEK_front.jpeg' },
  'jim-nyfiken':    { folder: 'Jag_i_Mig', file: 'NYFIKEN_front.jpeg' },
  'jim-forvanad':   { folder: 'Jag_i_Mig', file: 'FÖRVÅNAD_front.jpeg' },
  'jim-jag':        { folder: 'Jag_i_Mig', file: 'JAG_front.jpeg' },

  // ── Jag med Andra (Kanslokort folder) ──
  'jma-vanskap':    { folder: 'Kanslokort', file: 'VÄNSKAP_front.jpeg' },
  'jma-kontakt':    { folder: 'Kanslokort', file: 'KONTAKT_front.jpeg' },
  'jma-annorlunda': { folder: 'Kanslokort', file: 'ANNORLUNDA_front.jpeg' },
  'jma-utanfor':    { folder: 'Kanslokort', file: 'UTANFÖR_front.jpeg' },
  'jma-duktig':     { folder: 'Kanslokort', file: 'DUKTIG_front.jpeg' },
  'jma-tavla':      { folder: 'Kanslokort', file: 'TÄVLA_front.jpeg' },
  'jma-utseende':   { folder: 'Kanslokort', file: 'UTSEENDE_front.jpeg' },
  'jma-avund':      { folder: 'Kanslokort', file: 'AVUND_front.jpeg' },
  'jma-konflikt':   { folder: 'Kanslokort', file: 'KONFLIKT_front.jpeg' },
  'jma-misslyckas': { folder: 'Kanslokort', file: 'MISSLYCKAS_front.jpeg' },
  'jma-kritik':     { folder: 'Kanslokort', file: 'KRITIK_front.jpeg' },
  'jma-skam':       { folder: 'Kanslokort', file: 'SKAM_front.jpeg' },
  'jma-skuld':      { folder: 'Kanslokort', file: 'SKULD_front.jpeg' },
  'jma-stopp':      { folder: 'Kanslokort', file: 'STOPP_front.jpeg' },
  'jma-integritet': { folder: 'Kanslokort', file: 'INTEGRITET_front.jpeg' },
  'jma-modig':      { folder: 'Kanslokort', file: 'MODIG_front.jpeg' },
  'jma-respekt':    { folder: 'Kanslokort', file: 'RESPEKT_front.jpeg' },
  'jma-sanning':    { folder: 'Kanslokort', file: 'SANNING_front.jpeg' },
  'jma-lika-varde': { folder: 'Kanslokort', file: 'LIKA_VÄRDE_front.jpeg' },
  'jma-acceptans':  { folder: 'Kanslokort', file: 'ACCEPTANS_front.jpeg' },
  'jma-kluringen':  { folder: 'Kanslokort', file: 'KLURINGEN_front.jpeg' },

  // ── Jag i Världen ──
  'jiv-halsa':        { folder: 'Jag_i_Varlden', file: 'HÄLSA_front.jpeg' },
  'jiv-prestation':   { folder: 'Jag_i_Varlden', file: 'PRESTATION_front.jpeg' },
  'jiv-bekraftelse':  { folder: 'Jag_i_Varlden', file: 'BEKRÄFTELSE_front.jpeg' },
  'jiv-sjalvkansla':  { folder: 'Jag_i_Varlden', file: 'SJÄLVKÄNSLA_front.jpeg' },
  'jiv-identitet':    { folder: 'Jag_i_Varlden', file: 'IDENTITET_front.jpeg' },
  'jiv-roller':       { folder: 'Jag_i_Varlden', file: 'ROLLER_front.jpeg' },
  'jiv-frihet':       { folder: 'Jag_i_Varlden', file: 'FRIHET_front.jpeg' },
  'jiv-karlek':       { folder: 'Jag_i_Varlden', file: 'KÄRLEK_front.jpeg' },
  'jiv-vanskap':      { folder: 'Jag_i_Varlden', file: 'VÄNSKAP_front.jpeg' },
  'jiv-kommunikation':{ folder: 'Jag_i_Varlden', file: 'KOMMUNIKATION_front.jpeg' },
  'jiv-konflikt':     { folder: 'Jag_i_Varlden', file: 'KONFLIKT_front.jpeg' },
  'jiv-medkansla':    { folder: 'Jag_i_Varlden', file: 'MEDKÄNSLA_front.jpeg' },
  'jiv-mobbning':     { folder: 'Jag_i_Varlden', file: 'MOBBNING_front.jpeg' },
  'jiv-fordomar':     { folder: 'Jag_i_Varlden', file: 'FÖRDOMAR_front.jpeg' },
  'jiv-social-media': { folder: 'Jag_i_Varlden', file: 'SOCIAL_MEDIA_front.jpeg' },
  'jiv-psykisk-ohalsa':{ folder: 'Jag_i_Varlden', file: 'PSYKISK_OHÄLSA_front.jpeg' },
  'jiv-sexualitet':   { folder: 'Jag_i_Varlden', file: 'SEXUALITET_front.jpeg' },
  'jiv-moral-etik':   { folder: 'Jag_i_Varlden', file: 'MORAL_og_ETIK_front.jpeg' },
  'jiv-aktivism':     { folder: 'Jag_i_Varlden', file: 'AKTIVISM_front.jpeg' },
  'jiv-existens':     { folder: 'Jag_i_Varlden', file: 'EXISTENS_front.jpeg' },

  // ── Vardagskort ──
  'vk-morgon':         { folder: 'Vardagskort', file: 'MORGON_front.jpeg' },
  'vk-rutiner':        { folder: 'Vardagskort', file: 'RUTINER_front.jpeg' },
  'vk-skola':          { folder: 'Vardagskort', file: 'SKOLA_front.jpeg' },
  'vk-hur-var-din-dag':{ folder: 'Vardagskort', file: 'HUR_VAR_DIN_DAG_front.jpeg' },
  'vk-kvall':          { folder: 'Vardagskort', file: 'KVÄLL_front.jpeg' },
  'vk-sova':           { folder: 'Vardagskort', file: 'SOVA_front.jpeg' },
  'vk-helg':           { folder: 'Vardagskort', file: 'HELG_front.jpeg' },
  'vk-mat':            { folder: 'Vardagskort', file: 'MAT_front.jpeg' },
  'vk-hushall':        { folder: 'Vardagskort', file: 'HUSHÅLL_front.jpeg' },
  'vk-syskon':         { folder: 'Vardagskort', file: 'SYSKON_front.jpeg' },
  'vk-underhallning':  { folder: 'Vardagskort', file: 'UNDERHÅLLNING_front.jpeg' },
  'vk-aktiviteter':    { folder: 'Vardagskort', file: 'AKTIVITETER_front.jpeg' },
  'vk-tonar':          { folder: 'Vardagskort', file: 'TONÅR_front.jpeg' },
  'vk-arbete':         { folder: 'Vardagskort', file: 'ARBETE_front.jpeg' },
  'vk-kompisar':       { folder: 'Vardagskort', file: 'KOMPISAR_front.jpeg' },

  // ── Sexualitetskort ──
  'sex-konsidentitet':    { folder: 'Sexualitetskort', file: 'KÖNSIDENTITET_front.jpeg' },
  'sex-sexuell-laggning': { folder: 'Sexualitetskort', file: 'SEXUELL_LÄGGNING_front.jpeg' },
  'sex-onani':            { folder: 'Sexualitetskort', file: 'ONANI_front.jpeg' },
  'sex-kroppsideal':      { folder: 'Sexualitetskort', file: 'KROPPSIDEAL_front.jpeg' },
  'sex-normer':           { folder: 'Sexualitetskort', file: 'NORMER_front.jpeg' },
  'sex-pornografi':       { folder: 'Sexualitetskort', file: 'PORNOGRAFI_front.jpeg' },
  'sex-sexuella-tabun':   { folder: 'Sexualitetskort', file: 'SEXUELLA_TABUN_front.jpeg' },
  'sex-sex-och-karlek':   { folder: 'Sexualitetskort', file: 'SEX_og_KÄRLEK_front.jpeg' },
  'sex-samtycke':         { folder: 'Sexualitetskort', file: 'SAMTYCKE_front.jpeg' },
  'sex-sex-och-ansvar':   { folder: 'Sexualitetskort', file: 'SEX_og_ANSVAR_front.jpeg' },
  'sex-sexuella-misstag': { folder: 'Sexualitetskort', file: 'SEXUELLA_MISSTAG_front.jpeg' },
  'sex-konsekvenser-av-sex':{ folder: 'Sexualitetskort', file: 'KONSEKVENSER_AV_SEX_front.jpeg' },
  'sex-sexuella-overgrepp':{ folder: 'Sexualitetskort', file: 'SEXUELLA_ÖVERGREPP_front.jpeg' },
  'sex-sex-som-hot':      { folder: 'Sexualitetskort', file: 'SEX_SOM_HOT_front.jpeg' },

  // ── Syskonkort ──
  'sk-att-fa-ett-syskon':  { folder: 'Syskonkort', file: 'ATT_FÅ_ETT_SYSKON_front.jpeg' },
  'sk-syskonminnen':       { folder: 'Syskonkort', file: 'SYSKONMINNEN_front.jpeg' },
  'sk-syskonkunskap':      { folder: 'Syskonkort', file: 'SYSKONKUNSKAP_front.jpeg' },
  'sk-vanskap':            { folder: 'Syskonkort', file: 'VÄNSKAP_front.jpeg' },
  'sk-unik':               { folder: 'Syskonkort', file: 'UNIK_front.jpeg' },
  'sk-aldst-mitten-yngst': { folder: 'Syskonkort', file: 'ÄLDST_MITTEN_front.jpeg' },
  'sk-bonussyskon':        { folder: 'Syskonkort', file: 'BONUSSYSKON_front.jpeg' },
  'sk-konflikt':           { folder: 'Syskonkort', file: 'KONFLIKT_front.jpeg' },
  'sk-dela':               { folder: 'Syskonkort', file: 'DELA_front.jpeg' },
  'sk-rattvisa':           { folder: 'Syskonkort', file: 'RÄTTVISA_front.jpeg' },
  'sk-uppmarksamhet':      { folder: 'Syskonkort', file: 'UPPMÄRKSAMHET_front.jpeg' },
  'sk-sjukdom':            { folder: 'Syskonkort', file: 'SJUKDOM_front.jpeg' },
  'sk-forlora-ett-syskon': { folder: 'Syskonkort', file: 'FÖRLORA_ETT_SYSKON_front.jpeg' },
  'sk-framtid':            { folder: 'Syskonkort', file: 'FRAMTID_front.jpeg' },
};

// Singleton: extracted blob URLs cached across hook instances
let zipCache: Map<string, string> | null = null;
let zipPromise: Promise<Map<string, string>> | null = null;

async function loadZip(): Promise<Map<string, string>> {
  if (zipCache) return zipCache;
  if (zipPromise) return zipPromise;

  zipPromise = (async () => {
    const res = await fetch('/card-images.zip');
    const buf = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const map = new Map<string, string>();

    // Build a lookup: normalised "folder/file" → zip entry
    const entries: { path: string; entry: JSZip.JSZipObject }[] = [];
    zip.forEach((path, entry) => {
      if (!entry.dir) entries.push({ path, entry });
    });

    // Extract all images in parallel
    await Promise.all(
      entries.map(async ({ path, entry }) => {
        const blob = await entry.async('blob');
        const url = URL.createObjectURL(blob);
        map.set(path, url);
      })
    );

    zipCache = map;
    return map;
  })();

  return zipPromise;
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

    loadZip().then((cache) => {
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
