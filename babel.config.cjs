module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                targets: {
                    node: "current"
                },
                modules: false,
                shippedProposals: true,
                bugfixes: true
            }
        ],
        [
            "@babel/preset-react",
            {
                runtime: "automatic"
            }
        ],
        [
            "@babel/preset-typescript",
            {
                allowDeclareFields: true,
                allowNamespaces: true,
                onlyRemoveTypeImports: true
            }
        ]
    ],
    env: {
        test: {
            presets: [
                [
                    "@babel/preset-env",
                    {
                        targets: {
                            node: "current"
                        },
                        modules: "commonjs", // This is correct for Jest
                        shippedProposals: true,
                        bugfixes: true
                    }
                ],
                [
                    "@babel/preset-react",
                    {
                        runtime: "automatic"
                    }
                ],
                [
                    "@babel/preset-typescript",
                    {
                        allowDeclareFields: true,
                        allowNamespaces: true,
                        onlyRemoveTypeImports: true,
                    }
                ]
            ],
            // Add plugins for better CommonJS compatibility
            plugins: [
                "@babel/plugin-transform-modules-commonjs"
            ]
        }
    }
};