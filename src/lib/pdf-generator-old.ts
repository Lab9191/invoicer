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

const translations = {
  en: {
    supplier: 'SUPPLIER',
    client: 'CLIENT',
    invoice: 'INVOICE',
    invoiceNumber: 'Invoice No.',
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
    invoiceTotal: 'Total to pay',
    subtotal: 'Subtotal',
    vat: 'VAT',
    notVatPayer: 'The issuer is not a VAT payer.',
    issuedBy: 'Issued by',
    iban: 'IBAN',
    swift: 'SWIFT/BIC',
    bankAccount: 'Bank account',
    paymentDetails: 'Payment details',
  },
  sk: {
    supplier: 'DODÁVATEĽ',
    client: 'ODBERATEĽ',
    invoice: 'FAKTÚRA',
    invoiceNumber: 'Číslo faktúry',
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
    invoiceTotal: 'Celkom na úhradu',
    subtotal: 'Medzisúčet',
    vat: 'DPH',
    notVatPayer: 'Nie sme platiteľmi DPH.',
    issuedBy: 'Vystavil',
    iban: 'IBAN',
    swift: 'SWIFT/BIC',
    bankAccount: 'Číslo účtu',
    paymentDetails: 'Platobné údaje',
  },
};

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const t = translations[data.language];

  const margin = 15;
  const pageWidth = 210;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // === SUPPLIER & CLIENT INFO BOXES ===
  // Two boxes side by side, taking equal width
  const boxWidth = (contentWidth - 5) / 2;
  const boxHeight = 70; // Increased to fit logo and bank info

  // Supplier box (left) - with dotted border like reference
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.2);
  doc.setLineDash([1, 1]); // Dotted line
  doc.rect(margin, y, boxWidth, boxHeight);

  let boxY = y + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(t.supplier, margin + 3, boxY);
  boxY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(data.supplier.name, margin + 3, boxY);
  boxY += 5;

  // === LOGO (in supplier box, centered) ===
  if (data.supplier.logoUrl) {
    try {
      const logoSize = 25; // Square logo like in reference
      const logoX = margin + (boxWidth / 2) - (logoSize / 2);
      doc.addImage(data.supplier.logoUrl, 'PNG', logoX, boxY, logoSize, logoSize);
      boxY += logoSize + 3;
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (data.supplier.registrationInfo) {
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(7);

    // Manually split by words to avoid spacing issues
    const words = data.supplier.registrationInfo.split(/\s+/); // Split by any whitespace
    let currentLine = '';
    const maxWidth = boxWidth - 8; // More conservative margin

    words.forEach((word, index) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = doc.getTextWidth(testLine);

      if (textWidth > maxWidth && currentLine) {
        doc.text(currentLine, margin + 3, boxY);
        boxY += 3;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    // Print remaining line
    if (currentLine) {
      doc.text(currentLine, margin + 3, boxY);
      boxY += 3;
    }

    boxY += 1;
    doc.setFontSize(8);
  }

  doc.setTextColor(0, 0, 0);
  doc.text(data.supplier.address, margin + 3, boxY);
  boxY += 3.5;
  doc.text(`${data.supplier.postalCode} ${data.supplier.city}`, margin + 3, boxY);
  boxY += 3.5;
  doc.text(data.supplier.country, margin + 3, boxY);
  boxY += 4;

  if (data.supplier.companyId) {
    doc.text(`${t.id}: ${data.supplier.companyId}`, margin + 3, boxY);
    boxY += 3;
  }
  if (data.supplier.taxId) {
    doc.text(`${t.taxId}: ${data.supplier.taxId}`, margin + 3, boxY);
    boxY += 3;
  }
  if (data.supplier.vatId) {
    doc.text(`${t.vatId}: ${data.supplier.vatId}`, margin + 3, boxY);
    boxY += 4;
  }

  // Add bank details in supplier box (like reference)
  if (data.bank.name && data.bank.account) {
    doc.setFontSize(7);
    doc.text(`${data.bank.name}: ${data.bank.account}`, margin + 3, boxY);
    boxY += 3;
  }
  if (data.bank.iban && data.bank.swift) {
    doc.text(`${t.iban} / ${t.swift}: ${data.bank.iban} / ${data.bank.swift}`, margin + 3, boxY);
    boxY += 3;
  }

  // Payment reference and method
  doc.text(`${t.paymentReference}: ${data.paymentReference}`, margin + 3, boxY);
  boxY += 3;
  doc.text(`Method of payment: ${data.paymentMethod}`, margin + 3, boxY);

  // Client box (right) - also dotted
  const clientX = margin + boxWidth + 5;
  doc.rect(clientX, y, boxWidth, boxHeight);

  // === INVOICE TITLE (top right, above client box like reference) ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  const invoiceTitle = `${t.invoice} ${data.invoiceNumber}`;
  doc.text(invoiceTitle, pageWidth - margin, y - 2, { align: 'right' });

  boxY = y + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(t.client, clientX + 3, boxY);
  boxY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(data.client.name, clientX + 3, boxY);
  boxY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.client.address, clientX + 3, boxY);
  boxY += 3.5;
  doc.text(`${data.client.postalCode} ${data.client.city}`, clientX + 3, boxY);
  boxY += 3.5;
  doc.text(data.client.country, clientX + 3, boxY);
  boxY += 4;

  if (data.client.companyId) {
    doc.text(`${t.id}: ${data.client.companyId}`, clientX + 3, boxY);
    boxY += 3;
  }
  if (data.client.taxId) {
    doc.text(`${t.taxId}: ${data.client.taxId}`, clientX + 3, boxY);
    boxY += 3;
  }
  if (data.client.vatId) {
    doc.text(`${t.vatId}: ${data.client.vatId}`, clientX + 3, boxY);
    boxY += 4;
  }

  // === DATES IN CLIENT BOX (like reference) ===
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  doc.setTextColor(80, 80, 80);
  doc.text(`${t.issueDate}:`, clientX + 3, boxY);
  doc.setTextColor(0, 0, 0);
  doc.text(data.issueDate, clientX + 35, boxY);
  boxY += 3.5;

  if (data.deliveryDate) {
    doc.setTextColor(80, 80, 80);
    doc.text(`${t.deliveryDate}:`, clientX + 3, boxY);
    doc.setTextColor(0, 0, 0);
    doc.text(data.deliveryDate, clientX + 35, boxY);
    boxY += 3.5;
  }

  doc.setTextColor(80, 80, 80);
  doc.text(`${t.dueDate}:`, clientX + 3, boxY);
  doc.setTextColor(0, 0, 0);
  doc.text(data.dueDate, clientX + 35, boxY);

  // Reset line dash
  doc.setLineDash([]);

  y += boxHeight + 5;

  // === DOTTED SEPARATOR LINE ===
  doc.setDrawColor(150, 150, 150);
  doc.setLineDash([2, 2]);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineDash([]);

  y += 6;

  // === ITEMS TABLE ===
  // Table header
  doc.setFillColor(230, 230, 230);
  const headerHeight = 7;
  doc.rect(margin, y, contentWidth, headerHeight, 'F');

  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  doc.line(margin, y + headerHeight, pageWidth - margin, y + headerHeight);

  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  // Column positions
  const colDesc = margin + 2;
  const colQty = pageWidth - margin - 90;
  const colUnit = pageWidth - margin - 70;
  const colPrice = pageWidth - margin - 50;
  const colTotal = pageWidth - margin - 2;

  doc.text('Item name and description', colDesc, y);
  doc.text(t.qty, colQty, y, { align: 'center' });
  doc.text(t.unit, colUnit, y, { align: 'center' });
  doc.text(t.unitPrice, colPrice, y, { align: 'right' });
  doc.text(t.total, colTotal, y, { align: 'right' });

  y += 4;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.setDrawColor(220, 220, 220);

  data.items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    const startY = y;

    // Handle multiline descriptions by splitting on newlines first
    const descriptionLines = item.description.split('\n');
    const allDescLines: string[] = [];
    const descMaxWidth = colQty - colDesc - 5;

    // Split each line by width, preserving manual line breaks
    descriptionLines.forEach((line) => {
      if (line.trim() === '') {
        allDescLines.push(''); // Preserve empty lines
      } else {
        // Manually wrap to avoid spacing issues with Slovak text
        const words = line.split(/\s+/); // Split by any whitespace
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = doc.getTextWidth(testLine);

          if (textWidth > descMaxWidth - 2 && currentLine) { // More conservative
            allDescLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          allDescLines.push(currentLine);
        }
      }
    });

    const lineHeight = 4;
    const rowHeight = Math.max(lineHeight * allDescLines.length, 7);

    allDescLines.forEach((line: string, i: number) => {
      doc.text(line, colDesc, y + (i * lineHeight));
    });

    const midY = startY + (rowHeight / 2) + 1;

    doc.text(item.quantity.toFixed(2), colQty, midY, { align: 'center' });
    doc.text(item.unit, colUnit, midY, { align: 'center' });
    doc.text(`€${item.unitPrice.toFixed(2)}`, colPrice, midY, { align: 'right' });
    doc.text(`€${item.totalPrice.toFixed(2)}`, colTotal, midY, { align: 'right' });

    y += rowHeight;

    // Row separator line
    doc.line(margin, y, pageWidth - margin, y);
    y += 2;
  });

  // === TOTALS SECTION ===
  y += 3;

  const totalsX = pageWidth - margin - 60;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (data.subtotal) {
    doc.setTextColor(80, 80, 80);
    doc.text(`${t.subtotal}:`, totalsX, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`€${data.subtotal.toFixed(2)}`, colTotal, y, { align: 'right' });
    y += 5;
  }

  if (data.vatAmount && data.vatAmount > 0) {
    doc.setTextColor(80, 80, 80);
    doc.text(`${t.vat}:`, totalsX, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`€${data.vatAmount.toFixed(2)}`, colTotal, y, { align: 'right' });
    y += 5;
  }

  // Total line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(totalsX - 5, y - 1, pageWidth - margin, y - 1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`${t.invoiceTotal}:`, totalsX, y + 4);
  doc.text(`€${data.totalAmount.toFixed(2)}`, colTotal, y + 4, { align: 'right' });

  y += 10;

  // Not VAT payer note (left aligned)
  const noteY = y;
  if (!data.isVatPayer) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`Note: ${t.notVatPayer}`, margin, noteY);
  }

  // === SIGNATURE AND COMPANY SEAL BOX (right side) ===
  const signatureBoxWidth = 85;
  const signatureBoxHeight = 35;
  const signatureX = pageWidth - margin - signatureBoxWidth;
  const signatureY = noteY + 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Signature and company seal:', signatureX, signatureY);

  y = signatureY + signatureBoxHeight + 10;

  // === QR CODE & BLUE PAYMENT INFO BOX ===
  const blueBoxY = y;
  const blueBoxHeight = 18;

  // QR Code on the left
  if (data.includeQrCode !== false) {
    try {
      const qrData = `SPD*1.0*ACC:${data.bank.iban}*AM:${data.totalAmount.toFixed(2)}*CC:EUR*MSG:${data.paymentReference}*X-VS:${data.paymentReference}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const qrSize = 35;
      doc.addImage(qrCodeDataUrl, 'PNG', margin, blueBoxY - 8, qrSize, qrSize);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  // Blue payment info box (right of QR code)
  const blueBoxX = margin + 42;
  const blueBoxWidth = contentWidth - 42;

  doc.setFillColor(173, 216, 230); // Light blue
  doc.rect(blueBoxX, blueBoxY, blueBoxWidth, blueBoxHeight, 'F');

  // Divide blue box into 3 sections
  const sectionWidth = blueBoxWidth / 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  let blueBoxTextY = blueBoxY + 5;

  // Section 1: IBAN
  doc.text(t.iban, blueBoxX + 3, blueBoxTextY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(data.bank.iban, blueBoxX + 3, blueBoxTextY + 5);

  // Section 2: Payment reference
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(t.paymentReference, blueBoxX + sectionWidth + 3, blueBoxTextY);
  doc.setFontSize(10);
  doc.text(data.paymentReference, blueBoxX + sectionWidth + 3, blueBoxTextY + 5);

  // Section 3: Due date
  doc.setFontSize(8);
  doc.text(t.dueDate, blueBoxX + sectionWidth * 2 + 3, blueBoxTextY);
  doc.setFontSize(10);
  doc.text(data.dueDate, blueBoxX + sectionWidth * 2 + 3, blueBoxTextY + 5);

  // Section 4: Total (below due date or extended)
  const totalX = blueBoxX + sectionWidth * 2 + 40;
  doc.setFontSize(8);
  doc.text('Total payment amount', totalX, blueBoxTextY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`${data.totalAmount.toFixed(2)} €`, totalX, blueBoxTextY + 6);

  y = blueBoxY + blueBoxHeight + 8;

  // === FOOTER ===
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.setLineDash([2, 2]);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineDash([]);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);

  let footerText = `${t.issuedBy}:`;
  if (data.supplier.name) footerText += ` ${data.supplier.name}`;

  doc.text(footerText, margin, y);

  if (data.supplier.phone) {
    doc.text(`☎ ${data.supplier.phone}`, margin + 60, y);
  }

  if (data.supplier.email) {
    doc.text(`✉ ${data.supplier.email}`, pageWidth - margin - 60, y, { align: 'right' });
  }

  // === "Created with" text (bottom right like reference) ===
  const bottomY = 285;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Created with SuperFaktura.sk', pageWidth - margin, bottomY, { align: 'right' });
  doc.text('Page 1/1', pageWidth - margin, bottomY + 3, { align: 'right' });

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
