'use server';

import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, getDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Recipe } from './data';
import { revalidatePath } from 'next/cache';

// Helper to convert data URI to Blob
function dataUriToBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}


export async function addRecipe(formData: Omit<Recipe, 'id' | 'createdAt' | 'imageUrl'> & { imageUrl: string | File }, userId: string) {
    let imageUrl = '';
    let imagePath = '';

    if (formData.imageUrl) {
        const imageFile = formData.imageUrl;
        const fileName = `recipe_${Date.now()}`;
        const storageRef = ref(storage, `recipes/${userId}/${fileName}`);
        imagePath = storageRef.fullPath;
        
        if (typeof imageFile === 'string') {
            // It's a data URI from the AI generator
             await uploadString(storageRef, imageFile, 'data_url');
        } else {
             // It's a File object from direct upload - this requires a different upload method not easily available server-side without multipart parsers.
             // We'll stick to data URI for simplicity of this server action. Client should convert File to data URI before calling.
             throw new Error('File object upload from server action is not supported. Please convert to data URI on the client.');
        }
        imageUrl = await getDownloadURL(storageRef);
    }

    const recipeData = {
        ...formData,
        imageUrl,
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


export async function updateRecipe(id: string, formData: Partial<Omit<Recipe, 'id' | 'createdAt' | 'imageUrl'>> & { imageUrl?: string | File }, userId: string) {
    const docRef = doc(db, 'recipes', id);
    const recipeToUpdate = await getRecipe(id);

    if (recipeToUpdate?.createdBy !== userId) {
        throw new Error('User not authorized to update this recipe.');
    }

    const updatedData: any = { ...formData };
    
    if (formData.imageUrl && (typeof formData.imageUrl === 'string' && formData.imageUrl.startsWith('data:'))) {
        const imageFile = formData.imageUrl;
        // Delete old image if it exists
        if (recipeToUpdate.imageUrl) {
            try {
                const oldImageRef = ref(storage, recipeToUpdate.imageUrl);
                await deleteObject(oldImageRef);
            } catch (error: any) {
                // It's okay if old image deletion fails (e.g., it doesn't exist)
                console.warn("Could not delete old image:", error.message);
            }
        }

        const fileName = `recipe_${Date.now()}`;
        const storageRef = ref(storage, `recipes/${userId}/${fileName}`);
        
        await uploadString(storageRef, imageFile, 'data_url');
        updatedData.imageUrl = await getDownloadURL(storageRef);
    } else if (formData.imageUrl === null) {
        // Image was removed
        updatedData.imageUrl = '';
    } else {
        // No new image, or it's the existing URL string. Remove from update data.
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
    
    // Delete image from storage
    if (recipeToDelete.imageUrl) {
        try {
            const imageRef = ref(storage, recipeToDelete.imageUrl);
            await deleteObject(imageRef);
        } catch (error: any) {
             console.warn("Could not delete image, it may not exist:", error.message);
        }
    }

    // Delete firestore document
    await deleteDoc(docRef);
    revalidatePath('/');
}
