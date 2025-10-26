import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { robotoRegularBase64, robotoBoldBase64 } from './roboto-font';

export interface InvoiceData {
  supplier: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    companyId?: string;
    taxId?: string;
    vatId?: string;
    registrationInfo?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
  };

  client: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    companyId?: string;
    taxId?: string;
    vatId?: string;
  };

  bank: {
    name?: string;
    account?: string;
    iban: string;
    swift?: string;
  };

  invoiceNumber: string;
  issueDate: string;
  deliveryDate?: string;
  dueDate: string;
  paymentMethod: string;
  paymentReference: string;

  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }>;

  subtotal?: number;
  vatAmount?: number;
  totalAmount: number;
  notes?: string;
  language: 'en' | 'sk';
  includeQrCode?: boolean;
  isVatPayer?: boolean;
}

// Format price in European format: 140,00 € or 18 340,00 €
function formatPrice(amount: number): string {
  const parts = amount.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${integerPart},${parts[1]} €`;
}


const translations = {
  en: {
    supplier: 'SUPPLIER',
    client: 'CLIENT',
    invoice: 'Invoice',
    id: 'ID',
    taxId: 'Tax ID',
    vatId: 'VAT ID',
    issueDate: 'Issue date',
    deliveryDate: 'Delivery date',
    dueDate: 'Due date',
    paymentReference: 'Payment reference',
    qty: 'Qty',
    unit: 'Unit',
    unitPrice: 'Unit price',
    total: 'Total',
    invoiceTotal: 'Invoice total',
    totalPaymentAmount: 'Total payment amount',
    notVatPayer: 'Note: The issuer is not a VAT payer.',
    issuedBy: 'Issued by',
    iban: 'IBAN',
    swift: 'SWIFT',
    signatureAndSeal: 'Signature and company seal:',
  },
  sk: {
    supplier: 'DODÁVATEĽ',
    client: 'ODBERATEĽ',
    invoice: 'Faktúra',
    id: 'IČO',
    taxId: 'DIČ',
    vatId: 'IČ DPH',
    issueDate: 'Dátum vystavenia',
    deliveryDate: 'Dátum dodania',
    dueDate: 'Dátum splatnosti',
    paymentReference: 'Variabilný symbol',
    qty: 'Množstvo',
    unit: 'Jednotka',
    unitPrice: 'Cena/jedn.',
    total: 'Celkom',
    invoiceTotal: 'Suma na úhradu',
    totalPaymentAmount: 'Suma na úhradu',
    notVatPayer: 'Nie je platcom DPH',
    issuedBy: 'Vystavil',
    iban: 'IBAN',
    swift: 'SWIFT',
    signatureAndSeal: 'Pečiatka a podpis:',
  },
};

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true,
  });

  // Add Roboto fonts with full Slovak character support
  doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFileToVFS('Roboto-Bold.ttf', robotoBoldBase64);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto', 'normal');

  const t = translations[data.language];

  // === LAYOUT CONSTANTS (FIXED) ===
  const margin = 15;
  const pageWidth = 210;
  const contentWidth = pageWidth - (margin * 2);

  // Fixed box dimensions
  const boxWidth = (contentWidth - 5) / 2;
  const boxHeight = 95; // Fixed height for both SUPPLIER and CLIENT boxes
  const boxPadding = 3; // Internal padding
  const lineHeight = 3.5; // Standard line height for text

  let y = margin;

  // === TWO BOXES SIDE BY SIDE ===

  // === LEFT BOX - SUPPLIER ===
  const supplierBoxX = margin;
  const supplierBoxY = y;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.setLineDash([1, 1]);
  doc.rect(supplierBoxX, supplierBoxY, boxWidth, boxHeight);

  let supplierY = supplierBoxY + boxPadding + 2;

  // SUPPLIER header
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(t.supplier + ':', supplierBoxX + boxPadding, supplierY);
  supplierY += 4.5;

  // Company name (single line, truncate if too long)
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(9);
  const nameLines = doc.splitTextToSize(data.supplier.name, boxWidth - (boxPadding * 2));
  doc.text(nameLines[0], supplierBoxX + boxPadding, supplierY);
  supplierY += 4;

  // Address block (with word wrapping for long addresses)
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8);

  const addressLines = doc.splitTextToSize(data.supplier.address, boxWidth - (boxPadding * 2));
  // Show up to 2 lines of address if needed
  const maxAddressLines = Math.min(2, addressLines.length);
  for (let i = 0; i < maxAddressLines; i++) {
    doc.text(addressLines[i], supplierBoxX + boxPadding, supplierY);
    supplierY += lineHeight;
  }

  // Postal code and city
  const cityLine = doc.splitTextToSize(`${data.supplier.postalCode} ${data.supplier.city}`, boxWidth - (boxPadding * 2));
  doc.text(cityLine[0], supplierBoxX + boxPadding, supplierY);
  supplierY += lineHeight;

  // Country
  doc.text(data.supplier.country, supplierBoxX + boxPadding, supplierY);
  supplierY += 5;

  // Logo section (fixed area: 35x35mm centered)
  const logoSize = 35;
  const logoX = supplierBoxX + (boxWidth / 2) - (logoSize / 2);

  if (data.supplier.logoUrl) {
    try {
      doc.addImage(data.supplier.logoUrl, 'PNG', logoX, supplierY, logoSize, logoSize);
    } catch (error) {
      console.error('Error adding logo:', error);
      // Draw placeholder
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(2);
      doc.circle(logoX + logoSize/2, supplierY + logoSize/2, logoSize/2, 'S');
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text('LAB', logoX + logoSize/2, supplierY + logoSize/2 - 2, { align: 'center' });
      doc.text('9191', logoX + logoSize/2, supplierY + logoSize/2 + 4, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setLineWidth(0.1);
    }
  } else {
    // Draw placeholder if no logo
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(2);
    doc.circle(logoX + logoSize/2, supplierY + logoSize/2, logoSize/2, 'S');
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('LAB', logoX + logoSize/2, supplierY + logoSize/2 - 2, { align: 'center' });
    doc.text('9191', logoX + logoSize/2, supplierY + logoSize/2 + 4, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setLineWidth(0.1);
  }
  supplierY += logoSize + 4;

  // ID section (fixed height)
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8);
  if (data.supplier.companyId) {
    doc.text(`${t.id}: ${data.supplier.companyId}`, supplierBoxX + boxPadding, supplierY);
    supplierY += lineHeight;
  }
  if (data.supplier.taxId) {
    doc.text(`${t.taxId}: ${data.supplier.taxId}`, supplierBoxX + boxPadding, supplierY);
    supplierY += lineHeight;
  }

  // Registration info (max 2 lines, very small font, stays within box)
  if (data.supplier.registrationInfo) {
    supplierY += 1;
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(60, 60, 60);

    // Use narrower width to ensure text stays in box
    const regMaxWidth = boxWidth - (boxPadding * 3);
    const regLines = doc.splitTextToSize(data.supplier.registrationInfo, regMaxWidth);
    const maxRegLines = 2;
    for (let i = 0; i < Math.min(maxRegLines, regLines.length); i++) {
      doc.text(regLines[i], supplierBoxX + boxPadding, supplierY);
      supplierY += 2.3;
    }
    doc.setTextColor(0, 0, 0);
  }

  // Calculate position for separator (should be at fixed position from bottom)
  const bankSectionHeight = 20; // Fixed height for bank info section
  const separatorY = supplierBoxY + boxHeight - bankSectionHeight;

  // Draw separator line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.setLineDash([]);
  doc.line(supplierBoxX + boxPadding, separatorY, supplierBoxX + boxWidth - boxPadding, separatorY);
  doc.setLineWidth(0.1);

  // Bank info section (fixed position at bottom)
  let bankY = separatorY + 4;
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);

  if (data.bank.name && data.bank.account) {
    const bankText = `${data.bank.name}: ${data.bank.account}`;
    const bankLines = doc.splitTextToSize(bankText, boxWidth - (boxPadding * 2));
    doc.text(bankLines[0], supplierBoxX + boxPadding, bankY);
    bankY += 3;
  }
  if (data.bank.iban && data.bank.swift) {
    const ibanText = `${t.iban} / ${t.swift}: ${data.bank.iban} / ${data.bank.swift}`;
    const ibanLines = doc.splitTextToSize(ibanText, boxWidth - (boxPadding * 2));
    doc.text(ibanLines[0], supplierBoxX + boxPadding, bankY);
    bankY += 3;
  }

  const paymentRefText = `${t.paymentReference}: ${data.paymentReference}`;
  doc.text(paymentRefText, supplierBoxX + boxPadding, bankY);
  bankY += 3;

  const paymentMethodText = `Method of payment: ${data.paymentMethod}`;
  doc.text(paymentMethodText, supplierBoxX + boxPadding, bankY);

  // === RIGHT BOX - CLIENT ===
  const clientBoxX = margin + boxWidth + 5;
  const clientBoxY = y;

  doc.setLineDash([1, 1]);
  doc.rect(clientBoxX, clientBoxY, boxWidth, boxHeight);

  // INVOICE TITLE (outside box, top right)
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text(`${t.invoice} ${data.invoiceNumber}`, pageWidth - margin, clientBoxY + 10, { align: 'right' });

  // Separator line under title
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.setLineDash([1, 2]);
  doc.line(clientBoxX + boxPadding, clientBoxY + 16, pageWidth - margin - boxPadding, clientBoxY + 16);
  doc.setLineDash([1, 1]);
  doc.setLineWidth(0.1);

  let clientY = clientBoxY + 24;

  // CLIENT header
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8);
  doc.text(t.client + ':', clientBoxX + boxPadding, clientY);
  clientY += 5;

  // Client name (single line, truncate if needed)
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(10);
  const clientNameLines = doc.splitTextToSize(data.client.name, boxWidth - (boxPadding * 2));
  doc.text(clientNameLines[0], clientBoxX + boxPadding, clientY);
  clientY += 5;

  // Client address (with word wrapping for long addresses)
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8);

  const clientAddressLines = doc.splitTextToSize(data.client.address, boxWidth - (boxPadding * 2));
  // Show up to 2 lines of address if needed
  const maxClientAddressLines = Math.min(2, clientAddressLines.length);
  for (let i = 0; i < maxClientAddressLines; i++) {
    doc.text(clientAddressLines[i], clientBoxX + boxPadding, clientY);
    clientY += lineHeight;
  }

  // Postal code and city
  const clientCityLine = doc.splitTextToSize(`${data.client.postalCode} ${data.client.city}`, boxWidth - (boxPadding * 2));
  doc.text(clientCityLine[0], clientBoxX + boxPadding, clientY);
  clientY += lineHeight;

  // Country
  doc.text(data.client.country, clientBoxX + boxPadding, clientY);
  clientY += 10;

  // IDs section (flexible, but limited space)
  doc.setFontSize(8);
  if (data.client.companyId) {
    doc.text(`${t.id}: ${data.client.companyId}`, clientBoxX + boxPadding, clientY);
    clientY += lineHeight;
  }
  if (data.client.vatId) {
    doc.text(`${t.vatId}: ${data.client.vatId}`, clientBoxX + boxPadding, clientY);
    clientY += lineHeight + 2;
  }

  // Dates section (fixed position near bottom, right-aligned values)
  const datesSectionY = clientBoxY + boxHeight - 18; // Fixed position from bottom
  let dateY = datesSectionY;

  const leftCol = clientBoxX + boxPadding;
  const rightCol = clientBoxX + boxWidth - boxPadding;

  doc.text(`${t.issueDate}:`, leftCol, dateY);
  doc.text(data.issueDate, rightCol, dateY, { align: 'right' });
  dateY += lineHeight;

  if (data.deliveryDate) {
    doc.text(`${t.deliveryDate}:`, leftCol, dateY);
    doc.text(data.deliveryDate, rightCol, dateY, { align: 'right' });
    dateY += lineHeight;
  }

  doc.text(`${t.dueDate}:`, leftCol, dateY);
  doc.text(data.dueDate, rightCol, dateY, { align: 'right' });

  doc.setLineDash([]);
  y += boxHeight + 5;

  // Separator line
  doc.setDrawColor(180, 180, 180);
  doc.setLineDash([2, 2]);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineDash([]);
  y += 5;

  // === ITEMS TABLE ===
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, contentWidth, 6, 'F');

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);

  const colDesc = margin + 1;
  const colQty = pageWidth - margin - 85;
  const colUnit = pageWidth - margin - 65;
  const colPrice = pageWidth - margin - 45;
  const colTotal = pageWidth - margin - 1;

  y += 4;
  doc.text('Item name and description', colDesc, y);
  doc.text(t.qty, colQty, y, { align: 'center' });
  doc.text(t.unit, colUnit, y, { align: 'center' });
  doc.text(t.unitPrice, colPrice, y, { align: 'right' });
  doc.text(t.total, colTotal, y, { align: 'right' });

  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 2;

  // Items
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);

  data.items.forEach((item) => {
    if (y > 240) {
      doc.addPage();
      y = margin;
    }

    const startY = y;
    const lines = item.description.split('\n');
    const wrappedLines: string[] = [];
    const descMaxWidth = colQty - colDesc - 5;

    lines.forEach((line) => {
      if (line.trim()) {
        const words = line.split(/\s+/);
        let currentLine = '';
        words.forEach((word) => {
          const test = currentLine + (currentLine ? ' ' : '') + word;
          if (doc.getTextWidth(test) > descMaxWidth && currentLine) {
            wrappedLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = test;
          }
        });
        if (currentLine) wrappedLines.push(currentLine);
      } else {
        wrappedLines.push('');
      }
    });

    const lineHeight = 3.5;
    const rowHeight = Math.max(wrappedLines.length * lineHeight, 6);

    wrappedLines.forEach((line, i) => {
      doc.text(line, colDesc, y + (i * lineHeight));
    });

    const midY = startY + (rowHeight / 2) + 1;
    doc.text(item.quantity.toString(), colQty, midY, { align: 'center' });
    doc.text(item.unit, colUnit, midY, { align: 'center' });
    doc.text(formatPrice(item.unitPrice), colPrice, midY, { align: 'right' });
    doc.text(formatPrice(item.totalPrice), colTotal, midY, { align: 'right' });

    y += rowHeight + 1;
    doc.line(margin, y, pageWidth - margin, y);
    y += 1;
  });

  // Total
  y += 3;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
  y += 5;

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(10);
  doc.text(`${t.invoiceTotal}:`, pageWidth - margin - 58, y);
  doc.text(formatPrice(data.totalAmount), colTotal, y, { align: 'right' });

  y += 8;

  // VAT note and Signature box on same line
  if (!data.isVatPayer) {
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(t.notVatPayer, margin, y);
  }

  // Signature box (right side)
  const sigX = pageWidth - margin - 80;
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text(t.signatureAndSeal, sigX, y);

  y += 35;

  // === QR CODE & BLUE BOX ===
  if (data.includeQrCode) {
    try {
      // QR code uses standard decimal format (not formatted)
      const qrData = `SPD*1.0*ACC:${data.bank.iban}*AM:${data.totalAmount.toFixed(2)}*CC:EUR*MSG:${data.paymentReference}*X-VS:${data.paymentReference}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 1,
        errorCorrectionLevel: 'M',
      });

      const qrSize = 32;
      doc.addImage(qrCodeDataUrl, 'PNG', margin, y - 5, qrSize, qrSize);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  // Blue box (4 columns with separators)
  const blueBoxX = margin + 40;
  const blueBoxWidth = contentWidth - 40;
  const blueBoxHeight = 16;

  doc.setFillColor(173, 216, 230);
  doc.rect(blueBoxX, y, blueBoxWidth, blueBoxHeight, 'F');

  // Column positions - centered in each column
  const colWidth = blueBoxWidth / 4;
  const col1Center = blueBoxX + (colWidth / 2);
  const col2Center = blueBoxX + colWidth + (colWidth / 2);
  const col3Center = blueBoxX + (colWidth * 2) + (colWidth / 2);
  const col4Center = blueBoxX + (colWidth * 3) + (colWidth / 2);

  // Draw separators between columns (white lines)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  for (let i = 1; i < 4; i++) {
    const sepX = blueBoxX + (colWidth * i);
    doc.line(sepX, y, sepX, y + blueBoxHeight);
  }

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);

  let blueY = y + 4.5;
  // Headers - centered
  doc.text(t.iban, col1Center, blueY, { align: 'center' });
  doc.text(t.paymentReference, col2Center, blueY, { align: 'center' });
  doc.text(t.dueDate, col3Center, blueY, { align: 'center' });
  doc.text(t.totalPaymentAmount, col4Center, blueY, { align: 'center' });

  blueY += 4.5;
  doc.setFont('Roboto', 'bold');

  // IBAN - with word wrapping if needed (smaller font to fit in column)
  doc.setFontSize(6.5);
  const ibanLines = doc.splitTextToSize(data.bank.iban, colWidth - 2);
  const maxIbanLines = Math.min(2, ibanLines.length);
  for (let i = 0; i < maxIbanLines; i++) {
    doc.text(ibanLines[i], col1Center, blueY + (i * 3.5), { align: 'center' });
  }

  // Other values - centered
  doc.setFontSize(9);
  doc.text(data.paymentReference, col2Center, blueY, { align: 'center' });
  doc.text(data.dueDate, col3Center, blueY, { align: 'center' });
  doc.text(formatPrice(data.totalAmount), col4Center, blueY, { align: 'center' });

  y += blueBoxHeight + 5;

  // === FOOTER (at bottom of page) ===
  const footerY = 280; // Fixed position at bottom

  // Dotted line (at bottom, before footer text)
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.setLineDash([1, 2]);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  doc.setLineDash([]);

  // Footer text (below dotted line)
  const footerTextY = footerY + 4;
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);

  let footerText = `${t.issuedBy}: ${data.supplier.name}`;
  doc.text(footerText, margin, footerTextY);

  if (data.supplier.phone) {
    doc.text(`☎ ${data.supplier.phone}`, pageWidth / 2 - 20, footerTextY, { align: 'center' });
  }

  if (data.supplier.email) {
    doc.text(`✉ ${data.supplier.email}`, pageWidth - margin, footerTextY, { align: 'right' });
  }

  // Bottom right corner
  const bottomY = 287;
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text('Created with SuperFaktura.sk', pageWidth - margin - 2, bottomY, { align: 'right' });
  doc.text('Page 1/1', pageWidth - margin - 2, bottomY + 2.5, { align: 'right' });

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
