import { getAdminClient, requireAdmin } from "@/lib/bosbase/admin";
import { Banknote, FileCheck, FileX, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
}

export default async function PayrollPage() {
  await requireAdmin();
  const client = await getAdminClient();
  let slips: any[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await client.collection("hrm_salary_slips").getList(1, 50, {
      sort: "-payroll_period,-created",
      expand: "employee",
    });
    slips = res.items;
  } catch (err: any) {
    errorMsg = err instanceof Error ? err.message : "Chưa khởi tạo collection hrm_salary_slips hoặc chưa có dữ liệu";
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Submitted":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><FileCheck className="h-3 w-3" /> Đã xác nhận</span>;
      case "Cancelled":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><FileX className="h-3 w-3" /> Đã huỷ</span>;
      case "Draft":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="h-3 w-3" /> Bản nháp</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-600 bg-slate-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Banknote className="h-6 w-6 text-cyan-600" />
            Bảng Lương & Phiếu Lương (Payroll & Salary Slips)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tổng hợp công thực tế, tính toán Gross Pay, trích đóng BHXH/BHYT, Thuế TNCN và Lương thực nhận NET.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Tổng số: {slips.length} Phiếu lương
        </span>
      </header>

      {errorMsg && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Thông báo:</p>
          <p className="mt-1">{errorMsg}</p>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Kỳ lương</th>
                <th className="px-6 py-3.5">Nhân viên</th>
                <th className="px-6 py-3.5 text-right">Ngày công</th>
                <th className="px-6 py-3.5 text-right">Tổng thu nhập (Gross)</th>
                <th className="px-6 py-3.5 text-right">Khấu trừ (Deductions)</th>
                <th className="px-6 py-3.5 text-right font-bold text-slate-900">Thực nhận (NET)</th>
                <th className="px-6 py-3.5 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slips.length > 0 ? (
                slips.map((slip) => {
                  const emp = slip.expand?.employee;
                  return (
                    <tr key={slip.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-900 text-xs">
                        {slip.payroll_period}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{emp?.full_name || slip.employee}</div>
                        <div className="text-xs text-slate-500 font-mono">{emp?.code}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-right text-slate-700">
                        {slip.payment_days} công
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-right text-slate-900 font-mono">
                        {formatVND(slip.gross_pay)}
                      </td>
                      <td className="px-6 py-4 text-xs text-right text-rose-600 font-mono">
                        -{formatVND(slip.total_deduction)}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-right text-emerald-600 font-mono">
                        {formatVND(slip.net_pay)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(slip.status)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Chưa có phiếu lương nào được tạo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
