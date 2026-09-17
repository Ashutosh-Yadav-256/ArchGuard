// Violation of TEST-001: New service with no corresponding test file
export class InvoiceService {
  generateInvoice(orderId: string) {
    return { orderId, amount: 100, issuedAt: new Date() };
  }
}
