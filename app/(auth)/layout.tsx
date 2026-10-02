export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>{children}</div>
    </main>
  );
}
