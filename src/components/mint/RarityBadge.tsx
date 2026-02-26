import { Badge } from '@/components/ui/Badge';
import type { RarityResult } from '@/types/generator';

interface RarityBadgeProps {
    rarity: RarityResult;
    showScore?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function RarityBadge({ rarity, showScore = true, size = 'md' }: RarityBadgeProps) {
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    return (
        <Badge variant="rarity" rarity={rarity.rank} className={sizeClasses[size]}>
            {rarity.rank}
            {showScore && (
                <span className="ml-1 opacity-75">({rarity.score.toFixed(1)})</span>
            )}
        </Badge>
    );
}