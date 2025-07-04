import { RecipeForm } from "@/components/recipes/RecipeForm";

export default function AddRecipePage() {
    // In a real app, you would add logic here to redirect if the user is not authenticated.
    return <RecipeForm formType="Add" />;
}
