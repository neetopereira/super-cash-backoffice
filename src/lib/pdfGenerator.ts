import jsPDF from 'jspdf';
import { PaymentGuide } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function generatePDF(guide: PaymentGuide) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkColor = [10, 10, 12] as [number, number, number];
  const goldColor = [184, 163, 105] as [number, number, number];
  const grayColor = [120, 120, 120] as [number, number, number];

  // Header background
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Logo / Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SUPER CASH', margin, 25);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...goldColor);
  doc.text('PRIVATE CREDIT', margin, 33);

  // Document type
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('GUIA DE PAGAMENTO', pageWidth - margin, 25, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`Nº ${guide.id}`, pageWidth - margin, 33, { align: 'right' });

  // Gold accent line
  doc.setFillColor(...goldColor);
  doc.rect(0, 50, pageWidth, 1.5, 'F');

  let y = 65;

  // Issue date
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`Emitido em: ${format(new Date(guide.createdAt), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}`, margin, y);
  y += 15;

  // Client section
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, contentWidth, 35, 'F');
  
  y += 8;
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text('BENEFICIÁRIO', margin + 5, y);
  
  y += 7;
  doc.setFontSize(14);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(guide.clientName.toUpperCase(), margin + 5, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`CPF: ${guide.clientCpf}`, margin + 5, y);

  y += 20;

  // Payment value section
  doc.setFillColor(...darkColor);
  doc.rect(margin, y, contentWidth, 40, 'F');

  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(...goldColor);
  doc.text('VALOR DO PAGAMENTO', margin + 10, y);

  y += 15;
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`R$ ${guide.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin + 10, y);

  y += 25;

  // PIX section
  doc.setFillColor(250, 248, 240);
  doc.rect(margin, y, contentWidth, 45, 'F');

  // Gold border
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, contentWidth, 45, 'S');

  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(...goldColor);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO PIX COPIA E COLA', margin + 10, y);

  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'normal');
  
  // Split PIX code into lines if too long
  const pixLines = doc.splitTextToSize(guide.pixCode, contentWidth - 20);
  doc.text(pixLines, margin + 10, y);

  y += 30 + (pixLines.length - 1) * 5;

  // Instructions
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('INSTRUÇÕES:', margin, y);
  y += 6;
  
  const instructions = [
    '1. Acesse o aplicativo do seu banco',
    '2. Selecione a opção PIX → Pagar com código',
    '3. Cole o código acima e confirme o pagamento',
    '4. Guarde o comprovante para registro',
  ];

  instructions.forEach((instruction) => {
    doc.text(instruction, margin, y);
    y += 5;
  });

  y += 10;

  // Legal notice
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  const legalText = 'Este documento é uma guia de pagamento emitida pelo sistema Super Cash. O pagamento via PIX será confirmado automaticamente após a compensação bancária. Em caso de dúvidas, entre em contato com nosso suporte.';
  const legalLines = doc.splitTextToSize(legalText, contentWidth);
  doc.text(legalLines, margin, y);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFillColor(...darkColor);
  doc.rect(0, footerY - 5, pageWidth, 20, 'F');

  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text('Super Cash Ltda. — Documento de uso interno', margin, footerY + 3);
  doc.text(`ID: ${guide.id}`, pageWidth - margin, footerY + 3, { align: 'right' });

  // Save
  doc.save(`guia-pagamento-${guide.id}.pdf`);
}
