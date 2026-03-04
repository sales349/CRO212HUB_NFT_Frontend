// Zod Form Schemas — Validation for all user-facing forms
// Uses Zod v4 (installed: zod@^4.3.6)

import { z } from 'zod';
import { TRAIT_OPTIONS, type TraitSelection } from '@/types/generator';

// ─── Trait Selection Schema ────────────────────────────────────────────────

const traitCategories = Object.keys(TRAIT_OPTIONS) as Array<keyof TraitSelection>;

export const traitSelectionSchema = z.object(
    Object.fromEntries(
        traitCategories.map((category) => [
            category,
            z.enum(TRAIT_OPTIONS[category] as [string, ...string[]], {
                message: `Invalid ${category} trait selected`,
            }),
        ]),
    ),
) as unknown as z.ZodType<TraitSelection>;

// ─── Generate Form Schema ──────────────────────────────────────────────────

export const generateFormSchema = z.object({
    prompt: z
        .string()
        .trim()
        .min(1, 'Please enter a description for your NFT')
        .max(500, 'Description must be 500 characters or less'),
    traits: traitSelectionSchema,
    chainId: z.number().int().positive().optional(),
    saveToVault: z.boolean().optional(),
});

export type GenerateFormData = z.infer<typeof generateFormSchema>;

// ─── Listing Price Schema ──────────────────────────────────────────────────

export const listingPriceSchema = z.object({
    price: z
        .number({
            error: 'Price must be a number',
        })
        .positive('Price must be greater than 0')
        .max(1_000_000, 'Price cannot exceed 1,000,000 CRO')
        .multipleOf(0.01, 'Price can have at most 2 decimal places'),
});

export type ListingPriceData = z.infer<typeof listingPriceSchema>;

// ─── Remix Form Schema ─────────────────────────────────────────────────────

export const remixFormSchema = z.object({
    sourcePresetId: z.string().min(1, 'Source preset is required'),
    newTraits: z.object({
        background: z.string().optional(),
        body: z.string().optional(),
        eyes: z.string().optional(),
        mouth: z.string().optional(),
        accessories: z.string().optional(),
        special: z.string().optional(),
    }).refine(
        (traits) => Object.values(traits).some((v) => v !== undefined),
        { message: 'Please change at least one trait' },
    ),
    newPrompt: z.string().min(1, 'Description cannot be empty').max(500, 'Description must be 500 characters or less').optional(),
    saveToVault: z.boolean().optional(),
});

export type RemixFormData = z.infer<typeof remixFormSchema>;

// ─── Save Preset Schema ────────────────────────────────────────────────────

export const savePresetSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
    prompt: z.string().min(1, 'Prompt is required').max(500, 'Prompt must be 500 characters or less'),
    traits: traitSelectionSchema,
    rarity: z.object({
        score: z.number().min(0).max(100),
        rank: z.enum(['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']),
        breakdown: z.record(z.string(), z.number()),
    }),
    imageUrl: z.string().url('Image URL must be a valid URL'),
    metadataUrl: z.string().url('Metadata URL must be a valid URL'),
    gatewayUrl: z.string().optional(),
});

export type SavePresetData = z.infer<typeof savePresetSchema>;
