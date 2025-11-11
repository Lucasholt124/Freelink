import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Adiciona os tipos estendidos de autoTable ao jsPDF para evitar erros de tipagem
interface jsPDFWithPlugin extends jsPDF {
  autoTable: typeof autoTable;
  lastAutoTable: {
    finalY: number;
  };
}

interface Sale {
  _id: string;
  productName: string;
  quantity: number;
  salePrice: number;
  totalRevenue: number;
  profit: number;
  date: string;
}

interface Expense {
  _id: string;
  description: string;
  categoryName: string;
  amount: number;
  date: string;
}

interface Product {
  name: string;
  sku?: string;
  category?: string;
  costPrice: number;
  salePrice: number;
  stock?: number;
  totalSold?: number;
}

interface MonthlyReport {
  month: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalSales: number;
  topProducts: Array<{
    productName: string;
    quantity: number;
    revenue: number;
    profit: number;
  }>;
}

export class PDFExporter {
  private doc: jsPDFWithPlugin;

  constructor() {
    // ✅ CORREÇÃO TS: Força a tipagem para incluir os métodos de autoTable
    this.doc = new jsPDF() as jsPDFWithPlugin;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  private addHeader(title: string, subtitle?: string) {
    // Logo/Título
    this.doc.setFontSize(24);
    this.doc.setTextColor(79, 70, 229); // Azul roxo
    this.doc.text('🚀 Gestão PRO', 20, 20);

    // Título do relatório
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, 20, 35);

    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, 20, 42);
    }

    // Data de geração
    this.doc.setFontSize(10);
    this.doc.setTextColor(150, 150, 150);
    const now = new Date().toLocaleString('pt-BR');
    this.doc.text(`Gerado em: ${now}`, 20, 50);

    // Linha separadora
    this.doc.setDrawColor(79, 70, 229);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 55, 190, 55);
  }

  private addFooter(pageNumber: number) {
    const pageHeight = this.doc.internal.pageSize.height;
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(
      `Página ${pageNumber} | Gestão PRO - Sistema de Gestão Financeira`,
      105,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  public exportMonthlyReport(report: MonthlyReport, sales: Sale[], expenses: Expense[]) {
    const monthName = new Date(report.month + '-01').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    this.addHeader('Relatório Mensal', monthName.toUpperCase());

    let yPos = 65;

    // ===== RESUMO FINANCEIRO =====
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('💰 Resumo Financeiro', 20, yPos);
    yPos += 10;

    // Cards de resumo
    const resumoData = [
      ['Receita Total', this.formatCurrency(report.totalRevenue)],
      ['Gastos Totais', this.formatCurrency(report.totalExpenses)],
      ['Lucro Líquido', this.formatCurrency(report.netProfit)],
      ['Margem de Lucro', `${report.profitMargin.toFixed(2)}%`],
      ['Total de Vendas', report.totalSales.toString()],
    ];

    // ✅ CORREÇÃO: Usando autoTable do plugin importado
    autoTable(this.doc, {
      startY: yPos,
      head: [['Indicador', 'Valor']],
      body: resumoData,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        fontSize: 11,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });

    yPos = this.doc.lastAutoTable.finalY + 15;

    // ===== TOP PRODUTOS =====
    if (report.topProducts.length > 0) {
      this.doc.setFontSize(14);
      this.doc.text('⭐ Top Produtos', 20, yPos);
      yPos += 10;

      const topProductsData = report.topProducts.map((p, index) => [
        `${index + 1}º`,
        p.productName,
        p.quantity.toString(),
        this.formatCurrency(p.revenue),
        this.formatCurrency(p.profit),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['#', 'Produto', 'Qtd', 'Receita', 'Lucro']],
        body: topProductsData,
        theme: 'striped',
        headStyles: {
          fillColor: [147, 51, 234],
          fontSize: 10,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
      });

      yPos = this.doc.lastAutoTable.finalY + 15;
    }

    // ===== NOVA PÁGINA: VENDAS =====
    this.doc.addPage();
    yPos = 20;

    this.doc.setFontSize(14);
    this.doc.text(`🛒 Vendas do Mês (${sales.length})`, 20, yPos);
    yPos += 10;

    if (sales.length > 0) {
      const salesData = sales.slice(0, 50).map((s) => [
        this.formatDate(s.date),
        s.productName,
        s.quantity.toString(),
        this.formatCurrency(s.salePrice),
        this.formatCurrency(s.totalRevenue),
        this.formatCurrency(s.profit),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['Data', 'Produto', 'Qtd', 'Preço', 'Total', 'Lucro']],
        body: salesData,
        theme: 'grid',
        headStyles: {
          fillColor: [16, 185, 129],
          fontSize: 9,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [236, 253, 245],
        },
      });
    } else {
      this.doc.setFontSize(10);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text('Nenhuma venda registrada neste mês.', 20, yPos);
    }

    // ===== NOVA PÁGINA: GASTOS =====
    this.doc.addPage();
    yPos = 20;

    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`💸 Gastos do Mês (${expenses.length})`, 20, yPos);
    yPos += 10;

    if (expenses.length > 0) {
      const expensesData = expenses.slice(0, 50).map((e) => [
        this.formatDate(e.date),
        e.description,
        e.categoryName,
        this.formatCurrency(e.amount),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['Data', 'Descrição', 'Categoria', 'Valor']],
        body: expensesData,
        theme: 'grid',
        headStyles: {
          fillColor: [239, 68, 68],
          fontSize: 9,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [254, 242, 242],
        },
      });
    } else {
      this.doc.setFontSize(10);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text('Nenhum gasto registrado neste mês.', 20, yPos);
    }

    // Adicionar rodapé em todas as páginas
    // ✅ CORREÇÃO TS: Usa `this.doc.internal.getNumberOfPages()` ou `(this.doc as any).internal.getNumberOfPages()` se a tipagem não for suficiente.
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter(i);
    }

    // Salvar PDF
    const filename = `relatorio_${report.month}.pdf`;
    this.doc.save(filename);
  }

  // ✅ CORREÇÃO TS: Tipa a entrada `products` com a interface `Product[]`
  public exportProductsReport(products: Product[]) {
    this.addHeader('Relatório de Produtos', `Total: ${products.length} produtos`);

    // ✅ CORREÇÃO: Declara como const (prefer-const)
    const yPos = 65;

    if (products.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text('Nenhum produto cadastrado.', 20, yPos);
      this.addFooter(1);
      this.doc.save('produtos.pdf');
      return;
    }

    const productsData = products.map((p) => {
      const profit = p.salePrice - p.costPrice;
      const margin = p.salePrice > 0 ? ((profit / p.salePrice) * 100).toFixed(1) : '-';
      return [
        p.name,
        p.sku || '-',
        p.category || '-',
        this.formatCurrency(p.costPrice),
        this.formatCurrency(p.salePrice),
        p.stock?.toString() || '-',
        `${margin}%`,
      ];
    });

    autoTable(this.doc, {
      startY: yPos,
      head: [['Produto', 'SKU', 'Categoria', 'Custo', 'Venda', 'Estoque', 'Margem']],
      body: productsData,
      theme: 'striped',
      headStyles: {
        fillColor: [147, 51, 234],
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
    });

    // ✅ CORREÇÃO TS: Usa `this.doc.internal.getNumberOfPages()`
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter(i);
    }

    this.doc.save('produtos.pdf');
  }

  public exportSalesReport(sales: Sale[], month: string) {
    const monthName = new Date(month + '-01').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    this.addHeader('Relatório de Vendas', monthName.toUpperCase());

    // ✅ CORREÇÃO: Declara como const (prefer-const)
    const startYPos = 65;
    let yPos = startYPos;

    // Resumo
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);

    this.doc.setFontSize(12);
    this.doc.text(`Total de Vendas: ${sales.length}`, 20, yPos);
    yPos += 7;
    this.doc.text(`Receita Total: ${this.formatCurrency(totalRevenue)}`, 20, yPos);
    yPos += 7;
    this.doc.text(`Lucro Total: ${this.formatCurrency(totalProfit)}`, 20, yPos);
    yPos += 15;

    if (sales.length > 0) {
      const salesData = sales.slice(0, 100).map((s) => [
        this.formatDate(s.date),
        s.productName,
        s.quantity.toString(),
        this.formatCurrency(s.salePrice),
        this.formatCurrency(s.totalRevenue),
        this.formatCurrency(s.profit),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['Data', 'Produto', 'Qtd', 'Preço', 'Total', 'Lucro']],
        body: salesData,
        theme: 'grid',
        headStyles: {
          fillColor: [16, 185, 129],
          fontSize: 9,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [236, 253, 245],
        },
      });
    } else {
      this.doc.setFontSize(10);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text('Nenhuma venda registrada.', 20, yPos);
    }

    // ✅ CORREÇÃO TS: Usa `this.doc.internal.getNumberOfPages()`
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter(i);
    }

    this.doc.save(`vendas_${month}.pdf`);
  }
}