import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import illustrationImage from '@/assets/illustration-vardag.png';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import KidsProductHomeLayout from '@/components/KidsProductHomeLayout';

const ACCENT_COLOR = '#4DA8D4';
const TILE_LIGHT = '#0E6B99';
const TILE_MID = '#0A4A6A';
const TILE_DEEP = '#063450';

const ORDERED_TILES = [
  { id: 'vk-min-dag', bg: TILE_LIGHT, sub: 'Från morgon till kväll' },
  { id: 'vk-var-rytm', bg: '#0A4E68', sub: 'Vanor och rutiner' },
  { id: 'vk-vi-hemma', bg: TILE_MID, sub: 'Allt som händer innanför dörren' },
  { id: 'vk-utanfor-hemmet', bg: TILE_DEEP, sub: 'Det du möter där ute' },
];

export default function VardagProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  return (
    <KidsProductHomeLayout
      product={product}
      progress={progress}
      title="Vardag"
      subtitle="Det vanliga, på djupet"
      accentColor={ACCENT_COLOR}
      tileLight={TILE_LIGHT}
      tileMid={TILE_MID}
      tileDeep={TILE_DEEP}
      orderedTiles={ORDERED_TILES}
      illustrationContent={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: [1, 1.012, 1] }}
          transition={{
            duration: 0.5,
            scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
          }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
        >
          <img
            src={illustrationImage}
            alt=""
            style={{
              width: '130%',
              height: '130%',
              objectFit: 'cover',
              objectPosition: '70% 20%',
            }}
          />
        </motion.div>
      }
    />
  );
}
