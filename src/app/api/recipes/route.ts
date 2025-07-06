import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/mongoose';
import Recipe from '@/lib/models/Recipe';
import { getAuthUser } from '@/lib/auth';

// GET: Fetch all recipes
export async function GET() {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('MongoDB connected successfully');
    
    const recipes = await Recipe.find()
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${recipes.length} recipes`);
    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Get recipes error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: Create new recipe (protected route)
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const cuisine = formData.get('cuisine') as string;
    const ingredients = JSON.parse(formData.get('ingredients') as string);
    const instructions = JSON.parse(formData.get('instructions') as string);
    const imageFile = formData.get('image') as File;
    
    if (!title || !cuisine || !ingredients || !instructions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    let imageUrl = '';
    
    // Handle image upload
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${imageFile.name}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      const filepath = join(uploadDir, filename);
      
      // Ensure upload directory exists
      await writeFile(filepath, buffer);
      
      imageUrl = `/uploads/${filename}`;
    }
    
    // Create new recipe
    const recipe = new Recipe({
      title,
      cuisine,
      ingredients,
      instructions,
      imageUrl,
      createdBy: authUser.userId,
    });
    
    await recipe.save();
    
    return NextResponse.json(
      { message: 'Recipe created successfully', recipe },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create recipe error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 