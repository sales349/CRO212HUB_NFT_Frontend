'use client';

// useTxToast — Transaction lifecycle toast hook
// 3 states: Pending → Confirmed/Failed, with Cronoscan links

import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

const EXPLORER_BASE = 'https://explorer.cronos.org/testnet/tx/';

interface TxToastOptions {
    pendingMessage?: string;
    confirmedMessage?: string;
    failedMessage?: string;
}

export function useTxToast() {
    const toastIdRef = useRef<string | number | undefined>(undefined);

    const pending = useCallback((hash?: string, options?: TxToastOptions) => {
        const message = options?.pendingMessage || 'Transaction submitted…';
        const id = toast.loading(message, {
            description: hash ? `Tx: ${hash.slice(0, 10)}…${hash.slice(-8)}` : 'Waiting for confirmation',
            duration: Infinity,
        });
        toastIdRef.current = id;
        return id;
    }, []);

    const confirmed = useCallback((hash: string, options?: TxToastOptions) => {
        const message = options?.confirmedMessage || 'Transaction confirmed!';
        const explorerUrl = `${EXPLORER_BASE}${hash}`;

        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
        }

        toast.success(message, {
            description: 'View on Cronoscan',
            action: {
                label: 'View',
                onClick: () => window.open(explorerUrl, '_blank'),
            },
            duration: 8000,
        });

        toastIdRef.current = undefined;
    }, []);

    const failed = useCallback((error?: string, options?: TxToastOptions) => {
        const message = options?.failedMessage || 'Transaction failed';

        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
        }

        toast.error(message, {
            description: error || 'Please try again',
            duration: 6000,
        });

        toastIdRef.current = undefined;
    }, []);

    return { pending, confirmed, failed };
}
