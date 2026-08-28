import { authRouter } from "./router/auth";
import { chatRouter } from "./router/chat";
import { fightRouter } from "./router/fight";
import { postRouter } from "./router/post";
import { profileRouter } from "./router/profile";
import { swipeRouter } from "./router/swipe";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  profile: profileRouter,
  swipe: swipeRouter,
  fight: fightRouter,
  chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
