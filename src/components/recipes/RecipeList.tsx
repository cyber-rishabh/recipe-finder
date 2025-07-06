'use client';

import { useState, useEffect } from 'react';
import { cuisines } from '@/lib/data';
import { defaultRecipes } from '@/lib/default-recipes';
import { RecipeCard } from './RecipeCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import type { Recipe } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function RecipeList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/recipes');
        
        if (response.ok) {
          const data = await response.json();
          
          // Transform MongoDB recipes to match the Recipe interface
          const transformedRecipes: Recipe[] = data.recipes.map((recipe: any) => ({
            id: recipe._id,
            title: recipe.title,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            cuisine: recipe.cuisine,
            imageUrl: recipe.imageUrl,
            imageStoragePath: recipe.imageUrl, // Map to imageUrl for compatibility
            createdBy: recipe.createdBy?.email || 'Unknown',
            createdAt: recipe.createdAt,
            imageHint: '',
          }));
          
          setUserRecipes(transformedRecipes);
        } else {
          // If API fails, just set empty user recipes but don't show error
          setUserRecipes([]);
        }
      } catch (err) {
        console.error('Error fetching recipes:', err);
        // Don't set error - just use empty user recipes
        setUserRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);
  
  // Always combine default recipes with user recipes
  const allRecipes = [...defaultRecipes, ...userRecipes];

  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCuisine = selectedCuisine === 'All' || recipe.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by ingredient or recipe name..."
              className="pl-10 text-base h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
            <SelectTrigger className="w-full md:w-[180px] text-base h-12">
              <SelectValue placeholder="Filter by cuisine" />
            </SelectTrigger>
            <SelectContent>
              {cuisines.map(cuisine => (
                <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Loading delicious recipes...</h3>
          <p className="text-muted-foreground">Preparing your culinary collection</p>
        </div>
      )}

      {/* Recipe Grid */}
      {!isLoading && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && filteredRecipes.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Recipes Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm || selectedCuisine !== 'All' 
              ? "Try adjusting your search or filter to find what you're looking for."
              : "Start building your recipe collection by adding your first recipe!"
            }
          </p>
          {!searchTerm && selectedCuisine === 'All' && (
            <div className="flex justify-center">
              <a 
                href="/add-recipe" 
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Your First Recipe
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
