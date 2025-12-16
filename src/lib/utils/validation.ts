// Validation Utilities

import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

/**
 * Validate Ethereum address
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate project name
 * @param name - Project name
 * @returns Error message or null if valid
 */
export function validateProjectName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Project name is required';
  }
  if (name.length < 3) {
    return 'Project name must be at least 3 characters';
  }
  if (name.length > 100) {
    return 'Project name must be less than 100 characters';
  }
  return null;
}

/**
 * Validate project symbol
 * @param symbol - Project symbol
 * @returns Error message or null if valid
 */
export function validateProjectSymbol(symbol: string): string | null {
  if (!symbol || symbol.trim().length === 0) {
    return 'Symbol is required';
  }
  if (symbol.length < 2) {
    return 'Symbol must be at least 2 characters';
  }
  if (symbol.length > 10) {
    return 'Symbol must be less than 10 characters';
  }
  if (!/^[A-Z0-9]+$/.test(symbol)) {
    return 'Symbol must contain only uppercase letters and numbers';
  }
  return null;
}

/**
 * Validate max supply
 * @param maxSupply - Max supply value
 * @returns Error message or null if valid
 */
export function validateMaxSupply(maxSupply: number | string): string | null {
  const num = typeof maxSupply === 'string' ? parseInt(maxSupply) : maxSupply;

  if (isNaN(num)) {
    return 'Max supply must be a number';
  }
  if (num < 1) {
    return 'Max supply must be at least 1';
  }
  if (num > 1000000) {
    return 'Max supply cannot exceed 1,000,000';
  }
  return null;
}

/**
 * Validate mint price
 * @param mintPrice - Mint price value
 * @returns Error message or null if valid
 */
export function validateMintPrice(mintPrice: number | string): string | null {
  const num = typeof mintPrice === 'string' ? parseFloat(mintPrice) : mintPrice;

  if (isNaN(num)) {
    return 'Mint price must be a number';
  }
  if (num < 0) {
    return 'Mint price cannot be negative';
  }
  return null;
}

/**
 * Validate file for upload
 * @param file - File to validate
 * @returns Error message or null if valid
 */
export function validateFile(file: File): string | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Only PNG files are allowed';
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'png') {
    return 'File must have .png extension';
  }

  return null;
}

/**
 * Validate multiple files for upload
 * @param files - Files to validate
 * @returns Error message or null if valid
 */
export function validateFiles(files: File[]): string | null {
  if (files.length === 0) {
    return 'Please select at least one file';
  }

  for (const file of files) {
    const error = validateFile(file);
    if (error) {
      return `${file.name}: ${error}`;
    }
  }

  return null;
}

/**
 * Validate email address
 * @param email - Email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
