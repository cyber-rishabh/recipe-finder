'use server';

import { ingredientSubstitution } from '@/ai/flows/ingredient-substitution';
import type { IngredientSubstitutionInput } from '@/ai/flows/ingredient-substitution';

export async function runIngredientSubstitution(input: IngredientSubstitutionInput) {
    try {
        const result = await ingredientSubstitution(input);
        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to get ingredient substitutions.');
    }
}
