'use server';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { revalidatePath } from 'next/cache';
import { db, storage } from '@/lib/firebase/client';

import { ingredientSubstitution } from '@/ai/flows/ingredient-substitution';
import type { IngredientSubstitutionInput } from '@/ai/flows/ingredient-substitution';
import { generateRecipeFromImage } from '@/ai/flows/recipe-from-image';
import type { RecipeFromImageInput } from '@/ai/flows/recipe-from-image';

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
    if (!db || !storage) {
        throw new Error("Firebase not configured. Cannot add recipe.");
    }
    
    const { title, cuisine, ingredients, instructions, imagePreview, createdBy, imageHint } = recipeData;

    try {
        let imageUrl = 'https://placehold.co/600x400';
        let imageStoragePath = '';

        if (imagePreview && imagePreview.startsWith('data:image')) {
            const storageRef = ref(storage, `recipes/${createdBy}/${Date.now()}_${title.replace(/\s+/g, '_')}`);
            const uploadResult = await uploadString(storageRef, imagePreview, 'data_url');
            imageUrl = await getDownloadURL(uploadResult.ref);
            imageStoragePath = uploadResult.ref.fullPath;
        } else if (imagePreview) {
            imageUrl = imagePreview;
        }

        await addDoc(collection(db, 'recipes'), {
            title,
            cuisine,
            ingredients,
            instructions,
            imageUrl,
            imageStoragePath,
            createdBy,
            createdAt: serverTimestamp(),
            imageHint,
        });

    } catch (error) {
        console.error("Error adding recipe: ", error);
        // This will be caught by the client-side try-catch block
        throw new Error('Database Error: Failed to create recipe. Check console for details.');
    }

    // Revalidate the home page to show the new recipe immediately
    revalidatePath('/');
}


export async function runIngredientSubstitution(input: IngredientSubstitutionInput) {
    try {
        const result = await ingredientSubstitution(input);
        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to get ingredient substitutions.');
    }
}

export async function runGenerateRecipeFromImage(input: RecipeFromImageInput) {
    try {
        const result = await generateRecipeFromImage(input);
        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to generate recipe from image.');
    }
}
