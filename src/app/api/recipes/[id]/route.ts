import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/mongoose';
import Recipe from '@/lib/models/Recipe';
import { getAuthUser } from '@/lib/auth';

// GET: Fetch single recipe by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const recipe = await Recipe.findById(params.id)
      .populate('createdBy', 'email');
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Get recipe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const recipe = await Recipe.findById(params.id);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the recipe
    if (recipe.createdBy.toString() !== authUser.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
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
    
    let imageUrl = recipe.imageUrl;
    
    // Handle image upload if new image provided
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const timestamp = Date.now();
      const filename = `${timestamp}-${imageFile.name}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      const filepath = join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      
      imageUrl = `/uploads/${filename}`;
    }
    
    // Update recipe
    recipe.title = title;
    recipe.cuisine = cuisine;
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    recipe.imageUrl = imageUrl;
    
    await recipe.save();
    
    return NextResponse.json({
      message: 'Recipe updated successfully',
      recipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const recipe = await Recipe.findById(params.id);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the recipe
    if (recipe.createdBy.toString() !== authUser.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    await Recipe.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 