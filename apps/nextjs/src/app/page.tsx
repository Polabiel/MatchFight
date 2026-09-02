import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@acme/ui/button";

import { SignInButton } from "~/app/_components/sign-in-button";
import { auth, getSession } from "~/auth/server";

function Logo() {
  return (
    <Link href="/" className="flex items-baseline gap-1">
      <span className="text-foreground text-headline-md">Match</span>
      <span className="text-primary text-headline-md">Fight</span>
    </Link>
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
            Encontrar
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
              size="default"
              formAction={async () => {
                "use server";
                const res = await auth.api.signInSocial({
                  body: { provider: "discord", callbackURL: "/swipe" },
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
  image,
  imageAlt,
}: {
  index: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <div className="border-border flex flex-col gap-4 border-t pt-8">
      <div className="border-border relative aspect-4/3 overflow-hidden border">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 640px) 33vw, 100vw"
          className="object-cover contrast-125 grayscale"
        />
      </div>
      <span className="text-muted-foreground text-label-bold uppercase">
        {index}
      </span>
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
            <span className="text-muted-foreground text-label-bold mb-8 inline-flex items-center uppercase">
              Onde lutadores se encontram
            </span>
            <h1 className="text-display-lg max-w-4xl text-balance">
              Encontre seu próximo{" "}
              <span className="text-foreground">oponente</span>.
            </h1>{" "}
            <p className="text-muted-foreground text-body-lg mt-6 max-w-xl leading-relaxed">
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
                  variant="action"
                  size="default"
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
              <Button asChild size="default" variant="outline">
                <Link href={isAuthed ? "/profile" : "/profile/edit"}>
                  {isAuthed ? "Ver perfil" : "Criar perfil"}
                </Link>
              </Button>
            </div>
            <div className="border-border relative mt-16 aspect-21/9 w-full overflow-hidden border sm:mt-20">
              <Image
                src="/images/landing/hero.jpg"
                alt="Lutador treinando em saco de pancada em academia escura"
                fill
                priority
                sizes="(min-width: 1024px) 1152px, 100vw"
                className="object-cover contrast-125 grayscale"
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-border border-y">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-3">
            <Feature
              index="01"
              title="Descobrir"
              description="Descubra lutadores e juízes da sua categoria de peso. Filtre pelo que importa para você."
              image="/images/landing/feature-1.jpg"
              imageAlt="Lutador de MMA em retrato de perfil"
            />
            <Feature
              index="02"
              title="Combinar"
              description="Quando há interesse mútuo, vocês formam um par. Um juiz pode assumir a arbitragem."
              image="/images/landing/feature-2.jpg"
              imageAlt="Luvas de boxe penduradas"
            />
            <Feature
              index="03"
              title="Lutar"
              description="Combine local, data e regras. Acompanhe o status até o resultado final."
              image="/images/landing/feature-3.jpg"
              imageAlt="Ringue de boxe vazio sob holofotes"
            />
          </div>
        </section>

        {/* Galeria / Stats */}
        <section className="border-border border-b">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
            <div className="border-border relative aspect-3/4 overflow-hidden border sm:aspect-4/3 lg:aspect-3/4">
              <Image
                src="/images/landing/gallery-wide.jpg"
                alt="Lutadora treinando chutes em academia"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover contrast-125 grayscale"
              />
            </div>
            <div className="flex flex-col gap-8">
              <span className="text-muted-foreground text-label-bold uppercase">
                A comunidade
              </span>
              <h2 className="text-headline-lg max-w-md text-balance">
                Feito por quem vive o treino.
              </h2>
              <p className="text-muted-foreground text-body-lg max-w-md leading-relaxed">
                Do primeiro sparring à luta oficial: perfis verificados,
                categorias de peso reais e juízes credenciados para cada
                encontro.
              </p>
              <dl className="border-border grid grid-cols-3 border-t pt-8">
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground text-label-sm uppercase">
                    Lutadores
                  </dt>
                  <dd className="font-mono text-2xl font-bold">1.2k+</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground text-label-sm uppercase">
                    Lutas marcadas
                  </dt>
                  <dd className="font-mono text-2xl font-bold">340+</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground text-label-sm uppercase">
                    Juízes
                  </dt>
                  <dd className="font-mono text-2xl font-bold">58</dd>
                </div>
              </dl>
            </div>
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
              <Button asChild size="default" variant="outline">
                <Link href="/profile">Editar meu perfil</Link>
              </Button>
            ) : (
              <SignInButton
                variant="outline"
                size="default"
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
          <div className="flex items-center gap-6">
            <Link
              href="/sobre"
              className="hover:text-foreground transition-colors"
            >
              Sobre
            </Link>
            <Link
              href="/termos"
              className="hover:text-foreground transition-colors"
            >
              Termos
            </Link>
            <Link
              href="/privacidade"
              className="hover:text-foreground transition-colors"
            >
              Privacidade
            </Link>
            <p>© {new Date().getFullYear()} MatchFight</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
