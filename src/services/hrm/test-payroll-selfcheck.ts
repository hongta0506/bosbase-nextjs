import assert from "node:assert/strict";
import { calculateVietnamesePIT, calculateVietnamesePayroll } from "./payroll.ts";

function runPayrollSelfCheck() {
  // 1. Check PIT calculation across all 7 progressive brackets
  assert.equal(calculateVietnamesePIT(0), 0, "PIT for 0 income should be 0");
  assert.equal(calculateVietnamesePIT(-1000000), 0, "PIT for negative income should be 0");
  assert.equal(calculateVietnamesePIT(5000000), 250000, "Bracket 1 (5% up to 5M)");
  assert.equal(calculateVietnamesePIT(10000000), 750000, "Bracket 2 (10% up to 10M)");
  assert.equal(calculateVietnamesePIT(18000000), 1950000, "Bracket 3 (15% up to 18M)");
  assert.equal(calculateVietnamesePIT(32000000), 4750000, "Bracket 4 (20% up to 32M)");
  assert.equal(calculateVietnamesePIT(52000000), 9750000, "Bracket 5 (25% up to 52M)");
  assert.equal(calculateVietnamesePIT(80000000), 18150000, "Bracket 6 (30% up to 80M)");
  assert.equal(calculateVietnamesePIT(100000000), 25150000, "Bracket 7 (35% over 80M)");

  // 2. Check standard payroll calculation (26 days, 26M gross, 0 dependents)
  const fullSlip = calculateVietnamesePayroll({
    baseSalary: 26000000,
    standardDays: 26,
    paymentDays: 26,
    dependentsCount: 0,
  });

  assert.equal(fullSlip.grossPay, 26000000, "Gross pay should be 26M");
  assert.equal(fullSlip.bhxh, 2080000, "BHXH 8% = 2.08M");
  assert.equal(fullSlip.bhyt, 390000, "BHYT 1.5% = 390k");
  assert.equal(fullSlip.bhtn, 260000, "BHTN 1% = 260k");
  assert.equal(fullSlip.totalInsurance, 2730000, "Total insurance = 2.73M");
  assert.equal(fullSlip.assessedIncome, 12270000, "Assessed income = 26M - 2.73M - 11M = 12.27M");
  assert.equal(fullSlip.pitTax, 1090500, "PIT = 1.0905M");
  assert.equal(fullSlip.totalDeductions, 3820500, "Total deduction = insurance + PIT");
  assert.equal(fullSlip.netPay, 22179500, "Net pay = gross - total deductions");

  // Accounting balance invariant: Debit (Gross) == Credit (Net + Deductions)
  const totalCredits = fullSlip.netPay + fullSlip.totalDeductions;
  assert.equal(totalCredits, fullSlip.grossPay, "Double entry accounting invariant must hold");

  // 3. Check prorated attendance (13 days worked out of 26)
  const halfSlip = calculateVietnamesePayroll({
    baseSalary: 26000000,
    standardDays: 26,
    paymentDays: 13,
    dependentsCount: 1,
  });

  assert.equal(halfSlip.earnedSalary, 13000000, "Earned salary prorated to 13M for 13/26 days");
  assert.equal(halfSlip.grossPay, 13000000);
  assert.equal(halfSlip.bhxh, 2080000);
  assert.equal(halfSlip.bhyt, 390000);
  assert.equal(halfSlip.bhtn, 260000);
  // Taxable: 13M - 2.73M = 10.27M. Relief: 11M + 4.4M = 15.4M -> assessed <= 0 -> PIT = 0
  assert.equal(halfSlip.pitTax, 0, "PIT should be 0 when relief exceeds taxable income");
  assert.equal(halfSlip.netPay, 13000000 - 2730000, "Net pay should be gross - insurance");

  console.log("ALL PAYROLL SELF-CHECKS PASSED: 7-tier PIT, prorated attendance, deductions, and double-entry balance.");
}

runPayrollSelfCheck();
