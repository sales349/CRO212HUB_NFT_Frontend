'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useAppKitAccount } from '@reown/appkit/react';
import { TraitSelector } from '@/components/mint/TraitSelector';
import { NFTPreview } from '@/components/mint/NFTPreview';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePreset, useRemixPreset, useAuth, useMintPublic, useReadMintPrice } from '@/lib/hooks';
import { remixFormSchema } from '@/lib/utils/form-schemas';
import { cn } from '@/lib/utils/cn';
import { TRAIT_OPTIONS, type TraitSelection } from '@/types/generator';

export default function RemixPage() {
    const searchParams = useSearchParams();
    const presetId = searchParams.get('preset');

    const { isConnected } = useAppKitAccount();
    const { authenticate, token } = useAuth();
    const { data: preset, isLoading: loadingPreset } = usePreset(presetId);
    const remixPreset = useRemixPreset();
    const { mint: mintPublic } = useMintPublic();
    const { data: mintPriceWei } = useReadMintPrice();

    const [traits, setTraits] = useState<TraitSelection | null>(null);
    const [prompt, setPrompt] = useState('');
    const [changedTraits, setChangedTraits] = useState<Partial<TraitSelection>>({});

    // Auto-authenticate
    useEffect(() => {
        if (isConnected && !token) {
            authenticate();
        }
    }, [isConnected, token, authenticate]);

    // Initialize traits from preset
    useEffect(() => {
        if (preset) {
            setTraits(preset.traits);
            setPrompt(preset.prompt);
        }
    }, [preset]);

    const handleTraitChange = (category: keyof TraitSelection, value: string) => {
        if (!traits || !preset) return;

        setTraits((prev) => prev ? { ...prev, [category]: value } : null);

        // Track which traits have changed from original
        if (value !== preset.traits[category]) {
            setChangedTraits((prev) => ({ ...prev, [category]: value }));
        } else {
            setChangedTraits((prev) => {
                const updated = { ...prev };
                delete updated[category];
                return updated;
            });
        }
    };

    const handleRemix = () => {
        if (!presetId) return;

        const newPrompt = prompt !== preset?.prompt ? prompt : undefined;

        const result = remixFormSchema.safeParse({
            sourcePresetId: presetId,
            newTraits: changedTraits,
            newPrompt,
            saveToVault: true,
        });

        if (!result.success) {
            const firstIssue = result.error.issues[0];
            toast.error(firstIssue?.message ?? 'Invalid remix data');
            return;
        }

        remixPreset.mutate(
            {
                sourcePresetId: presetId,
                newTraits: changedTraits,
                newPrompt,
                saveToVault: true,
            },
            {
                onSuccess: () => {
                    toast.success('Remix created and saved to vault!');
                    setChangedTraits({});
                },
                onError: (err) => {
                    toast.error(err instanceof Error ? err.message : 'Remix failed');
                },
            },
        );
    };

    if (!isConnected) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-foreground">Remix</h1>
                <p className="mt-4 text-muted-foreground">
                    Connect your wallet to remix presets.
                </p>
            </div>
        );
    }

    if (!presetId) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-foreground">Remix</h1>
                <p className="mt-4 text-muted-foreground">
                    Select a preset from your vault to remix.
                </p>
                <Link
                    href="/vault"
                    className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go to Vault
                </Link>
            </div>
        );
    }

    if (loadingPreset) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-10">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid gap-8 lg:grid-cols-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link
                    href="/vault"
                    className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Vault
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Remix Preset</h1>
                <p className="mt-2 text-muted-foreground">
                    Modify traits to create a new variation. Original: {preset?.name}
                </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Editor */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="rounded-xl border border-border bg-background-secondary p-6 space-y-6">
                        {/* Prompt */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Description</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                maxLength={500}
                                className={cn(
                                    'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground',
                                    'placeholder:text-muted-foreground resize-none',
                                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                                )}
                            />
                        </div>

                        {/* Traits */}
                        {traits && (
                            <div className="grid grid-cols-2 gap-4">
                                {(Object.keys(TRAIT_OPTIONS) as Array<keyof TraitSelection>).map((category) => (
                                    <TraitSelector
                                        key={category}
                                        category={category}
                                        value={traits[category]}
                                        onChange={(value) => handleTraitChange(category, value)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Changed indicator */}
                        {Object.keys(changedTraits).length > 0 && (
                            <p className="text-sm text-primary">
                                {Object.keys(changedTraits).length} trait(s) changed
                            </p>
                        )}

                        {/* Remix button */}
                        <button
                            onClick={handleRemix}
                            disabled={remixPreset.isPending || Object.keys(changedTraits).length === 0}
                            className={cn(
                                'w-full flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-white',
                                'transition-all hover:opacity-90',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                            )}
                        >
                            <Wand2 className={cn('h-4 w-4', remixPreset.isPending && 'animate-spin')} />
                            {remixPreset.isPending ? 'Remixing...' : 'Create Remix'}
                        </button>
                    </div>
                </motion.div>

                {/* Preview */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="mb-4 text-lg font-semibold text-foreground">
                        {remixPreset.data ? 'Remix Result' : 'Original'}
                    </h2>
                    <NFTPreview
                        data={remixPreset.data ?? null}
                        isLoading={remixPreset.isPending}
                        onSaveToVault={() => toast.info('Auto-saved to vault!')}
                        onMint={async () => {
                            if (!mintPriceWei) {
                                toast.error('Unable to read mint price from contract');
                                return;
                            }
                            try {
                                await mintPublic(1, mintPriceWei);
                            } catch {
                                // Error handled by useMintPublic toast
                            }
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
}