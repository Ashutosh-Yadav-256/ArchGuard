import type { IOrderService } from "./OrderService";

export class OrderController {
  constructor(private readonly orderService: IOrderService) {}

  async listOrders(req: any, res: any) {
    try {
      const orders = await this.orderService.listOrders(req.query);
      return res.status(200).json(orders);
    } catch {
      return res.status(500).json({
        error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to list orders" },
      });
    }
  }

  async createOrder(req: any, res: any) {
    try {
      const created = await this.orderService.createOrder(req.body);
      return res.status(201).json(created);
    } catch {
      return res.status(400).json({
        error: { code: "INVALID_ORDER_PAYLOAD", message: "Order payload invalid" },
      });
    }
  }
}
