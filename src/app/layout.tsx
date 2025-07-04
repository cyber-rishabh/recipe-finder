import type {Metadata} from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { FirebaseNotConfigured } from '@/components/layout/FirebaseNotConfigured';

export const metadata: Metadata = {
  title: 'Recipe Hub',
  description: 'A place to find and share your favorite recipes.',
};

const isFirebaseConfigured =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your-api-key' &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'your-project-id';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        {isFirebaseConfigured ? (
            <AuthProvider>
                <Header />
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>
                <Footer />
                <Toaster />
            </AuthProvider>
        ) : (
            <FirebaseNotConfigured />
        )}
      </body>
    </html>
  );
}
