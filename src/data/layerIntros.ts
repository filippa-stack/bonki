/**
 * Still Us v3.0 — Layer intro sentences.
 * Shown when a couple enters a new layer for the first time.
 * 5 layers matching stillUsTokens.ts LAYER_COLORS.
 */

export interface LayerIntro {
  layerIndex: number;
  name: string;
  intro: string;
}

const layerIntros: LayerIntro[] = [
  { layerIndex: 0, name: 'Grunden', intro: 'Ni börjar med det mest grundläggande — vad ni är för varandra.' },
  { layerIndex: 1, name: 'Normen', intro: 'Nu går ni djupare in i det som pågår under ytan.' },
  { layerIndex: 2, name: 'Konflikten', intro: 'Här möter ni det som kan vara svårt att prata om.' },
  { layerIndex: 3, name: 'Längtan', intro: 'Ni utforskar det som öppnar upp er relation.' },
  { layerIndex: 4, name: 'Valet', intro: 'De sista veckorna handlar om vart ni är på väg.' },
];

export function getLayerIntro(layerIndex: number): LayerIntro | undefined {
  return layerIntros.find((l) => l.layerIndex === layerIndex);
}

export default layerIntros;
