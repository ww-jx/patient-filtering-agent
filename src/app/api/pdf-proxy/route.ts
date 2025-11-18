import { NextRequest, NextResponse } from 'next/server';
import { parsePaperId, getPaperUrls, PaperSource } from '@/lib/papers';

/**
 * PDF Proxy API for App Router
 * Downloads PDFs from paper sources and serves them with proper CORS headers
 * This bypasses CORS issues when loading PDFs in PDF.js viewer
 */

/**
 * Fetch PDF with retry logic and enhanced headers to bypass Cloudflare protection
 * Used for bioRxiv which implemented Cloudflare protection in May 2025
 */
async function fetchWithRetry(
  pdfUrl: string,
  abstractUrl: string,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(pdfUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/pdf,application/x-pdf,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': abstractUrl,
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      // If successful, return immediately
      if (response.ok) {
        return response;
      }

      // Retry on rate limiting or service unavailable
      if (response.status === 429 || response.status === 503) {
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Rate limited or service unavailable, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // For other errors, return the response
      return response;

    } catch (error) {
      // On network error, retry with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Network error, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed to fetch PDF after ${maxRetries} attempts`);
}
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

    // Fetch PDF with retry logic and enhanced headers for Cloudflare bypass
    const pdfResponse = await fetchWithRetry(urls.pdfUrl, urls.abstractUrl, 3);

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
