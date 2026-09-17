// Violation of NAME-001: Class name does not use PascalCase
export class order_controller {
  handle() {}
}

// Violation of NAME-002: Function name does not use camelCase
export function Calculate_Discount_Rate(code: string): number {
  return 0.15;
}

// Violation of NAME-003: Boolean variable lacks is/has/can/should prefix
export const active: boolean = true;
