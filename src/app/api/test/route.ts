import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';

export async function GET() {
  try {
    console.log('Environment check:');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    console.log('Attempting to connect to MongoDB...');
    await dbConnect();
    console.log('MongoDB connection successful!');
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection working',
      envCheck: {
        mongodbUriExists: !!process.env.MONGODB_URI,
        jwtSecretExists: !!process.env.JWT_SECRET,
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      envCheck: {
        mongodbUriExists: !!process.env.MONGODB_URI,
        jwtSecretExists: !!process.env.JWT_SECRET,
      }
    }, { status: 500 });
  }
} 