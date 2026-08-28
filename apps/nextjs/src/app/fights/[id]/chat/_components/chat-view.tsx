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

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-2xl flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/fights/${fightId}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back to fight
        </Link>
        <h1 className="text-2xl font-bold">Fight Chat</h1>
        <span className="w-20" />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="border-border bg-card flex flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border p-4"
      >
        {messages.length === 0 ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <div className="text-4xl">💬</div>
            <p className="text-foreground font-semibold">No messages yet</p>
            <p className="text-sm">
              Send the first message to coordinate your fight.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderId === session?.user.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
                <span className="text-muted-foreground mt-1 px-1 text-xs">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
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
          className="flex-1"
        />
        <Button type="submit" disabled={send.isPending || !content.trim()}>
          {send.isPending ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
