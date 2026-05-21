module.exports = {
   moduleFileExtensions: ['js', 'json', 'ts'],
   rootDir: '.',
   testEnvironment: 'node',
   testRegex: '(/test/.*|(\\.|/)(spec))\\.ts$',
   testPathIgnorePatterns: ['/dist/'],
   transform: {
      '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
   },
}
