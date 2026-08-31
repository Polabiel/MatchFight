import { useNavigate } from "@tanstack/react-router";

import { Button } from "@acme/ui/button";

import { authClient } from "~/auth/client";

export function AuthShowcase() {
   const { data: session } = authClient.useSession();
   const navigate = useNavigate();

   if (!session) {
     return (
       <Button
          size="lg"
          className="bg-primary text-primary-foreground border-primary hover:bg-foreground hover:border-foreground text-label-bold h-12 border-2 px-6"
          onClick={async () => {
           const res = await authClient.signIn.social({
             provider: "discord",
             callbackURL: "/",
           });
           if (!res.data?.url) {
             throw new Error("No URL returned from signInSocial");
           }
           await navigate({ href: res.data.url, replace: true });
         }}
       >
         Sign in with Discord
       </Button>
     );
   }

   return (
     <div className="flex flex-col items-center justify-center gap-4">
       <p className="text-center text-body-lg">
         <span>Logged in as {session.user.name}</span>
       </p>

       <Button
         size="lg"
         className="text-muted-foreground hover:bg-muted hover:text-foreground"
         onClick={async () => {
           await authClient.signOut();
           await navigate({ href: "/", replace: true });
         }}
       >
         Sign out
       </Button>
     </div>
   );
 }
