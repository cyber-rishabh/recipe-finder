import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/photoslibrary.readonly'];

export interface GooglePhoto {
  id: string;
  baseUrl: string;
  filename: string;
  mediaMetadata: {
    width: string;
    height: string;
    creationTime: string;
  };
}

export class GooglePhotosService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/google-auth-callback`
    );
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
  }

  async getTokenFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async searchPhotos(query: string, accessToken: string): Promise<GooglePhoto[]> {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    try {
      // Use fetch directly to avoid type issues with googleapis
      const response = await fetch(`https://photoslibrary.googleapis.com/v1/mediaItems:search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageSize: 20,
          filters: {
            mediaTypeFilter: {
              mediaTypes: ['PHOTO']
            },
            textFilter: {
              query: query
            }
          }
        })
      });

      const data = await response.json();
      
      return data.mediaItems?.map((item: any) => ({
        id: item.id,
        baseUrl: item.baseUrl,
        filename: item.filename,
        mediaMetadata: {
          width: item.mediaMetadata?.width || '',
          height: item.mediaMetadata?.height || '',
          creationTime: item.mediaMetadata?.creationTime || ''
        }
      })) || [];
    } catch (error) {
      console.error('Error searching Google Photos:', error);
      return [];
    }
  }

  async getPhotoUrl(photoId: string, accessToken: string): Promise<string | null> {
    try {
      const response = await fetch(`https://photoslibrary.googleapis.com/v1/mediaItems/${photoId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const data = await response.json();
      return data.baseUrl || null;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return null;
    }
  }
}

export const googlePhotosService = new GooglePhotosService(); 