"use client";

import { useState } from "react";
import {
  maskCNPJ, maskPhone,
  validateEmail, validatePhone, validateCNPJ, validatePassword, validateRequired,
} from "@/lib/validation";

export default function ExhibitorRegisterPage() {
  const [tab, setTab] = useState<"login" | "register">("register");
  const [form, setForm] = useState({ companyName: "", cnpj: "", contactName: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Masked change handler
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    let masked = value;
    if (name === "cnpj")  masked = maskCNPJ(value);
    if (name === "phone") masked = maskPhone(value);
    setForm((p) => ({ ...p, [name]: masked }));
    if (touched[name]) validate(name, masked);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    validate(name, value);
  }

  function validate(name: string, value: string): boolean {
    let msg = "";
    if (name === "companyName") msg = validateRequired(value, "Nome da empresa");
    if (name === "contactName") msg = validateRequired(value, "Nome do responsável");
    if (name === "email")       msg = validateEmail(value);
    if (name === "phone")       msg = validatePhone(value);
    if (name === "cnpj")        msg = validateCNPJ(value);
    if (name === "password")    msg = validatePassword(value);
    setErrors((p) => ({ ...p, [name]: msg }));
    return !msg;
  }

  function validateAll(): boolean {
    const fields = Object.keys(form) as (keyof typeof form)[];
    let ok = true;
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    fields.forEach((name) => {
      newTouched[name] = true;
      let msg = "";
      if (name === "companyName") msg = validateRequired(form[name], "Nome da empresa");
      if (name === "contactName") msg = validateRequired(form[name], "Nome do responsável");
      if (name === "email")       msg = validateEmail(form[name]);
      if (name === "phone")       msg = validatePhone(form[name]);
      if (name === "cnpj")        msg = validateCNPJ(form[name]);
      if (name === "password")    msg = validatePassword(form[name]);
      if (msg) ok = false;
      newErrors[name] = msg;
    });
    setErrors(newErrors);
    setTouched(newTouched);
    return ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    setApiError("");
    setTimeout(() => {
      setLoading(false);
      setApiError("Funcionalidade em desenvolvimento.");
    }, 1000);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const emailOk = validate("email", form.email);
    const passOk  = validate("password", form.password);
    setTouched({ email: true, password: true });
    if (!emailOk || !passOk) return;
    setLoading(true);
    setApiError("");
    setTimeout(() => { setLoading(false); setApiError("Funcionalidade em desenvolvimento."); }, 1000);
  }

  function inputCls(name: string) {
    const base = "w-full px-4 py-3 bg-white/[0.04] border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm";
    const err  = touched[name] && errors[name];
    return `${base} ${err ? "border-red-500/60 focus:ring-red-500" : "border-white/[0.08] focus:ring-violet-500"}`;
  }

  function FieldError({ name }: { name: string }) {
    if (!touched[name] || !errors[name]) return null;
    return <p className="text-red-400 text-[11px] mt-1 ml-0.5">{errors[name]}</p>;
  }

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
                onClick={() => { setTab(t); setErrors({}); setTouched({}); setApiError(""); }}
                className={`flex-1 py-4 text-sm font-semibold transition-all ${tab === t ? "text-white border-b-2 border-violet-500" : "text-slate-500 hover:text-slate-300"}`}
              >
                {t === "register" ? "Primeiro acesso" : "Já tenho cadastro"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {tab === "register" ? (
              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  {/* Nome da empresa */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome da empresa *</label>
                    <input name="companyName" placeholder="Empresa Ltda." value={form.companyName}
                      onChange={handleChange} onBlur={handleBlur} className={inputCls("companyName")} />
                    <FieldError name="companyName" />
                  </div>
                  {/* CNPJ */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">CNPJ</label>
                    <input name="cnpj" placeholder="00.000.000/0001-00" value={form.cnpj}
                      onChange={handleChange} onBlur={handleBlur} className={inputCls("cnpj")} />
                    <FieldError name="cnpj" />
                  </div>
                  {/* Telefone */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Telefone</label>
                    <input name="phone" placeholder="(11) 99999-9999" value={form.phone}
                      onChange={handleChange} onBlur={handleBlur} className={inputCls("phone")} />
                    <FieldError name="phone" />
                  </div>
                  {/* Nome do responsável */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome do responsável *</label>
                    <input name="contactName" placeholder="João Silva" value={form.contactName}
                      onChange={handleChange} onBlur={handleBlur} className={inputCls("contactName")} />
                    <FieldError name="contactName" />
                  </div>
                  {/* Email */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email *</label>
                    <input name="email" type="email" placeholder="contato@empresa.com" value={form.email}
                      onChange={handleChange} onBlur={handleBlur} className={inputCls("email")} />
                    <FieldError name="email" />
                  </div>
                  {/* Senha */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha *</label>
                    <input name="password" type="password" placeholder="Mínimo 8 caracteres" value={form.password}
                      onChange={handleChange} onBlur={handleBlur} className={inputCls("password")} />
                    <FieldError name="password" />
                  </div>
                </div>

                {apiError && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{apiError}</p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 mt-2">
                  {loading ? "Criando conta..." : "Criar conta e participar"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <input name="email" type="email" placeholder="contato@empresa.com" value={form.email}
                    onChange={handleChange} onBlur={handleBlur} className={inputCls("email")} />
                  <FieldError name="email" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
                  <input name="password" type="password" placeholder="••••••••" value={form.password}
                    onChange={handleChange} onBlur={handleBlur} className={inputCls("password")} />
                  <FieldError name="password" />
                </div>
                {apiError && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{apiError}</p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 mt-2">
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
