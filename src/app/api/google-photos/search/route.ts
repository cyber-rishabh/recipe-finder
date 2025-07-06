import { NextRequest, NextResponse } from 'next/server';
import { googlePhotosService } from '@/lib/google-photos';

export async function POST(request: NextRequest) {
  try {
    const { query, accessToken } = await request.json();
    
    if (!query || !accessToken) {
      return NextResponse.json(
        { error: 'Query and access token are required' },
        { status: 400 }
      );
    }

    const photos = await googlePhotosService.searchPhotos(query, accessToken);
    
    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error searching Google Photos:', error);
    return NextResponse.json(
      { error: 'Failed to search Google Photos' },
      { status: 500 }
    );
  }
} 