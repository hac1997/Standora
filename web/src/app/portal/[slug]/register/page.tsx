"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ExhibitorRegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("register");
  const [form, setForm] = useState({ companyName: "", cnpj: "", contactName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: call API
    setTimeout(() => {
      setLoading(false);
      setError("Funcionalidade em desenvolvimento.");
    }, 1000);
  }

  const inputClass = "w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 mb-4 shadow-lg shadow-violet-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portal do Expositor</h1>
          <p className="text-slate-500 text-sm mt-1">Participe do evento como expositor</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06]">
            {(["register", "login"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-semibold transition-all ${tab === t ? "text-white border-b-2 border-violet-500" : "text-slate-500 hover:text-slate-300"}`}
              >
                {t === "register" ? "Primeiro acesso" : "Já tenho cadastro"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {tab === "register" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome da empresa *</label>
                    <input name="companyName" required placeholder="Empresa Ltda." value={form.companyName} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">CNPJ</label>
                    <input name="cnpj" placeholder="00.000.000/0001-00" value={form.cnpj} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Telefone</label>
                    <input name="phone" placeholder="(11) 99999-9999" value={form.phone} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome do responsável *</label>
                    <input name="contactName" required placeholder="João Silva" value={form.contactName} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email *</label>
                    <input name="email" type="email" required placeholder="contato@empresa.com" value={form.email} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha *</label>
                    <input name="password" type="password" required placeholder="••••••••" value={form.password} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 mt-2">
                  {loading ? "Criando conta..." : "Criar conta e participar"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <input name="email" type="email" required placeholder="contato@empresa.com" value={form.email} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
                  <input name="password" type="password" required placeholder="••••••••" value={form.password} onChange={handleChange} className={inputClass} />
                </div>
                {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 mt-2">
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
