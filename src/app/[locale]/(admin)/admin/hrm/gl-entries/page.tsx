import { getAdminClient, requireAdmin } from "@/lib/bosbase/admin";
import { BookOpen, Scale, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
}

export default async function GLEntriesPage() {
  await requireAdmin();
  const client = await getAdminClient();
  let entries: any[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await client.collection("hrm_gl_entries").getList(1, 100, {
      sort: "-posting_date,-created",
    });
    entries = res.items;
  } catch (err: any) {
    errorMsg = err instanceof Error ? err.message : "Chưa khởi tạo collection hrm_gl_entries hoặc chưa có dữ liệu";
  }

  const totalDebit = entries.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalCredit = entries.reduce((sum, item) => sum + (item.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-cyan-600" />
            Sổ Cái Kế Toán Tiền Lương (GL Journal)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Bút toán hạch toán kế toán kép tự động cho chi phí lương, bảo hiểm và các khoản phải trả người lao động.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isBalanced
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}>
            {isBalanced ? <Scale className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
            {isBalanced ? "Cân đối Kế toán (Nợ = Có)" : "Lệch cân đối!"}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            {entries.length} Bút toán
          </span>
        </div>
      </header>

      {errorMsg && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Thông báo:</p>
          <p className="mt-1">{errorMsg}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng phát sinh Nợ (Debit)</span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{formatVND(totalDebit)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng phát sinh Có (Credit)</span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{formatVND(totalCredit)}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Ngày ghi sổ</th>
                <th className="px-6 py-3.5">Tài khoản hạch toán</th>
                <th className="px-6 py-3.5 text-right">Phát sinh Nợ (Debit)</th>
                <th className="px-6 py-3.5 text-right">Phát sinh Có (Credit)</th>
                <th className="px-6 py-3.5">Chứng từ gốc</th>
                <th className="px-6 py-3.5">Diễn giải</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <tr key={entry.id} className={`hover:bg-slate-50/80 transition-colors ${entry.is_cancelled ? "opacity-50 line-through" : ""}`}>
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 text-xs">
                      {entry.posting_date ? entry.posting_date.split(" ")[0] : "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 text-xs">
                      {entry.account}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-right text-slate-900 font-mono">
                      {entry.debit > 0 ? formatVND(entry.debit) : "—"}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-right text-slate-900 font-mono">
                      {entry.credit > 0 ? formatVND(entry.credit) : "—"}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      <span className="font-semibold text-slate-700">{entry.voucher_type}</span> #{entry.voucher_no}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {entry.remarks || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Chưa có bút toán sổ cái nào được ghi nhận.
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
