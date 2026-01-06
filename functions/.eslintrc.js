module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // Relax JSDoc requirements
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    // Relax quotes and spacing
    "quotes": ["warn", "double"],
    "indent": "off",
    "max-len": "off",
    "operator-linebreak": "off",
    "comma-dangle": "off",
    // Relax import and typescript rules
    "import/no-unresolved": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-types": "off",
    "@typescript-eslint/no-unused-vars": "warn",
  },
};
