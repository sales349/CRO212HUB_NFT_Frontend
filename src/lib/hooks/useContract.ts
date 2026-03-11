'use client';

// useContract — wagmi hooks for LaunchpadCollection contract reads/writes

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Address } from 'viem';
import { LAUNCHPAD_COLLECTION_ABI, NFT_CONTRACT_ADDRESS } from '@/lib/contracts/nft-contract';
import { useTxToast } from './useTxToast';
import { useCallback, useEffect, useRef } from 'react';

// ========= Read Hooks =========

export function useReadMintPrice() {
    return useReadContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: LAUNCHPAD_COLLECTION_ABI,
        functionName: 'mintPrice',
        query: { enabled: !!NFT_CONTRACT_ADDRESS },
    });
}

export function useReadTotalSupply() {
    return useReadContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: LAUNCHPAD_COLLECTION_ABI,
        functionName: 'totalSupply',
        query: { enabled: !!NFT_CONTRACT_ADDRESS },
    });
}

export function useReadMaxSupply() {
    return useReadContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: LAUNCHPAD_COLLECTION_ABI,
        functionName: 'maxSupply',
        query: { enabled: !!NFT_CONTRACT_ADDRESS },
    });
}

export function useReadSaleActive() {
    return useReadContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: LAUNCHPAD_COLLECTION_ABI,
        functionName: 'saleActive',
        query: { enabled: !!NFT_CONTRACT_ADDRESS },
    });
}

export function useReadBalanceOf(owner: Address | undefined) {
    return useReadContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: LAUNCHPAD_COLLECTION_ABI,
        functionName: 'balanceOf',
        args: owner ? [owner] : undefined,
        query: { enabled: !!NFT_CONTRACT_ADDRESS && !!owner },
    });
}

export function useReadRoyaltyInfo(tokenId: bigint | undefined, salePrice: bigint | undefined) {
    return useReadContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: LAUNCHPAD_COLLECTION_ABI,
        functionName: 'royaltyInfo',
        args: tokenId !== undefined && salePrice !== undefined ? [tokenId, salePrice] : undefined,
        query: { enabled: !!NFT_CONTRACT_ADDRESS && tokenId !== undefined && salePrice !== undefined },
    });
}

// ========= Write Hooks =========

export function useMintPublic() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const {
        isLoading: isConfirming,
        isSuccess,
        isError: isReceiptError,
        error: receiptError,
    } = useWaitForTransactionReceipt({ hash });
    const txToast = useTxToast();

    // Track whether we've already handled this hash to avoid repeated toasts
    const handledHashRef = useRef<string | undefined>(undefined);

    const mint = useCallback(async (quantity: number, mintPriceWei: bigint) => {
        try {
            const totalValue = mintPriceWei * BigInt(quantity);
            const txHash = await writeContractAsync({
                address: NFT_CONTRACT_ADDRESS,
                abi: LAUNCHPAD_COLLECTION_ABI,
                functionName: 'mintPublic',
                args: [BigInt(quantity)],
                value: totalValue,
            });

            handledHashRef.current = undefined; // Reset for new tx
            txToast.pending(txHash);
            return txHash;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Mint transaction failed';
            txToast.failed(message);
            throw err;
        }
    }, [writeContractAsync, txToast]);

    // Handle receipt (confirmed OR reverted) via useEffect instead of inline render logic
    useEffect(() => {
        if (!hash || handledHashRef.current === hash) return;

        if (isSuccess) {
            handledHashRef.current = hash;
            txToast.confirmed(hash);
        } else if (isReceiptError) {
            handledHashRef.current = hash;
            const reason = receiptError?.message?.includes('reverted')
                ? 'Transaction reverted on-chain. Check if sale is active and you sent enough CRO.'
                : receiptError?.message || 'Transaction failed on-chain';
            txToast.failed(reason);
        }
    }, [hash, isSuccess, isReceiptError, receiptError, txToast]);

    return { mint, hash, isPending, isConfirming, isSuccess, error };
}
