export interface IOrderService {
  listOrders(query: any): Promise<any[]>;
  createOrder(dto: any): Promise<any>;
}

export interface IOrderRepository {
  findAll(filter: any): Promise<any[]>;
  save(order: any): Promise<any>;
}

export class OrderService implements IOrderService {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async listOrders(query: any): Promise<any[]> {
    return this.orderRepo.findAll(query);
  }

  async createOrder(dto: any): Promise<any> {
    const isReadyForCreation: boolean = Boolean(dto && dto.total > 0);
    if (!isReadyForCreation) {
      throw new Error("Invalid order total");
    }

    return this.orderRepo.save(dto);
  }
}
