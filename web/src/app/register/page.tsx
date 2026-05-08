"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateEmail, validatePassword, validateRequired } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", orgName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validate(name, value);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    validate(name, value);
  }

  function validate(name: string, value: string): boolean {
    let msg = "";
    if (name === "name")            msg = validateRequired(value, "Nome completo");
    if (name === "orgName")         msg = validateRequired(value, "Nome da organização");
    if (name === "email")           msg = validateEmail(value);
    if (name === "password")        msg = validatePassword(value);
    if (name === "confirmPassword") msg = value !== form.password ? "As senhas não coincidem." : "";
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
      if (name === "name")            msg = validateRequired(form[name], "Nome completo");
      if (name === "orgName")         msg = validateRequired(form[name], "Nome da organização");
      if (name === "email")           msg = validateEmail(form[name]);
      if (name === "password")        msg = validatePassword(form[name]);
      if (name === "confirmPassword") msg = form[name] !== form.password ? "As senhas não coincidem." : "";
      if (msg) ok = false;
      newErrors[name] = msg;
    });
    setErrors(newErrors);
    setTouched(newTouched);
    return ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    if (!validateAll()) return;
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, orgName: form.orgName, email: form.email, password: form.password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setApiError(data.error || "Erro ao criar conta.");
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  function inputCls(name: string) {
    const base = "w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm";
    const err  = touched[name] && errors[name];
    return `${base} ${err ? "border-red-500/60 focus:ring-red-500" : "border-white/10 focus:ring-violet-500"}`;
  }

  function FieldError({ name }: { name: string }) {
    if (!touched[name] || !errors[name]) return null;
    return <p className="text-red-400 text-[11px] mt-1 ml-0.5">{errors[name]}</p>;
  }

  const fields = [
    { name: "name",            label: "Seu nome completo",                type: "text",     placeholder: "João Silva" },
    { name: "orgName",         label: "Nome da organização / empresa",    type: "text",     placeholder: "Minha Eventos Ltda." },
    { name: "email",           label: "Email",                            type: "email",    placeholder: "seu@email.com" },
    { name: "password",        label: "Senha",                            type: "password", placeholder: "Mínimo 8 caracteres" },
    { name: "confirmPassword", label: "Confirmar senha",                  type: "password", placeholder: "Repita a senha" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 mb-4 shadow-lg shadow-violet-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Standora</h1>
          <p className="text-slate-400 mt-1 text-sm">Crie sua conta gratuitamente</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Criar conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label}</label>
                <input
                  id={`register-${field.name}`}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputCls(field.name)}
                />
                <FieldError name={field.name} />
              </div>
            ))}

            {apiError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {apiError}
              </div>
            )}

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando conta...
                </span>
              ) : "Criar conta grátis"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
