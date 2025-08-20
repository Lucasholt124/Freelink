import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Pega os dados da URL com fallbacks
    const username = searchParams.get('username') || 'Usuário';
    const streak = searchParams.get('streak') || '0';
    const completed = searchParams.get('completed') || '0';
    const total = searchParams.get('total') || '0';
    const percent = total !== '0' ? Math.round((parseInt(completed) / parseInt(total)) * 100) : 0;

    // 2. Carrega as fontes
    const interRegular = fetch(new URL('../../../../assets/Inter-Regular.ttf', import.meta.url)).then((res) => res.arrayBuffer());
    const interBold = fetch(new URL('../../../../assets/Inter-Bold.ttf', import.meta.url)).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        // 3. O JSX que define o visual da imagem
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            fontFamily: '"Inter"',
            backgroundImage: 'linear-gradient(to bottom right, #f0f9ff 25%, #f3e8ff 75%)',
          }}
        >
          <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '40px 50px',
                width: '90%',
                height: '90%',
                borderRadius: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Cabeçalho */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src={`https://avatar.vercel.sh/${username}.png`}
                    width="80"
                    height="80"
                    style={{ borderRadius: '9999px', border: '4px solid #fff' }}
                />
                <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 24, color: '#6b7280' }}>Parabéns,</div>
                    <div style={{ fontSize: 40, fontWeight: 700, color: '#1f2937' }}>@{username}</div>
                </div>
            </div>

            {/* Corpo com Estatísticas */}
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

            {/* APRIMORAMENTO: Barra de Progresso */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
                <div style={{ fontSize: 20, color: '#4b5563', marginBottom: '10px' }}>
                    {percent}% do plano concluído
                </div>
                <div style={{ width: '80%', height: '20px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#3b82f6', backgroundImage: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }} />
                </div>
            </div>

            {/* Rodapé */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 22, color: '#6b7280' }}>
               Gerado com <span style={{ color: '#3b82f6', fontWeight: 700, margin: '0 8px' }}>Mentor.IA</span> da Freelinnk
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Inter', data: await interRegular, style: 'normal', weight: 400 },
          { name: 'Inter', data: await interBold, style: 'normal', weight: 700 },
        ],
      },
    );
  } catch (e: unknown) { // CORREÇÃO: Tipagem do erro para 'unknown'
    if (e instanceof Error) {
        console.log(`${e.message}`);
    } else {
        console.log('Ocorreu um erro desconhecido');
    }
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
