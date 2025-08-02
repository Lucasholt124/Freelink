// Em app/icon.tsx

import { ImageResponse } from 'next/og'

// Esta configuração informa ao Next.js que esta é uma rota de imagem rápida.
export const runtime = 'edge'

// Definimos o tamanho padrão do favicon.
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Esta função é o "desenhista" do nosso ícone.
export default function Icon() {
  return new ImageResponse(
    (
      // Usamos JSX e estilos (como CSS) para descrever a aparência do ícone.
      <div
        style={{
          fontSize: 22, // Tamanho da letra "F"
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', // Gradiente azul para roxo da sua marca
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '6px', // Bordas um pouco arredondadas
          fontWeight: '900', // Fonte bem forte (extrabold)
          fontFamily: '"Geist Sans", sans-serif', // Usa a mesma fonte do seu site
        }}
      >
        F
      </div>
    ),
    // Passamos as opções de tamanho para a resposta da imagem.
    {
      ...size,
    }
  )
}