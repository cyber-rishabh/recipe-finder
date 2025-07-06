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
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="p-0">
          <div className="relative h-56 w-full overflow-hidden">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={recipe.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 text-foreground border-0 font-medium">
                {recipe.cuisine}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-6">
          <CardTitle className="font-headline text-xl leading-tight mb-3 text-foreground group-hover:text-primary transition-colors">
            {recipe.title}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <ChefHat className="mr-2 h-4 w-4" />
            <span>{recipe.ingredients.length} ingredients</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recipe.ingredients.slice(0, 3).map((ingredient) => (
              <Badge 
                key={ingredient} 
                variant="secondary" 
                className="text-xs bg-muted/50 hover:bg-muted transition-colors"
              >
                {ingredient}
              </Badge>
            ))}
            {recipe.ingredients.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs border-muted-foreground/20"
              >
                +{recipe.ingredients.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
