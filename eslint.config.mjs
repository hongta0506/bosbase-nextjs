import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const adminFiles = [
  "src/app/**/admin/**/*.{js,jsx,ts,tsx}",
  "src/lib/bosbase/admin.ts",
];

export default compat
  .extends("next/core-web-vitals")
  .map((config) => ({ ...config, files: adminFiles }));
