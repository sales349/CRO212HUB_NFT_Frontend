// Generator and Vault Types

export interface TraitSelection {
    background: string;
    body: string;
    eyes: string;
    mouth: string;
    accessories: string;
    special: string;
}

export interface RarityResult {
    score: number;
    rank: 'Legendary' | 'Epic' | 'Rare' | 'Uncommon' | 'Common';
    breakdown: Record<string, number>;
}

export interface GenerateRequest {
    prompt: string;
    traits: TraitSelection;
    chainId?: number;
    saveToVault?: boolean;
}

export interface GenerateResponse {
    imageUrl: string;
    metadataUrl: string;
    gatewayUrl: string;
    metadata: {
        name: string;
        description: string;
        image: string;
        attributes: Array<{
            trait_type: string;
            value: string;
            rarity_percentage: number;
        }>;
        properties: {
            creator: string;
            collection: string;
            chainId: number;
            engine: string;
            generatedAt: string;
        };
    };
    rarity: RarityResult;
}

export interface Preset {
    _id: string;
    walletAddress: string;
    name: string;
    prompt: string;
    traits: TraitSelection;
    rarity: RarityResult;
    imageUrl: string;
    metadataUrl: string;
    gatewayUrl?: string;
    isRemix?: boolean;
    sourcePresetId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SavePresetRequest {
    name: string;
    prompt: string;
    traits: TraitSelection;
    rarity: RarityResult;
    imageUrl: string;
    metadataUrl: string;
    gatewayUrl?: string;
}

export interface RemixRequest {
    sourcePresetId: string;
    newTraits: Partial<TraitSelection>;
    newPrompt?: string;
    saveToVault?: boolean;
}

export interface ListPresetsQuery {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'rarity';
}

export interface ListPresetsResponse {
    success: boolean;
    presets: Preset[];
    total: number;
    page: number;
    limit: number;
}

export interface AvatarConfig {
    width: number;
    height: number;
    format: string;
    badgePosition: string;
}

export interface AvatarDataResponse {
    success: boolean;
    presetId: string;
    name: string;
    imageUrl: string;
    gatewayUrl?: string;
    traits: TraitSelection;
    rarity: RarityResult;
    avatarConfig: AvatarConfig;
}

// Trait options for dropdowns
// Trait options for dropdowns - MUST match backend trait-weights.config.ts
export const TRAIT_OPTIONS: Record<keyof TraitSelection, string[]> = {
    background: ['plain_white', 'silver', 'midnight', 'forest', 'ocean', 'sunset', 'nebula', 'cosmic'],
    body: ['basic', 'clay', 'wood', 'marble', 'obsidian', 'chrome', 'gold', 'diamond'],
    eyes: ['normal', 'amber', 'ruby', 'emerald', 'ice', 'fire', 'galaxy', 'laser'],
    mouth: ['open', 'frown', 'neutral', 'smirk', 'smile', 'gold_teeth', 'fangs', 'diamond_grill'],
    accessories: ['none', 'cap', 'headband', 'earring', 'monocle', 'horns', 'halo', 'crown'],
    special: ['none', 'mystic_runes', 'ice_shield', 'fire_wings', 'shadow_cloak', 'rainbow_trail', 'lightning_aura'],
};

export const RARITY_COLORS: Record<string, string> = {
    Legendary: '#FFD700',
    Epic: '#A855F7',
    Rare: '#3B82F6',
    Uncommon: '#22C55E',
    Common: '#6B7280',
};