'use client';

// BuyModal — Fee breakdown dialog for purchasing NFTs
// Reads on-chain data from CRO212Marketplace contract
// Shows: Price, Buyer Fee (3%), Total, Gas Estimate, Seller Proceeds

import { useEffect, useCallback } from 'react';
import { formatEther, parseEther } from 'viem';
import { useReadBuyerTotal, useReadSellerProceeds, useBuyNFT } from '@/lib/hooks/useMarketplaceContract';
import { Loader2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

interface BuyModalProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: number;
    nftName: string;
    nftImage?: string;
    price: string; // in CRO (display string)
}

export function BuyModal({ isOpen, onClose, listingId, nftName, nftImage, price }: BuyModalProps) {
    const listingIdBigInt = BigInt(listingId);

    // Contract reads
    const { data: buyerTotal, isLoading: buyerTotalLoading } = useReadBuyerTotal(listingIdBigInt);
    const { data: sellerProceedsData, isLoading: sellerProceedsLoading } = useReadSellerProceeds(listingIdBigInt);

    // Buy hook
    const { buy, isPending, isConfirming, isSuccess } = useBuyNFT();

    const isLoading = buyerTotalLoading || sellerProceedsLoading;

    // Derived values
    const buyerTotalFormatted = buyerTotal ? formatEther(buyerTotal) : '—';
    const priceWei = parseEther(price);
    const buyerFee = buyerTotal ? formatEther(buyerTotal - priceWei) : '—';

    // Seller proceeds breakdown (tuple return: [sellerProceeds, sellerFee, royaltyAmount, royaltyReceiver])
    const sellerProceeds = sellerProceedsData ? formatEther(sellerProceedsData[0]) : '—';
    const sellerFee = sellerProceedsData ? formatEther(sellerProceedsData[1]) : '—';
    const royaltyAmount = sellerProceedsData ? formatEther(sellerProceedsData[2]) : '—';

    const handleBuy = useCallback(async (): Promise<void> => {
        if (!buyerTotal) return;
        try {
            await buy(listingIdBigInt, buyerTotal);
        } catch {
            // Error already handled by useBuyNFT toast
        }
    }, [buy, listingIdBigInt, buyerTotal]);

    // Close on success after short delay
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => onClose(), 2000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [isSuccess, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Confirm Purchase</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* NFT Preview */}
                <div className="mb-5 flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
                    {nftImage && (
                        <img
                            src={nftImage}
                            alt={nftName}
                            className="h-16 w-16 rounded-lg object-cover"
                        />
                    )}
                    <div>
                        <p className="text-sm text-gray-400">You are buying</p>
                        <p className="text-lg font-semibold text-white">{nftName}</p>
                    </div>
                </div>

                {/* Fee Breakdown */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2 text-gray-400">Loading fee data…</span>
                    </div>
                ) : (
                    <div className="mb-5 space-y-3">
                        {/* Price row */}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">NFT Price</span>
                            <span className="text-white">{price} CRO</span>
                        </div>

                        {/* Buyer fee row */}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                                Service Fee <span className="text-xs text-gray-500">(3%)</span>
                            </span>
                            <span className="text-yellow-400">+{buyerFee} CRO</span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10" />

                        {/* Total row */}
                        <div className="flex justify-between text-base font-bold">
                            <span className="text-white">Total You Pay</span>
                            <span className="text-green-400">{buyerTotalFormatted} CRO</span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10" />

                        {/* Seller breakdown */}
                        <div className="space-y-2 rounded-xl bg-white/5 p-3">
                            <p className="text-xs font-semibold uppercase text-gray-500">Seller Breakdown</p>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Seller Receives</span>
                                <span className="text-white">{sellerProceeds} CRO</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Seller Fee (3%)</span>
                                <span className="text-gray-300">−{sellerFee} CRO</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Creator Royalty</span>
                                <span className="text-gray-300">−{royaltyAmount} CRO</span>
                            </div>
                        </div>

                        {/* Trust signal */}
                        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-2.5 text-xs text-green-400">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            <span>
                                Fees enforced on-chain by CRO212Marketplace smart contract
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={handleBuy}
                    disabled={isPending || isConfirming || isLoading || !buyerTotal}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 font-semibold text-white transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sign in Wallet…
                        </>
                    ) : isConfirming ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Confirming…
                        </>
                    ) : isSuccess ? (
                        <>
                            ✓ Purchased!
                        </>
                    ) : (
                        <>
                            Buy Now
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>

                {/* Fee transparency link */}
                <p className="mt-3 text-center text-xs text-gray-500">
                    <a href="/fees" className="inline-flex items-center gap-1 text-gray-400 transition hover:text-white">
                        View full fee transparency
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </p>
            </div>
        </div>
    );
}
