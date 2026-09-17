// Violation of ARCH-004: Cross-module concrete import without explicit interface
import { PaymentService } from "../../payment/PaymentService";

export class OrderService {
  constructor(private readonly paymentService: PaymentService) {}

  async process() {
    return this.paymentService.charge();
  }
}
