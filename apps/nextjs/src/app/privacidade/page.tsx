import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="text-foreground text-headline-md">Match</span>
            <span className="text-primary text-headline-md">Fight</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-20">
        <span className="text-muted-foreground text-label-bold mb-6 uppercase">
          Legal
        </span>
        <h1 className="text-headline-lg mb-6">Privacidade</h1>
        <div className="text-muted-foreground text-body-md space-y-4 leading-relaxed">
          <p>
            A Política de Privacidade do MatchFight está sendo elaborada.
            Valorizamos a transparência no tratamento dos dados dos nossos
            usuários.
          </p>
          <p>
            Em breve, esta página conterá informações detalhadas sobre coleta,
            armazenamento e uso de dados pessoais, em conformidade com a LGPD.
          </p>
        </div>
        <div className="mt-10">
          <Link
            href="/"
            className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold inline-flex h-12 items-center justify-center border-2 px-6 transition-colors"
          >
            ← Voltar
          </Link>
        </div>
      </main>

      <footer className="border-border border-t">
        <div className="text-muted-foreground text-body-md mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <p>© {new Date().getFullYear()} MatchFight</p>
        </div>
      </footer>
    </div>
  );
}
