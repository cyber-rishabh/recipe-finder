# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Setting up Environment Variables

This project uses Firebase for backend services like Authentication, Firestore, and Storage. To connect to your Firebase project, you need to provide your project's configuration keys.

1.  **Create a `.env` file** in the root of the project if it doesn't exist. You can copy the `.env.example` file as a template.
2.  **Find your Firebase project credentials:**
    *   Go to your [Firebase Console](https://console.firebase.google.com/).
    *   Select your project.
    *   Go to **Project Settings** (click the gear icon ⚙️).
    *   In the "General" tab, under "Your apps", find your web app.
    *   Under "Firebase SDK snippet", select **Config**.
3.  **Copy the values** from the `firebaseConfig` object and paste them into your `.env` file. The file should look like this:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    ```

After adding these variables, the Firebase connection error should be resolved.
