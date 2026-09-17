import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import type { Toast } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const TOAST_STYLES = {
  success: { bg: 'bg-success-50 dark:bg-success-950/60', border: 'border-success-200 dark:border-success-900', text: 'text-success-700 dark:text-success-400', icon: CheckCircle2 },
  error: { bg: 'bg-error-50 dark:bg-error-950/60', border: 'border-error-200 dark:border-error-900', text: 'text-error-700 dark:text-error-400', icon: XCircle },
  info: { bg: 'bg-primary-50 dark:bg-primary-950/60', border: 'border-primary-200 dark:border-primary-900', text: 'text-primary-700 dark:text-primary-400', icon: Info },
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-20 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        const Icon = style.icon;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${style.bg} ${style.border} ${style.text} animate-slide-in-right max-w-sm`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 ml-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
