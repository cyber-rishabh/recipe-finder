import { RecipeForm } from "@/components/recipes/RecipeForm";
import { recipes } from "@/lib/data";
import { notFound } from "next/navigation";

export default function EditRecipePage({ params }: { params: { id: string } }) {
    const recipe = recipes.find((r) => r.id === params.id);
    
    // In a real app, you would fetch the recipe and check if the current user is the owner.
    
    if (!recipe) {
        notFound();
    }
    
    return <RecipeForm formType="Edit" recipe={recipe} />;
}
