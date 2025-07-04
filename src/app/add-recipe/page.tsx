'use client';

import { useState } from 'react';
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { RecipeGenerator } from '@/components/recipes/RecipeGenerator';
import type { Recipe } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AddRecipePage() {
    const { isAuthenticated, loading } = useAuth();
    const [recipeData, setRecipeData] = useState<Partial<Recipe> | undefined>();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleRecipeGenerated = (data: Partial<Recipe>) => {
        setRecipeData(data);
    };
    
    const handleClearGenerator = () => {
        setRecipeData(undefined);
    };
    
    if (loading) {
        return null; // Or a loading spinner
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center py-12">
                 <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You must be logged in to add a recipe.</p>
                        <Link href="/login" className="text-primary underline mt-4 inline-block">
                            Login Now
                        </Link>
                    </CardContent>
                 </Card>
            </div>
        )
    }

    return (
        <div>
            <RecipeGenerator
                onRecipeGenerated={handleRecipeGenerated}
                onClear={handleClearGenerator}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
            />

            {(recipeData || isGenerating) && <Separator className="my-8" />}
            
            <RecipeForm 
                formType="Add" 
                initialData={recipeData} 
                key={recipeData ? JSON.stringify(recipeData) : 'empty'}
                isAiGenerating={isGenerating}
            />
        </div>
    );
}
