import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';

interface ShopLayoutProps {
  children: React.ReactNode;
}

// Layout principal para la tienda
const ShopLayout = ({ children }: ShopLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
};

export default ShopLayout;