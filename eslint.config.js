// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

// This is the direct translation of your old .eslintrc.cjs rules
const eslintConfig = tseslint.config(
    // 1. Apply core recommended & next.js rules
    ...compat.extends("next/core-web-vitals"),
    // 2. Apply TypeScript recommended rules (type-checked)
    ...tseslint.configs.recommendedTypeChecked,
    // 3. Apply TypeScript stylistic rules (type-checked)
    ...tseslint.configs.stylisticTypeChecked,
    // 4. Your custom rule overrides
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/consistent-type-imports": [
                "warn",
                {
                    prefer: "type-imports",
                    fixStyle: "inline-type-imports",
                },
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksVoidReturn: {
                        attributes: false,
                    },
                },
            ],
        },
    }
);

export default eslintConfig;