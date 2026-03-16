import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import illustrationImage from '@/assets/illustration-syskon.png';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import KidsProductHomeLayout from '@/components/KidsProductHomeLayout';

const ACCENT_COLOR = '#6ABFBD';
const TILE_LIGHT = '#247A78';
const TILE_MID = '#1A5A58';
const TILE_DEEP = '#0E4442';

const ORDERED_TILES = [
  { id: 'sk-vi-blev-syskon', bg: TILE_LIGHT, sub: 'När familjen växer' },
  { id: 'sk-vi-ar-olika', bg: '#165452', sub: 'Att vara egen fast vi hör ihop' },
  { id: 'sk-delat-utrymme', bg: TILE_MID, sub: 'När allting ska delas' },
  { id: 'sk-er-relation', bg: TILE_DEEP, sub: 'Nära, svårt och allt däremellan' },
];

export default function SyskonProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  return (
    <KidsProductHomeLayout
      product={product}
      progress={progress}
      title="Syskon"
      subtitle="Band för livet"
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
              objectPosition: '65% 15%',
            }}
          />
        </motion.div>
      }
    />
  );
}
