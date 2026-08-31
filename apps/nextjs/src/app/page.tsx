import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@acme/ui/button";

import { auth, getSession } from "~/auth/server";

function Logo() {
  return (
    <Link href="/" className="flex items-baseline gap-1">
      <span className="text-foreground text-headline-md">Match</span>
      <span className="text-foreground text-headline-md">Fight</span>
    </Link>
  );
}

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "action";

type ButtonSize = "default" | "sm" | "lg" | "icon";

function SignInButton({
  className,
  variant,
  size,
  formAction,
}: {
  className: string;
  variant: ButtonVariant;
  size: ButtonSize;
  formAction: () => Promise<void>;
}) {
  return (
    <form>
      <Button
        variant={variant}
        size={size}
        className={className}
        formAction={formAction}
      >
        Entrar
      </Button>
    </form>
  );
}

function Navbar({ isAuthed }: { isAuthed: boolean }) {
  return (
    <header className="border-border bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="text-muted-foreground text-body-md flex items-center gap-6">
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
            <SignInButton
              variant="outline"
              size="sm"
              className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
              formAction={async () => {
                "use server";
                const res = await auth.api.signInSocial({
                  body: { provider: "discord", callbackURL: "/" },
                });
                if (!res.url)
                  throw new Error("No URL returned from signInSocial");
                redirect(res.url);
              }}
            />
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
    <div className="border-border flex flex-col gap-4 border-t pt-8">
      <span className="text-muted-foreground text-label-bold uppercase">{index}</span>
      <h3 className="text-headline-md">{title}</h3>
      <p className="text-muted-foreground text-body-md">{description}</p>
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
<section className="border-border relative overflow-hidden border-b">
  <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 pb-24 text-center sm:pt-36 sm:pb-32">
<span className="border-border bg-background text-muted-foreground text-label-bold mb-8 inline-flex items-center border-2 px-4 py-2 uppercase">
  Onde lutadores se encontram
</span>
            <h1 className="text-display-lg max-w-4xl text-balance">
              Encontre seu próximo{" "}
              <span className="text-foreground">oponente</span>.
            </h1>            <p className="text-muted-foreground text-body-lg mt-6 max-w-xl leading-relaxed">
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
                <SignInButton
                  variant="default"
                  size="lg"
                  className="bg-primary text-primary-foreground border-primary hover:bg-foreground hover:border-foreground text-label-bold h-12 border-2 px-6"
                  formAction={async () => {
                    "use server";
                    const res = await auth.api.signInSocial({
                      body: { provider: "discord", callbackURL: "/swipe" },
                    });
                    if (!res.url) throw new Error("No URL returned");
                    redirect(res.url);
                  }}
                />
              )}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
              >
                <Link href="/profile">Ver perfil</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it works */}
<section className="border-border border-y">
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
          <h2 className="text-headline-lg max-w-2xl text-balance">
            A luta começa antes do octógono.
          </h2>
          <p className="text-muted-foreground text-body-lg mt-4 max-w-lg">
            Crie seu perfil, mostre seu cartel e deixe o próximo desafio vir até
            você.
          </p>
          <div className="mt-8">
            {isAuthed ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
              >
                <Link href="/profile">Editar meu perfil</Link>
              </Button>
            ) : (
              <SignInButton
                variant="outline"
                size="lg"
                className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
                formAction={async () => {
                  "use server";
                  const res = await auth.api.signInSocial({
                    body: { provider: "discord", callbackURL: "/profile/edit" },
                  });
                  if (!res.url) throw new Error("No URL returned");
                  redirect(res.url);
                }}
              />
            )}
          </div>
        </section>
      </main>

<footer className="border-border border-t">
  <div className="text-muted-foreground text-body-md mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <Logo />
          <p>© {new Date().getFullYear()} MatchFight</p>
        </div>
      </footer>
    </div>
  );
}
