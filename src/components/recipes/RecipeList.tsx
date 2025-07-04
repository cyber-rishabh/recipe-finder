'use client';

import { useState, useEffect } from 'react';
import type { Recipe } from '@/lib/data';
import { cuisines } from '@/lib/data';
import { RecipeCard } from './RecipeCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';
import { Button } from '@/components/ui/button';
import { runSeedDatabase } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export function RecipeList() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const recipes = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            } as Recipe;
        });
        setAllRecipes(recipes);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching real-time recipes:", error);
        setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);
  
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await runSeedDatabase();
      toast({
        title: "Success!",
        description: "Sample recipes have been added to your collection.",
      });
      // The `onSnapshot` listener will automatically update the recipes list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: error.message,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCuisine = selectedCuisine === 'All' || recipe.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });
  
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by ingredient or recipe name..."
            className="pl-10 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
          <SelectTrigger className="w-full md:w-[180px] text-base">
            <SelectValue placeholder="Filter by cuisine" />
          </SelectTrigger>
          <SelectContent>
            {cuisines.map(cuisine => (
              <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        renderSkeletons()
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <h2 className="text-2xl font-headline">No Recipes Found</h2>
            <p className="text-muted-foreground mb-4">Your recipe book is empty. Add a recipe or seed some examples.</p>
            <Button onClick={handleSeed} disabled={isSeeding}>
                {isSeeding ? <Loader2 className="mr-2 animate-spin" /> : null}
                {isSeeding ? 'Seeding...' : 'Seed Sample Recipes'}
            </Button>
        </div>
      )}
    </div>
  );
}
