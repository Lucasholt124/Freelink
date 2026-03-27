"use client";

import { CheckCircle2, ShieldCheck, Mail, Info } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">

        {/* Cabeçalho */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-10 h-10 text-indigo-600" />
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Política de Privacidade</h1>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
            Última atualização: 11 de Março de 2026
          </p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-xl shadow-sm flex gap-3">
            <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-900 leading-relaxed">
              Esta Política de Privacidade está em total conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong>, o Marco Civil da Internet (Lei nº 12.965/2014) e demais normas do Brasil.
            </p>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-indigo-600">

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2">
            1. Introdução e nosso Compromisso
          </h2>
          <p>
            A presente Política tem por finalidade demonstrar o compromisso do <strong>FREELINNK</strong> (nós, nosso ou Plataforma) com a privacidade e proteção dos seus dados pessoais, além de estabelecer as regras sobre como tratamos as informações que coletamos na plataforma disponível em <strong>https://freelinnk.com</strong>.
          </p>
          <p>
            Como condição para acesso e uso das funcionalidades exclusivas da nossa Plataforma, você declara que fez a leitura completa e atenta desta Política, estando plenamente ciente e conferindo sua livre e expressa concordância com os termos aqui estipulados.
          </p>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            2. Definições Rápidas
          </h2>
          <ul className="list-none space-y-3 pl-0">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /><span><strong>Dados Pessoais:</strong> Qualquer informação relacionada a você que te identifique.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /><span><strong>Titular (Você):</strong> A pessoa física a quem se referem os dados pessoais.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /><span><strong>Controlador (Nós):</strong> O Freelinnk, que decide como seus dados são tratados para fazer a plataforma funcionar.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /><span><strong>Anonimização:</strong> Ocultar o dono do dado. (Ex: Sabemos que 10 pessoas clicaram num link, mas não sabemos os nomes delas).</span></li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            3. Dados Pessoais que Coletamos
          </h2>
          <p>Coletamos dados apenas para que o Freelinnk entregue a melhor ferramenta de vendas possível para o seu negócio.</p>

          <h3>3.1. Para Cadastro e Conta</h3>
          <ul className="list-disc pl-6 marker:text-slate-400">
            <li>Nome completo e Endereço de e-mail.</li>
            <li>Foto de perfil (opcional, usada na sua vitrine pública).</li>
            <li>ID único de usuário (gerado pelo nosso sistema seguro de login, o Clerk).</li>
          </ul>

          <h3>3.2. Para Assinaturas e Pagamentos</h3>
          <ul className="list-disc pl-6 marker:text-slate-400">
            <li>Seu faturamento financeiro (Apenas se você usar a nossa ferramenta de CRM/Calculadora de Lucros - esses dados são estritamente privados seus).</li>
            <li>Dados transacionais para assinar os planos Pro/Ultra. <em>Nota: Não guardamos o número completo do seu cartão. O pagamento é processado diretamente pela Stripe, líder mundial em segurança financeira.</em></li>
          </ul>

          <h3>3.3. Analytics, Pixels e Rede de Anúncios (Hub)</h3>
          <p>Esta é a principal inteligência do Freelinnk para fazer você vender mais:</p>
          <ul className="list-disc pl-6 marker:text-slate-400">
            <li><strong>Otimização de Conversão:</strong> Analisamos tendências de mercado e preferências para aprimorar suas vitrines e campanhas.</li>
            <li><strong>Rastreamento (Pixel):</strong> Se você for usuário Pro/Ultra, permitimos que você injete seu Pixel do Meta/Google na sua página. Nesse caso, a responsabilidade pelo consentimento do usuário final que clica no <em>seu</em> link passa a ser sua (você é o Controlador perante seus clientes).</li>
            <li><strong>Hub de Anúncios:</strong> O Freelinnk possui uma rede de anúncios nativa. A Inteligência Artificial analisa a descrição (Bio) que você escreveu no seu perfil público para categorizar o seu nicho. Isso garante que anúncios de concorrentes não apareçam na sua página, e que o seu anúncio seja mostrado em páginas de interesse comum.</li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            4. Bases Legais (Por que usamos seus dados?)
          </h2>
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="border border-slate-200 px-4 py-3 text-left">O que fazemos</th>
                  <th className="border border-slate-200 px-4 py-3 text-left">Base Legal (LGPD)</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr>
                  <td className="border border-slate-200 px-4 py-2">Criar sua vitrine de links</td>
                  <td className="border border-slate-200 px-4 py-2">Execução de contrato (Art. 7º, V)</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-2">Fazer o sorteio da Roleta de Anúncios</td>
                  <td className="border border-slate-200 px-4 py-2">Execução de contrato (Art. 7º, V)</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-2">Analisar seu nicho via IA</td>
                  <td className="border border-slate-200 px-4 py-2">Legítimo Interesse (Art. 7º, IX)</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-2">Processar assinaturas</td>
                  <td className="border border-slate-200 px-4 py-2">Execução de contrato (Art. 7º, V)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            5. Infraestrutura e Compartilhamento de Dados
          </h2>
          <p><strong>Nós nunca vendemos seus dados pessoais.</strong> A operação do Freelinnk é sustentada por uma infraestrutura de ponta, compartilhando dados apenas com sistemas robustos que fazem a plataforma funcionar com segurança e velocidade:</p>
          <ul className="list-disc pl-6 marker:text-slate-400">
            <li><strong>HostGator:</strong> Provedor de hospedagem oficial onde o nosso sistema está alocado.</li>
            <li><strong>Cloudflare:</strong> Plataforma responsável pelo gerenciamento do nosso DNS, oferecendo firewall e segurança contra ataques (DDoS) para garantir estabilidade.</li>
            <li><strong>Vercel:</strong> Plataforma que gerencia o deploy do nosso projeto e as atualizações contínuas de interface (Frontend).</li>
            <li><strong>GitHub:</strong> Utilizado para o versionamento seguro e controle de qualidade do nosso código-fonte.</li>
            <li><strong>Convex:</strong> Nosso banco de dados de ultra-velocidade para armazenamento das informações dos links e processamento em tempo real.</li>
            <li><strong>Clerk:</strong> Nosso sistema de proteção de senhas, autenticação e logins.</li>
            <li><strong>Stripe:</strong> Nosso banco processador de pagamentos e cartões.</li>
            <li><strong>Provedores de IA:</strong> Usamos IA para ler a bio da sua vitrine e gerar insights de negócios, tudo de forma automatizada sem intervenção humana no seu conteúdo pessoal.</li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            6. Seus Direitos (Você no Controle)
          </h2>
          <p>A qualquer momento, pelo nosso painel ou via suporte, você tem o direito de:</p>
          <ul className="list-disc pl-6 marker:text-slate-400">
            <li>Saber quais dados temos sobre você.</li>
            <li>Corrigir dados errados.</li>
            <li>Excluir sua conta e apagar definitivamente seus links, anúncios e métricas do nosso banco de dados.</li>
            <li>Exportar suas informações financeiras (se usar o nosso CRM).</li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            7. Tempo de Guarda dos Dados
          </h2>
          <p>
            Manteremos as suas informações enquanto sua conta estiver ativa. Se você decidir excluir sua conta, nós apagaremos suas métricas e vitrines imediatamente. Guardaremos apenas logs técnicos por 6 meses (como exige o Marco Civil da Internet) e recibos de pagamento por 5 anos (como exige a Receita Federal).
          </p>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            8. Segurança
          </h2>
          <p>
            Suas senhas não ficam com a gente, seus dados de cartão não passam pelos nossos servidores e suas senhas financeiras são criptografadas. Usamos proteção de alto nível (SSL/TLS) para garantir que ninguém intercepte o seu tráfego.
          </p>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            9. Foro Competente e Legislação Aplicável
          </h2>
          <p>
            Esta Política de Privacidade é regida pelas leis da República Federativa do Brasil. Priorizamos a resolução amigável de qualquer questão. Em caso de dúvidas ou divergências, entre em contato conosco.
          </p>
          <ul className="list-disc pl-6 marker:text-slate-400">
            <li>
              <strong>Para usuários consumidores:</strong> Você tem o direito de escolher ajuizar eventual ação no seu próprio domicílio, conforme o Código de Defesa do Consumidor.
            </li>
            <li>
              <strong>Para usuários PJ ou lojistas profissionais:</strong> Fica eleito o foro da comarca de <strong>Ribeirópolis, Sergipe (SE)</strong>, para dirimir quaisquer controvérsias, abrindo mão de qualquer outro, por mais privilegiado que seja.
            </li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            10. Fale Conosco
          </h2>
          <div className="bg-slate-100 p-6 rounded-xl mt-6 border border-slate-200">
            <p className="mb-4">Se você achar que a sua privacidade foi desrespeitada ou quiser falar com o nosso Encarregado de Dados (DPO), chame a gente:</p>
            <div className="flex flex-col gap-2 font-medium text-slate-800">
              <a href="mailto:lucasholt2021@gmail.com" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <Mail className="w-5 h-5 text-indigo-500" />
                lucasholt2021@gmail.com
              </a>
            </div>
            <p className="text-sm text-slate-500 mt-6">
              Você também tem o direito legal de reclamar na Autoridade Nacional de Proteção de Dados (ANPD) acessando gov.br/anpd.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}