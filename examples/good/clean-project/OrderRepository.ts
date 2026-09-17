import type { IOrderRepository } from "./OrderService";

export class OrderRepository implements IOrderRepository {
  async findAll(filter: any): Promise<any[]> {
    return [{ id: "order-1", ...filter }];
  }

  async save(order: any): Promise<any> {
    return { id: "order-new", ...order, createdAt: new Date() };
  }
}
