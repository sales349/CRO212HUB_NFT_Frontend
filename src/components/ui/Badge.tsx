import { cn } from '@/lib/utils/cn';
import { RARITY_COLORS } from '@/types/generator';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'rarity' | 'success' | 'warning' | 'error';
    rarity?: string;
    className?: string;
}

export function Badge({ children, variant = 'default', rarity, className }: BadgeProps) {
    const rarityColor = rarity ? RARITY_COLORS[rarity] : undefined;

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                variant === 'default' && 'bg-muted text-muted-foreground',
                variant === 'success' && 'bg-green-500/20 text-green-400 border border-green-500/30',
                variant === 'warning' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                variant === 'error' && 'bg-red-500/20 text-red-400 border border-red-500/30',
                variant === 'rarity' && 'border',
                className,
            )}
            style={
                variant === 'rarity' && rarityColor
                    ? {
                        backgroundColor: `${rarityColor}20`,
                        color: rarityColor,
                        borderColor: `${rarityColor}50`,
                    }
                    : undefined
            }
        >
            {children}
        </span>
    );
}