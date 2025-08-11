// Em /app/privacy-policy/page.tsx

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="prose prose-lg lg:prose-xl text-gray-700">
          <h1>Política de Privacidade</h1>
          <p><strong>Última atualização: 11 de Agosto de 2025</strong></p>

          <p>Bem-vindo ao Freelinnk. Esta Política de Privacidade descreve como suas informações pessoais são coletadas, usadas e compartilhadas quando você usa nosso serviço.</p>

          <h2>1. Informações que Coletamos</h2>
          <p>Coletamos informações de várias maneiras, incluindo:</p>
          <ul>
            <li><strong>Informações de Cadastro:</strong> Quando você se cadastra, coletamos seu nome e e-mail através do nosso provedor de autenticação, Clerk.</li>
            <li><strong>Informações de Pagamento:</strong> Se você assina um plano pago, nosso processador de pagamentos, Stripe, coleta suas informações de pagamento. Nós não armazenamos os detalhes do seu cartão.</li>
            <li><strong>Conexão com o Instagram:</strong> Se você optar por conectar sua conta do Instagram, solicitaremos permissão para acessar dados do seu perfil, como seu nome de usuário, biografia e comentários em posts que você selecionar, através da API oficial da Meta. Usamos essas informações exclusivamente para fornecer as funcionalidades do Mentor IA e da Ferramenta de Sorteios.</li>
            <li><strong>Dados de Uso:</strong> Coletamos informações sobre como você interage com nosso serviço, como os links que você cria e os cliques que eles recebem.</li>
          </ul>

          <h2>2. Como Usamos Suas Informações</h2>
          <p>Usamos as informações que coletamos para:</p>
          <ul>
            <li>Fornecer, operar e manter nosso serviço;</li>
            <li>Melhorar, personalizar e expandir nosso serviço;</li>
            <li>Processar suas transações e gerenciar suas assinaturas;</li>
            <li>Comunicar com você, seja para suporte ao cliente ou para fornecer atualizações e informações de marketing.</li>
          </ul>

          <h2>3. Compartilhamento de Informações</h2>
          <p>Não compartilhamos suas informações pessoais com terceiros, exceto conforme descrito nesta política ou quando obtivermos seu consentimento. Podemos compartilhar informações com provedores de serviços que nos ajudam a operar nosso negócio (como Clerk, Stripe, Convex, Vercel e OpenAI), que são obrigados contratualmente a proteger suas informações.</p>

          <h2>4. Seus Direitos</h2>
          <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você pode gerenciar os dados da sua conta diretamente no seu painel ou entrando em contato conosco.</p>

          <h2>5. Contato</h2>
          <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco em: <strong>seu-email-de-suporte@freelinnk.com</strong>.</p>
        </div>
      </main>
    </div>
  );
}