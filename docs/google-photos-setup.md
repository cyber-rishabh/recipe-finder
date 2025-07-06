# Google Photos API Integration Setup

This guide explains how to set up Google Photos API integration for importing photos into your recipes.

## Prerequisites

1. A Google Cloud Project
2. Google Photos Library API enabled
3. OAuth 2.0 credentials configured

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Photos Library API

### 2. Configure OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:9002/google-auth-callback` (for development)
   - `https://yourdomain.com/google-auth-callback` (for production)

### 3. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Google Photos API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:9002

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

### 4. API Scopes

The application requests the following scope:
- `https://www.googleapis.com/auth/photoslibrary.readonly` - Read-only access to Google Photos

## Usage

Once configured, users can:

1. Click "Import from Google Photos" in the recipe form
2. Authenticate with their Google account
3. Search for photos using keywords (e.g., "pizza", "pasta")
4. Select photos to add to their recipes

## Security Notes

- Access tokens are stored in localStorage (consider using secure HTTP-only cookies for production)
- Only read-only access is requested
- Users can disconnect their account at any time
- No photos are stored on your server - only URLs are saved

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure the redirect URI in Google Cloud Console matches your app URL
   - Check that `NEXT_PUBLIC_APP_URL` is set correctly

2. **"API not enabled" error**
   - Enable Google Photos Library API in Google Cloud Console

3. **"Access denied" error**
   - Check that your OAuth credentials are correct
   - Verify the API is enabled for your project

### Development vs Production

- For development: Use `http://localhost:9002` as the redirect URI
- For production: Use your actual domain as the redirect URI
- Update `NEXT_PUBLIC_APP_URL` accordingly 