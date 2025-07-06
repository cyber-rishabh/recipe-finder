'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Recipe } from '@/lib/data';

interface RecipeSearchProps {
  onRecipeFound: (recipe: Partial<Recipe>) => void;
}

export function RecipeSearch({ onRecipeFound }: RecipeSearchProps) {
  const [dishName, setDishName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dishName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a dish name to search for.',
      });
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/search-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dishName: dishName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search for recipe');
      }

      const data = await response.json();
      onRecipeFound(data.recipe);
      
      toast({
        title: 'Recipe Found!',
        description: `Found recipe for ${dishName}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search for recipe';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: errorMessage,
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Search className="text-primary" />
          Search for Recipes
        </CardTitle>
        <CardDescription>
          Enter a dish name and let AI find a recipe for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter dish name (e.g., Chicken Tikka Masala, Spaghetti Carbonara)"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              disabled={isSearching}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching || !dishName.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 