export interface Recipe {
    id: string;
    title: string;
    ingredients: string[];
    instructions: string[];
    cuisine: string;
    imageUrl: string;
    createdBy: string;
    createdAt: string;
    imageHint: string;
}

export const recipes: Recipe[] = [
    {
        id: '1',
        title: 'Classic Spaghetti Carbonara',
        ingredients: ['Spaghetti', 'Guanciale', 'Pecorino Romano Cheese', 'Eggs', 'Black Pepper'],
        instructions: [
            'Cook spaghetti according to package directions.',
            'While pasta is cooking, fry guanciale in a pan until crisp.',
            'In a bowl, whisk eggs, cheese, and a generous amount of black pepper.',
            'Drain pasta, reserving some pasta water. Add pasta to the pan with guanciale.',
            'Remove from heat and quickly stir in the egg mixture, adding pasta water to create a creamy sauce.',
            'Serve immediately with more cheese and pepper.'
        ],
        cuisine: 'Italian',
        imageUrl: 'https://placehold.co/600x400',
        imageHint: 'pasta carbonara',
        createdBy: 'user1',
        createdAt: '2023-10-26T10:00:00Z',
    },
    {
        id: '2',
        title: 'Chicken Tikka Masala',
        ingredients: ['Chicken Breast', 'Yogurt', 'Tomato Puree', 'Garam Masala', 'Ginger', 'Garlic', 'Cream'],
        instructions: [
            'Marinate chicken in yogurt and spices for at least 1 hour.',
            'Grill or pan-fry the chicken until cooked through.',
            'In a separate pan, create the sauce with tomato puree, ginger, garlic, and garam masala.',
            'Add the cooked chicken to the sauce.',
            'Stir in cream and simmer for 5-10 minutes.',
            'Serve with rice or naan bread.'
        ],
        cuisine: 'Indian',
        imageUrl: 'https://placehold.co/600x400',
        imageHint: 'chicken tikka',
        createdBy: 'user2',
        createdAt: '2023-10-25T12:30:00Z',
    },
    {
        id: '3',
        title: 'Avocado Toast',
        ingredients: ['Sourdough Bread', 'Avocado', 'Red Pepper Flakes', 'Lemon Juice', 'Salt', 'Pepper'],
        instructions: [
            'Toast the sourdough bread to your liking.',
            'Mash the avocado with a fork and mix in lemon juice, salt, and pepper.',
            'Spread the mashed avocado on the toast.',
            'Sprinkle with red pepper flakes.',
            'Serve immediately.'
        ],
        cuisine: 'American',
        imageUrl: 'https://placehold.co/600x400',
        imageHint: 'avocado toast',
        createdBy: 'user1',
        createdAt: '2023-10-24T09:00:00Z',
    },
    {
        id: '4',
        title: 'Japanese Sushi Rolls',
        ingredients: ['Sushi Rice', 'Nori Seaweed Sheets', 'Cucumber', 'Avocado', 'Fresh Salmon', 'Soy Sauce'],
        instructions: [
            'Prepare sushi rice according to package instructions.',
            'Lay a sheet of nori on a bamboo rolling mat.',
            'Spread a thin layer of sushi rice over the nori.',
            'Arrange slices of salmon, cucumber, and avocado in a line.',
            'Roll the sushi tightly using the bamboo mat.',
            'Slice the roll into pieces and serve with soy sauce.'
        ],
        cuisine: 'Japanese',
        imageUrl: 'https://placehold.co/600x400',
        imageHint: 'sushi rolls',
        createdBy: 'user3',
        createdAt: '2023-10-23T18:00:00Z',
    }
];

export const cuisines = ['All', 'Italian', 'Indian', 'American', 'Japanese', 'Mexican', 'Chinese'];
