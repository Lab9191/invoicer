import { NextResponse } from 'next/server';
import { generateInvoicePDF, type InvoiceData } from '@/lib/pdf-generator';

// Test endpoint to generate PDF with sample data
export async function GET() {
  try {
    const testData: InvoiceData = {
      supplier: {
        name: 'Lab9191 s. r. o.',
        address: 'Doležalova 3424/15C',
        city: 'Bratislava - mestská časť Ružinov',
        postalCode: '821 04',
        country: 'Slovakia',
        companyId: '56829396',
        taxId: '2122459955',
        registrationInfo: 'Obchodný register Mestského súdu Bratislava III, oddiel: Sro, vložka č. 185946/B',
        phone: '+421949498781',
        email: 'billing@lab9191.io',
        logoUrl: undefined, // Will be added if available
      },
      client: {
        name: 'REDPLAY LIMITED',
        address: 'The Engine House, Alexandra Road',
        city: 'Castletown',
        postalCode: 'IM9 1TG',
        country: 'Isle of Man',
        companyId: '134500C',
        vatId: 'GB005444901',
      },
      bank: {
        name: 'Tatra banka, a.s.',
        account: '2947259065/1100',
        iban: 'SK33 1100 0000 0029 4725 9065',
        swift: 'TATRSKBX',
      },
      invoiceNumber: '2025008',
      issueDate: '01.11.2025',
      deliveryDate: '31.10.2025',
      dueDate: '11.11.2025',
      paymentMethod: 'Wire transfer',
      paymentReference: '2025008',
      items: [
        {
          description: `Services according to Service Agreement No. 1 of 05.03.2025:
- developing and documenting the overall system architecture, ensuring scalability, security, and maintainability;
- overseeing the selection of technology stacks, ensuring alignment with business and technical requirements;
- establishing and enforcing technical standards, coding guidelines, and development methodologies;
- ensuring compliance with industry regulations, security standards, and data protection requirements;
- conducting technical risk assessments and defining mitigation strategies;
- defining and overseeing API architecture, microservices, and third-party integrations;
- designing cloud and on-premises infrastructure, ensuring high availability and disaster recovery;
- maintaining comprehensive architectural documentation for future scalability and team continuity;
- providing expert recommendations on system modernization, cloud migration, and digital transformation;
- supporting executive decision-making with technology roadmaps and strategic planning.`,
          quantity: 131,
          unit: 'hours',
          unitPrice: 140,
          totalPrice: 18340,
        },
      ],
      totalAmount: 18340,
      language: 'en',
      includeQrCode: true,
      isVatPayer: false,
    };

    const pdfBlob = await generateInvoicePDF(testData);
    const buffer = await pdfBlob.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="test-invoice.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating test PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
