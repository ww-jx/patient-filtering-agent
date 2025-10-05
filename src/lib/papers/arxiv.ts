/**
 * ArXiv paper utilities
 * Adapted from asxiv/src/utils/arxivUtils.ts
 */

import { ParsedPaperId, PaperUrls } from './types';

/**
 * ArXiv ID validation pattern
 * Matches:
 * - New format: YYMM.NNNNN (e.g., 1706.03762, 2301.12345)
 * - Old format: category/YYMMnnn (e.g., cs/0211011, math-ph/0506203)
 */
export const ARXIV_ID_PATTERN = /^(\d{4}\.\d{4,5}|[a-z-]+\/\d{7})$/i;

/**
 * Parse ArXiv ID from various input formats
 */
export function parseArxivId(input: string | string[] | undefined): ParsedPaperId {
  let arxivId: string;
  
  if (typeof input === 'string') {
    arxivId = input;
  } else if (Array.isArray(input) && input.length > 0) {
    arxivId = input.join('/');
  } else {
    return {
      id: '',
      isValid: false,
      source: 'arxiv'
    };
  }
  
  // Remove .pdf extension if present
  arxivId = arxivId.replace(/\.pdf$/, '');
  
  const isValid = ARXIV_ID_PATTERN.test(arxivId);
  
  if (!isValid) {
    return {
      id: arxivId,
      isValid: false,
      source: 'arxiv'
    };
  }
  
  // Determine if it's old or new format
  const isOldFormat = arxivId.includes('/');
  let category: string | null = null;
  
  if (isOldFormat) {
    const parts = arxivId.split('/');
    category = parts[0];
  }
  
  return {
    id: arxivId,
    isValid: true,
    source: 'arxiv',
    metadata: {
      category
    }
  };
}

/**
 * Generate URLs for ArXiv paper
 */
export function getArxivUrls(arxivId: string): PaperUrls {
  const pdfUrl = `https://arxiv.org/pdf/${arxivId}`;
  const abstractUrl = `https://arxiv.org/abs/${arxivId}`;
  const encodedPdfUrl = encodeURIComponent(pdfUrl);
  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodedPdfUrl}&sidebarViewOnLoad=0`;
  const fileName = `arxiv-${arxivId.replace(/[./]/g, '-').toLowerCase()}`;
  
  return {
    pdfUrl,
    abstractUrl,
    viewerUrl,
    fileName
  };
}

/**
 * Validate if a string is a valid ArXiv ID
 */
export function isValidArxivId(input: string): boolean {
  return ARXIV_ID_PATTERN.test(input);
}

/**
 * Get category-specific prompt context for AI interactions
 */
export function getArxivCategoryContext(category?: string | null): string {
  if (!category) {
    return 'You are a research expert helping users understand this arXiv paper. Focus on explaining concepts clearly, highlighting key contributions, and providing context for the research.';
  }
  
  const categoryContexts: Record<string, string> = {
    'cs': 'You are a Computer Science professor helping a student understand this research paper. Focus on algorithms, computational methods, software engineering principles, and theoretical computer science concepts.',
    'math': 'You are a Mathematics professor helping a student understand this research paper. Focus on mathematical proofs, theorems, equations, and mathematical reasoning.',
    'physics': 'You are a Physics professor helping a student understand this research paper. Focus on physical principles, experimental methods, and theoretical concepts.',
    'astro-ph': 'You are an Astrophysics professor helping a student understand this research paper. Focus on astronomical observations, cosmological models, stellar physics, and observational data.',
    'q-bio': 'You are a Quantitative Biology professor helping a student understand this research paper. Focus on biological modeling, computational biology, bioinformatics, and quantitative analysis of biological systems.',
    'stat': 'You are a Statistics professor helping a student understand this research paper. Focus on statistical methods, data analysis, probability theory, and statistical inference.'
  };
  
  return categoryContexts[category] || `You are a ${category} expert helping users understand this research paper. Draw upon your expertise in this field to explain concepts clearly and accurately.`;
}
