/**
 * Unified paper utilities for arXiv, medRxiv, and bioRxiv
 * Provides automatic source detection and routing
 */

import { ParsedPaperId, PaperUrls, PaperSource, PaperSourceConfig } from './types';
import { parseArxivId, getArxivUrls, isValidArxivId, getArxivCategoryContext } from './arxiv';
import { parseMedrxivId, getMedrxivUrls, isValidMedrxivId, getMedrxivContext } from './medrxiv';
import { parseBiorxivId, getBiorxivUrls, isValidBiorxivId, getBiorxivContext } from './biorxiv';

export * from './types';
export * from './arxiv';
export * from './medrxiv';
export * from './biorxiv';

/**
 * Source configuration for each paper provider
 */
export const PAPER_SOURCE_CONFIGS: Record<PaperSource, PaperSourceConfig> = {
  arxiv: {
    name: 'arxiv',
    displayName: 'arXiv',
    baseUrl: 'https://arxiv.org',
    patternDescription: 'e.g., 2510.01309 or cs/0211011',
    aiContext: 'arXiv research paper'
  },
  medrxiv: {
    name: 'medrxiv',
    displayName: 'medRxiv',
    baseUrl: 'https://www.medrxiv.org',
    patternDescription: 'e.g., 10.1101/2023.12.06.23299426v1',
    aiContext: 'medical research preprint'
  },
  biorxiv: {
    name: 'biorxiv',
    displayName: 'bioRxiv',
    baseUrl: 'https://www.biorxiv.org',
    patternDescription: 'e.g., 10.1101/2025.03.13.642940v2',
    aiContext: 'biological sciences preprint'
  }
};

/**
 * Detect paper source from ID format
 */
export function detectPaperSource(paperId: string): PaperSource | null {
  if (isValidArxivId(paperId)) return 'arxiv';
  if (isValidMedrxivId(paperId)) return 'medrxiv';
  if (isValidBiorxivId(paperId)) return 'biorxiv';
  return null;
}

/**
 * Parse paper ID with automatic source detection
 */
export function parsePaperId(input: string | string[] | undefined, explicitSource?: PaperSource): ParsedPaperId {
  // If explicit source provided, use it
  if (explicitSource === 'arxiv') {
    return parseArxivId(input);
  }
  if (explicitSource === 'medrxiv') {
    return parseMedrxivId(input);
  }
  if (explicitSource === 'biorxiv') {
    return parseBiorxivId(input);
  }
  
  // Auto-detect source
  const inputStr = Array.isArray(input) ? input.join('/') : (input || '');
  const source = detectPaperSource(inputStr);
  
  if (source === 'arxiv') {
    return parseArxivId(input);
  }
  if (source === 'medrxiv') {
    return parseMedrxivId(input);
  }
  if (source === 'biorxiv') {
    return parseBiorxivId(input);
  }
  
  // Default to invalid
  return {
    id: inputStr,
    isValid: false,
    source: 'arxiv' // Default fallback
  };
}

/**
 * Get URLs for any paper source
 */
export function getPaperUrls(paperId: string, source: PaperSource, baseUrl?: string): PaperUrls {
  switch (source) {
    case 'arxiv':
      return getArxivUrls(paperId);
    case 'medrxiv':
      return getMedrxivUrls(paperId, baseUrl);
    case 'biorxiv':
      return getBiorxivUrls(paperId, baseUrl);
  }
}

/**
 * Get AI context for paper source
 */
export function getPaperAiContext(parsed: ParsedPaperId): string {
  switch (parsed.source) {
    case 'arxiv':
      return getArxivCategoryContext(parsed.metadata?.category);
    case 'medrxiv':
      return getMedrxivContext();
    case 'biorxiv':
      return getBiorxivContext();
  }
}

/**
 * Process page references in content for clickable links
 * Handles multiple formats:
 * - (page 5)
 * - (pages 5-7)
 * - (p. 5)
 * - (pp. 5-7)
 * - on page 5
 * - see page 5
 */
export function processPageReferences(content: string): string {
  // Replace various page reference patterns
  let processed = content;

  // Pattern 1: (page 5) or (page 5, page 6)
  processed = processed.replace(/\(\s*page\s+(\d+(?:\s*,\s*page\s+\d+)*)\s*\)/gi, (match, pageList: string) => {
    const pages = pageList.split(/\s*,\s*page\s+/i);
    const links = pages.map((pageNum: string) => `[page ${pageNum.trim()}](#page-${pageNum.trim()})`);
    return `(${links.join(', ')})`;
  });

  // Pattern 2: (pages 5-7) - page ranges
  processed = processed.replace(/\(\s*pages?\s+(\d+)\s*-\s*(\d+)\s*\)/gi, (match, start, end) => {
    return `([pages ${start}-${end}](#page-${start}))`;
  });

  // Pattern 3: (p. 5) or (pp. 5-7)
  processed = processed.replace(/\(\s*pp?\.\s+(\d+)(?:\s*-\s*(\d+))?\s*\)/gi, (match, start, end) => {
    if (end) {
      return `([p. ${start}-${end}](#page-${start}))`;
    }
    return `([p. ${start}](#page-${start}))`;
  });

  // Pattern 4: "on page 5" or "see page 5" (not in parentheses)
  processed = processed.replace(/\b(on|see|found on|described on|shown on)\s+page\s+(\d+)/gi, (match, prefix, pageNum) => {
    return `${prefix} [page ${pageNum}](#page-${pageNum})`;
  });

  // Pattern 5: "Figure 1 (page 5)" - specifically for figures/tables
  processed = processed.replace(/(Figure|Table|Fig\.|Tab\.)\s+(\d+[a-z]?)\s*\(\s*page\s+(\d+)\s*\)/gi, (match, type, num, pageNum) => {
    return `${type} ${num} ([page ${pageNum}](#page-${pageNum}))`;
  });

  return processed;
}

/**
 * Handle page navigation in PDF viewer
 */
export function handlePageNavigation(pageNum: string): void {
  if (typeof window === 'undefined') return;
  
  const pdfFrame = document.getElementById('pdfFrame') as HTMLIFrameElement;
  if (pdfFrame && pdfFrame.src) {
    const baseUrl = pdfFrame.src.split('#')[0];
    const newUrl = `${baseUrl}#page=${pageNum}`;
    pdfFrame.src = newUrl;
  }
}
