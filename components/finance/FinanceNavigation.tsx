"use client";

import { BarChart3, Zap, Package, ShoppingCart, Receipt, FileText, Target, Users, Truck } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "./finance-workspace.module.css";

export const financeSections = [
  { id: "dashboard", label: "Visão geral", icon: BarChart3, description: "Acompanhe o dia, o mês selecionado e os indicadores do seu negócio." },
  { id: "rapido", label: "Registro rápido", icon: Zap, description: "Registre uma venda ou um gasto sem precisar cadastrar um produto." },
  { id: "clientes", label: "Clientes", icon: Users, description: "Encontre seus clientes, consulte o histórico e mantenha o contato em dia." },
  { id: "produtos", label: "Produtos", icon: Package, description: "Organize seu catálogo, preços e estoque em um só lugar." },
  { id: "vendas", label: "Vendas", icon: ShoppingCart, description: "Consulte e registre as vendas do mês selecionado." },
  { id: "gastos", label: "Gastos", icon: Receipt, description: "Acompanhe as despesas do mês selecionado e mantenha os lançamentos organizados." },
  { id: "resumo", label: "Relatórios", icon: FileText, description: "Analise os resultados por mês, ano ou em todo o período." },
  { id: "metas", label: "Metas", icon: Target, description: "Defina seus objetivos e acompanhe o progresso do negócio." },
  { id: "fornecedores", label: "Fornecedores", icon: Truck, description: "Mantenha os contatos e as informações de seus parceiros por perto." },
] as const;

export function FinanceNavigation({ activeTab }: { activeTab: string }) {
  const current = financeSections.find((section) => section.id === activeTab) || financeSections[0];
  return (
    <div className={styles.navigation}>
      <TabsList aria-label="Áreas do Financeiro e CRM" className={styles.tabList} loop>
        {financeSections.map(({ id, label, icon: Icon }) => (
          <TabsTrigger key={id} value={id} className={styles.tab}>
            <Icon aria-hidden="true" />{label}
          </TabsTrigger>
        ))}
      </TabsList>
      <p className={styles.sectionDescription}>{current.description}</p>
    </div>
  );
}
