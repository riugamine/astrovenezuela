"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faArrowLeft, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { SalesList } from "./SalesList";
import { SaleForm } from "./SaleForm";
import { OrderDetails } from "../orders/OrderDetails";

type ViewMode = "list" | "create" | "details";

/**
 * SalesManagement container component
 * Manages the view state between list, create form, and order details
 */
export default function SalesManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const handleCreateSuccess = () => {
    setViewMode("list");
  };

  const handleCancel = () => {
    setViewMode("list");
  };

  const handleSelectSale = (saleId: string) => {
    setSelectedSaleId(saleId);
    setViewMode("details");
  };

  const handleCloseDetails = () => {
    setSelectedSaleId(null);
    setViewMode("list");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {viewMode !== "list" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (viewMode === "create") {
                      handleCancel();
                    } else {
                      handleCloseDetails();
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Volver
                </Button>
              )}
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faShoppingCart} className="h-6 w-6" />
                <h1 className="text-2xl font-bold">
                  {viewMode === "create" ? "Crear Nueva Venta" : "Gestión de Ventas"}
                </h1>
              </div>
            </div>
            {viewMode === "list" && (
              <Button onClick={() => setViewMode("create")}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Crear Nueva Venta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {viewMode === "list" && (
        <SalesList onSelectSale={handleSelectSale} />
      )}

      {viewMode === "create" && (
        <SaleForm onSuccess={handleCreateSuccess} onCancel={handleCancel} />
      )}

      {viewMode === "details" && selectedSaleId && (
        <OrderDetails 
          orderId={selectedSaleId} 
          onClose={handleCloseDetails} 
        />
      )}
    </div>
  );
}

