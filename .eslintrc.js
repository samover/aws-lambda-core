module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'airbnb-typescript',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    settings: {
        "import/resolver": {
            "typescript": {
                "alwaysTryTypes": true,
            },
        },
    },
    rules: {
        "@typescript-eslint/ban-types": [ "error", {
            types: {
                Object: {
                    message: "Avoid using the `Object` type. Did you mean `object`?",
                    fixWith: 'object',
                },
                Boolean: {
                    message: "Avoid using the `Boolean` type. Did you mean `boolean`?",
                    fixWith: 'boolean',
                },
                Number: {
                    message: "Avoid using the `Number` type. Did you mean `number`?",
                    fixWith: "number"
                },
                String: {
                    message: "Avoid using the `String` type. Did you mean `string`?",
                    fixWith: "string",
                },
                Symbol: {
                    message: "Avoid using the `Symbol` type. Did you mean `symbol`?",
                    fixWith: "symbol",
                },
            },
        },
        ],
        "quotes": [2, "single", "avoid-escape"],
        "@typescript-eslint/indent": ["error", 4],
        "import/prefer-default-export": 0,
        "max-len": ["error", 120],
        "max-lines-per-function": ["error", { max: 20, skipComments: true, skipBlankLines: true }],
        "class-methods-use-this": "off",
        "no-underscore-dangle": "off",
        "prefer-destructuring": "off"
    }
};
