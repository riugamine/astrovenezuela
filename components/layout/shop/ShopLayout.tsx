import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { WhatsAppGeneralButton } from '@/components/shop/WhatsAppGeneralButton';

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
      <WhatsAppGeneralButton />
    </div>
  );
};

export default ShopLayout;