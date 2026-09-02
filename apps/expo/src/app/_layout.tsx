import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "~/utils/api";

import "../styles.css";

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "var(--color-foreground)",
          },
          headerTintColor: "var(--color-background)",
          headerTitleStyle: {
            color: "var(--color-background)",
          },
          contentStyle: {
            backgroundColor: "var(--color-background)",
          },
        }}
      />
      <StatusBar />
    </QueryClientProvider>
  );
}
