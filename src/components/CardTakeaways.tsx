import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Pencil, Trash2, Star } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const AUTOSAVE_DELAY = 800;

interface CardTakeawaysProps {
  cardId: string;
  compact?: boolean;
}

export default function CardTakeaways({ cardId, compact = false }: CardTakeawaysProps) {
  const {
    getTakeawayPrivate,
    getTakeawayShared,
    saveTakeawayPrivate,
    saveTakeawayShared,
    removeTakeawayShared,
    isTakeawayHighlighted,
    toggleTakeawayHighlight,
    takeawayHighlightCount,
  } = useApp();

  const privateNote = getTakeawayPrivate(cardId);
  const sharedNote = getTakeawayShared(cardId);
  const highlighted = isTakeawayHighlighted(cardId);

  const [privateText, setPrivateText] = useState(privateNote?.text || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [shareText, setShareText] = useState('');
  const [editingShared, setEditingShared] = useState(false);
  const [editText, setEditText] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync from context when it changes externally
  useEffect(() => {
    if (privateNote?.text !== undefined && privateNote.text !== privateText) {
      setPrivateText(privateNote.text);
    }
  }, [privateNote?.text]);

  const handlePrivateChange = useCallback((value: string) => {
    setPrivateText(value);
    setSaveStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveTakeawayPrivate(cardId, value);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, AUTOSAVE_DELAY);
  }, [cardId, saveTakeawayPrivate]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleOpenSharePreview = () => {
    setShareText(privateText);
    setShowSharePreview(true);
  };

  const handleConfirmShare = () => {
    saveTakeawayShared(cardId, shareText);
    setShowSharePreview(false);
  };

  const handleStartEditShared = () => {
    setEditText(sharedNote?.text || '');
    setEditingShared(true);
  };

  const handleSaveEditShared = () => {
    saveTakeawayShared(cardId, editText);
    setEditingShared(false);
  };

  const handleRemoveShared = () => {
    removeTakeawayShared(cardId);
  };

  return (
    <div className={`space-y-3 ${compact ? '' : 'pt-2'}`}>
      {/* Private textarea */}
      <div className="space-y-1.5">
        <div className="h-px bg-border/30 mb-4" />
        <Textarea
          value={privateText}
          onChange={(e) => handlePrivateChange(e.target.value)}
          placeholder="Skriv något ni vill bära med er."
          className="min-h-[56px] text-sm resize-none bg-transparent border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/40"
          rows={compact ? 2 : 2}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/40">
            {saveStatus === 'saving' ? 'Sparar…' : saveStatus === 'saved' ? 'Sparad' : '\u00A0'}
          </span>
          {privateText.trim() && !sharedNote && !showSharePreview && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground h-7 px-2"
              onClick={handleOpenSharePreview}
            >
              <Share2 className="w-3 h-3" />
              Dela med din partner
            </Button>
          )}
        </div>
      </div>

      {/* Share preview */}
      <AnimatePresence>
        {showSharePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <p className="text-xs font-medium text-foreground/80">
                Granska innan du delar
              </p>
              <Textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                className="min-h-[60px] text-sm resize-none bg-background"
                rows={2}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setShowSharePreview(false)}
                >
                  Inte nu
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-7"
                  onClick={handleConfirmShare}
                  disabled={!shareText.trim()}
                >
                  Dela
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared version */}
      <AnimatePresence>
        {sharedNote && !showSharePreview && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground/70 uppercase tracking-wider">
                Delad med din partner
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground"
                  onClick={() => toggleTakeawayHighlight(cardId)}
                  disabled={!highlighted && takeawayHighlightCount >= 3}
                  title={!highlighted && takeawayHighlightCount >= 3 ? 'Max 3 markeringar' : ''}
                >
                  <Star className={`w-3 h-3 ${highlighted ? 'fill-primary text-primary' : ''}`} />
                </Button>
              </div>
            </div>

            {editingShared ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[60px] text-sm resize-none bg-background"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setEditingShared(false)}>
                    Avbryt
                  </Button>
                  <Button size="sm" className="text-xs h-7" onClick={handleSaveEditShared} disabled={!editText.trim()}>
                    Spara
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {sharedNote.text}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs text-muted-foreground h-7 px-2"
                    onClick={handleStartEditShared}
                  >
                    <Pencil className="w-3 h-3" />
                    Redigera
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs text-muted-foreground h-7 px-2"
                    onClick={handleRemoveShared}
                  >
                    <Trash2 className="w-3 h-3" />
                    Ta bort delning
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
