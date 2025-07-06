'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GoogleAuthCallback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Handle error
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: error
      }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      // Send the authorization code back to the parent window
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        code: code
      }, window.location.origin);
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
} 