import { resolve } from "path";
import dotenv from "dotenv";
import { defineConfig } from "vitest/config";

dotenv.config({ path: resolve(__dirname, "../../.env") });

export default defineConfig({
  test: {
    environment: "node",
  },
});
