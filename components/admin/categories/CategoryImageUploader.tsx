import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { toast } from 'sonner';

interface CategoryImageUploaderProps {
  bannerUrl: string;
  onBannerChange: (url: string) => void;
}

const uploadImageToSupabase = async (file: File): Promise<string> => {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('La imagen no debe superar los 10MB');
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('categories')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('categories')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error en la subida:', error);
    throw error;
  }
};

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
      const imageUrl = await uploadImageToSupabase(file);
      onBannerChange(imageUrl);
      toast.success('Banner subido exitosamente');
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Error al subir el banner');
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
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Formato: JPG, PNG. Tamaño máximo: 10MB
          </p>
        </div>
      </div>
    </div>
  );
}