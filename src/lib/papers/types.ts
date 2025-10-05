/**
 * Paper source types and utilities
 * Supports arXiv, medRxiv, and bioRxiv
 */

export type PaperSource = 'arxiv' | 'medrxiv' | 'biorxiv';

export interface ParsedPaperId {
  /** The normalized paper ID */
  id: string;
  /** Whether the paper ID is valid */
  isValid: boolean;
  /** The source of the paper */
  source: PaperSource;
  /** Additional metadata specific to the source */
  metadata?: {
    category?: string | null; // arXiv category
    date?: string | null; // medRxiv/bioRxiv date
    version?: string | null; // Paper version
  };
}

export interface PaperUrls {
  /** URL to the paper's PDF */
  pdfUrl: string;
  /** URL to the paper's abstract/landing page */
  abstractUrl: string;
  /** URL for the PDF viewer */
  viewerUrl: string;
  /** Safe filename for caching */
  fileName: string;
}

export interface PaperSourceConfig {
  name: string;
  displayName: string;
  baseUrl: string;
  patternDescription: string;
  aiContext: string;
}
