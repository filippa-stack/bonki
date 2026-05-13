/**
 * ProductCardTile — single card tile for the kids product home grid.
 *
 * Composition delegated to <KidsTileFrame>: outer frame (product color) +
 * inner zone (tonal interior variant assigned deterministically by cardId)
 * + title strip with serif title in product dark text.
 *
 * Tap → /product/:slug/portal/:categoryId?card=:cardId
 */

import { useNavigate } from 'react-router-dom';
import type { Card } from '@/types';
import { useCardImage } from '@/hooks/useCardImage';
import { productDarkText } from '@/lib/palette';
import { getInteriorForCard } from '@/lib/productTileVariants';
import KidsTileFrame from '@/components/KidsTileFrame';

interface ProductCardTileProps {
  card: Card;
  /** Outer frame color — product anchor (typically product.tileLight). */
  tileBg: string;
  isCompleted: boolean;
  productSlug: string;
  /** Product id used to look up variant table + dark text. */
  productId: string;
  /** Position index of this card in the product's grid (drives interior variant). */
  positionIndex: number;
  /** Legacy prop kept for compatibility — dark text now resolved per-product. */
  darkText?: boolean;
}

export default function ProductCardTile({
  card,
  tileBg,
  isCompleted,
  productSlug,
  productId,
  positionIndex,
}: ProductCardTileProps) {
  const navigate = useNavigate();
  const tileImage = useCardImage(card.id);

  const interior = getInteriorForCard(productId, positionIndex, tileBg);
  const titleColor = productDarkText[productId] ?? '#5A3A1F';

  return (
    <KidsTileFrame
      frame={tileBg}
      interior={interior}
      title={card.title}
      darkText={titleColor}
      completed={isCompleted}
      ariaLabel={card.title}
      onClick={() => navigate(`/product/${productSlug}/portal/${card.categoryId}?card=${card.id}`)}
    >
      {tileImage && (
        <img
          src={tileImage}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={400}
          height={400}
          style={{
            position: 'absolute',
            inset: 12,
            width: 'calc(100% - 24px)',
            height: 'calc(100% - 24px)',
            objectFit: 'contain',
            objectPosition: 'center',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
          }}
        />
      )}
    </KidsTileFrame>
  );
}
