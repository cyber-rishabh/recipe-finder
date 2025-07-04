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
        instructions: formData.instructions,
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
    
    updatedData.instructions = formData.instructions;

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
