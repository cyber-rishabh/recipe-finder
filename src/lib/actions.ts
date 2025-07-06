interface RecipeData {
    title: string;
    cuisine: string;
    ingredients: string[];
    instructions: string[];
    imagePreview?: string | null;
    createdBy: string;
    imageHint: string;
}

export async function addRecipe(recipeData: RecipeData) {
    const { title, cuisine, ingredients, instructions, imagePreview, createdBy, imageHint } = recipeData;

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('cuisine', cuisine);
        formData.append('ingredients', JSON.stringify(ingredients));
        formData.append('instructions', JSON.stringify(instructions));
        
        if (imagePreview && imagePreview.startsWith('data:image')) {
            // Convert data URL to File object
            const response = await fetch(imagePreview);
            const blob = await response.blob();
            const file = new File([blob], 'recipe-image.jpg', { type: 'image/jpeg' });
            formData.append('image', file);
        }

        const response = await fetch('/api/recipes', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create recipe');
        }

    } catch (error) {
        console.error("Error adding recipe: ", error);
        throw new Error('Database Error: Failed to create recipe. Check console for details.');
    }
}
