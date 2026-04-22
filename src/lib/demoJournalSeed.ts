/**
 * Seeds the demo journal with editorial mock entries — for App Store gallery
 * captures only. Triggered by `?demo=1&seed=1`.
 *
 * Writes directly to the same localStorage keys the Journal already reads
 * (`bonki-demo-diary-{productId}`). No UI logic changes required.
 *
 * Idempotent: only seeds when the keys are empty AND `seed=1` is present.
 */

interface SeedEntry {
  productId: string;
  cardId: string;
  text: string;
  /** ISO date — the Journal sorts by this descending */
  daysAgo: number;
  /** Optional entryKey: 'step-{stepIndex}-prompt-{promptIndex}' enables
   *  questionText resolution in the timeline. */
  entryKey?: string;
}

const SEED: SeedEntry[] = [
  {
    productId: 'still_us',
    cardId: 'su-mock-0',
    text: 'I går när vi satt på balkongen och du skrattade åt något jag knappt minns. Det var där.',
    daysAgo: 1,
    entryKey: 'step-0-prompt-1',
  },
  {
    productId: 'jag_i_mig',
    cardId: 'jim-trygg',
    text: 'När hon sa att hon kände sig trygg när vi sov i samma säng — det var första gången hon satte ord på det själv.',
    daysAgo: 4,
    entryKey: 'step-0-prompt-0',
  },
  {
    productId: 'still_us',
    cardId: 'su-mock-1',
    text: 'Vi pratade länge om hur vi vill att helgerna ska kännas. Inte schemalagda. Bara nära.',
    daysAgo: 9,
    entryKey: 'step-0-prompt-0',
  },
  {
    productId: 'vardagskort',
    cardId: 'vk-konflikt',
    text: 'Hon ville inte säga något först. Sen kom det: "jag blir ledsen när du inte tittar på mig när jag pratar."',
    daysAgo: 14,
    entryKey: 'step-0-prompt-0',
  },
  {
    productId: 'still_us',
    cardId: 'su-mock-2',
    text: 'Det vi bär med oss hemifrån är inte alltid det vi vill ge vidare. Men vi kan välja.',
    daysAgo: 21,
    entryKey: 'step-0-prompt-1',
  },
];

const SEED_FLAG_KEY = 'bonki-demo-journal-seeded';

export function maybeSeedDemoJournal(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') !== '1' || params.get('seed') !== '1') return;

  // Re-seed every time `seed=1` is present so captures stay deterministic
  try {
    // Group entries by product
    const byProduct = new Map<string, SeedEntry[]>();
    for (const entry of SEED) {
      const arr = byProduct.get(entry.productId) ?? [];
      arr.push(entry);
      byProduct.set(entry.productId, arr);
    }

    const now = Date.now();
    for (const [productId, entries] of byProduct.entries()) {
      const key = `bonki-demo-diary-${productId}`;
      const stored = entries.map((e) => ({
        cardId: e.cardId,
        text: e.text,
        date: new Date(now - e.daysAgo * 86_400_000).toISOString(),
        entryKey: e.entryKey,
        type: 'reflection' as const,
      }));
      localStorage.setItem(key, JSON.stringify(stored));
    }

    localStorage.setItem(SEED_FLAG_KEY, '1');
  } catch {
    // Demo storage failures are non-fatal
  }
}
