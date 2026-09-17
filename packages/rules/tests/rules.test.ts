import { describe, it, expect } from "vitest";
import type { RuleContext, ReviewFile } from "../../core/src/index.js";
import {
  ARCH001,
  ARCH002,
  ARCH003,
  ARCH004,
  API001,
  API002,
  API003,
  API004,
  TEST001,
  TEST002,
  TEST003,
  TEST004,
  SEC001,
  SEC002,
  SEC003,
  NAME001,
  NAME002,
  NAME003,
} from "../src/index.js";

// ─── Test Helpers ──────────────────────────────────────────────

function createContext(
  path: string,
  content: string,
  fileType: string = "controller",
  allFiles?: ReviewFile[],
): RuleContext {
  const file: ReviewFile = {
    path,
    content,
    fileType: fileType as ReviewFile["fileType"],
    language: "typescript",
  };
  return {
    file,
    allFiles: allFiles ?? [file],
    owner: "test",
    repo: "test",
    pullNumber: 1,
    commitSha: "abc",
  };
}

// ─── Architecture Rules ────────────────────────────────────────

describe("ARCH-001: Controllers must not access database directly", () => {
  it("should detect direct repository import in controller", () => {
    const code = `
import { OrderRepository } from "../repositories/OrderRepository";
export class OrderController {
  constructor(private repo: OrderRepository) {}
}
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    expect(ARCH001.applies(ctx)).toBe(true);
    const findings = ARCH001.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("ARCH-001");
  });

  it("should pass when controller only imports service", () => {
    const code = `
import { OrderService } from "../services/OrderService";
export class OrderController {
  constructor(private service: OrderService) {}
}
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    const findings = ARCH001.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("ARCH-002: Business logic in service layer", () => {
  it("should detect complex business logic in controller", () => {
    const code = `
export class OrderController {
  checkout() {
    let discount = 0;
    let tax = 0;
    let retries = 0;
    if (user.isVip) {
      discount = 0.2;
    } else if (order.total > 100) {
      discount = 0.1;
    } else {
      discount = 0;
    }
    for (const item of items) {
      tax += item.price * 0.08;
      console.log("processing item", item);
    }
    while (retries < 3) {
      retries++;
      console.log("retrying payment attempt", retries);
    }
    const finalPrice = total - discount + tax;
    console.log("final calculation", finalPrice);
    return finalPrice;
  }
}
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    expect(ARCH002.applies(ctx)).toBe(true);
    const findings = ARCH002.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("ARCH-002");
  });

  it("should pass on thin controller delegating to service", () => {
    const code = `
export class OrderController {
  checkout() {
    return this.orderService.checkout();
  }
}
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    const findings = ARCH002.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("ARCH-003: Repositories must not depend on controllers", () => {
  it("should detect repository importing from controller", () => {
    const code = `
import { OrderController } from "../controllers/order.controller";
export class OrderRepository {
  handle() {}
}
`;
    const ctx = createContext("src/order/order.repository.ts", code, "repository");
    expect(ARCH003.applies(ctx)).toBe(true);
    const findings = ARCH003.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("ARCH-003");
  });

  it("should pass when repository does not import controllers", () => {
    const code = `
import { OrderEntity } from "../entities/OrderEntity";
export class OrderRepository {}
`;
    const ctx = createContext("src/order/order.repository.ts", code, "repository");
    const findings = ARCH003.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("ARCH-004: Cross-module dependencies require explicit interfaces", () => {
  it("should detect direct concrete import across modules", () => {
    const code = `
import { PaymentService } from "../../payment/PaymentService";
export class OrderService {}
`;
    const ctx = createContext("src/order/OrderService.ts", code, "service");
    expect(ARCH004.applies(ctx)).toBe(true);
    const findings = ARCH004.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("ARCH-004");
  });

  it("should pass when importing an interface across modules", () => {
    const code = `
import { IPaymentService } from "../../payment/IPaymentService";
export class OrderService {}
`;
    const ctx = createContext("src/order/OrderService.ts", code, "service");
    const findings = ARCH004.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

// ─── API Rules ─────────────────────────────────────────────────

describe("API-001: Use appropriate HTTP status codes", () => {
  it("should detect returning 200 in catch block or for errors", () => {
    const code = `
export class OrderController {
  handle() {
    try {
      this.service.run();
    } catch (err) {
      return res.status(200).json({ error: "Failed" });
    }
  }
}
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    expect(API001.applies(ctx)).toBe(true);
    const findings = API001.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("API-001");
  });

  it("should pass when returning 400/500 in catch block", () => {
    const code = `
export class OrderController {
  handle() {
    try {
      this.service.run();
    } catch (err) {
      return res.status(500).json({ error: "Failed" });
    }
  }
}
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    const findings = API001.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("API-002: Endpoints must use consistent resource naming", () => {
  it("should detect verbs in REST route paths", () => {
    const code = `
router.get("/getUsers", (req, res) => {});
`;
    const ctx = createContext("src/user/user.controller.ts", code, "controller");
    expect(API002.applies(ctx)).toBe(true);
    const findings = API002.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("API-002");
  });

  it("should pass on standard REST noun paths", () => {
    const code = `
router.get("/users", (req, res) => {});
`;
    const ctx = createContext("src/user/user.controller.ts", code, "controller");
    const findings = API002.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("API-003: POST creation endpoints return 201", () => {
  it("should detect POST endpoint returning 200 instead of 201", () => {
    const code = `
router.post("/orders", (req, res) => {
  const created = createOrder();
  return res.status(200).json(created);
});
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    expect(API003.applies(ctx)).toBe(true);
    const findings = API003.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("API-003");
  });

  it("should pass when POST returns 201", () => {
    const code = `
router.post("/orders", (req, res) => {
  const created = createOrder();
  return res.status(201).json(created);
});
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    const findings = API003.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("API-004: Standard error response schema", () => {
  it("should detect raw string error responses", () => {
    const code = `
router.get("/orders", (req, res) => {
  res.status(400).send("Bad request error");
});
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    expect(API004.applies(ctx)).toBe(true);
    const findings = API004.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("API-004");
  });

  it("should pass when structured error object is returned", () => {
    const code = `
router.get("/orders", (req, res) => {
  res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid order" } });
});
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    const findings = API004.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

// ─── Testing Rules ─────────────────────────────────────────────

describe("TEST-001: New services require unit tests", () => {
  it("should flag a service file without matching test", () => {
    const ctx = createContext("src/order/OrderService.ts", "export class OrderService {}", "service");
    expect(TEST001.applies(ctx)).toBe(true);
    const findings = TEST001.evaluate(ctx);
    expect(findings.length).toBe(1);
    expect(findings[0]!.ruleId).toBe("TEST-001");
  });

  it("should pass when test file exists in PR", () => {
    const serviceFile: ReviewFile = {
      path: "src/order/OrderService.ts",
      content: "export class OrderService {}",
      fileType: "service",
      language: "typescript",
    };
    const testFile: ReviewFile = {
      path: "src/order/OrderService.test.ts",
      content: "describe('OrderService', () => {});",
      fileType: "test",
      language: "typescript",
    };

    const ctx = createContext(serviceFile.path, serviceFile.content, "service", [serviceFile, testFile]);
    const findings = TEST001.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("TEST-002: Critical business logic requires tests", () => {
  it("should detect long untested complex method", () => {
    const longMethod = `
export class OrderService {
  processOrder() {
    ${Array(20).fill("console.log('step');").join("\n    ")}
  }
}
`;
    const ctx = createContext("src/order/OrderService.ts", longMethod, "service");
    expect(TEST002.applies(ctx)).toBe(true);
    const findings = TEST002.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("TEST-002");
  });
});

describe("TEST-003: Minimum test coverage threshold", () => {
  it("should warn when test file ratio is below threshold", () => {
    const service1: ReviewFile = { path: "src/s1.ts", content: "", fileType: "service", language: "typescript" };
    const service2: ReviewFile = { path: "src/s2.ts", content: "", fileType: "service", language: "typescript" };
    const ctx = createContext(service1.path, service1.content, "service", [service1, service2]);
    expect(TEST003.applies(ctx)).toBe(true);
    const findings = TEST003.evaluate(ctx);
    expect(findings.length).toBe(1);
    expect(findings[0]!.ruleId).toBe("TEST-003");
  });
});

describe("TEST-004: Tests cannot be disabled to pass CI", () => {
  it("should detect test.skip in test file", () => {
    const code = `
describe("OrderService", () => {
  test.skip("should calculate tax", () => {});
});
`;
    const ctx = createContext("src/order/OrderService.test.ts", code, "test");
    expect(TEST004.applies(ctx)).toBe(true);
    const findings = TEST004.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("TEST-004");
  });

  it("should pass when tests are active", () => {
    const code = `
describe("OrderService", () => {
  test("should calculate tax", () => {});
});
`;
    const ctx = createContext("src/order/OrderService.test.ts", code, "test");
    const findings = TEST004.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

// ─── Security Rules ────────────────────────────────────────────

describe("SEC-001: No hardcoded secrets", () => {
  it("should detect AWS secret access key", () => {
    const code = `
const awsKey = "AKIAIOSFODNN7EXAMPLE";
`;
    const ctx = createContext("src/config.ts", code, "config");
    expect(SEC001.applies(ctx)).toBe(true);
    const findings = SEC001.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("SEC-001");
  });

  it("should pass on environment variable usage", () => {
    const code = `
const awsKey = process.env.AWS_ACCESS_KEY_ID;
`;
    const ctx = createContext("src/config.ts", code, "config");
    const findings = SEC001.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("SEC-002: Passwords must not be logged", () => {
  it("should detect logging of password or token", () => {
    const code = `
console.log("User password is:", password);
`;
    const ctx = createContext("src/auth/auth.service.ts", code, "service");
    expect(SEC002.applies(ctx)).toBe(true);
    const findings = SEC002.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("SEC-002");
  });

  it("should pass on safe logging", () => {
    const code = `
logger.info("User authenticated successfully", { userId });
`;
    const ctx = createContext("src/auth/auth.service.ts", code, "service");
    const findings = SEC002.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("SEC-003: Sensitive config must use env vars", () => {
  it("should detect hardcoded database connection strings", () => {
    const code = `
const dbUrl = "postgres://user:secret@localhost:5432/mydb";
`;
    const ctx = createContext("src/config/database.ts", code, "config");
    expect(SEC003.applies(ctx)).toBe(true);
    const findings = SEC003.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("SEC-003");
  });

  it("should pass when process.env is used for database connection", () => {
    const code = `
const dbUrl = process.env.DATABASE_URL;
`;
    const ctx = createContext("src/config/database.ts", code, "config");
    const findings = SEC003.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

// ─── Naming Rules ──────────────────────────────────────────────

describe("NAME-001: Classes use PascalCase", () => {
  it("should detect non-PascalCase class name", () => {
    const code = `
export class order_controller {}
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    expect(NAME001.applies(ctx)).toBe(true);
    const findings = NAME001.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("NAME-001");
  });

  it("should pass on PascalCase class name", () => {
    const code = `
export class OrderController {}
`;
    const ctx = createContext("src/order/order.controller.ts", code, "controller");
    const findings = NAME001.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("NAME-002: Functions use camelCase", () => {
  it("should detect snake_case or PascalCase functions", () => {
    const code = `
export function Calculate_Total() { return 0; }
`;
    const ctx = createContext("src/order/order.util.ts", code, "util");
    expect(NAME002.applies(ctx)).toBe(true);
    const findings = NAME002.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("NAME-002");
  });

  it("should pass on camelCase functions", () => {
    const code = `
export function calculateTotal() { return 0; }
`;
    const ctx = createContext("src/order/order.util.ts", code, "util");
    const findings = NAME002.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});

describe("NAME-003: Boolean variables use is/has/can prefixes", () => {
  it("should detect boolean variables without standard prefixes", () => {
    const code = `
const active: boolean = true;
`;
    const ctx = createContext("src/user/user.service.ts", code, "service");
    expect(NAME003.applies(ctx)).toBe(true);
    const findings = NAME003.evaluate(ctx);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.ruleId).toBe("NAME-003");
  });

  it("should pass on isActive boolean variable", () => {
    const code = `
const isActive: boolean = true;
`;
    const ctx = createContext("src/user/user.service.ts", code, "service");
    const findings = NAME003.evaluate(ctx);
    expect(findings.length).toBe(0);
  });
});
