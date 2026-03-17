/**
 * Still Us v2.5 — Layer intro sentences.
 * Shown when a couple enters a new layer for the first time.
 */

export interface LayerIntro {
  layerIndex: number;
  name: string;
  intro: string;
}

const layerIntros: LayerIntro[] = [
  { layerIndex: 0, name: 'Grunden', intro: 'Ni börjar med det mest grundläggande — vad ni är för varandra.' },
  { layerIndex: 1, name: 'Det inre', intro: 'Nu går ni djupare in i det som pågår under ytan.' },
  { layerIndex: 2, name: 'Det svåra', intro: 'Här möter ni det som kan vara svårt att prata om.' },
  { layerIndex: 3, name: 'Det öppna', intro: 'Ni utforskar det som öppnar upp er relation.' },
  { layerIndex: 4, name: 'Framåt', intro: 'De sista veckorna handlar om vart ni är på väg.' },
];

export function getLayerIntro(layerIndex: number): LayerIntro | undefined {
  return layerIntros.find((l) => l.layerIndex === layerIndex);
}

export default layerIntros;
