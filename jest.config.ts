import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 60000,
};
export default config;
