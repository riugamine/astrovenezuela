'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { OrderList } from "./OrderList";
import { OrderDetails } from "./OrderDetails";

export default function OrdersManagement() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gestión de Órdenes</h1>
          </div>
        </CardContent>
      </Card>

      {selectedOrderId ? (
        <OrderDetails 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
        />
      ) : (
        <OrderList onSelectOrder={setSelectedOrderId} />
      )}
    </div>
  );
}