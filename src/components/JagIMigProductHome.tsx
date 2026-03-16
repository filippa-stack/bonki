import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import KidsProductHomeLayout from '@/components/KidsProductHomeLayout';

const ACCENT_COLOR = '#A8B84C';
const TILE_LIGHT = '#657514';
const TILE_MID = '#4A5A0A';
const TILE_DEEP = '#3E4A12';

const ORDERED_TILES = [
  { id: 'jim-mina-kanslor', bg: TILE_LIGHT, sub: 'Att känna igen dem' },
  { id: 'jim-starka-kanslor', bg: TILE_MID, sub: 'När det blir mycket' },
  { id: 'jim-stora-kanslor', bg: TILE_DEEP, sub: 'Känslor med många lager' },
];

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  return (
    <KidsProductHomeLayout
      product={product}
      progress={progress}
      title="Jag i mig"
      subtitle="När känslor får ord"
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
            src={apaImage}
            alt=""
            style={{
              width: '130%',
              height: '130%',
              objectFit: 'cover',
              objectPosition: '30% 20%',
            }}
          />
        </motion.div>
      }
    />
  );
}
