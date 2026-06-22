import type { ReactNode } from 'react';
import { Field as BaseField } from '@base-ui/react/field';

export { Field } from '@base-ui/react/field';

export interface FormFieldProps {
  label: string;
  error?: string | null;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, description, children, className = '' }: FormFieldProps) {
  return (
    <BaseField.Root className={className}>
      <BaseField.Label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
        {label}
      </BaseField.Label>
      {children}
      {description && !error && (
        <BaseField.Description className="text-xs text-[#666666] mt-1">
          {description}
        </BaseField.Description>
      )}
      {error && (
        <BaseField.Error className="text-xs text-rose-600 mt-1 font-semibold">
          {error}
        </BaseField.Error>
      )}
    </BaseField.Root>
  );
}
