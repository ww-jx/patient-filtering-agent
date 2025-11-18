import { notFound } from 'next/navigation';
import PdfViewerLayout from '@/components/papers/PdfViewerLayout';
import { parseArxivId, getArxivUrls } from '@/lib/papers';

export default async function ArxivPdfPage({ params }: { params: Promise<{ paperId: string[] }> }) {
  const { paperId } = await params;
  const parsed = parseArxivId(paperId);

  if (!parsed.isValid) {
    notFound();
  }

  const urls = getArxivUrls(parsed.id);

  return (
    <PdfViewerLayout
      paperId={parsed.id}
      parsedPaper={parsed}
      pdfViewerUrl={urls.viewerUrl}
      pdfTitle={`arXiv PDF Viewer - ${parsed.id}`}
    />
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
