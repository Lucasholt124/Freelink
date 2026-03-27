"use client";

import { FileText, ShieldAlert, Mail } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">

        {/* Cabeçalho */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-indigo-600" />
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Termos de Serviço</h1>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
            Última atualização: 11 de Março de 2026
          </p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-xl shadow-sm flex gap-3">
            <ShieldAlert className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-900 leading-relaxed">
              Por favor, leia estes Termos de Serviço cuidadosamente antes de usar o Freelinnk.
              Ao acessar ou criar uma conta na nossa plataforma, você concorda juridicamente em ficar vinculado às regras abaixo.
            </p>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-indigo-600">

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2">
            1. Definições e Aceitação
          </h2>

          <h3>1.1. Quem é quem?</h3>
          <ul className="list-disc pl-6 marker:text-slate-400">
            <li><strong>Plataforma/Serviço:</strong> O ecossistema Freelinnk (site, web app e rede de tráfego) disponível em https://freelinnk.com.</li>
            <li><strong>Nós, Nosso:</strong> Refere-se à empresa responsável pelo Freelinnk e seus desenvolvedores.</li>
            <li><strong>Você, Lojista, Usuário:</strong> Pessoa física ou jurídica que utiliza a Plataforma para vender, captar leads ou gerar tráfego.</li>
            <li><strong>Conteúdo/Ads:</strong> Produtos, textos, imagens, links e anúncios que você cadastra ou impulsiona usando nossa plataforma.</li>
          </ul>

          <h3>1.2. A Regra do Jogo</h3>
          <p>
            Ao criar uma conta, você atesta que tem mais de 18 anos, capacidade legal para responder pelos seus atos ou empresa, e que inseriu informações verdadeiras no cadastro. Se não concordar com estas regras, o uso da plataforma deve ser interrompido imediatamente.
          </p>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            2. Nossos Serviços e Planos
          </h2>

          <h3>2.1. O que nós entregamos</h3>
          <p>O Freelinnk é uma infraestrutura de tráfego e vendas que oferece:</p>
          <ul className="list-disc pl-6 marker:text-slate-400">
            <li><strong>Vitrine Digital (Bio Link):</strong> Criação de página responsiva com seus produtos e redes.</li>
            <li><strong>Hub de Anúncios (Ads Network):</strong> Sistema colaborativo de impulsionamento de produtos nas páginas da rede.</li>
            <li><strong>Gestão (CRM e Finanças):</strong> Ferramentas financeiras, cálculo de lucro e otimização de conversões.</li>
            <li><strong>Ferramentas de Tração:</strong> Sorteador inteligente e Encurtador de links.</li>
          </ul>

          <h3>2.2. Modalidades de Planos</h3>
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="border border-slate-200 px-4 py-3 text-left">Plano</th>
                  <th className="border border-slate-200 px-4 py-3 text-left">Foco do Serviço</th>
                  <th className="border border-slate-200 px-4 py-3 text-left">Limitações</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr>
                  <td className="border border-slate-200 px-4 py-2 font-bold">Free</td>
                  <td className="border border-slate-200 px-4 py-2">Hospedagem de Vitrine Base</td>
                  <td className="border border-slate-200 px-4 py-2">Exibe Logo. Sem CRM, Pixel ou Anúncios (AdsHub).</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-2 font-bold text-blue-600">Pro</td>
                  <td className="border border-slate-200 px-4 py-2">Tração Inicial e Rastreamento</td>
                  <td className="border border-slate-200 px-4 py-2">Máximo de 2 Campanhas de Ads (Até 1.000 views cada).</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-2 font-bold text-purple-600">Ultra</td>
                  <td className="border border-slate-200 px-4 py-2">Agência e Gestão Total (Máquina de Vendas)</td>
                  <td className="border border-slate-200 px-4 py-2">Máximo de 3 Campanhas de Ads (Até 5.000 views cada). 30 Vitrines.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            3. O Que Você Não Pode Fazer (Uso Inaceitável)
          </h2>
          <p>Para garantir que o Freelinnk e nosso Hub de Anúncios continuem seguros para todos, você é estritamente proibido de:</p>
          <ul className="list-disc pl-6 marker:text-slate-400">
            <li>Anunciar ou vender produtos ilegais, fraudulentos, pirataria, armas ou entorpecentes.</li>
            <li>Injetar vírus, malwares, scripts de mineração ou realizar tentativas de engenharia reversa na nossa infraestrutura (Vercel/Convex).</li>
            <li>Fazer SPAM agressivo ou abusar do sistema de criação de Links para derrubar a rede.</li>
            <li>Publicar imagens ou conteúdos ofensivos, de ódio, racismo ou nudez explícita na sua vitrine ou campanhas de Ads.</li>
          </ul>
          <p className="text-red-600 font-medium">O descumprimento destas regras resultará no banimento imediato e exclusão da conta, sem direito a reembolso de qualquer plano contratado.</p>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            4. Responsabilidade Sobre o Conteúdo e Anúncios
          </h2>
          <h3>4.1. Seu Anúncio, Sua Responsabilidade</h3>
          <p>
            O Freelinnk apenas fornece a tecnologia de redirecionamento e exibição visual (Hub de Anúncios). <strong>Nós não somos donos, avalistas ou responsáveis pela entrega dos produtos que você anuncia ou vende através do seu link.</strong> Qualquer problema de suporte ao consumidor final do seu produto deve ser resolvido por você, o lojista. Você nos isenta totalmente de qualquer processo civil movido por seus clientes.
          </p>

          <h3>4.2. Licença de Exibição</h3>
          <p>
            Você é dono de todas as imagens e textos que sobe na plataforma. Ao fazer o upload (ex: criar uma campanha de anúncio), você apenas nos concede a permissão técnica de exibir essa imagem nas vitrines da nossa rede para gerar o tráfego que você contratou.
          </p>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            5. Pagamentos, Reembolsos e Cancelamentos
          </h2>
          <ul className="list-disc pl-6 marker:text-slate-400">
            <li><strong>Processamento:</strong> Usamos a Stripe. As assinaturas (Pro e Ultra) são cobradas antecipadamente com renovação automática (mensal ou anual).</li>
            <li><strong>Cancelamento Simples:</strong> Você pode cancelar pelo próprio painel a qualquer momento. Seu plano continuará ativo até o fim do ciclo que já foi pago. Não devolvemos valores fracionados de meses ou anos já iniciados.</li>
            <li><strong>Garantia de 7 Dias:</strong> Assinantes novos têm 7 dias corridos para solicitar estorno total do valor pago caso a ferramenta não atenda às expectativas comerciais, sem burocracia.</li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            6. Estabilidade, Limites e Isenção de Danos
          </h2>
          <p>
            Trabalhamos com os melhores servidores do mundo (HostGator, Cloudflare, Vercel). Contudo, o sistema é fornecido no estado em que se encontra.
            Não garantimos 100% de uptime sem falhas (nenhum sistema garante).
          </p>
          <p>
            Em nenhuma hipótese o Freelinnk será responsabilizado por perdas de lucro (lucros cessantes), falhas de rastreamento de Pixel do Facebook por mudanças nas políticas de privacidade globais, ou instabilidades temporárias no roteamento de cliques. Nosso limite máximo de indenização, em qualquer cenário, será restrito ao valor que você nos pagou de assinatura nos últimos 12 meses.
          </p>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            7. Integrações de Terceiros
          </h2>
          <p>
            Quando você conecta seu Pixel, insere Links do Instagram ou WhatsApp, você está sujeito às políticas dessas respectivas empresas (Meta Platforms, Google, etc.). Não temos controle sobre bloqueios aplicados por essas empresas na sua conta de anúncios ou link externo.
          </p>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            8. Alterações Contratuais
          </h2>
          <p>
            O SaaS está em constante evolução. Podemos alterar estes termos ou os preços das assinaturas com aviso prévio mínimo de 30 dias na plataforma. A alteração de preço nunca afetará o ciclo (mês/ano) que você já tem pago e vigente. Se você não concordar com as novas regras, pode cancelar sua conta livremente.
          </p>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            9. Foro e Legislação Aplicável
          </h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. As partes tentaram sempre resolver conflitos de forma amigável através do suporte.
          </p>
          <p>
            Esgotadas as negociações, fica eleito o foro da comarca de <strong>Ribeirópolis, Estado de Sergipe (SE)</strong>, para dirimir quaisquer controvérsias judiciais que surjam a respeito da nossa prestação de serviços a lojistas e PJ s, renunciando a qualquer outro por mais privilegiado que seja. (No caso de usuário final considerado consumidor não-profissional, aplica-se o artigo 101, I, do CDC).
          </p>

          <h2 className="flex items-center gap-2 text-2xl border-b border-slate-200 pb-2 mt-12">
            10. Canal de Atendimento
          </h2>
          <div className="bg-slate-100 p-6 rounded-xl mt-6 border border-slate-200">
            <p className="mb-4">Tem alguma dúvida jurídica ou quer relatar um abuso na nossa rede? Nossa equipe está pronta para responder:</p>
            <div className="flex flex-col gap-2 font-medium text-slate-800">
              <a href="mailto:lucasholt2021@gmail.com" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <Mail className="w-5 h-5 text-indigo-500" />
                lucasholt2021@gmail.com
              </a>
            </div>
          </div>

          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mt-8 rounded-r-lg">
            <p className="text-sm text-emerald-900 m-0">
              <strong>Obrigado por confiar no Freelinnk!</strong> Construímos essa plataforma para que o seu foco seja 100% no seu crescimento e nas suas vendas, enquanto nós cuidamos da engenharia pesada por trás dos bastidores. Sucesso nos negócios!
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}