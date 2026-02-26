'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { RarityResult } from '@/types/generator';

interface RarityBreakdownProps {
    rarity: RarityResult;
}

const CATEGORY_LABELS: Record<string, string> = {
    background: 'Background',
    body: 'Body',
    eyes: 'Eyes',
    mouth: 'Mouth',
    accessories: 'Accessories',
    special: 'Special',
};

export function RarityBreakdown({ rarity }: RarityBreakdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-lg border border-border bg-background-secondary">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
                <span className="text-sm font-medium text-foreground">Rarity Breakdown</span>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border px-4 py-3 space-y-2">
                            {Object.entries(rarity.breakdown).map(([category, percentage]) => (
                                <div key={category} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {CATEGORY_LABELS[category] || category}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-foreground font-medium w-12 text-right">
                                            {percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}