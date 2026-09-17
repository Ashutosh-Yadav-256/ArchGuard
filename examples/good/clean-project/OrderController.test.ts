import { describe, it, expect, vi } from "vitest";
import { OrderController } from "./OrderController";

describe("OrderController", () => {
  it("should return 200 on listOrders", async () => {
    const mockService = {
      listOrders: vi.fn().mockResolvedValue([{ id: "1" }]),
      createOrder: vi.fn(),
    };
    const controller = new OrderController(mockService);
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await controller.listOrders({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 201 on createOrder", async () => {
    const mockService = {
      listOrders: vi.fn(),
      createOrder: vi.fn().mockResolvedValue({ id: "2" }),
    };
    const controller = new OrderController(mockService);
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await controller.createOrder({ body: { total: 100 } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
