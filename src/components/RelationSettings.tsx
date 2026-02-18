import { useState } from 'react';
import { Plus, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronDown } from 'lucide-react';

interface RelationSettingsProps {
  onCreateNewSpace?: () => void;
  onLeavePartner?: () => void;
}

export default function RelationSettings({
  onCreateNewSpace,
  onLeavePartner,
}: RelationSettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-divider">
      {/* Collapsed toggle row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Relation &amp; utrymme</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-6">

          {/* ── Secondary action: Create new space ── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-foreground font-medium">Skapa nytt gemensamt utrymme</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Ni får en ny tom plats att börja på. Er tidigare historik finns kvar i det gamla utrymmet.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Skapa nytt utrymme
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-lg">
                    Skapa ett nytt gemensamt utrymme?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-1">
                    <span className="block">Ni får en ny tom plats att börja på.</span>
                    <span className="block">Er tidigare samtalshistorik finns kvar i ert nuvarande utrymme men följer inte med.</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction onClick={onCreateNewSpace}>
                    Skapa nytt utrymme
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-border/40" />

          {/* ── Destructive action: Leave partner ── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-destructive/80 font-medium">Avsluta koppling till partner</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Du lämnar ert gemensamma utrymme. Din partner får behålla historiken där.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-destructive/70 hover:text-destructive hover:bg-destructive/5 border border-destructive/20 hover:border-destructive/40"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  Avsluta koppling
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-lg">
                    Avsluta kopplingen?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-1">
                    <span className="block">Du lämnar ert gemensamma utrymme.</span>
                    <span className="block">Din partner behåller historiken där.</span>
                    <span className="block">Du får skapa eller ansluta till ett nytt utrymme efteråt.</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onLeavePartner}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Avsluta koppling
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

        </div>
      )}
    </div>
  );
}
