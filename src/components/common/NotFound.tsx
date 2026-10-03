'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const COUNTDOWN_START = 10;

export function NotFound() {
  const router = useRouter();
  const [count, setCount] = useState(COUNTDOWN_START);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      router.replace('/');
    }, COUNTDOWN_START * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);

  function goHome(): void {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    router.replace('/');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundImage:
          "url('https://images.unsplash.com/photo-1619864066877-926b1c1d5a1a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80')",
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textAlign: 'center',
        gap: '0.5rem',
      }}
    >
      <h3>PAGE NOT FOUND 404</h3>
      <h4>WRONG WAY!</h4>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3>{count} SECONDS OR CLICK</h3>
        <button
          type="button"
          onClick={goHome}
          style={{
            color: '#fff',
            background: '#000',
            padding: '10px 30px',
            margin: '25px',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          HOME
        </button>
      </div>
    </main>
  );
}
