"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import { useSession } from "~/auth/hooks";
import { useTRPC } from "~/trpc/react";

export function ChatView({ fightId }: { fightId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useSuspenseQuery(
    trpc.chat.list.queryOptions({ fightId }),
  );

  const send = useMutation(
    trpc.chat.send.mutationOptions({
      onSuccess: async () => {
        setContent("");
        await queryClient.invalidateQueries(trpc.chat.pathFilter());
      },
      onError: (e) => toast.error(e.message || "Failed to send message"),
    }),
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    send.mutate({ fightId, content: trimmed });
  };

  // Placeholder for opponent name and status - TODO: fetch from trpc.fight
  const opponentName = "Opponent Name";
  const status = "Scheduled";

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-2xl flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/fights/${fightId}`}
          className="text-body-md text-muted-foreground hover:text-foreground"
        >
          ← Back to fight
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="text-headline-md">{opponentName}</h1>
          <span className="text-label-sm">{status.toUpperCase()}</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="border-border bg-background flex flex-1 flex-col gap-4 overflow-y-auto rounded-none border p-4"
      >
        {messages.length === 0 ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <div className="text-headline-lg">💬</div>
            <p className="text-headline-md text-foreground">No messages yet</p>
            <p className="text-body-md text-muted-foreground">
              Send the first message to coordinate your fight.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderId === session?.user.id;
            const isSystem = (msg as Record<string, unknown>).type === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="flex flex-col items-center">
                  <div className="bg-muted text-muted-foreground text-label-sm rounded-none px-4 py-2">
                    <p className="break-words whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`text-body-md max-w-[80%] rounded-none px-4 py-2 ${
                    mine
                      ? "bg-foreground text-background border-foreground border"
                      : "bg-background border-foreground text-foreground border-2"
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
                {!mine && (
                  <span className="text-label-sm text-muted-foreground mt-2 px-2">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          disabled={send.isPending}
          className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
        />
        <Button
          type="submit"
          disabled={send.isPending || !content.trim()}
          className="bg-primary text-primary-foreground border-primary hover:bg-foreground hover:border-foreground text-label-bold h-12 rounded-none border-2 px-6"
        >
          {send.isPending ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
