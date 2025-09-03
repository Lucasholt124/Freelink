// Em /app/terms-of-service/page.tsx

export default function TermsOfServicePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="prose prose-lg lg:prose-xl text-gray-700 max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">TERMOS DE SERVIÇO</h1>
          <p className="text-sm text-gray-600 mb-8"><strong>Última atualização: 03 de Setembro de 2025</strong></p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <p className="text-sm">
              Por favor, leia estes Termos de Serviço cuidadosamente antes de usar a plataforma Freelinnk.
              Ao acessar ou usar nosso serviço, você concorda em ficar vinculado a estes termos.
            </p>
          </div>

          <h2>1. DEFINIÇÕES E ACEITAÇÃO DOS TERMOS</h2>

          <h3>1.1 Definições</h3>
          <p>Para os fins destes Termos, aplicam-se as seguintes definições:</p>
          <ul className="list-disc pl-6">
            <li><strong>Plataforma ou Serviço:</strong> O site e aplicação web Freelinnk disponível em https://freelinnk.com</li>
            <li><strong>Nós, Nosso:</strong> Refere-se ao Freelinnk e sua equipe</li>
            <li><strong>Você, Usuário:</strong> Pessoa física ou jurídica que utiliza a Plataforma</li>
            <li><strong>Conta:</strong> Perfil criado pelo Usuário para acessar os Serviços</li>
            <li><strong>Conteúdo:</strong> Textos, imagens, links e outros materiais enviados pelos Usuários</li>
            <li><strong>Plano:</strong> Modalidade de assinatura escolhida (Gratuito, Pro ou Premium)</li>
          </ul>

          <h3>1.2 Aceitação</h3>
          <p>
            Ao criar uma conta ou usar nossa Plataforma, você confirma que:
          </p>
          <ul className="list-disc pl-6">
            <li>Tem pelo menos 18 anos de idade ou a maioridade legal em sua jurisdição</li>
            <li>Tem capacidade legal para celebrar contratos vinculantes</li>
            <li>Leu, entendeu e concorda com estes Termos e nossa Política de Privacidade</li>
            <li>Fornecerá informações verdadeiras, precisas e completas</li>
          </ul>

          <h2>2. DESCRIÇÃO DOS SERVIÇOS</h2>

          <h3>2.1 Funcionalidades Principais</h3>
          <p>O Freelinnk oferece as seguintes funcionalidades:</p>
          <ul className="list-disc pl-6">
            <li><strong>Bio Link:</strong> Criação de página personalizada com múltiplos links</li>
            <li><strong>Personalização:</strong> Temas, cores, fontes e layouts customizáveis</li>
            <li><strong>Analytics:</strong> Estatísticas de cliques e visualizações</li>
            <li><strong>Mentor IA:</strong> Assistente inteligente para otimização de conteúdo</li>
            <li><strong>Ferramenta de Sorteios:</strong> Realização de sorteios através de comentários do Instagram</li>
            <li><strong>Integrações:</strong> Conexão com Instagram e outras plataformas</li>
          </ul>

          <h3>2.2 Planos Disponíveis</h3>
          <table className="min-w-full border-collapse border border-gray-300 my-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Plano</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Recursos</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Limitações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Gratuito</td>
                <td className="border border-gray-300 px-4 py-2">Funcionalidades básicas</td>
                <td className="border border-gray-300 px-4 py-2">links inlimitados, analytics básico</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Pro</td>
                <td className="border border-gray-300 px-4 py-2">Recursos avançados</td>
                <td className="border border-gray-300 px-4 py-2">Links ilimitados, analytics completo</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Premium</td>
                <td className="border border-gray-300 px-4 py-2">Todos os recursos + Mentor IA</td>
                <td className="border border-gray-300 px-4 py-2">Sem limitações</td>
              </tr>
            </tbody>
          </table>

          <h2>3. REGISTRO DE CONTA E SEGURANÇA</h2>

          <h3>3.1 Criação de Conta</h3>
          <p>Para utilizar certas funcionalidades, você deve:</p>
          <ul className="list-disc pl-6">
            <li>Fornecer informações verdadeiras e completas</li>
            <li>Manter suas informações atualizadas</li>
            <li>Escolher um nome de usuário apropriado e disponível</li>
            <li>Criar uma senha forte e mantê-la em sigilo</li>
          </ul>

          <h3>3.2 Responsabilidades de Segurança</h3>
          <p>Você é responsável por:</p>
          <ul className="list-disc pl-6">
            <li>Manter a confidencialidade de suas credenciais</li>
            <li>Todas as atividades realizadas em sua conta</li>
            <li>Notificar-nos imediatamente sobre uso não autorizado</li>
            <li>Não compartilhar sua conta com terceiros</li>
          </ul>

          <h3>3.3 Suspensão e Encerramento</h3>
          <p>
            Podemos suspender ou encerrar sua conta se você:
          </p>
          <ul className="list-disc pl-6">
            <li>Violar estes Termos de Serviço</li>
            <li>Fornecer informações falsas ou enganosas</li>
            <li>Usar a Plataforma para atividades ilegais</li>
            <li>Não efetuar pagamentos devidos</li>
            <li>Permanecer inativo por período prolongado</li>
          </ul>

          <h2>4. USO ACEITÁVEL DA PLATAFORMA</h2>

          <h3>4.1 Condutas Permitidas</h3>
          <p>Você pode usar a Plataforma para:</p>
          <ul className="list-disc pl-6">
            <li>Criar e gerenciar suas páginas de links</li>
            <li>Compartilhar conteúdo legal e apropriado</li>
            <li>Promover seus negócios e projetos pessoais</li>
            <li>Interagir com sua audiência de forma profissional</li>
          </ul>

          <h3>4.2 Condutas Proibidas</h3>
          <p>Você concorda em NÃO:</p>
          <ul className="list-disc pl-6">
            <li>Violar leis locais, nacionais ou internacionais</li>
            <li>Publicar conteúdo ilegal, ofensivo, discriminatório ou difamatório</li>
            <li>Infringir direitos de propriedade intelectual de terceiros</li>
            <li>Fazer spam, phishing ou distribuir malware</li>
            <li>Usar bots, scripts ou ferramentas automatizadas não autorizadas</li>
            <li>Tentar hackear, quebrar ou comprometer nossa segurança</li>
            <li>Fazer engenharia reversa de nosso código ou sistemas</li>
            <li>Vender, alugar ou sublicenciar o acesso à sua conta</li>
            <li>Criar múltiplas contas para burlar limitações</li>
            <li>Usar a plataforma para atividades fraudulentas</li>
            <li>Assediar, ameaçar ou intimidar outros usuários</li>
            <li>Coletar dados de outros usuários sem consentimento</li>
          </ul>

          <h2>5. CONTEÚDO DO USUÁRIO</h2>

          <h3>5.1 Propriedade do Conteúdo</h3>
          <p>
            Você mantém todos os direitos sobre o conteúdo que publica na Plataforma.
            No entanto, ao publicar conteúdo, você nos concede uma licença mundial,
            não exclusiva, livre de royalties, sublicenciável e transferível para usar,
            reproduzir, distribuir, preparar trabalhos derivados, exibir e executar
            esse conteúdo em conexão com o fornecimento dos Serviços.
          </p>

          <h3>5.2 Responsabilidade pelo Conteúdo</h3>
          <p>Você é o único responsável por:</p>
          <ul className="list-disc pl-6">
            <li>Todo conteúdo que publicar ou transmitir</li>
            <li>Garantir que tem direitos para usar o conteúdo</li>
            <li>Consequências legais do conteúdo publicado</li>
            <li>Danos causados por conteúdo inadequado</li>
          </ul>

          <h3>5.3 Remoção de Conteúdo</h3>
          <p>
            Reservamo-nos o direito de remover, sem aviso prévio, qualquer conteúdo que:
          </p>
          <ul className="list-disc pl-6">
            <li>Viole estes Termos ou nossa Política de Privacidade</li>
            <li>Seja considerado ilegal, ofensivo ou inadequado</li>
            <li>Infrinja direitos de terceiros</li>
            <li>Contenha vírus ou código malicioso</li>
          </ul>

          <h2>6. PROPRIEDADE INTELECTUAL</h2>

          <h3>6.1 Nossa Propriedade</h3>
          <p>
            Todo o conteúdo da Plataforma, incluindo mas não limitado a textos, gráficos,
            logos, ícones, imagens, clipes de áudio, downloads digitais, compilações de
            dados e software, é propriedade do Freelinnk ou de seus fornecedores de conteúdo
            e é protegido por leis de propriedade intelectual.
          </p>

          <h3>6.2 Marca Registrada</h3>
          <p>
            Freelinnk e todos os logos relacionados são marcas registradas ou marcas de
            serviço do Freelinnk. Você não pode usar essas marcas sem nossa permissão prévia
            por escrito.
          </p>

          <h3>6.3 Licença Limitada</h3>
          <p>
            Concedemos a você uma licença limitada, não exclusiva, não transferível e
            revogável para acessar e usar a Plataforma para fins pessoais ou comerciais
            legítimos, sujeita a estes Termos.
          </p>

          <h2>7. PAGAMENTOS E ASSINATURAS</h2>

          <h3>7.1 Preços e Pagamento</h3>
          <ul className="list-disc pl-6">
            <li>Os preços são exibidos em Reais Brasileiros (BRL)</li>
            <li>O pagamento é processado através do Stripe</li>
            <li>As cobranças são realizadas antecipadamente</li>
            <li>Todos os preços incluem impostos aplicáveis</li>
          </ul>

          <h3>7.2 Ciclos de Cobrança</h3>
          <ul className="list-disc pl-6">
            <li><strong>Mensal:</strong> Cobrado no mesmo dia de cada mês</li>
            <li><strong>Anual:</strong> Cobrado uma vez por ano com desconto</li>
            <li>A renovação é automática, salvo cancelamento</li>
          </ul>

          <h3>7.3 Política de Reembolso</h3>
          <p>
            Oferecemos garantia de satisfação de 7 dias para novos assinantes.
            Condições para reembolso:
          </p>
          <ul className="list-disc pl-6">
            <li>Solicitação dentro de 7 dias da primeira assinatura</li>
            <li>Conta não pode ter violado os Termos de Serviço</li>
            <li>Limite de um reembolso por usuário</li>
            <li>Não aplicável a renovações</li>
          </ul>

          <h3>7.4 Cancelamento</h3>
          <p>
            Você pode cancelar sua assinatura a qualquer momento:
          </p>
          <ul className="list-disc pl-6">
            <li>O cancelamento entra em vigor no fim do período pago</li>
            <li>Não há reembolso parcial para períodos não utilizados</li>
            <li>O acesso continua até o fim do período pago</li>
            <li>Dados são mantidos por 30 dias após cancelamento</li>
          </ul>

          <h3>7.5 Alterações de Preços</h3>
          <p>
            Podemos alterar os preços com aviso prévio de 30 dias. Alterações não afetam
            períodos já pagos.
          </p>

          <h2>8. INTEGRAÇÃO COM TERCEIROS</h2>

          <h3>8.1 Instagram e Meta</h3>
          <p>
            Ao conectar sua conta do Instagram:
          </p>
          <ul className="list-disc pl-6">
            <li>Você autoriza o acesso conforme as permissões solicitadas</li>
            <li>Deve cumprir os Termos de Uso do Instagram/Meta</li>
            <li>Entende que mudanças na API podem afetar funcionalidades</li>
            <li>Não somos responsáveis por ações do Instagram/Meta</li>
          </ul>

          <h3>8.2 Outros Serviços</h3>
          <p>
            A Plataforma pode integrar com outros serviços. Você é responsável por
            revisar e aceitar os termos desses serviços.
          </p>

          <h2>9. PRIVACIDADE E PROTEÇÃO DE DADOS</h2>
          <p>
            Sua privacidade é importante para nós. O tratamento de seus dados pessoais
            é regido por nossa <a href="/privacy-policy" className="text-blue-600 hover:underline">Política de Privacidade</a>,
            que é parte integrante destes Termos. Ao usar a Plataforma, você consente
            com a coleta e uso de informações conforme descrito na Política de Privacidade.
          </p>

          <h2>10. ISENÇÕES DE RESPONSABILIDADE</h2>

          <h3>10.1 Disponibilidade do Serviço</h3>
          <p>
            A PLATAFORMA É FORNECIDA COMO ESTÁ E CONFORME DISPONÍVEL. NÃO GARANTIMOS:
          </p>
          <ul className="list-disc pl-6">
            <li>Operação ininterrupta ou livre de erros</li>
            <li>Que defeitos serão corrigidos imediatamente</li>
            <li>Ausência de vírus ou componentes prejudiciais</li>
            <li>Que os resultados atendam suas expectativas</li>
          </ul>

          <h3>10.2 Conteúdo de Terceiros</h3>
          <p>
            Não somos responsáveis por:
          </p>
          <ul className="list-disc pl-6">
            <li>Conteúdo publicado por outros usuários</li>
            <li>Links externos compartilhados na plataforma</li>
            <li>Transações realizadas fora da plataforma</li>
            <li>Ações de terceiros integrados</li>
          </ul>

          <h2>11. LIMITAÇÃO DE RESPONSABILIDADE</h2>
          <p>
            NA MÁXIMA EXTENSÃO PERMITIDA POR LEI, O FREELINNK NÃO SERÁ RESPONSÁVEL POR:
          </p>
          <ul className="list-disc pl-6">
            <li>Danos indiretos, incidentais, especiais ou consequenciais</li>
            <li>Perda de lucros, dados ou oportunidades de negócios</li>
            <li>Interrupção de negócios</li>
            <li>Danos excedentes ao valor pago nos últimos 12 meses</li>
          </ul>

          <h2>12. INDENIZAÇÃO</h2>
          <p>
            Você concorda em indenizar, defender e isentar o Freelinnk, seus diretores,
            funcionários, agentes e parceiros de qualquer reclamação, demanda, perda,
            dano, custo ou despesa (incluindo honorários advocatícios) decorrentes de:
          </p>
          <ul className="list-disc pl-6">
            <li>Seu uso da Plataforma</li>
            <li>Violação destes Termos</li>
            <li>Violação de direitos de terceiros</li>
            <li>Conteúdo que você publicar</li>
          </ul>

          <h2>13. MODIFICAÇÕES DOS TERMOS</h2>
          <p>
            Reservamo-nos o direito de modificar estes Termos a qualquer momento.
            Quando fizermos alterações:
          </p>
          <ul className="list-disc pl-6">
            <li>Atualizaremos a data de Última atualização</li>
            <li>Notificaremos sobre mudanças significativas</li>
            <li>Alterações entram em vigor após 30 dias da notificação</li>
            <li>Uso continuado constitui aceitação das mudanças</li>
          </ul>

          <h2>14. RESCISÃO</h2>

          <h3>14.1 Rescisão por Você</h3>
          <p>
            Você pode encerrar sua conta a qualquer momento através das configurações
            da conta ou entrando em contato conosco.
          </p>

          <h3>14.2 Rescisão por Nós</h3>
          <p>
            Podemos suspender ou encerrar sua conta imediatamente, sem aviso prévio, se:
          </p>
          <ul className="list-disc pl-6">
            <li>Você violar materialmente estes Termos</li>
            <li>Suspeitarmos de atividade fraudulenta</li>
            <li>For exigido por lei ou ordem judicial</li>
            <li>A conta permanecer inativa por mais de 12 meses</li>
          </ul>

          <h3>14.3 Efeitos da Rescisão</h3>
          <p>Após o encerramento:</p>
          <ul className="list-disc pl-6">
            <li>Seu direito de usar a Plataforma cessa imediatamente</li>
            <li>Podemos deletar sua conta e conteúdo após 30 dias</li>
            <li>Não há direito a reembolso de valores pagos</li>
            <li>Cláusulas que devem sobreviver continuam válidas</li>
          </ul>

          <h2>15. DISPOSIÇÕES GERAIS</h2>

          <h3>15.1 Lei Aplicável</h3>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil,
            independentemente de conflitos de princípios legais.
          </p>

          <h3>15.2 Foro</h3>
          <p>
            Fica eleito o foro da comarca de [Sua Cidade/Estado] para dirimir quaisquer
            controvérsias oriundas destes Termos, com renúncia expressa a qualquer outro,
            por mais privilegiado que seja.
          </p>

          <h3>15.3 Resolução de Disputas</h3>
          <p>
            Antes de recorrer ao judiciário, as partes concordam em tentar resolver
            disputas através de negociação direta por pelo menos 30 dias.
          </p>

          <h3>15.4 Acordo Integral</h3>
          <p>
            Estes Termos, junto com nossa Política de Privacidade, constituem o acordo
            integral entre você e o Freelinnk sobre o uso da Plataforma.
          </p>

          <h3>15.5 Cessão</h3>
          <p>
            Você não pode ceder ou transferir estes Termos sem nosso consentimento prévio
            por escrito. Podemos ceder nossos direitos a qualquer momento.
          </p>

          <h3>15.6 Divisibilidade</h3>
          <p>
            Se qualquer disposição destes Termos for considerada inválida ou inexequível,
            as demais disposições continuarão em pleno vigor e efeito.
          </p>

          <h3>15.7 Renúncia</h3>
          <p>
            Nossa falha em exercer qualquer direito ou disposição destes Termos não
            constituirá uma renúncia a tal direito ou disposição.
          </p>

          <h2>16. CONTATO</h2>
          <p>
            Para questões sobre estes Termos de Serviço, entre em contato conosco:
          </p>


          <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-8">
            <p className="text-sm">
              <strong>Obrigado por escolher o Freelinnk!</strong> Estamos comprometidos em
              fornecer uma plataforma segura, confiável e eficiente para você gerenciar
              sua presença online. Se tiver dúvidas, não hesite em nos contatar.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}