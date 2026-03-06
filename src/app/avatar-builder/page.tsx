'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Download, Share2, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppKitAccount } from '@reown/appkit/react';
import { Skeleton } from '@/components/ui/Skeleton';
import { RarityBadge } from '@/components/mint/RarityBadge';
import { useAvatarData, useAuth } from '@/lib/hooks';
import { cn } from '@/lib/utils/cn';

type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'none';

export default function AvatarBuilderPage() {
    const searchParams = useSearchParams();
    const presetId = searchParams.get('preset');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { isConnected } = useAppKitAccount();
    const { authenticate, token } = useAuth();
    const { data: avatarData, isLoading } = useAvatarData(presetId);

    const [badgePosition, setBadgePosition] = useState<BadgePosition>('bottom-right');
    const [isExporting, setIsExporting] = useState(false);

    // Auto-authenticate
    useEffect(() => {
        if (isConnected && !token) {
            authenticate();
        }
    }, [isConnected, token, authenticate]);

    const handleExport = async () => {
        if (!avatarData?.gatewayUrl) return;

        setIsExporting(true);

        try {
            const canvas = canvasRef.current;
            if (!canvas) throw new Error('Canvas not found');

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context not found');

            // Load image
            const img = new window.Image();
            img.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = avatarData.gatewayUrl!;
            });

            // Draw image
            canvas.width = 512;
            canvas.height = 512;
            ctx.drawImage(img, 0, 0, 512, 512);

            // Draw badge if not 'none'
            if (badgePosition !== 'none') {
                const badgeText = avatarData.rarity.rank;
                ctx.font = 'bold 24px sans-serif';
                ctx.textBaseline = 'middle';

                const textWidth = ctx.measureText(badgeText).width;
                const padding = 12;
                const badgeWidth = textWidth + padding * 2;
                const badgeHeight = 32;

                let x = 16;
                let y = 16;

                switch (badgePosition) {
                    case 'top-right':
                        x = 512 - badgeWidth - 16;
                        break;
                    case 'bottom-left':
                        y = 512 - badgeHeight - 16;
                        break;
                    case 'bottom-right':
                        x = 512 - badgeWidth - 16;
                        y = 512 - badgeHeight - 16;
                        break;
                }

                // Badge background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.roundRect(x, y, badgeWidth, badgeHeight, 8);
                ctx.fill();

                // Badge text
                ctx.fillStyle = '#00D1FF';
                ctx.fillText(badgeText, x + padding, y + badgeHeight / 2);
            }

            // Download
            const link = document.createElement('a');
            link.download = `${avatarData.name}-avatar.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast.success('Avatar exported!');
        } catch (err) {
            toast.error('Failed to export avatar');
            console.error(err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleShareTelegram = () => {
        if (!avatarData) return;

        const text = `Check out my CRO212HUB NFT Avatar: ${avatarData.name} (${avatarData.rarity.rank})`;
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

        window.open(telegramUrl, '_blank');
    };

    if (!isConnected) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-foreground">Avatar Builder</h1>
                <p className="mt-4 text-muted-foreground">
                    Connect your wallet to build your avatar.
                </p>
            </div>
        );
    }

    if (!presetId) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                <User className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <h1 className="mt-4 text-3xl font-bold text-foreground">Avatar Builder</h1>
                <p className="mt-4 text-muted-foreground">
                    Select a preset from your vault to build an avatar.
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

    if (isLoading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-10">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="flex justify-center">
                    <Skeleton className="h-[512px] w-[512px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
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
                <h1 className="text-3xl font-bold text-foreground">Avatar Builder</h1>
                <p className="mt-2 text-muted-foreground">
                    Customize and export your 512×512 avatar
                </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                {/* Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center"
                >
                    <div className="relative">
                        {avatarData?.gatewayUrl ? (
                            <Image
                                src={avatarData.gatewayUrl}
                                alt={avatarData.name}
                                width={512}
                                height={512}
                                className="rounded-xl border border-border"
                                unoptimized
                            />
                        ) : (
                            <div className="flex h-[512px] w-[512px] items-center justify-center rounded-xl border border-border bg-background-secondary">
                                <User className="h-24 w-24 text-muted-foreground/50" />
                            </div>
                        )}

                        {/* Badge Overlay Preview */}
                        {avatarData && badgePosition !== 'none' && (
                            <div
                                className={cn(
                                    'absolute px-3 py-1.5 rounded-lg bg-black/70',
                                    badgePosition === 'top-left' && 'top-4 left-4',
                                    badgePosition === 'top-right' && 'top-4 right-4',
                                    badgePosition === 'bottom-left' && 'bottom-4 left-4',
                                    badgePosition === 'bottom-right' && 'bottom-4 right-4',
                                )}
                            >
                                <RarityBadge rarity={avatarData.rarity} showScore={false} size="md" />
                            </div>
                        )}

                        {/* Hidden canvas for export */}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                </motion.div>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Info */}
                    {avatarData && (
                        <div className="rounded-xl border border-border bg-background-secondary p-4">
                            <h3 className="font-semibold text-foreground">{avatarData.name}</h3>
                            <div className="mt-2">
                                <RarityBadge rarity={avatarData.rarity} size="sm" />
                            </div>
                        </div>
                    )}

                    {/* Badge Position */}
                    <div className="rounded-xl border border-border bg-background-secondary p-4">
                        <label className="text-sm font-medium text-foreground">Badge Position</label>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'none'] as BadgePosition[]).map(
                                (pos) => (
                                    <button
                                        key={pos}
                                        onClick={() => setBadgePosition(pos)}
                                        className={cn(
                                            'rounded-lg border px-3 py-2 text-xs capitalize transition-colors',
                                            badgePosition === pos
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border text-muted-foreground hover:border-primary/50',
                                        )}
                                    >
                                        {pos.replace('-', ' ')}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleExport}
                            disabled={isExporting || !avatarData}
                            className={cn(
                                'w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground',
                                'transition-opacity hover:opacity-90 disabled:opacity-50',
                            )}
                        >
                            <Download className="h-4 w-4" />
                            {isExporting ? 'Exporting...' : 'Download PNG'}
                        </button>

                        <button
                            onClick={handleShareTelegram}
                            disabled={!avatarData}
                            className={cn(
                                'w-full flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold',
                                'transition-colors hover:bg-muted disabled:opacity-50',
                            )}
                        >
                            <Share2 className="h-4 w-4" />
                            Share to Telegram
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}