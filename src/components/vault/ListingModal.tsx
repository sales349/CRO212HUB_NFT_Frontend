'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { listingPriceSchema } from '@/lib/utils/form-schemas';
import { RarityBadge } from '@/components/mint/RarityBadge';
import type { Preset } from '@/types/generator';

interface ListingModalProps {
    preset: Preset;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (price: number) => void;
    isSubmitting?: boolean;
}

export function ListingModal({ preset, isOpen, onClose, onConfirm, isSubmitting }: ListingModalProps) {
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        setError('');

        const numPrice = parseFloat(price);
        const result = listingPriceSchema.safeParse({ price: isNaN(numPrice) ? undefined : numPrice });

        if (!result.success) {
            const firstIssue = result.error.issues[0];
            setError(firstIssue?.message ?? 'Invalid price');
            return;
        }

        onConfirm(result.data.price);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl mx-4"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">List for Sale</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Preset info */}
                    <div className="rounded-xl border border-border bg-background-secondary p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-foreground">{preset.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                                    {preset.prompt}
                                </p>
                            </div>
                            <RarityBadge rarity={preset.rarity} showScore size="sm" />
                        </div>
                    </div>

                    {/* Price input */}
                    <div className="space-y-2 mb-6">
                        <label className="text-sm font-medium text-foreground">
                            Price (CRO)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => { setPrice(e.target.value); setError(''); }}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                autoFocus
                                disabled={isSubmitting}
                                className={cn(
                                    'w-full rounded-lg border bg-background-secondary px-4 py-3 text-lg font-semibold text-foreground',
                                    'placeholder:text-muted-foreground/50',
                                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                                    'disabled:opacity-50',
                                    error ? 'border-red-500' : 'border-border',
                                )}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                CRO
                            </span>
                        </div>

                        {/* Fee info */}
                        <p className="text-xs text-muted-foreground">
                            Primary listing: 2% seller fee deducted at sale
                        </p>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-1 text-xs text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting || !price}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground',
                                'transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    Listing...
                                </>
                            ) : (
                                <>
                                    <Store className="h-4 w-4" />
                                    List for Sale
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
