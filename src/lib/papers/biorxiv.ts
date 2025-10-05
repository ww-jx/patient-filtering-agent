/**
 * bioRxiv paper utilities
 * Similar to medRxiv but for biological sciences
 */

import { ParsedPaperId, PaperUrls } from './types';

/**
 * bioRxiv DOI validation pattern
 * Matches: 10.1101/YYYY.MM.DD.NNNNNNNNvN (same as medRxiv)
 * Example: 10.1101/2025.03.13.642940v2
 */
export const BIORXIV_DOI_PATTERN = /^10\.1101\/\d{4}\.\d{2}\.\d{2}\.\d{6}v\d+$/i;

/**
 * Parse bioRxiv DOI from various input formats
 */
export function parseBiorxivId(input: string | string[] | undefined): ParsedPaperId {
  let biorxivId: string;
  
  if (typeof input === 'string') {
    biorxivId = input;
  } else if (Array.isArray(input) && input.length > 0) {
    biorxivId = input.join('/');
  } else {
    return {
      id: '',
      isValid: false,
      source: 'biorxiv'
    };
  }
  
  // Remove .full.pdf extension if present
  biorxivId = biorxivId.replace(/\.full\.pdf$/, '');
  
  const isValid = BIORXIV_DOI_PATTERN.test(biorxivId);
  
  if (!isValid) {
    return {
      id: biorxivId,
      isValid: false,
      source: 'biorxiv'
    };
  }
  
  // Extract components
  const parts = biorxivId.replace('10.1101/', '').split('.');
  const date = parts.length >= 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : null;
  
  // Extract version from last part (e.g., "642940v2")
  const lastPart = parts[parts.length - 1];
  const versionMatch = lastPart.match(/^(\d+)(v\d+)$/);
  const version = versionMatch ? versionMatch[2] : null;
  
  return {
    id: biorxivId,
    isValid: true,
    source: 'biorxiv',
    metadata: {
      date,
      version
    }
  };
}

/**
 * Generate URLs for bioRxiv paper
 */
export function getBiorxivUrls(biorxivId: string, baseUrl?: string): PaperUrls {
  const pdfUrl = `https://www.biorxiv.org/content/${biorxivId}.full.pdf`;
  const abstractUrl = `https://www.biorxiv.org/content/${biorxivId}`;
  
  // Use proxy to avoid CORS issues
  // For server-side rendering, we need to construct the full URL
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  
  // Construct proxy URL - needs to be absolute for PDF.js viewer
  let proxyUrl: string;
  if (origin) {
    proxyUrl = `${origin}/api/pdf-proxy?id=${encodeURIComponent(biorxivId)}&source=biorxiv`;
  } else {
    // Fallback: use relative URL that will be resolved by the client
    proxyUrl = `/api/pdf-proxy?id=${encodeURIComponent(biorxivId)}&source=biorxiv`;
  }
  
  const encodedPdfUrl = encodeURIComponent(proxyUrl);
  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodedPdfUrl}&sidebarViewOnLoad=0`;
  const fileName = `biorxiv-${biorxivId.replace(/[./]/g, '-').toLowerCase()}`;
  
  return {
    pdfUrl,
    abstractUrl,
    viewerUrl,
    fileName
  };
}

/**
 * Validate if a string is a valid bioRxiv DOI
 */
export function isValidBiorxivId(input: string): boolean {
  return BIORXIV_DOI_PATTERN.test(input);
}

/**
 * Get bioRxiv-specific prompt context for AI interactions
 */
export function getBiorxivContext(): string {
  return 'You are a biological sciences research expert helping users understand research papers. Focus on experimental methods, biological mechanisms, molecular biology, genetics, neuroscience, and other life sciences topics. Explain scientific terminology clearly and highlight key findings and their implications for the field.';
}
