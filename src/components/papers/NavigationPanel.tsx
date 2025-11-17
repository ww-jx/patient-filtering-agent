'use client';

import React, { useState } from 'react';
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

  const handleCollapseToggle = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapseChange?.(collapsed);
  };
  const [activeTab, setActiveTab] = useState<'toc' | 'figures'>('toc');

  // Mock TOC data - in real implementation, this would be extracted from PDF
  const tocItems: TocItem[] = [
    { title: 'Abstract', page: 1, level: 1 },
    { title: 'Introduction', page: 2, level: 1 },
    { title: 'Background', page: 3, level: 2 },
    { title: 'Related Work', page: 4, level: 2 },
    { title: 'Methods', page: 6, level: 1 },
    { title: 'Study Design', page: 6, level: 2 },
    { title: 'Data Collection', page: 7, level: 2 },
    { title: 'Statistical Analysis', page: 8, level: 2 },
    { title: 'Results', page: 10, level: 1 },
    { title: 'Primary Outcomes', page: 10, level: 2 },
    { title: 'Secondary Outcomes', page: 12, level: 2 },
    { title: 'Discussion', page: 15, level: 1 },
    { title: 'Limitations', page: 18, level: 2 },
    { title: 'Conclusions', page: 20, level: 1 },
    { title: 'References', page: 21, level: 1 },
  ];

  // Mock figures data - in real implementation, this would be extracted from PDF
  const figures: FigureItem[] = [
    { title: 'Figure 1: Study Design Overview', page: 5, type: 'figure' },
    { title: 'Table 1: Patient Demographics', page: 7, type: 'table' },
    { title: 'Figure 2: Primary Outcome Distribution', page: 11, type: 'figure' },
    { title: 'Figure 3: Kaplan-Meier Survival Curves', page: 13, type: 'figure' },
    { title: 'Table 2: Adverse Events', page: 14, type: 'table' },
    { title: 'Figure 4: Subgroup Analysis', page: 16, type: 'figure' },
  ];

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
        {activeTab === 'toc' && (
          <div className={styles.tocList}>
            {tocItems.map((item, index) => (
              <button
                key={index}
                className={`${styles.tocItem} ${styles[`level${item.level}`]}`}
                onClick={() => handleTocClick(item.page)}
                title={`Go to page ${item.page}`}
              >
                <span className={styles.tocTitle}>{item.title}</span>
                <span className={styles.tocPage}>{item.page}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'figures' && (
          <div className={styles.figuresList}>
            {figures.map((figure, index) => (
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
            ))}
          </div>
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
