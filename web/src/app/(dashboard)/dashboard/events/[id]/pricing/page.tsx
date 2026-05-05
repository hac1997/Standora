import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function PricingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let event: { id: string; name: string; stands: { id: string; name: string; widthM: number; depthM: number; basePrice: number; status: string; colorHex: string }[] } | null = null;
  try {
    event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, name: true, stands: { orderBy: { name: "asc" } } },
    });
  } catch { event = null; }

  if (!event) notFound();

  const stands = event.stands;
  const categories = [...new Set(stands.map((s) => `${s.widthM}x${s.depthM}m`))];
  const totalRevenue = stands.filter((s) => s.status === "ocupado").reduce((sum, s) => sum + s.basePrice, 0);
  const potentialRevenue = stands.reduce((sum, s) => sum + s.basePrice, 0);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1a1a2e] tracking-tight">Comercial</h1>
        <p className="text-sm text-gray-400 mt-0.5">Precificação de estandes e pacotes.</p>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-[#e2e4ea] p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Receita Potencial</p>
          <p className="text-lg font-bold text-[#1a1a2e] mt-0.5">{potentialRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#e2e4ea] p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Receita Confirmada</p>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">{totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#e2e4ea] p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Categorias</p>
          <p className="text-lg font-bold text-[#1a1a2e] mt-0.5">{categories.length}</p>
        </div>
      </div>

      {/* Stands table */}
      <div className="bg-white rounded-xl border border-[#e2e4ea] overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#e2e4ea]">
          <h2 className="text-[13px] font-semibold text-[#1a1a2e]">Estandes ({stands.length})</h2>
        </div>
        {stands.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm mb-1">Nenhum estande criado ainda.</p>
            <p className="text-gray-400 text-xs">Use o Editor de Mapa para adicionar estandes.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f6fa] text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                <th className="text-left px-5 py-2">Nome</th>
                <th className="text-left px-5 py-2">Tamanho</th>
                <th className="text-left px-5 py-2">Preço</th>
                <th className="text-left px-5 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f5]">
              {stands.map((stand) => (
                <tr key={stand.id} className="text-sm hover:bg-[#fafbfd] transition-colors">
                  <td className="px-5 py-2.5 font-medium text-[#1a1a2e]">
                    <span className="inline-block w-3 h-3 rounded mr-2 align-middle" style={{ backgroundColor: stand.colorHex }} />
                    {stand.name}
                  </td>
                  <td className="px-5 py-2.5 text-gray-500">{stand.widthM}×{stand.depthM}m</td>
                  <td className="px-5 py-2.5 text-gray-600 font-medium">{stand.basePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      stand.status === "ocupado" ? "bg-emerald-50 text-emerald-700"
                        : stand.status === "reservado" ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                    }`}>
                      {stand.status === "ocupado" ? "Ocupado" : stand.status === "reservado" ? "Reservado" : "Disponível"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
