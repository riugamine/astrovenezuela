import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { uploadCategoryImage } from '@/lib/data/admin/actions/categories';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CategoryImageUploaderProps {
  bannerUrl: string;
  onBannerChange: (url: string) => void;
}



export function CategoryImageUploader({
  bannerUrl,
  onBannerChange
}: CategoryImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      const imageUrl = await uploadCategoryImage(file);
      onBannerChange(imageUrl);
      toast.success('Banner uploaded successfully');
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Error uploading banner');
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