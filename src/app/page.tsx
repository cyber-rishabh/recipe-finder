import { RecipeList } from "@/components/recipes/RecipeList";

export default function Home() {
  return (
    <section>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Find Your Next Favorite Meal</h1>
        <p className="mt-2 text-lg text-muted-foreground">Search through a collection of delicious recipes.</p>
      </div>
      <RecipeList />
    </section>
  );
}
