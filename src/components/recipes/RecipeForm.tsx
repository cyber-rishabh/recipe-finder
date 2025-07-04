'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Recipe } from '@/lib/data';
import { cuisines } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { addRecipe, updateRecipe } from '@/lib/firebase-data';

interface RecipeFormProps {
  initialData?: Partial<Recipe>;
  formType: 'Add' | 'Edit';
  isAiGenerating?: boolean;
}

// Helper to convert File to Data URL
const toDataURL = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});


export function RecipeForm({ initialData, formType, isAiGenerating = false }: RecipeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState('');
  const [imageHint, setImageHint] = useState('user recipe');
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Can be URL or Data URL
  const [imageFile, setImageFile] = useState<string | null>(null); // Can be existing URL, or new data URL
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
        setTitle(initialData.title || '');
        setCuisine(initialData.cuisine || '');
        setIngredients(initialData.ingredients?.length ? initialData.ingredients : ['']);
        const instructionsText = Array.isArray(initialData.instructions) ? initialData.instructions.join('\n') : (initialData.instructions || '');
        setInstructions(instructionsText);
        setImageHint(initialData.imageHint || 'user recipe');
        
        if (initialData.imageUrl) {
          setImagePreview(initialData.imageUrl);
          setImageFile(initialData.imageUrl);
        }
    }
  }, [initialData]);

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const dataUrl = await toDataURL(file);
      setImageFile(dataUrl);
      setImagePreview(dataUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in.' });
        return;
    }
    setIsLoading(true);

    const recipeData = {
      title,
      cuisine,
      imageHint,
      ingredients: ingredients.filter(ing => ing.trim() !== ''),
      instructions: instructions.split('\n').filter(line => line.trim() !== ''),
      imageUrl: imageFile || '', // Pass the data URI or existing URL
    };

    try {
        if (formType === 'Add') {
            await addRecipe(recipeData, user.uid);
            toast({
                title: 'Recipe Added!',
                description: `Your recipe "${title}" has been successfully saved.`,
            });
        } else if (initialData?.id) {
            await updateRecipe(initialData.id, recipeData, user.uid);
             toast({
                title: 'Recipe Updated!',
                description: `Your recipe "${title}" has been successfully updated.`,
            });
        }
        router.push('/');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || isAiGenerating;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">{formType} Recipe</CardTitle>
        <CardDescription>
          {initialData ? 'Review and edit the details below.' : `Fill out the details below to ${formType.toLowerCase()} your recipe.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Name</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSubmitDisabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuisine">Cuisine</Label>
            <Select value={cuisine} onValueChange={setCuisine} required disabled={isSubmitDisabled}>
              <SelectTrigger id="cuisine">
                <SelectValue placeholder="Select a cuisine" />
              </SelectTrigger>
              <SelectContent>
                {cuisines.filter(c => c !== 'All').map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

           <div className="space-y-2">
            <Label>Ingredients</Label>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    disabled={isSubmitDisabled}
                  />
                  {ingredients.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)} disabled={isSubmitDisabled}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient} disabled={isSubmitDisabled}>
              <Plus className="mr-2 h-4 w-4" /> Add Ingredient
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions (one per line)</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              rows={10}
              placeholder="Enter recipe instructions, one per line."
              disabled={isSubmitDisabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Recipe Image</Label>
            <Input id="image" type="file" onChange={handleImageChange} accept="image/*" disabled={isSubmitDisabled} />
             {imagePreview && (
              <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden">
                <Image src={imagePreview} alt="Recipe preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitDisabled}>Cancel</Button>
            <Button type="submit" disabled={isSubmitDisabled}>
                {isLoading && <Loader2 className="animate-spin" />}
                {formType} Recipe
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
