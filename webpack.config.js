const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlPlugin({
            template: 'src/index.html'
        })
    ]
};