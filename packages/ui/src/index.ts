import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export * from "./button";
export * from "./logo";
export * from "./separator";
export * from "./sidebar";
