'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { RecipeSearch } from "@/components/recipes/RecipeSearch";
import type { Recipe } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function AddRecipePage() {
    const [recipeData, setRecipeData] = useState<Partial<Recipe> | undefined>();
    const { user } = useAuth();

    const handleRecipeFound = (data: Partial<Recipe>) => {
        setRecipeData(data);
    };

    if (!user) {
        return (
            <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center justify-center gap-2">
                        <Lock /> Access Restricted
                    </CardTitle>
                    <CardDescription>
                        You need to be logged in to add a new recipe.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Please log in to your account or create a new one to continue.</p>
                    <Button asChild>
                        <Link href="/login">Go to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div>
            <RecipeSearch onRecipeFound={handleRecipeFound} />
            
            {recipeData && <Separator className="my-8" />}
            
            <RecipeForm 
                formType="Add" 
                initialData={recipeData}
            />
        </div>
    );
}
