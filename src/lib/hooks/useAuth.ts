'use client';

// useAuth — Wallet signature authentication (SIWE-style)
// Backend generates nonce → frontend signs with personal_sign → backend verifies with viem

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useSignMessage } from 'wagmi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

/**
 * Must match the backend's AuthService.buildSignMessage() exactly.
 * If you change this, change the backend too.
 */
function buildSignMessage(nonce: string): string {
    return `Welcome to CRO212HUB!\n\nSign this message to authenticate.\n\nNonce: ${nonce}`;
}

// Shared token storage so all hook instances see the same token
let sharedToken: string | null = null;
let tokenListeners: Array<(token: string | null) => void> = [];

function notifyListeners(token: string | null) {
    sharedToken = token;
    tokenListeners.forEach((fn) => fn(token));
}

export function useAuth() {
    const { address, isConnected } = useAppKitAccount();
    const { signMessageAsync } = useSignMessage();
    const [token, setToken] = useState<string | null>(sharedToken);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const authenticatingRef = useRef(false);

    // Subscribe to shared token changes
    useEffect(() => {
        const listener = (newToken: string | null) => {
            setToken(newToken);
        };
        tokenListeners.push(listener);

        // Sync on mount
        if (sharedToken && !token) {
            setToken(sharedToken);
        }

        return () => {
            tokenListeners = tokenListeners.filter((fn) => fn !== listener);
        };
    }, []);

    // Clear token when wallet disconnects or changes
    useEffect(() => {
        if (!isConnected) {
            notifyListeners(null);
        }
    }, [isConnected, address]);

    const authenticate = useCallback(async (): Promise<string | null> => {
        if (!address || !isConnected) {
            setError('Wallet not connected');
            return null;
        }

        // Return cached token
        if (sharedToken) return sharedToken;

        // Prevent duplicate auth calls
        if (authenticatingRef.current) {
            return new Promise((resolve) => {
                const check = setInterval(() => {
                    if (!authenticatingRef.current) {
                        clearInterval(check);
                        resolve(sharedToken);
                    }
                }, 100);
            });
        }

        try {
            authenticatingRef.current = true;
            setLoading(true);
            setError(null);

            // Step 1 — Get nonce from backend
            const nonceRes = await fetch(`${API_URL}/auth/nonce`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address }),
            });

            if (!nonceRes.ok) {
                throw new Error('Failed to get nonce');
            }

            const { nonce } = await nonceRes.json();

            // Step 2 — Sign the message with wallet (personal_sign / EIP-191)
            const message = buildSignMessage(nonce);
            const signature = await signMessageAsync({ message });

            // Step 3 — Send signature to backend for verification + JWT
            const verifyRes = await fetch(`${API_URL}/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: address,
                    signature,
                    nonce,
                }),
            });

            if (!verifyRes.ok) {
                throw new Error('Signature verification failed');
            }

            const { token: newToken } = await verifyRes.json();
            notifyListeners(newToken);
            return newToken;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Authentication failed';
            setError(message);
            return null;
        } finally {
            setLoading(false);
            authenticatingRef.current = false;
        }
    }, [address, isConnected, signMessageAsync]);

    const clearToken = useCallback(() => {
        notifyListeners(null);
    }, []);

    return {
        token,
        authenticate,
        clearToken,
        loading,
        error,
        isAuthenticated: !!token,
    };
}