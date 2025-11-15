"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faSpinner, faImage } from "@fortawesome/free-solid-svg-icons";
import { fetchProducts } from "@/lib/api/products";
import { ProductWithRelations, ProductVariant } from "@/lib/data/admin/actions/products/types";
import { SaleItem } from "@/lib/data/admin/actions/sales/types";
import { toast } from "sonner";

interface ProductSelectorProps {
  onAddProduct: (item: SaleItem) => void;
  existingItems?: SaleItem[];
}

/**
 * ProductSelector component for selecting products with variants
 * Provides searchable product list with variant/size selection
 */
export function ProductSelector({ onAddProduct, existingItems = [] }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(
      (product) =>
        product.is_active &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Get available stock for selected product/variant
  const availableStock = useMemo(() => {
    if (!selectedProduct) return 0;
    if (selectedVariant) {
      return selectedVariant.stock;
    }
    return selectedProduct.stock;
  }, [selectedProduct, selectedVariant]);

  // Check if product is already in cart
  const isProductInCart = (productId: string, variantId?: string) => {
    return existingItems.some(
      (item) => item.product_id === productId && item.variant_id === variantId
    );
  };

  const handleProductSelect = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setQuantity(1);
    setShowDropdown(false);
    setSearchTerm(product.name);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Check if already in cart
    if (isProductInCart(selectedProduct.id, selectedVariant?.id)) {
      toast.error("Este producto ya está en el carrito");
      return;
    }

    // Validate stock
    if (quantity > availableStock) {
      toast.error("Cantidad excede el stock disponible");
      return;
    }
    
    if (availableStock === 0) {
      toast.error("No hay stock disponible para este producto");
      return;
    }

    // Use variant price if available, otherwise product price
    const price = selectedProduct.price;

    const item: SaleItem = {
      product_id: selectedProduct.id,
      variant_id: selectedVariant?.id,
      quantity,
      price,
    };

    onAddProduct(item);
    
    // Reset form
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    setSearchTerm("");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
    if (value.length === 0) {
      setSelectedProduct(null);
      setSelectedVariant(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative">
          <Input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowDropdown(searchTerm.length > 0)}
            className="pl-10"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Dropdown with filtered products */}
        {showDropdown && filteredProducts.length > 0 && (
          <Card className="absolute z-50 mt-1 w-full max-h-96 overflow-y-auto">
            <div className="p-2 space-y-1">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductSelect(product)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    {product.main_image_url ? (
                      <Image
                        src={product.main_image_url}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="rounded-md object-cover"
                        sizes="(max-width: 48px) 48px"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <FontAwesomeIcon icon={faImage} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      ${product.price} - Stock: {product.stock}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Selected product details */}
      {selectedProduct && (
        <Card className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {(selectedVariant?.image_url || selectedProduct.main_image_url) ? (
                <Image
                  src={selectedVariant?.image_url || selectedProduct.main_image_url || ''}
                  alt={selectedProduct.name}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover"
                  sizes="(max-width: 120px) 120px"
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <FontAwesomeIcon icon={faImage} className="text-gray-400 text-2xl" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{selectedProduct.name}</h4>
              <p className="text-sm text-gray-500 mt-1">Precio: ${selectedProduct.price}</p>
              <p className="text-sm text-gray-500">Stock disponible: {selectedProduct.stock}</p>
            </div>
          </div>

          {/* Variant selection if product has variants */}
          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Talla/Variante</label>
              <div className="grid grid-cols-2 gap-2">
                {selectedProduct.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                      selectedVariant?.id === variant.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {variant.size}
                    <div className="text-xs mt-1">
                      Stock: {variant.stock}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Cantidad</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                type="number"
                min={1}
                max={availableStock}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, Math.min(val, availableStock)));
                }}
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={quantity >= availableStock}
              >
                +
              </Button>
              <span className="text-sm text-gray-500">
                Disponible: {availableStock}
              </span>
            </div>
          </div>

          {/* Add to cart button */}
          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={quantity > availableStock || availableStock === 0}
            className="w-full"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Agregar al Carrito
          </Button>
        </Card>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}

