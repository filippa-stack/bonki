/**
 * Marketing 06 — Era samtal cropped to a single reflection.
 * Mounts the production SessionGroupCard with marketing-controlled props.
 * Page chrome (h1 + subtitle + month header) is inlined here because it's
 * not reused elsewhere; the actual reflection card is the production one.
 */
import { useNavigate } from 'react-router-dom';
import { ScaledScreen, FONT_DISPLAY, FONT_SERIF, FONT_LABEL, FONT_SANS, LOGICAL_H } from './MarketingShared';
import { MIDNIGHT_INK, LANTERN_GLOW } from '@/lib/palette';
import { SessionGroupCard, type SessionGroup } from '@/pages/Journal';

const QUESTION =
  'Vem av oss bär det osynliga ansvaret för vårt liv \u2014 och hur märker den andra av det?';
const REFLECTION =
  'Vi pratade om vem som b\u00e4r vad \u2014 och hur det m\u00e4rks \u00e4ven n\u00e4r vi inte s\u00e4ger det. Jag visste inte att Johan faktiskt s\u00e5g det. Att han f\u00f6rst\u00e5tt hur tungt det \u00e4r att alltid vara den som planerar.';

const GROUP: SessionGroup = {
  type: 'group',
  sessionId: 'marketing-session-smallest-we',
  productId: 'still_us',
  cardId: 'smallest-we',
  cardName: 'Det osynliga ansvaret',
  categoryName: '',
  date: '2026-04-10T12:00:00.000Z',
  notes: [
    {
      type: 'note',
      id: 'marketing-note-1',
      text: REFLECTION,
      questionText: QUESTION,
      cardId: 'smallest-we',
      cardName: 'Det osynliga ansvaret',
      categoryName: '',
      productId: 'still_us',
      date: '2026-04-10T12:00:00.000Z',
      sessionId: 'marketing-session-smallest-we',
    },
  ],
  takeaway: null,
};

export default function MarketingJournalSingle() {
  const navigate = useNavigate();

  return (
    <ScaledScreen background={MIDNIGHT_INK}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '52px 0 28px',
          display: 'flex',
          flexDirection: 'column',
          height: LOGICAL_H,
        }}
      >
        {/* Page title */}
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 500,
            fontSize: 30,
            color: LANTERN_GLOW,
            margin: 0,
            padding: '0 24px',
            letterSpacing: '-0.005em',
          }}
        >
          Era samtal
        </h1>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: 'italic',
            fontSize: 16,
            color: 'rgba(253,246,227,0.65)',
            margin: '6px 0 0',
            padding: '0 24px',
          }}
        >
          Vad ni burit med er
        </p>

        {/* Month header — same shape as Journal's month band */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginLeft: '1.75rem',
            paddingLeft: '16px',
            marginTop: 32,
            marginBottom: 12,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 'calc(-1.75rem + 2.05rem - 4px)',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#E9C890',
            }}
          />
          <span
            style={{
              fontSize: 14,
              letterSpacing: '0.02em',
              color: '#E9C890',
              fontFamily: FONT_DISPLAY,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            April 2026
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              fontStyle: 'italic',
              color: 'rgba(245, 240, 232, 0.35)',
              fontFamily: FONT_SANS,
              paddingRight: 16,
            }}
          >
            1 samtal
          </span>
        </div>

        {/* Real production SessionGroupCard */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginLeft: '1.75rem',
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          <SessionGroupCard group={GROUP} navigate={navigate} />
        </div>
      </div>
    </ScaledScreen>
  );
}
