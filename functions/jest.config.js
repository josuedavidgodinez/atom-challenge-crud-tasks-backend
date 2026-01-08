module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.types.ts",
    "!src/index.ts",
    "!src/**/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  globals: {
    "ts-jest": {
      tsconfig: {
        isolatedModules: true,
      },
    },
  },
  // Configuración para tests de integración
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/tests/services/**/*.test.ts", "<rootDir>/tests/utils/**/*.test.ts"],
      preset: "ts-jest",
      testEnvironment: "node",
      collectCoverageFrom: [
        "src/services/**/*.ts",
        "src/utils/**/*.ts",
        "!src/**/*.types.ts",
      ],
      coverageThreshold: {
        global: {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
      preset: "ts-jest",
      testEnvironment: "node",
      setupFilesAfterEnv: ["<rootDir>/tests/integration/jest.setup.ts"],
      testTimeout: 30000,
      collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.types.ts",
        "!src/index.ts",
        "!src/**/index.ts",
      ],
      coverageThreshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  ],
};
