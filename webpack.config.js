const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
    entry: './Generator/index.ts',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {from: './Generator/package.json', to: '../dist/package.json'},
                {from: './Generator/Generate.js', to: '../dist/Generate.js'},
                {from: './Generator/Upload.js', to: '../dist/Upload.js'},
                {from: './inputPuzzles.txt', to: '../dist/inputPuzzles.txt'}
            ]
        })
    ],
    module: {
        rules: [
            { 
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    },
    experiments: {
        outputModule: true
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: "commonjs"
        },
        filename: 'bundle.js',
        clean: true
    }
};

module.exports = () => {
    config.mode = 'production';
    return config;
};
