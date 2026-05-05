import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

const TABS = [
  { id: "organization", label: "Organização", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  { id: "team", label: "Equipe", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { id: "plan", label: "Plano", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
];

const PLAN_INFO = {
  name: "Freemium",
  color: "from-slate-500 to-slate-600",
  limits: [
    { label: "Eventos", used: 1, total: 1 },
    { label: "Estandes", used: 0, total: 20 },
    { label: "Participantes", used: 0, total: 200 },
  ],
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const orgId = (session?.user as { organizationId?: string })?.organizationId;

  let org: { id: string; name: string; cnpj: string | null; logoUrl: string | null } | null = null;
  let members: { id: string; name: string; email: string; role: string }[] = [];
  try {
    if (orgId) {
      org = await prisma.organization.findUnique({ where: { id: orgId }, select: { id: true, name: true, cnpj: true, logoUrl: true } });
      members = await prisma.user.findMany({ where: { organizationId: orgId }, select: { id: true, name: true, email: true, role: true } });
    }
  } catch { org = null; }

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Configurações</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie sua organização, equipe e plano.</p>
      </div>

      <div className="space-y-5">
        {/* Organization */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h2 className="font-semibold text-white">Organização</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">Nome da Organização</label>
                <p className="text-white font-medium">{org?.name || "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">CNPJ</label>
                <p className="text-white font-medium">{org?.cnpj || <span className="text-slate-600">Não informado</span>}</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-slate-600">Para editar as informações da organização, entre em contato com o suporte.</p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h2 className="font-semibold text-white">Equipe <span className="text-slate-600 font-normal">({members.length})</span></h2>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl text-xs font-semibold transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Convidar membro
            </button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {members.map((m) => (
              <div key={m.id} className="px-6 py-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-sm font-bold text-violet-300 shrink-0">
                  {getInitials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 text-sm">{m.name}</p>
                  <p className="text-xs text-slate-600">{m.email}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 capitalize">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <h2 className="font-semibold text-white">Plano atual</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${PLAN_INFO.color} text-white text-sm font-bold mb-2`}>
                  {PLAN_INFO.name}
                </div>
                <p className="text-slate-500 text-sm">Gratuito para sempre</p>
              </div>
              <button className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
                Fazer upgrade
              </button>
            </div>
            <div className="space-y-4">
              {PLAN_INFO.limits.map((limit) => {
                const pct = Math.round((limit.used / limit.total) * 100);
                return (
                  <div key={limit.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-400">{limit.label}</span>
                      <span className="text-slate-300 font-medium">{limit.used} / {limit.total}</span>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-gradient-to-r from-violet-500 to-blue-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
