module.exports = {
    preset: '@lwc/jest-preset',
    moduleNameMapper: {
        '^(todo)/(.+)$': '<rootDir>/src/$1/$2/$2'
    },
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/test/specs/'
    ]
};
