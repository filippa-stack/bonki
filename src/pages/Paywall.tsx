import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { COLORS, getLayerForCard } from '@/lib/stillUsTokens';
import sliderPrompts from '@/data/sliderPrompts';

const layers = [
  { name: 'Grunden', cards: sliderPrompts.slice(1, 4) },
  { name: 'Normen', cards: sliderPrompts.slice(4, 9) },
  { name: 'Konflikten', cards: sliderPrompts.slice(9, 14) },
  { name: 'Längtan', cards: sliderPrompts.slice(14, 18) },
  { name: 'Valet', cards: sliderPrompts.slice(18, 22) },
];

const layerStartIndices = [1, 4, 9, 14, 18];

export default function Paywall() {
  const navigate = useNavigate();

  const handlePurchase = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('couple_state')
      .update({
        purchase_status: 'purchased',
        purchased_by: user.id,
      })
      .eq('initiator_id', user.id);

    navigate('/');
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.emberNight,
      color: COLORS.lanternGlow,
      padding: '48px 24px 40px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        {/* Journey preview */}
        {layers.map((layer, li) => {
          const layerInfo = getLayerForCard(layerStartIndices[li]);
          return (
            <div key={layer.name} style={{ marginBottom: '24px' }}>
              <div style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '18px',
                color: layerInfo.color,
                marginBottom: '8px',
              }}>
                {layer.name}
              </div>
              {layer.cards.map((card, ci) => (
                <div key={ci} style={{
                  fontSize: '14px',
                  color: COLORS.driftwoodBody,
                  padding: '4px 0',
                  paddingLeft: '12px',
                  borderLeft: `2px solid ${layerInfo.color}33`,
                }}>
                  {card.cardTitle}
                </div>
              ))}
            </div>
          );
        })}

        {/* Pricing */}
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          paddingTop: '32px',
          borderTop: `1px solid ${COLORS.emberMid}`,
        }}>
          <div style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '36px',
            color: COLORS.lanternGlow,
            marginBottom: '4px',
          }}>
            395 kr
          </div>
          <div style={{
            fontSize: '14px',
            color: COLORS.driftwood,
            marginBottom: '32px',
          }}>
            Engångsköp · Tillgång för alltid
          </div>

          <button
            onClick={handlePurchase}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: COLORS.deepSaffron,
              color: COLORS.emberNight,
              fontSize: '16px',
              fontFamily: "'DM Serif Display', serif",
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Lås upp Still Us
          </button>

          <div
            onClick={() => navigate('/')}
            style={{
              color: COLORS.driftwood,
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '16px',
            }}
          >
            Inte nu
          </div>
        </div>
      </div>
    </div>
  );
}
