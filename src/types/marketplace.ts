// Marketplace Types

export type ListingStatus = 'active' | 'sold' | 'cancelled';

export interface Listing {
    _id: string;
    tokenId: string;
    seller: string;
    price: number;
    currency: string;
    status: ListingStatus;
    isSecondary: boolean;
    name: string;
    description: string;
    traits: {
        background: string;
        body: string;
        eyes: string;
        mouth: string;
        accessories: string;
        special: string;
    };
    rarity: {
        score: number;
        rank: 'Legendary' | 'Epic' | 'Rare' | 'Uncommon' | 'Common';
        breakdown: Record<string, number>;
    };
    imageUrl: string;
    metadataUrl: string;
    gatewayUrl?: string;
    collectionAddress: string;
    chainId: number;
    buyerAddress?: string;
    soldAt?: string;
    cancelledAt?: string;
    viewCount: number;
    onChainListingId?: number; // Week 5: on-chain listing ID from CRO212Marketplace
    createdAt: string;
    updatedAt: string;
}

export interface ListingsQuery {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rarity';
    status?: 'active' | 'sold' | 'cancelled' | 'all';
    minPrice?: number;
    maxPrice?: number;
    rarityRank?: 'Legendary' | 'Epic' | 'Rare' | 'Uncommon' | 'Common';
    seller?: string;
    collectionAddress?: string;
    search?: string;
}

export interface ListingsResponse {
    success: boolean;
    listings: Listing[];
    total: number;
    page: number;
    limit: number;
}

export interface MarketStats {
    totalListings: number;
    activeListings: number;
    totalVolume: number;
    floorPrice: number | null;
    averagePrice: number | null;
}

export interface CreateListingRequest {
    tokenId: string;
    price: number;
    currency?: string;
    isSecondary?: boolean;
    name: string;
    description?: string;
    traits: {
        background: string;
        body: string;
        eyes: string;
        mouth: string;
        accessories: string;
        special: string;
    };
    rarity: {
        score: number;
        rank: string;
        breakdown: Record<string, number>;
    };
    imageUrl: string;
    metadataUrl: string;
    gatewayUrl?: string;
    collectionAddress: string;
    chainId?: number;
}
