/**
 * medRxiv paper utilities
 * Adapted from asxiv/src/utils/medrxivUtils.ts
 */

import { ParsedPaperId, PaperUrls } from './types';

/**
 * medRxiv DOI validation pattern
 * Matches: 10.1101/YYYY.MM.DD.NNNNNNNNvN
 * Example: 10.1101/2025.09.29.25336681v1
 */
export const MEDRXIV_DOI_PATTERN = /^10\.1101\/\d{4}\.\d{2}\.\d{2}\.\d{8}v\d+$/i;

/**
 * Parse medRxiv DOI from various input formats
 */
export function parseMedrxivId(input: string | string[] | undefined): ParsedPaperId {
  let medrxivId: string;
  
  if (typeof input === 'string') {
    medrxivId = input;
  } else if (Array.isArray(input) && input.length > 0) {
    medrxivId = input.join('/');
  } else {
    return {
      id: '',
      isValid: false,
      source: 'medrxiv'
    };
  }
  
  // Remove .full.pdf extension if present
  medrxivId = medrxivId.replace(/\.full\.pdf$/, '');
  
  const isValid = MEDRXIV_DOI_PATTERN.test(medrxivId);
  
  if (!isValid) {
    return {
      id: medrxivId,
      isValid: false,
      source: 'medrxiv'
    };
  }
  
  // Extract components
  const parts = medrxivId.replace('10.1101/', '').split('.');
  const date = parts.length >= 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : null;
  
  // Extract version from last part (e.g., "25336681v1")
  const lastPart = parts[parts.length - 1];
  const versionMatch = lastPart.match(/^(\d+)(v\d+)$/);
  const version = versionMatch ? versionMatch[2] : null;
  
  return {
    id: medrxivId,
    isValid: true,
    source: 'medrxiv',
    metadata: {
      date,
      version
    }
  };
}

/**
 * Generate URLs for medRxiv paper
 */
export function getMedrxivUrls(medrxivId: string, baseUrl?: string): PaperUrls {
  const pdfUrl = `https://www.medrxiv.org/content/${medrxivId}.full.pdf`;
  const abstractUrl = `https://www.medrxiv.org/content/${medrxivId}`;
  
  // Use proxy to avoid CORS issues
  // For server-side rendering, we need to construct the full URL
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  
  // Construct proxy URL - needs to be absolute for PDF.js viewer
  let proxyUrl: string;
  if (origin) {
    proxyUrl = `${origin}/api/pdf-proxy?id=${encodeURIComponent(medrxivId)}&source=medrxiv`;
  } else {
    // Fallback: use relative URL that will be resolved by the client
    proxyUrl = `/api/pdf-proxy?id=${encodeURIComponent(medrxivId)}&source=medrxiv`;
  }
  
  const encodedPdfUrl = encodeURIComponent(proxyUrl);
  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodedPdfUrl}&sidebarViewOnLoad=0`;
  const fileName = `medrxiv-${medrxivId.replace(/[./]/g, '-').toLowerCase()}`;
  
  return {
    pdfUrl,
    abstractUrl,
    viewerUrl,
    fileName
  };
}

/**
 * Validate if a string is a valid medRxiv DOI
 */
export function isValidMedrxivId(input: string): boolean {
  return MEDRXIV_DOI_PATTERN.test(input);
}

/**
 * Get medRxiv-specific prompt context for AI interactions
 */
export function getMedrxivContext(): string {
  return 'You are a medical research expert helping users understand and analyze health sciences research papers. Focus on clinical findings, methodology, study populations, statistical analysis, and clinical implications. Explain medical terminology clearly and highlight key takeaways for healthcare practitioners and researchers.';
}
