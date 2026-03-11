'use client';

// useMarketplaceContract — wagmi hooks for CRO212Marketplace contract reads/writes

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Address } from 'viem';
import { MARKETPLACE_ABI, MARKETPLACE_CONTRACT_ADDRESS } from '@/lib/contracts/marketplace-contract';
import { useTxToast } from './useTxToast';
import { useCallback, useEffect, useRef } from 'react';

// ========= Read Hooks =========

export function useReadBuyerTotal(listingId: bigint | undefined) {
    return useReadContract({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getBuyerTotal',
        args: listingId !== undefined ? [listingId] : undefined,
        query: { enabled: !!MARKETPLACE_CONTRACT_ADDRESS && listingId !== undefined },
    });
}

export function useReadSellerProceeds(listingId: bigint | undefined) {
    return useReadContract({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getSellerProceeds',
        args: listingId !== undefined ? [listingId] : undefined,
        query: { enabled: !!MARKETPLACE_CONTRACT_ADDRESS && listingId !== undefined },
    });
}

export function useReadListing(listingId: bigint | undefined) {
    return useReadContract({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getListing',
        args: listingId !== undefined ? [listingId] : undefined,
        query: { enabled: !!MARKETPLACE_CONTRACT_ADDRESS && listingId !== undefined },
    });
}

export function useReadFeeInfo() {
    return useReadContract({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getFeeInfo',
        query: { enabled: !!MARKETPLACE_CONTRACT_ADDRESS },
    });
}

// ========= Write Hooks =========

export function useBuyNFT() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const {
        isLoading: isConfirming,
        isSuccess,
        isError: isReceiptError,
        error: receiptError,
    } = useWaitForTransactionReceipt({ hash });
    const txToast = useTxToast();
    const handledHashRef = useRef<string | undefined>(undefined);

    const buy = useCallback(async (listingId: bigint, buyerTotal: bigint) => {
        try {
            const txHash = await writeContractAsync({
                address: MARKETPLACE_CONTRACT_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: 'buyNFT',
                args: [listingId],
                value: buyerTotal,
            });

            handledHashRef.current = undefined;
            txToast.pending(txHash, { pendingMessage: 'Purchase submitted…' });
            return txHash;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Buy transaction failed';
            txToast.failed(message);
            throw err;
        }
    }, [writeContractAsync, txToast]);

    useEffect(() => {
        if (!hash || handledHashRef.current === hash) return;

        if (isSuccess) {
            handledHashRef.current = hash;
            txToast.confirmed(hash, { confirmedMessage: 'NFT purchased!' });
        } else if (isReceiptError) {
            handledHashRef.current = hash;
            const reason = receiptError?.message || 'Purchase failed on-chain';
            txToast.failed(reason);
        }
    }, [hash, isSuccess, isReceiptError, receiptError, txToast]);

    return { buy, hash, isPending, isConfirming, isSuccess, error };
}

export function useListNFT() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const {
        isLoading: isConfirming,
        isSuccess,
        isError: isReceiptError,
        error: receiptError,
    } = useWaitForTransactionReceipt({ hash });
    const txToast = useTxToast();
    const handledHashRef = useRef<string | undefined>(undefined);

    const list = useCallback(async (nftContract: Address, tokenId: bigint, price: bigint) => {
        try {
            const txHash = await writeContractAsync({
                address: MARKETPLACE_CONTRACT_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: 'listNFT',
                args: [nftContract, tokenId, price],
            });

            handledHashRef.current = undefined;
            txToast.pending(txHash, { pendingMessage: 'Listing submitted…' });
            return txHash;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'List transaction failed';
            txToast.failed(message);
            throw err;
        }
    }, [writeContractAsync, txToast]);

    useEffect(() => {
        if (!hash || handledHashRef.current === hash) return;

        if (isSuccess) {
            handledHashRef.current = hash;
            txToast.confirmed(hash, { confirmedMessage: 'NFT listed!' });
        } else if (isReceiptError) {
            handledHashRef.current = hash;
            const reason = receiptError?.message || 'Listing failed on-chain';
            txToast.failed(reason);
        }
    }, [hash, isSuccess, isReceiptError, receiptError, txToast]);

    return { list, hash, isPending, isConfirming, isSuccess, error };
}

export function useCancelOnChainListing() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const {
        isLoading: isConfirming,
        isSuccess,
        isError: isReceiptError,
        error: receiptError,
    } = useWaitForTransactionReceipt({ hash });
    const txToast = useTxToast();
    const handledHashRef = useRef<string | undefined>(undefined);

    const cancel = useCallback(async (listingId: bigint) => {
        try {
            const txHash = await writeContractAsync({
                address: MARKETPLACE_CONTRACT_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: 'cancelListing',
                args: [listingId],
            });

            handledHashRef.current = undefined;
            txToast.pending(txHash, { pendingMessage: 'Cancellation submitted…' });
            return txHash;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Cancel transaction failed';
            txToast.failed(message);
            throw err;
        }
    }, [writeContractAsync, txToast]);

    useEffect(() => {
        if (!hash || handledHashRef.current === hash) return;

        if (isSuccess) {
            handledHashRef.current = hash;
            txToast.confirmed(hash, { confirmedMessage: 'Listing cancelled!' });
        } else if (isReceiptError) {
            handledHashRef.current = hash;
            const reason = receiptError?.message || 'Cancellation failed on-chain';
            txToast.failed(reason);
        }
    }, [hash, isSuccess, isReceiptError, receiptError, txToast]);

    return { cancel, hash, isPending, isConfirming, isSuccess, error };
}
