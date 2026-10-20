import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export async function GET(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'showcase.html');
    if (fs.existsSync(filePath)) {
      const htmlContent = fs.readFileSync(filePath, 'utf-8');
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    }
  } catch (error) {
    console.error('Error serving root showcase:', error);
  }

  // Resilient fallback redirect to clean /showcase
  const url = req.nextUrl.clone();
  url.pathname = '/showcase';
  return NextResponse.redirect(url);
}
