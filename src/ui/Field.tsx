import { Field as BaseField } from '@base-ui/react/field';
import type { ReactNode } from 'react';

export const Field = BaseField;

export interface FormFieldProps {
  label: string;
  error?: string | null;
  description?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, description, required, children, className = '' }: FormFieldProps) {
  return (
    <Field.Root className={className} required={required} invalid={!!error}>
      <Field.Label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
        {label}
      </Field.Label>
      {children}
      {description && !error && (
        <Field.Description className="text-xs text-[#666666] mt-1">
          {description}
        </Field.Description>
      )}
      {error && (
        <Field.Error className="text-xs text-rose-600 mt-1 font-semibold">
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
}
