import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  {
    // Test files: o tsconfig usa noUncheckedIndexedAccess, que exige `!` no acesso
    // por índice, conflitando com @typescript-eslint/no-non-null-assertion.
    // Além disso, o tRPC caller nos helpers retorna `any`, o que dispara no-unsafe-*.
    files: ["src/test/**/*.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/non-nullable-type-assertion-style": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },
);
