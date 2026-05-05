import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-24">
      <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Standora</h1>
      <p className="text-xl text-slate-600 mb-10 max-w-2xl text-center leading-relaxed">
        O fim das planilhas e do WhatsApp na organização de feiras. A plataforma simples e integrada para gestão de eventos, expositores e estandes.
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button size="lg" className="text-base h-12 px-8">Acessar Painel do Organizador</Button>
        </Link>
        <Link href="/portal/demo-expo">
          <Button variant="outline" size="lg" className="text-base h-12 px-8">Ver Portal do Expositor</Button>
        </Link>
      </div>
    </div>
  )
}
