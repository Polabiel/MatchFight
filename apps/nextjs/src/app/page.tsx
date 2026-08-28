import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@acme/ui/button";

import { auth, getSession } from "~/auth/server";

function Logo() {
  return (
    <Link href="/" className="flex items-baseline gap-1">
      <span className="text-lg font-bold tracking-tight">Match</span>
      <span className="text-primary text-lg font-bold tracking-tight">
        Fight
      </span>
    </Link>
  );
}

function SignInButton() {
  return (
    <form>
      <Button
        variant="outline"
        size="sm"
        formAction={async () => {
          "use server";
          const res = await auth.api.signInSocial({
            body: { provider: "discord", callbackURL: "/" },
          });
          if (!res.url) throw new Error("No URL returned from signInSocial");
          redirect(res.url);
        }}
      >
        Entrar
      </Button>
    </form>
  );
}

function Navbar({ isAuthed }: { isAuthed: boolean }) {
  return (
    <header className="border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="text-muted-foreground flex items-center gap-6 text-sm">
          <Link
            href="/swipe"
            className="hover:text-foreground transition-colors"
          >
            Swipe
          </Link>
          <Link
            href="/fights"
            className="hover:text-foreground transition-colors"
          >
            Lutas
          </Link>
          <Link
            href="/profile"
            className="hover:text-foreground transition-colors"
          >
            Perfil
          </Link>
          {isAuthed ? (
            <Button asChild size="sm">
              <Link href="/swipe">Ir para o app</Link>
            </Button>
          ) : (
            <SignInButton />
          )}
        </nav>
      </div>
    </header>
  );
}

function Feature({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-border flex flex-col gap-3 border-t pt-6">
      <span className="text-primary text-sm font-medium tracking-widest">
        {index}
      </span>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export default async function HomePage() {
  const session = await getSession();
  const isAuthed = !!session?.user;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Navbar isAuthed={isAuthed} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="bg-primary/10 pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full blur-[120px]"
            aria-hidden
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 pb-24 text-center sm:pt-36 sm:pb-32">
            <span className="border-border bg-card text-muted-foreground mb-8 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
              Onde lutadores se encontram
            </span>
            <h1 className="max-w-4xl text-5xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-7xl">
              Encontre seu próximo{" "}
              <span className="text-primary">oponente</span>.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty">
              Deslize, combine e agende lutas com lutadores da sua categoria.
              Com a supervisão de juízes e a conversa certa antes de entrar no
              octógono.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {isAuthed ? (
                <Button asChild size="lg">
                  <Link href="/swipe">Começar a swipar</Link>
                </Button>
              ) : (
                <form>
                  <Button
                    size="lg"
                    formAction={async () => {
                      "use server";
                      const res = await auth.api.signInSocial({
                        body: { provider: "discord", callbackURL: "/swipe" },
                      });
                      if (!res.url) throw new Error("No URL returned");
                      redirect(res.url);
                    }}
                  >
                    Entrar com Discord
                  </Button>
                </form>
              )}
              <Button asChild size="lg" variant="outline">
                <Link href="/profile">Ver perfil</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-border/50 bg-card/40 border-y">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-3">
            <Feature
              index="01"
              title="Swipe"
              description="Descubra lutadores e juízes da sua categoria de peso. Filtre pelo que importa para você."
            />
            <Feature
              index="02"
              title="Match"
              description="Quando há interesse mútuo, vocês formam um par. Um juiz pode assumir a arbitragem."
            />
            <Feature
              index="03"
              title="Fight"
              description="Combine local, data e regras. Acompanhe o status até o resultado final."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            A luta começa antes do octógono.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg">
            Crie seu perfil, mostre seu cartel e deixe o próximo desafio vir até
            você.
          </p>
          <div className="mt-8">
            {isAuthed ? (
              <Button asChild size="lg">
                <Link href="/profile">Editar meu perfil</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/sign-up">Criar conta</Link>
              </Button>
            )}
          </div>
        </section>
      </main>

      <footer className="border-border/50 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm">
          <Logo />
          <p>© {new Date().getFullYear()} MatchFight</p>
        </div>
      </footer>
    </div>
  );
}
