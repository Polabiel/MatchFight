import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { AppSidebar } from "./_components/app-sidebar";

export const metadata = {
  title: "MatchFight",
  description: "Encontre lutadores, agende lutas e evolua no combate",
};

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <main className="bg-background text-foreground flex-1">{children}</main>
    </div>
  );
}
