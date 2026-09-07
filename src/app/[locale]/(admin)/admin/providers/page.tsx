import { getBosBaseRecords, requireAdmin } from "@/lib/bosbase/admin";

export default async function ProvidersPage() {
  await requireAdmin();

  const providers = await getBosBaseRecords("providers");

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-sm text-muted-foreground">Football Intelligence admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">Providers</h1>
        <p className="mt-2 text-muted-foreground">Read-only provider registry from BosBase.</p>
      </header>
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">ID</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr className="border-b last:border-0" key={provider.id}>
                <td className="px-4 py-3">{String(provider.name ?? "")}</td>
                <td className="px-4 py-3">{String(provider.slug ?? "")}</td>
                <td className="px-4 py-3 font-mono text-xs">{provider.id}</td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={3}>No providers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
