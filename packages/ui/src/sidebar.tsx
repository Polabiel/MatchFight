import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";

import { cn } from "@acme/ui";

/**
 * Sidebar primitives for MatchFight.
 * Follows the DESIGN.md "Weigh-In" system:
 * - 0px radius, no shadows, no backdrop-filter
 * - Depth via 1-2px charcoal borders + muted tonal layers
 * - Blood Red only as the single active-item accent per screen
 */

export function Sidebar({
 className,
 ...props
}: React.ComponentProps<"aside">) {
 return (
  <aside
   data-slot="sidebar"
   className={cn(
    "bg-sidebar text-sidebar-foreground flex h-svh w-72 shrink-0 flex-col overflow-y-auto border-r-2 border-sidebar-border",
    className,
   )}
   {...props}
  />
 );
}

export function SidebarHeader({
 className,
 ...props
}: React.ComponentProps<"header">) {
 return (
  <header
   data-slot="sidebar-header"
   className={cn("flex h-16 shrink-0 items-center px-6", className)}
   {...props}
  />
 );
}

export function SidebarContent({
 className,
 ...props
}: React.ComponentProps<"div">) {
 return (
  <div
   data-slot="sidebar-content"
   className={cn("flex-1 space-y-8 overflow-y-auto px-4 py-6", className)}
   {...props}
  />
 );
}

export function SidebarFooter({
 className,
 ...props
}: React.ComponentProps<"footer">) {
 return (
  <footer
   data-slot="sidebar-footer"
   className={cn(
    "shrink-0 border-t-2 border-sidebar-border px-4 py-6",
    className,
   )}
   {...props}
  />
 );
}

export function SidebarMenu({
 className,
 ...props
}: React.ComponentProps<"nav">) {
 return (
  <nav
   data-slot="sidebar-menu"
   className={cn("space-y-1", className)}
   {...props}
  />
 );
}

export function SidebarMenuItem({
 className,
 ...props
}: React.ComponentProps<"div">) {
 return (
  <div
   data-slot="sidebar-menu-item"
   className={cn("relative", className)}
   {...props}
  />
 );
}

export function SidebarLink({
 className,
 asChild = false,
 active = false,
 ...props
}: React.ComponentProps<"a"> & {
 asChild?: boolean;
 active?: boolean;
}) {
 const Comp = asChild ? SlotPrimitive.Slot : "a";

 return (
  <Comp
   data-slot="sidebar-link"
   data-active={active || undefined}
   aria-current={active ? "page" : undefined}
   className={cn(
    "text-label-sm focus-visible:ring-sidebar-ring flex h-12 items-center gap-4 border-l-2 border-transparent px-4 transition-colors focus-visible:ring-2 focus-visible:outline-none",
    active
     ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
     : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
    className,
   )}
   {...props}
  />
 );
}
