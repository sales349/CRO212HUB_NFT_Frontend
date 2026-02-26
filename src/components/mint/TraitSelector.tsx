'use client';

import { cn } from '@/lib/utils/cn';
import { TRAIT_OPTIONS, type TraitSelection } from '@/types/generator';

interface TraitSelectorProps {
    category: keyof TraitSelection;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const CATEGORY_LABELS: Record<keyof TraitSelection, string> = {
    background: 'Background',
    body: 'Body',
    eyes: 'Eyes',
    mouth: 'Mouth',
    accessories: 'Accessories',
    special: 'Special',
};

export function TraitSelector({ category, value, onChange, disabled }: TraitSelectorProps) {
    const options = TRAIT_OPTIONS[category];
    const label = CATEGORY_LABELS[category];

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={cn(
                    'w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                ))}
            </select>
        </div>
    );
}