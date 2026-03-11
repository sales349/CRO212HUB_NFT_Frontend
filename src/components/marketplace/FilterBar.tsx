'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ListingsQuery } from '@/types';

interface FilterBarProps {
    query: ListingsQuery;
    onChange: (query: ListingsQuery) => void;
}

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rarity';
type RarityOption = 'Legendary' | 'Epic' | 'Rare' | 'Uncommon' | 'Common';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'rarity', label: 'Rarity Score' },
];

const RARITY_OPTIONS: RarityOption[] = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];

export function FilterBar({ query, onChange }: FilterBarProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchInput, setSearchInput] = useState(query.search || '');

    const handleSearch = () => {
        onChange({ ...query, search: searchInput || undefined, page: 1 });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const clearFilters = () => {
        setSearchInput('');
        onChange({ sort: 'newest' });
    };

    const hasActiveFilters = query.minPrice !== undefined ||
        query.maxPrice !== undefined ||
        query.rarityRank !== undefined ||
        query.search !== undefined;

    return (
        <div className="space-y-4">
            {/* Search + Sort Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search listings..."
                        className={cn(
                            'w-full rounded-lg border border-border bg-background-secondary py-2.5 pl-10 pr-4 text-sm text-foreground',
                            'placeholder:text-muted-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                        )}
                    />
                </div>

                {/* Sort */}
                <select
                    value={query.sort || 'newest'}
                    onChange={(e) => onChange({ ...query, sort: e.target.value as SortOption, page: 1 })}
                    className="rounded-lg border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground outline-none"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                {/* Toggle Filters */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                        showFilters
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50',
                    )}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">!</span>
                    )}
                </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="rounded-xl border border-border bg-background-secondary p-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        {/* Price Range */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase">Price Range (CRO)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    min={0}
                                    value={query.minPrice ?? ''}
                                    onChange={(e) => onChange({
                                        ...query,
                                        minPrice: e.target.value ? Number(e.target.value) : undefined,
                                        page: 1,
                                    })}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    min={0}
                                    value={query.maxPrice ?? ''}
                                    onChange={(e) => onChange({
                                        ...query,
                                        maxPrice: e.target.value ? Number(e.target.value) : undefined,
                                        page: 1,
                                    })}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        {/* Rarity Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase">Rarity</label>
                            <select
                                value={query.rarityRank || ''}
                                onChange={(e) => onChange({
                                    ...query,
                                    rarityRank: (e.target.value || undefined) as RarityOption | undefined,
                                    page: 1,
                                })}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                            >
                                <option value="">All Rarities</option>
                                {RARITY_OPTIONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear */}
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-3 w-3" />
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
