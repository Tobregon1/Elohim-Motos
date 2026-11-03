import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import CreditPopupModal from '@/components/CreditPopupModal';
import CuotasDrawer from '@/components/CuotasDrawer';

export const metadata: Metadata = {
  title: 'Elohim Motos | Agencia de Motos 0km y Usadas • Financiación Solo con DNI',
  description:
    'Llevate tu moto 0km o usada seleccionada en Elohim Motos solo con tu DNI en 12, 18 y 24 cuotas. Tomamos tu moto usada en parte de pago. Honda, Yamaha, Motomel, Gilera, Corven, Bajaj.',
  keywords: [
    'Elohim Motos',
    'agencia de motos',
    'motos financiadas con DNI',
    'motos 0km Corrientes',
    'permuta de motos usadas',
    'Honda Wave 110',
    'Motomel Blitz 110',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-neutral-50 text-neutral-950"
      >
        <StoreProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppWidget />
          <CreditPopupModal />
          <CuotasDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}

