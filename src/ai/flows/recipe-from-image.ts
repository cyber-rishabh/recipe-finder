'use server';
/**
 * @fileOverview A flow that generates a recipe from an image of a dish.
 *
 * - generateRecipeFromImage - A function that generates a recipe.
 * - RecipeFromImageInput - The input type for the generateRecipeFromImage function.
 * - RecipeFromImageOutput - The return type for the generateRecipeFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecipeFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecipeFromImageInput = z.infer<typeof RecipeFromImageInputSchema>;

const RecipeFromImageOutputSchema = z.object({
  title: z.string().describe('A creative and fitting title for the recipe.'),
  cuisine: z.string().describe('The cuisine type of the dish (e.g., Italian, Mexican, etc.).'),
  ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
  instructions: z.array(z.string()).describe('A list of step-by-step instructions to prepare the dish.'),
});
export type RecipeFromImageOutput = z.infer<typeof RecipeFromImageOutputSchema>;

export async function generateRecipeFromImage(input: RecipeFromImageInput): Promise<RecipeFromImageOutput> {
  return recipeFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recipeFromImagePrompt',
  input: {schema: RecipeFromImageInputSchema},
  output: {schema: RecipeFromImageOutputSchema},
  prompt: `You are a culinary expert who can identify dishes from photos and create recipes for them.

Analyze the provided image and generate a plausible recipe. Your response must be in the format requested.

- Give the dish a creative and fitting title.
- Identify the cuisine type.
- Provide a list of ingredients.
- Provide a list of step-by-step instructions.

Image of the dish:
{{media url=photoDataUri}}`,
});

const recipeFromImageFlow = ai.defineFlow(
  {
    name: 'recipeFromImageFlow',
    inputSchema: RecipeFromImageInputSchema,
    outputSchema: RecipeFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
