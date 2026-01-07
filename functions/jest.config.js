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
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
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
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
      preset: "ts-jest",
      testEnvironment: "node",
      setupFilesAfterEnv: ["<rootDir>/tests/integration/jest.setup.ts"],
      testTimeout: 30000, // 30 segundos para tests de integración
    },
  ],
};
