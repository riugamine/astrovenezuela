"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import { Database } from "@/lib/types/database.types";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { getOrderWithItems } from "@/lib/data/orders";
import { toast } from "sonner";

type OrderWithItems = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items: (Database["public"]["Tables"]["order_items"]["Row"] & {
    product: Database["public"]["Tables"]["products"]["Row"];
    variant: Database["public"]["Tables"]["product_variants"]["Row"];
  })[];
};
export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  console.log(orderId);
  const { user } = useAuthStore();
  // Redirect if no order ID or user
  useEffect(() => {
    if (!orderId) {
      toast.error("ID de orden no proporcionado");
      router.push("/");
    }
  }, [orderId, router]);

  // Fetch order data
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!user?.id || !orderId) {
        router.push('/');
        return null;
      }
      const data = await getOrderWithItems(orderId, user.id);
      if (!data) {
        toast.error('Orden no encontrada');
        router.push('/');
        return null;
      }
      return data;
    },
    enabled: !!orderId && !!user?.id,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </Card>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Card className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-green-600">
            ¡Gracias por tu compra!
          </h1>
          <p className="text-muted-foreground">
            Un asesor de ventas te contactará por WhatsApp para coordinar la
            entrega de tu pedido.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Detalles del pedido:</h2>
          <div className="space-y-4">
            {order.order_items.map((item: OrderWithItems["order_items"][number]) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-4"
              >
                <img
                  src={item.product.main_image_url}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Talla: {item.variant.size} | Cantidad: {item.quantity}
                  </p>
                  <p className="font-medium">${item.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <p className="font-semibold">Total: ${order.total_amount}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href={`https://wa.me/584243091410`} target="_blank">
              <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
              Contactar por WhatsApp
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/">
              <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
              Seguir comprando
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
