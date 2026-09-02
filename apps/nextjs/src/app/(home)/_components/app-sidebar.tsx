import { getSession } from "~/auth/server";

import { SidebarNav } from "./sidebar-nav";

export async function AppSidebar() {
 const session = await getSession();

 if (!session) {
  return null;
 }

 return (
  <SidebarNav userName={session.user.name} userEmail={session.user.email} />
 );
}
