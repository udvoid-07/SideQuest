'use client'
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en" className="dark">
      <body style={{ background: '#0A0705', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>💥</p>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Something went very wrong</h1>
          <p style={{ color: '#C9B8D8', marginBottom: '1.5rem' }}>An unexpected error crashed the app.</p>
          <button onClick={reset}
            style={{ background: '#f15153', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700 }}>
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
