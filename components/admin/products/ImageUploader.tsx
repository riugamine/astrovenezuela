'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { ProductDetailImage } from '@/lib/types/database.types';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { toast } from 'sonner';

interface ImageUploaderProps {
  mainImage: string;
  detailImages: ProductDetailImage[];
  onMainImageChange: (url: string) => void;
  onDetailImagesChange: (images: ProductDetailImage[]) => void;
}

/**
 * Sube una imagen a Supabase Storage y retorna su URL pública
 * @param file - Archivo a subir
 * @param path - Ruta en el bucket donde se guardará
 * @returns URL pública de la imagen
 */
const uploadImageToSupabase = async (file: File, path: string): Promise<string> => {
  // Validar tamaño del archivo (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no debe superar los 5MB');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from('products')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(data.path);

  return publicUrl;
};

/**
 * Elimina una imagen de Supabase Storage
 * @param url - URL pública de la imagen
 */
const deleteImageFromSupabase = async (url: string) => {
  const path = url.split('/').pop();
  if (!path) return;

  const { error } = await supabaseAdmin.storage
    .from('products')
    .remove([path]);

  if (error) throw error;
};

export function ImageUploader({
  mainImage,
  detailImages,
  onMainImageChange,
  onDetailImagesChange
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const imageUrl = await uploadImageToSupabase(file, 'main-images');
      onMainImageChange(imageUrl);
      toast.success('Imagen principal subida exitosamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDetailImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    if (detailImages.length >= 10) {
      toast.error('Máximo 10 imágenes de detalle permitidas');
      return;
    }
    
    setUploading(true);
    try {
      const file = e.target.files[0];
      const imageUrl = await uploadImageToSupabase(file, 'detail-images');
      const newImage: ProductDetailImage = {
        id: crypto.randomUUID(),
        image_url: imageUrl,
        order_index: detailImages.length + 1
      };
      onDetailImagesChange([...detailImages, newImage]);
      toast.success('Imagen de detalle subida exitosamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const removeDetailImage = async (index: number) => {
    try {
      const imageToRemove = detailImages[index];
      await deleteImageFromSupabase(imageToRemove.image_url);
      const newImages = detailImages.filter((_, i) => i !== index);
      // Reordenar índices
      const updatedImages = newImages.map((img, idx) => ({
        ...img,
        order_index: idx + 1
      }));
      onDetailImagesChange(updatedImages);
      toast.success('Imagen eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block font-medium">Imagen Principal</label>
        <div className="flex items-center gap-4">
          {mainImage && (
            <div className="relative w-32 h-32">
              <Image
                src={mainImage}
                alt="Main product image"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleMainImageUpload}
            disabled={uploading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">
          Imágenes de Detalle ({detailImages.length}/10)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {detailImages.map((image, index) => (
            <div key={image.id} className="relative">
              <Image
                src={image.image_url}
                alt={`Detail ${index + 1}`}
                width={200}
                height={200}
                className="object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeDetailImage(index)}
                disabled={uploading}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </div>
          ))}
          {detailImages.length < 10 && (
            <div className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center">
              <Input
                type="file"
                accept="image/*"
                onChange={handleDetailImageUpload}
                disabled={uploading}
                className="hidden"
                id="detail-image-upload"
              />
              <label
                htmlFor="detail-image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FontAwesomeIcon 
                  icon={faUpload} 
                  className={`text-2xl mb-2 ${uploading ? 'animate-pulse' : ''}`} 
                />
                <span>{uploading ? 'Subiendo...' : 'Agregar imagen'}</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}