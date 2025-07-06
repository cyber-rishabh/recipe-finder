export interface Recipe {
    id: string;
    title: string;
    ingredients: string[];
    instructions: string[];
    cuisine: string;
    imageUrl: string;
    imageStoragePath: string; // Image storage path
    createdBy: string;
    createdAt: string; // Stored as ISO string
    imageHint: string;
}

export const cuisines = [
    'All',
    'Italian',
    'Mexican',
    'Chinese',
    'Indian',
    'Japanese',
    'Thai',
    'French',
    'Mediterranean',
    'American',
    'Korean',
    'Vietnamese',
    'Greek',
    'Spanish',
    'Middle Eastern',
    'African',
    'Caribbean',
    'Latin American',
    'European',
    'Asian',
    'International',
] as const;
