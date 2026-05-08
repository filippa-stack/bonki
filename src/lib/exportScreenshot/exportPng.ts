import { toPng } from 'html-to-image';

/** Wait until the document fonts (Fraunces et al) are ready before snapshotting. */
async function waitForFonts() {
  if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
    try { await (document as any).fonts.ready; } catch { /* noop */ }
  }
  // One extra tick lets layout settle.
  await new Promise((r) => setTimeout(r, 50));
}

/** Wait until every <img> in the node has finished loading. */
async function waitForImages(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            }),
    ),
  );
}

export async function exportNodeToPng(
  node: HTMLElement,
  filename: string,
  width: number,
  height: number,
) {
  await waitForFonts();
  await waitForImages(node);

  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    backgroundColor: undefined,
    style: {
      transform: 'none',
      transformOrigin: 'top left',
    },
  });

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
