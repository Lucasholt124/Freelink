// CÓDIGO DE TESTE para src/app/api/og/share/route.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'blue',
          width: '100%',
          height: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        Teste OK
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}