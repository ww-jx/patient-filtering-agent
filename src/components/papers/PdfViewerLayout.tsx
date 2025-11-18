'use client';

import React, { useState } from 'react';
import NavigationPanel from './NavigationPanel';
import ChatWidget from './ChatWidget';
import { ParsedPaperId } from '@/lib/papers';
import styles from './PdfViewerLayout.module.css';

interface PdfViewerLayoutProps {
  paperId: string;
  parsedPaper: ParsedPaperId;
  pdfViewerUrl: string;
  pdfTitle: string;
}

const PdfViewerLayout: React.FC<PdfViewerLayoutProps> = ({
  paperId,
  parsedPaper,
  pdfViewerUrl,
  pdfTitle,
}) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  return (
    <div className={`${styles.container} ${isNavCollapsed ? styles.navCollapsed : ''}`}>
      <NavigationPanel
        paperId={paperId}
        onCollapseChange={setIsNavCollapsed}
      />
      <iframe
        id="pdfFrame"
        src={pdfViewerUrl}
        title={pdfTitle}
        className={styles.iframe}
      />
      <ChatWidget paperId={paperId} parsedPaper={parsedPaper} />
    </div>
  );
};

export default PdfViewerLayout;
