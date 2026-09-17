export class CalculatorService {
  // Violation of TEST-002: Complex business logic without unit tests
  calculateCompoundInterest(principal: number, rate: number, years: number) {
    let balance = principal;
    console.log("Starting calculation for principal", principal);
    for (let i = 1; i <= years; i++) {
      const yearlyInterest = balance * rate;
      balance += yearlyInterest;
      console.log(`Year ${i}: Interest = ${yearlyInterest}, Balance = ${balance}`);
      if (balance > 1000000) {
        console.log("High value account milestone reached");
      }
    }
    const bonusMultiplier = years > 10 ? 1.05 : 1.0;
    const finalBalance = balance * bonusMultiplier;
    console.log("Applying bonus multiplier", bonusMultiplier);
    console.log("Audit log: calculation completed successfully");
    console.log("Final balance computed:", finalBalance);
    return finalBalance;
  }
}
