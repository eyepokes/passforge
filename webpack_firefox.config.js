const CopyWebpackPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');

module.exports = {
    resolve: {
        extensions: ['.ts', '.js'],
    },
    mode: 'production',
    entry: {
        bundle: './src/index.ts',
        background: './src/background.ts',
        content: './src/content.ts'
    },
    output: {
        path: path.resolve(__dirname, './build/firefox'),
        filename: '[name].js'
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                },
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, "style-loader", "css-loader"],
            }
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "src", to: ".",
                    globOptions: {
                        ignore: ['**/*.ts', '**/*.js', '**/*/style.css']
                    }
                },
                {
                    from: "src/background.js",
                    to: "./background.js"
                },
                {
                    from: 'src/manifest_firefox.json',
                    to: './manifest.json'
                },
            ],
        }),
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: ['./manifest_chrome.json', './manifest_firefox.json']
        })
    ],
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin()
        ],
    },
};