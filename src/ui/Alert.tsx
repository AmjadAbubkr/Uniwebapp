import { AlertCircle, CheckCircle, ShieldAlert, Activity } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const config: Record<AlertVariant, { bg: string; border: string; text: string; Icon: typeof AlertCircle }> = {
  error: { bg: 'bg-rose-50', border: 'border-s-4 border-rose-500', text: 'text-rose-800', Icon: AlertCircle },
  success: { bg: 'bg-[#e8f7fc]', border: 'border-s-4 border-[#00b4d8]', text: 'text-[#0077a8]', Icon: CheckCircle },
  warning: { bg: 'bg-[#fdf3e0]', border: 'border-s-4 border-[#c9902a]', text: 'text-[#a07020]', Icon: ShieldAlert },
  info: { bg: 'bg-[#e8f7fc]', border: 'border-s-4 border-[#00b4d8]', text: 'text-[#0077a8]', Icon: Activity },
};

export function Alert({ variant = 'error', message, onDismiss, className = '' }: AlertProps) {
  const { isRTL } = useLang();
  const { bg, border, text, Icon } = config[variant];
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`p-4 ${bg} ${border} rounded-s-md flex items-start ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} text-sm ${text} ${className}`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 hover:opacity-70 cursor-pointer">
          ✕
        </button>
      )}
    </div>
  );
}
