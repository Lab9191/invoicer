import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

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

const translations = {
  en: {
    supplier: 'SUPPLIER',
    client: 'CLIENT',
    invoice: 'INVOICE',
    id: 'ID',
    taxId: 'Tax ID',
    vatId: 'VAT ID',
    issueDate: 'Issue date',
    deliveryDate: 'Delivery date',
    dueDate: 'Due date',
    paymentReference: 'VS',
    paymentMethod: 'Payment method',
    itemDescription: 'Description',
    qty: 'Qty',
    unit: 'Unit',
    unitPrice: 'Unit price',
    total: 'Total',
    invoiceTotal: 'TOTAL',
    subtotal: 'Subtotal',
    vat: 'VAT',
    notVatPayer: 'The issuer is not a VAT payer.',
    issuedBy: 'Issued by',
    iban: 'IBAN',
    swift: 'SWIFT',
    bankAccount: 'Bank account',
  },
  sk: {
    supplier: 'DODÁVATEĽ',
    client: 'ODBERATEĽ',
    invoice: 'FAKTÚRA',
    id: 'IČO',
    taxId: 'DIČ',
    vatId: 'IČ DPH',
    issueDate: 'Dátum vystavenia',
    deliveryDate: 'Dátum dodania',
    dueDate: 'Dátum splatnosti',
    paymentReference: 'VS',
    paymentMethod: 'Forma úhrady',
    itemDescription: 'Popis',
    qty: 'Počet',
    unit: 'MJ',
    unitPrice: 'Cena/MJ',
    total: 'Celkom',
    invoiceTotal: 'CELKOM',
    subtotal: 'Medzisúčet',
    vat: 'DPH',
    notVatPayer: 'Nie sme platiteľmi DPH.',
    issuedBy: 'Vystavil',
    iban: 'IBAN',
    swift: 'SWIFT',
    bankAccount: 'Číslo účtu',
  },
};

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const t = translations[data.language];

  const leftMargin = 20;
  const rightMargin = 190;
  const pageWidth = 210;
  let yPos = 20;

  // Set default font
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // === HEADER SECTION ===
  // Supplier and Client in two columns
  const colWidth = 80;

  // Supplier column (left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(t.supplier, leftMargin, yPos);
  yPos += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(data.supplier.name, leftMargin, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Supplier registration info
  if (data.supplier.registrationInfo) {
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const regLines = doc.splitTextToSize(data.supplier.registrationInfo, colWidth);
    regLines.forEach(line => {
      doc.text(line, leftMargin, yPos);
      yPos += 3.5;
    });
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
  }

  const supplierStartY = yPos;
  doc.text(data.supplier.address, leftMargin, yPos);
  yPos += 4;

  doc.text(`${data.supplier.postalCode} ${data.supplier.city}`, leftMargin, yPos);
  yPos += 4;

  doc.text(data.supplier.country, leftMargin, yPos);
  yPos += 5;

  // Supplier IDs
  if (data.supplier.companyId) {
    doc.text(`${t.id}: ${data.supplier.companyId}`, leftMargin, yPos);
    yPos += 3.5;
  }

  if (data.supplier.taxId) {
    doc.text(`${t.taxId}: ${data.supplier.taxId}`, leftMargin, yPos);
    yPos += 3.5;
  }

  if (data.supplier.vatId) {
    doc.text(`${t.vatId}: ${data.supplier.vatId}`, leftMargin, yPos);
    yPos += 3.5;
  }

  // Client column (right)
  const clientX = leftMargin + colWidth + 15;
  yPos = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(t.client, clientX, yPos);
  yPos += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(data.client.name, clientX, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text(data.client.address, clientX, yPos);
  yPos += 4;

  doc.text(`${data.client.postalCode} ${data.client.city}`, clientX, yPos);
  yPos += 4;

  doc.text(data.client.country, clientX, yPos);
  yPos += 5;

  // Client IDs
  if (data.client.companyId) {
    doc.text(`${t.id}: ${data.client.companyId}`, clientX, yPos);
    yPos += 3.5;
  }

  if (data.client.taxId) {
    doc.text(`${t.taxId}: ${data.client.taxId}`, clientX, yPos);
    yPos += 3.5;
  }

  if (data.client.vatId) {
    doc.text(`${t.vatId}: ${data.client.vatId}`, clientX, yPos);
  }

  yPos = Math.max(supplierStartY + 40, yPos + 8);

  // === INVOICE TITLE AND DETAILS ===
  // Horizontal line separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 8;

  // Invoice title (large, left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(`${t.invoice}`, leftMargin, yPos);

  // Invoice number (right aligned)
  doc.setFontSize(14);
  doc.text(data.invoiceNumber, rightMargin, yPos, { align: 'right' });
  yPos += 10;

  // Invoice details in two-column layout
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const detailsLabelX = leftMargin;
  const detailsValueX = leftMargin + 35;
  const detailsLabelX2 = leftMargin + 90;
  const detailsValueX2 = leftMargin + 125;

  // First column
  doc.text(`${t.issueDate}:`, detailsLabelX, yPos);
  doc.text(data.issueDate, detailsValueX, yPos);

  // Second column
  doc.text(`${t.paymentMethod}:`, detailsLabelX2, yPos);
  doc.text(data.paymentMethod, detailsValueX2, yPos);
  yPos += 5;

  // First column
  if (data.deliveryDate) {
    doc.text(`${t.deliveryDate}:`, detailsLabelX, yPos);
    doc.text(data.deliveryDate, detailsValueX, yPos);
  }

  // Second column
  doc.text(`${t.paymentReference}:`, detailsLabelX2, yPos);
  doc.text(data.paymentReference, detailsValueX2, yPos);
  yPos += 5;

  // First column
  doc.text(`${t.dueDate}:`, detailsLabelX, yPos);
  doc.text(data.dueDate, detailsValueX, yPos);
  yPos += 8;

  // === ITEMS TABLE ===
  const tableTop = yPos;

  // Table column positions
  const colDesc = leftMargin;
  const colQty = leftMargin + 95;
  const colUnit = leftMargin + 115;
  const colPrice = leftMargin + 140;
  const colTotal = rightMargin;

  // Table header with grey background
  doc.setFillColor(245, 245, 245);
  doc.rect(leftMargin, yPos, rightMargin - leftMargin, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  yPos += 5.5;

  doc.text(t.itemDescription, colDesc + 2, yPos);
  doc.text(t.qty, colQty, yPos, { align: 'center' });
  doc.text(t.unit, colUnit, yPos, { align: 'center' });
  doc.text(t.unitPrice, colPrice, yPos, { align: 'right' });
  doc.text(t.total, colTotal - 2, yPos, { align: 'right' });

  yPos += 3;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 5;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  data.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;

      // Repeat header
      doc.setFillColor(245, 245, 245);
      doc.rect(leftMargin, yPos, rightMargin - leftMargin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      yPos += 5.5;

      doc.text(t.itemDescription, colDesc + 2, yPos);
      doc.text(t.qty, colQty, yPos, { align: 'center' });
      doc.text(t.unit, colUnit, yPos, { align: 'center' });
      doc.text(t.unitPrice, colPrice, yPos, { align: 'right' });
      doc.text(t.total, colTotal - 2, yPos, { align: 'right' });

      yPos += 3;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
    }

    const startY = yPos;

    // Description with word wrap (max width for description column)
    const descLines = doc.splitTextToSize(item.description, 88);
    descLines.forEach((line, lineIndex) => {
      doc.text(line, colDesc + 2, yPos + (lineIndex * 4.5));
    });

    const descHeight = descLines.length * 4.5;
    const rowHeight = Math.max(descHeight, 6);
    const midY = startY + (descHeight / 2);

    // Numeric values aligned properly
    doc.text(item.quantity.toString(), colQty, midY, { align: 'center' });
    doc.text(item.unit, colUnit, midY, { align: 'center' });
    doc.text(`€${item.unitPrice.toFixed(2)}`, colPrice, midY, { align: 'right' });
    doc.text(`€${item.totalPrice.toFixed(2)}`, colTotal - 2, midY, { align: 'right' });

    yPos += rowHeight + 1;

    // Subtle row separator
    if (index < data.items.length - 1) {
      doc.setDrawColor(235, 235, 235);
      doc.setLineWidth(0.2);
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 3;
    } else {
      yPos += 2;
    }
  });

  // === TOTALS SECTION ===
  yPos += 3;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 7;

  const totalsLabelX = leftMargin + 105;
  const totalsValueX = colTotal - 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  if (data.subtotal) {
    doc.text(`${t.subtotal}:`, totalsLabelX, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(`€${data.subtotal.toFixed(2)}`, totalsValueX, yPos, { align: 'right' });
    doc.setTextColor(80, 80, 80);
    yPos += 5;
  }

  if (data.vatAmount && data.vatAmount > 0) {
    doc.text(`${t.vat}:`, totalsLabelX, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(`€${data.vatAmount.toFixed(2)}`, totalsValueX, yPos, { align: 'right' });
    doc.setTextColor(80, 80, 80);
    yPos += 5;
  }

  // Total amount - highlighted
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(totalsLabelX - 2, yPos - 2, rightMargin, yPos - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`${t.invoiceTotal}:`, totalsLabelX, yPos + 4);
  doc.text(`€${data.totalAmount.toFixed(2)}`, totalsValueX, yPos + 4, { align: 'right' });
  yPos += 10;

  // Not VAT payer note
  if (!data.isVatPayer) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(t.notVatPayer, leftMargin, yPos);
    yPos += 6;
  }

  // Notes
  if (data.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const notesLines = doc.splitTextToSize(data.notes, rightMargin - leftMargin - 10);
    notesLines.forEach(line => {
      doc.text(line, leftMargin, yPos);
      yPos += 3.5;
    });
    yPos += 5;
  }

  // === PAYMENT INFO SECTION ===
  yPos += 3;

  // Payment details box with subtle styling
  const paymentBoxHeight = 28;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, yPos, rightMargin - leftMargin, paymentBoxHeight, 1.5, 1.5, 'FD');

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const paymentLabelText = data.language === 'sk' ? 'Platobné údaje' : 'Payment Details';
  doc.text(paymentLabelText, leftMargin + 4, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  const paymentDetailsX = leftMargin + 4;

  if (data.bank.name && data.bank.account) {
    doc.text(`${t.bankAccount}: ${data.bank.account}`, paymentDetailsX, yPos);
    yPos += 4;
  }

  doc.text(`${t.iban}: ${data.bank.iban}`, paymentDetailsX, yPos);
  yPos += 4;

  if (data.bank.swift) {
    doc.text(`${t.swift}: ${data.bank.swift}`, paymentDetailsX, yPos);
    yPos += 4;
  }

  doc.text(`${t.paymentReference}: ${data.paymentReference}`, paymentDetailsX, yPos);

  // QR Code positioned in the payment box (right side)
  if (data.includeQrCode !== false) {
    try {
      const qrData = `SPD*1.0*ACC:${data.bank.iban}*AM:${data.totalAmount.toFixed(2)}*CC:EUR*MSG:${data.paymentReference}*X-VS:${data.paymentReference}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M'
      });

      // Position QR code in the right side of payment box
      const qrSize = 24;
      const qrX = rightMargin - qrSize - 4;
      const qrY = yPos - 22;
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  yPos += 6;

  // === FOOTER ===
  yPos = 277;

  // Footer separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);

  // Footer text centered
  const footerParts = [];
  if (data.supplier.phone) footerParts.push(data.supplier.phone);
  if (data.supplier.email) footerParts.push(data.supplier.email);

  if (footerParts.length > 0) {
    doc.text(footerParts.join('  •  '), pageWidth / 2, yPos, { align: 'center' });
    yPos += 3;
  }

  doc.setFontSize(6.5);
  doc.text(`${t.issuedBy}: ${data.supplier.name}`, pageWidth / 2, yPos, { align: 'center' });

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
