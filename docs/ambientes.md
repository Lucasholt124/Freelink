# Ambientes do Freelinnk

Verificado em 6 de novembro de 2026.

| Uso | Convex | Clerk |
| --- | --- | --- |
| Site publicado em `www.freelinnk.com` | `original-armadillo-999` | Live: `https://clerk.freelinnk.com` |
| Desenvolvimento local com a conta de teste | `oceanic-rhinoceros-571`, referência `dev/onboarding-testes` | Test: `https://sound-unicorn-77.clerk.accounts.dev` |
| Deployment padrão de produção do projeto Convex | `optimistic-cassowary-13` | Live: `https://clerk.freelinnk.com` |

## Particularidade do site atual

O frontend publicado usa `https://original-armadillo-999.convex.cloud`. Apesar de o Convex classificar esse deployment como `dev`, ele contém as páginas reais utilizadas pelo site, incluindo a página de referência e a do administrador. Trate-o como ambiente live.

O deployment padrão `optimistic-cassowary-13` não continha essas duas páginas quando foi verificado. A troca da URL da Vercel para esse deployment exige um plano de migração dos dados, arquivos e referências. Não faça essa troca como correção de autenticação.

Não configure o issuer do Clerk de testes em `original-armadillo-999`. O Clerk Live do frontend deixa de ser aceito e o painel não consegue consultar seus dados.

## Desenvolvimento local

O `.env.local` seleciona `dev:oceanic-rhinoceros-571` e a URL desse ambiente de testes. As chaves de teste continuam locais. `npm run dev` pode ser utilizado para iniciar o frontend e a sincronização do backend selecionado.

Nesse ambiente foi recriado somente o perfil conhecido `Freelinnk Teste`, com o endereço `teste-onboarding-0611` e o link de exemplo. Dados financeiros, campanhas e dados de clientes do site não foram copiados.

Ao executar a CLI, confira o deployment anunciado. A seleção local e um `--env-file` explícito podem escolher destinos diferentes. O comando `convex deploy` escolhe o deployment padrão de produção do projeto; atualmente isso não significa o backend utilizado pelo site publicado.

## Tratamento de conexão no painel

O código diferencia conexão em andamento, sessão encerrada, autenticação recusada e resposta recebida. Após 15 segundos sem concluir o carregamento, oferece nova tentativa. O painel recupera automaticamente quando os dados chegam. Essa proteção depende de publicar o frontend atualizado na Vercel.


## Novo editor de páginas e links (7 de novembro de 2026)

As abas Aparência e perfil e Meus links usam as funções autenticadas `pageWorkspaces`. A criação de páginas adicionais consulta o plano diretamente no Clerk, sem aceitar o plano enviado pelo navegador. Limites existentes preservados: Free sem adicionais, Pro 10, Ultra 30.

A `CLERK_SECRET_KEY` de TEST foi configurada somente em `oceanic-rhinoceros-571`, com autorização explícita. Não houve alteração de chaves ou dados no ambiente live nesta atualização.

Para publicar este editor, sincronize primeiro as novas funções no backend realmente usado pelo site (`original-armadillo-999`) e mantenha seu issuer Live. A criação de páginas adicionais exige a chave Clerk Live nesse backend. A configuração dessa chave Live não foi autorizada nem realizada nesta tarefa. Não utilize a chave de testes no ambiente live e não altere a URL da Vercel para outro banco.

Depois publique o frontend com as mesmas variáveis Live já utilizadas. Verifique: abrir as duas abas, salvar uma identidade, editar um link, alternar entre páginas e criar uma página com uma conta Pro/Ultra. O botão de criação falha de forma segura se a confirmação do plano estiver indisponível.

O build completo local continua dependendo da configuração Stripe já exigida pela rota `/api/stripe/portal`. A verificação do editor usa TypeScript e testes de handlers sem incluir segredos nas saídas.
