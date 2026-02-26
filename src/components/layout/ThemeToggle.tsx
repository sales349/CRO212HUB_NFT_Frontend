'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-9 w-9" />;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-border',
                'transition-colors hover:bg-muted',
            )}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
            ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
            )}
        </button>
    );
}