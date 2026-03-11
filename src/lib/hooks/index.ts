// Hooks - Central export file

export { useProjects, useProject, useCreateProject } from './useProjects';
export { useTraits, useUploadTraits } from './useTraits';
export { useGeneration, useTokens } from './useGeneration';
export { useRarity } from './useRarity';
export { useAuth } from './useAuth';
export { useGenerateNFT } from './useGenerateNFT';
export {
    useVaultPresets,
    usePreset,
    useSavePreset,
    useDeletePreset,
    useRemixPreset,
    useAvatarData,
} from './useVault';
export {
    useListings,
    useListing,
    useMarketStats,
    useCreateListing,
    useCancelListing,
} from './useMarketplace';
export { useReputation } from './useReputation';
export { useFeatureFlags, useFeatureFlag, useToggleFlag } from './useFeatureFlags';
export { useFees } from './useFees';

// Week 5 — On-chain hooks
export { useTxToast } from './useTxToast';
export {
    useReadMintPrice,
    useReadTotalSupply,
    useReadMaxSupply,
    useReadSaleActive,
    useReadBalanceOf,
    useReadRoyaltyInfo,
    useMintPublic,
} from './useContract';
export {
    useReadBuyerTotal,
    useReadSellerProceeds,
    useReadListing,
    useReadFeeInfo,
    useBuyNFT,
    useListNFT,
    useCancelOnChainListing,
} from './useMarketplaceContract';
export {
    useWatchSaleEvents,
    useWatchListedEvents,
    useWatchCancelledEvents,
    useWatchMintEvents,
    useMarketplaceEvents,
} from './useContractEvents';
