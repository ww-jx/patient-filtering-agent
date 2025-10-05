import { NextRequest, NextResponse } from 'next/server';
import { parsePaperId, getPaperUrls, PaperSource } from '@/lib/papers';

/**
 * PDF Proxy API for App Router
 * Downloads PDFs from paper sources and serves them with proper CORS headers
 * This bypasses CORS issues when loading PDFs in PDF.js viewer
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const source = searchParams.get('source') as PaperSource | null;

  if (!id || !source) {
    return NextResponse.json(
      { error: 'Missing paper ID or source' },
      { status: 400 }
    );
  }

  // Validate the paper ID
  const parsed = parsePaperId(id, source);
  if (!parsed.isValid) {
    return NextResponse.json(
      { error: `Invalid ${source} paper ID format: ${id}` },
      { status: 400 }
    );
  }

  try {
    // Fetch the PDF from the source
    const urls = getPaperUrls(parsed.id, parsed.source);
    const pdfResponse = await fetch(urls.pdfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GiraffeGuru/1.0)',
      },
    });

    if (!pdfResponse.ok) {
      console.error(`Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch PDF from ${source}: ${pdfResponse.statusText}` },
        { status: pdfResponse.status }
      );
    }

    // Get the PDF as a buffer
    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Validate it's actually a PDF
    const pdfHeader = Buffer.from(pdfBuffer.slice(0, 4)).toString();
    if (!pdfHeader.startsWith('%PDF')) {
      return NextResponse.json(
        { error: 'Downloaded content is not a valid PDF file' },
        { status: 500 }
      );
    }

    // Create response with proper headers for PDF delivery with CORS and Range support
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${urls.fileName}.pdf"`,
      'Content-Length': pdfBuffer.byteLength.toString(),
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Expose-Headers': 'Accept-Ranges, Content-Length, Content-Range, Content-Encoding',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('PDF proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const source = searchParams.get('source') as PaperSource | null;

  if (!id || !source) {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = parsePaperId(id, source);
  if (!parsed.isValid) {
    return new NextResponse(null, { status: 400 });
  }

  const headers = new Headers({
    'Content-Type': 'application/pdf',
    'Accept-Ranges': 'bytes',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range',
  });

  return new NextResponse(null, {
    status: 200,
    headers,
  });
}

export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range',
    'Access-Control-Max-Age': '86400',
  });

  return new NextResponse(null, {
    status: 200,
    headers,
  });
}
