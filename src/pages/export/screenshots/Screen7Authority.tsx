/**
 * Screen 7 — Authority / clinical credentialing. Pure typographic block,
 * no device frame.
 */
const MIDNIGHT_INK = '#1A1A2E';
const ON = '#F5E8CC';

export default function Screen7Authority() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: MIDNIGHT_INK,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 130px',
        boxSizing: 'border-box',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: '"Fraunces", serif',
          fontSize: 90,
          fontWeight: 500,
          color: ON,
          margin: 0,
          letterSpacing: '-0.01em',
          fontVariationSettings: '"opsz" 96',
        }}
      >
        Ida Welbourn
      </h2>
      <p
        style={{
          fontFamily: '"Fraunces", serif',
          fontStyle: 'normal',
          fontSize: 36,
          fontWeight: 400,
          color: 'rgba(245,232,204,0.85)',
          lineHeight: 1.4,
          margin: '40px 0 0',
          letterSpacing: '0.005em',
        }}
      >
        Leg. psykolog · Leg. psykoterapeut
        <br />
        Specialistpsykolog inom psykologisk behandling
      </p>

      <div
        style={{
          width: '30%',
          height: 1,
          background: 'rgba(245,232,204,0.25)',
          margin: '64px 0',
        }}
      />

      <p
        style={{
          fontFamily: '"Fraunces", serif',
          fontStyle: 'italic',
          fontSize: 43,
          fontWeight: 400,
          color: 'rgba(245,232,204,0.88)',
          lineHeight: 1.5,
          margin: 0,
          textWrap: 'balance' as any,
        }}
      >
        Bonki är inte en app som kom ur ingenting.
        Den kom ur tjugonio år av rummet där föräldrar och barn försöker förstå varandra.
      </p>
    </div>
  );
}
