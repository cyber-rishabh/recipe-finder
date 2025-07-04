import type { Recipe } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={recipe.imageHint}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <CardTitle className="font-headline text-xl leading-tight mb-2">{recipe.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <ChefHat className="mr-1.5 h-4 w-4" />
            <span>{recipe.cuisine}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <div className="flex flex-wrap gap-1">
                {recipe.ingredients.slice(0, 3).map((ingredient) => (
                    <Badge key={ingredient} variant="secondary">{ingredient}</Badge>
                ))}
                {recipe.ingredients.length > 3 && (
                    <Badge variant="outline">+{recipe.ingredients.length - 3} more</Badge>
                )}
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
