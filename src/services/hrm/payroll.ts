export interface SalaryEarningItem {
  name: string;
  amount: number;
}

export interface SalaryDeductionItem {
  name: string;
  amount: number;
  rate?: number;
}

export interface PayrollCalculationInput {
  baseSalary: number;
  standardDays?: number;
  paymentDays: number;
  allowances?: SalaryEarningItem[];
  dependentsCount?: number;
  customDeductions?: SalaryDeductionItem[];
}

export interface PayrollCalculationResult {
  baseSalary: number;
  standardDays: number;
  paymentDays: number;
  dailyRate: number;
  earnedSalary: number;
  totalAllowances: number;
  grossPay: number;
  bhxh: number; // 8%
  bhyt: number; // 1.5%
  bhtn: number; // 1%
  totalInsurance: number; // 10.5%
  taxableIncome: number;
  personalRelief: number; // 11,000,000 VND
  dependentRelief: number; // 4,400,000 VND per person
  assessedIncome: number; // Thu nhập tính thuế
  pitTax: number; // Thuế TNCN
  totalDeductions: number;
  netPay: number;
  earningsDetail: SalaryEarningItem[];
  deductionsDetail: SalaryDeductionItem[];
}

/**
 * Calculates progressive Personal Income Tax (TNCN) in Vietnam
 * Bậc 1: Đến 5 triệu: 5%
 * Bậc 2: Trên 5 đến 10 triệu: 10%
 * Bậc 3: Trên 10 đến 18 triệu: 15%
 * Bậc 4: Trên 18 đến 32 triệu: 20%
 * Bậc 5: Trên 32 đến 52 triệu: 25%
 * Bậc 6: Trên 52 đến 80 triệu: 30%
 * Bậc 7: Trên 80 triệu: 35%
 */
export function calculateVietnamesePIT(assessedIncome: number): number {
  if (assessedIncome <= 0) return 0;

  let tax = 0;
  if (assessedIncome <= 5000000) {
    tax = assessedIncome * 0.05;
  } else if (assessedIncome <= 10000000) {
    tax = 5000000 * 0.05 + (assessedIncome - 5000000) * 0.1;
  } else if (assessedIncome <= 18000000) {
    tax = 5000000 * 0.05 + 5000000 * 0.1 + (assessedIncome - 10000000) * 0.15;
  } else if (assessedIncome <= 32000000) {
    tax = 5000000 * 0.05 + 5000000 * 0.1 + 8000000 * 0.15 + (assessedIncome - 18000000) * 0.2;
  } else if (assessedIncome <= 52000000) {
    tax = 5000000 * 0.05 + 5000000 * 0.1 + 8000000 * 0.15 + 14000000 * 0.2 + (assessedIncome - 32000000) * 0.25;
  } else if (assessedIncome <= 80000000) {
    tax =
      5000000 * 0.05 +
      5000000 * 0.1 +
      8000000 * 0.15 +
      14000000 * 0.2 +
      20000000 * 0.25 +
      (assessedIncome - 52000000) * 0.3;
  } else {
    tax =
      5000000 * 0.05 +
      5000000 * 0.1 +
      8000000 * 0.15 +
      14000000 * 0.2 +
      20000000 * 0.25 +
      28000000 * 0.3 +
      (assessedIncome - 80000000) * 0.35;
  }

  return Math.round(tax);
}

/**
 * Calculates standard Vietnamese payroll: Gross, Deductions (BHXH, BHYT, BHTN, TNCN) and Net Pay
 */
export function calculateVietnamesePayroll(input: PayrollCalculationInput): PayrollCalculationResult {
  const standardDays = input.standardDays || 26;
  const paymentDays = Math.max(0, input.paymentDays);
  const dailyRate = Math.round(input.baseSalary / standardDays);
  const earnedSalary = Math.round(dailyRate * paymentDays);

  const allowances = input.allowances || [];
  const totalAllowances = allowances.reduce((sum, item) => sum + (item.amount || 0), 0);
  const grossPay = earnedSalary + totalAllowances;

  // Social Insurance deductions based on base salary
  const bhxh = Math.round(input.baseSalary * 0.08); // 8%
  const bhyt = Math.round(input.baseSalary * 0.015); // 1.5%
  const bhtn = Math.round(input.baseSalary * 0.01); // 1%
  const totalInsurance = bhxh + bhyt + bhtn; // 10.5%

  // Tax assessment
  const personalRelief = 11000000;
  const dependentsCount = input.dependentsCount || 0;
  const dependentRelief = dependentsCount * 4400000;

  const assessedIncome = Math.max(0, grossPay - totalInsurance - personalRelief - dependentRelief);
  const pitTax = calculateVietnamesePIT(assessedIncome);

  const customDeductions = input.customDeductions || [];
  const totalCustomDeductions = customDeductions.reduce((sum, item) => sum + (item.amount || 0), 0);

  const totalDeductions = totalInsurance + pitTax + totalCustomDeductions;
  const netPay = Math.max(0, grossPay - totalDeductions);

  const earningsDetail: SalaryEarningItem[] = [
    { name: "Lương theo ngày công", amount: earnedSalary },
    ...allowances,
  ];

  const deductionsDetail: SalaryDeductionItem[] = [
    { name: "BHXH (8%)", amount: bhxh, rate: 0.08 },
    { name: "BHYT (1.5%)", amount: bhyt, rate: 0.015 },
    { name: "BHTN (1%)", amount: bhtn, rate: 0.01 },
    { name: "Thuế TNCN", amount: pitTax },
    ...customDeductions,
  ];

  return {
    baseSalary: input.baseSalary,
    standardDays,
    paymentDays,
    dailyRate,
    earnedSalary,
    totalAllowances,
    grossPay,
    bhxh,
    bhyt,
    bhtn,
    totalInsurance,
    taxableIncome: grossPay,
    personalRelief,
    dependentRelief,
    assessedIncome,
    pitTax,
    totalDeductions,
    netPay,
    earningsDetail,
    deductionsDetail,
  };
}
