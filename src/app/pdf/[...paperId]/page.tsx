import { notFound } from 'next/navigation';
import ChatWidget from '@/components/papers/ChatWidget';
import { parseArxivId, getArxivUrls } from '@/lib/papers';
import styles from './page.module.css';

export default async function ArxivPdfPage({ params }: { params: Promise<{ paperId: string[] }> }) {
  const { paperId } = await params;
  const parsed = parseArxivId(paperId);

  if (!parsed.isValid) {
    notFound();
  }

  const urls = getArxivUrls(parsed.id);

  return (
    <div className={styles.container}>
      <iframe
        id="pdfFrame"
        src={urls.viewerUrl}
        title={`arXiv PDF Viewer - ${parsed.id}`}
        className={styles.iframe}
      />
      <ChatWidget paperId={parsed.id} parsedPaper={parsed} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ paperId: string[] }> }) {
  const { paperId } = await params;
  const parsed = parseArxivId(paperId);
  
  return {
    title: parsed.isValid ? `arXiv:${parsed.id} - GiraffeGuru` : 'Paper Not Found',
    description: parsed.isValid 
      ? `AI-powered assistant for arXiv paper ${parsed.id}`
      : 'Invalid arXiv paper ID'
  };
}
