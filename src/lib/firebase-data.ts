'use server';

import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, getDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Recipe } from './data';
import { revalidatePath } from 'next/cache';

type RecipeFormData = Omit<Recipe, 'id' | 'createdAt' | 'createdBy' | 'imageUrl' | 'imageStoragePath'> & {
    imageUrl: string; // Can be a data URI, an existing https URL, or empty
};


export async function addRecipe(formData: RecipeFormData, userId: string) {
    let imageUrl = '';
    let imageStoragePath = '';

    // If imageUrl is a new image (data URI), upload it to Storage.
    if (formData.imageUrl && formData.imageUrl.startsWith('data:')) {
        const fileName = `recipe_${Date.now()}`;
        const storageRef = ref(storage, `recipes/${userId}/${fileName}`);
        
        await uploadString(storageRef, formData.imageUrl, 'data_url');
        
        imageUrl = await getDownloadURL(storageRef);
        imageStoragePath = storageRef.fullPath;
    } else if (formData.imageUrl) {
        // If it's not a data URI, assume it's an existing URL (e.g., from AI generation that wasn't changed)
        // In this specific app flow, AI gives a data URI which is handled above, so this is a fallback.
        // We don't have a storage path for this, so we leave it empty.
        imageUrl = formData.imageUrl;
    }

    const recipeData = {
        ...formData,
        imageUrl,
        imageStoragePath,
        createdBy: userId,
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'recipes'), recipeData);
    
    revalidatePath('/');
    revalidatePath(`/recipe/${docRef.id}`);

    return { id: docRef.id };
}


export async function getRecipes() {
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const recipes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        } as Recipe;
    });
    return recipes;
}

export async function getRecipe(id: string) {
    const docRef = doc(db, 'recipes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        } as Recipe;
    } else {
        return null;
    }
}


export async function updateRecipe(id: string, formData: RecipeFormData, userId: string) {
    const docRef = doc(db, 'recipes', id);
    const recipeToUpdate = await getRecipe(id);

    if (!recipeToUpdate || recipeToUpdate.createdBy !== userId) {
        throw new Error('User not authorized to update this recipe.');
    }

    const updatedData: any = { ...formData };
    
    // Check if a new image (as data URI) was provided for upload
    if (formData.imageUrl && formData.imageUrl.startsWith('data:')) {
        // Delete old image from storage if it exists and was managed by us
        if (recipeToUpdate.imageStoragePath) {
            try {
                const oldImageRef = ref(storage, recipeToUpdate.imageStoragePath);
                await deleteObject(oldImageRef);
            } catch (error: any) {
                 if (error.code !== 'storage/object-not-found') {
                    console.warn("Could not delete old image:", error.message);
                }
            }
        }

        const fileName = `recipe_${Date.now()}`;
        const storageRef = ref(storage, `recipes/${userId}/${fileName}`);
        
        await uploadString(storageRef, formData.imageUrl, 'data_url');
        updatedData.imageUrl = await getDownloadURL(storageRef);
        updatedData.imageStoragePath = storageRef.fullPath;

    } else {
        // No new image was uploaded. We should not change the existing image fields.
        delete updatedData.imageUrl;
    }

    await updateDoc(docRef, updatedData);
    revalidatePath('/');
    revalidatePath(`/recipe/${id}`);
}

export async function deleteRecipe(id: string, userId: string) {
    const docRef = doc(db, 'recipes', id);
    const recipeToDelete = await getRecipe(id);

    if (!recipeToDelete) {
        throw new Error("Recipe not found.");
    }

    if (recipeToDelete.createdBy !== userId) {
        throw new Error("User not authorized to delete this recipe.");
    }
    
    // Delete image from storage if a path is stored
    if (recipeToDelete.imageStoragePath) {
        try {
            const imageRef = ref(storage, recipeToDelete.imageStoragePath);
            await deleteObject(imageRef);
        } catch (error: any) {
             if (error.code !== 'storage/object-not-found') {
                console.warn("Could not delete image:", error.message);
            }
        }
    }

    // Delete firestore document
    await deleteDoc(docRef);
    revalidatePath('/');
}

