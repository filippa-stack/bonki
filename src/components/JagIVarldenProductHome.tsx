import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import peacockImage from '@/assets/peacock-jag-i-varlden.png';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import KidsProductHomeLayout from '@/components/KidsProductHomeLayout';

const ACCENT_COLOR = '#6ABF78';
const TILE_LIGHT = '#2D6E3A';
const TILE_MID = '#1A4A24';
const TILE_DEEP = '#2A3A1E';

const ORDERED_TILES = [
  { id: 'jiv-min-vardag', bg: TILE_LIGHT, sub: 'Det som fyller dina dagar' },
  { id: 'jiv-vem-jag-ar', bg: '#1E5026', sub: 'Det som förändras just nu' },
  { id: 'jiv-jag-och-andra', bg: TILE_MID, sub: 'Hur vi påverkar varandra' },
  { id: 'jiv-jag-i-samhallet', bg: '#14381A', sub: 'Normer, rättvisa och din röst' },
  { id: 'jiv-det-stora-sammanhanget', bg: '#0E2C12', sub: 'Bortom det du ser' },
];

export default function JagIVarldenProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  return (
    <KidsProductHomeLayout
      product={product}
      progress={progress}
      title="Jag i världen"
      subtitle="De stora frågorna"
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
            src={peacockImage}
            alt=""
            style={{
              width: '140%',
              height: '140%',
              objectFit: 'cover',
              objectPosition: '60% 30%',
            }}
          />
        </motion.div>
      }
    />
  );
}
