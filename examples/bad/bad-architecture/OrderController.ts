import { OrderRepository } from "./OrderRepository";

export class OrderController {
  constructor(private readonly orderRepo: OrderRepository) {}

  async checkout(req: any, res: any) {
    // Violation of ARCH-001: Direct repository call from controller
    const user = await this.orderRepo.findUser(req.userId);

    // Violation of ARCH-002: Fat controller with business logic
    let discount = 0;
    let tax = 0;
    let retries = 0;

    if (user.isVip) {
      discount = 0.2;
    } else if (req.total > 100) {
      discount = 0.1;
    } else {
      discount = 0;
    }

    for (const item of req.items) {
      tax += item.price * 0.08;
      console.log("Adding item tax", item.id);
    }

    while (retries < 3) {
      retries++;
      console.log("Checking fraud detection system retry", retries);
    }

    const finalAmount = req.total - discount + tax;
    console.log("Order final amount calculated:", finalAmount);
    return res.json({ finalAmount });
  }
}
