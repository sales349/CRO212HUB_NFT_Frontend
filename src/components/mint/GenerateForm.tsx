'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { generateFormSchema } from '@/lib/utils/form-schemas';
import { TraitSelector } from './TraitSelector';
import { TRAIT_OPTIONS, type TraitSelection } from '@/types/generator';

interface GenerateFormProps {
    onGenerate: (prompt: string, traits: TraitSelection) => void;
    isLoading?: boolean;
}

const DEFAULT_TRAITS: TraitSelection = {
    background: TRAIT_OPTIONS.background[0],
    body: TRAIT_OPTIONS.body[0],
    eyes: TRAIT_OPTIONS.eyes[0],
    mouth: TRAIT_OPTIONS.mouth[0],
    accessories: TRAIT_OPTIONS.accessories[0],
    special: TRAIT_OPTIONS.special[0],
};

export function GenerateForm({ onGenerate, isLoading }: GenerateFormProps) {
    const [prompt, setPrompt] = useState('');
    const [traits, setTraits] = useState<TraitSelection>(DEFAULT_TRAITS);
    const [error, setError] = useState<string | null>(null);

    const handleTraitChange = (category: keyof TraitSelection, value: string) => {
        setTraits((prev) => ({ ...prev, [category]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const result = generateFormSchema.safeParse({ prompt, traits });

        if (!result.success) {
            const firstIssue = result.error.issues[0];
            setError(firstIssue?.message ?? 'Invalid form data');
            return;
        }

        onGenerate(result.data.prompt, result.data.traits);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prompt */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your NFT... (e.g., 'A cosmic warrior with diamond armor')"
                    rows={3}
                    maxLength={500}
                    disabled={isLoading}
                    className={cn(
                        'w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-sm text-foreground',
                        'placeholder:text-muted-foreground resize-none',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                />
                <p className="text-xs text-muted-foreground text-right">
                    {prompt.length}/500
                </p>
            </div>

            {/* Traits Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {(Object.keys(DEFAULT_TRAITS) as Array<keyof TraitSelection>).map((category) => (
                    <TraitSelector
                        key={category}
                        category={category}
                        value={traits[category]}
                        onChange={(value) => handleTraitChange(category, value)}
                        disabled={isLoading}
                    />
                ))}
            </div>

            {/* Error */}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400"
                >
                    {error}
                </motion.p>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className={cn(
                    'w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground',
                    'transition-all hover:opacity-90 glow-hover',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
            >
                <Wand2 className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                {isLoading ? 'Generating...' : 'Generate NFT'}
            </button>
        </form>
    );
}