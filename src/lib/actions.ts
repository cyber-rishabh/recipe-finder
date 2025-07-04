'use server';

import { ingredientSubstitution } from '@/ai/flows/ingredient-substitution';
import type { IngredientSubstitutionInput } from '@/ai/flows/ingredient-substitution';
import { generateRecipeFromImage } from '@/ai/flows/recipe-from-image';
import type { RecipeFromImageInput } from '@/ai/flows/recipe-from-image';


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
