import React from 'react';

export default function HomePage() {
  return (
    <div>
      <h1>MetalGest API Server</h1>
      <p>API server rodando com Next.js App Router</p>
      <p>
        <a href="/api/health">Health Check</a>
      </p>
    </div>
  );
}