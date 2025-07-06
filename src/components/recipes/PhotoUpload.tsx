'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  onPhotoSelect: (photoUrl: string) => void;
  disabled?: boolean;
  currentImage?: string | null;
}

export function PhotoUpload({ onPhotoSelect, disabled = false, currentImage }: PhotoUploadProps) {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please select an image file.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onPhotoSelect(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onPhotoSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Upload Recipe Photo
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop an image here, or click to browse
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, GIF up to 5MB
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
            <Image 
              src={preview} 
              alt="Recipe preview" 
              fill 
              className="object-cover" 
            />
            <Button
              onClick={removeImage}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-red-500 hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
} 