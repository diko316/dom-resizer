var PATH = require('path'),
    ROOT_PATH = PATH.resolve(__dirname),
    HTTP_PATH = PATH.join(ROOT_PATH, 'test'),
    express = require('express'),
    webpack = require("webpack"),
    webpackDevMiddleware = require("webpack-dev-middleware"),
    webpackHotMiddleware = require("webpack-hot-middleware"),
    app = express(),
    
    config = require("./webpack.config.js"),
    port = process.env.DEV_HOST_PORT;
    
var compiler;



compiler = webpack(config);



app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    //hot: true,
    //inline: true,
    //stats: {
    //    colors: true,
    //    timings: true
    //},
    //quiet: false,
    noInfo: true
}));

app.use(webpackHotMiddleware(compiler));

app.use(express.static(HTTP_PATH));


if (typeof port !== 'number' || !isFinite(port)) {
    port = 8000;
}

app.listen(port,
    function () {
        console.log('** Dev Server Running, listening to port ' + port + '.');
    });

//app.use(function (req, res, next) {
//        
//        if (req.url.substring(0, 4) === '/poc') {
//            next();
//            return;
//        }
//        
//        // use proxy
//        backendProxy.proxy.web(req, res, backendProxy.config);
//        
//    });
//
//
//
//app.listen(backendProxy.port,
//    function () {
//        console.log('** listening at port ', backendProxy.port);
//    });