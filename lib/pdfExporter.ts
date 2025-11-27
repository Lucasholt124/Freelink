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

// 🎨 Paleta de Cores Premium Freelinnk
const COLORS = {
  // Gradiente Principal Freelinnk
  primary: [124, 58, 237] as [number, number, number],      // Violet-600
  primaryDark: [109, 40, 217] as [number, number, number],  // Violet-700
  primaryLight: [167, 139, 250] as [number, number, number], // Violet-400

  // Cores de Destaque
  indigo: [99, 102, 241] as [number, number, number],       // Indigo-500
  purple: [147, 51, 234] as [number, number, number],       // Purple-600

  // Status
  success: [16, 185, 129] as [number, number, number],      // Emerald-500
  successLight: [209, 250, 229] as [number, number, number], // Emerald-100
  danger: [239, 68, 68] as [number, number, number],        // Red-500
  dangerLight: [254, 226, 226] as [number, number, number], // Red-100
  warning: [245, 158, 11] as [number, number, number],      // Amber-500

  // Neutros
  dark: [17, 24, 39] as [number, number, number],           // Gray-900
  gray: [107, 114, 128] as [number, number, number],        // Gray-500
  grayLight: [156, 163, 175] as [number, number, number],   // Gray-400
  muted: [209, 213, 219] as [number, number, number],       // Gray-300
  background: [249, 250, 251] as [number, number, number],  // Gray-50
  white: [255, 255, 255] as [number, number, number],

  // Cores para Tabelas
  tableHeader: [124, 58, 237] as [number, number, number],
  tableAlt: [245, 243, 255] as [number, number, number],    // Violet-50
};

export class PDFExporter {
  private doc: jsPDFWithPlugin;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private contentWidth: number;

  constructor() {
    this.doc = new jsPDF() as jsPDFWithPlugin;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 15;
    this.contentWidth = this.pageWidth - (this.margin * 2);
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

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  // 🎨 Desenha o Logo "F" da Freelinnk
  private drawFreelinnkLogo(x: number, y: number, size: number = 12) {
    // Fundo com gradiente simulado (quadrado arredondado)


    // Desenha retângulo arredondado para o logo
    this.doc.roundedRect(x, y, size, size, 2, 2, 'F');

    // Adiciona um efeito de profundidade
    this.doc.setFillColor(...COLORS.primaryDark);
    this.doc.roundedRect(x + 0.5, y + size - 2, size - 1, 1.5, 0.5, 0.5, 'F');

    // Letra "F" em branco
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(size * 0.7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('F', x + size/2, y + size * 0.72, { align: 'center' });

    // Reset cor do texto
    this.doc.setTextColor(...COLORS.dark);
  }

  // 🎨 Header Premium com Branding Freelinnk
  private addHeader(title: string, subtitle?: string) {
    // ===== FAIXA SUPERIOR DECORATIVA =====
    // Gradiente superior (simulado com retângulos)
    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 3, 'F');

    this.doc.setFillColor(...COLORS.indigo);
    this.doc.rect(0, 3, this.pageWidth, 1, 'F');

    // ===== ÁREA DO LOGO E MARCA =====
    const headerY = 12;

    // Logo F
    this.drawFreelinnkLogo(this.margin, headerY, 14);

    // Nome da marca "Freelinnk"
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('Freelinnk', this.margin + 18, headerY + 10);

    // Tagline
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text('Gestão Inteligente para seu Negócio', this.margin + 18, headerY + 15);

    // ===== BADGE "PRO" =====
    const badgeX = this.margin + 65;
    const badgeY = headerY + 5;
    this.doc.setFillColor(...COLORS.success);
    this.doc.roundedRect(badgeX, badgeY, 12, 5, 1, 1, 'F');
    this.doc.setFontSize(6);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.white);
    this.doc.text('PRO', badgeX + 6, badgeY + 3.5, { align: 'center' });

    // ===== DATA E HORA NO CANTO DIREITO =====
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.grayLight);
    this.doc.text(`${dateStr} às ${timeStr}`, this.pageWidth - this.margin, headerY + 8, { align: 'right' });

