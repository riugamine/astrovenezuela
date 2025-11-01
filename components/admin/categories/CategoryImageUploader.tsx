import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryImageUploaderProps {
  bannerUrl: string;
  onBannerChange: (url: string) => void;
  onDelete?: () => Promise<void>;
}

type UploadError = {
  message: string;
  code?: string;
};

export function CategoryImageUploader({
  bannerUrl,
  onBannerChange,
  onDelete
}: CategoryImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /**
   * Handles image file upload with validation
   * Validates file type and size before uploading
   * Uses unified upload endpoint with uploadType='category'
   */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no debe exceder 10MB');
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPEG, PNG, WebP y GIF');
      e.target.value = ''; // Reset input
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', 'category'); // Use unified endpoint
    setUploading(true);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No se recibió URL de la imagen');
      }
      
      onBannerChange(url);
      toast.success('Imagen subida correctamente');
    } catch (error: unknown) {
      const err = error as UploadError;
      toast.error(err.message || 'Error al subir la imagen');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input to allow re-upload of same file
    }
  };

  /**
   * Handles image deletion with confirmation
   */
  const handleDelete = async () => {
    if (!onDelete) return;
    
    setDeleting(true);
    try {
      await onDelete();
      toast.success('Imagen eliminada correctamente');
    } catch (error: unknown) {
      const err = error as UploadError;
      toast.error(err.message || 'Error al eliminar la imagen');
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row items-start gap-4">
          {bannerUrl && (
            <div className="relative w-full md:w-48 h-24 rounded-lg overflow-hidden group">
              <Image
                src={bannerUrl}
                alt="Category banner"
                fill
                className="object-cover"
              />
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  )}
                </Button>
              )}
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
              Formato: JPG, PNG, WebP, GIF. Tamaño máximo: 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la imagen del banner. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}