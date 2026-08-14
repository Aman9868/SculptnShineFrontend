import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { HealthProvider } from '@/context/HealthContext';
import MaintenanceScreen from '@/components/common/MaintenanceScreen';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { CategoryNav } from '@/components/layout/CategoryNav';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Sculpt & Shine | Premium Supplements, Fitness & Wellness',
  description:
    'Transform your Body, Mind, Life with Sculpt & Shine. Shop 100% authentic Whey Protein, Pre-Workout, Creatine, Skincare, Haircare, and Wellness products.',
  keywords: [
    'Sculpt and Shine',
    'Whey Protein',
    'Pre Workout',
    'Creatine Monohydrate',
    'Supplements India',
    'Skincare',
    'Wellness',
  ],
  authors: [{ name: 'Sculpt & Shine Team' }],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Sculpt & Shine',
  description: 'Premium Supplements, Fitness & Wellness Store',
  url: 'https://sculptnshine.com',
  telephone: '+91-800-SCULPT',
  priceRange: '₹799 - ₹3499',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col justify-between selection:bg-gold-500/20 selection:text-gold-800">
        <HealthProvider>
          <MaintenanceScreen />
          <AuthProvider>
            <NotificationProvider>
              <StoreProvider>
                <div>
                  <AnnouncementBar />
                  <Header />
                  <CategoryNav />
                  <MobileMenu />
                  <CartDrawer />
                  <ToastContainer />
                  <main>{children}</main>
                </div>
                <Footer />
              </StoreProvider>
            </NotificationProvider>
          </AuthProvider>
        </HealthProvider>
      </body>
    </html>
  );
}
