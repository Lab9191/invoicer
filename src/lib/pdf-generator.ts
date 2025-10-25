import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface InvoiceData {
  // Supplier info
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

  // Client info
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

  // Bank info
  bank: {
    name?: string;
    account?: string;
    iban: string;
    swift?: string;
  };

  // Invoice details
  invoiceNumber: string;
  issueDate: string;
  deliveryDate?: string;
  dueDate: string;
  paymentMethod: string;
  paymentReference: string;

  // Items
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }>;

  // Totals
  subtotal?: number;
  vatAmount?: number;
  totalAmount: number;
  notes?: string;

  // Language
  language: 'en' | 'sk';

  // QR Code
  includeQrCode?: boolean;
  isVatPayer?: boolean;
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
    paymentMethod: 'Method of payment',
    itemDescription: 'Item name and description',
    qty: 'Qty',
    unit: 'Unit',
    unitPrice: 'Unit price',
    total: 'Total',
    invoiceTotal: 'Invoice total',
    note: 'Note',
    notVatPayer: 'The issuer is not a VAT payer.',
    signatureAndSeal: 'Signature and company seal:',
    issuedBy: 'Issued by',
    iban: 'IBAN',
    totalPaymentAmount: 'Total payment amount',
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
    paymentMethod: 'Forma úhrady',
    itemDescription: 'Názov a popis položky',
    qty: 'Počet',
    unit: 'Jednotka',
    unitPrice: 'Jednotková cena',
    total: 'Celkom',
    invoiceTotal: 'Celková suma',
    note: 'Poznámka',
    notVatPayer: 'Nie sme platiteľmi DPH.',
    signatureAndSeal: 'Podpis a pečiatka:',
    issuedBy: 'Vystavil',
    iban: 'IBAN',
    totalPaymentAmount: 'Suma na úhradu',
  },
};

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const t = translations[data.language];

  let yPos = 20;
  const leftMargin = 20;
  const rightMargin = 190;
  const pageWidth = 210;

  // Header - Supplier and Client side by side
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(t.supplier + ':', leftMargin, yPos);
  doc.text(t.client + ':', 120, yPos);

  doc.setFont('helvetica', 'normal');
  yPos += 5;

  // Supplier details
  doc.text(data.supplier.name, leftMargin, yPos);
  doc.text(data.client.name, 120, yPos);
  yPos += 5;

  if (data.supplier.registrationInfo) {
    doc.setFontSize(8);
    const regLines = doc.splitTextToSize(data.supplier.registrationInfo, 90);
    doc.text(regLines, leftMargin, yPos);
    yPos += regLines.length * 4;
    doc.setFontSize(10);
  }

  doc.text(data.supplier.address, leftMargin, yPos);
  doc.text(data.client.address, 120, yPos);
  yPos += 5;

  doc.text(`${data.supplier.postalCode} ${data.supplier.city}`, leftMargin, yPos);
  doc.text(`${data.client.postalCode} ${data.client.city}`, 120, yPos);
  yPos += 5;

  doc.text(data.supplier.country, leftMargin, yPos);
  doc.text(data.client.country, 120, yPos);
  yPos += 8;

  // IDs
  if (data.supplier.companyId) {
    doc.text(`${t.id}: ${data.supplier.companyId}`, leftMargin, yPos);
  }
  if (data.client.companyId) {
    doc.text(`${t.id}: ${data.client.companyId}`, 120, yPos);
  }
  yPos += 5;

  if (data.supplier.taxId) {
    doc.text(`${t.taxId}: ${data.supplier.taxId}`, leftMargin, yPos);
  }
  if (data.client.taxId) {
    doc.text(`${t.taxId}: ${data.client.taxId}`, 120, yPos);
  }
  yPos += 5;

  if (data.supplier.vatId) {
    doc.text(`${t.vatId}: ${data.supplier.vatId}`, leftMargin, yPos);
  }
  if (data.client.vatId) {
    doc.text(`${t.vatId}: ${data.client.vatId}`, 120, yPos);
  }
  yPos += 10;

  // Invoice title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.invoice} ${data.invoiceNumber}`, leftMargin, yPos);
  yPos += 10;

  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.issueDate}: ${data.issueDate}`, 120, yPos);
  yPos += 5;
  if (data.deliveryDate) {
    doc.text(`${t.deliveryDate}: ${data.deliveryDate}`, 120, yPos);
    yPos += 5;
  }
  doc.text(`${t.dueDate}: ${data.dueDate}`, 120, yPos);
  yPos += 10;

  // Bank details
  if (data.bank.name && data.bank.account) {
    doc.text(`${data.bank.name}: ${data.bank.account}`, leftMargin, yPos);
    yPos += 5;
  }
  if (data.bank.iban) {
    doc.text(`${t.iban} / SWIFT: ${data.bank.iban}${data.bank.swift ? ' / ' + data.bank.swift : ''}`, leftMargin, yPos);
    yPos += 5;
  }
  doc.text(`${t.paymentReference}: ${data.paymentReference}`, leftMargin, yPos);
  yPos += 5;
  doc.text(`${t.paymentMethod}: ${data.paymentMethod}`, leftMargin, yPos);
  yPos += 10;

  // Items table
  const tableTop = yPos;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  // Table headers
  doc.text(t.itemDescription, leftMargin, yPos);
  doc.text(t.qty, 140, yPos, { align: 'right' });
  doc.text(t.unit, 155, yPos, { align: 'right' });
  doc.text(t.unitPrice, 175, yPos, { align: 'right' });
  doc.text(t.total, rightMargin, yPos, { align: 'right' });
  yPos += 5;

  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 5;

  // Items
  doc.setFont('helvetica', 'normal');
  data.items.forEach(item => {
    const descLines = doc.splitTextToSize(item.description, 115);
    doc.text(descLines, leftMargin, yPos);
    const lineHeight = descLines.length * 4;

    doc.text(item.quantity.toFixed(2), 140, yPos, { align: 'right' });
    doc.text(item.unit, 155, yPos, { align: 'right' });
    doc.text(item.unitPrice.toFixed(2) + ' €', 175, yPos, { align: 'right' });
    doc.text(item.totalPrice.toFixed(2) + ' €', rightMargin, yPos, { align: 'right' });

    yPos += Math.max(lineHeight, 8);
  });

  yPos += 5;
  doc.line(leftMargin, yPos, rightMargin, yPos);

  // Notes
  if (data.notes) {
    yPos += 5;
    doc.setFontSize(9);
    doc.text(`${t.note}: ${data.notes}`, leftMargin, yPos);
    yPos += 5;
  }

  if (!data.isVatPayer) {
    yPos += 5;
    doc.setFontSize(9);
    doc.text(t.notVatPayer, leftMargin, yPos);
    yPos += 5;
  }

  // Total
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.invoiceTotal}:`, 140, yPos);
  doc.text(`${data.totalAmount.toFixed(2)} €`, rightMargin, yPos, { align: 'right' });

  // QR Code
  if (data.includeQrCode !== false) {
    try {
      const qrData = `${data.bank.iban}|${data.totalAmount}|${data.paymentReference}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 200, margin: 1 });
      doc.addImage(qrCodeDataUrl, 'PNG', leftMargin, yPos + 10, 40, 40);

      // Payment info box
      doc.setFillColor(220, 240, 255);
      doc.rect(65, yPos + 10, 125, 40, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${t.iban}`, 70, yPos + 17);
      doc.setFont('helvetica', 'bold');
      doc.text(data.bank.iban, 70, yPos + 23);
      doc.setFont('helvetica', 'normal');
      doc.text(`${t.paymentReference}`, 70, yPos + 30);
      doc.setFont('helvetica', 'bold');
      doc.text(data.paymentReference, 70, yPos + 36);
      doc.setFont('helvetica', 'normal');
      doc.text(`${t.dueDate}`, 130, yPos + 17);
      doc.setFont('helvetica', 'bold');
      doc.text(data.dueDate, 130, yPos + 23);
      doc.setFont('helvetica', 'normal');
      doc.text(t.totalPaymentAmount, 130, yPos + 30);
      doc.setFont('helvetica', 'bold');
      doc.text(`${data.totalAmount.toFixed(2)} €`, 130, yPos + 36);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  // Footer
  yPos = 270;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const footerText = `${t.issuedBy}: ${data.supplier.name}${data.supplier.phone ? ' ' + data.supplier.phone : ''}${data.supplier.email ? ' ' + data.supplier.email : ''}`;
  doc.text(footerText, pageWidth / 2, yPos, { align: 'center' });

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
