'use client';

import { useState, useEffect } from 'react';
import { cuisines } from '@/lib/data';
import { defaultRecipes } from '@/lib/default-recipes';
import { RecipeCard } from './RecipeCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, ServerCrash } from 'lucide-react';
import type { Recipe } from '@/lib/data';
import { db, isFirebaseConfigured, firebaseConfig } from '@/lib/firebase/client';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const FirebaseConfigWarning = () => (
    <Alert variant="destructive" className="max-w-2xl mx-auto">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Firebase Not Configured</AlertTitle>
        <AlertDescription>
            <p>Your app is not connected to Firebase. Please configure your environment variables to enable saving and loading recipes.</p>
            <p className="font-mono bg-muted p-2 rounded-md mt-4 text-xs">
                Create a `.env.local` file and add the following keys from your Firebase project settings:
                <br/><br/>
                {Object.keys(firebaseConfig).map(key => <span key={key} className="block">{`NEXT_PUBLIC_${key.toUpperCase()}=...`}</span>)}
            </p>
        </AlertDescription>
    </Alert>
)

export function RecipeList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [firestoreRecipes, setFirestoreRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firebaseConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!firebaseConfigured || !db) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const q = query(collection(db, "recipes"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const recipes: Recipe[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            recipes.push({
                id: doc.id,
                title: data.title,
                ingredients: data.ingredients,
                instructions: Array.isArray(data.instructions) ? data.instructions : (data.instructions || "").split('\n'),
                cuisine: data.cuisine,
                imageUrl: data.imageUrl,
                imageStoragePath: data.imageStoragePath,
                createdBy: data.createdBy,
                createdAt: createdAt?.toDate().toISOString() || new Date().toISOString(),
                imageHint: data.imageHint,
            });
        });
        setFirestoreRecipes(recipes);
        setIsLoading(false);
    }, (err) => {
        console.error("Firestore error:", err);
        setError("Could not load recipes from the database. Please check your Firestore rules and configuration.");
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseConfigured]);
  
  const allRecipes = [...defaultRecipes, ...firestoreRecipes];

  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCuisine = selectedCuisine === 'All' || recipe.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

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

      {!firebaseConfigured && <FirebaseConfigWarning />}
      {isLoading && firebaseConfigured && (
          <div className="text-center py-16">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading delicious recipes...</p>
          </div>
      )}
      {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {!isLoading && !error && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
       {!isLoading && !error && filteredRecipes.length === 0 && (
        <div className="text-center py-16">
            <h2 className="text-2xl font-headline">No Recipes Found</h2>
            <p className="text-muted-foreground">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
}
