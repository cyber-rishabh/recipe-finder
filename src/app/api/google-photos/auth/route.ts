import { NextRequest, NextResponse } from 'next/server';
import { googlePhotosService } from '@/lib/google-photos';

export async function GET(request: NextRequest) {
  try {
    const authUrl = googlePhotosService.getAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication URL' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const tokens = await googlePhotosService.getTokenFromCode(code);
    
    return NextResponse.json({ 
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token 
    });
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Google' },
      { status: 500 }
    );
  }
} 