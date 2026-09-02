"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
 PersonIcon,
 Crosshair1Icon,
 ImageIcon,
 ExitIcon,
} from "@radix-ui/react-icons";

import { Logo } from "@acme/ui/logo";
import { Separator } from "@acme/ui/separator";
import {
 Sidebar,
 SidebarContent,
 SidebarFooter,
 SidebarHeader,
 SidebarLink,
 SidebarMenu,
 SidebarMenuItem,
} from "@acme/ui/sidebar";
import { ThemeToggle } from "@acme/ui/theme";

import { authClient } from "~/auth/client";

interface SidebarNavProps {
 userName: string;
 userEmail?: string;
}

export function SidebarNav({ userName, userEmail }: SidebarNavProps) {
 const pathname = usePathname();
 const router = useRouter();

 const isActive = (href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

 const handleSignOut = async () => {
  await authClient.signOut();
  router.push("/");
  router.refresh();
 };

 return (
  <Sidebar>
   <SidebarHeader>
    <Link href="/" className="flex items-center">
     <Logo />
    </Link>
   </SidebarHeader>

   <SidebarContent>
    <SidebarMenu>
     <SidebarMenuItem>
      <SidebarLink href="/swipe" asChild active={isActive("/swipe")}>
       <Link href="/swipe" className="flex items-center gap-4">
        <ImageIcon className="size-5 shrink-0" />
        <span>Descobrir</span>
       </Link>
      </SidebarLink>
     </SidebarMenuItem>

     <SidebarMenuItem>
      <SidebarLink href="/fights" asChild active={isActive("/fights")}>
       <Link href="/fights" className="flex items-center gap-4">
        <Crosshair1Icon className="size-5 shrink-0" />
        <span>Lutas</span>
       </Link>
      </SidebarLink>
     </SidebarMenuItem>

     <SidebarMenuItem>
      <SidebarLink href="/profile" asChild active={isActive("/profile")}>
       <Link href="/profile" className="flex items-center gap-4">
        <PersonIcon className="size-5 shrink-0" />
        <span>Perfil</span>
       </Link>
      </SidebarLink>
     </SidebarMenuItem>
    </SidebarMenu>
   </SidebarContent>

   <SidebarFooter className="space-y-4">
    <Separator />
    <div className="flex items-center justify-between gap-4">
     <div className="flex min-w-0 items-center gap-3">
      <div className="bg-muted text-sidebar-foreground flex size-10 shrink-0 items-center justify-center">
       <span className="text-label-sm">{userName.charAt(0)}</span>
      </div>
      <div className="text-body-md min-w-0">
       <p className="text-foreground truncate font-semibold">
        {userName}
       </p>
       {userEmail ? (
        <p className="text-muted-foreground truncate text-xs">
         {userEmail}
        </p>
       ) : null}
      </div>
     </div>
    </div>
    <div className="flex items-center justify-between">
     <button
      type="button"
      onClick={handleSignOut}
      className="text-muted-foreground text-label-sm hover:text-destructive flex h-12 flex-1 items-center gap-4 px-4 transition-colors"
     >
      <ExitIcon className="size-5 shrink-0" />
      <span>Sair</span>
     </button>
     <ThemeToggle />
    </div>
   </SidebarFooter>
  </Sidebar>
 );
}
