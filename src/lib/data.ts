export interface Recipe {
    id: string;
    title: string;
    ingredients: string[];
    instructions: string[];
    cuisine: string;
    imageUrl: string;
    imageStoragePath: string; // Firebase Storage path
    createdBy: string;
    createdAt: string; // Stored as ISO string
    imageHint: string;
}

export const cuisines = ['All', 'Italian', 'Indian', 'American', 'Japanese', 'Mexican', 'Chinese', 'Thai', 'French', 'Other'];
