import { Metadata } from "next"
import ShopLayoutComponent from "@/components/layout/shop/ShopLayout"

export const metadata: Metadata = {
  title: 'Astro Venezuela - Shop',
  description: 'Discover our collection of astronomy and space-related products',
  keywords: ['astronomy', 'telescopes', 'space', 'shop', 'venezuela'],
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ShopLayoutComponent>
      {children}
    </ShopLayoutComponent>
  )
}
