'use client';

import { useState } from 'react';
import { runIngredientSubstitution } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface IngredientSubstitutionProps {
  recipeName: string;
  ingredient: string;
}

export function IngredientSubstitution({ recipeName, ingredient }: IngredientSubstitutionProps) {
  const [substitutions, setSubstitutions] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {
    if (substitutions) { // don't refetch if we already have data
        setIsOpen(true);
        return;
    }
    setIsLoading(true);
    setError(null);
    setSubstitutions(null);

    try {
      const result = await runIngredientSubstitution({ recipeName, ingredient });
      setSubstitutions(result.substitutions);
    } catch (e) {
      setError('Could not fetch substitutions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-1">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary/80 hover:text-primary" onClick={handleSubmit}>
                    <Lightbulb className="mr-1 h-3 w-3" />
                    Suggest substitutes
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="space-y-4">
                    <h4 className="font-medium leading-none font-headline">Substitutes for {ingredient}</h4>
                    {isLoading && <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Finding suggestions...</div>}
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                    {substitutions && (
                        substitutions.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {substitutions.map((sub, index) => <li key={index}>{sub}</li>)}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No common substitutions found.</p>
                        )
                    )}
                </div>
            </PopoverContent>
        </Popover>
    </div>
  );
}
