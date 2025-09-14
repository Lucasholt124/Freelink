// Em /app/privacy-policy/page.tsx

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="prose prose-lg lg:prose-xl text-gray-700 max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">POLÍTICA DE PRIVACIDADE</h1>
          <p className="text-sm text-gray-600 mb-8"><strong>Última atualização: 03 de Setembro de 2025</strong></p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <p className="text-sm">
              Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados Pessoais
              (Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014) e demais normas aplicáveis.
            </p>
          </div>

          <h2>1. INTRODUÇÃO E COMPROMISSO COM A PRIVACIDADE</h2>
          <p>
            A presente Política tem por finalidade demonstrar o compromisso do <strong>FREELINNK</strong>
            (nós, nosso ou Plataforma) com a privacidade e proteção dos seus dados pessoais,
            além de estabelecer as regras sobre o tratamento dos seus dados pessoais, dentro do escopo
            dos serviços e funcionalidades da plataforma disponível em <strong>https://freelinnk.com</strong>,
            de acordo com as leis em vigor, com transparência e clareza.
          </p>
          <p>
            Como condição para acesso e uso das funcionalidades exclusivas da nossa Plataforma, você
            declara que fez a leitura completa e atenta desta Política, estando plenamente ciente,
            conferindo assim sua livre e expressa concordância com os termos aqui estipulados.
          </p>

          <h2>2. DEFINIÇÕES IMPORTANTES</h2>
          <p>Para melhor compreensão desta Política, considere as seguintes definições:</p>
          <ul className="list-disc pl-6">
            <li><strong>Dados Pessoais:</strong> Informações relacionadas a pessoa natural identificada ou identificável</li>
            <li><strong>Dados Pessoais Sensíveis:</strong> Dados pessoais sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou organização religiosa, filosófica ou política, dados referentes à saúde ou vida sexual, dados genéticos ou biométricos</li>
            <li><strong>Titular:</strong> Pessoa natural a quem se referem os dados pessoais (você)</li>
            <li><strong>Controlador:</strong> Pessoa jurídica a quem competem as decisões sobre o tratamento de dados pessoais (Freelinnk)</li>
            <li><strong>Operador:</strong> Pessoa jurídica que realiza o tratamento de dados em nome do controlador</li>
            <li><strong>Tratamento:</strong> Toda operação realizada com dados pessoais</li>
            <li><strong>Anonimização:</strong> Processo que torna um dado não associável a um indivíduo</li>
            <li><strong>Consentimento:</strong> Manifestação livre, informada e inequívoca do titular concordando com o tratamento</li>
            <li><strong>LGPD:</strong> Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)</li>
            <li><strong>ANPD:</strong> Autoridade Nacional de Proteção de Dados</li>
          </ul>

          <h2>3. DADOS PESSOAIS QUE COLETAMOS</h2>
          <p>Coletamos diferentes tipos de dados pessoais dependendo de como você interage com nossa Plataforma:</p>

          <h3>3.1 Dados de Cadastro e Autenticação</h3>
          <ul className="list-disc pl-6">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Foto de perfil (opcional)</li>
            <li>Dados de autenticação (gerenciados pelo Clerk)</li>
            <li>ID único de usuário</li>
          </ul>

          <h3>3.2 Dados de Pagamento (para assinantes)</h3>
          <ul className="list-disc pl-6">
            <li>Nome do titular do cartão</li>
            <li>Últimos 4 dígitos do cartão (apenas para referência)</li>
            <li>Histórico de transações</li>
            <li>Status da assinatura</li>
            <li>Dados processados diretamente pelo Stripe (PCI Compliant)</li>
          </ul>

          <h3>3.3 Dados do Instagram (mediante autorização)</h3>
          <ul className="list-disc pl-6">
            <li>Nome de usuário do Instagram</li>
            <li>Biografia do perfil</li>
            <li>Foto de perfil pública</li>
            <li>Lista de posts públicos</li>
            <li>Comentários em posts selecionados</li>
            <li>Métricas públicas (seguidores, seguindo)</li>
            <li>Token de acesso da API (criptografado)</li>
          </ul>

          <h3>3.4 Dados de Uso e Interação</h3>
          <ul className="list-disc pl-6">
            <li>Links criados e suas configurações</li>
            <li>Estatísticas de cliques e visualizações</li>
            <li>Interações com o Mentor IA</li>
            <li>Configurações de sorteios realizados</li>
            <li>Preferências de personalização</li>
            <li>Histórico de ações na plataforma</li>
          </ul>

          <h3>3.5 Dados Técnicos e de Navegação</h3>
          <ul className="list-disc pl-6">
            <li>Endereço IP</li>
            <li>Tipo e versão do navegador</li>
            <li>Sistema operacional</li>
            <li>Páginas visitadas e tempo de permanência</li>
            <li>Data e hora de acesso</li>
            <li>Origem do tráfego (referrer)</li>
            <li>Cookies e identificadores similares</li>
            <li>Localização aproximada (país/cidade)</li>
          </ul>

          <h2>4. BASES LEGAIS PARA O TRATAMENTO</h2>
          <p>Tratamos seus dados pessoais com base nas seguintes hipóteses legais previstas na LGPD:</p>

          <table className="min-w-full border-collapse border border-gray-300 my-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Finalidade</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Base Legal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Criação e gerenciamento de conta</td>
                <td className="border border-gray-300 px-4 py-2">Execução de contrato (Art. 7º, V)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Processamento de pagamentos</td>
                <td className="border border-gray-300 px-4 py-2">Execução de contrato (Art. 7º, V)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Integração com Instagram</td>
                <td className="border border-gray-300 px-4 py-2">Consentimento (Art. 7º, I)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Envio de comunicações sobre o serviço</td>
                <td className="border border-gray-300 px-4 py-2">Execução de contrato (Art. 7º, V)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Marketing direto</td>
                <td className="border border-gray-300 px-4 py-2">Consentimento (Art. 7º, I)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Melhoria dos serviços</td>
                <td className="border border-gray-300 px-4 py-2">Legítimo interesse (Art. 7º, IX)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Cumprimento de obrigações legais</td>
                <td className="border border-gray-300 px-4 py-2">Obrigação legal (Art. 7º, II)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Prevenção a fraudes</td>
                <td className="border border-gray-300 px-4 py-2">Legítimo interesse (Art. 7º, IX)</td>
              </tr>
            </tbody>
          </table>

          <h2>5. COMO UTILIZAMOS SEUS DADOS</h2>
          <p>Utilizamos seus dados pessoais para as seguintes finalidades:</p>

          <h3>5.1 Prestação dos Serviços</h3>
          <ul className="list-disc pl-6">
            <li>Criar e gerenciar sua conta</li>
            <li>Permitir a criação e personalização de páginas de links</li>
            <li>Processar pagamentos e gerenciar assinaturas</li>
            <li>Fornecer análises e estatísticas de desempenho</li>
            <li>Executar funcionalidades de IA (Mentor IA)</li>
            <li>Realizar sorteios através dos comentários do Instagram</li>
          </ul>

          <h3>5.2 Comunicação</h3>
          <ul className="list-disc pl-6">
            <li>Enviar confirmações e notificações importantes</li>
            <li>Responder a dúvidas e fornecer suporte</li>
            <li>Informar sobre atualizações e novos recursos</li>
            <li>Enviar conteúdo de marketing (com consentimento)</li>
          </ul>

          <h3>5.3 Melhoria e Segurança</h3>
          <ul className="list-disc pl-6">
            <li>Analisar o uso da plataforma para melhorias</li>
            <li>Detectar e prevenir fraudes e atividades maliciosas</li>
            <li>Garantir a segurança e integridade dos dados</li>
            <li>Cumprir obrigações legais e regulatórias</li>
          </ul>

          <h2>6. COMPARTILHAMENTO DE DADOS</h2>
          <p>
            Não vendemos, alugamos ou comercializamos seus dados pessoais. Compartilhamos seus dados
            apenas nas seguintes situações:
          </p>

          <h3>6.1 Parceiros e Prestadores de Serviços</h3>
          <p>Compartilhamos dados com prestadores de serviços essenciais para nossa operação:</p>
          <ul className="list-disc pl-6">
            <li><strong>Clerk:</strong> Autenticação e gerenciamento de identidade</li>
            <li><strong>Stripe:</strong> Processamento seguro de pagamentos</li>
            <li><strong>Convex:</strong> Armazenamento e processamento de dados</li>
            <li><strong>Vercel:</strong> Hospedagem e infraestrutura</li>
            <li><strong>OpenAI:</strong> Processamento de IA para o Mentor</li>
            <li><strong>Meta (Instagram):</strong> Acesso às APIs para funcionalidades</li>
            <li><strong>Google Analytics:</strong> Análise de tráfego (dados anonimizados)</li>
          </ul>

          <h3>6.2 Obrigações Legais</h3>
          <p>
            Podemos divulgar dados quando exigido por lei, ordem judicial ou autoridade governamental
            competente, incluindo para:
          </p>
          <ul className="list-disc pl-6">
            <li>Cumprir com processos legais</li>
            <li>Proteger direitos, propriedade ou segurança</li>
            <li>Prevenir fraude ou questões de segurança</li>
            <li>Atender requisições de autoridades públicas</li>
          </ul>

          <h3>6.3 Transferências de Negócios</h3>
          <p>
            Em caso de fusão, aquisição ou venda de ativos, seus dados podem ser transferidos,
            sendo você notificado previamente sobre qualquer mudança na titularidade ou uso dos dados.
          </p>

          <h2>7. ARMAZENAMENTO E RETENÇÃO DE DADOS</h2>

          <h3>7.1 Localização do Armazenamento</h3>
          <p>
            Seus dados são armazenados em servidores seguros localizados nos Estados Unidos e
            podem ser processados em outros países onde nossos prestadores de serviço operam.
            Garantimos que todas as transferências internacionais seguem as salvaguardas adequadas
            conforme a LGPD.
          </p>

          <h3>7.2 Prazos de Retenção</h3>
          <table className="min-w-full border-collapse border border-gray-300 my-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Tipo de Dado</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Prazo de Retenção</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Base Legal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Dados cadastrais</td>
                <td className="border border-gray-300 px-4 py-2">5 anos após encerramento da conta</td>
                <td className="border border-gray-300 px-4 py-2">Art. 206, §5º, I, Código Civil</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Dados de pagamento</td>
                <td className="border border-gray-300 px-4 py-2">5 anos após última transação</td>
                <td className="border border-gray-300 px-4 py-2">Obrigações fiscais e contábeis</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Logs de acesso</td>
                <td className="border border-gray-300 px-4 py-2">6 meses</td>
                <td className="border border-gray-300 px-4 py-2">Art. 15, Marco Civil da Internet</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Dados do Instagram</td>
                <td className="border border-gray-300 px-4 py-2">Até revogação da autorização</td>
                <td className="border border-gray-300 px-4 py-2">Consentimento do titular</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Conteúdo criado</td>
                <td className="border border-gray-300 px-4 py-2">Enquanto a conta estiver ativa</td>
                <td className="border border-gray-300 px-4 py-2">Execução do contrato</td>
              </tr>
            </tbody>
          </table>

          <h2>8. SEGURANÇA DOS DADOS</h2>
          <p>
            Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados
            pessoais contra acesso não autorizado, perda, destruição ou alteração:
          </p>

          <h3>8.1 Medidas Técnicas</h3>
          <ul className="list-disc pl-6">
            <li>Criptografia de dados em trânsito (TLS/SSL)</li>
            <li>Criptografia de dados em repouso</li>
            <li>Autenticação de dois fatores disponível</li>
            <li>Tokens de acesso com expiração automática</li>
            <li>Firewalls e sistemas de detecção de intrusão</li>
            <li>Backups regulares e redundância de dados</li>
            <li>Monitoramento contínuo de segurança</li>
          </ul>

          <h3>8.2 Medidas Organizacionais</h3>
          <ul className="list-disc pl-6">
            <li>Acesso restrito baseado em necessidade</li>
            <li>Treinamento regular da equipe em proteção de dados</li>
            <li>Acordos de confidencialidade com funcionários</li>
            <li>Avaliações periódicas de segurança</li>
            <li>Plano de resposta a incidentes</li>
            <li>Due diligence de fornecedores</li>
          </ul>

          <h2>9. SEUS DIREITOS COMO TITULAR DOS DADOS</h2>
          <p>
            Conforme a LGPD, você possui os seguintes direitos em relação aos seus dados pessoais:
          </p>

          <h3>9.1 Direitos Garantidos</h3>
          <ul className="list-disc pl-6">
            <li><strong>Confirmação e Acesso:</strong> Confirmar se tratamos seus dados e acessá-los</li>
            <li><strong>Correção:</strong> Solicitar a correção de dados incompletos ou desatualizados</li>
            <li><strong>Anonimização ou Bloqueio:</strong> Solicitar anonimização ou bloqueio de dados desnecessários</li>
            <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
            <li><strong>Eliminação:</strong> Solicitar a exclusão de dados pessoais</li>
            <li><strong>Informação sobre Compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
            <li><strong>Revogação do Consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
            <li><strong>Oposição:</strong> Opor-se a tratamentos realizados sem consentimento</li>
            <li><strong>Revisão de Decisões Automatizadas:</strong> Solicitar revisão de decisões tomadas por IA</li>
          </ul>

          <h3>9.2 Como Exercer Seus Direitos</h3>
          <p>
            Para exercer qualquer um desses direitos, você pode:
          </p>
          <ul className="list-disc pl-6">
            <li>Acessar as configurações da sua conta no painel de controle</li>
            <li>Enviar e-mail para: <strong>privacidade@freelinnk.com</strong></li>
            <li>Contatar nosso Encarregado de Proteção de Dados (DPO)</li>
          </ul>
          <p className="mt-4">
            Responderemos às suas solicitações no prazo máximo de 15 dias, conforme previsto na LGPD.
            Podemos solicitar informações adicionais para confirmar sua identidade antes de processar
            a solicitação.
          </p>

          <h2>10. COOKIES E TECNOLOGIAS SIMILARES</h2>

          <h3>10.1 O que são Cookies</h3>
          <p>
            Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita
            nossa plataforma. Utilizamos cookies e tecnologias similares para:
          </p>

          <h3>10.2 Tipos de Cookies Utilizados</h3>
          <ul className="list-disc pl-6">
            <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento básico da plataforma</li>
            <li><strong>Cookies de Desempenho:</strong> Coletam informações sobre como você usa a plataforma</li>
            <li><strong>Cookies de Funcionalidade:</strong> Lembram suas preferências e personalizações</li>
            <li><strong>Cookies de Marketing:</strong> Usados para análise e publicidade direcionada (com consentimento)</li>
          </ul>

          <h3>10.3 Gerenciamento de Cookies</h3>
          <p>
            Você pode gerenciar suas preferências de cookies através das configurações do seu navegador
            ou através do nosso banner de cookies. Note que desabilitar cookies essenciais pode afetar
            a funcionalidade da plataforma.
          </p>

          <h2>11. MENORES DE IDADE</h2>
          <p>
            Nossa plataforma não é direcionada a menores de 18 anos. Não coletamos conscientemente
            dados pessoais de menores. Se você é pai/mãe ou responsável e acredita que seu filho
            forneceu dados pessoais, entre em contato conosco imediatamente para que possamos
            tomar as medidas apropriadas.
          </p>

          <h2>12. ALTERAÇÕES NESTA POLÍTICA</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças
            em nossas práticas, tecnologias, requisitos legais ou outros fatores. Quando fizermos
            alterações significativas:
          </p>
          <ul className="list-disc pl-6">
            <li>Atualizaremos a data de Última atualização no topo desta página</li>
            <li>Notificaremos você por e-mail ou através de um aviso em destaque na plataforma</li>
            <li>Quando necessário, solicitaremos seu consentimento novamente</li>
          </ul>

          <h2>13. ENCARREGADO DE PROTEÇÃO DE DADOS (DPO)</h2>
          <p>
            Para questões relacionadas à proteção de dados e privacidade, você pode entrar em
            contato com nosso Encarregado de Proteção de Dados:
          </p>

          <h2>14. AUTORIDADE DE PROTEÇÃO DE DADOS</h2>
          <p>
            Você tem o direito de apresentar uma reclamação à Autoridade Nacional de Proteção
            de Dados (ANPD) se acreditar que violamos seus direitos de privacidade:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg my-4">
            <p><strong>Site:</strong> www.gov.br/anpd</p>
            <p><strong>Endereço:</strong> Esplanada dos Ministérios, Bloco C, 2º andar, Brasília/DF, CEP: 70.297-400</p>
          </div>

       <h2>15. LEGISLAÇÃO APLICÁVEL E FORO</h2>
