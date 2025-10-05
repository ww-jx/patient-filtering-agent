import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import ChatWidget from '@/components/papers/ChatWidget';
import { parseMedrxivId, parseBiorxivId, getMedrxivUrls, getBiorxivUrls, detectPaperSource } from '@/lib/papers';
import styles from './page.module.css';

export default async function ContentPage({ params }: { params: Promise<{ doi: string[] }> }) {
  const { doi } = await params;
  
  // Get the base URL from headers for proper proxy URL construction
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;
  
  // Join DOI parts and remove .full.pdf extension if present
  const doiString = doi.join('/').replace(/\.full\.pdf$/, '');
  
  // Detect if it's medRxiv or bioRxiv
  const source = detectPaperSource(doiString);
  
  let parsed;
  let urls;
  
  if (source === 'medrxiv') {
    parsed = parseMedrxivId(doiString);
    if (!parsed.isValid) {
      notFound();
    }
    urls = getMedrxivUrls(parsed.id, baseUrl);
  } else if (source === 'biorxiv') {
    parsed = parseBiorxivId(doiString);
    if (!parsed.isValid) {
      notFound();
    }
    urls = getBiorxivUrls(parsed.id, baseUrl);
  } else {
    // Try medRxiv as default for 10.1101 DOIs
    parsed = parseMedrxivId(doiString);
    if (!parsed.isValid) {
      // Try bioRxiv
      parsed = parseBiorxivId(doiString);
      if (!parsed.isValid) {
        notFound();
      }
      urls = getBiorxivUrls(parsed.id, baseUrl);
    } else {
      urls = getMedrxivUrls(parsed.id, baseUrl);
    }
  }

  return (
    <div className={styles.container}>
      <iframe
        id="pdfFrame"
        src={urls.viewerUrl}
        title={`${parsed.source} PDF Viewer - ${parsed.id}`}
        className={styles.iframe}
      />
      <ChatWidget paperId={parsed.id} parsedPaper={parsed} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ doi: string[] }> }) {
  const { doi } = await params;
  const doiString = doi.join('/').replace(/\.full\.pdf$/, '');
  const source = detectPaperSource(doiString);
  
  const displayName = source === 'medrxiv' ? 'medRxiv' : source === 'biorxiv' ? 'bioRxiv' : 'Paper';
  
  return {
    title: `${displayName}:${doiString} - GiraffeGuru`,
    description: `AI-powered assistant for ${displayName} paper ${doiString}`
  };
}
