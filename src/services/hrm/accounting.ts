import BosBase from "bosbase";
import { getAdminClient } from "@/lib/bosbase/admin";

export interface GLEntryInput {
  posting_date: string;
  account: string;
  debit: number;
  credit: number;
  voucher_type: string;
  voucher_no: string;
  remarks?: string;
}

/**
 * Creates double-entry GL records for a submitted salary slip
 */
export async function postSalarySlipGL(
  slip: {
    id: string;
    payroll_period: string;
    gross_pay: number;
    net_pay: number;
    earnings_detail?: Array<{ name: string; amount: number }>;
    deductions_detail?: Array<{ name: string; amount: number }>;
  },
  customClient?: BosBase
): Promise<any[]> {
  const client = customClient || (await getAdminClient());
  const postingDate = new Date().toISOString().split("T")[0];

  const entries: GLEntryInput[] = [
    // 1. Debit: Chi phí lương (Salary Expense)
    {
      posting_date: postingDate,
      account: "6421 - Chi phí lương nhân viên",
      debit: slip.gross_pay,
      credit: 0,
      voucher_type: "Salary Slip",
      voucher_no: slip.id,
      remarks: `Hạch toán chi phí lương kỳ ${slip.payroll_period}`,
    },
    // 2. Credit: Phải trả người lao động (Salary Payable - Net Pay)
    {
      posting_date: postingDate,
      account: "3341 - Phải trả người lao động",
      debit: 0,
      credit: slip.net_pay,
      voucher_type: "Salary Slip",
      voucher_no: slip.id,
      remarks: `Lương thực nhận Net Pay kỳ ${slip.payroll_period}`,
    },
  ];

  // 3. Credit deduction items (BHXH, BHYT, BHTN, TNCN)
  if (slip.deductions_detail && Array.isArray(slip.deductions_detail)) {
    for (const d of slip.deductions_detail) {
      if (!d.amount || d.amount <= 0) continue;
      let accountName = "3388 - Các khoản trích theo lương khác";
      if (d.name.includes("BHXH")) accountName = "3383 - Bảo hiểm xã hội";
      else if (d.name.includes("BHYT")) accountName = "3384 - Bảo hiểm y tế";
      else if (d.name.includes("BHTN")) accountName = "3386 - Bảo hiểm thất nghiệp";
      else if (d.name.includes("TNCN") || d.name.includes("Thuế")) accountName = "3335 - Thuế TNCN khấu trừ";

      entries.push({
        posting_date: postingDate,
        account: accountName,
        debit: 0,
        credit: d.amount,
        voucher_type: "Salary Slip",
        voucher_no: slip.id,
        remarks: `Khấu trừ ${d.name} kỳ ${slip.payroll_period}`,
      });
    }
  }

  const createdRecords: any[] = [];
  for (const entry of entries) {
    const record = await client.collection("hrm_gl_entries").create(entry);
    createdRecords.push(record);
  }

  return createdRecords;
}

/**
 * Reverses GL entries when a salary slip is cancelled
 */
export async function reverseSalarySlipGL(salarySlipId: string, customClient?: BosBase): Promise<any[]> {
  const client = customClient || (await getAdminClient());
  const today = new Date().toISOString().split("T")[0];

  // Find all active GL entries for this voucher
  const existingEntries = await client.collection("hrm_gl_entries").getFullList({
    filter: `voucher_type = "Salary Slip" && voucher_no = "${salarySlipId}" && (is_cancelled = false || is_cancelled = null)`,
  });

  const reversedRecords: any[] = [];
  for (const item of existingEntries) {
    // 1. Mark existing entry as cancelled
    await client.collection("hrm_gl_entries").update(item.id, { is_cancelled: true });

    // 2. Create mirror entry with swapped debit & credit
    const reverseRecord = await client.collection("hrm_gl_entries").create({
      posting_date: today,
      account: item.account,
      debit: item.credit,
      credit: item.debit,
      voucher_type: "Salary Slip Reverse",
      voucher_no: salarySlipId,
      remarks: `Đảo bút toán huỷ phiếu lương [${salarySlipId}] - ${item.remarks || ""}`,
      is_cancelled: false,
    });
    reversedRecords.push(reverseRecord);
  }

  return reversedRecords;
}
