import { RecipeList } from "@/components/recipes/RecipeList";
import { Button } from "@/components/ui/button";
import { Plus, Search, ChefHat } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <ChefHat className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Culinary Delights
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Discover, create, and share your favorite recipes. From quick weeknight dinners to gourmet masterpieces.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/add-recipe">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your Recipe
                </Button>
              </Link>
              <Link href="/search-recipe">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  <Search className="mr-2 h-5 w-5" />
                  Search Recipes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            Your Recipe Collection
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Browse through your saved recipes or add new ones to your collection
          </p>
        </div>
        <RecipeList />
      </section>
    </div>
  );
}
