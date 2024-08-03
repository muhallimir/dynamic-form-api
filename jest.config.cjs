module.exports = {
    "testTimeout": 5000,
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json'],
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
};
