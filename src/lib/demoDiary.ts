interface DemoDiaryEntry {
  cardId: string;
  text: string;
  date: string;
  type: 'reflection';
}

interface UpsertDemoDiaryEntryParams {
  productId: string;
  cardId: string;
  text: string;
  mode?: 'replace' | 'append';
}

function splitBlocks(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function mergeBlocks(existingText: string, nextText: string): string {
  const blocks = splitBlocks(existingText);

  for (const block of splitBlocks(nextText)) {
    if (!blocks.includes(block)) {
      blocks.push(block);
    }
  }

  return blocks.join('\n\n');
}

export function upsertDemoDiaryEntry({
  productId,
  cardId,
  text,
  mode = 'replace',
}: UpsertDemoDiaryEntryParams): void {
  const nextText = text.trim();
  if (!productId || !cardId || !nextText) return;

  try {
    const key = `bonki-demo-diary-${productId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as DemoDiaryEntry[];
    const idx = existing.findIndex((entry) => entry.cardId === cardId);
    const previous = idx >= 0 ? existing[idx] : null;
    const mergedText = mode === 'append'
      ? mergeBlocks(previous?.text ?? '', nextText)
      : nextText;

    const entry: DemoDiaryEntry = {
      cardId,
      text: mergedText,
      date: new Date().toISOString(),
      type: 'reflection',
    };

    if (idx >= 0) {
      existing[idx] = entry;
    } else {
      existing.unshift(entry);
    }

    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // Ignore demo storage failures silently.
  }
}