<p>
  Esta Política de Privacidade é regida pelas leis da República Federativa do Brasil,
  especialmente:
</p>
<ul className="list-disc pl-6">
  <li>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)</li>
  <li>Código de Defesa do Consumidor (Lei nº 8.078/1990)</li>
  <li>Marco Civil da Internet (Lei nº 12.965/2014)</li>
  <li>Demais normas aplicáveis do ordenamento jurídico brasileiro</li>
</ul>

<h3>15.1 Resolução de Conflitos</h3>
<p>
  Priorizamos a resolução amigável de qualquer questão relacionada a esta Política.
  Em caso de dúvidas ou divergências, entre em contato conosco através dos canais
  disponibilizados para buscarmos uma solução consensual.
</p>

<h3>15.2 Foro Competente</h3>
<p>
  Caso não seja possível uma resolução amigável, as partes reconhecem que:
</p>
<ul className="list-disc pl-6">
  <li>
    <strong>Para usuários consumidores:</strong> Conforme artigo 101, I, do Código de
    Defesa do Consumidor, você tem o direito de escolher ajuizar eventual ação em seu
    próprio domicílio, no nosso domicílio, ou no local onde o dano eventualmente ocorreu
  </li>
  <li>
    <strong>Para usuários pessoas jurídicas ou relações não-consumeristas:</strong>
    Fica eleito o foro da comarca de [Cidade onde a empresa está sediada] para dirimir
    quaisquer controvérsias, salvo disposição legal em contrário
  </li>
</ul>

<div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
  <p className="text-sm">
    <strong>Seus direitos são prioridade:</strong> Esta cláusula respeita integralmente
    seus direitos como consumidor. Você sempre poderá buscar atendimento nos órgãos de
    defesa do consumidor, como PROCON, ou através da plataforma consumidor.gov.br,
    além de poder ajuizar ação em seu próprio domicílio.
  </p>
</div>
        </div>
      </main>
    </div>
  );
}