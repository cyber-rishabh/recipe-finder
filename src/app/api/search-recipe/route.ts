import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = 'AIzaSyDzqa73-zRoUHsiR-f3GhT2xCRWg9fHChk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { dishName } = await request.json();
    
    if (!dishName) {
      return NextResponse.json(
        { error: 'Dish name is required' },
        { status: 400 }
      );
    }

    const prompt = `Please provide a detailed recipe for "${dishName}". Include the following format:
    - Title: [Dish Name]
    - Cuisine: [Type of cuisine]
    - Ingredients: [List of ingredients with measurements]
    - Instructions: [Step-by-step cooking instructions]
    
    Make sure the recipe is practical and includes proper measurements and cooking times.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }
    
    const recipeText = data.candidates[0].content.parts[0].text;

    // Parse the recipe text to extract structured data
    const recipe = parseRecipeFromText(recipeText, dishName);

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Search recipe error:', error);
    return NextResponse.json(
      { error: 'Failed to search for recipe. Please try again.' },
      { status: 500 }
    );
  }
}

function parseRecipeFromText(text: string, dishName: string) {
  // Simple parsing logic - you can enhance this
  const lines = text.split('\n').filter(line => line.trim());
  
  let title = dishName;
  let cuisine = 'International';
  let ingredients: string[] = [];
  let instructions: string[] = [];
  
  let currentSection = '';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('cuisine:') || lowerLine.includes('type:')) {
      cuisine = line.split(':')[1]?.trim() || 'International';
    } else if (lowerLine.includes('ingredients:') || lowerLine.includes('ingredient:')) {
      currentSection = 'ingredients';
    } else if (lowerLine.includes('instructions:') || lowerLine.includes('directions:') || lowerLine.includes('steps:')) {
      currentSection = 'instructions';
    } else if (currentSection === 'ingredients' && line.trim() && !line.toLowerCase().includes('ingredients')) {
      ingredients.push(line.trim());
    } else if (currentSection === 'instructions' && line.trim() && !line.toLowerCase().includes('instructions')) {
      instructions.push(line.trim());
    }
  }

  // Clean up ingredients and instructions
  ingredients = ingredients.filter(ing => ing.trim() && !ing.toLowerCase().includes('ingredients'));
  instructions = instructions.filter(inst => inst.trim() && !inst.toLowerCase().includes('instructions'));

  return {
    title,
    cuisine,
    ingredients,
    instructions,
    imageUrl: 'https://placehold.co/600x400',
    imageStoragePath: '',
    createdBy: 'AI Search',
    createdAt: new Date().toISOString(),
    imageHint: dishName.toLowerCase(),
  };
} 