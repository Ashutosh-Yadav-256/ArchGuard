// Violation of ARCH-003: Repository importing from controller layer
import { OrderController } from "./OrderController";

export class OrderRepository {
  async findUser(id: string) {
    return { id, isVip: true };
  }

  async saveOrder(order: any, controller: OrderController) {
    return { id: "123", ...order };
  }
}
