"use client";

import { useState, useTransition } from "react";
import { loginAction } from "./actions";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[420px] bg-[#1a1a2e] flex-col justify-between p-10 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Standora</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">Gestão inteligente de feiras e eventos</h2>
          <p className="text-white/40 text-sm leading-relaxed">Mapa interativo, controle financeiro, portal do expositor e muito mais — tudo em um só lugar.</p>
        </div>
        <p className="text-white/20 text-xs">© 2026 Standora. Todos os direitos reservados.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <span className="text-[#1a1a2e] font-bold text-lg tracking-tight">Standora</span>
          </div>

          <h1 className="text-xl font-bold text-[#1a1a2e] mb-1">Entrar</h1>
          <p className="text-sm text-gray-400 mb-6">Acesse sua conta para gerenciar seus eventos.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Email</label>
              <input id="login-email" name="email" type="email" required defaultValue="" placeholder="seu@email.com" className="w-full px-3.5 py-2.5 bg-white border border-[#e2e4ea] rounded-lg text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Senha</label>
              <input id="login-password" name="password" type="password" required defaultValue="" placeholder="••••••••" className="w-full px-3.5 py-2.5 bg-white border border-[#e2e4ea] rounded-lg text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}
            <button id="login-submit" type="submit" disabled={isPending} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm shadow-sm shadow-indigo-600/20">
              {isPending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-400 mt-5">
            Não tem conta?{" "}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">Criar conta grátis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
