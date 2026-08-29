"use client";

import type { ToasterProps } from "sonner";
import { Toaster as Sonner, toast } from "sonner";

import { useTheme } from "./theme";

export const Toaster = ({ ...props }: ToasterProps) => {
  const { themeMode } = useTheme();

  return (
    <Sonner
      theme={themeMode === "auto" ? "system" : themeMode}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--background)",
          "--success-text": "var(--foreground)",
          "--success-border": "var(--border)",
          "--error-bg": "var(--background)",
          "--error-text": "var(--destructive)",
          "--error-border": "var(--destructive)",
          "--warning-bg": "var(--background)",
          "--warning-text": "var(--foreground)",
          "--warning-border": "var(--border)",
          "--info-bg": "var(--background)",
          "--info-text": "var(--foreground)",
          "--info-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { toast };