import { resolve } from "path";
import dotenv from "dotenv";
import { defineConfig } from "vitest/config";

dotenv.config({ path: resolve(__dirname, "../../.env") });

export default defineConfig({
  test: {
    environment: "node",
    // Allow tsconfig to be resolved via the package's tsconfig.json
    // which extends the workspace tsconfig.
  },
});
