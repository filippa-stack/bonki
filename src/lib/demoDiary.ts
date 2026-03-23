interface DemoDiaryEntry {
  cardId: string;
  text: string;
  date: string;
  entryKey?: string;
  type: 'reflection';
}

interface UpsertDemoDiaryEntryParams {
  productId: string;
  cardId: string;
  text: string;
  entryKey?: string;
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
  entryKey,
  mode = 'replace',
}: UpsertDemoDiaryEntryParams): void {
  const nextText = text.trim();
  if (!productId || !cardId || !nextText) return;

  try {
    const key = `bonki-demo-diary-${productId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as DemoDiaryEntry[];

    const entry: DemoDiaryEntry = {
      cardId,
      text: nextText,
      date: new Date().toISOString(),
      entryKey,
      type: 'reflection',
    };

    const keyMatchIndex = entryKey
      ? existing.findIndex((item) => item.cardId === cardId && item.entryKey === entryKey)
      : -1;

    if (mode === 'append') {
      if (keyMatchIndex >= 0) {
        const previous = existing[keyMatchIndex];
        existing[keyMatchIndex] = {
          ...previous,
          text: mergeBlocks(previous.text, nextText),
          date: entry.date,
        };
      } else {
        const duplicateIndex = existing.findIndex(
          (item) => item.cardId === cardId && item.text.trim() === nextText
        );

        if (duplicateIndex >= 0) {
          existing[duplicateIndex] = {
            ...existing[duplicateIndex],
            date: entry.date,
            entryKey: existing[duplicateIndex].entryKey ?? entryKey,
          };
        } else {
          existing.unshift(entry);
        }
      }
    } else {
      const replaceIndex = keyMatchIndex >= 0
        ? keyMatchIndex
        : existing.findIndex((item) => item.cardId === cardId);

      if (replaceIndex >= 0) {
        existing[replaceIndex] = entry;
      } else {
        existing.unshift(entry);
      }
    }

    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // Ignore demo storage failures silently.
  }
}