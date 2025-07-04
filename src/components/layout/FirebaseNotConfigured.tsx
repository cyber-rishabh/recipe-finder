import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';

export function FirebaseNotConfigured() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <Code /> Firebase Not Configured
          </CardTitle>
          <CardDescription>
            Your app is missing the necessary Firebase configuration. To fix this,
            please follow the steps below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            1. Create a file named <strong>.env</strong> in the root of your project if it doesn&apos;t exist.
          </p>
          <p>
            2. Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Firebase Console</a>, select your project, go to <strong>Project Settings</strong> (the gear icon), and find your web app&apos;s configuration.
          </p>
          <p>3. Copy the following content into your <strong>.env</strong> file and replace the placeholder values with your actual Firebase project credentials:</p>
          <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs">
            <code>
{`NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"`}
            </code>
          </pre>
          <p>
            Once you have added these variables, the application will connect to Firebase and work as expected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
