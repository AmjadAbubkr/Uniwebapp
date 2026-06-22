import * as BaseSelect from '@base-ui/react/select';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string | null) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Sélectionner',
  disabled,
  className = '',
  required,
}: SelectProps) {
  return (
    <BaseSelect.Select.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      required={required}
    >
      <BaseSelect.Select.Trigger className={(state) => {
        const base = `w-full flex items-center justify-between px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-left transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#00b4d8]'}`;
        const focus = 'focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8]';
        return `${base} ${focus} ${className}`;
      }}>
        <BaseSelect.Select.Value placeholder={placeholder} className="text-[#999999] data-[selected]:text-[#000000]" />
        <BaseSelect.Select.Icon className="text-[#666666] ml-2">
          <ChevronDown className="w-4 h-4" />
        </BaseSelect.Select.Icon>
      </BaseSelect.Select.Trigger>
      <BaseSelect.Select.Portal>
        <BaseSelect.Select.Positioner sideOffset={4}>
          <BaseSelect.Select.Popup className="z-50 bg-white border border-[#d2d6db] rounded-md shadow-lg min-w-[var(--anchor-width)] max-h-60 overflow-y-auto">
            <BaseSelect.Select.List>
              {options.map((opt) => (
                <BaseSelect.Select.Item
                  key={opt.value}
                  value={opt.value}
                  className={(state) => {
                    const base = 'flex items-center px-4 py-2 text-sm cursor-pointer transition-colors';
                    const highlight = state.highlighted ? 'bg-[#e8f7fc] text-[#000000]' : 'text-[#666666]';
                    const selected = state.selected ? 'bg-[#e8f7fc] font-semibold text-[#00b4d8]' : '';
                    return `${base} ${highlight} ${selected}`;
                  }}
                >
                  <BaseSelect.Select.ItemText>{opt.label}</BaseSelect.Select.ItemText>
                  <BaseSelect.Select.ItemIndicator className="ml-auto text-[#00b4d8]">
                    ✓
                  </BaseSelect.Select.ItemIndicator>
                </BaseSelect.Select.Item>
              ))}
            </BaseSelect.Select.List>
          </BaseSelect.Select.Popup>
        </BaseSelect.Select.Positioner>
      </BaseSelect.Select.Portal>
    </BaseSelect.Select.Root>
  );
}
