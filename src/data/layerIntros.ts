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
  { layerIndex: 0, name: 'Grunden', intro: 'Grunden ni står på — det som bär er, och det som saknas.' },
  { layerIndex: 1, name: 'Normen', intro: 'Reglerna ni lever efter — de uttalade och de tysta.' },
  { layerIndex: 2, name: 'Konflikten', intro: 'Det som skaver — det ni undviker, och det ni behöver möta.' },
  { layerIndex: 3, name: 'Längtan', intro: 'Det som driver er — önskningar, drömmar och det som kostar.' },
  { layerIndex: 4, name: 'Valet', intro: 'Det ni väljer — att stanna, att förändra, att fortsätta välja.' },
];

export function getLayerIntro(layerIndex: number): LayerIntro | undefined {
  return layerIntros.find((l) => l.layerIndex === layerIndex);
}

export default layerIntros;
