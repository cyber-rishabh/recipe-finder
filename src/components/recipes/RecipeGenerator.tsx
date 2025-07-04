'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UploadCloud, Sparkles, X } from 'lucide-react';
import { runGenerateRecipeFromImage } from '@/lib/actions';
import type { Recipe } from '@/lib/data';

interface RecipeGeneratorProps {
  onRecipeGenerated: (data: Partial<Recipe>) => void;
  onClear: () => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export function RecipeGenerator({ onRecipeGenerated, onClear, isGenerating, setIsGenerating }: RecipeGeneratorProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGenerate = async () => {
    if (!imagePreview) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const result = await runGenerateRecipeFromImage({ photoDataUri: imagePreview });
      onRecipeGenerated({ ...result, imageUrl: imagePreview });
    } catch (e) {
      setError('Could not generate a recipe from the image. Please try another one.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setError(null);
    setIsGenerating(false);
    onClear();
    // Reset file input
    const fileInput = document.getElementById('image-generator-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card className="mb-8 border-dashed border-2">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-primary"/> AI Recipe Generator</CardTitle>
        <CardDescription>Have a photo of a dish? Upload it and let our AI create a recipe for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!imagePreview && (
          <label htmlFor="image-generator-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2 text-sm text-muted-foreground">Click to upload an image</span>
            <Input id="image-generator-input" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
          </label>
        )}
        
        {imagePreview && (
          <div className="space-y-4">
            <div className="relative w-full max-w-sm mx-auto h-64 rounded-lg overflow-hidden">
                <Image src={imagePreview} alt="Dish preview" fill className="object-cover" />
            </div>
             <div className="flex justify-center gap-2">
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? <><Loader2 className="animate-spin" /> Generating...</> : 'Generate Recipe'}
                </Button>
                <Button onClick={handleClear} variant="outline" disabled={isGenerating}>
                    <X className="h-4 w-4 mr-2"/> Clear
                </Button>
            </div>
          </div>
        )}
        
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

      </CardContent>
    </Card>
  );
}
