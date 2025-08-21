
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parâmetros da URL
    const username = searchParams.get('username') || 'Usuário';
    const title = searchParams.get('title'); // Parâmetro para o preview genérico
    const streak = searchParams.get('streak'); // Parâmetro que define se é uma conquista

    // Se o parâmetro 'streak' existir, é uma imagem de conquista
    if (streak !== null) {
      const completed = searchParams.get('completed') || '0';
      const total = searchParams.get('total') || '1'; // Evita divisão por zero
      const percent = total !== '0' ? Math.round((parseInt(completed) / parseInt(total)) * 100) : 0;
      const userInitial = username.charAt(0).toUpperCase();

      return new ImageResponse(
        (
          <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif', backgroundImage: 'linear-gradient(to bottom right, #f0f9ff 25%, #f3e8ff 75%)' }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');`}</style>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 50px', width: '90%', height: '90%', borderRadius: '24px', backgroundColor: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '9999px', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700, color: 'white', background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)' }}>
                  {userInitial}
                </div>
                <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 24, color: '#6b7280' }}>Parabéns,</div>
                  <div style={{ fontSize: 40, fontWeight: 700, color: '#1f2937' }}>@{username}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'space-around', marginTop: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: 90, fontWeight: 700, color: '#fb923c' }}>{streak}</div>
                  <div style={{ fontSize: 28, color: '#4b5563' }}>{streak === '1' ? 'Dia de Sequência' : 'Dias de Sequência'} 🔥</div>
                </div>
                <div style={{ width: '1px', height: '120px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: 90, fontWeight: 700, color: '#10b981' }}>{completed}</div>
                  <div style={{ fontSize: 28, color: '#4b5563' }}>Posts Concluídos</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
                <div style={{ fontSize: 20, color: '#4b5563', marginBottom: '10px' }}>{percent}% do plano concluído</div>
                <div style={{ width: '80%', height: '20px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', backgroundImage: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 22, color: '#6b7280' }}>
                Gerado com <span style={{ color: '#3b82f6', fontWeight: 700, margin: '0 8px' }}>Mentor.IA</span> da Freelinnk
              </div>
            </div>
          </div>
        ), { width: 1200, height: 630 }
      );
    } else {
      // LÓGICA PARA IMAGEM DE PREVIEW GENÉRICO (do outro botão)
      return new ImageResponse(
        (
          <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif', backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #5B21B6)', color: 'white' }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;900&display=swap');`}</style>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '50px' }}>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: '20px' }}>MENTOR.IA by Freelinnk</div>
              <div style={{ fontSize: 72, fontWeight: 900, background: 'linear-gradient(to right, #A78BFA, #FDE047)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                {title || `Plano de Conteúdo para @${username}`}
              </div>
            </div>
          </div>
        ), { width: 1200, height: 630 }
      );
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error(`❌ Falha ao gerar imagem: ${message}`);
    return new Response(`Falha ao gerar a imagem`, { status: 500 });
  }
}