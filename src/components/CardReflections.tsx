import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { PenLine, Share2, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CardReflectionsProps {
  cardId: string;
}

export default function CardReflections({ cardId }: CardReflectionsProps) {
  const { t } = useTranslation();
  const {
    getPrivateNote,
    getSharedNote,
    savePrivateNote,
    saveSharedNote,
    removeSharedNote,
    isHighlighted,
    toggleHighlight,
    highlightCount,
  } = useApp();

  const privateNote = getPrivateNote(cardId);
  const sharedNote = getSharedNote(cardId);
  const highlighted = isHighlighted(cardId);

  const [privateText, setPrivateText] = useState(privateNote?.text || '');
  const [sharedText, setSharedText] = useState(sharedNote?.text || '');
  const [isEditingPrivate, setIsEditingPrivate] = useState(false);
  const [isEditingShared, setIsEditingShared] = useState(false);

  const handleSavePrivate = () => {
    savePrivateNote(cardId, privateText);
    setIsEditingPrivate(false);
  };

  const handleCreateSharedFromPrivate = () => {
    setSharedText(privateText);
    saveSharedNote(cardId, privateText);
  };

  const handleSaveShared = () => {
    saveSharedNote(cardId, sharedText);
    setIsEditingShared(false);
  };

  const handleUnshare = () => {
    removeSharedNote(cardId);
    setSharedText('');
  };

  const handleToggleHighlight = () => {
    if (!highlighted && highlightCount >= 3) {
      return; // max 3
    }
    toggleHighlight(cardId);
  };

  return (
    <div className="space-y-6 py-6 border-t border-divider">
      {/* Private notes — first */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {t('reflections.private_notes_title')}
        </p>
        <p className="text-xs text-gentle mb-3">
          {t('reflections.private_notes_hint')}
        </p>

        {isEditingPrivate || !privateNote?.text ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <textarea
              value={privateText}
              onChange={(e) => setPrivateText(e.target.value)}
              placeholder={t('reflections.private_notes_hint')}
              className="w-full min-h-[100px] p-4 rounded-lg bg-white border border-slate-200 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-0 focus:border-[#497575] font-sans text-base"
              autoFocus={isEditingPrivate}
            />
            <div className="flex gap-3 mt-3">
              <Button
                size="sm"
                onClick={handleSavePrivate}
                disabled={!privateText.trim()}
              >
                <PenLine className="w-4 h-4 mr-1" />
                {t('home.save')}
              </Button>
              {privateNote?.text && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPrivateText(privateNote.text);
                    setIsEditingPrivate(false);
                  }}
                >
                  {t('general.back_home')}
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <div
            className="p-4 rounded-lg bg-card border border-border cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => setIsEditingPrivate(true)}
          >
            <p className="text-body text-foreground whitespace-pre-wrap">
              {privateNote.text}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(privateNote.updatedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Shared notes — below */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {t('reflections.shared_notes_title')}
        </p>
        <p className="text-xs text-gentle mb-3">
          {t('reflections.shared_notes_hint')}
        </p>

        {sharedNote?.text ? (
          <div>
            {isEditingShared ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <textarea
                  value={sharedText}
                  onChange={(e) => setSharedText(e.target.value)}
                  className="w-full min-h-[100px] p-4 rounded-lg bg-white border border-slate-200 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-0 focus:border-[#497575] font-sans text-base"
                  autoFocus
                />
                <div className="flex gap-3 mt-3">
                  <Button size="sm" onClick={handleSaveShared}>
                    {t('reflections.save_shared')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSharedText(sharedNote.text);
                      setIsEditingShared(false);
                    }}
                  >
                    {t('general.back_home')}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="text-body text-foreground whitespace-pre-wrap">
                  {sharedNote.text}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(sharedNote.sharedAt).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingShared(true)}
                  >
                    {t('reflections.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUnshare}
                  >
                    <X className="w-3 h-3 mr-1" />
                    {t('reflections.unshare')}
                  </Button>
                  <Button
                    size="sm"
                    variant={highlighted ? 'default' : 'outline'}
                    onClick={handleToggleHighlight}
                    disabled={!highlighted && highlightCount >= 3}
                  >
                    <Star className={`w-3 h-3 mr-1 ${highlighted ? 'fill-current' : ''}`} />
                    {t('reflections.mark_important')}
                  </Button>
                  {!highlighted && highlightCount >= 3 && (
                    <p className="text-xs text-muted-foreground w-full mt-1">
                      {t('reflections.important_limit_reached')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {privateNote?.text && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateSharedFromPrivate}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                {t('reflections.create_shared_from_private')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
