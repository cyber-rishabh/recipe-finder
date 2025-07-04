'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { getRecipe } from '@/lib/firebase-data';
import type { Recipe } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function EditRecipePage() {
    const params = useParams();
    const id = params.id as string;
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    
    useEffect(() => {
        if (!id || authLoading) return;
        
        // Default recipes cannot be edited
        if (id.startsWith('default-')) {
            notFound();
            return;
        }

        const fetchAndVerify = async () => {
            setLoading(true);
            const fetchedRecipe = await getRecipe(id);
            
            if (!fetchedRecipe) {
                notFound();
                return;
            }
            
            if (isAuthenticated && user?.uid === fetchedRecipe.createdBy) {
                setRecipe(fetchedRecipe);
                setIsOwner(true);
            } else {
                setIsOwner(false);
            }
            
            setLoading(false);
        };
        
        fetchAndVerify();

    }, [id, user, isAuthenticated, authLoading]);
    
    if (loading || authLoading) {
        return (
          <div className="flex justify-center items-center h-full py-20">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        );
    }
    
    if (!isOwner) {
         return (
            <div className="flex items-center justify-center py-12">
                 <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You are not authorized to edit this recipe.</p>
                        <Link href={`/recipe/${id}`} className="text-primary underline mt-4 inline-block">
                            Back to Recipe
                        </Link>
                    </CardContent>
                 </Card>
            </div>
        )
    }
    
    return <RecipeForm formType="Edit" initialData={recipe!} />;
}
