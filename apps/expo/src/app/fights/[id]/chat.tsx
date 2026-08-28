import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/utils/api";
import { authClient } from "~/utils/auth";

export default function FightChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [content, setContent] = useState("");
  const listRef = useRef<FlatList>(null);

  const messagesQuery = useQuery(
    trpc.chat.list.queryOptions({ fightId: id }, { refetchInterval: 5000 }),
  );

  const send = useMutation(
    trpc.chat.send.mutationOptions({
      onSuccess: () => {
        setContent("");
        void queryClient.invalidateQueries(trpc.chat.pathFilter());
      },
    }),
  );

  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    if (messages.length > 0) {
      // Scroll to bottom on new messages
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    send.mutate({ fightId: id, content: trimmed });
  };

  return (
    <SafeAreaView className="bg-background flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Stack.Screen options={{ title: "Fight Chat" }} />
        <View className="bg-background h-full w-full p-4">
          <Link href={`/fights/${id}`} className="mb-2">
            <Text className="text-muted-foreground text-sm">
              ← Back to fight
            </Text>
          </Link>

          {messagesQuery.isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              className="border-border bg-card flex-1 rounded-2xl border"
              contentContainerStyle={{ padding: 12, gap: 8 }}
              data={messages}
              keyExtractor={(m) => m.id}
              ListEmptyComponent={
                <View className="items-center gap-2 py-12">
                  <Text className="text-4xl">💬</Text>
                  <Text className="font-semibold">No messages yet</Text>
                  <Text className="text-muted-foreground text-sm">
                    Send the first message to coordinate your fight.
                  </Text>
                </View>
              }
              renderItem={({
                item,
              }: {
                item: {
                  id: string;
                  senderId: string;
                  content: string;
                  createdAt: Date;
                };
              }) => {
                const mine = item.senderId === session?.user.id;
                return (
                  <View
                    className={`flex-col ${mine ? "items-end" : "items-start"}`}
                  >
                    <View
                      className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                        mine ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <Text
                        className={`${mine ? "text-primary-foreground" : "text-foreground"}`}
                      >
                        {item.content}
                      </Text>
                    </View>
                    <Text className="text-muted-foreground mt-1 px-1 text-xs">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                );
              }}
            />
          )}

          {/* Composer */}
          <View className="mt-3 flex-row gap-2">
            <TextInput
              className="border-input bg-background text-foreground flex-1 rounded-md border px-3 py-2"
              value={content}
              onChangeText={setContent}
              placeholder="Type a message..."
              maxLength={2000}
              multiline
            />
            <Pressable
              onPress={handleSend}
              disabled={send.isPending || !content.trim()}
              className="bg-primary items-center justify-center rounded-md px-4"
            >
              <Text className="text-primary-foreground font-semibold">
                {send.isPending ? "..." : "Send"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
