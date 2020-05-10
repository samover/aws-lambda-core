module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: "(/__tests__/.*)\\.spec\\.[jt]sx?$",
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/__tests__/tsconfig.json',
        },
    },
    modulePaths: [
        "<rootDir>/modules/"
    ],
    setupFiles: ['<rootDir>/jest.setup.js'],
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
    ]
};
