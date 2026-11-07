import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GuestOnly } from '@/components/auth/GuestOnly';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ display: 'flex', justifyContent: 'center', padding: '2rem', flex: 1 }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <GuestOnly>{children}</GuestOnly>
        </div>
      </main>
      <Footer />
    </>
  );
}
