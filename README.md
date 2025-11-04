# Freelinnk ✨

Bem-vindo ao Freelinnk, uma plataforma SaaS moderna e completa de "link na bio", construída com as tecnologias mais recentes do ecossistema Next.js. Este projeto vai além de um simples agregador de links, oferecendo um dashboard analítico poderoso, sistema de planos e pagamentos com Stripe, e uma experiência de usuário profissional e personalizável.

**Visite a aplicação em produção:** **[www.freelinnk.com](https://www.freelinnk.com)** 🚀

---

## 📸 Screenshots

_**Ação:** Tire screenshots bonitos da sua landing page, do dashboard de links e, principalmente, do painel de análises. Substitua as URLs de placeholder abaixo._

| Landing Page                                                               | Dashboard de Links                                                            | Painel de Análises                                                         |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ![Landing Page do Freelinnk](https://www.freelinnk.com/) | ![Dashboard de Links do Freelinnk](https://www.freelinnk.com/dashboard) | ![Painel de Análises do Freelinnk](https://www.freelinnk.com/dashboard/link/j97c0ae1m8b6khsde7c4nz44mn7m1skw) |

---

## 🎯 Visão Geral do Produto

O Freelinnk foi projetado para ser a alternativa definitiva ao Linktree para o mercado brasileiro, focando em três pilares:

1.  **Simplicidade e Elegância:** Uma interface limpa e intuitiva que permite aos usuários criar e gerenciar sua página de links em minutos, sem complicações.
2.  **Análises Poderosas:** Um dashboard completo que transforma dados brutos de cliques em insights acionáveis, ajudando criadores e empresas a entenderem sua audiência.
3.  **Monetização Real:** Uma estrutura de planos (Free, Pro, Ultra) com integração completa ao Stripe, permitindo features premium como remoção de marca e rastreamento via Pixel/GA4.

---

## ✨ Funcionalidades Principais

*   **Autenticação Segura:** Gerenciamento completo de usuários com **Clerk**, incluindo login social e segurança de nível empresarial.
*   **Páginas Públicas Dinâmicas:** URLs personalizadas (`freelinnk.com/u/username`) que exibem os links e o perfil do usuário.
*   **Dashboard Intuitivo:**
    *   Gerenciamento de links com reordenação por **Drag-and-Drop** (`dnd-kit`).
    *   Formulários robustos com validação em tempo real (`react-hook-form` + `zod`).
    *   Personalização de perfil (foto, descrição, cor de destaque).
*   **Painel de Análises Avançado:**
    *   **Métricas Gerais:** Cliques totais, visitantes únicos, principais origens, links mais populares e mais.
    *   **Gráficos Detalhados:** Desempenho diário, distribuição geográfica (países, estados, cidades) e atividade por hora.
    *   **Lógica de Acesso por Plano:** Usuários Free veem apenas o básico, incentivando o upgrade.
*   **Sistema de Assinaturas (SaaS):**
    *   Integração com **Stripe** para checkout de assinaturas (mensal/anual).
    *   Webhooks para sincronizar o status da assinatura com os metadados do Clerk.
    *   Portal do cliente para gerenciamento de pagamentos.
*   **Recursos Premium (Plano Ultra):**
    *   **Remoção de Marca (White-label):** Usuários Pro/Ultra podem remover a marca "Freelinnk" de suas páginas.
    *   **Rastreamento de Marketing:** Integração com **Pixel do Facebook (Meta)** e **Google Analytics (GA4)** para otimização de anúncios.

---

## 🛠️ Stack Tecnológica

Este projeto foi construído com uma stack moderna, focada em performance, escalabilidade e uma excelente experiência de desenvolvimento.

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Hospedagem:** [Vercel](https://vercel.com/)
*   **Hospedagem:** [Hostinger](https://Hostinger.com/)
*   **Banco de Dados Primário:** [PostgreSQL (Vercel Postgres)](https://vercel.com/storage/postgres) - Para dados analíticos.
*   **Banco de Dados Secundário:** [Convex](https://www.convex.dev/) - Para dados em tempo real (links, customizações).
*   **Autenticação:** [Clerk](https://clerk.com/)
*   **Pagamentos:** [Stripe](https://stripe.com/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes UI:** [Shadcn/UI](https://ui.shadcn.com/)
*   **Animações:** [Framer Motion](https://www.framer.com/motion/)
*   **Drag-and-Drop:** [Dnd-kit](https://dndkit.com/)
*   **Validação de Formulários:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
*   **Ícones:** [Lucide React](https://lucide.dev/)

---

## 🚀 Como Rodar Localmente

Para configurar e rodar este projeto na sua máquina local, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Lucasholt124/Freelinnk.git
    cd Freelink
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    *   Crie um arquivo `.env.local` na raiz do projeto.
    *   Você precisará das chaves de API e URLs dos seguintes serviços:
        *   **Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
        *   **Convex:** `NEXT_PUBLIC_CONVEX_URL`
        *   **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, e os IDs dos preços.
        *   **Vercel Postgres:** `POSTGRES_URL` (e as outras variáveis relacionadas).

4.  **Sincronize o Schema do Convex:**
    ```bash
    npx convex dev
    ```
    _Mantenha este comando rodando em um terminal separado._

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.

---

## 🌟 Contato

Lucas Holt - [LinkedIn]([https://www.linkedin.com/in/seu-linkedin/](https://www.linkedin.com/in/lucas-arag%C3%A3o-fullstack/)) - [lucasholt2021@gmail.com](mailto:lucasholt2021@gmail.com)

Link do Projeto: [https://github.com/Lucasholt124/Freelink](https://github.com/Lucasholt124/Freelink)
