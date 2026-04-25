const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

// Configure Mix
mix
    .js('resources/js/app.js', 'public/js').react()
    .sass('resources/sass/app.scss', 'public/css', {
        sassOptions: {
            silenceDeprecations: ['legacy-js-api']
        }
    })
    .sourceMaps();

mix.webpackConfig({
    resolve: {
        extensions: ['.jsx', '.js', '.json', '*', '.wasm', '.mjs'],
    },
    optimization: {
        splitChunks: false,
        runtimeChunk: false,
    },
});

mix.override((webpackConfig) => {
    webpackConfig.plugins = (webpackConfig.plugins || []).filter((plugin) => {
        const name = plugin?.constructor?.name || '';
        return name !== 'WebpackBar';
    });
});

// Avoid node-notifier permission errors in restricted environments.
mix.disableNotifications();

// Production: version files
if (mix.inProduction()) {
    mix.version();
}
