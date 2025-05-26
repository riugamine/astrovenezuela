import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CategoryImageUploaderProps {
  bannerUrl: string;
  onBannerChange: (url: string) => void;
}


type UploadError = {
  message: string;
  code?: string;
};
export function CategoryImageUploader({
  bannerUrl,
  onBannerChange
}: CategoryImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must not exceed 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const response = await fetch('/api/upload/category', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const { url } = await response.json();
      onBannerChange(url);
      toast.success('Imagen subida correctamente');
    } catch (error: unknown) {
      const err = error as UploadError;
      toast.error(err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row items-start gap-4">
        {bannerUrl && (
          <div className="relative w-full md:w-48 h-24 rounded-lg overflow-hidden">
            <Image
              src={bannerUrl}
              alt="Category banner"
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 w-full">
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="w-full"
            />
            {uploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Formato: JPG, PNG. Tamaño máximo: 10MB
          </p>
        </div>
      </div>
    </div>
  );
}