import type { Metadata } from "next";
import { Exo, Gabarito } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "../providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { CookieConsent } from '@/components/CookieConsent';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ExchangeRateProvider } from '@/components/providers/ExchangeRateProvider';

// Configuración de la fuente Exo para títulos y texto destacado
const exo = Exo({
  variable: "--font-exo",
  subsets: ["latin"],
  display: "swap",
});

// Configuración de la fuente Gabarito para texto general
const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
  display: "swap",
});

// Metadata de la aplicación
export const metadata: Metadata = {
  title: "Astro Venezuela | Tienda de Ropa Deportiva",
  description:
    "Descubre la mejor selección de ropa deportiva en Venezuela. Especialistas en equipamiento para CrossFit, gimnasio y entrenamiento funcional.",
  keywords:
    "ropa deportiva, crossfit, gimnasio, entrenamiento funcional, venezuela, ropa fitness, equipamiento deportivo",
  authors: [{ name: "Jose Angel", url: "https://instagram.com/joseangelweb_" }],
  creator: "Jose Angel",
  metadataBase: new URL("https://astrovenezuela.com"),
  openGraph: {
    title: "Astro Venezuela | Tienda de Ropa Deportiva",
    description: "Descubre la mejor selección de ropa deportiva en Venezuela",
    url: "https://astrovenezuela.com",
    siteName: "Astro Venezuela",
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Astro Venezuela | Tienda de Ropa Deportiva",
    description: "Descubre la mejor selección de ropa deportiva en Venezuela",
    creator: "@joseangelweb_",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${exo.variable} ${gabarito.variable} antialiased`}>
        <QueryProvider>
          <Providers>
            <AuthProvider>
              <ExchangeRateProvider>
                {children}
              </ExchangeRateProvider>
            </AuthProvider>
          </Providers>
        </QueryProvider>
        <Toaster position="bottom-right" />
        <CookieConsent />
      </body>
    </html>
  );
}
