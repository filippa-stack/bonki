import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import illustrationImage from '@/assets/illustration-sexualitet.png';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import KidsProductHomeLayout from '@/components/KidsProductHomeLayout';

const ACCENT_COLOR = '#D88A90';
const TILE_LIGHT = '#A3434B';
const TILE_MID = '#6A2A30';
const TILE_DEEP = '#4A1A20';

const ORDERED_TILES = [
  { id: 'sex-min-identitet', bg: TILE_LIGHT, sub: 'Vem du är och blir' },
  { id: 'sex-normer-och-paverkan', bg: '#5E242A', sub: 'Det som formar oss' },
  { id: 'sex-relation-och-ansvar', bg: TILE_MID, sub: 'Att ta hand om sig själv och andra' },
  { id: 'sex-skydd-och-makt', bg: TILE_DEEP, sub: 'Gränser och rättigheter' },
];

export default function SexualitetProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  return (
    <KidsProductHomeLayout
      product={product}
      progress={progress}
      title="Sexualitet"
      subtitle="Kropp, gränser och identitet"
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
              objectPosition: '60% 20%',
            }}
          />
        </motion.div>
      }
    />
  );
}
