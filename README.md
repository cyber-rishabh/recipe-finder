# Recipe Finder

A modern recipe management application built with Next.js, featuring AI-powered recipe generation and Google Photos integration.

## Features

- 🍳 **Recipe Management**: Create, edit, and organize your favorite recipes
- 🤖 **AI Recipe Generation**: Generate recipes from ingredients or descriptions
- 📸 **Google Photos Integration**: Import photos directly from your Google Photos library
- 🔍 **Smart Search**: Search recipes by ingredients, cuisine, or name
- 👤 **User Authentication**: Secure user accounts with JWT authentication
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Google Cloud Project (for Google Photos integration)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see `.env.example`)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Google Photos Integration

This app includes Google Photos API integration for importing photos into recipes. See [Google Photos Setup Guide](docs/google-photos-setup.md) for detailed configuration instructions.

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **AI**: Google Genkit for recipe generation
- **Photos**: Google Photos API integration

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
```
