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
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error('Error al comprimir la imagen'));
            }
          },
          'image/jpeg',
          0.7
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

const uploadImageToSupabase = async (file: File, path: string): Promise<string> => {
  // Aumentar límite a 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('La imagen no debe superar los 10MB');
  }

  try {
    // Comprimir imagen antes de subir
    const compressedFile = await compressImage(file);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error en la compresión/subida:', error);
    throw error;
  }
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
  const [dragOver, setDragOver] = useState(false);

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
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block font-medium">Imagen Principal</label>
        <div className="flex flex-col md:flex-row items-start gap-4">
          {mainImage && (
            <div className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden">
              <Image
                src={mainImage}
                alt="Main product image"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 w-full">
            <Input
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              disabled={uploading}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Formato: JPG, PNG. Tamaño máximo: 10MB
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">
          Imágenes de Detalle ({detailImages.length}/10)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {detailImages.map((image, index) => (
            <div key={image.id} className="relative aspect-square">
              <Image
                src={image.image_url}
                alt={`Detail ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                onClick={() => removeDetailImage(index)}
                disabled={uploading}
              >
                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {detailImages.length < 10 && (
            <div 
              className={`border-2 border-dashed rounded-lg aspect-square flex items-center justify-center transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) {
                  const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleDetailImageUpload(event);
                }
              }}
            >
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
                className="cursor-pointer flex flex-col items-center p-4 text-center"
              >
                <FontAwesomeIcon 
                  icon={faUpload} 
                  className={`text-2xl mb-2 ${uploading ? 'animate-pulse' : ''}`} 
                />
                <span className="text-sm">
                  {uploading ? 'Subiendo...' : 'Arrastra o haz clic para agregar'}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Máximo 10MB por imagen
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}