    // Ícone de calendário (simulado com texto)
    this.doc.setFontSize(7);
    this.doc.text('📅', this.pageWidth - this.margin - 38, headerY + 8);

    // ===== TÍTULO DO RELATÓRIO =====
    const titleY = headerY + 28;

    // Linha decorativa antes do título
    this.doc.setDrawColor(...COLORS.muted);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, titleY - 5, this.pageWidth - this.margin, titleY - 5);

    // Título principal
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.dark);
    this.doc.text(title, this.margin, titleY + 5);

    // Subtítulo se existir
    if (subtitle) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.gray);
      this.doc.text(subtitle, this.margin, titleY + 13);
    }

    // ===== LINHA DECORATIVA INFERIOR =====
    const lineY = subtitle ? titleY + 20 : titleY + 12;

    // Linha principal roxa
    this.doc.setDrawColor(...COLORS.primary);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, lineY, this.margin + 50, lineY);

    // Continuação mais fina
    this.doc.setDrawColor(...COLORS.muted);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin + 52, lineY, this.pageWidth - this.margin, lineY);

    return lineY + 10; // Retorna a posição Y para começar o conteúdo
  }

  // 🎨 Footer Premium com Branding
  private addFooter(pageNumber: number, totalPages?: number) {
    const footerY = this.pageHeight - 12;

    // Linha separadora do footer
    this.doc.setDrawColor(...COLORS.muted);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);

    // Logo pequeno no footer
    this.drawFreelinnkLogo(this.margin, footerY - 2, 6);

    // Texto do footer
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.grayLight);
    this.doc.text('Freelinnk', this.margin + 8, footerY + 2);

    // Separador
    this.doc.setTextColor(...COLORS.muted);
    this.doc.text('|', this.margin + 22, footerY + 2);

    // Slogan
    this.doc.setTextColor(...COLORS.grayLight);
    this.doc.text('Transformando dados em decisões inteligentes', this.margin + 25, footerY + 2);

    // Número da página
    const pageText = totalPages
      ? `Página ${pageNumber} de ${totalPages}`
      : `Página ${pageNumber}`;
    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(pageText, this.pageWidth - this.margin, footerY + 2, { align: 'right' });

    // Website
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.primary);
    this.doc.setFontSize(6);
    this.doc.text('freelinnk.com', this.pageWidth - this.margin, footerY - 2, { align: 'right' });
  }

  // 🎨 Card de Métrica Individual (Premium Design)
  private drawMetricCard(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: string,
    icon: string,
    accentColor: [number, number, number] = COLORS.primary,
    trend?: { value: number; isPositive: boolean }
  ) {
    // Sombra simulada
    this.doc.setFillColor(230, 230, 230);
    this.doc.roundedRect(x + 1, y + 1, width, height, 3, 3, 'F');

    // Card principal
    this.doc.setFillColor(...COLORS.white);
    this.doc.roundedRect(x, y, width, height, 3, 3, 'F');

    // Borda sutil
    this.doc.setDrawColor(...COLORS.muted);
    this.doc.setLineWidth(0.2);
    this.doc.roundedRect(x, y, width, height, 3, 3, 'S');

    // Linha de destaque no topo
    this.doc.setFillColor(...accentColor);
    this.doc.roundedRect(x, y, width, 2, 3, 3, 'F');
    this.doc.setFillColor(...COLORS.white);
    this.doc.rect(x, y + 1.5, width, 1.5, 'F');

    // Ícone
    this.doc.setFontSize(14);
    this.doc.text(icon, x + 6, y + 13);

    // Label
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text(label, x + 6, y + 20);

    // Valor
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.dark);

    // Ajusta tamanho da fonte se o valor for muito grande
    const maxWidth = width - 12;
    let fontSize = 12;
    this.doc.setFontSize(fontSize);
    while (this.doc.getTextWidth(value) > maxWidth && fontSize > 8) {
      fontSize -= 0.5;
      this.doc.setFontSize(fontSize);
    }
    this.doc.text(value, x + 6, y + 28);

    // Trend indicator se existir
    if (trend) {
      const trendX = x + width - 18;
      const trendY = y + 8;
      const trendColor = trend.isPositive ? COLORS.success : COLORS.danger;

      this.doc.setFillColor(...trendColor);
      this.doc.roundedRect(trendX, trendY, 14, 6, 1, 1, 'F');

      this.doc.setFontSize(5);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...COLORS.white);
      const trendText = `${trend.isPositive ? '↑' : '↓'} ${Math.abs(trend.value)}%`;
      this.doc.text(trendText, trendX + 7, trendY + 4, { align: 'center' });
    }
  }

  // 🎨 Seção com Título Decorado
  private addSectionTitle(title: string, icon: string, y: number, color: [number, number, number] = COLORS.primary): number {
    // Ícone
    this.doc.setFontSize(12);
    this.doc.text(icon, this.margin, y + 1);

    // Título
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...color);
    this.doc.text(title, this.margin + 8, y);

    // Linha decorativa
    const textWidth = this.doc.getTextWidth(title);
    this.doc.setDrawColor(...color);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin + 10 + textWidth, y - 1, this.margin + 10 + textWidth + 15, y - 1);

    // Reset
    this.doc.setTextColor(...COLORS.dark);

    return y + 8;
  }

  // 🎨 Caixa de Destaque/Insight
  private drawInsightBox(x: number, y: number, width: number, text: string, type: 'success' | 'warning' | 'info' = 'info'): number {
    const colors = {
      success: { bg: COLORS.successLight, border: COLORS.success, icon: '💡' },
      warning: { bg: COLORS.dangerLight, border: COLORS.danger, icon: '⚠️' },
      info: { bg: COLORS.tableAlt, border: COLORS.primary, icon: '✨' }
    };

    const config = colors[type];
    const padding = 4;
    const lineHeight = 4;

    // Calcula altura baseada no texto
    this.doc.setFontSize(8);
    const lines = this.doc.splitTextToSize(text, width - padding * 2 - 8);
    const height = lines.length * lineHeight + padding * 2;

    // Fundo
    this.doc.setFillColor(...config.bg);
    this.doc.roundedRect(x, y, width, height, 2, 2, 'F');

    // Borda lateral
    this.doc.setFillColor(...config.border);
    this.doc.roundedRect(x, y, 2, height, 1, 1, 'F');

    // Ícone
    this.doc.setFontSize(10);
    this.doc.text(config.icon, x + 5, y + 6);

    // Texto
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.dark);
    this.doc.text(lines, x + 12, y + padding + 3);

    return y + height + 5;
  }

  // 🎨 Badge de Ranking
  private drawRankBadge(x: number, y: number, rank: number) {
    const colors: { [key: number]: [number, number, number] } = {
      1: [255, 215, 0],   // Gold
      2: [192, 192, 192], // Silver
      3: [205, 127, 50],  // Bronze
    };

    const bgColor = colors[rank] || COLORS.grayLight;

    this.doc.setFillColor(...bgColor);
    this.doc.circle(x + 4, y + 4, 4, 'F');

    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.dark);
    this.doc.text(rank.toString(), x + 4, y + 5.5, { align: 'center' });
  }

  // 🎨 Marca d'água sutil
  private addWatermark() {
    this.doc.setFontSize(60);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(245, 243, 255); // Muito claro
    this.doc.text('F', this.pageWidth - 40, this.pageHeight - 30, {
      align: 'center',
      angle: 15
    });
  }

  // 📊 RELATÓRIO MENSAL - PREMIUM
  public exportMonthlyReport(report: MonthlyReport, sales: Sale[], expenses: Expense[]) {
    const monthName = new Date(report.month + '-01').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    let yPos = this.addHeader(
      '📊 Relatório Mensal',
      `Análise completa de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`
    );

    // Marca d'água
    this.addWatermark();

    // ===== CARDS DE MÉTRICAS PRINCIPAIS =====
    yPos += 5;
    const cardWidth = (this.contentWidth - 12) / 4;
    const cardHeight = 32;

    // Card 1: Receita Total
    this.drawMetricCard(
      this.margin, yPos, cardWidth, cardHeight,
      'Receita Total', this.formatCurrency(report.totalRevenue),
      '💰', COLORS.success
    );

    // Card 2: Gastos Totais
    this.drawMetricCard(
      this.margin + cardWidth + 4, yPos, cardWidth, cardHeight,
      'Gastos Totais', this.formatCurrency(report.totalExpenses),
      '💸', COLORS.danger
    );

    // Card 3: Lucro Líquido
    const profitColor = report.netProfit >= 0 ? COLORS.success : COLORS.danger;
    this.drawMetricCard(
      this.margin + (cardWidth + 4) * 2, yPos, cardWidth, cardHeight,
      'Lucro Líquido', this.formatCurrency(report.netProfit),
      '📈', profitColor
    );

    // Card 4: Margem de Lucro
    this.drawMetricCard(
      this.margin + (cardWidth + 4) * 3, yPos, cardWidth, cardHeight,
      'Margem de Lucro', `${report.profitMargin.toFixed(1)}%`,
      '🎯', COLORS.primary
    );

    yPos += cardHeight + 10;

    // ===== INSIGHT BOX =====
    const insightText = report.netProfit >= 0
      ? `Excelente! Seu negócio teve um lucro de ${this.formatCurrency(report.netProfit)} este mês com margem de ${report.profitMargin.toFixed(1)}%.`
      : `Atenção: Este mês apresentou prejuízo de ${this.formatCurrency(Math.abs(report.netProfit))}. Revise seus gastos.`;

    yPos = this.drawInsightBox(
      this.margin, yPos, this.contentWidth,
      insightText,
      report.netProfit >= 0 ? 'success' : 'warning'
    );

    yPos += 5;

    // ===== TOP PRODUTOS =====
    if (report.topProducts.length > 0) {
      yPos = this.addSectionTitle('Top Produtos do Mês', '⭐', yPos, COLORS.purple);

      const topProductsData = report.topProducts.map((p, index) => [
        `${index + 1}º`,
        p.productName,
        this.formatNumber(p.quantity),
        this.formatCurrency(p.revenue),
        this.formatCurrency(p.profit),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['#', 'Produto', 'Quantidade', 'Receita', 'Lucro']],
        body: topProductsData,
        theme: 'plain',
        headStyles: {
          fillColor: COLORS.tableHeader,
          textColor: COLORS.white,
          fontSize: 9,
          fontStyle: 'bold',
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4,
        },
        alternateRowStyles: {
          fillColor: COLORS.tableAlt,
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 35, halign: 'right' },
          4: { cellWidth: 35, halign: 'right', textColor: COLORS.success },
        },
        margin: { left: this.margin, right: this.margin },
        tableLineColor: COLORS.muted,
        tableLineWidth: 0.1,
      });

      yPos = this.doc.lastAutoTable.finalY + 15;
    }

    // ===== RESUMO DO MÊS - MINI CARDS =====
    yPos = this.addSectionTitle('Resumo de Performance', '📋', yPos, COLORS.indigo);

    const miniCardWidth = (this.contentWidth - 8) / 3;
    const miniCardHeight = 20;

    // Mini Card 1: Total de Vendas
    this.drawMetricCard(
      this.margin, yPos, miniCardWidth, miniCardHeight,
      'Total de Vendas', report.totalSales.toString(),
      '🛒', COLORS.indigo
    );

    // Mini Card 2: Ticket Médio
    const ticketMedio = report.totalSales > 0 ? report.totalRevenue / report.totalSales : 0;
    this.drawMetricCard(
      this.margin + miniCardWidth + 4, yPos, miniCardWidth, miniCardHeight,
      'Ticket Médio', this.formatCurrency(ticketMedio),
      '🎫', COLORS.purple
    );

    // Mini Card 3: Produtos Vendidos
    const totalProductsSold = sales.reduce((sum, s) => sum + s.quantity, 0);
    this.drawMetricCard(
      this.margin + (miniCardWidth + 4) * 2, yPos, miniCardWidth, miniCardHeight,
      'Itens Vendidos', this.formatNumber(totalProductsSold),
      '📦', COLORS.primary
    );

    // ===== NOVA PÁGINA: VENDAS DETALHADAS =====
    this.doc.addPage();
    this.addWatermark();

    yPos = this.addHeader('🛒 Vendas Detalhadas', `${sales.length} vendas em ${monthName}`);
    yPos += 5;

    if (sales.length > 0) {
      // Resumo rápido
      const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
      const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);

      // Mini cards de resumo
      const summaryCardWidth = (this.contentWidth - 4) / 2;

      this.drawMetricCard(
        this.margin, yPos, summaryCardWidth, 22,
        'Receita em Vendas', this.formatCurrency(totalRevenue),
        '💵', COLORS.success
      );

      this.drawMetricCard(
        this.margin + summaryCardWidth + 4, yPos, summaryCardWidth, 22,
        'Lucro em Vendas', this.formatCurrency(totalProfit),
        '📈', COLORS.primary
      );

      yPos += 30;

      const salesData = sales.slice(0, 50).map((s) => [
        this.formatDate(s.date),
        s.productName.length > 25 ? s.productName.substring(0, 25) + '...' : s.productName,
        s.quantity.toString(),
        this.formatCurrency(s.salePrice),
        this.formatCurrency(s.totalRevenue),
        this.formatCurrency(s.profit),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['📅 Data', '📦 Produto', 'Qtd', '💵 Preço', '💰 Total', '📈 Lucro']],
        body: salesData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.success,
          textColor: COLORS.white,
          fontSize: 8,
          fontStyle: 'bold',
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: COLORS.successLight,
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 25, halign: 'right', textColor: COLORS.success },
        },
        margin: { left: this.margin, right: this.margin },
      });

      if (sales.length > 50) {
        yPos = this.doc.lastAutoTable.finalY + 5;
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'italic');
        this.doc.setTextColor(...COLORS.gray);
        this.doc.text(`+ ${sales.length - 50} vendas adicionais não exibidas`, this.margin, yPos);
      }
    } else {
      yPos = this.drawInsightBox(
        this.margin, yPos, this.contentWidth,
        'Nenhuma venda registrada neste mês. Comece a vender para ver seus dados aqui!',
        'info'
      );
    }

    // ===== NOVA PÁGINA: GASTOS =====
    this.doc.addPage();
    this.addWatermark();

    yPos = this.addHeader('💸 Gastos Detalhados', `${expenses.length} gastos em ${monthName}`);
    yPos += 5;

    if (expenses.length > 0) {
      // Total de gastos
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

      this.drawMetricCard(
        this.margin, yPos, this.contentWidth / 2 - 2, 22,
        'Total em Gastos', this.formatCurrency(totalExpenses),
        '💸', COLORS.danger
      );

      // Gasto médio
      const avgExpense = totalExpenses / expenses.length;
      this.drawMetricCard(
        this.margin + this.contentWidth / 2 + 2, yPos, this.contentWidth / 2 - 2, 22,
        'Gasto Médio', this.formatCurrency(avgExpense),
        '📊', COLORS.warning
      );

      yPos += 30;

      const expensesData = expenses.slice(0, 50).map((e) => [
        this.formatDate(e.date),
        e.description.length > 30 ? e.description.substring(0, 30) + '...' : e.description,
        e.categoryName,
        this.formatCurrency(e.amount),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['📅 Data', '📝 Descrição', '🏷️ Categoria', '💸 Valor']],
        body: expensesData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.danger,
          textColor: COLORS.white,
          fontSize: 8,
          fontStyle: 'bold',
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: COLORS.dangerLight,
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 35 },
          3: { cellWidth: 30, halign: 'right', textColor: COLORS.danger, fontStyle: 'bold' },
        },
        margin: { left: this.margin, right: this.margin },
      });
    } else {
      yPos = this.drawInsightBox(
        this.margin, yPos, this.contentWidth,
        'Nenhum gasto registrado neste mês. Registre seus gastos para ter controle total!',
        'info'
      );
    }

    // ===== PÁGINA FINAL: COMPARTILHAMENTO =====
    this.doc.addPage();
    this.addWatermark();

    // Header especial para página de compartilhamento
    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 60, 'F');

    // Padrão decorativo
    this.doc.setFillColor(255, 255, 255, 0.1);
    for (let i = 0; i < 5; i++) {
      this.doc.circle(this.pageWidth - 20 - i * 15, 30, 25 + i * 5, 'F');
    }

    // Logo grande
    this.drawFreelinnkLogo(this.pageWidth / 2 - 15, 15, 30);

    // Título
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.white);
    this.doc.text('Freelinnk', this.pageWidth / 2, 55, { align: 'center' });

    yPos = 80;

    // Mensagem de compartilhamento
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.dark);
    this.doc.text('📊 Meu Relatório de Performance', this.pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;

    // Card de destaque com resultados
    const highlightCardX = this.margin + 20;
    const highlightCardWidth = this.contentWidth - 40;
    const highlightCardHeight = 50;

    // Sombra
    this.doc.setFillColor(220, 220, 220);
    this.doc.roundedRect(highlightCardX + 2, yPos + 2, highlightCardWidth, highlightCardHeight, 5, 5, 'F');

    // Card
    this.doc.setFillColor(...COLORS.white);
    this.doc.roundedRect(highlightCardX, yPos, highlightCardWidth, highlightCardHeight, 5, 5, 'F');

    // Borda gradiente
    this.doc.setDrawColor(...COLORS.primary);
    this.doc.setLineWidth(1.5);
    this.doc.roundedRect(highlightCardX, yPos, highlightCardWidth, highlightCardHeight, 5, 5, 'S');

    // Conteúdo do card
    const cardCenterX = highlightCardX + highlightCardWidth / 2;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text(`Resultados de ${monthName}`, cardCenterX, yPos + 12, { align: 'center' });

    // Valor em destaque
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...(report.netProfit >= 0 ? COLORS.success : COLORS.danger));
    this.doc.text(this.formatCurrency(report.netProfit), cardCenterX, yPos + 30, { align: 'center' });

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text(`de lucro líquido com margem de ${report.profitMargin.toFixed(1)}%`, cardCenterX, yPos + 40, { align: 'center' });

    yPos += highlightCardHeight + 20;

    // Estatísticas rápidas
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.dark);
    this.doc.text('✨ Destaques do Mês', this.pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;

    const stats = [
      { icon: '🛒', label: 'Vendas realizadas', value: report.totalSales.toString() },
      { icon: '💰', label: 'Receita total', value: this.formatCurrency(report.totalRevenue) },
      { icon: '📦', label: 'Produtos mais vendido', value: report.topProducts[0]?.productName || 'N/A' },
    ];

    stats.forEach((stat, index) => {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.gray);
      this.doc.text(`${stat.icon} ${stat.label}:`, this.margin + 30, yPos + index * 8);

      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...COLORS.dark);
      this.doc.text(stat.value, this.pageWidth - this.margin - 30, yPos + index * 8, { align: 'right' });
    });

    yPos += 35;

    // CTA de compartilhamento
    const ctaY = yPos;
    const ctaHeight = 25;

    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(this.margin + 30, ctaY, this.contentWidth - 60, ctaHeight, 3, 3, 'F');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.white);
    this.doc.text('🚀 Gerencie seu negócio com Freelinnk', this.pageWidth / 2, ctaY + 10, { align: 'center' });

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('freelinnk.com | Gestão inteligente para seu negócio', this.pageWidth / 2, ctaY + 18, { align: 'center' });

    yPos += ctaHeight + 20;

    // QR Code placeholder / Redes sociais
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text('Compartilhe seus resultados nas redes sociais! 📱', this.pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;

    // Ícones de redes sociais (simulados)
    const socialIcons = ['📘', '🐦', '💼', '📸'];
    const socialStartX = this.pageWidth / 2 - (socialIcons.length * 12) / 2;

    socialIcons.forEach((icon, index) => {
      this.doc.setFontSize(14);
      this.doc.text(icon, socialStartX + index * 12, yPos + 5);
    });

    // ===== ADICIONAR FOOTERS EM TODAS AS PÁGINAS =====
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter(i, pageCount);
    }

    // Salvar PDF
    const filename = `freelinnk_relatorio_${report.month}.pdf`;
    this.doc.save(filename);
  }

  // 📦 RELATÓRIO DE PRODUTOS - PREMIUM
  public exportProductsReport(products: Product[]) {
    let yPos = this.addHeader(
      '📦 Catálogo de Produtos',
      `${products.length} produtos cadastrados`
    );

    this.addWatermark();
    yPos += 5;

    if (products.length === 0) {
      yPos = this.drawInsightBox(
        this.margin, yPos, this.contentWidth,
        'Nenhum produto cadastrado ainda. Adicione seus produtos para começar a vender!',
        'info'
      );

      const pageCount = this.doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        this.doc.setPage(i);
        this.addFooter(i, pageCount);
      }

      this.doc.save('freelinnk_produtos.pdf');
      return;
    }

    // Estatísticas gerais
    const totalValue = products.reduce((sum, p) => sum + (p.stock || 0) * p.costPrice, 0);
    const avgMargin = products.reduce((sum, p) => {
      const margin = p.salePrice > 0 ? ((p.salePrice - p.costPrice) / p.salePrice) * 100 : 0;
      return sum + margin;
    }, 0) / products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    // Cards de estatísticas
    const cardWidth = (this.contentWidth - 8) / 3;
    const cardHeight = 25;

    this.drawMetricCard(
      this.margin, yPos, cardWidth, cardHeight,
      'Valor em Estoque', this.formatCurrency(totalValue),
      '💰', COLORS.success
    );

    this.drawMetricCard(
      this.margin + cardWidth + 4, yPos, cardWidth, cardHeight,
      'Margem Média', `${avgMargin.toFixed(1)}%`,
      '📈', COLORS.primary
    );

    this.drawMetricCard(
      this.margin + (cardWidth + 4) * 2, yPos, cardWidth, cardHeight,
      'Itens em Estoque', this.formatNumber(totalStock),
      '📦', COLORS.indigo
    );

    yPos += cardHeight + 15;

    // Tabela de produtos
    const productsData = products.map((p, index) => {
      const profit = p.salePrice - p.costPrice;
      const margin = p.salePrice > 0 ? ((profit / p.salePrice) * 100).toFixed(1) : '0.0';
      return [
        (index + 1).toString(),
        p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        p.sku || '-',
        p.category || '-',
        this.formatCurrency(p.costPrice),
        this.formatCurrency(p.salePrice),
        (p.stock || 0).toString(),
        `${margin}%`,
      ];
    });

    autoTable(this.doc, {
      startY: yPos,
      head: [['#', 'Produto', 'SKU', 'Categoria', 'Custo', 'Venda', 'Est.', 'Margem']],
      body: productsData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.tableHeader,
        textColor: COLORS.white,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: COLORS.tableAlt,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 18, halign: 'center', textColor: COLORS.success },
      },
      margin: { left: this.margin, right: this.margin },
    });

    // Footers
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter(i, pageCount);
    }

    this.doc.save('freelinnk_produtos.pdf');
  }

  // 🛒 RELATÓRIO DE VENDAS - PREMIUM
  public exportSalesReport(sales: Sale[], month: string) {
    const monthName = new Date(month + '-01').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    let yPos = this.addHeader(
      '🛒 Relatório de Vendas',
      `${sales.length} vendas em ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`
    );

    this.addWatermark();
    yPos += 5;

    // Resumo
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
    const totalItems = sales.reduce((sum, s) => sum + s.quantity, 0);
    const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

    // Cards de métricas
    const cardWidth = (this.contentWidth - 12) / 4;
    const cardHeight = 28;

    this.drawMetricCard(
      this.margin, yPos, cardWidth, cardHeight,
      'Receita Total', this.formatCurrency(totalRevenue),
      '💰', COLORS.success
    );

    this.drawMetricCard(
      this.margin + cardWidth + 4, yPos, cardWidth, cardHeight,
      'Lucro Total', this.formatCurrency(totalProfit),
      '📈', COLORS.primary
    );

    this.drawMetricCard(
      this.margin + (cardWidth + 4) * 2, yPos, cardWidth, cardHeight,
      'Itens Vendidos', this.formatNumber(totalItems),
      '📦', COLORS.indigo
    );

    this.drawMetricCard(
      this.margin + (cardWidth + 4) * 3, yPos, cardWidth, cardHeight,
      'Ticket Médio', this.formatCurrency(avgTicket),
      '🎫', COLORS.purple
    );

    yPos += cardHeight + 10;

    // Insight
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    yPos = this.drawInsightBox(
      this.margin, yPos, this.contentWidth,
      `Sua margem de lucro neste período foi de ${profitMargin.toFixed(1)}%. ${profitMargin >= 20 ? 'Excelente resultado! 🎉' : 'Considere revisar seus preços para melhorar a margem.'}`,
      profitMargin >= 20 ? 'success' : 'warning'
    );

    yPos += 5;

    if (sales.length > 0) {
      yPos = this.addSectionTitle('Detalhamento das Vendas', '📋', yPos, COLORS.success);

      const salesData = sales.slice(0, 100).map((s, index) => [
        (index + 1).toString(),
        this.formatDate(s.date),
        s.productName.length > 22 ? s.productName.substring(0, 22) + '...' : s.productName,
        s.quantity.toString(),
        this.formatCurrency(s.salePrice),
        this.formatCurrency(s.totalRevenue),
        this.formatCurrency(s.profit),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['#', '📅 Data', '📦 Produto', 'Qtd', '💵 Preço', '💰 Total', '📈 Lucro']],
        body: salesData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.success,
          textColor: COLORS.white,
          fontSize: 8,
          fontStyle: 'bold',
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: COLORS.successLight,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 22 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 12, halign: 'center' },
          4: { cellWidth: 24, halign: 'right' },
          5: { cellWidth: 24, halign: 'right' },
          6: { cellWidth: 24, halign: 'right', textColor: COLORS.success },
        },
        margin: { left: this.margin, right: this.margin },
      });
    } else {
      yPos = this.drawInsightBox(
        this.margin, yPos, this.contentWidth,
        'Nenhuma venda registrada neste período. Comece a vender para ver seus dados aqui!',
        'info'
      );
    }

    // Footers
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter(i, pageCount);
    }

    this.doc.save(`freelinnk_vendas_${month}.pdf`);
  }
}