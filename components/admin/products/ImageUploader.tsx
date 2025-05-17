"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { ProductDetailImage } from "@/lib/data/admin/actions/products/types";
import { toast } from "sonner";
import { deleteProductImage } from "@/lib/data/admin/actions/products";

interface ImageUploaderProps {
  mainImage: string;
  detailImages: ProductDetailImage[];
  onMainImageChange: (url: string) => void;
  onDetailImagesChange: (images: ProductDetailImage[]) => void;
}

export function ImageUploader({
  mainImage,
  detailImages,
  onMainImageChange,
  onDetailImagesChange,
}: ImageUploaderProps) {
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (formData: FormData): Promise<string> => {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error(
          "La imagen excede el límite de tamaño permitido (10MB)"
        );
      }
      throw new Error(data.error || "Error al subir la imagen");
    }

    return data.url;
  };

  const handleUploadMainImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploadingMainImage(true);

    try {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("La imagen excede el límite de 10MB");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", "main-images");

      const imageUrl = await uploadImage(formData);
      onMainImageChange(imageUrl);
      toast.success("Imagen subida exitosamente");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Error al subir la imagen");
    } finally {
      setUploadingMainImage(false);
    }
  };

  const handleMultipleFiles = async (files: FileList) => {
    if (detailImages.length + files.length > 10) {
      toast.error("No se pueden subir más de 10 imágenes en total");
      return;
    }

    setUploading(true);
    const totalFiles = files.length;
    let uploadedCount = 0;
    const newImages: ProductDetailImage[] = [];
    let hasErrors = false;

    try {
      for (const file of Array.from(files)) {
        try {
          if (file.size > 10 * 1024 * 1024) {
            toast.error(`La imagen ${file.name} excede el límite de 10MB`);
            hasErrors = true;
            continue;
          }

          const formData = new FormData();
          formData.append("file", file);
          formData.append("path", "detail-images");

          const imageUrl = await uploadImage(formData);
          uploadedCount++;
          setUploadProgress((uploadedCount / totalFiles) * 100);

          newImages.push({
            id: crypto.randomUUID(),
            image_url: imageUrl,
            order_index: detailImages.length + uploadedCount,
            product_id: "",
          });
        } catch (error: any) {
          console.error("Error uploading image:", error);
          toast.error(error.message || `Error al subir la imagen ${file.name}`);
          hasErrors = true;
        }
      }

      if (newImages.length > 0) {
        onDetailImagesChange([...detailImages, ...newImages]);
        if (hasErrors) {
          toast.success(
            `${newImages.length} imágenes subidas exitosamente. Algunas imágenes no se pudieron subir.`
          );
        } else {
          toast.success(`${newImages.length} imágenes subidas exitosamente`);
        }
      } else if (hasErrors) {
        toast.error("No se pudo subir ninguna imagen");
      }
    } catch (error) {
      console.error("Error in bulk upload:", error);
      toast.error("Error al subir las imágenes");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDetailImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;
    await handleMultipleFiles(e.target.files);
  };

  const removeDetailImage = async (index: number) => {
    try {
      const imageToRemove = detailImages[index];
      await deleteProductImage(imageToRemove.image_url);
      const newImages = detailImages.filter((_, i) => i !== index);
      const updatedImages = newImages.map((img, idx) => ({
        ...img,
        order_index: idx + 1,
      }));
      onDetailImagesChange(updatedImages);
      toast.success("Imagen eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error al eliminar la imagen");
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
              onChange={handleUploadMainImage}
              disabled={uploadingMainImage}
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
          las imagenes de detalle no pueden superar los 3 mb de tamaño, si supera el tamaño se eliminara la imagen
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
                onClick={(e) => {
                  e.preventDefault();
                  removeDetailImage(index);
                }}
                disabled={uploading}
              >
                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {detailImages.length < 10 && (
            <div
              className={`border-2 border-dashed rounded-lg aspect-square flex items-center justify-center transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOver(false);
                await handleMultipleFiles(e.dataTransfer.files);
              }}
            >
              <Input
                type="file"
                accept="image/*"
                onChange={handleDetailImageUpload}
                disabled={uploading}
                className="hidden"
                id="detail-image-upload"
                multiple
              />
              <label
                htmlFor="detail-image-upload"
                className="cursor-pointer flex flex-col items-center p-4 text-center"
              >
                <FontAwesomeIcon
                  icon={faUpload}
                  className={`text-2xl mb-2 ${
                    uploading ? "animate-pulse" : ""
                  }`}
                />
                <span className="text-sm">
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <span>Subiendo... {Math.round(uploadProgress)}%</span>
                      <div className="w-32 h-1 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    "Arrastra o haz clic para agregar múltiples imágenes"
                  )}
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
