'use server';

/**
 * @fileOverview Ingredient substitution suggestion flow.
 *
 * - ingredientSubstitution - A function that suggests ingredient substitutions.
 * - IngredientSubstitutionInput - The input type for the ingredientSubstitution function.
 * - IngredientSubstitutionOutput - The return type for the ingredientSubstitution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngredientSubstitutionInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  ingredient: z.string().describe('The ingredient to be substituted.'),
});
export type IngredientSubstitutionInput = z.infer<typeof IngredientSubstitutionInputSchema>;

const IngredientSubstitutionOutputSchema = z.object({
  substitutions: z
    .array(z.string())
    .describe('An array of suggested substitutions for the ingredient.'),
});
export type IngredientSubstitutionOutput = z.infer<typeof IngredientSubstitutionOutputSchema>;

export async function ingredientSubstitution(input: IngredientSubstitutionInput): Promise<IngredientSubstitutionOutput> {
  return ingredientSubstitutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ingredientSubstitutionPrompt',
  input: {schema: IngredientSubstitutionInputSchema},
  output: {schema: IngredientSubstitutionOutputSchema},
  prompt: `Suggest some common substitutions for the ingredient "{{{ingredient}}}" in the recipe "{{{recipeName}}}". Return a list of possible substitutions. If there are no good substitutions, return an empty array.`,  
});

const ingredientSubstitutionFlow = ai.defineFlow(
  {
    name: 'ingredientSubstitutionFlow',
    inputSchema: IngredientSubstitutionInputSchema,
    outputSchema: IngredientSubstitutionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
