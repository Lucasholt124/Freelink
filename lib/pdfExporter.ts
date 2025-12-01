import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Adiciona os tipos estendidos de autoTable
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

const COLORS = {
  primary: [124, 58, 237] as [number, number, number],
  primaryDark: [109, 40, 217] as [number, number, number],
  primaryLight: [167, 139, 250] as [number, number, number],
  indigo: [99, 102, 241] as [number, number, number],
  purple: [147, 51, 234] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],
  successLight: [209, 250, 229] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  dangerLight: [254, 226, 226] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  dark: [17, 24, 39] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  grayLight: [156, 163, 175] as [number, number, number],
  muted: [209, 213, 219] as [number, number, number],
  background: [249, 250, 251] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  tableHeader: [124, 58, 237] as [number, number, number],
  tableAlt: [245, 243, 255] as [number, number, number],
};

export class PDFExporter {
  private doc: jsPDFWithPlugin;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private contentWidth: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    }) as jsPDFWithPlugin;

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
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch {
      return dateStr;
    }
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  private drawFreelinnkLogo(x: number, y: number, size: number = 12) {
    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(x, y, size, size, 2, 2, 'F');
    this.doc.setFillColor(...COLORS.primaryDark);
    this.doc.roundedRect(x + 0.5, y + size - 2, size - 1, 1.5, 0.5, 0.5, 'F');
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(size * 0.7);
    this.doc.setFont('helvetica', 'bold');

    const textWidth = this.doc.getTextWidth('F');
    const textOffset = (size - textWidth) / 2;
    this.doc.text('F', x + textOffset, y + size * 0.72);
    this.doc.setTextColor(...COLORS.dark);
  }

  private addHeader(title: string, subtitle?: string) {
    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 3, 'F');
    this.doc.setFillColor(...COLORS.indigo);
    this.doc.rect(0, 3, this.pageWidth, 1, 'F');

    const headerY = 12;

    this.drawFreelinnkLogo(this.margin, headerY, 14);

    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('Freelinnk', this.margin + 18, headerY + 10);

    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text('Gestao Inteligente para seu Negocio', this.margin + 18, headerY + 15);

    const badgeX = this.margin + 65;
    const badgeY = headerY + 5;
    this.doc.setFillColor(...COLORS.success);
    this.doc.roundedRect(badgeX, badgeY, 12, 5, 1, 1, 'F');
    this.doc.setFontSize(6);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.white);
    this.doc.text('PRO', badgeX + 6, badgeY + 3.5, { align: 'center' });

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.grayLight);
    this.doc.text(`${dateStr} - ${timeStr}`, this.pageWidth - this.margin, headerY + 8, { align: 'right' });

    const titleY = headerY + 28;

    this.doc.setDrawColor(...COLORS.muted);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, titleY - 5, this.pageWidth - this.margin, titleY - 5);

    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.dark);
    this.doc.text(title, this.margin, titleY + 5);

    if (subtitle) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.gray);
      this.doc.text(subtitle, this.margin, titleY + 13);
    }

    const lineY = subtitle ? titleY + 20 : titleY + 12;

    this.doc.setDrawColor(...COLORS.primary);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, lineY, this.margin + 50, lineY);

    this.doc.setDrawColor(...COLORS.muted);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin + 52, lineY, this.pageWidth - this.margin, lineY);

    return lineY + 10;
  }

  private addFooter(pageNumber: number, totalPages?: number) {
    const footerY = this.pageHeight - 12;

    this.doc.setDrawColor(...COLORS.muted);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);

    this.drawFreelinnkLogo(this.margin, footerY - 2, 6);

    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.grayLight);
    this.doc.text('Freelinnk', this.margin + 8, footerY + 2);

    this.doc.setTextColor(...COLORS.muted);
    this.doc.text('|', this.margin + 22, footerY + 2);

    this.doc.setTextColor(...COLORS.grayLight);
    this.doc.text('Transformando dados em decisoes inteligentes', this.margin + 25, footerY + 2);

    const pageText = totalPages
      ? `Pagina ${pageNumber} de ${totalPages}`
      : `Pagina ${pageNumber}`;
    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(pageText, this.pageWidth - this.margin, footerY + 2, { align: 'right' });

    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.primary);
    this.doc.setFontSize(6);
    this.doc.text('freelinnk.com', this.pageWidth - this.margin, footerY - 2, { align: 'right' });
  }

  // 🎨 Card sem Emojis (Usa Círculos coloridos)
  private drawMetricCard(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: string,
    // Icon parameter removed to prevent errors
    accentColor: [number, number, number] = COLORS.primary,
    trend?: { value: number; isPositive: boolean }
  ) {
    this.doc.setFillColor(230, 230, 230);
    this.doc.roundedRect(x + 1, y + 1, width, height, 3, 3, 'F');

    this.doc.setFillColor(...COLORS.white);
    this.doc.roundedRect(x, y, width, height, 3, 3, 'F');

    this.doc.setDrawColor(...COLORS.muted);
    this.doc.setLineWidth(0.2);
    this.doc.roundedRect(x, y, width, height, 3, 3, 'S');

    this.doc.setFillColor(...accentColor);
    this.doc.roundedRect(x, y, width, 2, 3, 3, 'F');
    this.doc.setFillColor(...COLORS.white);
    this.doc.rect(x, y + 1.5, width, 1.5, 'F');

    // Desenha um círculo decorativo no lugar do emoji
    this.doc.setFillColor(...accentColor);
    this.doc.circle(x + 10, y + 12, 3, 'F');

    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text(label, x + 6, y + 20);

    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.dark);

    const maxWidth = width - 12;
    let fontSize = 12;
    this.doc.setFontSize(fontSize);

    while (this.doc.getTextWidth(value) > maxWidth && fontSize > 7) {
      fontSize -= 0.5;
      this.doc.setFontSize(fontSize);
    }
    this.doc.text(value, x + 6, y + 28);

    if (trend) {
      const trendX = x + width - 18;
      const trendY = y + 8;
      const trendColor = trend.isPositive ? COLORS.success : COLORS.danger;

      this.doc.setFillColor(...trendColor);
      this.doc.roundedRect(trendX, trendY, 14, 6, 1, 1, 'F');

      this.doc.setFontSize(5);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...COLORS.white);
      // Seta simples usando caracteres ASCII
      const symbol = trend.isPositive ? '+' : '-';
      const trendText = `${symbol} ${Math.abs(trend.value)}%`;
      this.doc.text(trendText, trendX + 7, trendY + 4, { align: 'center' });
    }
  }

  private addSectionTitle(title: string, y: number, color: [number, number, number] = COLORS.primary): number {
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...color);
    this.doc.text(title, this.margin, y);

    const textWidth = this.doc.getTextWidth(title);
    this.doc.setDrawColor(...color);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin + textWidth + 2, y - 1, this.margin + textWidth + 17, y - 1);

    this.doc.setTextColor(...COLORS.dark);
    return y + 8;
  }

  private drawInsightBox(x: number, y: number, width: number, text: string, type: 'success' | 'warning' | 'info' = 'info'): number {
    const colors = {
      success: { bg: COLORS.successLight, border: COLORS.success },
      warning: { bg: COLORS.dangerLight, border: COLORS.danger },
      info: { bg: COLORS.tableAlt, border: COLORS.primary }
    };

    const config = colors[type];
    const padding = 4;
    const lineHeight = 4;

    this.doc.setFontSize(8);
    const lines = this.doc.splitTextToSize(text, width - padding * 2 - 15);
    const height = Math.max(lines.length * lineHeight + padding * 2, 12);

    this.doc.setFillColor(...config.bg);
    this.doc.roundedRect(x, y, width, height, 2, 2, 'F');

    this.doc.setFillColor(...config.border);
    this.doc.roundedRect(x, y, 2, height, 1, 1, 'F');

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.dark);
    this.doc.text(lines, x + 8, y + padding + 3);

    return y + height + 5;
  }

  private addWatermark() {
    this.doc.setFontSize(60);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(245, 243, 255);
    this.doc.text('F', this.pageWidth - 40, this.pageHeight - 30, {
      align: 'center',
      angle: 15
    });
  }

 public exportMonthlyReport(report: MonthlyReport, sales: Sale[], expenses: Expense[]) {
    // ✅ CORREÇÃO 3: Adicionado 'T12:00:00' para forçar meio-dia e evitar fuso horário voltando o dia
    const monthName = new Date(report.month + '-01T12:00:00').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    let yPos = this.addHeader(
      'Relatorio Mensal',
      `Analise completa de ${monthName}`
    );

    this.addWatermark();
    yPos += 5;

    const gap = 4;
    const cardsPerRow = 4;
    const cardWidth = (this.contentWidth - (gap * (cardsPerRow - 1))) / cardsPerRow;
    const cardHeight = 32;

    this.drawMetricCard(
      this.margin, yPos, cardWidth, cardHeight,
      'Receita Total', this.formatCurrency(report.totalRevenue),
      COLORS.success
    );

    this.drawMetricCard(
      this.margin + cardWidth + gap, yPos, cardWidth, cardHeight,
      'Gastos Totais', this.formatCurrency(report.totalExpenses),
      COLORS.danger
    );

    const profitColor = report.netProfit >= 0 ? COLORS.success : COLORS.danger;
    this.drawMetricCard(
      this.margin + (cardWidth + gap) * 2, yPos, cardWidth, cardHeight,
      'Lucro Liquido', this.formatCurrency(report.netProfit),
      profitColor
    );

    this.drawMetricCard(
      this.margin + (cardWidth + gap) * 3, yPos, cardWidth, cardHeight,
      'Margem de Lucro', `${report.profitMargin.toFixed(1)}%`,
      COLORS.primary
    );

    yPos += cardHeight + 10;

    const insightText = report.netProfit >= 0
      ? `Excelente! Seu negocio teve um lucro de ${this.formatCurrency(report.netProfit)} este mes com margem de ${report.profitMargin.toFixed(1)}%.`
      : `Atencao: Este mes apresentou prejuizo de ${this.formatCurrency(Math.abs(report.netProfit))}. Revise seus gastos.`;

    yPos = this.drawInsightBox(
      this.margin, yPos, this.contentWidth,
      insightText,
      report.netProfit >= 0 ? 'success' : 'warning'
    );

    yPos += 5;

    if (report.topProducts.length > 0) {
      yPos = this.addSectionTitle('Top Produtos do Mes', yPos, COLORS.purple);

      const topProductsData = report.topProducts.map((p, index) => [
        `${index + 1}`,
        p.productName,
        this.formatNumber(p.quantity),
        this.formatCurrency(p.revenue),
        this.formatCurrency(p.profit),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['#', 'Produto', 'Qtd', 'Receita', 'Lucro']],
        body: topProductsData,
        theme: 'plain',
        headStyles: {
          fillColor: COLORS.tableHeader,
          textColor: COLORS.white,
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 9,
          valign: 'middle',
          cellPadding: 3,
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

    yPos = this.addSectionTitle('Resumo de Performance', yPos, COLORS.indigo);

    const miniCardsPerRow = 3;
    const miniCardWidth = (this.contentWidth - (gap * (miniCardsPerRow - 1))) / miniCardsPerRow;
    const miniCardHeight = 20;

    this.drawMetricCard(
      this.margin, yPos, miniCardWidth, miniCardHeight,
      'Total de Vendas', report.totalSales.toString(),
      COLORS.indigo
    );

    const ticketMedio = report.totalSales > 0 ? report.totalRevenue / report.totalSales : 0;
    this.drawMetricCard(
      this.margin + miniCardWidth + gap, yPos, miniCardWidth, miniCardHeight,
      'Ticket Medio', this.formatCurrency(ticketMedio),
      COLORS.purple
    );

    const totalProductsSold = sales.reduce((sum, s) => sum + s.quantity, 0);
    this.drawMetricCard(
      this.margin + (miniCardWidth + gap) * 2, yPos, miniCardWidth, miniCardHeight,
      'Itens Vendidos', this.formatNumber(totalProductsSold),
      COLORS.primary
    );

    this.doc.addPage();
    this.addWatermark();

    yPos = this.addHeader('Vendas Detalhadas', `${sales.length} vendas em ${monthName}`);
    yPos += 5;

    if (sales.length > 0) {
      const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
      const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);

      const summaryCardsPerRow = 2;
      const summaryCardWidth = (this.contentWidth - (gap * (summaryCardsPerRow - 1))) / summaryCardsPerRow;

      this.drawMetricCard(
        this.margin, yPos, summaryCardWidth, 22,
        'Receita em Vendas', this.formatCurrency(totalRevenue),
        COLORS.success
      );

      this.drawMetricCard(
        this.margin + summaryCardWidth + gap, yPos, summaryCardWidth, 22,
        'Lucro em Vendas', this.formatCurrency(totalProfit),
        COLORS.primary
      );

      yPos += 30;

      const salesData = sales.slice(0, 50).map((s) => [
        this.formatDate(s.date),
        s.productName.length > 30 ? s.productName.substring(0, 30) + '...' : s.productName,
        s.quantity.toString(),
        this.formatCurrency(s.salePrice),
        this.formatCurrency(s.totalRevenue),
        this.formatCurrency(s.profit),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['Data', 'Produto', 'Qtd', 'Preco', 'Total', 'Lucro']],
        body: salesData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.success,
          textColor: COLORS.white,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 8,
          valign: 'middle',
          cellPadding: 2,
        },
        alternateRowStyles: {
          fillColor: COLORS.successLight,
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 12, halign: 'center' },
          3: { cellWidth: 22, halign: 'right' },
          4: { cellWidth: 22, halign: 'right' },
          5: { cellWidth: 22, halign: 'right', textColor: COLORS.success, fontStyle: 'bold' },
        },
        margin: { left: this.margin, right: this.margin },
      });

      if (sales.length > 50) {
        yPos = this.doc.lastAutoTable.finalY + 5;
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'italic');
        this.doc.setTextColor(...COLORS.gray);
        this.doc.text(`+ ${sales.length - 50} vendas adicionais nao exibidas`, this.margin, yPos);
      }
    } else {
      yPos = this.drawInsightBox(
        this.margin, yPos, this.contentWidth,
        'Nenhuma venda registrada neste mes.',
        'info'
      );
    }

    this.doc.addPage();
    this.addWatermark();

    yPos = this.addHeader('Gastos Detalhados', `${expenses.length} gastos em ${monthName}`);
    yPos += 5;

    if (expenses.length > 0) {
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const summaryCardsPerRow = 2;
      const summaryCardWidth = (this.contentWidth - (gap * (summaryCardsPerRow - 1))) / summaryCardsPerRow;

      this.drawMetricCard(
        this.margin, yPos, summaryCardWidth, 22,
        'Total em Gastos', this.formatCurrency(totalExpenses),
        COLORS.danger
      );

      const avgExpense = totalExpenses / expenses.length;
      this.drawMetricCard(
        this.margin + summaryCardWidth + gap, yPos, summaryCardWidth, 22,
        'Gasto Medio', this.formatCurrency(avgExpense),
        COLORS.warning
      );

      yPos += 30;

      const expensesData = expenses.slice(0, 50).map((e) => [
        this.formatDate(e.date),
        e.description,
        e.categoryName,
        this.formatCurrency(e.amount),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['Data', 'Descricao', 'Categoria', 'Valor']],
        body: expensesData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.danger,
          textColor: COLORS.white,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
        },
        bodyStyles: {
          fontSize: 8,
          valign: 'middle',
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: COLORS.dangerLight,
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 35, halign: 'center' },
          3: { cellWidth: 25, halign: 'right', textColor: COLORS.danger, fontStyle: 'bold' },
        },
        margin: { left: this.margin, right: this.margin },
      });
    } else {
      yPos = this.drawInsightBox(
        this.margin, yPos, this.contentWidth,
        'Nenhum gasto registrado neste mes.',
        'info'
      );
    }

    this.doc.addPage();
    this.addWatermark();

    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 60, 'F');

    this.doc.setFillColor(255, 255, 255, 0.1);
    for (let i = 0; i < 5; i++) {
      this.doc.circle(this.pageWidth - 20 - i * 15, 30, 25 + i * 5, 'F');
    }

    const logoSize = 30;
    this.drawFreelinnkLogo((this.pageWidth - logoSize) / 2, 15, logoSize);

    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.white);
    this.doc.text('Freelinnk', this.pageWidth / 2, 55, { align: 'center' });

    yPos = 80;

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.dark);
    this.doc.text('Meu Relatorio de Performance', this.pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;

    const highlightCardWidth = this.contentWidth * 0.8;
    const highlightCardX = (this.pageWidth - highlightCardWidth) / 2;
    const highlightCardHeight = 50;

    this.doc.setFillColor(220, 220, 220);
    this.doc.roundedRect(highlightCardX + 2, yPos + 2, highlightCardWidth, highlightCardHeight, 5, 5, 'F');

    this.doc.setFillColor(...COLORS.white);
    this.doc.roundedRect(highlightCardX, yPos, highlightCardWidth, highlightCardHeight, 5, 5, 'F');

    this.doc.setDrawColor(...COLORS.primary);
    this.doc.setLineWidth(1.5);
    this.doc.roundedRect(highlightCardX, yPos, highlightCardWidth, highlightCardHeight, 5, 5, 'S');

    const cardCenterX = this.pageWidth / 2;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text(`Resultados de ${monthName}`, cardCenterX, yPos + 12, { align: 'center' });

    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...(report.netProfit >= 0 ? COLORS.success : COLORS.danger));
    this.doc.text(this.formatCurrency(report.netProfit), cardCenterX, yPos + 30, { align: 'center' });

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.gray);
    this.doc.text(`de lucro liquido com margem de ${report.profitMargin.toFixed(1)}%`, cardCenterX, yPos + 40, { align: 'center' });

    yPos += highlightCardHeight + 20;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.dark);
    this.doc.text('Destaques do Mes', this.pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;

    const stats = [
      { label: 'Vendas realizadas', value: report.totalSales.toString() },
      { label: 'Receita total', value: this.formatCurrency(report.totalRevenue) },
      { label: 'Produto mais vendido', value: report.topProducts[0]?.productName || 'N/A' },
    ];

    stats.forEach((stat, index) => {
      const lineY = yPos + index * 9;

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.gray);
      this.doc.text(`- ${stat.label}:`, highlightCardX + 10, lineY);

      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...COLORS.dark);
      this.doc.text(stat.value, highlightCardX + highlightCardWidth - 10, lineY, { align: 'right' });
    });

    yPos += 35;

    const ctaHeight = 25;
    const ctaWidth = highlightCardWidth;
    const ctaX = highlightCardX;

    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(ctaX, yPos, ctaWidth, ctaHeight, 3, 3, 'F');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.white);
    this.doc.text('Gerencie seu negocio com Freelinnk', this.pageWidth / 2, yPos + 10, { align: 'center' });

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('freelinnk.com | Gestao inteligente para seu negocio', this.pageWidth / 2, yPos + 18, { align: 'center' });

    yPos += ctaHeight + 20;

    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter(i, pageCount);
    }

    const filename = `freelinnk_relatorio_${report.month}.pdf`;
    this.doc.save(filename);
  }

  public exportProductsReport(products: Product[]) {
    let yPos = this.addHeader(
      'Catalogo de Produtos',
      `${products.length} produtos cadastrados`
    );

    this.addWatermark();
    yPos += 5;

    if (products.length === 0) {
      yPos = this.drawInsightBox(
        this.margin, yPos, this.contentWidth,
        'Nenhum produto cadastrado ainda.',
        'info'
      );
      this.doc.save('freelinnk_produtos.pdf');
      return;
    }

    const totalValue = products.reduce((sum, p) => sum + (p.stock || 0) * p.costPrice, 0);
    const avgMargin = products.reduce((sum, p) => {
      const margin = p.salePrice > 0 ? ((p.salePrice - p.costPrice) / p.salePrice) * 100 : 0;
      return sum + margin;
    }, 0) / (products.length || 1);
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    const gap = 4;
    const cardsPerRow = 3;
    const cardWidth = (this.contentWidth - (gap * (cardsPerRow - 1))) / cardsPerRow;
    const cardHeight = 25;

    this.drawMetricCard(
      this.margin, yPos, cardWidth, cardHeight,
      'Valor em Estoque', this.formatCurrency(totalValue),
      COLORS.success
    );

    this.drawMetricCard(
      this.margin + cardWidth + gap, yPos, cardWidth, cardHeight,
      'Margem Media', `${avgMargin.toFixed(1)}%`,
      COLORS.primary
    );

    this.drawMetricCard(
      this.margin + (cardWidth + gap) * 2, yPos, cardWidth, cardHeight,
      'Itens em Estoque', this.formatNumber(totalStock),
      COLORS.indigo
    );

    yPos += cardHeight + 15;

    const productsData = products.map((p, index) => {
      const profit = p.salePrice - p.costPrice;
      const margin = p.salePrice > 0 ? ((profit / p.salePrice) * 100).toFixed(1) : '0.0';
      return [
        (index + 1).toString(),
        p.name,
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
        halign: 'center',
        valign: 'middle',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 7,
        valign: 'middle',
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: COLORS.tableAlt,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'left' },
        3: { cellWidth: 25, halign: 'left' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 18, halign: 'center', textColor: COLORS.success, fontStyle: 'bold' },
      },
      margin: { left: this.margin, right: this.margin },
    });

    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter(i, pageCount);
    }

    this.doc.save('freelinnk_produtos.pdf');
  }

 public exportSalesReport(sales: Sale[], month: string) {
    // ✅ MESMA CORREÇÃO AQUI
    const monthName = new Date(month + '-01T12:00:00').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    let yPos = this.addHeader(
      'Relatorio de Vendas',
      `${sales.length} vendas em ${monthName}`
    );
    this.addWatermark();
    yPos += 5;

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
    const totalItems = sales.reduce((sum, s) => sum + s.quantity, 0);
    const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

    const gap = 4;
    const cardsPerRow = 4;
    const cardWidth = (this.contentWidth - (gap * (cardsPerRow - 1))) / cardsPerRow;
    const cardHeight = 28;

    this.drawMetricCard(
      this.margin, yPos, cardWidth, cardHeight,
      'Receita Total', this.formatCurrency(totalRevenue),
      COLORS.success
    );

    this.drawMetricCard(
      this.margin + cardWidth + gap, yPos, cardWidth, cardHeight,
      'Lucro Total', this.formatCurrency(totalProfit),
      COLORS.primary
    );

    this.drawMetricCard(
      this.margin + (cardWidth + gap) * 2, yPos, cardWidth, cardHeight,
      'Itens Vendidos', this.formatNumber(totalItems),
      COLORS.indigo
    );

    this.drawMetricCard(
      this.margin + (cardWidth + gap) * 3, yPos, cardWidth, cardHeight,
      'Ticket Medio', this.formatCurrency(avgTicket),
      COLORS.purple
    );

    yPos += cardHeight + 10;

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    yPos = this.drawInsightBox(
      this.margin, yPos, this.contentWidth,
      `Sua margem de lucro neste periodo foi de ${profitMargin.toFixed(1)}%.`,
      profitMargin >= 20 ? 'success' : 'warning'
    );

    yPos += 5;

    if (sales.length > 0) {
      yPos = this.addSectionTitle('Detalhamento das Vendas', yPos, COLORS.success);

      const salesData = sales.slice(0, 100).map((s, index) => [
        (index + 1).toString(),
        this.formatDate(s.date),
        s.productName,
        s.quantity.toString(),
        this.formatCurrency(s.salePrice),
        this.formatCurrency(s.totalRevenue),
        this.formatCurrency(s.profit),
      ]);

      autoTable(this.doc, {
        startY: yPos,
        head: [['#', 'Data', 'Produto', 'Qtd', 'Preco', 'Total', 'Lucro']],
        body: salesData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.success,
          textColor: COLORS.white,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 8,
          valign: 'middle',
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: COLORS.successLight,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 12, halign: 'center' },
          4: { cellWidth: 22, halign: 'right' },
          5: { cellWidth: 22, halign: 'right' },
          6: { cellWidth: 22, halign: 'right', textColor: COLORS.success, fontStyle: 'bold' },
        },
        margin: { left: this.margin, right: this.margin },
      });
    } else {
      yPos = this.drawInsightBox(
        this.margin, yPos, this.contentWidth,
        'Nenhuma venda registrada neste periodo.',
        'info'
      );
    }

    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter(i, pageCount);
    }

    this.doc.save(`freelinnk_vendas_${month}.pdf`);
  }
}