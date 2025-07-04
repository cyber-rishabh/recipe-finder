'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { getRecipe, deleteRecipe } from '@/lib/firebase-data';
import type { Recipe } from '@/lib/data';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Pencil, Trash2, User, Calendar, ChefHat, Loader2 } from 'lucide-react';
import { IngredientSubstitution } from '@/components/recipes/IngredientSubstitution';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function RecipePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        setLoading(true);
        const fetchedRecipe = await getRecipe(id);
        if (fetchedRecipe) {
          setRecipe(fetchedRecipe);
        } else {
          notFound();
        }
        setLoading(false);
      };
      fetchRecipe();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!recipe || !user) return;
    try {
        await deleteRecipe(recipe.id, user.uid);
        toast({title: "Success", description: "Recipe deleted successfully."});
        router.push('/');
    } catch(error: any) {
        toast({variant: 'destructive', title: "Error", description: error.message});
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return notFound();
  }
  
  const isOwner = isAuthenticated && user?.uid === recipe.createdBy;

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
                    {isOwner && (
                        <div className="flex gap-2">
                            <Button asChild variant="outline" size="icon">
                                <Link href={`/edit-recipe/${recipe.id}`}><Pencil className="h-4 w-4" /></Link>
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the recipe
                                        &quot;{recipe.title}&quot;.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                     <div className="flex items-center text-muted-foreground"><User className="mr-2 h-4 w-4" /><span>By a Recipe Hub user</span></div>
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
                               <IngredientSubstitution recipeName={recipe.title} ingredient={ingredient} />
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