export async function seedRecipes() {
    const sampleRecipes = [
        {
            title: "Classic Spaghetti Carbonara",
            cuisine: "Italian",
            ingredients: ["200g Spaghetti", "100g Guanciale", "2 large Eggs", "50g Pecorino Romano", "Black Pepper"],
            instructions: ["Boil spaghetti until al dente.", "While pasta cooks, fry guanciale in a pan until crisp.", "In a bowl, whisk eggs and Pecorino cheese.", "Drain pasta, reserving some pasta water. Add pasta to the pan with guanciale.", "Remove from heat, pour in egg mixture, stirring quickly. Add pasta water if needed to create a creamy sauce.", "Serve immediately with lots of black pepper."],
            imageHint: "pasta carbonara",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Chicken Tikka Masala",
            cuisine: "Indian",
            ingredients: ["500g Chicken Breast", "1 cup Yogurt", "1 tbsp Ginger-Garlic Paste", "1 tsp Turmeric", "1 cup Tomato Puree", "1 cup Heavy Cream", "Garam Masala"],
            instructions: ["Marinate chicken in yogurt, ginger-garlic paste, and spices for at least 1 hour.", "Grill or pan-fry the chicken until cooked through.", "In a separate pan, heat tomato puree and simmer for 10 minutes.", "Stir in heavy cream and garam masala.", "Add the cooked chicken to the sauce and simmer for 5-10 minutes.", "Serve hot with naan or rice."],
            imageHint: "chicken tikka",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "American Cheeseburger",
            cuisine: "American",
            ingredients: ["500g Ground Beef", "4 Burger Buns", "4 slices Cheddar Cheese", "Lettuce", "Tomato", "Onion", "Pickles"],
            instructions: ["Form ground beef into 4 patties.", "Season patties with salt and pepper.", "Grill or pan-fry patties to desired doneness.", "Place a slice of cheddar cheese on each patty during the last minute of cooking.", "Toast the burger buns.", "Assemble burgers with lettuce, tomato, onion, and pickles."],
            imageHint: "cheeseburger meal",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Sushi Rolls (Maki)",
            cuisine: "Japanese",
            ingredients: ["2 cups Sushi Rice", "4 sheets Nori", "1 Cucumber", "1 Avocado", "200g Tuna or Salmon", "Soy Sauce", "Wasabi"],
            instructions: ["Cook sushi rice according to package directions.", "Lay a sheet of nori on a bamboo rolling mat.", "Spread a thin layer of rice over the nori, leaving a small border at the top.", "Place your fillings (cucumber, avocado, fish) in a line across the center.", "Roll the nori tightly from the bottom up.", "Slice the roll into 8 pieces and serve with soy sauce and wasabi."],
            imageHint: "sushi rolls",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Classic Beef Tacos",
            cuisine: "Mexican",
            ingredients: ["500g Ground Beef", "1 packet Taco Seasoning", "8 Taco Shells", "Salsa", "Sour Cream", "Shredded Cheese", "Shredded Lettuce"],
            instructions: ["Brown the ground beef in a skillet; drain fat.", "Stir in taco seasoning and a little water; simmer for 5 minutes.", "Warm taco shells in the oven.", "Fill shells with beef mixture.", "Top with salsa, sour cream, cheese, and lettuce."],
            imageHint: "beef tacos",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Kung Pao Chicken",
            cuisine: "Chinese",
            ingredients: ["500g Chicken Breast, cubed", "1 tbsp Soy Sauce", "1 tbsp Cornstarch", "Dried Red Chilies", "Peanuts", "1 Bell Pepper", "Scallions"],
            instructions: ["In a bowl, toss chicken with soy sauce and cornstarch.", "Heat oil in a wok or large skillet. Stir-fry chicken until golden.", "Add dried chilies and peanuts, stir-frying for another minute.", "Add chopped bell pepper and a sauce made of soy sauce, vinegar, and sugar.", "Cook until sauce thickens. Garnish with scallions."],
            imageHint: "kung pao",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Thai Green Curry",
            cuisine: "Thai",
            ingredients: ["2 tbsp Green Curry Paste", "400ml Coconut Milk", "500g Chicken or Tofu", "1 cup Bamboo Shoots", "1 Red Bell Pepper", "Thai Basil Leaves"],
            instructions: ["In a large pot, fry the green curry paste for one minute until fragrant.", "Stir in half of the coconut milk and cook until the oil separates.", "Add the chicken or tofu and cook until done.", "Add the remaining coconut milk, bamboo shoots, and bell pepper. Simmer until vegetables are tender.", "Stir in Thai basil leaves before serving."],
            imageHint: "green curry",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "French Onion Soup",
            cuisine: "French",
            ingredients: ["4 large Onions, sliced", "4 tbsp Butter", "1 liter Beef Broth", "250ml White Wine", "Baguette slices", "Gruyere Cheese"],
            instructions: ["In a large pot, melt butter and cook onions slowly for 25-30 minutes until deeply caramelized.", "Deglaze the pot with white wine.", "Add beef broth and simmer for at least 30 minutes.", "Ladle soup into oven-safe bowls.", "Top with a slice of baguette and a generous amount of Gruyere cheese.", "Broil until cheese is bubbly and golden."],
            imageHint: "onion soup",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Caprese Salad",
            cuisine: "Italian",
            ingredients: ["4 large Tomatoes", "250g Fresh Mozzarella", "Fresh Basil Leaves", "Extra Virgin Olive Oil", "Balsamic Glaze"],
            instructions: ["Slice tomatoes and mozzarella into 1/4-inch thick slices.", "Arrange alternating slices of tomato, mozzarella, and basil leaves on a platter.", "Drizzle with extra virgin olive oil.", "Season with salt and pepper.", "Finish with a drizzle of balsamic glaze just before serving."],
            imageHint: "caprese salad",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Chocolate Chip Cookies",
            cuisine: "American",
            ingredients: ["2 1/4 cups All-Purpose Flour", "1 tsp Baking Soda", "1 cup Butter, softened", "3/4 cup Granulated Sugar", "3/4 cup Brown Sugar", "2 large Eggs", "2 cups Chocolate Chips"],
            instructions: ["Preheat oven to 375°F (190°C).", "In a small bowl, whisk together flour and baking soda.", "In a large bowl, beat butter, granulated sugar, and brown sugar until creamy.", "Add eggs one at a time, beating well after each.", "Gradually beat in the flour mixture.", "Stir in chocolate chips.", "Drop by rounded spoonfuls onto ungreased baking sheets.", "Bake for 9 to 11 minutes or until golden brown."],
            imageHint: "chocolate cookies",
            imageUrl: "https://placehold.co/600x400",
        }
    ];

    const recipesCollection = collection(db, 'recipes');
    const existingRecipes = await getDocs(query(recipesCollection));
    
    if (existingRecipes.size > 0) {
        console.log("Database already has recipes. Seeding skipped.");
        return; 
    }

    const batch = [];
    for (const recipe of sampleRecipes) {
        const recipeData = {
            ...recipe,
            createdBy: 'system-seed',
            createdAt: serverTimestamp(),
            imageStoragePath: '' // No storage path for seeded images
        };
        batch.push(addDoc(collection(db, 'recipes'), recipeData));
    }
    
    await Promise.all(batch);
    console.log("Database seeded successfully.");
    revalidatePath('/');
}
