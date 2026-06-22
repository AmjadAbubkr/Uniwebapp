import { Button as BaseButton } from '@base-ui/react/button';
import type { ButtonProps as BaseButtonProps } from '@base-ui/react/button';
import { forwardRef } from 'react';

export interface ButtonProps extends Omit<BaseButtonProps, 'className'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[#00b4d8] hover:bg-[#0077a8] text-white shadow-md',
  secondary: 'bg-[#e8f7fc] hover:bg-[#00b4d8]/20 text-[#0077a8]',
  danger: 'bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white',
  ghost: 'text-[#666666] hover:bg-[#e8f7fc] hover:text-[#000000]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const sizeStyles = size === 'sm' ? 'px-3 py-2 text-xs'
      : size === 'lg' ? 'px-6 py-4 text-base'
      : 'px-4 py-2.5 text-sm';

    return (
      <BaseButton
        ref={ref}
        className={(state) => {
          const base = `inline-flex items-center justify-center font-semibold rounded-md cursor-pointer transition-all active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles[variant]}`;
          const custom = typeof className === 'function' ? className(state) : className;
          return `${base} ${custom || ''}`.trim();
        }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
