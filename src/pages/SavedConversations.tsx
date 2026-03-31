import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import ConversationCard from '@/components/ConversationCard';

export default function SavedConversations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { savedConversations } = useApp();

  const sortedConversations = [...savedConversations].sort(
    (a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime()
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Header title={t('saved.title')} showBack backTo="/" />

      <div className="px-6 pt-8 pb-12">
        {sortedConversations.length === 0 ? (
          <div
            className="text-center py-24 px-4"
          >
            {/* Decorative saffron dot */}
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-saffron)',
              opacity: 0.4,
              margin: '0 auto 20px',
            }} />
            <p className="font-serif italic" style={{ fontSize: '18px', color: 'var(--accent-text)', opacity: 0.65, lineHeight: 1.5, marginBottom: '12px' }}>
              Här samlas era samtal.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', opacity: 0.55, maxWidth: '260px', marginLeft: 'auto', marginRight: 'auto' }}>
              När ni utforskar ett ämne och skriver reflektioner dyker det upp här — ert delade minne.
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-sm transition-opacity hover:opacity-70 mt-10"
              style={{ color: 'var(--color-text-tertiary)', opacity: 0.45 }}
            >
              Till startsidan
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedConversations.map((conversation, index) => (
              <div
                key={conversation.id}
              >
                <ConversationCard
                  conversation={conversation}
                  onClick={() => navigate(`/card/${conversation.cardId}`)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer nav */}
        <div style={{ marginTop: '40px', textAlign: 'center', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
          <button
            onClick={() => navigate('/')}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-tertiary)', opacity: 0.45, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Tillbaka till startsidan
          </button>
        </div>
      </div>
    </div>
  );
}
