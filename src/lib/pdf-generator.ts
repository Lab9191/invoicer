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

  // === LOGO (top right if available) ===
  if (data.supplier.logoUrl) {
    try {
      // Logo will be 40mm wide, positioned in top right
      const logoWidth = 40;
      const logoHeight = 20; // Adjust based on aspect ratio
      const logoX = pageWidth - margin - logoWidth;
      doc.addImage(data.supplier.logoUrl, 'PNG', logoX, y, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // === SUPPLIER & CLIENT INFO BOXES ===
  // Two boxes side by side, taking equal width
  const boxWidth = (contentWidth - 5) / 2;
  const boxHeight = 45;

  // Supplier box (left)
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
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

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (data.supplier.registrationInfo) {
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(7);

    // Manually split by words to avoid spacing issues
    const words = data.supplier.registrationInfo.split(' ');
    let currentLine = '';
    const maxWidth = boxWidth - 6;

    words.forEach((word) => {
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
  }

  // Client box (right)
  const clientX = margin + boxWidth + 5;
  doc.rect(clientX, y, boxWidth, boxHeight);

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
  }

  y += boxHeight + 8;

  // === INVOICE TITLE & DETAILS BOX ===
  const detailsBoxHeight = 20;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, contentWidth, detailsBoxHeight, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, y, contentWidth, detailsBoxHeight);

  let detailsY = y + 6;

  // Invoice title (left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(t.invoice, margin + 3, detailsY);

  // Invoice number (right)
  doc.setFontSize(16);
  doc.text(data.invoiceNumber, pageWidth - margin - 3, detailsY, { align: 'right' });

  detailsY += 7;

  // Details in row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const detailsLeft = margin + 3;
  const detailsMid = margin + (contentWidth / 2);

  doc.setTextColor(80, 80, 80);
  doc.text(`${t.issueDate}:`, detailsLeft, detailsY);
  doc.setTextColor(0, 0, 0);
  doc.text(data.issueDate, detailsLeft + 30, detailsY);

  doc.setTextColor(80, 80, 80);
  doc.text(`${t.dueDate}:`, detailsMid, detailsY);
  doc.setTextColor(0, 0, 0);
  doc.text(data.dueDate, detailsMid + 30, detailsY);

  y += detailsBoxHeight + 8;

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

  doc.text(t.itemDescription, colDesc, y);
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
        const words = line.split(' ');
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = doc.getTextWidth(testLine);

          if (textWidth > descMaxWidth && currentLine) {
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

  // Not VAT payer note
  if (!data.isVatPayer) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(t.notVatPayer, margin, y);
    y += 6;
  }

  // Notes
  if (data.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const notesLines = doc.splitTextToSize(data.notes, contentWidth - 10);
    notesLines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 3.5;
    });
    y += 3;
  }

  // === PAYMENT DETAILS BOX ===
  y += 2;
  const paymentBoxHeight = 25;

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth - 30, paymentBoxHeight);

  let paymentY = y + 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(t.paymentDetails, margin + 3, paymentY);
  paymentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  doc.text(`${t.iban}: ${data.bank.iban}`, margin + 3, paymentY);
  paymentY += 4;

  if (data.bank.swift) {
    doc.text(`${t.swift}: ${data.bank.swift}`, margin + 3, paymentY);
    paymentY += 4;
  }

  doc.text(`${t.paymentReference}: ${data.paymentReference}`, margin + 3, paymentY);

  // QR Code (right side of payment box)
  if (data.includeQrCode !== false) {
    try {
      const qrData = `SPD*1.0*ACC:${data.bank.iban}*AM:${data.totalAmount.toFixed(2)}*CC:EUR*MSG:${data.paymentReference}*X-VS:${data.paymentReference}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 0,
        errorCorrectionLevel: 'M'
      });

      const qrSize = 23;
      const qrX = pageWidth - margin - qrSize - 2;
      const qrY = y + 1;
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  // === FOOTER ===
  y = 277;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);

  const footerParts = [];
  if (data.supplier.email) footerParts.push(data.supplier.email);
  if (data.supplier.phone) footerParts.push(data.supplier.phone);

  if (footerParts.length > 0) {
    doc.text(footerParts.join('  •  '), pageWidth / 2, y, { align: 'center' });
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
