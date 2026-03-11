'use client';

// FeatureGate - Wraps content behind a feature flag check

import { useFeatureFlag } from '@/lib/hooks/useFeatureFlags';

interface FeatureGateProps {
    flag: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

function DefaultFallback() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="mx-auto max-w-md text-center">
                <div className="mb-4 text-5xl">🚧</div>
                <h2 className="mb-2 text-xl font-bold text-foreground">
                    Feature Unavailable
                </h2>
                <p className="text-sm text-muted-foreground">
                    This feature is currently disabled. Please check back later or
                    contact support if you believe this is an error.
                </p>
            </div>
        </div>
    );
}

export function FeatureGate({ flag, children, fallback }: FeatureGateProps) {
    const isEnabled = useFeatureFlag(flag);

    if (!isEnabled) {
        return fallback ?? <DefaultFallback />;
    }

    return <>{children}</>;
}
