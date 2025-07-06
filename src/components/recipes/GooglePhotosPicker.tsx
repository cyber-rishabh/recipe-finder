'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { GooglePhoto } from '@/lib/google-photos';

interface GooglePhotosPickerProps {
  onPhotoSelect: (photoUrl: string) => void;
  disabled?: boolean;
}

export function GooglePhotosPicker({ onPhotoSelect, disabled = false }: GooglePhotosPickerProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<GooglePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Check if user is authenticated with Google Photos
  useEffect(() => {
    const token = localStorage.getItem('googlePhotosAccessToken');
    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticate = async () => {
    try {
      setIsLoading(true);
      
      // Get auth URL
      const authResponse = await fetch('/api/google-photos/auth');
      const { authUrl } = await authResponse.json();
      
      // Open Google OAuth in a popup
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
      
      // Listen for the redirect with authorization code
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const { code } = event.data;
          
          // Exchange code for tokens
          const tokenResponse = await fetch('/api/google-photos/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          
          const { accessToken: token } = await tokenResponse.json();
          
          // Store token
          localStorage.setItem('googlePhotosAccessToken', token);
          setAccessToken(token);
          setIsAuthenticated(true);
          setIsOpen(true);
          
          window.removeEventListener('message', handleMessage);
          popup?.close();
        }
      };
      
      window.addEventListener('message', handleMessage);
      
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Failed to authenticate with Google Photos.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !accessToken) return;
    
    try {
      setIsSearching(true);
      
      const response = await fetch('/api/google-photos/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, accessToken })
      });
      
      const { photos: searchResults } = await response.json();
      setPhotos(searchResults);
      
    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: 'Failed to search Google Photos.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhotoSelect = (photo: GooglePhoto) => {
    onPhotoSelect(photo.baseUrl);
    setIsOpen(false);
    toast({
      title: 'Photo Selected',
      description: 'Photo has been added to your recipe.',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('googlePhotosAccessToken');
    setAccessToken(null);
    setIsAuthenticated(false);
    setPhotos([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          disabled={disabled}
          className="w-full"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Import from Google Photos
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import from Google Photos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isAuthenticated ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Connect your Google Photos account to import photos for your recipes.
              </p>
              <Button 
                onClick={handleAuthenticate} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect Google Photos
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search for photos (e.g., 'pizza', 'pasta')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="max-w-md"
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching || !searchQuery.trim()}
                    size="sm"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Disconnect
                </Button>
              </div>
              
              {photos.length > 0 && (
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <Card 
                        key={photo.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handlePhotoSelect(photo)}
                      >
                        <CardContent className="p-2">
                          <div className="relative aspect-square">
                            <Image
                              src={photo.baseUrl}
                              alt={photo.filename}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 truncate">
                            {photo.filename}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
              
              {photos.length === 0 && searchQuery && !isSearching && (
                <div className="text-center py-8 text-muted-foreground">
                  No photos found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 