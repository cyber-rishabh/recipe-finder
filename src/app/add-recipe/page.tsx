'use client';

import { useState } from 'react';
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { RecipeGenerator } from '@/components/recipes/RecipeGenerator';
import type { Recipe } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

export default function AddRecipePage() {
    // In a real app, you would check for authentication here and conditionally render.
    // For now, we assume the user is authenticated.
    const [recipeData, setRecipeData] = useState<Partial<Recipe> | undefined>();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleRecipeGenerated = (data: Partial<Recipe>) => {
        setRecipeData(data);
    };
    
    const handleClearGenerator = () => {
        setRecipeData(undefined);
    };

    return (
        <div>
            <RecipeGenerator
                onRecipeGenerated={handleRecipeGenerated}
                onClear={handleClearGenerator}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
            />

            {recipeData && <Separator className="my-8" />}
            
            <RecipeForm 
                formType="Add" 
                initialData={recipeData} 
                key={recipeData ? JSON.stringify(recipeData) : 'empty'}
                isAiGenerating={isGenerating}
            />
        </div>
    );
}
