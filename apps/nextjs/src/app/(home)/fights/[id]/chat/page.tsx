import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ChatView } from "./_components/chat-view";

export default async function FightChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  prefetch(trpc.chat.list.queryOptions({ fightId: id }));

  return (
    <HydrateClient>
      <ChatView fightId={id} />
    </HydrateClient>
  );
}
