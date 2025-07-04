'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Recipe } from '@/lib/data';
import { cuisines } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image';

interface RecipeFormProps {
  recipe?: Recipe;
  formType: 'Add' | 'Edit';
}

export function RecipeForm({ recipe, formType }: RecipeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [title, setTitle] = useState(recipe?.title || '');
  const [cuisine, setCuisine] = useState(recipe?.cuisine || '');
  const [ingredients, setIngredients] = useState<string[]>(recipe?.ingredients || ['']);
  const [instructions, setInstructions] = useState(recipe?.instructions.join('\n') || '');
  const [imagePreview, setImagePreview] = useState<string | null>(recipe?.imageUrl || null);


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
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to Firebase
    
    toast({
        title: `Recipe ${formType === 'Add' ? 'Added' : 'Updated'}!`,
        description: `Your recipe "${title}" has been successfully saved.`,
    })

    router.push('/'); // Redirect to home after submission
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">{formType} Recipe</CardTitle>
        <CardDescription>Fill out the details below to {formType.toLowerCase()} your recipe.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Name</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuisine">Cuisine</Label>
            <Select value={cuisine} onValueChange={setCuisine} required>
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
                  />
                  {ingredients.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="mr-2 h-4 w-4" /> Add Ingredient
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              rows={10}
              placeholder="Enter recipe instructions, one per line."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Recipe Image</Label>
            <Input id="image" type="file" onChange={handleImageChange} accept="image/*" />
             {imagePreview && (
              <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden">
                <Image src={imagePreview} alt="Recipe preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">{formType} Recipe</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
