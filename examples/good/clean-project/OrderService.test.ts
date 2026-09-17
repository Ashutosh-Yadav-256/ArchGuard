import { describe, it, expect, vi } from "vitest";
import { OrderService } from "./OrderService";

describe("OrderService", () => {
  it("should list orders using repository", async () => {
    const mockRepo = {
      findAll: vi.fn().mockResolvedValue([{ id: "1", total: 50 }]),
      save: vi.fn(),
    };
    const service = new OrderService(mockRepo);
    const orders = await service.listOrders({});
    expect(orders).toHaveLength(1);
    expect(mockRepo.findAll).toHaveBeenCalled();
  });

  it("should create order when total is valid", async () => {
    const mockRepo = {
      findAll: vi.fn(),
      save: vi.fn().mockResolvedValue({ id: "2", total: 100 }),
    };
    const service = new OrderService(mockRepo);
    const created = await service.createOrder({ total: 100 });
    expect(created.id).toBe("2");
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
