import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Warn when using 'any' type to encourage proper typing
      "@typescript-eslint/no-explicit-any": "warn",
      // Disable the rule that prevents using <img> instead of next/image
      // Note: This is disabled for external images and specific use cases
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
