'use strict';

var PATH = require('path'),
    webpack = require("webpack"),
    buildDirectory = PATH.resolve(__dirname),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    sourcePath = PATH.join(buildDirectory, 'src'),
    
    entry = [PATH.join(sourcePath, 'index.js')],
    
    plugins = [
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin('styles.css')
    ];



switch (process.env.BUILD_MODE) {
case "production":
    plugins.push(new webpack.optimize.UglifyJsPlugin({
                    warnings: false
                }));
    break;

default:
    entry.push('webpack-hot-middleware/client?reload=true');
    plugins.splice(0, 0,
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin());
}


       
module.exports = {

    entry: entry,

    output: {
        path: PATH.join(buildDirectory, 'test', 'assets'),
        publicPath: '/assets/',
        filename: 'index.min.js'
    },

    devTool: 'eval',

    plugins: plugins,

    resolve: {
        modulesDirectories: [
            'bower_components',
            'node_modules'
        ]
    },

    module: {
        noParse: /\.min\.js/,
        loaders: [{
            test: /\.js$/,
            loader: "eslint-loader?{useEslintrc:false}",
            include: sourcePath,
            exclude: /node_modules|bower_components/
        },
        {
            test: /\.json$/,
            loader: 'json-loader'
        },
        {
            test: /all\.less$/,
            include: sourcePath,
            exclude: /node_modules|bower_components/,
            loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
        },
        {
            test: /\.(jpg|jpeg|gif|png)$/,
            include: sourcePath,
            loader:'url-loader?limit=1024&name=images/[name].[ext]'
            
        },
        {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract("style-loader", "css-loader?sourceMap")
        },
        {
            test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
            loader: "url-loader?limit=10000&mimetype=application/font-woff&name=fonts/[name].[ext]"
        },
        {
            test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
            loader: "url-loader?limit=10000&mimetype=application/font-woff&name=fonts/[name].[ext]"
        },
        {
            test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
            loader: "url-loader?limit=10000&mimetype=application/octet-stream&name=fonts/[name].[ext]"
        },
        {
            test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
            loader: "file-loader?limit=10000&name=fonts/[name].[ext]"
        },
        {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            loader: "url-loader?limit=10000&mimetype=image/svg+xml&name=fonts/[name].[ext]"
        },
        {
            test:   /\.html/,
            loader: 'html-loader'
        }]
    }

};


//console.log('used config');
//console.log(module.exports);
