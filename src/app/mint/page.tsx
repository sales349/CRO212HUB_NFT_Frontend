'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppKitAccount } from '@reown/appkit/react';
import { GenerateForm } from '@/components/mint/GenerateForm';
import { NFTPreview } from '@/components/mint/NFTPreview';
import { useGenerateNFT, useSavePreset, useAuth, useMintPublic, useReadMintPrice } from '@/lib/hooks';
import type { TraitSelection } from '@/types/generator';

export default function MintPage() {
    const { isConnected } = useAppKitAccount();
    const { authenticate } = useAuth();
    const { generate, data, isLoading, isError, error, reset } = useGenerateNFT();
    const savePreset = useSavePreset();
    const { mint } = useMintPublic();
    const { data: mintPriceWei } = useReadMintPrice();

    const [lastPrompt, setLastPrompt] = useState('');
    const [lastTraits, setLastTraits] = useState<TraitSelection | null>(null);

    const handleGenerate = async (prompt: string, traits: TraitSelection) => {
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            return;
        }

        // Ensure authenticated
        const token = await authenticate();
        if (!token) {
            toast.error('Authentication failed. Please try again.');
            return;
        }

        setLastPrompt(prompt);
        setLastTraits(traits);
        reset();

        generate(
            { prompt, traits },
            {
                onSuccess: () => {
                    toast.success('NFT generated successfully!');
                },
                onError: (err) => {
                    toast.error(err instanceof Error ? err.message : 'Generation failed');
                },
            },
        );
    };

    const handleSaveToVault = async () => {
        if (!data || !lastTraits) return;

        savePreset.mutate(
            {
                name: data.metadata.name,
                prompt: lastPrompt,
                traits: lastTraits,
                rarity: data.rarity,
                imageUrl: data.imageUrl,
                metadataUrl: data.metadataUrl,
                gatewayUrl: data.gatewayUrl,
            },
            {
                onSuccess: () => {
                    toast.success('Saved to vault!');
                },
                onError: (err) => {
                    toast.error(err instanceof Error ? err.message : 'Failed to save');
                },
            },
        );
    };

    const handleMint = async () => {
        if (!mintPriceWei) {
            toast.error('Unable to read mint price from contract');
            return;
        }
        try {
            await mint(1, mintPriceWei);
        } catch {
            // Error handled by useMintPublic toast
        }
    };

    if (!isConnected) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-foreground">Create Your NFT</h1>
                <p className="mt-4 text-muted-foreground">
                    Connect your wallet to start generating unique NFTs.
                </p>
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
                <h1 className="text-3xl font-bold text-foreground">Create Your NFT</h1>
                <p className="mt-2 text-muted-foreground">
                    Select traits, describe your vision, and generate a unique NFT.
                </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="rounded-xl border border-border bg-background-secondary p-6">
                        <h2 className="mb-6 text-lg font-semibold text-foreground">Customize Traits</h2>
                        <GenerateForm onGenerate={handleGenerate} isLoading={isLoading} />
                    </div>
                </motion.div>

                {/* Preview */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="mb-4 text-lg font-semibold text-foreground">Preview</h2>
                    <NFTPreview
                        data={data ?? null}
                        isLoading={isLoading}
                        onSaveToVault={handleSaveToVault}
                        onMint={handleMint}
                        isSaving={savePreset.isPending}
                    />
                    {isError && (
                        <p className="mt-4 text-sm text-red-400">
                            {error instanceof Error ? error.message : 'Generation failed'}
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}