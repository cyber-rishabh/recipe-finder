'use client';

import { useParams, notFound } from 'next/navigation';
import { defaultRecipes } from '@/lib/default-recipes';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, ChefHat, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Recipe } from '@/lib/data';

export default function RecipePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    
    const findRecipe = async () => {
        const defaultRecipe = defaultRecipes.find(r => r.id === id);
        if (defaultRecipe) {
            setRecipe(defaultRecipe);
            return;
        }

        try {
            const response = await fetch(`/api/recipes/${id}`);
            
            if (response.ok) {
                const data = await response.json();
                const recipeData = data.recipe;
                
                setRecipe({
                    id: recipeData._id,
                    title: recipeData.title,
                    ingredients: recipeData.ingredients,
                    instructions: recipeData.instructions,
                    cuisine: recipeData.cuisine,
                    imageUrl: recipeData.imageUrl,
                    imageStoragePath: recipeData.imageUrl,
                    createdBy: recipeData.createdBy?.email || 'Unknown',
                    createdAt: recipeData.createdAt,
                    imageHint: '',
                });
            } else {
                setRecipe(null); // Not found
            }
        } catch (error) {
            console.error("Error fetching recipe:", error);
            setRecipe(null);
        }
    };
    
    findRecipe();
  }, [id]);

  if (recipe === undefined) {
    return (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!recipe) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-xl mb-8 shadow-lg">
        <Image
          src={recipe.imageUrl || 'https://placehold.co/600x400'}
          alt={recipe.title}
          fill
          className="object-cover"
          data-ai-hint={recipe.imageHint}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 md:p-8">
            <Badge className="text-sm md:text-base mb-2">{recipe.cuisine}</Badge>
            <h1 className="text-3xl md:text-5xl font-headline font-bold text-white leading-tight">{recipe.title}</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
                <ol className="list-decimal list-inside space-y-4 text-base marker:text-primary marker:font-bold">
                    {recipe.instructions.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ol>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="font-headline text-2xl">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                     <div className="flex items-center text-muted-foreground"><User className="mr-2 h-4 w-4" /><span>By {recipe.createdBy === 'system' ? 'Recipe Hub' : 'a Recipe Hub user'}</span></div>
                     <div className="flex items-center text-muted-foreground"><Calendar className="mr-2 h-4 w-4" /><span>{new Date(recipe.createdAt).toLocaleDateString()}</span></div>
                     <div className="flex items-center text-muted-foreground"><ChefHat className="mr-2 h-4 w-4" /><span>{recipe.cuisine} Cuisine</span></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {recipe.ingredients.map((ingredient) => (
                           <li key={ingredient} className="flex flex-col border-b pb-2 last:border-none">
                               <span>{ingredient}</span>
                           </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
