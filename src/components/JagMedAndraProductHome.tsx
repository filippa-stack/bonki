import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import slothImage from '@/assets/sloth-jag-med-andra.png';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import KidsProductHomeLayout from '@/components/KidsProductHomeLayout';

const ACCENT_COLOR = '#C77AE8';
const TILE_LIGHT = '#8B2FC6';
const TILE_MID = '#5A1A80';
const TILE_DEEP = '#4A1268';

const ORDERED_TILES = [
  { id: 'jma-att-hora-till', bg: '#6E2498', sub: 'Var hör jag hemma?' },
  { id: 'jma-nar-vi-jamfor-oss', bg: TILE_MID, sub: 'Vad det gör med oss' },
  { id: 'jma-nar-det-skaver', bg: TILE_DEEP, sub: 'När vi sårar varandra' },
  { id: 'jma-att-sta-stadig', bg: '#3A0E58', sub: 'Din egen grund' },
  { id: 'jma-vi-i-varlden', bg: '#2A0840', sub: 'Utanför oss själva' },
];

export default function JagMedAndraProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  return (
    <KidsProductHomeLayout
      product={product}
      progress={progress}
      title="Jag med andra"
      subtitle="Det svåra och det trygga"
      accentColor={ACCENT_COLOR}
      tileLight={TILE_LIGHT}
      tileMid={TILE_MID}
      tileDeep={TILE_DEEP}
      orderedTiles={ORDERED_TILES}
      illustrationContent={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: [1, 1.015, 1] }}
          transition={{
            duration: 0.6,
            scale: { duration: 8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
          }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
        >
          <img
            src={slothImage}
            alt=""
            style={{
              width: '140%',
              height: '140%',
              objectFit: 'cover',
              objectPosition: '25% 15%',
            }}
          />
        </motion.div>
      }
    />
  );
}
