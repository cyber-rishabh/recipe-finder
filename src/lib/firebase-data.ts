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
            title: "Margherita Pizza",
            cuisine: "Italian",
            ingredients: ["Pizza Dough", "1 cup Tomato Sauce", "200g Fresh Mozzarella", "Fresh Basil Leaves", "Olive Oil", "Salt"],
            instructions: ["Preheat oven to 475°F (245°C).", "Roll out pizza dough on a floured surface.", "Spread tomato sauce evenly over the dough.", "Tear mozzarella into small pieces and distribute over the sauce.", "Bake for 10-12 minutes, or until the crust is golden and cheese is bubbly.", "Top with fresh basil leaves, a drizzle of olive oil, and a pinch of salt before serving."],
            imageHint: "margherita pizza",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Pad Thai",
            cuisine: "Thai",
            ingredients: ["200g Rice Noodles", "150g Shrimp or Tofu", "2 Eggs", "1 cup Bean Sprouts", "1/4 cup Crushed Peanuts", "3 tbsp Tamarind Paste", "2 tbsp Fish Sauce", "1 tbsp Sugar", "Lime Wedges"],
            instructions: ["Soak rice noodles in warm water until soft, then drain.", "In a wok, scramble eggs and set aside.", "Sauté shrimp or tofu until cooked.", "Add noodles, tamarind paste, fish sauce, and sugar. Stir-fry for 2-3 minutes.", "Add bean sprouts and scrambled eggs. Toss to combine.", "Serve topped with crushed peanuts and a lime wedge."],
            imageHint: "pad thai",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Classic Beef Stew",
            cuisine: "American",
            ingredients: ["1kg Beef Chuck, cubed", "2 tbsp Olive Oil", "2 Onions", "4 Carrots", "4 Potatoes", "1 liter Beef Broth", "2 tbsp Tomato Paste", "1 tsp Thyme"],
            instructions: ["In a large pot, heat olive oil and brown the beef cubes in batches. Remove and set aside.", "Sauté onions until softened.", "Stir in tomato paste and cook for 1 minute.", "Return beef to the pot. Add beef broth and thyme. Bring to a simmer.", "Cover and cook on low for 2 hours.", "Add carrots and potatoes, and cook for another hour until beef and vegetables are tender."],
            imageHint: "beef stew",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Miso Soup",
            cuisine: "Japanese",
            ingredients: ["4 cups Dashi (Japanese soup stock)", "3-4 tbsp Miso Paste", "200g Silken Tofu, cubed", "1 tbsp Dried Wakame Seaweed", "2 Scallions, chopped"],
            instructions: ["Rehydrate wakame in a little water, then drain.", "In a pot, bring the dashi to a simmer. Do not boil.", "In a small bowl, whisk the miso paste with a little hot dashi until smooth. Stir it into the pot.", "Add tofu and wakame. Heat through gently for a minute.", "Serve immediately, garnished with chopped scallions."],
            imageHint: "miso soup",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Chicken Fajitas",
            cuisine: "Mexican",
            ingredients: ["500g Chicken Breast, sliced", "1 Onion, sliced", "2 Bell Peppers, sliced", "1 packet Fajita Seasoning", "8 Flour Tortillas", "Sour Cream", "Salsa", "Guacamole"],
            instructions: ["In a large skillet, cook chicken slices with fajita seasoning until browned.", "Add sliced onion and bell peppers. Cook until tender-crisp.", "Warm tortillas in a dry skillet or microwave.", "Serve the chicken and vegetable mixture with warm tortillas and your favorite toppings like sour cream, salsa, and guacamole."],
            imageHint: "chicken fajitas",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Sweet and Sour Pork",
            cuisine: "Chinese",
            ingredients: ["500g Pork, cubed", "1 cup Pineapple Chunks", "1 Green Bell Pepper, chopped", "For sauce: 1/2 cup Vinegar", "1/2 cup Sugar", "2 tbsp Soy Sauce", "1 tbsp Ketchup"],
            instructions: ["Coat pork cubes in cornstarch and deep-fry until golden. Drain and set aside.", "In a separate pan, combine vinegar, sugar, soy sauce, and ketchup for the sauce. Bring to a simmer.", "Add bell pepper and pineapple chunks to the sauce, cooking for a few minutes.", "Stir in the fried pork, ensuring it's well-coated with the sauce.", "Serve immediately with steamed rice."],
            imageHint: "sweet sour",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Butter Chicken (Murgh Makhani)",
            cuisine: "Indian",
            ingredients: ["500g Chicken, cubed", "1 cup Tomato Puree", "1/2 cup Heavy Cream", "1/4 cup Butter", "1 tbsp Ginger-Garlic Paste", "1 tsp Garam Masala", "1 tsp Kasuri Methi (dried fenugreek)"],
            instructions: ["Marinate chicken with ginger-garlic paste and salt.", "In a pan, melt butter and cook the tomato puree until it thickens.", "Add garam masala and cook for a minute.", "Stir in the heavy cream and kasuri methi.", "Add the chicken and simmer until cooked through and the sauce is creamy.", "Serve hot with naan or rice."],
            imageHint: "butter chicken",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Quiche Lorraine",
            cuisine: "French",
            ingredients: ["1 unbaked 9-inch Pie Crust", "200g Bacon, cooked and crumbled", "150g Gruyère Cheese, shredded", "3 large Eggs", "1 1/2 cups Heavy Cream", "Pinch of Nutmeg", "Salt and Pepper"],
            instructions: ["Preheat oven to 375°F (190°C).", "Sprinkle crumbled bacon and shredded cheese into the bottom of the pie crust.", "In a bowl, whisk together eggs and heavy cream.", "Season with salt, pepper, and a pinch of nutmeg.", "Carefully pour the egg mixture over the bacon and cheese.", "Bake for 35-40 minutes, or until the center is set.", "Let it cool slightly before slicing."],
            imageHint: "quiche lorraine",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Authentic Greek Salad",
            cuisine: "Other",
            ingredients: ["2 large Tomatoes, chopped", "1 Cucumber, chopped", "1 Red Onion, thinly sliced", "1/2 cup Kalamata Olives", "200g Feta Cheese, crumbled", "4 tbsp Olive Oil", "2 tbsp Red Wine Vinegar", "1 tsp Dried Oregano"],
            instructions: ["In a large bowl, combine chopped tomatoes, cucumber, and red onion.", "Add Kalamata olives and gently toss.", "In a small bowl, whisk together olive oil, red wine vinegar, and oregano. Season with salt and pepper.", "Pour the dressing over the vegetables and toss to combine.", "Top with crumbled feta cheese before serving."],
            imageHint: "greek salad",
            imageUrl: "https://placehold.co/600x400",
        },
        {
            title: "Classic Apple Pie",
            cuisine: "American",
            ingredients: ["1 double-crust Pie Dough", "6-8 Apples, peeled and sliced", "3/4 cup Sugar", "2 tbsp All-Purpose Flour", "1 tsp Cinnamon", "1/4 tsp Nutmeg", "2 tbsp Butter"],
            instructions: ["Preheat oven to 425°F (220°C).", "Line a 9-inch pie plate with one half of the pie dough.", "In a large bowl, toss sliced apples with sugar, flour, cinnamon, and nutmeg.", "Pour the apple mixture into the pie crust and dot with butter.", "Place the second crust on top, trim and crimp the edges, and cut slits for steam to escape.", "Bake for 40-50 minutes, or until the crust is golden brown and the filling is bubbly."],
            imageHint: "apple pie",
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
