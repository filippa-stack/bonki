import { toast } from 'sonner';

const lastShown = new Map<string, number>();
const DEBOUNCE_MS = 3000;

type ToastFn = () => string | number;

function shouldShow(key: string): boolean {
  const now = Date.now();
  const last = lastShown.get(key) ?? 0;
  if (now - last < DEBOUNCE_MS) return false;
  lastShown.set(key, now);
  return true;
}

export function toastOnce(key: string, fn: ToastFn): void {
  if (shouldShow(key)) fn();
}

// Convenience wrappers
export const toastSuccessOnce = (key: string, message: string) =>
  toastOnce(key, () => toast.success(message));

export const toastErrorOnce = (key: string, message: string) =>
  toastOnce(key, () => toast.error(message));
