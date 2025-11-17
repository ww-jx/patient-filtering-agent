'use client';

import React, { useState, useEffect } from 'react';
import styles from './NavigationPanel.module.css';
import { handlePageNavigation } from '@/lib/papers';

interface TocItem {
  title: string;
  page: number;
  level: number;
}

interface FigureItem {
  title: string;
  page: number;
  type: 'figure' | 'table';
}

interface NavigationPanelProps {
  paperId: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({ paperId, onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'toc' | 'figures'>('toc');
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [figures, setFigures] = useState<FigureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleCollapseToggle = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapseChange?.(collapsed);
  };

  useEffect(() => {
    // Extract PDF outline and figures from the loaded PDF
    const extractPdfData = async () => {
      setIsLoading(true);
      try {
        const pdfFrame = document.getElementById('pdfFrame') as HTMLIFrameElement;
        if (!pdfFrame) {
          setIsLoading(false);
          return;
        }

        // Wait for PDF.js to load and parse the document
        // PDF.js exposes outline data that we can access
        const checkPdfReady = setInterval(async () => {
          try {
            // Try to access PDF.js viewer in the iframe
            const pdfViewer = (pdfFrame.contentWindow as any)?.PDFViewerApplication;

            if (pdfViewer?.pdfDocument) {
              clearInterval(checkPdfReady);

              // Extract outline (table of contents)
              const outline = await pdfViewer.pdfDocument.getOutline();
              if (outline && outline.length > 0) {
                const extractedToc = await extractOutlineItems(outline, pdfViewer.pdfDocument);
                setTocItems(extractedToc);
              } else {
                // No outline available, show a message
                setTocItems([]);
              }

              // Extract figures and tables by scanning text content
              // This is a basic implementation - could be enhanced
              const extractedFigures = await extractFiguresAndTables(pdfViewer.pdfDocument);
              setFigures(extractedFigures);

              setIsLoading(false);
            }
          } catch (e) {
            // PDF.js not ready yet, will retry
          }
        }, 500);

        // Cleanup after 10 seconds if PDF never loads
        setTimeout(() => {
          clearInterval(checkPdfReady);
          setIsLoading(false);
        }, 10000);
      } catch (error) {
        console.error('Error extracting PDF data:', error);
        setIsLoading(false);
      }
    };

    extractPdfData();
  }, [paperId]);

  // Extract outline items recursively
  const extractOutlineItems = async (outline: any[], pdfDocument: any, level = 1): Promise<TocItem[]> => {
    const items: TocItem[] = [];

    for (const item of outline) {
      try {
        // Get the destination page number
        let pageNum = 1;
        if (item.dest) {
          const dest = typeof item.dest === 'string'
            ? await pdfDocument.getDestination(item.dest)
            : item.dest;

          if (dest) {
            const pageIndex = await pdfDocument.getPageIndex(dest[0]);
            pageNum = pageIndex + 1; // PDF.js uses 0-based indexing
          }
        }

        items.push({
          title: item.title || 'Untitled',
          page: pageNum,
          level: Math.min(level, 3), // Cap at level 3 for UI purposes
        });

        // Recursively process children
        if (item.items && item.items.length > 0) {
          const childItems = await extractOutlineItems(item.items, pdfDocument, level + 1);
          items.push(...childItems);
        }
      } catch (e) {
        console.warn('Error processing outline item:', e);
      }
    }

    return items;
  };

  // Extract figures and tables by scanning PDF text
  const extractFiguresAndTables = async (pdfDocument: any): Promise<FigureItem[]> => {
    const figures: FigureItem[] = [];
    const numPages = pdfDocument.numPages;

    // Scan first 50 pages (to avoid performance issues on very long documents)
    const maxPagesToScan = Math.min(numPages, 50);

    for (let pageNum = 1; pageNum <= maxPagesToScan; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(' ');

        // Look for figure and table references
        // Pattern: "Figure 1:", "Fig. 1:", "Table 1:", etc.
        const figureMatches = text.matchAll(/(?:Figure|Fig\.)\s+(\d+[a-zA-Z]?)[\s.:]/gi);
        const tableMatches = text.matchAll(/Table\s+(\d+[a-zA-Z]?)[\s.:]/gi);

        for (const match of figureMatches) {
          const num = match[1];
          const title = `Figure ${num}`;

          // Avoid duplicates
          if (!figures.some(f => f.title === title && f.page === pageNum)) {
            figures.push({
              title,
              page: pageNum,
              type: 'figure',
            });
          }
        }

        for (const match of tableMatches) {
          const num = match[1];
          const title = `Table ${num}`;

          // Avoid duplicates
          if (!figures.some(f => f.title === title && f.page === pageNum)) {
            figures.push({
              title,
              page: pageNum,
              type: 'table',
            });
          }
        }
      } catch (e) {
        console.warn(`Error extracting figures from page ${pageNum}:`, e);
      }
    }

    return figures;
  };

  const handleTocClick = (page: number) => {
    handlePageNavigation(page.toString());
  };

  if (isCollapsed) {
    return (
      <div className={styles.collapsedPanel}>
        <button
          className={styles.expandButton}
          onClick={() => handleCollapseToggle(false)}
          aria-label="Expand navigation panel"
          title="Expand navigation"
        >
          ▶
        </button>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'toc' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('toc')}
          >
            📑 Contents
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'figures' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('figures')}
          >
            📊 Figures
          </button>
        </div>
        <button
          className={styles.collapseButton}
          onClick={() => handleCollapseToggle(true)}
          aria-label="Collapse navigation panel"
          title="Collapse navigation"
        >
          ◀
        </button>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <div className={styles.loadingSpinner}>●●●</div>
            <p>Extracting PDF contents...</p>
          </div>
        ) : (
          <>
            {activeTab === 'toc' && (
              <div className={styles.tocList}>
                {tocItems.length > 0 ? (
                  tocItems.map((item, index) => (
                    <button
                      key={index}
                      className={`${styles.tocItem} ${styles[`level${item.level}`]}`}
                      onClick={() => handleTocClick(item.page)}
                      title={`Go to page ${item.page}`}
                    >
                      <span className={styles.tocTitle}>{item.title}</span>
                      <span className={styles.tocPage}>{item.page}</span>
                    </button>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No table of contents found</p>
                    <span className={styles.emptyHint}>
                      This PDF doesn't have an embedded outline
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'figures' && (
              <div className={styles.figuresList}>
                {figures.length > 0 ? (
                  figures.map((figure, index) => (
                    <button
                      key={index}
                      className={styles.figureItem}
                      onClick={() => handleTocClick(figure.page)}
                      title={`Go to page ${figure.page}`}
                    >
                      <div className={styles.figurePlaceholder}>
                        {figure.type === 'figure' ? '📊' : '📋'}
                      </div>
                      <div className={styles.figureInfo}>
                        <div className={styles.figureTitle}>{figure.title}</div>
                        <div className={styles.figurePage}>Page {figure.page}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No figures or tables found</p>
                    <span className={styles.emptyHint}>
                      Figures will appear here once detected
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.helpText}>
          Click any item to navigate
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel;
