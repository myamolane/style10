const path = require('path');
const babel = require('@babel/core');
const loaderUtils = require('loader-utils');
const enhancedResolve = require('enhanced-resolve');
const Module = require('@linaria/babel-preset/lib/module').default;
const babelPlugin = require('../babel');
const virtualModules = require('./virtualModules.js');

async function style9Loader(input, inputSourceMap) {
  const {
    inlineLoader = '',
    outputCSS = true,
    parserOptions = {
      plugins: ['typescript', 'jsx']
    },
    ...options
  } = loaderUtils.getOptions(this) || {};

  const rules = [
    {
      // FIXME: if `rule` is not specified in a config, `@linaria/shaker` should be added as a dependency
      // eslint-disable-next-line import/no-extraneous-dependencies
      action: require('@linaria/shaker').default
    },
    {
      // The old `ignore` option is used as a default value for `ignore` rule.
      test: /[\\/]node_modules[\\/]/,
      action: 'ignore'
    }
  ];

  const resolveOptions = {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  };

  const resolveSync = enhancedResolve.create.sync(
    // this._compilation is a deprecated API
    // However there seems to be no other way to access webpack's resolver
    // There is this.resolve, but it's asynchronous
    // Another option is to read the webpack.config.js, but it won't work for programmatic usage
    // This API is used by many loaders/plugins, so hope we're safe for a while
    this._compilation && this._compilation.options.resolve
      ? {
          ...resolveOptions,
          alias: this._compilation.options.resolve.alias,
          modules: this._compilation.options.resolve.modules
        }
      : resolveOptions
  );

  const originalResolveFilename = Module._resolveFilename;

  Module._resolveFilename = (id, { filename }) => {
    // filename缺少src
    const context = path.dirname(filename);
    return resolveSync(context, id);
  };

  this.async();

  try {
    const filename = path.relative(process.cwd(), this.resourcePath);
    const { code, map, metadata } = await babel.transformAsync(input, {
      plugins: [
        [
          babelPlugin,
          {
            ...options,
            rules,
            displayName: false,
            evaluate: true
          }
        ]
      ],
      inputSourceMap: inputSourceMap || true,
      sourceFileName: this.resourcePath,
      filename,
      sourceMaps: true,
      parserOpts: parserOptions,
      babelrc: false
    });

    if (metadata.style9 === undefined) {
      this.callback(null, input, inputSourceMap);
    } else if (!outputCSS) {
      this.callback(null, code, map);
    } else {
      const cssPath = loaderUtils.interpolateName(
        this,
        '[path][name].[hash:base64:7].css',
        {
          content: metadata.style9
        }
      );

      virtualModules.writeModule(cssPath, metadata.style9);

      const postfix = `\nimport '${inlineLoader + cssPath}';`;
      this.callback(null, code + postfix, map);
    }
  } catch (error) {
    this.callback(error);
  } finally {
    Module._resolveFilename = originalResolveFilename;
  }
}

module.exports = style9Loader;
