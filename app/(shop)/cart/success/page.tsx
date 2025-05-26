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
import Image from "next/image";
import { Suspense } from "react";

type OrderWithItems = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items: (Database["public"]["Tables"]["order_items"]["Row"] & {
    product: Database["public"]["Tables"]["products"]["Row"];
    variant: Database["public"]["Tables"]["product_variants"]["Row"];
  })[];
};

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { user } = useAuthStore();

  useEffect(() => {
    if (!orderId) {
      toast.error("ID de orden no proporcionado");
      router.push("/");
    }
  }, [orderId, router]);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!user?.id || !orderId) {
        router.push("/");
        return null;
      }
      const data = await getOrderWithItems(orderId, user.id);
      if (!data) {
        toast.error("Orden no encontrada");
        router.push("/");
        return null;
      }
      return data;
    },
    enabled: !!orderId && !!user?.id,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-6">
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-2xl p-6 space-y-8">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-green-600">
            ¡Gracias por tu compra!
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Un asesor de ventas te contactará por WhatsApp para coordinar la
            entrega de tu pedido.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">
            Detalles del pedido:
          </h2>
          <div className="space-y-4">
            {order.order_items.map(
              (item: OrderWithItems["order_items"][number]) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <Image
                    src={item.product.main_image_url}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-md shadow-sm"
                    width={200}
                    height={200}
                    priority
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Talla: {item.variant.size} | Cantidad: {item.quantity}
                    </p>
                    <p className="font-medium text-green-600 mt-1">
                      ${item.price}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xl font-semibold text-right">
              Total:{" "}
              <span className="text-green-600">${order.total_amount}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button
            asChild
            className="bg-green-600 hover:bg-green-700 text-lg py-6"
            size="lg"
          >
            <Link href={`https://wa.me/584243091410`} target="_blank">
              <FontAwesomeIcon icon={faWhatsapp} className="mr-2 text-xl" />
              Contactar por WhatsApp
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-lg py-6"
          >
            <Link href="/">
              <FontAwesomeIcon
                icon={faShoppingBag}
                className="mr-2 text-xl"
              />
              Seguir comprando
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <OrderContent />
    </Suspense>
  );
}
