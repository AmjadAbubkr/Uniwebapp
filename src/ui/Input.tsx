import { Input as BaseInput } from '@base-ui/react/input';
import type { InputProps as BaseInputProps } from '@base-ui/react/input';
import { forwardRef } from 'react';

export interface InputProps extends Omit<BaseInputProps, 'className'> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <BaseInput
        ref={ref}
        className={(state) => {
          const base = 'w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm transition-colors placeholder:text-[#999999]';
          const focus = 'focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8]';
          const custom = typeof className === 'function' ? className(state) : className;
          return `${base} ${focus} ${custom || ''}`;
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
