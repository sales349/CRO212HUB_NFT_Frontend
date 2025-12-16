// 404 Not Found Page

'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div>
        <h1
          className="gradient-text"
          style={{
            fontSize: '120px',
            fontWeight: '700',
            marginBottom: '16px',
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <h2 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '16px' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '18px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            background:
              'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          }}
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
