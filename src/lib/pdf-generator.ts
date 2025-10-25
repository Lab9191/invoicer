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

  const leftMargin = 15;
  const rightMargin = 195;
  const pageWidth = 210;
  let yPos = 15;

  // Set default font
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // === HEADER SECTION ===
  // Supplier and Client in two columns
  const colWidth = 85;

  // Supplier column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(t.supplier, leftMargin, yPos);

  // Client column
  doc.text(t.client, leftMargin + colWidth + 10, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(data.supplier.name, leftMargin, yPos);
  doc.text(data.client.name, leftMargin + colWidth + 10, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Supplier address
  if (data.supplier.registrationInfo) {
    doc.setFontSize(8);
    const regLines = doc.splitTextToSize(data.supplier.registrationInfo, colWidth);
    regLines.forEach(line => {
      doc.text(line, leftMargin, yPos);
      yPos += 3.5;
    });
    doc.setFontSize(9);
  }

  const supplierStartY = yPos;
  doc.text(data.supplier.address, leftMargin, yPos);
  doc.text(data.client.address, leftMargin + colWidth + 10, yPos);
  yPos += 4;

  doc.text(`${data.supplier.postalCode} ${data.supplier.city}`, leftMargin, yPos);
  doc.text(`${data.client.postalCode} ${data.client.city}`, leftMargin + colWidth + 10, yPos);
  yPos += 4;

  doc.text(data.supplier.country, leftMargin, yPos);
  doc.text(data.client.country, leftMargin + colWidth + 10, yPos);
  yPos += 6;

  // IDs
  if (data.supplier.companyId) {
    doc.text(`${t.id}: ${data.supplier.companyId}`, leftMargin, yPos);
  }
  if (data.client.companyId) {
    doc.text(`${t.id}: ${data.client.companyId}`, leftMargin + colWidth + 10, yPos);
  }
  yPos += 4;

  if (data.supplier.taxId) {
    doc.text(`${t.taxId}: ${data.supplier.taxId}`, leftMargin, yPos);
  }
  if (data.client.taxId) {
    doc.text(`${t.taxId}: ${data.client.taxId}`, leftMargin + colWidth + 10, yPos);
  }
  yPos += 4;

  if (data.supplier.vatId) {
    doc.text(`${t.vatId}: ${data.supplier.vatId}`, leftMargin, yPos);
  }
  if (data.client.vatId) {
    doc.text(`${t.vatId}: ${data.client.vatId}`, leftMargin + colWidth + 10, yPos);
  }

  yPos += 10;

  // === INVOICE TITLE AND DETAILS ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${t.invoice} ${data.invoiceNumber}`, leftMargin, yPos);
  yPos += 10;

  // Invoice details in right column
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const detailsX = 120;

  doc.text(`${t.issueDate}:`, detailsX, yPos);
  doc.text(data.issueDate, detailsX + 30, yPos);
  yPos += 4;

  if (data.deliveryDate) {
    doc.text(`${t.deliveryDate}:`, detailsX, yPos);
    doc.text(data.deliveryDate, detailsX + 30, yPos);
    yPos += 4;
  }

  doc.text(`${t.dueDate}:`, detailsX, yPos);
  doc.text(data.dueDate, detailsX + 30, yPos);
  yPos += 4;

  doc.text(`${t.paymentReference}:`, detailsX, yPos);
  doc.text(data.paymentReference, detailsX + 30, yPos);
  yPos += 4;

  doc.text(`${t.paymentMethod}:`, detailsX, yPos);
  doc.text(data.paymentMethod, detailsX + 30, yPos);
  yPos += 8;

  // === ITEMS TABLE ===
  const tableTop = yPos;
  const tableHeaders = [
    { text: t.itemDescription, x: leftMargin, width: 90, align: 'left' },
    { text: t.qty, x: 110, width: 15, align: 'right' },
    { text: t.unit, x: 130, width: 15, align: 'right' },
    { text: t.unitPrice, x: 155, width: 20, align: 'right' },
    { text: t.total, x: rightMargin, width: 20, align: 'right' },
  ];

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(leftMargin, yPos, rightMargin - leftMargin, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  yPos += 5;

  tableHeaders.forEach(header => {
    doc.text(header.text, header.x, yPos, { align: header.align as any });
  });

  yPos += 3;
  doc.setLineWidth(0.5);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 4;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setLineWidth(0.1);

  data.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
      // Repeat header
      doc.setFillColor(240, 240, 240);
      doc.rect(leftMargin, yPos, rightMargin - leftMargin, 7, 'F');
      doc.setFont('helvetica', 'bold');
      yPos += 5;
      tableHeaders.forEach(header => {
        doc.text(header.text, header.x, yPos, { align: header.align as any });
      });
      yPos += 3;
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 4;
      doc.setFont('helvetica', 'normal');
    }

    const startY = yPos;

    // Description with word wrap
    const descLines = doc.splitTextToSize(item.description, 85);
    descLines.forEach((line, lineIndex) => {
      doc.text(line, leftMargin + 1, yPos + (lineIndex * 4));
    });

    const descHeight = descLines.length * 4;
    const rowHeight = Math.max(descHeight, 6);
    const midY = startY + (rowHeight / 2);

    // Numeric values aligned to middle
    doc.text(item.quantity.toFixed(2), 110, midY, { align: 'right' });
    doc.text(item.unit, 130, midY, { align: 'right' });
    doc.text(`€${item.unitPrice.toFixed(2)}`, 155, midY, { align: 'right' });
    doc.text(`€${item.totalPrice.toFixed(2)}`, rightMargin, midY, { align: 'right' });

    yPos += rowHeight;

    // Row border
    doc.setDrawColor(220, 220, 220);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 2;
  });

  // === TOTALS SECTION ===
  yPos += 5;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 6;

  const totalsX = 140;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (data.subtotal) {
    doc.text(`${t.subtotal}:`, totalsX, yPos);
    doc.text(`€${data.subtotal.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
    yPos += 5;
  }

  if (data.vatAmount && data.vatAmount > 0) {
    doc.text(`${t.vat}:`, totalsX, yPos);
    doc.text(`€${data.vatAmount.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
    yPos += 5;
  }

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${t.invoiceTotal}:`, totalsX, yPos);
  doc.text(`€${data.totalAmount.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
  yPos += 8;

  // Not VAT payer note
  if (!data.isVatPayer) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(t.notVatPayer, leftMargin, yPos);
    yPos += 6;
  }

  // Notes
  if (data.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    const notesLines = doc.splitTextToSize(data.notes, rightMargin - leftMargin);
    notesLines.forEach(line => {
      doc.text(line, leftMargin, yPos);
      yPos += 3.5;
    });
    yPos += 3;
  }

  // === PAYMENT INFO BOX ===
  yPos += 5;

  // Box with payment details
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(leftMargin, yPos, rightMargin - leftMargin, 25, 2, 2, 'FD');

  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Payment Details:', leftMargin + 3, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (data.bank.name && data.bank.account) {
    doc.text(`${t.bankAccount}: ${data.bank.account}`, leftMargin + 3, yPos);
    yPos += 4;
  }

  doc.text(`${t.iban}: ${data.bank.iban}`, leftMargin + 3, yPos);
  yPos += 4;

  if (data.bank.swift) {
    doc.text(`${t.swift}: ${data.bank.swift}`, leftMargin + 3, yPos);
    yPos += 4;
  }

  doc.text(`${t.paymentReference}: ${data.paymentReference}`, leftMargin + 3, yPos);

  // QR Code
  if (data.includeQrCode !== false) {
    try {
      const qrData = `SPD*1.0*ACC:${data.bank.iban}*AM:${data.totalAmount.toFixed(2)}*CC:EUR*MSG:${data.paymentReference}*X-VS:${data.paymentReference}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M'
      });
      doc.addImage(qrCodeDataUrl, 'PNG', rightMargin - 25, yPos - 18, 23, 23);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  // === FOOTER ===
  yPos = 280;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);

  const footerText = `${t.issuedBy}: ${data.supplier.name}`;
  const footerDetails = [];
  if (data.supplier.phone) footerDetails.push(data.supplier.phone);
  if (data.supplier.email) footerDetails.push(data.supplier.email);

  doc.text(footerText, pageWidth / 2, yPos, { align: 'center' });
  if (footerDetails.length > 0) {
    doc.text(footerDetails.join(' | '), pageWidth / 2, yPos + 3, { align: 'center' });
  }

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
